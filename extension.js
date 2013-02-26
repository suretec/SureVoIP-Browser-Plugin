// Used to avail $ outside of appAPI.ready
var $ = undefined;

function log(message) {
	//	Logging is currently disable as this is the final version.
	console.log('	***** SureVoIP: ***** ' + message, arguments);
}

/************************************************************************************
 This is your Page Code. The appAPI.ready() code block will be executed on every page load.
 For more information please visit our docs site: http://docs.crossrider.com
 *************************************************************************************/

var hoveredNumber = "";
var PostSaveAction = null;

var SMSBody = undefined
var SMSTips = undefined;

var dialogValidations = {
	updateTips:function(t, tips){
		tips.text(t).addClass("ui-state-highlight");
		tips.show();
		setTimeout(function() {
			tips.removeClass("ui-state-highlight", 1500);
		}, 500);
	},
	checkLength:function(o, n, min, max, tips){
		if (o.val().length > max || o.val().length < min) {
			o.addClass("ui-state-error");
			this.updateTips("Length of the " + n + " must be between " + min + " and " + max + " characters.", tips);
			return false;
		} else {
			return true;
		}
	},
	checkNumber:function(o, n, tips){
		if (o.val() && isNaN(o.val())) {
			o.addClass("ui-state-error");
			this.updateTips(n + " is not a valid number.", tips);
			return false;
		} else {
			return true;
		}
	},
	checkRegexp:function(o, regexp, n, tips){
		if (!( regexp.test(o.val()) )) {
			o.addClass("ui-state-error");
			this.updateTips(n, tips);
			return false;
		} else {
			return true;
		}
	}
};

