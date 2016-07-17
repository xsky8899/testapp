define([
    'underscore',
    'js/common/utils',
    'js/common/constant',
    'js/common/debug'
], function (_,
             utils,
             constant,
             debug) {
    'use strict';
    var _appPro = function () {
        },
        _handlers = {},
        _callbacl_index = 0,
        _slice = Array.prototype.slice;

    _.extend(_appPro.prototype, utils.App, {
        __handlers__: _handlers,
        //统一处理出错点，外部可以覆盖
        __request__callback__error: function (error) {
        },
        //转换传递给native的参数
        /*
         *请注意！！！！！！！！！arg参数（字符串）安卓和IOS需要单独处理。
         *ios不需要加''号。
         *安卓需要加''号。
         */
        // 参数内容处理
        __params__: function (args) {
            if (!args instanceof Array) {
                return [];
            }
            var _this = this,
                _paramsArr = [],
                _handlers = _this.__handlers__,
                _fns = [];
            _.each(args, function (arg, index) {
                arg = arg || '';
                (typeof arg === 'function') && (arg = function () {
                    var _callback = ['callback', _callbacl_index++].join('_');
                    _handlers[_callback] = function (fn) {
                        return function (error) {
                            !error ? fn.apply(window, _slice.call(arguments, 1)) : _this.__request__callback__error.apply(window, arguments);
                        };
                    }(arg);
                    return _callback;
                }()) && (_fns.push(arg));
                (typeof arg === 'object') && (arg = JSON.stringify(arg));
                utils.App.IS_ANDROID && (arg = ['', arg.toString().replace(/\|/g, '||'), ''].join('"'));
                _paramsArr.push(arg);
            });
            return {args: _paramsArr, fns: _fns};
        },
        //native回调
        callback: function (method) {
            var _this = this,
                _args = _slice.call(arguments, 1),
                _handlers = _this.__handlers__;
            (method in _handlers) && typeof _handlers[method] === "function" && (_handlers[method].apply(window, _args));
        },
        //调用native方法，
        //businessName 模块名
        //method 方法名
        //如果为公用模块 businessName不用填
        __callNative__: function (method) {
            var _this = this,
                _args = _slice.call(arguments, 2),
                _params = _this.__params__(_args),
                businessName = constant.Module.METHOD[method];
            if (utils.App.IS_ANDROID) {
                method = businessName ? businessName + '.' + method : method;
                prompt(['call://', method, '(', _params.args.join('|'), ')'].join(''));
            }
            if (utils.App.IS_IOS) {
                var businessClass = window[businessName];
                businessClass && businessClass[method] ? businessClass[method].apply(businessClass, _params.args) :
                    (window.YDIOS && typeof window.YDIOS[method] === 'function' && window.YDIOS[method].apply(window.YDIOS, _params.args));
            }
            console.log(_params)
        },
        //只请求公共方法
        callNative: function (method) {
            var _this = this,
                _args = _slice.call(arguments, 1);

            _args.unshift(null);
            _args.unshift(method);
            return _this.__callNative__.apply(_this, _args);
        }

    });

    window.$$ = window.$$ || {
            EventListener: {
                /**
                 * 返回（点击返回按钮或Android物理返回键）
                 * @param url
                 */
                onBack: function (url, data) {
                },
                /**
                 * 返回 (客户端登录状态发生变化后)
                 */
                onRefresh: function () {
                },
                //页面重新出现调用，包括native的返回
                pageDidAppear: function () {
                },
                //页面离开时调用
                pageDidDisappear: function () {
                }
            }
        };
    var _app = window.$$.platformAdapter = new _appPro;
    window.__callback = _app.callback;
    _.extend(_app, {
        /**
         * 发送HTTP请求
         * @import jQuery|Zepto
         * @param options 对象{type:'get',data:{},successCallBack:function(res){},failCallBack:function(res){}}
         * @param .data JSON对象 请求入参
         * @param .type 字符串 请求方式，默认get
         * @param .success 函数 function(){} 请求成功处理
         * @param .error  函数 function(){} 请求失败处理
         */
        request: function (options) {
            var data = options.data || {},
                param = [],
                type = options.type || 'get';

            if (/^POST|post$/.test(type)) {
                type = utils.App.IS_IOS ? 'post' : 'POST';
            }
            if (/^GET|get$/.test(type)) {
                type = utils.App.IS_IOS ? 'get' : 'GET';
            }

            if (data && typeof data == 'object') {
                for (var key in data) {
                    try {
                        param.push(key + '=' + encodeURIComponent(decodeURIComponent(data[key])));
                    } catch (e) {
                        param.push(key + '=' + encodeURIComponent(data[key]));
                    }
                }

                data = param.join('&');
            }
            return _app.callNative('request', options.url, type, options.headers || ' ', data, options.success, options.error);

        },

        __params__url__: function (data, url) {
            if (data) {
                data = $.param(data);
                if (url.indexOf('?') > -1) {
                    url += '&' + data;
                } else {
                    url += '?' + data;
                }
            }

            /*
             *过滤param
             */
            if (url && url.indexOf('?') > -1) {
                var param = [],
                    urlHost = url.split('?')[0],
                    urlData = utils.getQueryMap(url);
                for (var key in urlData) {
                    var tmp = '';
                    try {
                        tmp = decodeURIComponent(urlData[key]);
                    } catch (e) {
                        tmp = urlData[key];
                    }
                    param.push(key + '=' + encodeURIComponent(tmp));
                }
                url = urlHost + '?' + param.join('&');
            }

            url = url.replace(/(%2F)/ig, '/');
            return url;
        },
        /**
         * 当前webView 打开新页面
         * @param options 对象 {title:'',url:''}
         * .url 字符串 跳转的链接
         * .defaultCallback 函数 function(){} 请求处理
         * 跳转参数
         */
        forwardInside: function (options) {
            options = options || {data: {}};
            this.loadPage(options);
        },
        /**
         * WebView跳转（本地页面、服务端页面、及模块）
         * @param options 对象 {title:'',url:''}
         * .url 字符串 跳转的链接
         * .defaultCallback 函数 function(){} 请求处理
         * 跳转参数
         */
        forward: function (options) {
            options = options || {data: {}};
            var _this = this,
                _data = $.extend({}, utils.getQueryMap(), options.data),
                _url = _this.__params__url__(_data, options.url);

            // PC的跳转方式
            if (utils.App.IS_LOCAL) {
                location.href = _url;
                return;
            }
            window.$$.EventListener.onBack = function (url, data) {
                try {
                    data = typeof data === 'string' ? JSON.parse(data) : data;
                } catch (e) {
                }
                data && options.callBack && typeof options.callBack === 'function' && options.callBack(data);
            };

            _app.callNative('forward', _url, options.callBack || ' ');
        },
        /**
         * WebView带模块名跳转
         */
        forwardModule: function (options) {
            options = options || {data: {}};
            var _this = this,
                _data = $.extend({}, utils.getQueryMap(), options.data),
                _url = _this.__params__url__(_data, options.url),
                _moduleName = options.moduleName;

            // PC的跳转方式
            if (utils.App.IS_LOCAL) {
                location.href = _url;
                return;
            }
            window.$$.EventListener.onBack = function (url, data) {
                try {
                    data = typeof data === 'string' ? JSON.parse(data) : data;
                } catch (e) {
                }
                data && options.callBack && typeof options.callBack === 'function' && options.callBack(data);
            };
            _app.callNative('forwardModule', _moduleName, _url, options.callBack || ' ');
        },
        /**
         * 在当前activity加载页面
         * */
        loadPage: function (options) {
            options = options || {data: {}};
            var _this = this,
                _data = $.extend({}, utils.getQueryMap(), options.data),
                _url = _this.__params__url__(_data, options.url);
            ;

            // PC的跳转方式
            if (utils.App.IS_LOCAL) {
                location.href = _url;
                return;
            }
            _app.callNative('loadPage', _url, options.callBack || ' ');
        },
        /**
         * WebView返回
         * @param options {url:''}
         * .url back返回的url,为空默认返回上一个页面,
         * .data 返回后Native调用C.Service.onback()事件, 并将参数data传递给onback方法
         *                如果返回到流程开始的的页面,需要传页面名字,如'info_loan.html'
         * .defaultCallback 函数 function(){} 请求处理
         */
        back: function (options) {
            options = options || {};
            var _this = this,
                _url = options.url || '',
                _data = options.data || '';
            // PC的跳转方式
            if (utils.App.IS_LOCAL && _url) {
                location.href = _url;
                return;
            }
            _app.callNative('back', _url, _data, options.callBack || ' ');
        },
        /**
         * 设置头部信息
         * @param options {title:'标题',isBack:true,leftCallback:function(){},isClose:true,closeCallback:function(){}}
         * .title 字符串 设置头部标题
         * .isBack 布尔值 是否有返回图标
         * .leftCallback function(){} 函数 设置左边回调
         * .rightText 布尔值 是否有关闭图标
         * .rightIcon  function(){} 函数 设置右边回调
         * .rightCallback function(){} 函数 设置右边回调
         * .data 扩展数据 Json格式  如：isFullScreen(是否全屏)
         */
        setHeader: function (options) {
            options = options || {};
            options.isBack = typeof options.isBack === 'undefined' ? true : options.isBack;
            var title = options.title || '',
                leftCallback = options.leftCallback || '',
                rightText = options.rightText || '',
                rightIcon = options.rightIcon || '',
                rightCallback = options.rightCallback || ' ',
                data = options.data || {};
            _app.callNative('setHeader', title, !!options.isBack, leftCallback, rightText, rightIcon, rightCallback, data);
        },
        /**
         * 显示加载动画 C.UI.loading();
         * options.msg 当不允许取消加载动画时 提示信息
         */
        loadingBegin: function (options) {
            options = options || {};
            _app.callNative('loadingBegin', options.msg || '');
        },
        /**
         * 关闭加载动画 C.UI.stopLoading();
         */
        loadingFinish: function () {
            _app.callNative('loadingFinish');
        },
        /**
         * 提示
         * .text 字符串 C.Native.tip('提示内容');
         */
        tip: function (text) {
            debug.log(text);
            _app.callNative('tip', text || '');
        },
        /**
         * 选择地区
         * @param callback 对过callback的data将地区信息通过data传递给H5，
         * data格式{'province':'广东省','city':'深圳市','zone':'八卦岭'}
         */
        selectAddressInfo: function (callBack) {
            _app.callNative('selectAddressInfo', callBack || ' ');
        },
        /**
         * 显示日期选择控件
         * @param title 选泽日期的标题，默认为“选择日期”
         * @param showYear 是否显示年份  Y|N
         * @param showMonth 是否显示月  Y|N
         * @param showDay 是否显示日期  Y|N
         * @param pos 弹框的显示位置，bottom｜center｜top
         * @param callback js回调
         * {
         *    'year':'2015',//根据Y｜N来判断是否返回该值
         *    'month':'2',
         *    'day':'28'
         * }
         */
        showDatePikerDialog: function (options) {
            options = options || {};
            _app.callNative('showDatePikerDialog', options.title || '选择日期', options.showYear || 'Y', options.showMonth || 'Y', options.showDay || 'Y', options.pos || 'bottom', options.callBack || ' ');
        },
        /**
         * 获取当前用户的登录信息
         * 返回当前用户的登录信息，以json形式返回
         *
         {
         'custName': 'dapeng',
         'account': 'abcd',
         'msgCnt': '12',
         'token': 'ad3bjlaoe00jbmbm',
         'custId': '399444',
         'mobile': '1312929400',
         'city': '',
         'cityName': '深圳',
         'sysDate': '',
         'ad': user.getAd,
         'paPayToken':'ad3bjlaoe00jbmbm',
         'platform': 'android',
         'accountId':'',
         'mark': 'BN'
         'Id': '',
         'pointsSwitch': '',
         'isOrangebankCust': '',
         'InvitationCode': '',
         'isNew': '',
         'machineId': ''
         }
         */
        getUserInfo: function (callback) {
            _app.callNative('getUserInfo', callback || ' ');
        },

        /**
         * 设置用户的当前信息，注意，会将传递的值覆盖现有值。
         * @param userInfo 需要设置的用户信息（可以只提供需要设置的信息如｛'acountId','abcd'｝）
         * @param callback 设置成功返回1，失败返回0
         */
        setUserInfo: function (userInfo) {
            _app.callNative('setUserInfo', userInfo || {});
        },
        /**
         * 登录超时接口。在弹出的dialog中点击确定后，跳转到登录页面登录
         * @param msg 弹出登录超时提示框中显示的信息。默认显示“登录超时，请重新登录”
         */
        dealTimeOut: function (msg) {
            if (utils.App.IS_LOCAL) {
                alert(msg);
                return;
            }
            _app.callNative('dealTimeOut', msg || '');
        },
        /**
         * 客户端判断用户是否登录接口
         * @param callback
         * @return Object {flag:1}--已登录，{flag:0}--未登录
         */
        isLogined: function (callback) {
            _app.callNative('isLogined', callback || ' ');
        },
        login: function (data, callback) {
            _app.callNative('login', data || {}, callback || ' ');
        },
        /**
         * 跳转到某个Native界面
         * page: 界面名称
         * data: 传递数据
         */
        gotoNative: function (page, data, callback) {
            _app.callNative('gotoNative', page || '', data || '', callback || ' ');
        },
        /**
         * 补充身份信息
         * */
        addUserInfo: function (callback) {
            _app.callNative('addUserInfo', callback || ' ');
        },
        /**
         * 获取设备信息
         * */
        getDeviceInfo: function (callback) {
            _app.callNative('getBindCardParams', callback || ' ')
        },
        /**获取当前所在的城市名{'cityName':'深圳市'}*/
        getCityName: function (callback) {
            _app.callNative('getCityName', callback || ' ');
        },
        /**
         * 获取通讯录
         * */
        getContactList: function (limitNum, callback) {
            _app.callNative('getContactList', limitNum, callback || ' ');
        },
        /**
         * Android获取通话记录
         * */
        getContactRecord: function (callback) {
            _app.callNative('getContactRecord', callback || ' ');
        },
        /**
         * 语音输入
         */
        speechInput: function (speakTitle, callback) {
            _app.callNative('speechInput', speakTitle || '', callback || ' ');
        },
        /**
         * 调用拍照
         */
        upLoadPhoto: function (imgDec, imgCode, num, applNo, callback) {
            _app.callNative('upLoadPhoto', imgDec || '', imgCode || 0, num || 0, applNo || '', callback || ' ');
        },
        /**
         *电子签名
         */
        esign: function (opts, callback) {
            _app.callNative('eSignature', opts.barCode || '', opts.enText || '', callback || ' ');
        },
        /**
         * @return {'version':'311','versionName':'3.1.1'}
         */
        getAppVersion: function (callback) {
            _app.callNative('getAppVersion', callback || ' ');
        }
    });
    console.log(_app);
    return window._app = _app;
});