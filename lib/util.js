'use strict'

const fs = require('fs')
const path = require('path')

/**
 * @description tools for util
 */
module.exports = {

    /**
     * @description list folders or files for src
     */
    listFile(src = './') {
        return new Promise((resolve, reject) => {
            fs.readdir(src, 'utf8', (err, data) => {
                if (!err) {
                    resolve(data)
                } else {
                    reject(err)
                }
            })
        })
    },

    /**
     * @description create a folder
     */
    createFolder(name) {
        return new Promise((resolve, reject) => {
            fs.mkdir(name, (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    },

    /**
     * @description deep copy
     * @param {*} name 
     * @param {*} dir 
     */
    async file2File(name, dir) {
        let self = this
        fs.readdirSync(dir).forEach(async(file) => {
            var pathname = path.join(dir, file)
            var newPathname = pathname

            let len = newPathname.indexOf('/') + 1
            let newArr = newPathname.split('')
            newArr.splice(0, len)
            let _dst = path.resolve(name, newArr.join(''))
            if (fs.statSync(pathname).isDirectory()) {
                fs.mkdirSync(_dst)
                console.log(String(`creating ${_dst}...`).help)
                await this.file2File(name, pathname)
            } else {
                console.log(String(`creating ${pathname}...`).help)
                fs.createReadStream(pathname).pipe(fs.createWriteStream(_dst))
            }
        })
    },

    /**
     * [readFile]
     * @param  {[type]} src [path of file]
     */
    readFile(src) {
        return new Promise((resolve, reject) => {
            let readable = fs.createReadStream(src, { encoding: 'utf8' })
            let content = null

            readable.on('open', function(fd) {
                // console.log('file was opened, fd - ', fd)
            })

            readable.on('readable', function() {
                // console.log('received readable')
            })

            readable.on('data', function(chunk) {
                // console.log('read %d bytes: %s', chunk.length, chunk)
                content = chunk
            })

            readable.on('end', function() {
                // console.log('read end', content)
                resolve(content)
            })

            readable.on('close', function() {
                // console.log('file was closed.')
            })

            readable.on('error', function(err) {
                // console.log('error occured: %s', err.message)
                reject(err)
            })
        })
    },

    /**
     * @description write content to a file
     * @param  {[type]} src     [pathname]
     * @param  {[type]} content [content]
     */
    writeFile(src, content) {
        return new Promise((resolve, reject) => {
            let writable = fs.createWriteStream(src, { encoding: 'utf8' })

            writable.on('finish', function() {
                // console.log('write finished')
                resolve()
            })

            writable.on('error', function(err) {
                // console.log('write error - %s', err.message)
                reject(err)
            })

            writable.write(JSON.stringify(content), 'utf8')
            writable.end()
        })
    },

    /**
     * [rename a file]
     * @param  {[type]} src     [pathname]
     * @param  {[type]} newName [new name]
     */
    renameFile(src, newSrc) {
        return new Promise((resolve, reject) => {
            fs.rename(src, newSrc, function(err) {
                if (err) {
                    reject(err)
                }
                resolve()
            })

        })
    }


}