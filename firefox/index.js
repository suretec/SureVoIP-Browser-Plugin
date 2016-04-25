
var self = require('sdk/self');
var tabs = require('sdk/tabs');
var tabsUtil = require('sdk/tabs/utils');
var buttons = require('sdk/ui/button/action');
var pageMod = require("sdk/page-mod");
var logoImgUrl = self.data.url("SureVoIP.jpg");
var simpleStorage = require("sdk/simple-storage");
var Request = require("sdk/request").Request;
var Buttons = require('sdk/ui/button/action');
//var workers = require("sdk/content/worker");

//var messaginAPI = require('messaging');

var myTabs = {};
var OpenedTabsPorts = [];


var MESSAGES = {
    GetSettings: 'SureVoIPExtension_GetSettings', // Page -> Background
    GetSettings_Response: 'SureVoIPExtension_GetSettings_Response', // Background -> Page
    SaveSettings: 'SureVoIPExtension_SaveSettings', // Page -> Background
    OpenSettingsDialog: 'SureVoIPExtension_OpenSettingsDialog', // Background -> Page
    DoServerRequest: 'SureVoIPExtension_DoServerRequest', // Page->Background
    AjaxSuccess: 'SureVoIPExtension_AjaxSuccess', // Background->Page
    AjaxError: 'SureVoIPExtension_AjaxError', // Background->Page
    SendMessageToConetnt: 'SureVoIPExtension_SendMessageToContent'
};
//function createButton() {
    // button for the URL bar
    //return 
    buttons.ActionButton({
        id: 'surevoip',
        label: 'SureVoIP',
        icon: {
            32: "./BrowserButton.png"
        },
        onClick: function handleClick(state) {
            var worker = myTabs[tabs.activeTab.id];
            worker.port.emit(MESSAGES.OpenSettingsDialog, null);
        }
    });
//}

var encodingHelper = {
    keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
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
    encode64: function (input) {
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
var button = null;


pageMod.PageMod({
    include: "*",
	contentScriptWhen: "ready", // Apply when DOM is ready. Don't wait for JS, CSS and images
    contentStyleFile: "./CustomCss.css",
    contentScriptFile: ["./jquery-1.11.1.min.js", "./jquery.form.js", "./SureVoip.js"],
    contentScriptOptions: {
        logoUrl: self.data.url("SureVoIP.jpg"),
        SendingRequestImgUrl: self.data.url("SendingRequest.png"),
        RequestSentImgUrl: self.data.url("RequestSent.png"),
    },
	attachTo: ["existing", "top"], // Apply to existing tabs, and not to iFrames
    onAttach: function (worker) {
        var tab = worker.tab;
        var tabId = tab.id;
        OpenedTabsPorts.push(worker.port);
        worker.on('detach', function () {
            var index = OpenedTabsPorts.indexOf(worker.port);
            if (index !== -1)
                OpenedTabsPorts.splice(index, 1);
        });
        worker.port.on(MESSAGES.GetSettings, function (value) {
            //simpleStorage.storage.settings = value;
           // console.log(MESSAGES.GetSettings + ": " + value);
            var settings = simpleStorage.storage.settings;
           // console.log("Sending Settings: " + settings);
            worker.port.emit(MESSAGES.GetSettings_Response, settings);
        });
        worker.port.on(MESSAGES.SaveSettings, function (value) {
            //console.log("Settings Recieved: " + value);
            simpleStorage.storage.settings = value;
            //console.log("Settings Saved");

            for (var i = 0; i < OpenedTabsPorts.length; i++) {
                OpenedTabsPorts[i].emit(MESSAGES.GetSettings_Response, simpleStorage.storage.settings);
            }

        });
        worker.port.on(MESSAGES.DoServerRequest, function (msg) {

            var settings = JSON.parse(simpleStorage.storage.settings);
            var serverRequest = Request({
                url: msg.url,
                content: msg.data,
                contentType: msg.contentType,
                headers: {cache: msg.cache, dataType: msg.dataType,'Authorization':"Basic " + encodingHelper.encode64(settings.username + ":" + settings.password)},
                onComplete: function (response) {
        
                   // console.log("Server Response" + response);
                    var serverResponse = JSON.stringify(response)
                    serverResponse = {status: response.status, statusText: response.statusText}
                    if (response.status != 202) {
                        //Send message to the active tab with message MESSAGES.AjaxError
                        //var worker = tabs.activeTab;
                        worker.port.emit(MESSAGES.AjaxError, serverResponse);
                       // console.log("Server Response:" + serverResponse);
                    }
                    else {
                        //Send message to the active tab with message MESSAGES.AjaxSuccess
                        // var worker = tabs.activeTab;
                        worker.port.emit(MESSAGES.AjaxSuccess, serverResponse);
                      //  console.log("Server Response:" + serverResponse);
                    }
                }
            });
            serverRequest.post();
        });
//        var tab = worker.tab;
//       // if (!button) {
//            button = createButton();
//       // }
//
//        button.state(tab, {
//            disable: false,
//            icon: {32: './BrowserButton.png'}
//        });
        myTabs[tabId] = worker;
    }
});