var dialogs = {
	init : function() {
		this.constructSettings();
		this.constructSMS();
		this.constructFax();
		SMSBody = $("#SureVoIPExtensionSMSBody");
		SMSTips = $(".SureVoIPExtensionValidateSMSTips");
	},
	constructSettings : function() {
		var tempString = '<div id="SureVoIPExtensionDialog" title="SureVoIPExtensionDialog" style="display:none;">';
		tempString += '<div class="SureVoIPExtensionDialogTitleDiv"><b>SureVoIP</b> Settings</div>';
		tempString += '<div class="SureVoIPExtensionDialogHeader">User Account</div>';
		tempString += '<div class="SureVoIPExtensionDialogAttribute" >';
		tempString += '<label for="SureVoIPExtensionUsername" class="SureVoIPExtensionDialogAttributeLabel">Username</label>';
		tempString += '	<input type="text" name="SureVoIPExtensionUsername" id="SureVoIPExtensionUsername" class="text ui-widget-content ui-corner-all" />';
		tempString += '</div>';
		tempString += '<div class="SureVoIPExtensionDialogAttribute" >';
		tempString += '	<label for="SureVoIPExtensionPassword" class="SureVoIPExtensionDialogAttributeLabel">Password</label>';
		tempString += '	<input type="password" name="SureVoIPExtensionPassword" id="SureVoIPExtensionPassword" value="" class="text ui-widget-content ui-corner-all" />';
		tempString += '</div>';
		tempString += '<div class="SureVoIPExtensionDialogHeader">Call Settings</div>';
		tempString += '<div class="SureVoIPExtensionDialogAttribute" >';
		tempString += '	<label for="SureVoIPExtensionDialNumber" class="SureVoIPExtensionDialogAttributeLabel">From Number</label>';
		tempString += '	<input title="your direct dial number" type="text" name="SureVoIPExtensionDialNumber" id="SureVoIPExtensionDialNumber" value="" class="text ui-widget-content ui-corner-all" />';
		tempString += '</div>';
		tempString += '<div class="SureVoIPExtensionDialogHeader">SMS Settings</div>';
		tempString += '<div class="SureVoIPExtensionDialogAttribute" >';
		tempString += '	<label for="SureVoIPExtensionSMSName" class="SureVoIPExtensionDialogAttributeLabel">From Name</label>';
		tempString += '	<input title="mobile number or company name" type="text" name="SureVoIPExtensionSMSName" id="SureVoIPExtensionSMSName" value="" class="text ui-widget-content ui-corner-all" />';
		tempString += '</div>';
		tempString += '<div class="SureVoIPExtensionDialogHeader">Fax Settings</div>';
		tempString += '<div class="SureVoIPExtensionDialogAttribute" >';
		tempString += '	<label for="SureVoIPExtensionFaxNumber" class="SureVoIPExtensionDialogAttributeLabel">From Number</label>';
		tempString += '	<input title="your fax number" type="text" name="SureVoIPExtensionFaxNumber" id="SureVoIPExtensionFaxNumber" value="" class="text ui-widget-content ui-corner-all" />';
		tempString += '</div>';
		tempString += '<p class="SureVoIPExtensionDialogAttribute SureVoIPExtensionValidateTips"></p>';
		tempString += '</div>';
		
		$('body').append(tempString);
	},
	constructSMS : function(){
		var tempString = '<div id="SureVoIPExtensionSMSDialog" title="SureVoIPExtensionDialog">';
		tempString += '	<div class="SureVoIPExtensionDialogTitleDiv"><b>SureVoIP</b> SMS</div>';
		tempString += '	<div class="SureVoIPExtensionDialogAttribute" >';
		tempString += '		<label class="SureVoIPExtensionSMSLabel">To: </label>';
		tempString += '		<label id="SureVoIPExtensionSMSTo" class="SureVoIPExtensionSMSLabel"></label>';
		tempString += '	</div>';
		tempString += '	<div class="SureVoIPExtensionDialogAttribute" >';
		tempString += '		<label class="SureVoIPExtensionSMSLabel" for="SureVoIPExtensionSMSBody">Message body</label>';
		tempString += '		<textarea name="SureVoIPExtensionSMSBody" id="SureVoIPExtensionSMSBody" class="text ui-widget-content ui-corner-all" />';
		tempString += '	</div>';
		tempString += '	<div class="SureVoIPExtensionSMSCharactersCountAttribute" >';
		tempString += '		<label class="SureVoIPExtensionSMSLabel">Characters count left:</label>';
		tempString += '		<label id="SMSCharactersCount" class="SureVoIPExtensionSMSLabel">160</label>';
		tempString += '	</div>';
		tempString += '	<p class="SureVoIPExtensionDialogAttribute SureVoIPExtensionValidateSMSTips"></p>';
		tempString += '</div>';

		$('body').append(tempString);
	},
	constructFax: function(){
		var tempString = '<form id="SureVoIPExtensionFAXDialog" title="SureVoIPExtensionDialog" enctype="multipart/form-data">';
		tempString += '<div class="SureVoIPExtensionDialogTitleDiv"><b>SureVoIP</b> FAX</div>';
		tempString += '<div class="SureVoIPExtensionDialogAttribute" >';
		tempString += '	<label class="SureVoIPExtensionSMSLabel">To: </label>';
		tempString += '	<label id="SureVoIPExtensionFAXToLabel" class="SureVoIPExtensionSMSLabel"></label>';
		tempString += '</div>';
		tempString += '<input id="SureVoIPExtensionFAXToValue" name="to" type="hidden"/><input id="SureVoIPExtensionFaxFrom" name="from" type="hidden"/>';
		tempString += '<div class="SureVoIPExtensionDialogAttribute" >';
		tempString += '	<label for="SureVoIPExtensionFAXBody" class="SureVoIPExtensionSMSLabel">FAX body</label>';
		tempString += '	<input type="file" name="file" id="SureVoIPExtensionFAXBody" accept=".pdf,.tiff,.html,.htm,.txt" />';
		tempString += '</div>';
		tempString += '<p class="SureVoIPExtensionDialogAttribute SureVoIPExtensionValidateFAXTips"></p>';
		tempString += '</form>';		

		$('body').append(tempString);
	},
	showSettings : function() {
		$("#SureVoIPExtensionDialog").dialog("open");
		if (!settings.isReady)
			return;

		
		settings.fillInUI();
	}
}

