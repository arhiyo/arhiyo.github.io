const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

const SAMPLE_URL = "https://storage.googleapis.com/cpe-sample-media/content.json";
const StreamType = {
  DASH: 'application/dash+xml',
  HLS: 'application/x-mpegurl'
}
const TEST_STREAM_TYPE = StreamType.DASH
const castDebugLogger = cast.debug.CastDebugLogger.getInstance();


context.addEventListener(cast.framework.system.EventType.READY, () => {
      // Enable debug logger and show a 'DEBUG MODE' overlay at top left corner.
  });

castDebugLogger.loggerLevelByEvents = {
  'cast.framework.events.category.CORE': cast.framework.LoggerLevel.INFO,
  'cast.framework.events.EventType.MEDIA_STATUS': cast.framework.LoggerLevel.DEBUG
}


function makeRequest (method, url) {
  return new Promise(function (resolve, reject) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(JSON.parse(xhr.response));
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };
    xhr.send();
  });

}

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
    // Map contentId to entity
      headers[mediaTokenKey] = request.media.customData['mediaTokenKey'];
      headers[authorizationKey] = request.media.customData['authorizationKey'];

    playbackConfig.manifestRequestHandler = requestInfo => {
      // requestInfo.headers = headers
    };
    castDebugLogger.error("custom_tag", "message");
     console.log("listen", "event");
    const data = request["media"]['contentId'];
    const data2 = request["media"]['contentUrl'];
    if (request.media && request.media.entity) {
      request.media.contentId = request.media.entity;
    }

    request.media.contentUrl = data;
    request.media.hlsSegmentFormat = cast.framework.messages.HlsSegmentFormat.TS;
    request.media.hlsVideoSegmentFormat = cast.framework.messages.HlsVideoSegmentFormat.TS;

    request.media.contentType = StreamType.HLS;

    return new Promise((resolve, reject) => {
        let metadata = new cast.framework.messages.GenericMediaMetadata();
        metadata.title = data;
        metadata.subtitle = data2;

        request.media.metadata = metadata;
        resolve(request);
      });
  });


context.start(castReceiverOptions)
