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

const castDebugLogger = cast.debug.CastDebugLogger.getInstance();
const LOG_TAG = 'MyAPP.LOG';
context.addEventListener(cast.framework.system.EventType.READY, () => {
      castDebugLogger.setEnabled(true);
      castDebugLogger.showDebugLogs(true);
});


// Set verbosity level for custom tags.
castDebugLogger.loggerLevelByTags = {
    [LOG_TAG]: cast.framework.LoggerLevel.DEBUG,
};

playerManager.setMessageInterceptor(
  cast.framework.messages.MessageType.LOAD,
  request => {
    castDebugLogger.debug(LOG_TAG, 'Intercepting LOAD request');

    headers[mediaTokenKey] = request.customData.mediaTokenKey;
    headers[authorizationKey] = request.customData.authorizationKey;

    playbackConfig.manifestRequestHandler = requestInfo => {
        // console.log("listen", headers[mediaTokenKey]);
        // console.log("listen", "112322");
      // requestInfo.headers = headers
    };

    playerManager.setPlaybackConfig(playbackConfig);
    const data = request.media.contentId;

        // console.log("listen", data);
    request.media.hlsSegmentFormat = cast.framework.messages.HlsSegmentFormat.TS;
    request.media.hlsVideoSegmentFormat = cast.framework.messages.HlsVideoSegmentFormat.TS;
    request.media.contentType = StreamType.HLS;

    return new Promise((resolve, reject) => {
        resolve(request);
      });
  });


context.start(castReceiverOptions)