var settings = {
	isReady : false,

	username : undefined,
	password : undefined,
	dialNumber : undefined,
	smsname : undefined,
	faxNumber : undefined,

	init : function() {
		this.readFromBackground();
	},
	update : function(newSettings) {
		this.username = newSettings.username;
		this.password = newSettings.password;
		this.dialNumber = newSettings.dialNumber;
		this.smsname = newSettings.smsname;
		this.faxNumber = newSettings.faxNumber;

		this.isReady = true;
	},
	sendToBackground : function() {
		messageHandler.sendMessageToBackground(messageHandler.MESSAGES.SaveSettings, JSON.stringify(this));
	},
	readFromBackground : function() {
		messageHandler.sendMessageToBackground(messageHandler.MESSAGES.GetSettings);
	},
	readFromUI : function() {

	},
	fillInUI : function() {
		$("#SureVoIPExtensionUsername").val(this.username);
		$("#SureVoIPExtensionPassword").val(this.password);
		$("#SureVoIPExtensionSMSName").val(this.smsname);
		$("#SureVoIPExtensionDialNumber").val(this.dialNumber);
		$("#SureVoIPExtensionFaxNumber").val(this.faxNumber);
	}
};

var messageHandler = {
	MESSAGES : {
		GetSettings : 'SureVoIPExtension_GetSettings', // Page -> Background
		GetSettings_Response : 'SureVoIPExtension_GetSettings_Response', // Background -> Page
		SaveSettings : 'SureVoIPExtension_SaveSettings', // Page -> Background
		OpenSettingsDialog : 'SureVoIPExtension_OpenSettingsDialog', // Background -> Page
	},
	init : function() {
		appAPI.message.addListener(this.handleMessageFromBackground);
	},
	sendMessageToBackground : function(action, value) {
		appAPI.message.toBackground({
			action : action,
			value : value
		});
	},
	handleMessageFromBackground : function(msg) {
		log('Received Message: ', msg);
		switch (msg.action) {
			case messageHandler.MESSAGES.OpenSettingsDialog:
				dialogs.showSettings();
				break;
			case messageHandler.MESSAGES.GetSettings_Response:
				settings.update(JSON.parse(msg.value));
				break;
		}
	}
};

var serverRequest = {
	send : function(url, jsonData) {
		$.ajax(this.constructOptions(url, jsonData));
	},
	constructOptions : function(url, jsonData) {
		var options = {
			url : url,
			beforeSend : function(xhr) {
				xhr.setRequestHeader("Authorization", "Basic " + btoa(settings.username + ":" + settings.password));
			},
			type : "POST",
			cache : false,
			dataType : "json",
			success : function(data, textStatus, jqXHR) {
				if (jqXHR.status == 202) {
					$(".SureVoIPExtensionLoadingDiv").css("background-image", "url('" + appAPI.resources.getImage("RequestSent.png") + "')");
					$(".SureVoIPExtensionLoadingDiv").fadeOut(3000, function() {
						$(".SureVoIPExtensionLoadingDiv").css("background-image", "url('" + appAPI.resources.getImage("SendingRequest.png") + "')")
					});
				} else {
					alert("SureVoIP \nServer responded with error code: " + jqXHR.status);
					$(".SureVoIPExtensionLoadingDiv").hide();
				}
			},
			error : function(xhr, ajaxOptions, thrownError) {
				alert("SureVoIP \nError sending request to the server.\nError message: " + xhr.statusText);
				$(".SureVoIPExtensionLoadingDiv").hide();
			}
		};
		if (jsonData) {
			options.data = JSON.stringify(jsonData);
			options.contentType = "application/json";
		}
		return options;
	},
	sendCall : function(jsonData) {
		this.send('https://api.surevoip.co.uk/calls', jsonData);
	},
	sendSMS : function(jsonData) {
		this.send('https://api.surevoip.co.uk/sms', jsonData);
	},
	sendFax : function(from, to) {
		$("#SureVoIPExtensionFAXToValue").val("00" + to);
		$("#SureVoIPExtensionFaxFrom").val("00" + from);
		var options = this.constructOptions('https://api.surevoip.co.uk/faxes');
		$('#SureVoIPExtensionFAXDialog').ajaxForm(options);
		$('#SureVoIPExtensionFAXDialog').submit();
	},
}

