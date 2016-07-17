define(["zepto","js/common/app"],function($,Native){
 	var ui = {
 		loading:function(){
 			Native.loadingBegin();
 		},
 		stopLoading:function(){
			Native.loadingFinish();
 		}
 	};

  // ui方法扩展
  $.extend(ui,{
    tip:function(text){
    	Native.tip(text);
    }
  });

  // 加载html模板页面
	$.fn.loadHTML = function(url,callback) {
      var $this = $(this);
      $.ajax({
          url: url,
          type: "get",
          dataType: "html",
          xhr: function() {
              return new window.XMLHttpRequest();
          },
          success: function(res) {
              $this.html(res);
              callback && callback(res);
          },
          complete:function(){}

      })
  }
 	return ui;
});
