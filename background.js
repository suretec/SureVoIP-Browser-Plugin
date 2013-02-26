/************************************************************************************
 This is your background code.
 For more information please visit our wiki site:
 http://docs.crossrider.com/#!/guide/background_scope
 *************************************************************************************/

appAPI.ready(function($) {
	appAPI.browserAction.setResourceIcon('favicon.png');
	appAPI.browserAction.onClick(function() {
		appAPI.message.toActiveTab({
			action : 'SureVoIPExtension_OpenSettingsDialog'
		});
	});

	appAPI.message.addListener(function(msg) {
		switch (msg.action) {
			case 'SureVoIPExtension_SaveSettings':
				localStorage["Settings"] = msg.value;
				appAPI.message.toAllTabs({
					action : 'SureVoIPExtension_GetSettings_Response',
					value : msg.value
				});
				break;
			case 'SureVoIPExtension_GetSettings':
				var value = localStorage["Settings"];
				appAPI.message.toAllTabs({
					action : 'SureVoIPExtension_GetSettings_Response',
					value : value
				});
				break;
		}
	});
}); 