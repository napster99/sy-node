'use strict'


const fs = require('fs')
const path = require('path')


function readIt() {
  fs.readdir('./structure',  'utf8', (err, data) => {
    console.log('data>>>', data)
  })
}

function readIt2() {
  let files = fs.readdirSync('./structure')
  console.log('data>>>', files)
}

function readFile() {
  fs.readFile('./structure/app.js', 'utf8', (err, data) => {
    console.log('data>>>', data)
  })
}


function readFile2() {
  let content = fs.readFileSync('./structure/app.js')
  console.log('content>>', content.toString())
}

// stats.isFile()
// stats.isDirectory()
function fileStat() {
  fs.stat('./structure/public', (err, stats) => {
    console.log('stats>>>', stats.isDirectory())
    console.log('stats>>>', stats.isFile())
  })
}

function fileStat2(fd) {
  let stats = fs.fstatSync(fd)
  console.log('stats>>>', stats)
}

function fileWrite() {
  fs.writeFile('./a.js', 'console.log(1111);', (err) => {
    console.log('err>>>', err)
  })
}

function file2File(src = './a.js', dest = './b.js') {
  fs.createReadStream(src).pipe(fs.createWriteStream(dest));
}

// readIt()
// readIt2()
// readFile()
// readFile2()
// fileStat()
// fileStat2()
// fileWrite()
// file2File()