var phoneManager = {
	// 202136564618-Ije01prS7NCXYlRAcsZ5
	checkUserNameAndPassword : function() {
		if (settings.username && settings.password)
			return true;

		alert("Please provide your Username and Password.");
		return false;
	},
	checkBeforeCall : function() {
		if (!phoneManager.checkUserNameAndPassword())
			return false;

		if (!settings.dialNumber) {
			alert('Please enter your "From Number" in the Call Settings section.');
			return false;
		}

		return true;
	},
	checkBeforeSMS : function() {
		if (!phoneManager.checkUserNameAndPassword())
			return false;

		if (!settings.smsname) {
			alert('Please enter your "From Name" in the SMS Settings section.');
		}

		return true;
	},
	checkBeforeFAX : function() {
		if (!phoneManager.checkUserNameAndPassword())
			return false;

		if (!settings.faxNumber) {
			alert('Please provide your "From Number" in the Fax Settings section.');
		}

		return true;
	},
	call : function() {
		debugger;
		if (phoneManager.checkBeforeCall()) {
			$(".SureVoIPExtensionLoadingDiv").show();
			serverRequest.sendCall({
				to : phoneManager.formatNumber(hoveredNumber),
				from : phoneManager.formatNumber(settings.dialNumber),
				caller_id : phoneManager.formatNumber(settings.dialNumber)
			});
		} else {
			PostSaveAction = phoneManager.call;
			dialogs.showSettings();
		}
	},
	sms : function() {
		if (this.checkBeforeSMS()) {
			$(".SureVoIPExtensionLoadingDiv").show();
			serverRequest.sendSMS({
				to : phoneManager.formatNumber(hoveredNumber),
				from : phoneManager.formatNumber(settings.smsname),
				message : SMSBody.val()
			});
		} else {
			PostSaveAction = phoneManager.sms;
			dialogs.showSettings();
		}
	},
	fax : function() {
		if (phoneManager.checkBeforeFAX()) {
			$(".SureVoIPExtensionLoadingDiv").show();
			serverRequest.sendFax(phoneManager.formatNumberForFAX(settings.faxNumber), phoneManager.formatNumberForFAX(faxNumber));
		} else {
			PostSaveAction = phoneManager.fax;
			dialogs.showSettings();
		}
	},
	formatNumber : function(number) {
		return number.replace(/[+-/\s/\(/\)/\.]/g, '').replace(/^00/, '').replace(/^0/, '44');
	},
	formatNumberForFAX : function(number) {
		return '00' + this.formatNumber(number);
	},
}

