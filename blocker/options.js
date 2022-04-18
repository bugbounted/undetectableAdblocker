document.addEventListener("DOMContentLoaded", run, false);

function run() {

    var allWhitelistedLinks = document.querySelector("#allWhitelistedLinks");
    allWhitelistedLinks.addEventListener("click", deleteIt, false);

    allWhitelistedLinks.innerHTML = ``;
    chrome.storage.sync.get(["whiteList"], function (result) {
        var whiteList = result["whiteList"];
        if(Object.keys(whiteList).length == 0){
            allWhitelistedLinks.innerHTML = "<i>No domains whitelisted.</i>";
        }
        for (let el in whiteList) {
            var temp = `
            <li class="list-group-item">${el}
                <i style = "float:right; margin-top:5px; cursor:pointer;" class="fas deleteIt fa-trash-alt"></i>
            </li>`;
            allWhitelistedLinks.innerHTML = allWhitelistedLinks.innerHTML + temp;
        }
    });
}

chrome.storage.onChanged.addListener(function(changes, namespace){
    run();
});

function deleteIt(e){
    if(e.target.tagName == "I"){
        chrome.storage.sync.get(["whiteList"], function (result) {
            var element = e.target.previousSibling.textContent.trim();
            delete result["whiteList"][element];
            chrome.storage.sync.set({"whiteList" : result["whiteList"]}, function(){
                chrome.runtime.sendMessage("oppdaterWhitelist");
            });
        });
    }
}