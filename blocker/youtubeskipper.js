//YouTube Friendly advertisement skipper
//Does the changed event contain an ad?
function checker(m, o){
  for(let i = 0; i < m.length; i++){
    if(/(ad-interrupting)/gi.test(m[i].target.className) === true){
      observer.disconnect();
      skip();
      break;
    }
  };
}

//Mutation observer initialization
var observer = new MutationObserver(checker);
var elementToTrack = undefined;
var options = {
  attributes: true,
  subtree: true,
  attributes: true,
}

//Initialize mutationobserver if initial initialization below didn't get it
function getObserver(){
  try{
    elementToTrack = document.querySelector("#movie_player");
    observer.observe(elementToTrack, options);
  }
  catch{
    setTimeout(function(){
      getObserver();
    }, 1000);
  }
}

//Upon youtube reload tab skip add immediately if present
try{
  if(document.querySelector(".ad-showing")){
    document.querySelector(".video-stream.html5-main-video").currentTime = document.querySelector(".video-stream.html5-main-video").duration;
      setTimeout(function(){
        if(document.querySelector(".ytp-ad-skip-button.ytp-button")) document.querySelector(".ytp-ad-skip-button.ytp-button").click();
      }, 1000);
    }
}
catch{};

//Upon youtube reload tab, is the movieplayer present?
try{
  elementToTrack = document.querySelector("#movie_player");
  observer.observe(elementToTrack, options);
}

//If it isn't present, catch the error and run the getObserver till you find it
catch{
  setTimeout(function(){
    getObserver();
  }, 1000);
};

//YouTube skipper function
function skip(){
  if(document.querySelector(".video-stream.html5-main-video").currentTime < document.querySelector(".video-stream.html5-main-video").duration){
    try{
      document.querySelector(".video-stream.html5-main-video").currentTime = document.querySelector(".video-stream.html5-main-video").duration;
    }
    catch{};
    observer.observe(elementToTrack, options);
  }
  else{
    try{
      document.querySelector(".ytp-ad-skip-button.ytp-button").click();
    }
    catch{};
    observer.observe(elementToTrack, options);
  }
}