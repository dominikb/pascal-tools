const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const {dateLogShort} = require('../helpers.js');

let compileProcess, runProccess;

const compile = (file) => new Promise((resolve, reject) => {
    stopCompilation();

    compileProcess = childProcess.exec(`fpc ${file}`, (err, stdout, stderr) => {
        console.log(stdout);
        compileProcess = null;
    });

    compileProcess.on('exit', resolve);
    compileProcess.on('error', reject);
});

const run = (file) => new Promise((resolve, reject) => {
    stopExecution();

    const executionDirectory = path.dirname(file);

    console.log('\n' + dateLogShort() + '| Executing: ' + path.basename(file))
    console.log('--------------------------');
    runProccess = childProcess.spawn(file, {
        cwd: executionDirectory,
        stdio: 'inherit'
    });

    const reset = (action) => (...args) => {
        runProccess = null;
        console.log(args);
        action(...args);
    };

    runProccess.on('exit', (...args) => {
        console.log('Exit: ', args);
        runProccess = null;
        resolve(...args);
    });
    runProccess.on('error', reset(reject));
})

const stopCompilation = () => {
    if (compileProcess) {
        compileProcess.kill();
        compileProcess = null;
    }
}
const stopExecution = () => {
    if (runProccess) {
        runProccess.kill();
        runProccess = null;
    }
}

exports.command = 'auto-run <file>';
exports.desc = 'Compile & run the file.\nAutomatically restarts after finishing or changes to the source file.';
exports.builder = (yargs) => {
    yargs.positional('file', {
        describe: 'Pascal (.pas) file to watch, compile and execute.',
    });

};
exports.handler = async function (argv) {
    const filePath = path.resolve(argv.file);
    const compiledFilePath = path.join(
        path.dirname(filePath),
        path.basename(filePath, '.pas')
    );

    const compileAndRun = async () => {
        await compile(filePath);
        await run(compiledFilePath);

        console.log('---------------------\n');

        // Loop when finished
        compileAndRun();
    };

    // Initial Run
    compileAndRun();

    fs.watch(filePath, {}, (event, _filename) => {
        if (event == 'change') {
            compileAndRun();
        }
    });
};