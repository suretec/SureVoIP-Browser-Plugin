/************************************************************************************
 This is your background code.
 For more information please visit our wiki site:
 http://docs.crossrider.com/#!/guide/background_scope
 *************************************************************************************/
appAPI.ready(function($) {
	
	
	// Sets the initial browser icon
	appAPI.browserAction.setResourceIcon('BrowserButton.png');
	
	// When the user clicks the browser button
	appAPI.browserAction.onClick(function() {
		// Send a message to the page to show the Settings dialog
		appAPI.message.toActiveTab({
			action : 'SureVoIPExtension_OpenSettingsDialog'
		});
	});
	
	appAPI.message.addListener(function(msg) {
		switch (msg.action) {
			case 'SureVoIPExtension_SaveSettings':
				appAPI.db.set("Settings", msg.value);
				//localStorage["Settings"] = msg.value;
				appAPI.message.toAllTabs({
					action : 'SureVoIPExtension_GetSettings_Response',
					value : msg.value
				});
				break;
			case 'SureVoIPExtension_GetSettings':
				var value = appAPI.db.get("Settings");
				//var value = localStorage["Settings"];
				appAPI.message.toAllTabs({
					action : 'SureVoIPExtension_GetSettings_Response',
					value : value
				});
				break;
			case 'SureVoIPExtension_DoServerRequest':
				var settings = JSON.parse(appAPI.db.get("Settings"));
				$.support.cors = true;
				msg.value.beforeSend = function(xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + encodingHelper.encode64(settings.username + ":" + settings.password));
				};
				msg.value.success = function(data, textStatus, jqXHR) {
					appAPI.message.toActiveTab({
						action : 'SureVoIPExtension_AjaxSuccess',
						value : jqXHR
					});
				};
				msg.value.error = function(xhr, ajaxOptions, thrownError) {
					appAPI.message.toActiveTab({
						action : 'SureVoIPExtension_AjaxError',
						value : xhr
					});
				};
				$.ajax(msg.value);
				break;
		}
	});
});
var encodingHelper = {
	keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	StringMaker: function () {
		this.str = "";
		this.length = 0;
		this.append = function (s) {
			this.str += s;
			this.length += s.length;
		}
		this.prepend = function (s) {
			this.str = s + this.str;
			this.length += s.length;
		}
		this.toString = function () {
			return this.str;
		}
	},
	encode64:function(input) {
		var output = new this.StringMaker();
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
	
		while (i < input.length) {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
	
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
	
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
	
			output.append(this.keyStr.charAt(enc1) + this.keyStr.charAt(enc2) + this.keyStr.charAt(enc3) + this.keyStr.charAt(enc4));
		}
		return output.toString();
	}
}
