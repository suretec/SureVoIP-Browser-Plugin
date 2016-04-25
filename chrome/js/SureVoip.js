//
// Copyright (c) 2016, Suretec Systems Ltd. <http://www.suretecsystems.com/>
//
// This file is part of the SureVoIP Browser Plugin
//
// The SureVoIP Browser Plugin is free software: you can redistribute it 
// and/or modify it under the terms of the GNU General Public License as 
// published by the Free Software Foundation, either version 3 of the 
// License, or (at your option) any later version.
//
// The SureVoIP Browser Plugin is distributed in the hope that it will be 
// useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with the SureVoIP Browser Plugin.  If not, see 
// <http://www.gnu.org/licenses/>.
//
// Used to avail $ outside of appAPI.ready
var $ = undefined;

$ = jQuery;

// Place your code here (you can also define new functions above this scope)
// The $ object is the extension's jQuery object

function log(message) {
    //	Logging is currently disable as this is the final version.
    //console.log('	***** SureVoIP: ***** ' + message, arguments);
}

/************************************************************************************
 This is your Page Code. The appAPI.ready() code block will be executed on every page load.
 For more information please visit our docs site: http://docs.crossrider.com
 *************************************************************************************/

// hoveredNumber is the number which the user hover on
var hoveredNumber = "";
// PostSaveAction is a function that perform the user action
var PostSaveAction = null;
// showMenuis a flag to show menu when it is true
var showMenu = false;

// class for dialog validations
var dialogValidations = {
    //updates the error messages of the dialogs
    updateTips: function (t, tips) {
        tips.text(t).addClass('SureVoIPExtensionTipsHighLight');
        tips.show();
        setTimeout(function () {
            tips.removeClass("SureVoIPExtensionTipsHighLight", 5000);
        }, 500);
    },
    //checks the length of the given textbox to be between the 2 given values and call updateTips if out of range
    checkLength: function (o, n, min, max, tips) {
        if (o.val().length > max || o.val().length < min) {
            this.updateTips("Length of the " + n + " must be between " + min + " and " + max + " characters.", tips);
            return false;
        } else {
            return true;
        }
    },
    //checks the value of the given textbox to be only numbers without characters and call uptadeTips if not number 
    checkNumber: function (o, n, tips) {
        if (o.val() && isNaN(o.val())) {
            this.updateTips(n + " is not a valid number.", tips);
            return false;
        } else {
            return true;
        }
    },
    //checks the value of the given textbox to match the regular expression and call uptadeTips if not matching
    checkRegexp: function (o, regexp, n, tips) {
        if (!(regexp.test(o.val()))) {
            this.updateTips(n, tips);
            return false;
        } else {
            return true;
        }
    }
};

