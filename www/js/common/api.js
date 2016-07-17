define([
    'js/common/constant'
], function (Constant) {
    'use strict';
    var prefix = 'data/';

    switch (Constant.Env) {
        case 'DEVELOPMENT' :
            prefix = 'http://test1-cfs-phone-web.pingan.com.cn/cfsssfront/';
            break;
        case 'TEST':
            prefix = '';
            break;
        default:
            prefix = '';
    }

    var api = Constant.Env == 'DEVELOPMENT' ? {
        // 本地开发环境模拟JSON
        LOGIN: 'eloan/processEloanRepaymentWay.do'
    } : {
        LOGIN: 'login/doLogin'
    };

    return function (name) {
        return prefix + api[name];
    }
});
