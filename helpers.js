const fs = require('fs');
const path = require('path');

const read = (dir) =>
    fs.readdirSync(dir)
        .reduce((files, file) =>
                fs.statSync(path.join(dir, file)).isDirectory() ?
                    files.concat(read(path.join(dir, file))) :
                    files.concat(path.join(dir, file)),
            []);

const readByLineEnding = (dir, extension) => read(dir).filter(file => file.endsWith(extension));
const readPascalSource = dir => readByLineEnding(dir, '.pas');
const findPascalFiles = (pathList) => pathList.reduce((carry, pathItem) => {
    return carry.concat(readPascalSource(pathItem));
}, []);

const dateLog = () => new Date().toISOString();
const dateLogShort = () => dateLog().split('T')[1];

module.exports = {
    findPascalFiles,
    read,
    readByLineEnding,
    dateLog,
    dateLogShort
};