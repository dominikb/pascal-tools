const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const helpers = require('../helpers.js');

exports.command = 'zip';
exports.desc = 'Find .pas source files and zip it along with a top-level .pdf document.\n'
    + 'Name of pdf file must match the naming scheme "G<1,2,...>_Ue<01,02,...>_<LastName>_<FirstName>.pdf.\n'
    + 'Pascal source files are found recursively and zipped together under "source.zip"';
exports.builder = (yargs) => {
    yargs.option('path', {
        alias: 'p',
        describe: 'Path to directory containing .pdf file of the exercise.\nDefaults to the current working directory.',
        default: '.'
    });

    yargs.option('watch', {
        alias: 'w',
        type: 'boolean',
        description: 'Re-run the command every time a file change is detected.'
    });
};
exports.handler = async function (argv) {

    const userPath = path.resolve(argv.path);

    const workingDirectory = path.join(userPath, 'submit');
    const pdfNamingPattern = new RegExp(/^G\d_Ue\d\d_\w+_\w+\.pdf/, 'ui');
    const testInputNamingPattern = new RegExp(/input\.test\d+\.txt/, 'ui');

    // Create new directory to work with
    if(fs.existsSync(workingDirectory)) {
        childProcess.execSync(`rm -r ${workingDirectory}`)
    }
    fs.mkdirSync(workingDirectory, {recursive: true});

    const [,exerciseNumber] = workingDirectory.match(/uebung_(\d+)/, 'ui');
    const rawPdfName = `G1_XX_Zuname_Vorname`;

    // Generate LaTeX pdf
    console.log(helpers.dateLogShort() + ' Generating pdf from tex ...');
    childProcess.execSync(`pdflatex -synctex=1 -interaction=nonstopmode ${rawPdfName}.tex`)

    // Rename documentation
    fs.copyFileSync(
        path.join(userPath, `${rawPdfName}.pdf`),
        path.join(userPath, `G1_Ue${exerciseNumber.padStart(2, '0')}_Bauernfeind_Dominik.pdf`)
    )

    // Copy all required files to new working directory
    console.log(helpers.dateLogShort() + ' Copying source and test files to destination ...');
    const listOfSourceFiles = helpers.findPascalFiles([userPath]).map(file => {
        const sourceFilePath = path.join(workingDirectory, path.basename(file));

        fs.copyFileSync(file, sourceFilePath);

        return sourceFilePath;
    });

    // Copy test input files
    const listOfTestInputFiles = helpers.read(userPath)
        .filter(file => testInputNamingPattern.test(file))
        .map(file => {
            const fullFilePath = path.join(workingDirectory, path.basename(file));

            fs.copyFileSync(file, fullFilePath);

            return fullFilePath;
        });

    // Copy documentation
    const pdfDocument = helpers.readByLineEnding(userPath, 'pdf')
        .find(it => pdfNamingPattern.test(path.basename(it)));

    fs.copyFileSync(pdfDocument, path.join(workingDirectory, path.basename(pdfDocument)));

    const sourceZipPath = path.join(workingDirectory, 'source.zip');
    
    // Zip source files and then zip with pdf
    console.log(helpers.dateLogShort() + ' Zipping files ...');
    console.log(childProcess.execSync(
        `zip -j ${sourceZipPath} ${listOfSourceFiles.join(' ')} ${listOfTestInputFiles.join(' ')}`,
        {encoding: 'utf8'}
    ));

    const [fileBaseName, _] = path.basename(pdfDocument).split('.');
    const targetPath = path.join(workingDirectory, `${fileBaseName}.zip`);
    
    console.log(childProcess.execSync(
        `zip -j ${targetPath} ${pdfDocument} ${sourceZipPath}`,
        {encoding: 'utf8'}
    ));
    console.log(helpers.dateLogShort() + ' Done!');
};