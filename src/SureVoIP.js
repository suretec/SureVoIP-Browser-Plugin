// hoveredNumber is the number which the user hover on
let hoveredNumber = '';
// PostSaveAction is a function that perform the user action
let PostSaveAction = null;
// showMenuis a flag to show menu when it is true
let showMenu = false;

// class for dialog validations
const dialogValidations = {
    //updates the error messages of the dialogs
    updateTips: function (t, tips) {
        tips.text(t).addClass('SureVoIPExtensionTipsHighLight');
        tips.show();
        setTimeout(function () {
            tips.removeClass('SureVoIPExtensionTipsHighLight', 5000);
        }, 500);
    },
    //checks the length of the given textbox to be between the 2 given values and call updateTips if out of range
    checkLength: function (o, n, min, max, tips) {
        if (o.val().length > max || o.val().length < min) {
            this.updateTips(`Length of the ${n} must be between ${min} and ${max} characters.`, tips);
            return false;
        } else {
            return true;
        }
    },
    //checks the value of the given textbox to be only numbers without characters and call updateTips if not number 
    checkNumber: function (o, n, tips) {
        if (o.val() && isNaN(o.val())) {
            this.updateTips(`${n} is not a valid number.`, tips);
            return false;
        } else {
            return true;
        }
    },
    //checks the value of the given textbox to match the regular expression and call updateTips if not matching
    checkRegexp: function (o, regexp, n, tips) {
        if (!(regexp.test(o.val()))) {
            this.updateTips(n, tips);
            return false;
        } else {
            return true;
        }
    }
};

