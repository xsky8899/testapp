define([
    'zepto',
    'js/common/utils',
    'js/common/api',
    'js/common/constant',
    'js/common/app',
    'js/common/ui',
    'js/common/debug',
], function ($,
             Utils,
             Api,
             Constant,
             Native,
             UI,
             debug) {

    // 判断是否已经登录
    var C = {
        // 环境变量
        Env: Constant.Env,
        // API
        Api: Api,
        // 接口返回标示
        Flag: Constant.Flag,
        // 常量
        Constant: Constant,
        // 标题
        T: Constant.TITLE,
        // 工具类
        Utils: Utils,
        // Native接口
        Native: Native,
        // UI控件
        UI: UI,
        // 帐户
        Account: {
            isLogin: function () {
                return !!Utils.data(Constant.DataKey.USER_LOGIN_INFO);
            },
            logout: function () {
                $.each([
                    Constant.DataKey.USER_LOGIN_INFO
                ], function (i, item) {
                    Utils.data(item, null);
                })
            }
        },
        debug: debug
    };

    window.onerror = function (msg, url, line, column) {
        debug.error('msg:' + msg + '<br>url:' + url + ',line:' + line + ',line:' + line + ',column:' + column);
    };

    /* --------- 初始化XMLHttpRequest ------------ */
    var _ajax = $.ajax;
    $.ajax = function (options) {
        var settings = $.extend({}, options || {}),
            key;
        for (key in $.ajaxSettings)
            if (settings[key] === undefined) settings[key] = $.ajaxSettings[key];
        var doSuc = options.success = settings.success;
        options.success = settings.success = function (res) {
            res = typeof res == 'string' ? JSON.parse(res) : res;
            debug.log('当前url', settings.url);
            debug.log('返回数据', res);
            C.Native.__request__callback__handler(res) && doSuc(res);
        };
        // 本地访问
        if (C.Utils.App.IS_LOCAL) {
            options.type = 'get';
            return _ajax.apply(_ajax, arguments);
        }

        settings.beforeSend(settings.context, settings, settings);
        return C.Native.request(settings);
    };
    $.ajaxSettings.cache = false;
    // 超时 1分钟
    $.ajaxSettings.timeout = 120000;
    //拦截 做操作,可以在这里判断 是否登录超时等
    //return true代表可以继续向下操作
    //return false代表不会进行下一步操作
    C.Native.__request__callback__handler = function (res) {
        var _result = true;
        if (res && res.flag != Constant.Flag.SUCCESS) {
            _result = false;
            if (res.flag == Constant.Flag.FAIL || res.flag == Constant.Flag.LOGIN_TIMEOUT) {
                // 登录超时的时候跳转到登录页
                C.Account.logout();
                C.Native.dealTimeOut(res.msg);
            } else {
                // 集合内的flag值不提示
                var whiteFlag = [''];

                if (res.msg && ($.inArray(res.flag, whiteFlag) == -1)) {
                    C.Utils.App.IS_LOCAL ? C.debug.error(res.msg) : Native.tip(res.msg);
                }
            }
        }
        return _result;
    };
    /* --------- XMLHttpReques错误处理 ------------ */
    C.Native.__request__callback__error = function (error) {
        switch (error.code) {
            case '001':
                C.Native.tip("网络异常，请更换网络环境并重试");
                break;
            case '002':
                C.Native.tip("没有连接网络");
                break;
            case '003':
                C.Native.tip('网络超时');
                break;
            case '004':
                C.Native.tip('服务器发生异常');
                break;
            default:
                C.Native.tip('未知错误');
                break;
        }
        C.Native.loadingFinish();
    };
    return window.C = C;
})
