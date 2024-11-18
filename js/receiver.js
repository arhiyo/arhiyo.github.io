const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

const StreamType = {
  DASH: 'application/dash+xml',
  HLS: 'application/x-mpegurl'
}
const TEST_STREAM_TYPE = StreamType.DASH

let castReceiverOptions = new cast.framework.CastReceiverOptions();
castReceiverOptions.useShakaForHls = true;
castReceiverOptions.shakaVersion = '4.2.2';

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

    return new Promise((resolve, reject) => {
        resolve(request);
      }).then(response => {
        label.textContent = `then: ${JSON.stringify(response)}`;
    }).catch(error => {
        label.textContent = `Error: ${JSON.stringify(error)}`;
    });
  });


context.start(castReceiverOptions)