var dialogs = {
    username: undefined,
    password: undefined,
    dialNumber: undefined,
    smsname: undefined,
    faxNumber: undefined,
    allCreateUserFields: undefined,
    createUserTips: undefined,
    SMSBody: undefined,
    SMSTips: undefined,
    SMSCharactersCount: undefined,
    FaxBody: undefined,
    FaxTips: undefined,
    init: function () {
        this.constructSettings();
        this.constructSMS();
        this.constructFax();
        this.constructMenu();
        this.createFadeDiv();

    },
    createFadeDiv: function () {
        $('body').append("<div id='SureVoIPExtensionDialogBackDiv' class='SureVoIPExtensionFadeDiv'> </div>");
    },
    // construct HTML of the settings dialog and add it to the page
    constructSettings: function () {
        var tempString = '<div id="SureVoIPExtensionDialog" style="display:none;" class="SureVoIPExtensionDialog">';
        tempString += '<div class="SureVoIPExtensionDialogTitleDiv"><b>SureVoIP</b> Settings</div>';
        tempString += '<div class="SureVoIPExtensionDialogHeader">User Account</div>';
        tempString += '<div class="SureVoIPExtensionDialogAttribute" >';
        tempString += '<label for="SureVoIPExtensionUsername" class="SureVoIPExtensionDialogAttributeLabel">Username</label>';
        tempString += '	<input type="text" name="SureVoIPExtensionUsername" id="SureVoIPExtensionUsername" />';
        tempString += '</div>';
        tempString += '<div class="SureVoIPExtensionDialogAttribute" >';
        tempString += '	<label for="SureVoIPExtensionPassword" class="SureVoIPExtensionDialogAttributeLabel">Password</label>';
        tempString += '	<input type="password" name="SureVoIPExtensionPassword" id="SureVoIPExtensionPassword" value=""  />';
        tempString += '</div>';
        tempString += '<div class="SureVoIPExtensionDialogHeader">Call Settings</div>';
        tempString += '<div class="SureVoIPExtensionDialogAttribute" >';
        tempString += '	<label for="SureVoIPExtensionDialNumber" class="SureVoIPExtensionDialogAttributeLabel">From Number</label>';
        tempString += '	<input title="Your direct dial number" type="text" name="SureVoIPExtensionDialNumber" id="SureVoIPExtensionDialNumber" value=""  />';
        tempString += '</div>';
        tempString += '<div class="SureVoIPExtensionDialogHeader">SMS Settings</div>';
        tempString += '<div class="SureVoIPExtensionDialogAttribute" >';
        tempString += '	<label for="SureVoIPExtensionSMSName" class="SureVoIPExtensionDialogAttributeLabel">From Name</label>';
        tempString += '	<input title="Mobile number or company name" type="text" name="SureVoIPExtensionSMSName" id="SureVoIPExtensionSMSName" value=""  />';
        tempString += '</div>';
        tempString += '<div class="SureVoIPExtensionDialogHeader">Fax Settings</div>';
        tempString += '<div class="SureVoIPExtensionDialogAttribute" >';
        tempString += '	<label for="SureVoIPExtensionFaxNumber" class="SureVoIPExtensionDialogAttributeLabel">From Number</label>';
        tempString += '	<input title="Your fax number" type="text" name="SureVoIPExtensionFaxNumber" id="SureVoIPExtensionFaxNumber" value=""  />';
        tempString += '</div>';
        tempString += '<p class="SureVoIPExtensionDialogAttribute SureVoIPExtensionValidateTips"></p>';
        tempString += '<div class="SureVoIPExtensionDialogButtonContainer">';
        tempString += ' <input type="button" value="Save" class="SureVoIPExtensionDialogButton" id="SureVoIPExtensionSaveSettings">'
        tempString += ' <input type="button" value="Cancel" class="SureVoIPExtensionDialogButton">';
        tempString += '</div>';
        tempString += '</div>';
        $('body').append(tempString);
        dialogs.username = $("#SureVoIPExtensionUsername");
        dialogs.password = $("#SureVoIPExtensionPassword");
        dialogs.dialNumber = $("#SureVoIPExtensionDialNumber");
        dialogs.smsname = $("#SureVoIPExtensionSMSName");
        dialogs.faxNumber = $("#SureVoIPExtensionFaxNumber");
        dialogs.allCreateUserFields = $([]).add(dialogs.username).add(dialogs.password).add(dialogs.dialNumber).add(dialogs.smsname).add(dialogs.faxNumber);
        dialogs.createUserTips = $(".SureVoIPExtensionValidateTips");


    },
    // construct HTML of the SMS dialog and add it to the page
    constructSMS: function () {
        var tempString = '<div id="SureVoIPExtensionSMSDialog" style="display:none;" class="SureVoIPExtensionDialog">';
        tempString += '	<div class="SureVoIPExtensionDialogTitleDiv"><b>SureVoIP</b> SMS</div>';
        tempString += '	<div class="SureVoIPExtensionDialogAttribute" >';
        tempString += '		<label class="SureVoIPExtensionSMSLabel">To: </label>';
        tempString += '		<label id="SureVoIPExtensionSMSTo" class="SureVoIPExtensionSMSLabel"></label>';
        tempString += '	</div>';
        tempString += '	<div class="SureVoIPExtensionDialogAttribute" >';
        tempString += '		<label class="SureVoIPExtensionSMSLabel" for="SureVoIPExtensionSMSBody">Message body</label>';
        tempString += '		<textarea name="SureVoIPExtensionSMSBody" id="SureVoIPExtensionSMSBody"  />';
        tempString += '	</div>';
        tempString += '	<div class="SureVoIPExtensionSMSCharactersCountAttribute" >';
        tempString += '		<label class="SureVoIPExtensionSMSLabel">Characters count left:</label>';
        tempString += '		<label id="SureVoIPExtensionSMSCharactersCount" class="SureVoIPExtensionSMSLabel">160</label>';
        tempString += '	</div>';
        tempString += '	<p class="SureVoIPExtensionDialogAttribute SureVoIPExtensionValidateSMSTips"></p>';
        tempString += ' <div class="SureVoIPExtensionDialogButtonContainer">';
        tempString += '  <input type="button" value="Send" class="SureVoIPExtensionDialogButton" id="SureVoIPExtensionSendSMS"/>';
        tempString += '  <input type="button" value="Cancel" class="SureVoIPExtensionDialogButton"/>';
        tempString += ' </div>';
        tempString += '</div>';
        $('body').append(tempString);
        dialogs.SMSBody = $("#SureVoIPExtensionSMSBody");
        dialogs.SMSTips = $(".SureVoIPExtensionValidateSMSTips");
        dialogs.SMSCharactersCount = $("#SureVoIPExtensionSMSCharactersCount");
        dialogs.SMSBodyAttachEvent();

    },
    // construct HTML of the Fax dialog and add it to the page
    constructFax: function () {
        var tempString = '<form id="SureVoIPExtensionFAXDialog" style="display:none;" enctype="multipart/form-data" class="SureVoIPExtensionDialog">';
        tempString += '<div class="SureVoIPExtensionDialogTitleDiv"><b>SureVoIP</b> FAX</div>';
        tempString += '<div class="SureVoIPExtensionDialogAttribute" >';
        tempString += '	<label class="SureVoIPExtensionSMSLabel">To: </label>';
        tempString += '	<label id="SureVoIPExtensionFAXToLabel" class="SureVoIPExtensionSMSLabel"></label>';
        tempString += '</div>';
        tempString += '<input id="SureVoIPExtensionFAXToValue" name="to" type="hidden"/><input id="SureVoIPExtensionFaxFrom" name="from" type="hidden"/>';
        tempString += '<div class="SureVoIPExtensionDialogAttribute" >';
        tempString += '	<label for="SureVoIPExtensionFaxBody" class="SureVoIPExtensionSMSLabel">FAX body</label>';
        tempString += '	<div class="SureVoIPExtensionFaxBody_FileInputContainer">';
        tempString += '		<input type="file" name="file" id="SureVoIPExtensionFaxBody" accept=".pdf,.tiff,.html,.htm,.txt" />';
        tempString += '		<div class="SureVoIPExtensionFaxBody_FakeFile">';
        tempString += '			<input type="text" />';
        tempString += '			<button type="button" id="SureVoIPExtensionChooseFaxFile"><span>Choose File</span></button>';
        tempString += '		</div>';
        tempString += '	</div>';
        tempString += '</div>';
        tempString += '<p class="SureVoIPExtensionDialogAttribute SureVoIPExtensionValidateFaxTips" style="display:none;"></p>';
        tempString += ' <div class="SureVoIPExtensionDialogButtonContainer">';
        tempString += '  <input type="button" value="Send" class="SureVoIPExtensionDialogButton" id="SureVoIPExtensionSendFax"/>';
        tempString += '  <input type="button" value="Cancel" class="SureVoIPExtensionDialogButton"/>';
        tempString += ' </div>';
        tempString += '</form>';

        $('body').append(tempString);

        //When a file is selected set the value to the Textbox appearing in the UI
        $('#SureVoIPExtensionFaxBody').change(function () {
            var fileLocation = this.value;
            if (fileLocation.indexOf('\\') > 0)
                fileLocation = this.value.substring(this.value.lastIndexOf('\\') + 1);
            $('.SureVoIPExtensionFaxBody_FakeFile input[type=text]').val(fileLocation);
        });
        $("#SureVoIPExtensionChooseFaxFile").click(function(){
            $("#SureVoIPExtensionFaxBody").click();
        });
        
        dialogs.FaxBody = $('#SureVoIPExtensionFaxBody');
        dialogs.FaxTips = $(".SureVoIPExtensionValidateFaxTips");

    },
    // construct HTML of the Menu and add it to the page
    constructMenu: function () {
        var popupContainer = "<div id='SureVoIPExtensionPopupContainer' style='display:none;'>";
        popupContainer += "<div>";
        popupContainer += "<img id='SureVoIPExtensionImg'  src='" + chrome.extension.getURL("images/SureVoIP.jpg") + "' height='22px' width='112px'/>";
        popupContainer += "</div>";
        popupContainer += "<a id='SureVoIPExtensionCallBtn' href='javascript:void(0);'><div class='SureVoIPExtensionMenuItemContainer'>Call this</div></a>";
        popupContainer += "<a id='SureVoIPExtensionSMSBtn' href='javascript:void(0);'><div class='SureVoIPExtensionMenuItemContainer'>Text this</div></a>";
        popupContainer += "<a id='SureVoIPExtensionFAXBtn' href='javascript:void(0);'><div class='SureVoIPExtensionMenuItemContainer'>Fax this</div></a>";
        popupContainer += "<a id='SureVoIPExtensionSettingsBtn' href='javascript:void(0);'><div class='SureVoIPExtensionSettingsMenuItemContainer'>Settings</div></a>";
        popupContainer += "</div>";
        $("body").append(popupContainer);
        popupContainer = document.getElementById('SureVoIPExtensionPopupContainer');

        // on menu hover set the showMenu flag and on mouse leave set the flag to false and hide the menu
        $('#SureVoIPExtensionPopupContainer').hover(function (e) {
            log('hover over menu');
            showMenu = true;
            return false;
        }, function () {
            log('unhover menu');
            var parent = this;
            showMenu = false;
            setTimeout(function () {
                if (!showMenu) {
                    $('#SureVoIPExtensionPopupContainer').hide();
                }
            }, 50);
        });

        $("#SureVoIPExtensionCallBtn").click(function () {
            phoneManager.call();
        });
        $("#SureVoIPExtensionSMSBtn").click(function () {
            dialogs.SMSBody.val("");
            $("#SureVoIPExtensionSMSTo").text(hoveredNumber);

            dialogs.showDialog(attachDialog.SMSDialog);
        });
        $("#SureVoIPExtensionFAXBtn").click(function () {
            dialogs.FaxBody.val("");
            $("#SureVoIPExtensionFAXToLabel").text(hoveredNumber);

            dialogs.showDialog(attachDialog.FaxDialog);
        });
        $("#SureVoIPExtensionSettingsBtn").click(function () {
            PostSaveAction = null;
            dialogs.showSettings();
        });
        return popupContainer;

    },
    showDialog: function ($currentDialog) {
        $currentDialog.css({'margin-top': -$currentDialog.height() / 2 + 'px'});
        $currentDialog.css({'margin-left': -$currentDialog.width() / 2 + 'px'});
        $('#SureVoIPExtensionDialogBackDiv').show();
        $currentDialog.show();
    },
    //Open settings dialog and call fillInUI to fill the data 
    showSettings: function () {

        this.showDialog(attachDialog.settingDialog);
        if (!settings.isReady)
            return;
        settings.fillInUI();
    },
    // Attach an event to the sms body to display the character count on every user action
    SMSBodyAttachEvent: function () {
        dialogs.SMSBody.bind('input propertychange', function () {
            dialogs.SMSCharactersCount.text(160 - dialogs.SMSBody.val().length);
            if (parseInt(dialogs.SMSCharactersCount.text()) < 0)
                dialogs.SMSCharactersCount.css("color", "red");
            else
                dialogs.SMSCharactersCount.css("color", "black");
        });
    }



};

