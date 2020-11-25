/**
 * Copyright (c) 2012-2020, Suretec Systems Ltd. <http://www.suretecsystems.com/>
 * 
 * This file is part of the SureVoIP Browser Plugin
 * 
 * The SureVoIP Browser Plugin is free software: you can redistribute it
 * and/or modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * 
 * The SureVoIP Browser Plugin is distributed in the hope that it will be
 * useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with the SureVoIP Browser Plugin.  If not, see
 * <http://www.gnu.org/licenses/>.
 */

'use strict';

// When the user clicks the browser button
chrome.browserAction.onClicked.addListener(function (tab) {
    console.log(("onClicked: tab=" + (JSON.stringify(tab))));
    chrome.tabs.sendMessage(tab.id, {action:'SureVoIPExtension_OpenSettingsDialog'});
});

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    console.log(("onMessage: msg=" + (JSON.stringify(msg))));
    switch (msg.action) {
        // Make the json request
        case 'SureVoIPExtension_DoServerRequest':
            chrome.storage.local.get('settings', function (storage) {
                var settings = storage.settings;
                $.support.cors = true;
                // make encode64 before sending the request
                msg.value.beforeSend = function (xhr) {
                    xhr.setRequestHeader("Authorization", "Basic " + encodingHelper.encode64(settings.username + ":" + settings.password));
                };
                // callback with success message
                msg.value.success = function (data, textStatus, jqXHR) {
                    sendResponse({ok: true, value: jqXHR.status});
                };
                // callback with error message
                msg.value.error = function (xhr, ajaxOptions, thrownError) {
                    sendResponse({ok: false, value: xhr.statusText});
                };
                $.ajax(msg.value);
                        
            });
            return true;
    }
});


// Class to encode the string to "encode64"
var encodingHelper = {
    keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    StringMaker: function() {
        var this$1 = this;

        this.str = "";
        this.length = 0;
        this.append = function (s) {
            this$1.str += s;
            this$1.length += s.length;
        };
        this.prepend = function (s) {
            this$1.str = s + this$1.str;
            this$1.length += s.length;
        };
        this.toString = function () {
            return this$1.str;
        };
    },
    encode64: function(input) {
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

            output.append(
                this.keyStr.charAt(enc1) + this.keyStr.charAt(enc2) +
                this.keyStr.charAt(enc3) + this.keyStr.charAt(enc4)
            );
        }
        return output.toString();
    }
};
