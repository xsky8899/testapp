define([], function () {
    // 环境 gulp打包会替换
    var Env = 'DEVELOPMENT';

    var DEBUG_MODE = true;

    if (Env == 'PRODUCTION') {
        // 是否有无debug
        DEBUG_MODE = false;
    }

    return {
        Flag: {
            // 操作成功
            SUCCESS: '1',
            // 操作失败
            FAIL: '2',
            // 登陆超时
            LOGIN_TIMEOUT: '4'
        },
        Env: Env,
        // 是否需要调试
        DEBUG_MODE: DEBUG_MODE,
        // 数据储存key值
        DK: {
            // 用户登录数据
            USER_LOGIN_INFO: 'USER_LOGIN_INFO'
        },
        // 页面标题设置
        TITLE: {
            INDEX: '测试app'
        },
        Module: {
            //不同业务的接口
            METHOD: {
                'back': 'BusinessJump',
                'forwardModule': 'BusinessJump',
                'setHeader': 'Header',
                'request': 'HttpPlugin',
                'loadingBegin': 'BusinessCommon',
                'loadingFinish': 'BusinessCommon',
                'tip': 'BusinessCommon',
                'getDeviceId': 'BusinessCommon',
                'getDeviceInfo': 'BusinessCommon',
                'log': 'BusinessCommon',
                'getPhoto': 'Photo',
                'call': 'Phone',
                'getVersionInfo': 'AppInfo',
                'getUserInfo': 'UserInfo',
                'selectDateTime': 'Picker',
                'saveData': 'BusinessCommon',
                'getData': 'BusinessCommon',
                'gotoLogin': 'BusinessCommon'
            }
        }
    };
});
