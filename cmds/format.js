const helpers = require('../helpers.js');
const fs = require('fs');
const path = require('path');
const rxjs = require('rxjs');
const operators = require('rxjs/operators');

const keywords = [
    'AND',
    'ARRAY',
    'ASM',
    'BEGIN',
    'CASE',
    'CONST',
    'CONSTRUCTOR',
    'DESTRUCTOR',
    'DIV',
    'DO',
    'DOWNTO',
    'ELSE',
    'END',
    'EXPORTS',
    'FILE',
    'FOR',
    'FUNCTION',
    'GOTO',
    'IF',
    'IMPLEMENTATION',
    'IN',
    'INHERITED',
    'INLINE',
    'INTEGER',
    'INTERFACE',
    'LABEL',
    'LIBRARY',
    'MOD',
    'NIL',
    'NOT',
    'OBJECT',
    'OF',
    'OR',
    'PACKED',
    'PROCEDURE',
    'PROGRAM',
    'REAL',
    'RECORD',
    'REPEAT',
    'SET',
    'SHL',
    'SHR',
    'STRING',
    'THEN',
    'TO',
    'TYPE',
    'UNIT',
    'UNTIL',
    'USES',
    'VAR',
    'WHILE',
    'WITH',
    'XOR',
];

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
        let content = fs.readFileSync(file, { encoding: 'utf8' });

        content = keywords.reduce((content, keyword) => {
            const regex = new RegExp('\\b' + keyword + '\\b', 'gim');
            return content.replace(regex, keyword.toUpperCase());
        }, content);

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
