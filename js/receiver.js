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
  if (!castDebugLogger.debugOverlayElement_) {
      castDebugLogger.setEnabled(true);
  }
});

castDebugLogger.loggerLevelByEvents = {
  'cast.framework.events.category.CORE': cast.framework.LoggerLevel.INFO,
  'cast.framework.events.EventType.MEDIA_STATUS': cast.framework.LoggerLevel.DEBUG
}

// Set verbosity level for custom tags.
castDebugLogger.loggerLevelByTags = {
    [LOG_TAG]: cast.framework.LoggerLevel.DEBUG,
};

playerManager.setMessageInterceptor(
  cast.framework.messages.MessageType.LOAD,
  request => {
    castDebugLogger.info(LOG_TAG, 'Intercepting LOAD request');

    headers[mediaTokenKey] = request.media.customData['mediaTokenKey'];
    headers[authorizationKey] = request.media.customData['authorizationKey'];

    playbackConfig.manifestRequestHandler = requestInfo => {
        // console.log("listen", headers[mediaTokenKey]);
        // console.log("listen", "112322");
      // requestInfo.headers = headers
    };

    playerManager.setPlaybackConfig(playbackConfig);
    const data = request["media"]['contentId'];

        // console.log("listen", data);
    request.media.hlsSegmentFormat = cast.framework.messages.HlsSegmentFormat.TS;
    request.media.hlsVideoSegmentFormat = cast.framework.messages.HlsVideoSegmentFormat.TS;
    request.media.contentType = StreamType.HLS;

    return new Promise((resolve, reject) => {
        resolve(request);
      });
  });


context.start(castReceiverOptions)
