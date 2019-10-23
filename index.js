const path = require('path');

const argv = require('yargs')
    .middleware(argv => ({
        paths: (argv.paths || []).map(p => path.resolve(p))
    }))
    .commandDir('cmds')
    .demandCommand()
    .help()
    .argv;
