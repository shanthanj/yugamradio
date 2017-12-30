
var progressTimer;

var playButton;
var stopButton;
var activityIndicator;
//var textPosition;
var shoutcastURL = "http://yugam.dynu.net:8080/";

document.addEventListener("prechange", function(event) {
  if (event.target.matches('#appTabbar')) {
    event.currentTarget.querySelector('ons-toolbar .center').innerHTML = event.tabItem.getAttribute('label');
  }
});

document.addEventListener("deviceready", onDeviceReady, false);

/*ons.ready(function() {

  onDeviceReady();
});*/

document.addEventListener('init', function(event) {

	//initialize variables
  playButton = document.getElementById('playbutton');
  stopButton = document.getElementById('stopbutton');
  activityIndicator = document.getElementById('activityindicator');
//  textPosition = document.getElementById('textposition');

  var page = event.target;

  if (page.id === 'home') {
    /*page.querySelector('#push-button').onclick = function() {
      document.querySelector('#myNavigator').pushPage('shows.html', {data: {title: 'Shows'}});
    };*/
  } else if (page.id === 'news') {
    jQuery(function($) {
          $("#rss-feeds").rss("http://www.adaderana.lk/rss.php",
          {
            limit: 10,
            entryTemplate:'<ons-list-item><a href="{url}">[{author}@{date}] {title}</a><br/>{teaserImage}{shortBodyPlain}<ons-list-item>'
          })
        });
  }
});

function setupVolumeSlider() {
  document.getElementById('range-slider').addEventListener('input', function (event) {
    var volumeLevel = event.target.value;
    myaudio.volume = volumeLevel/100;
    document.getElementById('volume-value').innerHTML = volumeLevel;
  });
}


function onDeviceReady() {
  setupStatusBar();
  getStreamStats();
  html5audio.play();
  //initPushNotification();
  initiateMusicControls();
//  setupVolumeSlider();
	return false;
}

function setupStatusBar() {
  if (cordova.platformId == 'android') {
    StatusBar.backgroundColorByHexString("#e0244a");
  }
}

function initiateMusicControls() {
    MusicControls.create({
      track       : 'Yugam Radio',		// optional, default : ''
      artist      : 'Tamil Hits 24x7',						// optional, default : ''
      cover       : 'http://yugamradio.com/images/cover.png',		// optional, default : nothing
      // cover can be a local path (use fullpath 'file:///storage/emulated/...', or only 'my_image.jpg' if my_image.jpg is in the www folder of your app)
      //			 or a remote url ('http://...', 'https://...', 'ftp://...')
      isPlaying   : true,							// optional, default : true
      //dismissable : false,							// optional, default : false

      // hide previous/next/close buttons:
      hasPrev   : false,		// show previous button, optional, default: true
      hasNext   : false,		// show next button, optional, default: true
      hasClose  : false,		// show close button, optional, default: false

      // iOS only, optional
      album       : 'Yugam Radio',     // optional, default: ''
    //  duration : 60, // optional, default: 0
  //    elapsed : 10, // optional, default: 0
    //	hasSkipForward : true, //optional, default: false. true value overrides hasNext.
    //	hasSkipBackward : true, //optional, default: false. true value overrides hasPrev.
  //  	skipForwardInterval : 15, //optional. default: 0.
  //    skipBackwardInterval : 15, //optional. default: 0.
      hasScrubbing : false, //optional. default to false. Enable scrubbing from control center progress bar

      // Android only, optional
      // text displayed in the status bar when the notification (and the ticker) are updated
      ticker	  : 'Now playing "Time is Running Out"',
      //All icons default to their built-in android equivalents
      //The supplied drawable name, e.g. 'media_play', is the name of a drawable found under android/res/drawable* folders
      playIcon: 'media_play',
      pauseIcon: 'media_pause',
      prevIcon: 'media_prev',
      nextIcon: 'media_next',
      closeIcon: 'media_close',
      notificationIcon: ''
  }, onSuccess, onError);

  MusicControls.destroy(onSuccess, onError);

  // Register callback
  MusicControls.subscribe(events);
  // Start listening for events
  // The plugin will run the events function each time an event is fired
  MusicControls.listen();

}

function onSuccess() {
  console.log('success');
}

function onError() {
  console.log('error music controls');
}

function events(action) {

  const message = JSON.parse(action).message;
    switch(message) {
        case 'music-controls-next':
            // Do something
            break;
        case 'music-controls-previous':
            // Do something
            break;
        case 'music-controls-pause':
            html5audio.stop();
            MusicControls.updateIsPlaying(false);
            break;
        case 'music-controls-play':
            html5audio.play();
            MusicControls.updateIsPlaying(true);
            break;
        case 'music-controls-destroy':
            // Do something
            break;

        // External controls (iOS only)
    	case 'music-controls-toggle-play-pause' :
            // Do something
            break;
    	case 'music-controls-seek-to':
            const seekToInSeconds = JSON.parse(action).position;
            const nowPlaying = 'Testing 2';
            console.log('Updating Seeking');
            MusicControls.updateElapsed({
                //elapsed: seekToInSeconds,
                isPlaying: true,
                artist: nowPlaying
            });
            // Do something
            break;

        // Headset events (Android only)
        // All media button events are listed below
        case 'music-controls-media-button' :
            // Do something
            break;
        case 'music-controls-headset-unplugged':
            // Do something
            break;
        case 'music-controls-headset-plugged':
            // Do something
            break;
        default:
            break;
    }
}

