define(['zepto','C'],function($,C){
	function login(callback){
		var paramData = {
			userId:$('#mobile').val(),
			password:$('#password').val()//加密
		}
		C.debug.log(paramData);
		$.ajax({
			url:C.Api('LOGIN'),
			type:'post',
			data:paramData,
			success:function(res){
				if(res && res.flag == C.Flag.SUCCESS){
					C.Utils.data(C.Constant.DK.USER_LOGIN_INFO,res.data);
					callback(res);
				}
			}
		})
	}
	$(function(){
		C.UI.stopLoading();
		// 设置标题
		C.Native.setHeader({
			title:C.T.INDEX
		});
		$('#login').on('click',function(){
			var mobile = $('#mobile').val();
			var password = $('#password').val();
			if(mobile && password){
				login(function(data){
						location.href = C.Utils.getParameter('redirectURL') || 'index.html';
						console.log(data);
				});
			}
		});
	})
});
