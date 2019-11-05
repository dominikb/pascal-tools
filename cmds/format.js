const helpers = require('../helpers.js');
const fs = require('fs');
const path = require('path');
const rxjs = require('rxjs');
const operators = require('rxjs/operators');
const childProcess = require('child_process');
const ptopConfig = require('./../ptop-config.js');

exports.command = 'format [paths..]';
exports.desc = 'Format all .pas source files according to style guidelines.';
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
exports.handler = function (argv) {
    const format = (file) => {
        fs.writeFileSync('.ptop.config', ptopConfig);
        childProcess.execSync(`ptop -i 2 -c .ptop.config ${file} ${file}`);
        fs.unlinkSync('.ptop.config');

        let content = fs.readFileSync(file, { encoding: 'utf8' });

        // Remove multiple newlines with indentations
        content = content.replace(/\n(?:\s*\n){2,}( +)/g, '\n\n$1');

        // Remove multiple newlines
        content = content.replace(/\n{3,}/g, '\n\n');

        // Same indentation level for comments
        content = content.replace(/(?: )*\(\*([\s\w.:!?"'\-=><]*)(\n\s+)\*\)/, '$2(*$1$2*)');

        // Put FORWARD on declaration line of PROCEDURE and FUNCTION
        content = content.replace(/\nFORWARD;/g, ' FORWARD;');

        fs.writeFileSync(file, content);
    };

    const doFormat = filePath => {
        format(filePath);
        console.log(new Date().toISOString().split('T')[1] + ` ${path.basename(filePath)}`);
    }

    new rxjs.Observable(subscriber => {
        helpers.findPascalFiles(argv.paths)
            .forEach(file => {
                // Initial format
                subscriber.next([file]);

                const watcher = fs.watch(file, (_eventType, _fileName) => subscriber.next([file]));

                watcher.on('error', e => subscriber.error(e));
                watcher.on('close', () => subscriber.complete());
            })

        // If we are not watching, simply complete the observable immediately
        if (!argv.watch)
            subscriber.complete();
    })
    .pipe(
        operators.groupBy(([filePath]) => filePath),
        operators.mergeMap(group => group.pipe(
            operators.throttleTime(100)
        ))
    ).subscribe({
        next([filePath]) { doFormat(filePath) },
        error(err) { console.error(err) || process.exit(1) },
        complete() { console.log('Formatting done!') || process.exit(0); }
    });
};
