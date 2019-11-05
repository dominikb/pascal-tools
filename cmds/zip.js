const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const helpers = require('../helpers.js');

exports.command = 'zip <path>';
exports.desc = 'Find .pas source files and zip it along with a top-level .pdf document.\n'
    + 'Name of pdf file must match the naming scheme "G<1,2,...>_Ue<01,02,...>_<LastName>_<FirstName>.pdf.\n'
    + 'Pascal source files are found recursively and zipped together under "source.zip"';
exports.builder = (yargs) => {
    yargs.positional('path', {
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

    // Create new directory to work with
    if(fs.existsSync(workingDirectory)) {
        childProcess.execSync(`rm -r ${workingDirectory}`)
    }
    fs.mkdirSync(workingDirectory, {recursive: true});

    // Copy all required files to new working directory
    const listOfSourceFiles = helpers.findPascalFiles([userPath]).map(file => {
        const sourceFilePath = path.join(workingDirectory, path.basename(file));

        fs.copyFileSync(file, sourceFilePath);

        return sourceFilePath;
    });

    // Copy documentation
    const pdfDocument = helpers.readByLineEnding(userPath, 'pdf')
        .find(it => pdfNamingPattern.test(path.basename(it)));

    fs.copyFileSync(pdfDocument, path.join(workingDirectory, path.basename(pdfDocument)));

    const sourceZipPath = path.join(workingDirectory, 'source.zip');
    
    // Zip source files and then zip with pdf
    console.log(childProcess.execSync(
        `zip -j ${sourceZipPath} ${listOfSourceFiles.join(' ')}`,
        {encoding: 'utf8'}
    ));

    const [fileBaseName, _] = path.basename(pdfDocument).split('.');
    const targetPath = path.join(workingDirectory, `${fileBaseName}.zip`);
    
    console.log(childProcess.execSync(
        `zip -j ${targetPath} ${pdfDocument} ${sourceZipPath}`,
        {encoding: 'utf8'}
    ));
};