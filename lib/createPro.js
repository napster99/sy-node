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

      await util.createFolder(name)
      await util.file2File(name, './structure')
      //replace package.json's name with project name
      setTimeout(async () => {
        let content = JSON.parse(await util.readFile(`./${name}/package.json`))
        content.name = name
        await util.writeFile(`./${name}/package.json`, content)
        //replace xxx.json pm2  file
        await util.renameFile(`./${name}/xxx.json`, `./${name}/${name}.json`)
        //replace xxx.json's name with project name
        let content2 = JSON.parse(await util.readFile(`./${name}/${name}.json`))
        content2[0].name = name
        await util.writeFile(`./${name}/${name}.json`, content2)

        console.log(String(`\n${name} project is created success...`).help)
      }, 500)
      
    } catch (err) {
      console.log(String(`${name} project is failed becase of ${err}`).error)
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