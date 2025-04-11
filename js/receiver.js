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
    playerManager.setPlaybackConfig(playbackConfig);
    headers[mediaTokenKey] = request.customData.mediaTokenKey;
    headers[authorizationKey] = request.customData.authorizationKey;

    playbackConfig.manifestRequestHandler = requestInfo => {
      requestInfo.headers = headers
    };

    request.media.hlsSegmentFormat = cast.framework.messages.HlsSegmentFormat.TS;
    request.media.hlsVideoSegmentFormat = cast.framework.messages.HlsVideoSegmentFormat.TS;
    request.media.contentType = StreamType.HLS;

    return new Promise((resolve, reject) => {
        resolve(request);
      });
  });


context.start(castReceiverOptions)

context.addEventListener(cast.framework.system.EventType.ERROR, (e) => {
  logError('[Cast Receiver] Error:', e);
});

function log(message) {
  console.log(message);
  const logDiv = document.getElementById('log');
  if (logDiv) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    logDiv.innerText += `[${timestamp}] ${message}\n`;
    logDiv.scrollTop = logDiv.scrollHeight; 
  }
}

function logError(message, error) {
  console.error(message, error);
  const details = typeof error === 'object' ? JSON.stringify(error, null, 2) : error;
  log(`${message} ${details}`);
}