// Attaching the dialogs to their divs
var attachDialog = {
    settingDialog: undefined,
    SMSDialog: undefined,
    FaxDialog: undefined,
    menuPopup: undefined,
    init: function () {
        this.settingDialog = $("#SureVoIPExtensionDialog");
        this.SMSDialog = $("#SureVoIPExtensionSMSDialog");
        this.FaxDialog = $("#SureVoIPExtensionFAXDialog");
        this.menuPopup = $('#SureVoIPExtensionPopupContainer');
        this.attachCancelEvent();
        this.attachSaveSettingsEvent();
        this.attachSendSMSEvent();
        this.attachSendFaxEvent();
    },
    attachCancelEvent: function () {
        $(".SureVoIPExtensionDialogButtonContainer input[value=Cancel]").click(function () {
            //hide all tips 
            dialogs.createUserTips.hide();
            dialogs.SMSTips.hide();
            dialogs.FaxTips.hide();
            //rest SMS characters counter
            $("#SureVoIPExtensionSMSCharactersCount").text(160);
            $('.SureVoIPExtensionDialog').hide(); // Hide Any Dialog
            $('#SureVoIPExtensionDialogBackDiv').hide();
            //Clear fax body
            $('.SureVoIPExtensionFaxBody_FakeFile [type=text]').val('');
        });
    },
    attachSaveSettingsEvent: function () {
        $("#SureVoIPExtensionSaveSettings").click(function () {
            // Check for the Validations
            var bValid = true;
            bValid = bValid && dialogValidations.checkLength(dialogs.username, "username", 3, 16, dialogs.createUserTips);//Check the username length
            bValid = bValid && dialogValidations.checkLength(dialogs.password, "password", 5, 160, dialogs.createUserTips);//Check the password

            bValid = bValid && dialogValidations.checkRegexp(dialogs.username, /([0-9a-z_])+$/i, "Username may consist of a-z, 0-9, underscores.", dialogs.createUserTips);
            bValid = bValid && dialogValidations.checkNumber(dialogs.dialNumber, "From Number", dialogs.createUserTips);


            if (bValid) {
                dialogs.createUserTips.hide();
                // Set the settings values
                settings.update({
                    'username': dialogs.username.val(),
                    'password': dialogs.password.val(),
                    'smsname': dialogs.smsname.val(),
                    'dialNumber': dialogs.dialNumber.val(),
                    'faxNumber': dialogs.faxNumber.val()
                });
                // Send new settings to the background
                settings.sendToBackground();
                $('#SureVoIPExtensionDialog').hide();
                $('#SureVoIPExtensionDialogBackDiv').hide();
                dialogs.createUserTips.hide();
                if (PostSaveAction != null)
                    PostSaveAction();
            }
        });

    },
    attachSendSMSEvent: function () {
        $("#SureVoIPExtensionSendSMS").click(function () {
            var bValid = true;
            bValid = bValid && dialogValidations.checkLength(dialogs.SMSBody, "SMS body", 1, 160, dialogs.SMSTips);
            if (bValid) {
                dialogs.createUserTips.hide();
                dialogs.SMSTips.hide();
                dialogs.SMSCharactersCount.text('160');

                $("#SureVoIPExtensionSMSDialog").hide();
                $("#SureVoIPExtensionDialogBackDiv").hide();

                // Call the SMS function
                phoneManager.sms();

            }
        });
    },
    attachSendFaxEvent: function () {
        $("#SureVoIPExtensionSendFax").click(function () {
            // Check for the Validations
            var bValid = true;
            if (dialogs.FaxBody.val() == "") {
                bValid = false;
                alert("Please choose a file.");
            }

            if (bValid) {
                $("#SureVoIPExtensionFAXDialog").hide();
                dialogs.FaxTips.hide();
                $("#SureVoIPExtensionDialogBackDiv").hide();
                // Call the Fax function
                phoneManager.fax();
            }
        });
    }
};

