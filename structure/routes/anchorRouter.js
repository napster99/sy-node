'use strict';

const router = require('koa-route');
const anchorController = require('../controller/anchor_controller').anchorInstance;

let getInfoRouter = router.get('/anchor/info', function* getInfoRouter() {
    let query = this.request.query;
    let uid = this.request._cuid;

    if (!uid) {
        return this.body = { 'code': 1, 'msg': '请上传uid' }
    }

    let result = yield anchorController.getInfoRouterFun(uid);

    if (result && result['backSuccess']) {
        this.body = { 'code': 0, 'count': result['count'], 'data': result['data'] };
    } else {
        this.body = { 'code': 1, 'msg': result['msg'] };
    }

});

module.exports = {
    getInfoRouter: getInfoRouter
};