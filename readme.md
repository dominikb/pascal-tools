# Pascal Tools

CLI tools to help with automatic formatting, compiling and packaging pascal source files according to university needs.

## Get started

To use these tools, download the exectuable for your operating system.

The binary files can be found in the `./releases` folder.

## Examples

Format all `.pas` Pascal source files within the directory `my-task-1`:

````
# Mac
$ ./pascal-tools-macos format my-task-1

# Windows
$ pascal-tools-win.exe format my-task-1
````

For formatting on change, add the `--watch` or `-w` option.


````
# Mac
$ ./pascal-tools-macos format my-task-1 --watch

# Windows
$ pascal-tools-win.exe format my-task-1 -w
````

## Usage

To see available commands use `--help`.

````
pascal-tools/releases on  master [✘!?] 
➜ ./pascal-tools-macos --help
pascal-tools-macos <command>

Commands:
  pascal-tools-macos auto-run <file>    Compile & run the file.
                                        Automatically restarts after finishing
                                        or changes to the source file.
  pascal-tools-macos compile [paths..]  Compile all files in the given paths
                                        recursively
  pascal-tools-macos format [paths..]   Format all .pas source files according
                                        to style guidelines.
  pascal-tools-macos zip <path>         Find .pas source files and zip it along
                                        with a top-level .pdf document.
                                        Name of pdf file must match the naming
                                        scheme "G<1,2,...>_Ue<01,02,...>_<LastNa
                                        me>_<FirstName>.pdf.
                                        Pascal source files are found
                                        recursively and zipped together under
                                        "source.zip"

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]

````