var settings = {
    isReady: false,
    username: undefined,
    password: undefined,
    dialNumber: undefined,
    smsname: undefined,
    faxNumber: undefined,
    init: function () {
        this.readFromBackground();
    },
    update: function (newSettings) {
        this.username = newSettings.username;
        this.password = newSettings.password;
        this.dialNumber = newSettings.dialNumber;
        this.smsname = newSettings.smsname;
        this.faxNumber = newSettings.faxNumber;
        this.isReady = true;
    },
    // Send the settings to the background to be saved
    sendToBackground: function () {
        messageHandler.sendMessageToBackground(messageHandler.MESSAGES.SaveSettings, JSON.stringify(this, undefined));
    },
    // Read the settings from the background 
    readFromBackground: function () {
        messageHandler.sendMessageToBackground(messageHandler.MESSAGES.GetSettings);
    },
    // Fill the values in the fields
    fillInUI: function () {
        $("#SureVoIPExtensionUsername").val(this.username);
        $("#SureVoIPExtensionPassword").val(this.password);
        $("#SureVoIPExtensionSMSName").val(this.smsname);
        $("#SureVoIPExtensionDialNumber").val(this.dialNumber);
        $("#SureVoIPExtensionFaxNumber").val(this.faxNumber);
    }

};

var messageHandler = {
    // Messages from and to background
    MESSAGES: {
        GetSettings: 'SureVoIPExtension_GetSettings', // Page -> Background
        GetSettings_Response: 'SureVoIPExtension_GetSettings_Response', // Background -> Page
        SaveSettings: 'SureVoIPExtension_SaveSettings', // Page -> Background
        OpenSettingsDialog: 'SureVoIPExtension_OpenSettingsDialog', // Background -> Page
        DoServerRequest: 'SureVoIPExtension_DoServerRequest', // Page->Background
        AjaxSuccess: 'SureVoIPExtension_AjaxSuccess', // Background->Page
        AjaxError: 'SureVoIPExtension_AjaxError' // Background->Page
    },
    init: function () {
        //appAPI.message.addListener(this.handleMessageFromBackground);
        chrome.runtime.onMessage.addListener(this.handleMessageFromBackground);
    },
    // Send message to background with certain action and value
    sendMessageToBackground: function (action, value) {

//        appAPI.message.toBackground({
//            action: action,
//            value: value
//        });

        chrome.runtime.sendMessage({action: action, value: value}, function (response) {
            //console.log(response.farewell);
        });



    },
    // Receive a message from the background
    handleMessageFromBackground: function (msg) {
        log('Received Message: ', msg);
        switch (msg.action) {
            case messageHandler.MESSAGES.OpenSettingsDialog:
                dialogs.showSettings();
                break;
            case messageHandler.MESSAGES.GetSettings_Response:
                if (msg.value != undefined) {
                    settings.update(JSON.parse(msg.value));
                }
                break;
            case messageHandler.MESSAGES.AjaxSuccess:
                if (msg.value.status == 202) {
                    $(".SureVoIPExtensionLoadingDiv").css("background-image", "url('" + chrome.extension.getURL("images/RequestSent.png") + "')");
                    $(".SureVoIPExtensionLoadingDiv").fadeOut(3000, function () {
                        $(".SureVoIPExtensionLoadingDiv").css("background-image", "url('" + chrome.extension.getURL("images/SendingRequest.png") + "')");
                    });
                } else {
                    alert("SureVoIP \nServer responded with error code: " + msg.value.status);
                    $(".SureVoIPExtensionLoadingDiv").hide();
                }
                break;
            case messageHandler.MESSAGES.AjaxError:

                alert("SureVoIP \nError sending request to the server.\nError message: " + msg.value.statusText);
                $(".SureVoIPExtensionLoadingDiv").hide();
                break;
        }
    }
};

