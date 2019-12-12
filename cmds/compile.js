const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const helpers = require('../helpers.js');
const rxjs = require('rxjs');
const operators = require('rxjs/operators');

exports.command = 'compile [paths..]';
exports.desc = 'Compile all files in the given paths recursively';
exports.builder = (yargs) => {
    yargs.positional('paths', {
        describe: 'List of paths that includes source files recursively.\nActions are applied to all files.\nDefaults to the current working directory.',
        default: '.',
        demand: false,
    });

    yargs.option('watch', {
        alias: 'w',
        type: 'boolean',
        description: 'Re-run the command every time a file change is detected.'
    });
};
exports.handler = async function (argv) {
    const compile = (file) => {
        try {
            const command = `fpc -Mtp -Criot -gl -gh ${file}`;
            const stdout = childProcess.execSync(command, {
                encoding: 'utf8',
                cwd: path.dirname(file),
            });
            console.log(new Date().toISOString());
            console.log('------------------------');
            console.log(stdout);
        } catch(e) {
            console.log(e.stdout);
        }
    };

    new rxjs.Observable(subscriber => {
        helpers.findPascalFiles(argv.paths)
            .forEach(async file => {
                subscriber.next([file]);

                const watcher = fs.watch(file, (_eventType, _fileName) => subscriber.next([file]));

                watcher.on('error', e => subscriber.error(e));
                watcher.on('close', () => subscriber.complete());
            })

            if (! argv.watch)
                subscriber.complete();
    })
    .pipe(
        operators.groupBy(([filePath]) => filePath),
        operators.mergeMap(group => group.pipe(
            operators.throttleTime(100)
        ))
    ).subscribe({
        next([filePath]) { compile(filePath) },
        error(err) { console.error(err) || process.exit(1) },
        complete() { console.log('Observable completed!') || process.exit(0); }
    });
};