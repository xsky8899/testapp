(function(){
    var ts
    try{
      ts = _H5.ts;
    }catch(e){};
    requirejs.config({
        urlArgs:'v=' + (new Date()).getTime(),
        baseUrl:'',
        paths: {
            // zepto
            C: 'js/common/common',
            zepto: 'libs/zepto',
            fastclick: 'libs/fastclick',
            zepto_core: 'libs/zepto-core',
            touch: 'libs/touch',
            deferred: 'libs/deferred',
            data: 'libs/data',
            fx: 'libs/fx',
            callbacks: 'libs/callbacks',
            // underscore
            underscore: 'libs/underscore-min',
            // plugins
            swipe: 'libs/swipe',
            fastclick: 'libs/fastclick',
            // view
            view: 'js/common/view',
        },
        shim: {
            'touch': {
                deps: ['zepto_core'],
                exports: '$'
            },
            'callbacks': {
                deps: ['zepto_core'],
                exports: '$'
            },
            'deferred': {
                deps: ['callbacks'],
                exports: '$'
            },
            'data': {
                deps: ['zepto_core'],
                exports: '$'
            },
            'fx': {
                deps: ['zepto_core'],
                exports: '$'
            },
            'swipe': {
                deps: ['zepto_core'],
                exports: 'Swipe'
            }
        }
    });
})();
