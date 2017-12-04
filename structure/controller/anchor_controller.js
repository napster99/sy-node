'use strict';

const co = require('co');
const request = require('request');
const BaseController = require('./BaseController');
const mysqlInstance = require('../models/mysql').mysqlInstance;
const redisInstance = require('../models/redis').redisInstance;


class AnchorController extends BaseController {
    constructor(props) {
        super(props);
    }

    getInfoRouterFun(uid) {
        return co(function* () {
            let result = yield mysqlInstance.getAnchorInfo(uid);

            if (result && result['type'] === 'error') {
                return {
                    backSuccess: false,
                    msg: 'anchor-000 ' + result['msg']
                }
            }

            return {
                backSuccess: true,
                data: result
            }

        });
    }
}


module.exports.anchorInstance = new AnchorController();