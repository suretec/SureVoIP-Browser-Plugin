// When the user clicks the browser button
chrome.browserAction.onClicked.addListener(tab => {
    console.log(`onClicked: tab=${JSON.stringify(tab)}`);
    chrome.tabs.sendMessage(tab.id, {action:'SureVoIPExtension_OpenSettingsDialog'});
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log(`onMessage: msg=${JSON.stringify(msg)}`);
    const {action, data} = msg;
    switch (action) {
        // Make the json request
        case 'SureVoIPExtension_DoServerRequest':
            chrome.storage.local.get('settings', storage => {
                const { settings } = storage;
                $.support.cors = true;
                // make encode64 before sending the request
                data.beforeSend = xhr => {
                    xhr.setRequestHeader("Authorization", "Basic " + encodingHelper.encode64(settings.username + ":" + settings.password));
                };
                // callback with success message
                data.success = (data, textStatus, xhr) => {
                    sendResponse({ok: true, status: xhr.status});
                };
                // callback with error message
                data.error = (xhr, textStatus, thrownError) => {
                    sendResponse({ok: false, status: xhr.status});
                };
                $.ajax(data);
                        
            });
            return true;
        default:
    }
});


// Class to encode the string to "encode64"
const encodingHelper = {
    keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    StringMaker: function() {
        this.str = "";
        this.length = 0;
        this.append = s => {
            this.str += s;
            this.length += s.length;
        }
        this.prepend = s => {
            this.str = s + this.str;
            this.length += s.length;
        }
        this.toString = () => {
            return this.str;
        }
    },
    encode64: function(input) {
        const output = new this.StringMaker();
        let chr1, chr2, chr3;
        let enc1, enc2, enc3, enc4;
        let i = 0;

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
}
