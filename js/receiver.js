const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

const castDebugLogger = cast.debug.CastDebugLogger.getInstance();
const LOG_TAG = 'MyAPP.LOG';

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


playerManager.addEventListener(cast.framework.events.category.CORE,
    event => {
        console.log("listen", event);
            console.log("Promise", "prog");
    });
const mediaTokenKey = 'MEDIA-TOKEN'
const authorizationKey = 'Authorization'
const playbackConfig = new cast.framework.PlaybackConfig();
 const headers = {};
    

            console.log("Promise", "prog");
playerManager.setMessageInterceptor(
  cast.framework.messages.MessageType.LOAD,
  request => {
    castDebugLogger.info(LOG_TAG, 'Intercepting LOAD request');

    playerManager.setPlaybackConfig(playbackConfig);
    // Map contentId to entity
      headers[mediaTokenKey] = request.media.customData['mediaTokenKey'];
      headers[authorizationKey] = request.media.customData['authorizationKey'];

    playbackConfig.manifestRequestHandler = requestInfo => {
      requestInfo.headers = headers
    };
        const data = request["media"]['contentId'];
        console.log("intercept", data);
    if (request.media && request.media.entity) {
      request.media.contentId = request.media.entity;
    }

    request.media.contentUrl = data;
    request.media.hlsSegmentFormat = cast.framework.messages.HlsSegmentFormat.TS;
    request.media.hlsVideoSegmentFormat = cast.framework.messages.HlsVideoSegmentFormat.TS;

    request.media.contentType = StreamType.HLS;

    // resolve(request);
    return new Promise((resolve, reject) => {
    //   // Fetch repository metadata
    //   makeRequest('GET', data)
    //     .then(function (data) {
    //       // Obtain resources by contentId from downloaded repository metadata.
    //       let item = data['bbb'];
    //       if(!item) {
    //         // Content could not be found in repository
    //         console.log("Promise", 'item request');
    //         reject();
    //       } else {
    //         console.log("Promise", data);
    //         // Adjusting request to make requested content playable
    //         request.media.contentType = TEST_STREAM_TYPE;

    //         // Configure player to parse DASH content
    //         if(TEST_STREAM_TYPE == StreamType.DASH) {
    //           request.media.contentUrl = item.stream.dash;
    //         }

    //         // Configure player to parse HLS content
    //         else if(TEST_STREAM_TYPE == StreamType.HLS) {
    //           request.media.contentUrl = item.stream.hls
    //           request.media.hlsSegmentFormat = cast.framework.messages.HlsSegmentFormat.TS;
    //           request.media.hlsVideoSegmentFormat = cast.framework.messages.HlsVideoSegmentFormat.TS;
    //         }
    //         console.log("Promise", item.stream.hls);
    //         console.log("Promise", item['prog']);
            
    //         castDebugLogger.warn(LOG_TAG, 'Playable URL:', request.media.contentUrl);
    //         request.media.contentType = 'application/x-mpegurl'
    //         // Add metadata
            let metadata = new cast.framework.messages.GenericMediaMetadata();
            metadata.title = "item.title";
            metadata.subtitle = "item.author";

            request.media.metadata = metadata;
    //         // Resolve request
            resolve(request);
    //       }
      });
    // });
  });


playerManager.setMessageInterceptor(
  cast.framework.messages.MessageType.SET_CREDENTIALS,
  request => {
    castDebugLogger.info(LOG_TAG, 'Intercepting SET_CREDENTIALS request');
      headers[mediaTokenKey] = request.credentials['mediaTokenKey'];
      headers[authorizationKey] = request.credentials['authorizationKey'];
    
        console.log("intercept", data);

    // resolve(request);
    return new Promise((resolve, reject) => {
            let metadata = new cast.framework.messages.GenericMediaMetadata();
            metadata.title = "item.title";
            metadata.subtitle = "item.author";

            request.media.metadata = metadata;
    //         // Resolve request
            resolve(request);
    //       }
      });
    // });
  });


context.start(castReceiverOptions)
