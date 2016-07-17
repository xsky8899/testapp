define([], function() {
    var ua = navigator.userAgent.toUpperCase();
    var Utils = {
        App: {
            //是否是安卓平台
            IS_ANDROID: ua.indexOf('ANDROID') != -1,
            //是否为ios平台
            IS_IOS: ua.indexOf('IPHONE OS') != -1,
            //是否为wp平台
            IS_WP: ua.indexOf('WINDOWS') != -1 && ua.indexOf('PHONE') != -1,
            // pc浏览器
            IS_LOCAL: (window.location.hostname == "localhost")
        },
        RegexMap : {
            // 制表符
            table: /\t/g,
            // 换行符
            line: /\n/g,
            // 身份证
            idCard:  /^\d{15}$|^\d{18}$|^\d{17}(\d|X|x)$/,
            // 手机号码
            MobileNo: /^1[34578]\d{9}$/
        },
        /**
         * 日志打印方法
         * @param text 需要打印的日志内容
         */
        logs: function(text) {
            window.console && console.log && console.log(text);
        },
        /**
         * H5的localStorage本地数据操作
         * @param key
         * @param value
         */
        data: function(key, value) {
          var getItemValue = function () {
              var data = localStorage.getItem(key);
              try {
                  data = JSON.parse(data);
              } catch (e) {
                  Utils.logs(e);
              }
              return data;
          };
          if (key && value === undefined) {
              return getItemValue();
          }
          switch (toString.call(value)) {
              case '[object Undefined]':
                  return getItemValue();
              case '[object Null]':
                  localStorage.removeItem(key);
                  break;
              default :
                  localStorage.setItem(key, JSON.stringify(value));
                  break;
          }
        },
        /**
         * 公共方法定义
         * @example: http://xxx.com/a.do?productCode=P001
         * @Result:  C.getParameter('productCode')  // 'P001'
         */
        getParameter : function (param) {
            var reg = new RegExp('[&,?,&amp;]' + param + '=([^\\&]*)', 'i');
            // url获取中文无需再编码
            var value = reg.exec(decodeURIComponent(decodeURIComponent(location.search)));
            return value ? value[1] : '';
        },
        /**
         * 获取URL参数对象
         * @param url 当无值代表当前页面
         * @example: http://xxx.com/a.do?productCode=P001
         * @returns {{productCode:'P001'}}
         */
        getQueryMap: function (url) {
          var reg_url = /^[^\?]+\?([\w\W]+)$/,
              reg_para = /([^&=]+)=([\w\W]*?)(&|$|#)/g,
              arr_url = reg_url.exec(url || location.href),
              ret = {};
          if (arr_url && arr_url[1]) {
              var str_para = arr_url[1], result;
              while ((result = reg_para.exec(str_para)) != null) {
                  ret[result[1]] = result[2];
              }
          }
          return ret;
        },
        /** 转换日期格式
         * 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
         * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
         * @param date : 日期格式|String类型 (如：'2012-12-12' | '2012年12月12日' | new Date())
         * @param format : String类型 （如: 'yyyy年MM月dd日'或'yyyy年MM月dd日 hh时mm分ss秒',默认'yyyy-MM-dd'）
         * @example C.Utils.parseDateFormat(new Date(), 'yyyy年MM月dd日') 输出：'2014年04月29日'
         * @example C.Utils.parseDateFormat(new Date()) 输出：'2014-04-29'
         * @exmaple C.Utils.parseDateFormat('2014-05-07 16:09:47','yyyy年MM月dd日 hh时mm分ss秒')
         *          输出：'2014年05月07日 16时09分47秒'
         * @exmaple C.Utils.parseDateFormat('2014-05-07 16:09:47',"yyyy-MM-dd hh:mm:ss.S")
         *          输出：'2014-05-07 16:09:47.0'
         **/
        parseDateFormat:function (str, fmt) {
            if(!str)return str;
            if(!isNaN(str) && String(str).length == 8){
                str = (str+'').replace(/^(\d{4})(\d{2})(\d{2})$/,'$1/$2/$3');
            }
            var date = typeof str == 'string'?new Date(str):str,
                fmt = fmt || 'yyyy年MM月dd日',
                o = {
                  'M+': date.getMonth() + 1, //月份
                  'd+': date.getDate(), //日
                  'h+': date.getHours(), //小时
                  'm+': date.getMinutes(), //分
                  's+': date.getSeconds(), //秒
                  'q+': Math.floor((date.getMonth() + 3) / 3), //季度
                  'S': date.getMilliseconds() //毫秒
              };
            if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
            return fmt;
        },
        /**
         * 转义<>, 页面带出数据时需先调用该方法替换，避免跨站脚本攻击
         * @param  {[type]} str [description]
         * @return {[type]}     [description]
         */
        escape: function (str) {
            return str ? str.toString().replace(/[<]/g, '&lt;').replace(/[>]/g, '&gt;').replace(/\\"/g, '&quot;') : '';
        }
    }
    return window.Utils = Utils;
});
