var mysql = require('mysql');
var co = require('co');

var mysqlSettings = {
    port: 3306,
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'XXXXXX',
    charset: 'UTF8MB4_GENERAL_CI'
}

if (process.env.APP_ENV == 'prerelease') {
    mysqlSettings = {
        port: 3306,
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'XXXX',
        charset: 'UTF8MB4_GENERAL_CI'
    }
}

if (process.env.APP_ENV == 'master' || process.argv[2] == 'master') { //线上
    mysqlSettings = {
        port: 3306,
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'XXXX',
        charset: 'UTF8MB4_GENERAL_CI'
    }
}

var mysqlInstance = null;

function handleDisconnect() {
    return mysql.createPool(mysqlSettings);
}

function Mysql() {

    var clientObj = handleDisconnect();

    this.getAnchorInfo = function (uid) {
        return new Promise((resolve, reject) => {
            var sql = 'select * from `order` where owid=' + uid + ' and status = 3';
            clientObj.query(sql, (err, rows, fields) => {
                if (!err) {
                    resolve(rows);
                } else {
                    resolve({
                        'type': 'error',
                        'msg': err
                    });
                }
            });
        });
    }

}

function generateModSql(tableName, args, typeString) {
    var sql = `update ${tableName} set `;
    if (tableName === 'order') {
        sql = ' update `order` set '
    }
    Object.keys(args).forEach((v) => {
        if (v != 'id') {
            if (typeString.indexOf(v) > -1) {
                if (args[v] || args[v] == '') {
                    sql += ` ${v}="${args[v]}", `
                }
            } else {
                if (v === 'status') {
                    sql += ` ${v}=${args[v]}, `
                } else {
                    if (args[v] || args[v] == '') {
                        sql += ` ${v}=${args[v]}, `
                    }
                }
            }
        }
    });
    sql += ` where id=${args['id']}`
    sql = sql.replace(/,\s+where/, ' where');
    return sql;
}

function SQLdate_now() {
    /* MySQL format */
    var d = new Date();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var hour = d.getHours();
    var minute = d.getMinutes();
    var second = d.getSeconds();
    var output = d.getFullYear() + '-' +
        (('' + month).length < 2 ? '0' : '') + month + '-' +
        (('' + day).length < 2 ? '0' : '') + day + ' ' +
        (('' + hour).length < 2 ? '0' : '') + hour + ':' +
        (('' + minute).length < 2 ? '0' : '') + minute + ':' +
        (('' + second).length < 2 ? '0' : '') + second;
    return (output);
};


mysqlInstance = new Mysql();

module.exports.mysqlInstance = mysqlInstance;