const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

const SAMPLE_URL = "https://storage.googleapis.com/cpe-sample-media/content.json";
const StreamType = {
  DASH: 'application/dash+xml',
  HLS: 'application/x-mpegurl'
}
const TEST_STREAM_TYPE = StreamType.DASH

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
      requestInfo.headers = headers
    };
    const data = request["media"]['contentId'];
    const title = request["media"]["metadata"];
    const subtitle = request["media"];

    request.media.contentUrl = data;
    request.media.hlsSegmentFormat = cast.framework.messages.HlsSegmentFormat.TS;
    request.media.hlsVideoSegmentFormat = cast.framework.messages.HlsVideoSegmentFormat.TS;

    request.media.contentType = StreamType.HLS;

    return new Promise((resolve, reject) => {
        let metadata = new cast.framework.messages.GenericMediaMetadata();
        metadata.title = title;
        metadata.subtitle = subtitle;

        request.media.metadata = metadata;
        resolve(request);
      });
  });


context.start(castReceiverOptions)
