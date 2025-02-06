const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

const StreamType = {
  DASH: 'application/dash+xml',
  HLS: 'application/x-mpegurl'
}
const TEST_STREAM_TYPE = StreamType.DASH

let castReceiverOptions = new cast.framework.CastReceiverOptions();
castReceiverOptions.useShakaForHls = false;
castReceiverOptions.shakaVersion = '4.13.2';

function adjustPlayerSize() {
  const player = document.querySelector("cast-media-player");
  const video = player?.querySelector("video");

  if (!video) return; // Ensure the video element exists

  video.onloadedmetadata = () => {
    const videoAspect = video.videoWidth / video.videoHeight;
    const screenAspect = window.innerWidth / window.innerHeight;

    if (videoAspect > screenAspect) {
      // Landscape (16:9) - Fill width
      player.style.width = "100vw";
      player.style.height = "auto";
    } else {
      // Portrait (9:16) - Fill height
      player.style.width = "auto";
      player.style.height = "100vh";
    }
  };
}

  const player = document.querySelector("cast-media-player");
  const video = player?.querySelector("video");

      player.style.width = "auto";
      player.style.height = "100vh";

const mediaTokenKey = 'MEDIA-TOKEN'
const authorizationKey = 'Authorization'
const playbackConfig = new cast.framework.PlaybackConfig();
const headers = {};

playerManager.setMessageInterceptor(
  cast.framework.messages.MessageType.LOAD,
  request => {

    headers[mediaTokenKey] = request['customData']['mediaTokenKey'];
    headers[authorizationKey] = request['customData']['authorizationKey'];

    playbackConfig.manifestRequestHandler = requestInfo => {
        // console.log("listen", headers[mediaTokenKey]);
        // console.log("listen", "112322");
      // requestInfo.headers = headers
    };

    playerManager.setPlaybackConfig(playbackConfig);
    const data = request.media.contentId;

    request.media.hlsSegmentFormat = cast.framework.messages.HlsSegmentFormat.TS;
    request.media.hlsVideoSegmentFormat = cast.framework.messages.HlsVideoSegmentFormat.TS;
    request.media.contentType = StreamType.HLS;

    
    
        const label = document.getElementById("first-name");

  setTimeout(adjustPlayerSize, 1000);
    
    return new Promise((resolve, reject) => {
        resolve(request);
      }).catch(error => {
        label.textContent = `Error: ${JSON.stringify(error)}`;
    });
  });

window.addEventListener("resize", adjustPlayerSize);

context.start(castReceiverOptions)