var serverRequest = {
    // Send message to background to make the ajax request
    send: function (url, jsonData) {
        var options = this.constructOptions(url, jsonData);
        messageHandler.sendMessageToBackground(messageHandler.MESSAGES.DoServerRequest, options);
    },
    // Construct options for the ajax request
    constructOptions: function (url, jsonData) {
        var options = {
            url: url,
            type: "POST",
            cache: false,
            dataType: "json"
        };
        if (jsonData) {
            options.data = JSON.stringify(jsonData, undefined);
            options.contentType = "application/json";
        }
        return options;
    },
    constructOptionsForFax: function (url, jsonData) {
        var options = {
            url: url,
            type: "POST",
            cache: false,
            dataType: "json",
            error: function (response) {
                alert("SureVoIP \nError sending request to the server.\nError message: " + response.statusText);
                $(".SureVoIPExtensionLoadingDiv").hide();
            },
            success: function (response) {
                if (response.status == 202) {
                    $(".SureVoIPExtensionLoadingDiv").css("background-image", "url('" + chrome.extension.getURL("images/RequestSent.png") + "')");
                    $(".SureVoIPExtensionLoadingDiv").fadeOut(3000, function () {
                        $(".SureVoIPExtensionLoadingDiv").css("background-image", "url('" + chrome.extension.getURL("images/SendingRequest.png") + "')");
                    });
                } else {
                    alert("SureVoIP \nServer responded with error code: " + response.status);
                    $(".SureVoIPExtensionLoadingDiv").hide();
                }
            }
        };
        if (jsonData) {
            options.data = JSON.stringify(jsonData, undefined);
            options.contentType = "application/json";
        }
        return options;
    },
    sendCall: function (jsonData) {
        this.send('https://api.surevoip.co.uk/calls', jsonData);
    },
    sendSMS: function (jsonData) {
        this.send('https://api.surevoip.co.uk/sms', jsonData);

    },
    sendFax: function (from, to) {

        $("#SureVoIPExtensionFAXToValue").val(to);
        $("#SureVoIPExtensionFaxFrom").val(from);
        // var options = this.constructOptions('https://api.surevoip.co.uk/faxes');
        var options = this.constructOptionsForFax('https://api.surevoip.co.uk/faxes');
        $('#SureVoIPExtensionFAXDialog').ajaxForm(options);
        $('#SureVoIPExtensionFAXDialog').submit();
    }
};

