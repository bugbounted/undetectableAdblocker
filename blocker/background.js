//Tab:URL storage and whitelist variable
var obj = {};
var whiteList = {}

//NodeBlocker
function nodeBlocker(tabId){
	try{
		chrome.tabs.executeScript({code: `

		var all = [...document.querySelectorAll("a, img, div")];
		var res = [];
		for(let i = 0; i < all.length; i++){
			res.push(all[i].src);
			res.push(all[i].href);
		}

		res = [...new Set(res)];
		var melding = ["nodeBlocker", res, ${tabId}];
		chrome.runtime.sendMessage(melding);

		melding = [];
		all = [];
		res = [];

	`});
	}
	catch{

	}
}

//Brukernavigering kontrollør
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	chrome.tabs.get(tabId, function (results) {
		if (chrome.runtime.lastError) return undefined;
		else if (results && results.url && /(chrome:\/\/)/.test(results.url) == false) {

			nodeBlocker(tabId);

			var tabURL = new URL(results.url);
			tabURL = tabURL.hostname.replace(/(www.)/gi, "");
			obj[tabId] = tabURL;

			if (["youtube.com"].includes(tabURL)) {
				if (!whiteList[tabURL]) {
					chrome.tabs.executeScript(tabId, {
						file: "blocker/youtubeskipper.js"
					})
					chrome.tabs.insertCSS(tabId, {
						file: "blocker/patches.css"
					})
				}
			}
		}
	});
});

//Siden-navigering/endringer kontrollør
chrome.tabs.onActivated.addListener(function (activeInfo) {
	chrome.tabs.get(activeInfo.tabId, function (results) {
		if (chrome.runtime.lastError) return undefined;

		else if (results && results.url && /(chrome:\/\/)/.test(results.url) == false) {

			nodeBlocker(activeInfo.tabId);

			var tabURL = new URL(results.url);
			tabURL = tabURL.hostname.replace(/(www.)/gi, "");
			obj[activeInfo.tabId] = tabURL;

			if (["youtube.com"].includes(tabURL)) {
				if (whiteList[tabURL]) {
					chrome.tabs.executeScript(tabId, {
						file: "blocker/youtubeskipper.js"
					})
					chrome.tabs.insertCSS(tabId, {
						file: "blocker/patches.css"
					})
				}
			}
		}
	});
});

//Webnavigation kontrollør
chrome.webNavigation.onBeforeNavigate.addListener(function (tab) {
	if (tab.frameId == 0) {
		chrome.tabs.get(tab.tabId, function (results) {
			if (chrome.runtime.lastError) return undefined;

			else if (results && results.url && /(chrome:\/\/)/.test(results.url) == false) {

				nodeBlocker(tab.tabId);

				var tabURL = new URL(results.url);
				tabURL = tabURL.hostname.replace(/(www.)/gi, "");
				obj[tab.tabId] = tabURL;

				if (["youtube.com"].includes(tabURL)) {
					if (whiteList[tabURL]) {
						chrome.tabs.executeScript(tabId, {
							file: "blocker/youtubeskipper.js" 
						});
						chrome.tabs.insertCSS(tabId, { 
							file: "blocker/patches.css" 
						});
					}
				}
			}
		});
	}
});

//WebRequest Parametere
var filter = { urls: ["<all_urls>"], types: ["media", "script", "xmlhttprequest", "image", "sub_frame"]};
var extra = ["blocking"];

//Andre variabler
var [url, currentURL, currentURL2, currentURLModified] = ["", "", "", "", ""];
var transparentURL = chrome.runtime.getURL("../images/transparent.gif");
var ad = [];

