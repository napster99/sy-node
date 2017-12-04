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
     * @param {*} callback 
     */
    file2File(name, dir, callback) {
        let self = this
        fs.readdirSync(dir).forEach(function (file) {
            var pathname = path.join(dir, file)
            var newPathname = pathname

            let len = newPathname.indexOf('/') + 1
            let newArr = newPathname.split('')
            newArr.splice(0, len)
            // fs.mkdirSync('xxxx/'+newArr.join(''))
            let _dst = path.resolve(name, newArr.join(''))
            if (fs.statSync(pathname).isDirectory()) {
                fs.mkdirSync(_dst)
                self.file2File(name, pathname, callback)
            } else {
                fs.createReadStream(pathname).pipe(fs.createWriteStream(_dst));
                callback(pathname)
            }
        });
    }

}