var phoneManager = {
    // Check for the username and password not to be empty
    checkUserNameAndPassword: function () {
        if (settings.username && settings.password)
            return true;

        alert("Please provide your Username and Password.");
        return false;
    },
    // Check for username and password first , if not empty check for the dial number
    checkBeforeCall: function () {
        if (!phoneManager.checkUserNameAndPassword())
            return false;

        if (!settings.dialNumber) {
            alert('Please enter your "From Number" in the Call Settings section.');
            return false;
        }

        return true;
    },
    // Check for username and password first , if not empty check for the From name
    checkBeforeSMS: function () {
        if (!phoneManager.checkUserNameAndPassword())
            return false;

        if (!settings.smsname) {
            alert('Please enter your "From Name" in the SMS Settings section.');
            return false;
        }

        return true;
    },
    // Check for username and password first , if not empty check for the From number
    checkBeforeFAX: function () {
        if (!phoneManager.checkUserNameAndPassword())
            return false;

        if (!settings.faxNumber) {
            alert('Please provide your "From Number" in the Fax Settings section.');
            return false;
        }

        return true;
    },
    // Make the checks for call , if the checks are passed then call the function "sendCall"
    call: function () {
        if (phoneManager.checkBeforeCall()) {
            $(".SureVoIPExtensionLoadingDiv").show();
            serverRequest.sendCall({
                to: phoneManager.formatNumber(hoveredNumber),
                from: phoneManager.formatNumber(settings.dialNumber),
                caller_id: phoneManager.formatNumber(settings.dialNumber)
            });
        } else {
            PostSaveAction = phoneManager.call;
            dialogs.showSettings();
        }
    },
    // Make the checks for SMS , if the checks are passed then call the function "sendSMS"
    sms: function () {
        if (phoneManager.checkBeforeSMS()) {
            $(".SureVoIPExtensionLoadingDiv").show();
            serverRequest.sendSMS({
                to: phoneManager.formatNumber(hoveredNumber),
                from: phoneManager.formatNumber(settings.smsname),
                message: dialogs.SMSBody.val()
            });
        } else {
            PostSaveAction = phoneManager.sms;
            dialogs.showSettings();
        }
    },
    // Make the checks for Fax , if the checks are passed then call the function "sendFax"
    fax: function () {

        if (phoneManager.checkBeforeFAX()) {
            $(".SureVoIPExtensionLoadingDiv").show();
            serverRequest.sendFax(phoneManager.formatNumberForFAX(settings.faxNumber), phoneManager.formatNumberForFAX(settings.faxNumber));

        } else {

            PostSaveAction = phoneManager.fax;
            dialogs.showSettings();
        }
    },
    // Remove all '+' , '-' , spaces , '(' , ')' , '.' . If number begins with '00' then they are removed . If number begins with '0' then it is replaced by '44'
    formatNumber: function (number) {

        // Replace +44 (0) with 44
        number = number.replace(/^\s*[+-/\.]*\s*44[ /\(]+0[ /\)]+/g, '44');

        // Remove all unwanted characters
        number = number.replace(/[+-/\s/\(/\)/\.]/g, '');

        // Remove international 00
        number = number.replace(/^00/, '');

        // Replace leading 0 with 44
        number = number.replace(/^0/, '44');

        return number;
    },
    // call format number then adds '00' to it
    formatNumberForFAX: function (number) {
        return '00' + this.formatNumber(number);
    }
};

