//Select the slider etc.
var sliderOne = document.querySelector("#sliderOne");
var whiteListButton = document.querySelector("#whiteListMeNow");
var options = document.querySelector("#whitelistedDomainsPage");
whiteListButton.addEventListener("click", whitelist, false);
sliderOne.addEventListener("click", save, false);
options.addEventListener("click", goToOptions, false);
evaluateButton();

function goToOptions() {
    chrome.runtime.openOptionsPage();
}

//Save function that activates when the slider is clicked
function save(e) {
    chrome.storage.sync.set({
        onOff: sliderOne.checked
    }, function () {
        chrome.runtime.sendMessage(sliderOne.checked);
        evaluateButton();
    });
}

//Updates the slider based on storageData
function evaluateButton() {
    chrome.tabs.query({
        currentWindow: true,
        active: true
    }, function (info) {
        try {
            var url = info[0].url;
            var tabURL = new URL(url).hostname.replace(/(www.)/gi, "");
        } catch {}

        chrome.storage.sync.get(function (result) {

            if (result.onOff === true) {
                sliderOne.checked = true;
                chrome.browserAction.setIcon({
                    path: "../images/128.png"
                });
            }
            if (result.onOff == false) {
                sliderOne.checked = false;
                chrome.browserAction.setIcon({
                    path: "../images/128_2.png"
                });
            }
            if (result["whiteList"][tabURL]) {
                document.querySelector("#whiteListMeNow input").checked = true;
                whiteListButton.checked = true;
            }
        });

    });
}

//Issue-reporting-section. Initialize email.js
emailjs.init("user_bLkmQPWHQhBxoSQc6zq3h");

//This code sends an email to the devs so they can fix the adblocker so it works on that website
$("#issueText").click(function (event) {
    chrome.tabs.query({
        currentWindow: true,
        active: true,
        status: "complete"
    }, function (info) {
        let url = info[0].url;
        var templateParams = {
            name: "Ads on this website dont work, please fix it.",
            notes: url,
        };
        $("#issueNotice").show().delay(3000).fadeOut(100);
        emailjs.send('undetectableadblocker', 'template_M88oUNIA', templateParams);
    });
})

//Whitelisting
function whitelist(e) {
    chrome.tabs.query({
        currentWindow: true,
        active: true,
    }, function (info) {
        if (info && info.length > 0 && info[0].url) {
            var url = info[0].url;
            var tabURL = new URL(url).hostname.replace(/(www.)/gi, "");
            if (e.target.localName == "input") {
                if (e.target.checked == true) {
                    chrome.runtime.sendMessage([tabURL, "BLOCK"]);
                } 
                else if (e.target.checked == false) {
                    chrome.runtime.sendMessage([tabURL, "UNBLOCK"]);
                }
            }
        }
    });
}