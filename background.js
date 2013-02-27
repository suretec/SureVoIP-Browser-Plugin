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