var phoneNumberDetection = {
	phonePattern: /[\d+\(\)]{2,3}[\d\s.+\-\(\)]{5,20}[\d]{3,4}/g,
	IPAddressPattern: /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])[\.\-]){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/,
	init: function() {
		// Parse the document for phone numbers
		phoneNumberDetection.startDetection();
		setInterval( function(){
			// Keep parsing the document for new numbers every 3 seconds
			phoneNumberDetection.startDetection();
		}, 3000);
	},
	startDetection: function() {
		var $existingSureVoIPNumberLinks = $('.SureVoIPExtensionNumberLink');
		
		phoneNumberDetection.detectTextNodes($('body')[0]);
		
		log('Registered Hover * ', $existingSureVoIPNumberLinks.length + " -> " + $('.SureVoIPExtensionNumberLink').length);
		
		$('.SureVoIPExtensionNumberLink').not($existingSureVoIPNumberLinks).hover(function() {
			log('hover over link ', $(this).text());
			showMenu = true;
			hoveredNumber = $(this).text();
			var popupContainer = $(GetPopupContainer());
			if (!popupContainer.is(":visible"))
				popupContainer.show();
			popupContainer.css('left', $(this).offset().left);
			//popupContainer.css('width',$(this).css('width'));
			var textHeight = $(this).css('height');
			popupContainer.css('top', Math.max(0, $(this).offset().top + parseInt(textHeight.substring(0, textHeight.length - 2))));
		}, function() {
			log('unhover link ', $(this).text());
			var parent = this;
			showMenu = false;
			setTimeout(function() {
				if (!showMenu) {
					//$(parent).prev().hide();
					$('#SureVoIPExtensionPopupContainer').hide();
				}
			}, 100);
		});
	},
	detectTextNodes: function (node) {
		// Need to bypass elements we already processed. This is required since we do this every few seconds.
		if ( node.classList && node.classList.contains('SureVoIPExtensionNumberLink') )
			return;
			
		if (node.nodeName == "SCRIPT")
			return;					
					
		if (node.nodeType == 3) {
			this.detectPhoneNumbers(node);
		} else {
			for (var i = 0, len = node.childNodes.length; i < len; ++i) {
				this.detectTextNodes(node.childNodes[i]);
			}
		}
	},
	detectPhoneNumbers: function(node) {
		var parent = node.parentNode;
		var originalText = node.nodeValue;
		var newText = originalText;
		var foundPhoneNumber = false;

		var matches = originalText.match(this.phonePattern);
		if (!matches)
			return;
			
		for (var j = matches.length - 1; j >= 0; j--) {
			if (matches[j].match(this.IPAddressPattern))
				continue;

			var matchIndexStart = originalText.lastIndexOf(matches[j]);
			var matchIndexEnd = matchIndexStart + matches[j].length;
			log('found match ', matchIndexStart, matchIndexEnd, matches[j]);
			newText = newText.substring(0, matchIndexStart) + '<span class="SureVoIPExtensionNumberLink">' + matches[j] + '</span>' + newText.substring(matchIndexEnd);

			originalText = originalText.substring(0, matchIndexEnd);

			foundPhoneNumber = true;
		}
		if (foundPhoneNumber) {
			var newDiv = document.createElement("div");
			$(newDiv).html(newText);
			parent.insertBefore(newDiv, node);
			$(node).remove();
		}
	}
}

	function GetPopupContainer() {
		var popupContainer = document.getElementById('SureVoIPExtensionPopupContainer');
		if (popupContainer == undefined) {
			popupContainer = "<div id='SureVoIPExtensionPopupContainer'><div><img id='SureVoIPExtensionImg'  src='" + appAPI.resources.getImage("SureVoIP.jpg") + "' height='22px' width='112px'/></div>" + "<a id='SureVoIPExtensionCallBtn' href='javascript:void(0);'><div class='SureVoIPExtensionMenuItemContainer'>Call this</div></a><a id='SureVoIPExtensionSMSBtn' href='javascript:void(0);'><div class='SureVoIPExtensionMenuItemContainer'>Text this</div></a>" + "<a id='SureVoIPExtensionFAXBtn' href='javascript:void(0);'><div class='SureVoIPExtensionMenuItemContainer'>Fax this</div></a><a id='SureVoIPExtensionSettingsBtn' href='javascript:void(0);'><div class='SureVoIPExtensionSettingsMenuItemContainer'>Settings</div></a></div>";
			$("body").append(popupContainer);
			popupContainer = document.getElementById('SureVoIPExtensionPopupContainer');

			$('#SureVoIPExtensionPopupContainer').hover(function(e) {
				log('hover over menu');
				showMenu = true;
				return false;
			}, function() {
				log('unhover menu');
				var parent = this;
				showMenu = false;
				setTimeout(function() {
					if (!showMenu) {
						$('#SureVoIPExtensionPopupContainer').hide();
					}
				}, 100);
			});
			$("#SureVoIPExtensionCallBtn").click(function() {
				phoneManager.call();
			});
			$("#SureVoIPExtensionSMSBtn").click(function() {
				SMSBody.val("");
				$("#SureVoIPExtensionSMSTo").text(hoveredNumber);
				$("#SureVoIPExtensionSMSDialog").dialog("open");
			});
			$("#SureVoIPExtensionFAXBtn").click(function() {
				FAXBody.val("");
				$("#SureVoIPExtensionFAXToLabel").text(hoveredNumber);
				$("#SureVoIPExtensionFAXDialog").dialog("open");
			});
			$("#SureVoIPExtensionSettingsBtn").click(function() {
				PostSaveAction = null;
				dialogs.showSettings();
			});
		}

		return popupContainer;
	}

