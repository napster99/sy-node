'use strict'

/**
 * Created by yuyou on 2017/3/2.
 */
//设置任务配置
const log4js = require('log4js');
log4js.configure({
    appenders: [
        {type: 'console'}, //控制台输出
        {
            type: 'file', //文件输出
            filename: 'logs/test.log',
            maxLogSize: '1024k',
            backups: 1
        },
    ],
    replaceConsole: true
});
global.log4js = log4js;
const logger = global.log4js.getLogger('app');
const FPC = require('fingerprint-container-node-sdk');
let host = '127.0.0.1';
let port = '9900';
if (process.env.APP_ENV === 'master') {
    host = '127.0.0.1'
} else if (process.env.APP_ENV === 'prerelease') {
    host = '127.0.0.1' //todo
}
let client = new FPC.Client(host, port, 'messagePipeCli');
const redisClient = require('./model/redis').redisInstance;
const utils = require('./lib/Utils');
const co = require('co');
const listen = require('./controller/listening');
const getFans = require('./controller/getFans');
const login = require('./ability/COMMON/login');
const follow = require('./ability/COMMON/follow');
global.logger = require('./lib/logger');
const abnormal = require('./services/abnormal');
const roomStatusCheck = require('./services/roomStatusCheck');
const TIMEOUT_MAX = 2147483647 / 1000;
const request = require('request');
global['DYListen'] = {};
global['QMListen'] = {};
let n = 0;
let taskPool = [];
let FLAG = true;
client.on('connect', function () {
    // connect成功后进行服务注册
    client.register();
});

