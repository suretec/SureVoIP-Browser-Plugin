const actionApi = chrome[process.env.CHROME? 'action' : 'browserAction'];

// When the user clicks the browser button
actionApi.onClicked.addListener(tab => {
    console.log(`onClicked: tab=${JSON.stringify(tab)}`);
    chrome.tabs.sendMessage(tab.id, {action:'SureVoIPExtension_OpenSettingsDialog'});
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log(`onMessage: msg=${JSON.stringify(msg)}`);
    const {action, data} = msg;
    switch (action) {
        case 'SureVoIPExtension_DoServerRequest':
            serverRequest(data, sendResponse);
            return true;
        default:
    }
});

const baseUrl = 'https://api.surevoip.co.uk/';

const serverRequest = (data, sendResponse) => {
    chrome.storage.local.get('settings', storage => {
        const { settings } = storage;
        const {url, payload} = data;
        fetch(baseUrl + url, {
            method: "POST",
            headers: {
                'Authorization': "Basic " + encodingHelper.encode64(settings.username + ":" + settings.password),
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'omit',
            body: JSON.stringify(payload)
        })
        .then(response => {
            sendResponse({ok: response.ok, status: response.status});
        })
        .catch(error => {
            sendResponse({ok: false, status: error});
        });
    });
};

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