appAPI.ready(function(jQuery) {
	$ = jQuery;
	function init() {
		appAPI.resources.jQueryUI('1.10.1');
		appAPI.resources.includeJS('jquery.form.js');
		appAPI.resources.includeCSS('jquery-ui-1.10.0.custom.css');
		appAPI.resources.includeCSS('CustomCss.css');

		messageHandler.init();
		settings.init();
		dialogs.init();
		phoneNumberDetection.init();
	}

	init();
	// Place your code here (you can also define new functions above this scope)
	// The $ object is the extension's jQuery object
	var showMenu = false;
	


	$("body").append('<div class="SureVoIPExtensionLoadingDiv" style="display:none;"></div>');
	$("body").addClass("SureVoIPExtensionLoading");
	//$(".SureVoIPExtensionLoadingDiv").hide();
	//	function GetLoadingImage(){
	//		var loadingImage = document.getElementById('LoadingImage');
	//		if(loadingImage == undefined){
	//			loadingImage = "<div class='modal'></div>";
	//			$("body").append(loadingImage);
	//			loadingImage = document.getElementById('LoadingImage');
	//		}
	//		return loadingImage;
	//	}


	/*********************************************/
	/************Dialog Part**********************/
	/*********************************************/
	var username = $("#SureVoIPExtensionUsername"), password = $("#SureVoIPExtensionPassword"), dialNumber = $("#SureVoIPExtensionDialNumber"), smsname = $("#SureVoIPExtensionSMSName"), faxNumber = $("#SureVoIPExtensionFaxNumber"), allFields = $([]).add(username).add(password).add(dialNumber).add(smsname).add(faxNumber), createUserTips = $(".SureVoIPExtensionValidateTips");


	var options = {
		autoOpen : false,
		height : 435,
		width : 350,
		modal : true,
		buttons : {
			Save : function() {
				var bValid = true;
				allFields.removeClass("ui-state-error");
				bValid = bValid && dialogValidations.checkLength(username, "username", 3, 16, createUserTips);
				bValid = bValid && dialogValidations.checkLength(password, "password", 5, 160, createUserTips);

				bValid = bValid && dialogValidations.checkRegexp(username, /([0-9a-z_])+$/i, "Username may consist of a-z, 0-9, underscores.", createUserTips);
				bValid = bValid && dialogValidations.checkNumber(dialNumber, "From Number", createUserTips);

				if (bValid) {
					debugger;
					settings.update({
						'username' : username.val(),
						'password' : password.val(),
						'smsname' : smsname.val(),
						'dialNumber' : dialNumber.val(),
						'faxNumber' : faxNumber.val()
					});
					settings.sendToBackground();

					$(this).dialog("close");
					$(".SureVoIPExtensionValidateTips").hide();
					if (PostSaveAction != null)
						PostSaveAction();
				} else {
					$("#SureVoIPExtensionDialog").css('height', 480);
				}
			},
			Cancel : function() {
				$(this).dialog("close");
			}
		},
		close : function() {
			allFields.val("").removeClass("ui-state-error");
			$(".SureVoIPExtensionValidateTips").hide();
		}
	};

	$("#SureVoIPExtensionDialog").dialog(options);
	// $("#SureVoIPExtensionDialog").dialog({
		// autoOpen : false,
		// height : 435,
		// width : 350,
		// modal : true,
		// buttons : {
			// Save : function() {
				// var bValid = true;
				// allFields.removeClass("ui-state-error");
				// bValid = bValid && dialogValidations.checkLength(username, "username", 3, 16, createUserTips);
				// bValid = bValid && dialogValidations.checkLength(password, "password", 5, 160, createUserTips);
// 
				// bValid = bValid && dialogValidations.checkRegexp(username, /([0-9a-z_])+$/i, "Username may consist of a-z, 0-9, underscores.", createUserTips);
				// bValid = bValid && dialogValidations.checkNumber(dialNumber, "From Number", createUserTips);
// 
				// if (bValid) {
					// settings.update({
						// 'username' : username.val(),
						// 'password' : password.val(),
						// 'smsname' : smsname.val(),
						// 'dialNumber' : dialNumber.val(),
						// 'faxNumber' : faxNumber.val()
					// });
					// settings.sendToBackground();
// 
					// $(this).dialog("close");
					// $(".SureVoIPExtensionValidateTips").hide();
					// if (PostSaveAction != null)
						// PostSaveAction();
				// } else {
					// $("#SureVoIPExtensionDialog").css('height', 480);
				// }
			// },
			// Cancel : function() {
				// $(this).dialog("close");
			// }
		// },
		// close : function() {
			// allFields.val("").removeClass("ui-state-error");
			// $(".SureVoIPExtensionValidateTips").hide();
		// }
	// });

	/*********************************************/
	/************SMS Part**********************/
	/*********************************************/
	

	$("#SureVoIPExtensionSMSBody").bind('input propertychange', function() {
		$("#SMSCharactersCount").text(160 - $("#SureVoIPExtensionSMSBody").val().length);
		if (parseInt($("#SMSCharactersCount").text()) < 0)
			$("#SMSCharactersCount").css("color", "red");
		else
			$("#SMSCharactersCount").css("color", "black");
	});

	$("#SureVoIPExtensionSMSDialog").dialog({
		autoOpen : false,
		height : 520,
		width : 350,
		modal : true,
		buttons : {
			Send : function() {
				var bValid = true;

				bValid = bValid && dialogValidations.checkLength(SMSBody, "SMS body", 1, 160, SMSTips);

				if (bValid) {
					phoneManager.sms();
					$(this).dialog("close");
					$(".SureVoIPExtensionValidateSMSTips").hide();
				} else {
					$("#SureVoIPExtensionSMSDialog").css('height', 500);
				}
			},
			Cancel : function() {
				$(this).dialog("close");
			}
		},
		close : function() {
			SMSBody.removeClass("ui-state-error");
			$(".SureVoIPExtensionValidateSMSTips").hide();
			$("#SMSCharactersCount").text("160");
		}
	});

	/*********************************************/
	/************FAX Part**********************/
	/*********************************************/
	
	var FAXBody = $('#SureVoIPExtensionFAXBody'), FAXTips = $(".SureVoIPExtensionValidateFAXTips");

	$("#SureVoIPExtensionFAXDialog").dialog({
		autoOpen : false,
		height : 250,
		width : 350,
		modal : true,
		buttons : {
			Send : function() {
				var bValid = true;

				//bValid = bValid && dialogValidations.checkLength( FAXBody, "FAX body", 1, 160,FAXTips );
				if (FAXBody.val() == "") {
					bValid = false;
					alert("Please choose a file.");
				}

				if (bValid) {
					phoneManager.fax();
					$(this).dialog("close");
					$(".SureVoIPExtensionValidateFAXTips").hide();
				}
			},
			Cancel : function() {
				$(this).dialog("close");
			}
		},
		close : function() {
			FAXBody.removeClass("ui-state-error");
			$(".SureVoIPExtensionValidateFAXTips").hide();
		}
	});
	//$('.ui-dialog-titlebar span[title=SureVoIPExtensionDialog])')
	for (var i = 0; i < $(".ui-dialog-titlebar").length; i++) {
		if ( $($(".ui-dialog-titlebar")[i]).find("span").first().html() == "SureVoIPExtensionDialog") {
			$($(".ui-dialog-titlebar")[i]).hide();
			$($(".ui-dialog-titlebar")[i]).parent().addClass("SureVoIPExtensionDialogContainer");
			$($(".ui-dialog-titlebar")[i]).next().css("padding", "0");
		}
	}
});