//Listening for requests.
var callback = (details) => {
	url = new URL(details.url);
	currentURL = url.hostname.replace(/(www.)/gi, "");
	currentURL2 = url.hostname.slice(url.hostname.indexOf(".") + 1);
	currentURLModified = url.hostname + url.pathname;
	ad = [url.pathname, currentURL, currentURL2, currentURLModified];

	//Rar undefined-bug some dukker opp ved førstegangs-installasjon
	if(whiteList == undefined) whiteList = {}

	if (whiteList[obj[details.tabId]]) {
		return {
			cancel: false
		}
	} 
	else {
		//Scripts
		if (details.type == "script") {
			if (ad.some(e => scriptsList[e])) {
				return {
					redirectUrl: transparentURL
				}
			}
		}
		//Media, Image and Sub_Frame                                                        
		else if (["media", "sub_frame", "image"].some(e => e == details.type)) {
			if (ad.some(e => adsList[e])) {
				return {
					redirectUrl: transparentURL
				}
			}
			else if (ad.some(e => imageList[e])) {
				return {
					redirectUrl: transparentURL
				}
			}
		}
		//XMLHttpRequests
		else if (details.type == "xmlhttprequest") {
			if (url.pathname == "/get_video_info") {
				//embedded youtube fix
				if (/(embedded)/gi.test(details.url) == true) {
					return {
						redirectUrl: details.url
					}
				}
			} 
			else if (ad.some(e => adsList[e])) {
				return {
					redirectUrl: transparentURL
				}
			}
		}
	}
}

//Upon first-installation
chrome.runtime.onInstalled.addListener(function (details) {
	if (details.reason == "install") {
		chrome.storage.sync.set({
			"onOff": true,
			"whiteList": {}
		});
		chrome.webRequest.onBeforeRequest.addListener(callback, filter, extra);
		chrome.tabs.create({ url: "../static/welcomePage.html" });
	} 
	else {
		chrome.storage.sync.set({
			"onOff": true,
			"whiteList": {}
		});
		chrome.webRequest.onBeforeRequest.addListener(callback, filter, extra);
	}
});

//When chrome is opened, turn on or off the blocker based upon the storage-saved data
chrome.storage.sync.get(function (result) {

	//Update whitelist based upon storage upon extension-loading
	whiteList = result["whiteList"];

	//Start or Turn off the blocker based on storage-saved data
	if (result.onOff == true) chrome.webRequest.onBeforeRequest.addListener(callback, filter, extra);
	else if (result.onOff == false) chrome.webRequest.onBeforeRequest.removeListener(callback);
	else return undefined;
});

//Message listener
chrome.runtime.onMessage.addListener(function (message, sender, response) {
	if (message === true) chrome.webRequest.onBeforeRequest.addListener(callback, filter, extra);
	else if (message === false) chrome.webRequest.onBeforeRequest.removeListener(callback);
	else if (message === "oppdaterWhitelist") updateWhitelist();
	else if(message[0] === "nodeBlocker"){

		var retRes = {};

		for(let i = 0; i < message[1].length; i++){
			try{
				var url = new URL(message[1][i]);
				var currentURL = url.hostname.replace(/(www.)/gi, "");
				var currentURL2 = url.hostname.slice(url.hostname.indexOf(".") + 1);
				var currentURLModified = url.hostname + url.pathname;
				var ad = [url.pathname, currentURL, currentURL2, currentURLModified];

				if(ad.some(e => adsList[e])){
					retRes[message[1][i]] = true;
				}
			}
			catch{

			}
		}

		chrome.tabs.executeScript(message[2], {code: `
		
		var all = [...document.querySelectorAll("a, img, div")];
		var detSomSkalBlokkes = ${JSON.stringify(retRes)};

		for(let i = 0; i < all.length; i++){
			if(detSomSkalBlokkes[all[i]]){
				try{
					all[i].style.cssText = "display: none";
				}
				catch{}
			}
		}
	`})

	}
	else {
		if (message[1] == "UNBLOCK") {
			chrome.storage.sync.get(["whiteList"], function (result) {
				delete result["whiteList"][message[0]];
				whiteList = result["whiteList"]
				chrome.storage.sync.set({ "whiteList": result["whiteList"] }, function(){
					updateWhitelist();
				});
			});
		} 
		else if (message[1] == "BLOCK") {
			chrome.storage.sync.get(["whiteList"], function (result) {
				result["whiteList"][message[0]] = true;
				whiteList = result["whiteList"];
				chrome.storage.sync.set({ "whiteList": result["whiteList"] }), function(){
					updateWhitelist();
				};
			});
		}
	}
});

//Whitelist Updater
function updateWhitelist() {
	chrome.storage.sync.get(["whiteList"], function (result) {
		whiteList = result["whiteList"];
	});
}