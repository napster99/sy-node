#!/usr/bin/env node


const pro = require('../lib/createPro')
const packages = require('../package.json')
const colors = require('colors')
const path = require('path')
const exec = require('child_process').exec

colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'red',
    info: 'green',
    data: 'blue',
    help: 'cyan',
    warn: 'yellow',
    debug: 'magenta',
    error: 'red'
})

function run(argv) {
    if (argv[0] === 'init') {
        if (argv[1]) {
            pro.init(argv[1])
            console.log(String(`create project : ${argv[1]} success!!!`).help)
        } else {
            console.log('Please enter a project name...'.error)
            console.log('For example: sy-node init myProjectName'.help)
        }
    } else if (argv[0] === '-v' || argv[0] === '--version') {
        console.log(String(packages.version).data)
    } else if (argv[0] === '-h' || argv[0] === '--help') {
        console.log(' Usage: sy-node | snode [cmd]\n '.help)
        console.log('\tCommands:'.help)
        console.log('\t\tinit               init a project'.help)
        console.log('\tOptions:'.help)
        console.log('\t\t-h, --help                           output usage information'.help)
        console.log('\t\t-v, --version                        output the version number'.help)
    } else if (argv[0] === 'start') {
        // console.log('start...')
        // let dirFile = path.resolve(process.cwd(), './app.js')
        // console.log('dirFile', dirFile)
        // exec(`node ${dirFile}`, (error, stdout, stderr) => {
        //     console.log('app.js output>>>')
        //     if (error !== null) {
        //         console.log(('exec error: ' + error).error)
        //     }else{
        //       console.log('app.js already started...')
        //     }
        // })
    } else {
        console.log('Unrecognized command line...'.error)
        console.log('Please enter -h or --help to show that commands to display support!'.help)
    }


}

run(process.argv.slice(2))