const dialogs = {
    username: undefined,
    password: undefined,
    dialNumber: undefined,
    smsname: undefined,
    allCreateUserFields: undefined,
    createUserTips: undefined,
    SMSBody: undefined,
    SMSTips: undefined,
    SMSCharactersCount: undefined,
    init: function () {
        console.log(`dialogs.init:`);
        this.constructSettings();
        this.constructSMS();
        this.constructMenu();
        this.createFadeDiv();

    },
    createFadeDiv: function () {
        $('body').append('<div id="SureVoIPExtensionDialogBackDiv" class="SureVoIPExtensionFadeDiv"> </div>');
    },
    // construct HTML of the settings dialog and add it to the page
    constructSettings: function () {
        const html = `
        <div id="SureVoIPExtensionDialog" style="display:none;" class="SureVoIPExtensionDialog">
            <div class="SureVoIPExtensionDialogTitleDiv"><b>SureVoIP</b> Settings</div>
            <div class="SureVoIPExtensionDialogHeader">User Account</div>
            <div class="SureVoIPExtensionDialogAttribute" >
            <label for="SureVoIPExtensionUsername" class="SureVoIPExtensionDialogAttributeLabel">Username</label>
                <input type="text" name="SureVoIPExtensionUsername" id="SureVoIPExtensionUsername" />
            </div>
            <div class="SureVoIPExtensionDialogAttribute" >
                <label for="SureVoIPExtensionPassword" class="SureVoIPExtensionDialogAttributeLabel">Password</label>
                <input type="password" name="SureVoIPExtensionPassword" id="SureVoIPExtensionPassword" value=""  />
            </div>
            <div class="SureVoIPExtensionDialogHeader">Call Settings</div>
            <div class="SureVoIPExtensionDialogAttribute" >
                <label for="SureVoIPExtensionDialNumber" class="SureVoIPExtensionDialogAttributeLabel">From Number</label>
                <input title="Your direct dial number" type="text" name="SureVoIPExtensionDialNumber" id="SureVoIPExtensionDialNumber" value=""  />
            </div>
            <div class="SureVoIPExtensionDialogHeader">SMS Settings</div>
            <div class="SureVoIPExtensionDialogAttribute" >
                <label for="SureVoIPExtensionSMSName" class="SureVoIPExtensionDialogAttributeLabel">From Name</label>
                <input title="Mobile number or company name" type="text" name="SureVoIPExtensionSMSName" id="SureVoIPExtensionSMSName" value=""  />
            </div>
            <p class="SureVoIPExtensionDialogAttribute SureVoIPExtensionValidateTips"></p>
            <div class="SureVoIPExtensionDialogButtonContainer">
                <input type="button" value="Save" class="SureVoIPExtensionDialogButton" id="SureVoIPExtensionSaveSettings">'
                <input type="button" value="Cancel" class="SureVoIPExtensionDialogButton">
            </div>
        </div>`;
        $('body').append(html);
        dialogs.username = $('#SureVoIPExtensionUsername');
        dialogs.password = $('#SureVoIPExtensionPassword');
        dialogs.dialNumber = $('#SureVoIPExtensionDialNumber');
        dialogs.smsname = $('#SureVoIPExtensionSMSName');
        dialogs.allCreateUserFields = $([]).add(dialogs.username).add(dialogs.password).add(dialogs.dialNumber).add(dialogs.smsname);
        dialogs.createUserTips = $('.SureVoIPExtensionValidateTips');
    },
    // construct HTML of the SMS dialog and add it to the page
    constructSMS: function () {
        const tempString = `
        <div id="SureVoIPExtensionSMSDialog" style="display:none;" class="SureVoIPExtensionDialog">
        	<div class="SureVoIPExtensionDialogTitleDiv"><b>SureVoIP</b> SMS</div>
        	<div class="SureVoIPExtensionDialogAttribute" >
        		<label class="SureVoIPExtensionSMSLabel">To: </label>
        		<label id="SureVoIPExtensionSMSTo" class="SureVoIPExtensionSMSLabel"></label>
        	</div>
        	<div class="SureVoIPExtensionDialogAttribute" >
        		<label class="SureVoIPExtensionSMSLabel" for="SureVoIPExtensionSMSBody">Message body</label>
        		<textarea name="SureVoIPExtensionSMSBody" id="SureVoIPExtensionSMSBody"/></textarea>
        	</div>
        	<div class="SureVoIPExtensionSMSCharactersCountAttribute" >
        		<label class="SureVoIPExtensionSMSLabel">Characters count left:</label>
        		<label id="SureVoIPExtensionSMSCharactersCount" class="SureVoIPExtensionSMSLabel">160</label>
        	</div>
        	<p class="SureVoIPExtensionDialogAttribute SureVoIPExtensionValidateSMSTips"></p>
            <div class="SureVoIPExtensionDialogButtonContainer">
                <input type="button" value="Send" class="SureVoIPExtensionDialogButton" id="SureVoIPExtensionSendSMS"/>
                <input type="button" value="Cancel" class="SureVoIPExtensionDialogButton"/>
            </div>
        </div>`;
        $('body').append(tempString);
        dialogs.SMSBody = $('#SureVoIPExtensionSMSBody');
        dialogs.SMSTips = $('.SureVoIPExtensionValidateSMSTips');
        dialogs.SMSCharactersCount = $('#SureVoIPExtensionSMSCharactersCount');
        dialogs.SMSBodyAttachEvent();
    },
    // construct HTML of the Menu and add it to the page
    constructMenu: function () {
        const html = `
        <div id="SureVoIPExtensionPopupContainer" style="display:none;">
            <div id="SureVoIPExtensionImgContainer">
                <img id="SureVoIPExtensionImg"  src="${chrome.extension.getURL('images/surevoip-logo-white.svg')}"/>
            </div>
            <a id="SureVoIPExtensionCallBtn" href="javascript:void(0);">
                <div class="SureVoIPExtensionMenuItemContainer">
                    <img src="${chrome.extension.getURL('images/phone-alt.svg')}" height="18px"/> Call
                </div>
            </a>
            <a id="SureVoIPExtensionSMSBtn" href="javascript:void(0);">
                <div class="SureVoIPExtensionMenuItemContainer">
                    <img src="${chrome.extension.getURL('images/comments.svg')}" height="18px"/> Text
                </div>
            </a>
            <a id="SureVoIPExtensionSettingsBtn" href="javascript:void(0);">
                <div class="SureVoIPExtensionMenuItemContainer SureVoIPExtensionSettingsMenuItemContainer">
                    <img src="${chrome.extension.getURL('images/cogs.svg')}" height="18px"/> Settings
                </div>
            </a>
        </div>`;
        $('body').append(html);
        const popupContainer = document.getElementById('SureVoIPExtensionPopupContainer');

        // on menu hover set the showMenu flag and on mouse leave set the flag to false and hide the menu
        $('#SureVoIPExtensionPopupContainer').hover(function () {
            console.log('hover over menu');
            showMenu = true;
            return false;
        }, function () {
            console.log('unhover menu');
            showMenu = false;
            setTimeout(function () {
                !showMenu && $('#SureVoIPExtensionPopupContainer').hide();
            }, 50);
        });

        $('#SureVoIPExtensionCallBtn').click(function () {
            phoneManager.call();
        });
        $('#SureVoIPExtensionSMSBtn').click(function () {
            dialogs.SMSBody.val('');
            $('#SureVoIPExtensionSMSTo').text(hoveredNumber);

            dialogs.showDialog(attachDialog.SMSDialog);
        });
        $('#SureVoIPExtensionSettingsBtn').click(function () {
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
        console.log(`showSettings: settings.isReady=${settings.isReady}`);

        this.showDialog(attachDialog.settingDialog);
        if (!settings.isReady)
            return;
        settings.fillInUI();
    },
    // Attach an event to the sms body to display the character count on every user action
    SMSBodyAttachEvent: function () {
        dialogs.SMSBody.on('input propertychange', function () {
            dialogs.SMSCharactersCount.text(160 - dialogs.SMSBody.val().length);
            if (parseInt(dialogs.SMSCharactersCount.text()) < 0)
                dialogs.SMSCharactersCount.css('color', 'red');
            else
                dialogs.SMSCharactersCount.css('color', 'black');
        });
    }



};

// Attaching the dialogs to their divs
const attachDialog = {
    settingDialog: undefined,
    SMSDialog: undefined,
    menuPopup: undefined,
    init: function () {
        this.settingDialog = $('#SureVoIPExtensionDialog');
        this.SMSDialog = $('#SureVoIPExtensionSMSDialog');
        this.menuPopup = $('#SureVoIPExtensionPopupContainer');
        this.attachCancelEvent();
        this.attachSaveSettingsEvent();
        this.attachSendSMSEvent();
    },
    attachCancelEvent: function () {
        $('.SureVoIPExtensionDialogButtonContainer input[value=Cancel]').click(function () {
            //hide all tips 
            dialogs.createUserTips.hide();
            dialogs.SMSTips.hide();
            //rest SMS characters counter
            $('#SureVoIPExtensionSMSCharactersCount').text(160);
            $('.SureVoIPExtensionDialog').hide(); // Hide Any Dialog
            $('#SureVoIPExtensionDialogBackDiv').hide();
        });
    },
    attachSaveSettingsEvent: function () {
        $('#SureVoIPExtensionSaveSettings').click(function () {
            // Check for the Validations
            const bValid = 
                dialogValidations.checkLength(dialogs.username, 'username', 3, 16, dialogs.createUserTips) &&
                dialogValidations.checkLength(dialogs.password, 'password', 5, 160, dialogs.createUserTips) &&
                dialogValidations.checkRegexp(dialogs.username, /([0-9a-z_])+$/i, 'Username may consist of a-z, 0-9, underscores.', dialogs.createUserTips) &&
                dialogValidations.checkNumber(dialogs.dialNumber, 'From Number', dialogs.createUserTips);
            if (!bValid)
                return;
            dialogs.createUserTips.hide();
            // Update the settings values
            settings.update({
                'username': dialogs.username.val(),
                'password': dialogs.password.val(),
                'smsname': dialogs.smsname.val(),
                'dialNumber': dialogs.dialNumber.val()
            });
            $('#SureVoIPExtensionDialog').hide();
            $('#SureVoIPExtensionDialogBackDiv').hide();
            dialogs.createUserTips.hide();
            if (PostSaveAction != null)
                PostSaveAction();
        });
    },
    attachSendSMSEvent: function () {
        $('#SureVoIPExtensionSendSMS').click(function () {
            const bValid = dialogValidations.checkLength(dialogs.SMSBody, 'SMS body', 1, 160, dialogs.SMSTips);
            if (!bValid)
                return;
            dialogs.createUserTips.hide();
            dialogs.SMSTips.hide();
            dialogs.SMSCharactersCount.text('160');

            $('#SureVoIPExtensionSMSDialog').hide();
            $('#SureVoIPExtensionDialogBackDiv').hide();

            // Call the SMS function
            phoneManager.sms();
        });
    }
};

const settings = {
    isReady: false,
    data: {
        username: '',
        password: '',
        dialNumber: '',
        smsname: ''
    },
    init: function () {
        chrome.storage.local.get('settings', function (data) {
            console.log(`storage.local.get: data=${JSON.stringify(data)}`);
            settings.sync(data.settings);
        });
        chrome.storage.onChanged.addListener(function(changes, area) {
            if (area !== 'local' || !changes.settings) return;
            console.log(`storage.onChanged: changes=${JSON.stringify(changes)}`);
            settings.sync(changes.settings.newValue);
        });
    },
    sync: function (data) {
        this.data = Object.assign({}, this.data, data);
        console.log(`settings.sync: this.data=${JSON.stringify(this.data)}`);
        for (let key in this.data) {
            this[key] = this.data[key];
        }
        this.isReady = true;
    },
    update: function (data) {
        if (!data)
            return;
        console.log(`settings.update: data=${JSON.stringify(data)}`);
        chrome.storage.local.set({'settings': Object.assign({}, this.data, data)});
    },
    // Fill the values in the fields
    fillInUI: function () {
        console.log(`settings.fillInUI: username=${this.username}`);
        $('#SureVoIPExtensionUsername').val(this.username);
        $('#SureVoIPExtensionPassword').val(this.password);
        $('#SureVoIPExtensionSMSName').val(this.smsname);
        $('#SureVoIPExtensionDialNumber').val(this.dialNumber);
    }

};

const messageHandler = {
    // Messages from and to background
    MESSAGES: {
        OpenSettingsDialog: 'SureVoIPExtension_OpenSettingsDialog', // Background -> Page
        DoServerRequest: 'SureVoIPExtension_DoServerRequest' // Page->Background
    },
    init: function () {
        chrome.runtime.onMessage.addListener(this.handleMessageFromBackground);
    },
    // Send message to background with certain action and value
    sendMessageToBackground: function (action, value, callback) {
        console.log(`sendMessageToBackground: action=${action}; value=${value}`);
        chrome.runtime.sendMessage({action: action, value: value}, function (response) {
            console.log(`sendMessageToBackground-response: response=${JSON.stringify(response)}`);
            callback(response);
        });
    },
    // Receive a message from the background
    handleMessageFromBackground: function (msg) {
        console.log(`Received Message: msg=${msg}`);
        switch (msg.action) {
            case messageHandler.MESSAGES.OpenSettingsDialog:
                dialogs.showSettings();
                break;
        }
    }
};

const serverRequest = {
    // Send message to background to make the ajax request
    send: function (url, jsonData) {
        const options = this.constructOptions(url, jsonData);
        messageHandler.sendMessageToBackground(messageHandler.MESSAGES.DoServerRequest, options, function(response) {
            if (response.ok) {
                if (response.data == 202) {
                    $('.SureVoIPExtensionLoadingDiv').css('background-image', `url("${chrome.extension.getURL('images/RequestSent.png')}")`);
                    $('.SureVoIPExtensionLoadingDiv').fadeOut(3000, function () {
                        $('.SureVoIPExtensionLoadingDiv').css('background-image', `url("${chrome.extension.getURL('images/SendingRequest.png')}")`);
                    });
                } else {
                    alert(`SureVoIP \nServer responded with error code: ${response.data}`);
                    $('.SureVoIPExtensionLoadingDiv').hide();
                }
            }
            else {
                alert(`SureVoIP \nError sending request to the server.\nError message: ${response.data}`);
                $('.SureVoIPExtensionLoadingDiv').hide();
            }
        });
    },
    // Construct options for the ajax request
    constructOptions: function (url, jsonData) {
        const options = {
            url: url,
            type: 'POST',
            cache: false,
            dataType: 'json'
        };
        if (jsonData) {
            options.data = JSON.stringify(jsonData, undefined);
            options.contentType = 'application/json';
        }
        return options;
    },
    sendCall: function (jsonData) {
        this.send('https://api.surevoip.co.uk/calls', jsonData);
    },
    sendSMS: function (jsonData) {
        this.send('https://api.surevoip.co.uk/sms', jsonData);

    },
};

const phoneManager = {
    // Check for the username and password not to be empty
    checkUserNameAndPassword: function () {
        if (settings.username && settings.password)
            return true;

        alert('Please provide your Username and Password.');
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
    // Make the checks for call , if the checks are passed then call the function "sendCall"
    call: function () {
        if (phoneManager.checkBeforeCall()) {
            $('.SureVoIPExtensionLoadingDiv').show();
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
            $('.SureVoIPExtensionLoadingDiv').show();
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
    }
};

const phoneNumberDetection = {
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
        const $existingSureVoIPNumberLinks = $('.SureVoIPExtensionNumberLink');

        phoneNumberDetection.detectTextNodes($('body')[0]);

        console.log(`Registered Hover * ${$existingSureVoIPNumberLinks.length} -> ${$('.SureVoIPExtensionNumberLink').length}`);

        // On hovering a number set the showMenu flag and set the "hoveredNumber" with the hovered number
        $('.SureVoIPExtensionNumberLink').not($existingSureVoIPNumberLinks).hover(function () {
            console.log(`hover over link ${$(this).text()}`);
            showMenu = true;
            hoveredNumber = $(this).text();
            const popupContainer = attachDialog.menuPopup;
            popupContainer.css('left', $(this).offset().left);
            popupContainer.show();
            const textHeight = $(this).css('height');
            popupContainer.css('top', Math.max(0, $(this).offset().top + parseInt(textHeight.substring(0, textHeight.length - 2))));
        }, function () {
            // Set showMenu to false and hide the menu
            console.log(`unhover link ${$(this).text()}`);
            showMenu = false;
            setTimeout(() => {
                if (!showMenu) {
                    //$(this).prev().hide();
                    $('#SureVoIPExtensionPopupContainer').hide();
                }
            }, 100);
        });
    },
    detectTextNodes: function (node) {
        if (['SCRIPT', 'STYLE', 'TEXTAREA'].indexOf(node.nodeName) > -1)
            return;

        // Need to bypass elements we already processed. This is required since we do this every few seconds.
        if (node.classList && node.classList.contains('SureVoIPExtensionNumberLink'))
            return;

        if (node.id == 'SureVoIPExtensionDialog' || node.id == 'SureVoIPExtensionSMSDialog' || node.id == 'SureVoIPExtensionPopupContainer')
            return;

        if (node.nodeType == 3) {
            this.detectPhoneNumbers(node);
        } else {
            node.childNodes.forEach(child => {
                this.detectTextNodes(child);
            })
        }
    },
    detectPhoneNumbers: function (node) {
        const parent = node.parentNode;
        let originalText = node.nodeValue;
        let newText = originalText;
        let foundPhoneNumber = false;

        // Get the match of the phone pattern in the text if found
        const matches = originalText.match(this.phonePattern);
        if (!matches)
            return;

        // Remove the IP addresses from the matches and wrap a span around the phone numbers
        for (let j = matches.length - 1; j >= 0; j--) {
            if (matches[j].match(this.IPAddressPattern))
                continue;

            const matchIndexStart = originalText.lastIndexOf(matches[j]);
            const matchIndexEnd = matchIndexStart + matches[j].length;
            //console.log(`found match: originalText=${originalText}; j=${j}; matchIndexStart=${matchIndexStart}; matchIndexEnd=${matchIndexEnd}; matches[j]=${matches[j]}`);
            newText = newText.substring(0, matchIndexStart) + '<span class="SureVoIPExtensionNumberLink">' + matches[j] + '</span>' + newText.substring(matchIndexEnd);
            originalText = originalText.substring(0, matchIndexStart);
            foundPhoneNumber = true;
        }
        // Removes the original text and put the new text instead of it
        if (!foundPhoneNumber)
            return;
        const newDiv = document.createElement('div');
        $(newDiv).addClass('SureVoIPExtensionNumberLinkContainer');
        $(newDiv).html(newText);
        parent.insertBefore(newDiv, node);
        $(node).remove();
    }
};

function init() {
    messageHandler.init();
    settings.init();
    dialogs.init();
    attachDialog.init();
    phoneNumberDetection.init();
    $('body').append('<div class="SureVoIPExtensionLoadingDiv" style="display:none;"></div>');
    $('.SureVoIPExtensionLoadingDiv').css({
        'background-image': `url("${chrome.extension.getURL('images/SendingRequest.png')}")`,
        'background-repeat': 'no-repeat',
        'background-position': '50% 50%',
        'background-color': 'rgba(102, 102, 102, 0.6)'
    });
}

init();

