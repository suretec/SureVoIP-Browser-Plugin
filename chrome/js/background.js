/************************************************************************************
 Copyright (c) 2016, Suretec Systems Ltd. <http://www.suretecsystems.com/>
 
 This file is part of the SureVoIP Browser Plugin
 
 The SureVoIP Browser Plugin is free software: you can redistribute it 
 and/or modify it under the terms of the GNU General Public License as 
 published by the Free Software Foundation, either version 3 of the 
 License, or (at your option) any later version.
 
 The SureVoIP Browser Plugin is distributed in the hope that it will be 
 useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with the SureVoIP Browser Plugin.  If not, see 
 <http://www.gnu.org/licenses/>.
 *************************************************************************************/
var XHR;
var JQXHR;

   // When the user clicks the browser button
    chrome.browserAction.onClicked.addListener(function (tab) {
        chrome.tabs.sendMessage(tab.id,{action:'SureVoIPExtension_OpenSettingsDialog'},function(response){});
        console.log(tab);

    });

function sendMessageToAllTabs(action , msg){
    chrome.tabs.query({}, function(tabs) {
      var message = {action: action,value:msg};
      for (var i=0; i<tabs.length; ++i) {
         chrome.tabs.sendMessage(tabs[i].id, message);
     }
    });
}


    chrome.runtime.onMessage.addListener(
      function(msg, sender, sendResponse) {
        switch (msg.action) {
            // Save the settings in the database and send them to all tabs to be updated
            case 'SureVoIPExtension_SaveSettings':
                chrome.storage.local.set({"settings": msg.value},function(){});
                sendMessageToAllTabs('SureVoIPExtension_GetSettings_Response',msg.value);
                break;
                // Get the settings from the database and send them to all tabs to be updated
            case 'SureVoIPExtension_GetSettings':
                chrome.storage.local.get('settings', function (storage) {
			sendMessageToAllTabs('SureVoIPExtension_GetSettings_Response',storage.settings);
		});
              
                 break;
                // Make the json request
            case 'SureVoIPExtension_DoServerRequest':
                 chrome.storage.local.get('settings', function (storage) {
                    var settings = JSON.parse(storage.settings);
                    //sendMessageToAllTabs('SureVoIPExtension_GetSettings',storage.settings);
                    $.support.cors = true;
                    // make encode64 before sending the request
                     msg.value.beforeSend = function (xhr) {
                    xhr.setRequestHeader("Authorization", "Basic " + encodingHelper.encode64(settings.username + ":" + settings.password));
                };
                // Send succes message to all tabs
                msg.value.success = function (data, textStatus, jqXHR) {
                   // sendMessageToAllTabs('SureVoIPExtension_AjaxSuccess',jqXHR);
                   JQXHR = jqXHR
                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                        var message = {action: 'SureVoIPExtension_AjaxSuccess',value:JQXHR};
                       chrome.tabs.sendMessage(tabs[0].id, message, function(response){});
                    });

                };
                // Send error message to all tabs
                msg.value.error = function (xhr, ajaxOptions, thrownError) {
                 //sendMessageToAllTabs('SureVoIPExtension_AjaxError',xhr);
                     XHR  = xhr;
                  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                   var message = {action: 'SureVoIPExtension_AjaxError',value:XHR};
                       chrome.tabs.sendMessage(tabs[0].id, message, function(response){});
                    });
                };
                $.ajax(msg.value);
                        
            });
                   break;
        }
      });


// Class to encode the string to "encode64"
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
