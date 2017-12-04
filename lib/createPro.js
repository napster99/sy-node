'use strict'

const util = require('./util')


/**
 * @description: create a project
 */
class Pro {

  /**
   * @description a pure constructor
   * @param {*} props 
   */
  constructor(props) {

    this.state = {}

  }

  /**
   * @description init fn
   */
  async init(name) {
    try {
      console.log('init project name>', name)
      await util.createFolder(name)
      util.file2File(name, './structure', (x) => {
        console.log('x>',x)
      })
    } catch (err) {
      console.log('>>>>', String(err).error)
    }
  }

  /**
   * @description list a structure folders
   * @param {folderDir} File directory structure sample 
   */
  async getFoldersList(folderDir = './structure') {
    try {
      let result = await util.listFile(folderDir)
      return result
    } catch (err) {
      throw err
    }
  }


  /**
   * @description create a project
   * @param {project name} name
   */
  async createProject(name) {
    return new Promise((resolve, reject) => {
      fs.mkdir(name, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  // /**
  //  * @description create a folder
  //  * @param {file name} name
  //  * @param {file path} pwd
  //  */
  // createFolder(name, pwd) {
  //   fs.mkdir(`./${name}/public`)
  //   fs.mkdir(`./${name}/controller`)
  //   fs.mkdir(`./${name}/routes`)
  //   fs.mkdir(`./${name}/services`)
  //   fs.mkdir(`./${name}/tests`)
  //   fs.mkdir(`./${name}/middlewares`)
  //   fs.mkdir(`./${name}/models`)
  //   fs.mkdir(`./${name}/config`)
  //   fs.mkdir(`./${name}/bin`)
  // }

  // /**
  //  * @description create a file
  //  * @param {file name} name 
  //  * @param {file path} pwd 
  //  */
  // createFile(name, pwd) {
  //   fs.writeFile(`./${name}/README.md`)
  //   fs.writeFile(`./${name}/package.json`)
  //   fs.writeFile(`./${name}/${name}.json`)
  //   fs.writeFile(`./${name}/app.js`)
  // }

  // /**
  //  * @description copy a file 
  //  * @param {target file name} name 
  //  * @param {target file path} pwd 
  //  */
  // cpFile(name, pwd) {


  // }



}


module.exports = new Pro()