// 注册成功回调
client.on('register', function () {
    logger.info('client register');
    //rpc client 置入全局;
    global.fpcClient = client;
    const server = new FPC.Server('127.0.0.1', '9900', 'messagePipeSvr');
    // 监听connect事件
    server.on('connect', function () {
        // connect成功后进行服务注册
        server.register();
    });
    // 注册成功回调
    server.on('register', function () {
        logger.info('register success');
        //获取重启前任务列表 0.5S/次
        co(function*() {
            let list = yield redisClient.getTaskList();
            for (let item of list) {
                const owid = item.split('SubTask:')[1];
                const platform = yield redisClient.getTaskInfo(owid);
                let timeout = yield redisClient.ttl(`STR:SubTask:${owid}`);
                if (timeout > TIMEOUT_MAX || timeout === -1) {
                    timeout = TIMEOUT_MAX;
                }
                listen(owid, timeout, platform, function (err) {
                    logger.info('err', err);
                });
                logger.info(`启动${owid}监听,时间${timeout},平台${platform}，剩余任务${list.length}`);
                yield utils.block(0.5);
            }
        }).catch((err) => {
            logger.info(err);
        });
    });

    //任务缓存
    server.addHandler('Event:OrderSvr.Task.Req', function (res) {
        co(function*() {
            taskPool.push(res);
            logger.info('接收标准任务', res.msg.body);
            client.eventRequest('Event:OrderSvr.Task.Res', {
                taskid: res.msg.body.taskid,
                code: 0,
                type: 'message'
            });
            if (FLAG) {
                yield taskDeal();
            }
        }).catch((err) => {
            FLAG = true;
            res.send({
                code: -1,
                words: err
            });
            logger.error(err);
        })
    });
    //用户登陆
    server.addHandler('MessagePipeSvr.UserLogin', function (res) {
        const ruid = res.msg.body.ruid;
        const platform = res.msg.body.platform;
        if (ruid && platform) {
            res.send({
                code: 0,
                words: 'success'
            })
        } else {
            res.send({
                code: -1,
                words: 'param is invalid'
            });
        }
        co(login(platform, ruid)).catch((err) => {
            logger.error('MessagePipeSvr.UserLogin Exception\r\n', err);
        }).catch((err) => {
            logger.info(err);
        })
    });
    //机器人异常账号处理;
    server.addHandler('Event:AbnormalUser.Manage', function (res) {
        logger.info('AbnormalUser.Manage', res.msg.body);
        const platform = res.msg.body.platform || 0;
        abnormal(platform);
        res.send({
            code: 0
        })
    });
    //定时检测监听房间开关播状态 5分钟一次
    setInterval(function () {
        roomStatusCheck();
    }, 5 * 60 * 1000);
    //用户关注
    server.addHandler('MessagePipeSvr.Follow', function (res) {
        const ruid = res.msg.body.ruid;
        const owid = res.msg.body.owid;
        const platform = res.msg.body.platform;
        if (ruid && owid && platform) {
            res.send({
                code: 0,
                words: 'success'
            })
        } else {
            res.send({
                code: -1,
                words: 'param is invalid'
            });
        }
        co(follow(platform, ruid, owid)).catch((err) => {
            logger.error('MessagePipeSvr.UserLogin Exception\r\n', err);
        }).catch((err) => {
            logger.info(err);
        })
    });
    //添加获取粉丝数
    server.addHandler('MessagePipeSvr.GetFansNum', function (res) {
        const owid = res.msg.body.owid;
        const platform = res.msg.body.platform;
        co(function*() {
            getFans(owid, platform);
        }).catch((err) => {
            res.send({
                code: -1,
                words: err
            });
            logger.info(err);
        })
    });

    server.addHandler('GeeTest.Login.Douyu', function (res) {
        const ruid = res.msg.body.ruid;
        const geeData = res.msg.body.geeData;

        /**
         * 获取登录后返回的url
         * @param form
         * @returns {Promise}
         */

        function getLogin(form) {
            const _this = this;
            return new Promise((resolve, reject) => {
                request({
                    url: 'https://passport.douyu.com/iframe/loginNew',
                    method: 'POST',
                    form: form
                }, function (err, req, body) {
                    if (err) {
                        return reject(err);
                    }

                    const data = JSON.parse(body);
                    if (data['error'] === 1) {
                        return reject(data['msg']);
                    }

                    return resolve('http:' + encodeURI(data['data']['url']));
                });
            });

        }

        /**
         * 获取session
         * @param url 登录后返回的url
         * @returns {Promise}
         */

        function getSession(url) {

            return new Promise((resolve, reject) => {

                let j = request.jar();
                request({
                    url: url,
                    method: 'GET',
                    jar: j
                }, function (err, req, body) {

                    const data = JSON.parse(body.slice(1, -1));
                    if (err) {
                        return reject(err);
                    } else if (data['error'] !== 0) {
                        return resolve({
                            error: data['error'],
                            data: data['msg']
                        });
                    }

                    // cookie 字符串
                    let cookie_string = j.getCookieString(url);
                    return resolve({
                        error: 0,
                        data: cookie_string
                    });
                });
            })
        }

        if (geeData.challenge && geeData.validate) {
            co(function*() {
                const userInfo = yield redisClient.getUserInfo(ruid);
                let form = {
                    login_type: 'nickname',
                    username: userInfo.username,
                    areaCode: '+86',
                    phoneNum: null,
                    password: utils.MD5(userInfo.pwd),
                    captcha_word: null,
                    geetest_challenge: geeData.challenge,
                    geetest_validate: geeData.validate,
                    geetest_seccode: geeData.validate + '|jordan',
                    client_id: 1,
                };
                let loginUrl = yield getLogin(form);
                logger.info('loginUrl', loginUrl);
                let cookie = yield getSession(loginUrl);
                logger.info('cookie', cookie);
                res.send({
                    code: 0,
                    data: {
                        cookie: cookie
                    }
                })
            }).catch((err) => {
                logger.info(err);
                res.send({
                    code: 2,
                    data: {
                        error: err
                    }
                })
            });

        } else {
            res.send({
                code: 1,
                data: {
                    error: 'param is invalid'
                }
            })
        }
    });
});
client.on('error', function (err) {
    logger.info('fpcClientError', err);

    // process.exit(1);
});
client.on('close', function (close) {
    logger.info('fpcClientClose', close);
    process.exit(1);
});
process.on('uncaughtException', (err) => {
    logger.warn(err);
    n++;
    if (n === 10) {
        process.exit(1);
    }
});
function* taskDeal() {
    for(let res of taskPool){
        const body = res.msg.body;
        FLAG = false;
        let owIdList = [];
        if (body.owid instanceof Array) {
            owIdList = body.owid;
        } else {
            owIdList = [body.owid];
        }
        // const taskId = body.taskid;
        //不加超时默认1天
        const deadline = body.deadline || (Date.now() / 1000 + 24 * 60 * 60).toFixed(0);
        let timeout = Math.floor((deadline * 1000 - new Date()) / 1000);
        if (timeout > TIMEOUT_MAX) {
            timeout = TIMEOUT_MAX;
        }
        if (timeout < 10) {
            FLAG = true;
            logger.info('超时时间过短',timeout);
        }
        logger.info('timeout', timeout);
        for (let owId of owIdList) {
            const platform = yield redisClient.getPlatform(owId);
            // const platform = 2;
            let TTL = yield redisClient.ttl(`STR:SubTask:${owId}`);
            //任务不存在 新增任务
            if (TTL === -2) {
                //添加任务进redis value=platform qm=2
                yield redisClient.add(`STR:SubTask:${owId}`, platform);
                //设置超时
                yield redisClient.expire(`STR:SubTask:${owId}`, timeout);
                listen(owId, timeout, platform, function (err) {
                    logger.info('err', err);
                });
            } else if (timeout - TTL > 0) {
                logger.info('更新监听任务持续时间',owId);
                //修改超时时间
                yield redisClient.expire(`STR:SubTask:${owId}`, timeout);
            } else {
                logger.info('监听任务已存在',owId);
            }
        }
    }
    FLAG = true;
}