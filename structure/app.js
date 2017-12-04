'use strict';

const koa = require('koa');
const gzip = require('koa-gzip'); //gzip压缩
const fs = require('fs');
const path = require('path');
const log4js = require('log4js');

log4js.configure({
    appenders: {
        siteLogs: { type: 'file', filename: 'logs/site.log' },
        console: { type: 'console' }
    },
    categories: {
        site: { appenders: ['console','siteLogs'], level: 'error' },
        default: { appenders: ['console'], level: 'trace' }
    }
});

global.elogger = log4js.getLogger('site');

const staticServer = require('koa-static');
const bodyParser = require('koa-bodyparser');

const cors = require('koa-cors');
const app = koa();

const anchorRouter = require('./routes/anchorRouter');
const loginMidWare = require('./middlewares/loginMidWare');


//
global.rpcClient = require('./service/rpc_client');
global.rpcServer = require('./service/rpc_server');

//处理静态资源文件夹
app.use(staticServer(path.join(__dirname, 'public'), { maxage: 1000 * 60 * 60 * 24 * 365 }));

app.use(function*(next) {
    console.log(this.request.query, this.request.url)

    if (this.request.url === '/') {

        this.body = 'XXX'
        return;
    }
    yield next;

})

app.use(bodyParser({
    formLimit: '10mb'
}));
app.use(gzip());
app.use(cors());

//++++++++++++++++++++中间件+++++++++++++++++++++++++

//判断是否登录
app.use(loginMidWare);

for (const i in anchorRouter) {
    app.use(anchorRouter[i]);
}

//++++++业务类+++++++


app.listen(process.env.PORT || 3999);
console.log('listening on port 3999');

module.exports = app;