function initPushNotification() {
  cordova.plugins.notification.local.schedule({
    title: 'My first notification',
    text: 'Thats pretty easy...',
    icon: 'file://img/logo.png',
    foreground: true
});
  console.log("Push Notification Initialized");
}

function getStreamStats() {
	$.ajax({
        url: shoutcastURL + "statistics?json=1",
        type: "GET",
        success: function(data) {
            //console.log("polling");
						var songAndArtist = data.streams[0].songtitle;
						var song = songAndArtist.split(" - ")[1];
						var artist = songAndArtist.split(" - ")[0];
            $('#songTitle').html('Now Playing: <b>' + song + '</b>');
						$('#singerInfo').html('(' + artist + ')');
        },
        dataType: "json",
        complete: setTimeout(function() {getStreamStats()}, 10000),
        timeout: 2000
    });
}



function onError(error)
{
	console.log(error.message);
}

function onConfirmRetry(button) {
	if (button == 1) {
		html5audio.play();
	}
}

function pad2(number) {
	return (number < 10 ? '0' : '') + number
}

var myAudioURL = shoutcastURL+";";
var myaudio = new Audio(myAudioURL);
var isPlaying = false;
var readyStateInterval = null;

var html5audio = {
  play: function()
	{
		isPlaying = true;
		myaudio.play();


		readyStateInterval = setInterval(function(){
			 if (myaudio.readyState <= 2) {
				 playButton.style.display = 'none';
				 activityIndicator.style.display = 'block';
				 //textPosition.innerHTML = 'loading...';
			 }
		},1000);
		myaudio.addEventListener("timeupdate", function() {
			 var s = parseInt(myaudio.currentTime % 60);
			 var m = parseInt((myaudio.currentTime / 60) % 60);
			 var h = parseInt(((myaudio.currentTime / 60) / 60) % 60);
			 if (isPlaying && myaudio.currentTime > 0) {
				// textPosition.innerHTML = pad2(h) + ':' + pad2(m) + ':' + pad2(s);
			 }
		}, false);
		myaudio.addEventListener("error", function() {
			 console.log('myaudio ERROR');
		}, false);
		myaudio.addEventListener("canplay", function() {
			 console.log('myaudio CAN PLAY');
		}, false);
		myaudio.addEventListener("waiting", function() {
			 //console.log('myaudio WAITING');
			 isPlaying = false;
			 playButton.style.display = 'none';
			 stopButton.style.display = 'none';
			 activityIndicator.style.display = 'block';
		}, false);
		myaudio.addEventListener("playing", function() {
			 isPlaying = true;
			 playButton.style.display = 'none';
			 activityIndicator.style.display = 'none';
			 stopButton.style.display = 'block';
		}, false);
		myaudio.addEventListener("ended", function() {
			 //console.log('myaudio ENDED');
			 html5audio.stop();
			 // navigator.notification.alert('Streaming failed. Possibly due to a network error.', null, 'Stream error', 'OK');
			 // navigator.notification.confirm(
			 //	'Streaming failed. Possibly due to a network error.', // message
			 //	onConfirmRetry,	// callback to invoke with index of button pressed
			 //	'Stream error',	// title
			 //	'Retry,OK'		// buttonLabels
			 // );
			 if (window.confirm('Streaming failed. Possibly due to a network error. Retry?')) {
			 	onConfirmRetry();
			 }
		}, false);
	},
	pause: function() {
		isPlaying = false;
		clearInterval(readyStateInterval);
		myaudio.pause();
		stopButton.style.display = 'none';
		activityIndicator.style.display = 'none';
		playButton.style.display = 'block';
	},
	stop: function() {
		isPlaying = false;
		clearInterval(readyStateInterval);
		myaudio.pause();
		stopButton.style.display = 'none';
		activityIndicator.style.display = 'none';
		playButton.style.display = 'block';
		myaudio = null;
		myaudio = new Audio(myAudioURL);
		//textPosition.innerHTML = '';
	}
};

window.fn = {};

window.fn.toggleMenu = function () {
  document.getElementById('appSplitter').left.toggle();
};

window.fn.loadView = function (index) {
  document.getElementById('appTabbar').setActiveTab(index);
  document.getElementById('sidemenu').close();
};

window.fn.loadLink = function (url) {
  window.open(url, '_blank');
};

window.fn.pushPage = function (page, anim) {
  if (anim) {
    document.getElementById('myNavigator').pushPage(page.id, { data: { title: page.title }, animation: anim });
  } else {
    document.getElementById('myNavigator').pushPage(page.id, { data: { title: page.title } });
  }
};