var phoneNumberDetection = {
    // Phone number pattern to be detected
    phonePattern: /[\d+\(\)]{2,3}[\d\s.+\-\(\)]{5,20}[\d]{3,4}/g,
    // IP address pattern not to be detected
    IPAddressPattern: /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])[\.\-]){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/,
    init: function () {
        // Parse the document for phone numbers
        phoneNumberDetection.startDetection();
        setInterval(function () {
            // Keep parsing the document for new numbers every 3 seconds
            phoneNumberDetection.startDetection();
        }, 3000);
    },
    startDetection: function () {
        var $existingSureVoIPNumberLinks = $('.SureVoIPExtensionNumberLink');

        phoneNumberDetection.detectTextNodes($('body')[0]);

        log('Registered Hover * ', $existingSureVoIPNumberLinks.length + " -> " + $('.SureVoIPExtensionNumberLink').length);

        // On hovering a number set the showMenu flag and set the "hoveredNumber" with the hovered number
        $('.SureVoIPExtensionNumberLink').not($existingSureVoIPNumberLinks).hover(function () {
            log('hover over link ', $(this).text());
            showMenu = true;
            hoveredNumber = $(this).text();
            var popupContainer = attachDialog.menuPopup;
            popupContainer.css('left', $(this).offset().left);
            popupContainer.show();
            var textHeight = $(this).css('height');
            popupContainer.css('top', Math.max(0, $(this).offset().top + parseInt(textHeight.substring(0, textHeight.length - 2))));
        }, function () {
            // Set showMenu to false and hide the menu
            log('unhover link ', $(this).text());
            var parent = this;
            showMenu = false;
            setTimeout(function () {
                if (!showMenu) {
                    //$(parent).prev().hide();
                    $('#SureVoIPExtensionPopupContainer').hide();
                }
            }, 100);
        });
    },
    detectTextNodes: function (node) {

        if (node.nodeName == "SCRIPT")
            return;
        if (node.nodeName == "TEXTAREA")
            return;

        // Need to bypass elements we already processed. This is required since we do this every few seconds.
        if (node.classList && node.classList.contains('SureVoIPExtensionNumberLink'))
            return;

        if (node.id == 'SureVoIPExtensionDialog' || node.id == 'SureVoIPExtensionSMSDialog' || node.id == 'SureVoIPExtensionFAXDialog' || node.id == 'SureVoIPExtensionPopupContainer')
            return;

        if (node.nodeType == 3) {
            this.detectPhoneNumbers(node);
        } else {
            for (var i = 0, len = node.childNodes.length; i < len; ++i) {
                this.detectTextNodes(node.childNodes[i]);
            }
        }
    },
    detectPhoneNumbers: function (node) {

        var parent = node.parentNode;
        var originalText = node.nodeValue;
        var newText = originalText;
        var foundPhoneNumber = false;

        // Get the match of the phone pattern in the text if found
        var matches = originalText.match(this.phonePattern);
        if (!matches)
            return;

        // Remove the IP addresses from the matches and wrap a span around the phone numbers
        for (var j = matches.length - 1; j >= 0; j--) {
            if (matches[j].match(this.IPAddressPattern))
                continue;

            var matchIndexStart = originalText.lastIndexOf(matches[j]);
            var matchIndexEnd = matchIndexStart + matches[j].length;
            log('found match ', matchIndexStart, matchIndexEnd, matches[j]);
            newText = newText.substring(0, matchIndexStart) + '<span class="SureVoIPExtensionNumberLink">' + matches[j] + '</span>' + newText.substring(matchIndexEnd);
            originalText = originalText.substring(0, matchIndexStart);
            foundPhoneNumber = true;
        }
        // Removes the original text and put the new text instead of it
        if (foundPhoneNumber) {
            var newDiv = document.createElement("div");
            $(newDiv).addClass("SureVoIPExtensionNumberLinkContainer");
            $(newDiv).html(newText);
            parent.insertBefore(newDiv, node);
            $(node).remove();

        }
    }
};

function init() {
    //appAPI.resources.includeJS('jquery.form.js');
    //appAPI.resources.includeCSS('CustomCss.css');
    messageHandler.init();
    settings.init();
    dialogs.init();
    attachDialog.init();
    phoneNumberDetection.init();
    $("body").append('<div class="SureVoIPExtensionLoadingDiv" style="display:none;"></div>');
    $(".SureVoIPExtensionLoadingDiv").css({
        "background-image": "url('" + chrome.extension.getURL("images/SendingRequest.png") + " ')",
        "background-repeat": "no-repeat",
        "background-position": "50% 50%",
        "background-color": "rgba(102, 102, 102, 0.6)"
    });
    // $(".SureVoIPExtensionLoadingDiv").css("backgroud-repeat","no-repeat");
    // $(".SureVoIPExtensionLoadingDiv").css("backgroud-position","50% 50%");


}

init();

