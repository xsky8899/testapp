define(['zepto', 'js/common/constant'], function ($, Constant) {
    'use strict';

    var DEBUG_MODE = Constant.DEBUG_MODE,
        debug,
        text = '',
        _init = function () {
            if (!$('#_result')[0] && Constant.Env != 'PRODUCTION') {
                $(document.body).append('<span class="_bg_"></span><div class="_debug_">debug</div>');
                $(document.body).append('<div id="_result" style="display:none;"><a class="debug" onclick="location.href=location.href;">refresh</a> <a class="debug" onclick="$(\'#_result\').hide()">close</a><p class="v">当前url: ' + location.href + '</p><p class="v">version: ' + _H5.version + '</p><p class="v">time: ' + _H5.ts + '</p></div>');
                $('._debug_,._bg_')
                    .css({
                        position: 'fixed',
                        left: '20px',
                        bottom: '20px',
                        width: '40px',
                        height: '40px',
                        'line-height': '40px',
                        'font-size': '14px'
                    });
                $('._bg_')
                    .css({
                        background: '#000',
                        opacity: '0.2',
                        'border-radius': '50%'
                    });
                $('._debug_')
                    .css({
                        color: 'red',
                        'text-align': 'center'
                    })
                    .tap(function () {
                        $('#_result').toggle();
                    });

                $('#_result').css({
                    'font-size': '14px',
                    'padding': '5px',
                    'line-height': '16px'
                });
                $(document.head).append('<style type="text/css">#_result{position:absolute;top:0;height:450px;overflow-y:auto;background-color:rgba(0,0,0,0.8);width:100%;z-index: 999}#_result>div{border-bottom:dotted 1px #666;}#_result .v{color:#fff;font-size:16px;padding:5px;}.debug{min-width:80px;border-radius: 4px;font-size: 18px;line-height: 40px;height: 40px;border: none;padding: 0 10px;margin-bottom: 10px;display: inline-block;background-color: #07c756;color: #fff;text-align: center;}}</style>');
            }
        };
    if (DEBUG_MODE) {
        $(function () {
            _init();
        });
        debug = {
            log: function () {
                for (var i = 0; i < arguments.length; i++) {
                    arguments[i] = typeof arguments[i] == 'object' ? JSON.stringify(arguments[i]) : arguments[i];
                }
                text = Array.prototype.join.apply(arguments, [',']);

                $('#_result').append('<div style="color:#8FDAFF;word-break:break-all;"><div style="display:inline-block;width:60px;">[DEBUG]</div>' + text + '</div>');
                $('#_result')[0].scrollTop = $('#_result')[0].scrollHeight;
            },
            error: function () {
                for (var i = 0; i < arguments.length; i++) {
                    arguments[i] = typeof arguments[i] == 'object' ? JSON.stringify(arguments[i]) : arguments[i];
                }
                text = Array.prototype.join.apply(arguments, [',']);
                $('#_result').append('<div style="color:#FF8F8F;word-break:break-all;"><div style="display:inline-block;width:60px;">[ERROR]</div>' + text + '</div>');
                $('#_result')[0].scrollTop = $('#_result')[0].scrollHeight;
            }
        };
    } else {
        debug = {
            log: function () {
            },
            error: function () {
            }
        };
    }
    return debug;
})
;
