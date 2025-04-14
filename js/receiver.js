const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

const StreamType = {
  DASH: 'application/dash+xml',
  HLS: 'application/x-mpegurl',
};

const STREAM_TYPE = StreamType.HLS; 

const mediaTokenKey = 'MEDIA-TOKEN';
const authorizationKey = 'Authorization';
const headers = {};

const playbackConfig = new cast.framework.PlaybackConfig();
const castReceiverOptions = new cast.framework.CastReceiverOptions();

castReceiverOptions.useShakaForHls = true;
castReceiverOptions.shakaVersion = '4.7.12';

playerManager.setMessageInterceptor(
  cast.framework.messages.MessageType.LOAD,
  (request) => {
    
    const token = request['customData']['mediaTokenKey'];
    const auth = request['customData']['authorizationKey'];
    
    headers[mediaTokenKey] = token;
    headers[authorizationKey] = auth;
    playbackConfig.manifestRequestHandler = requestInfo => {
        requestInfo.headers = headers;
    };
    playbackConfig.shakaConfiguration = {
        networking: {
          fetch: {
            headers: {
              [mediaTokenKey]: token,
              [authorizationKey]: auth,
            },
          },
        },
    };
    playerManager.setPlaybackConfig(playbackConfig);

    request.media.contentType = STREAM_TYPE;
    request.media.hlsSegmentFormat = cast.framework.messages.HlsSegmentFormat.TS;
    request.media.hlsVideoSegmentFormat = cast.framework.messages.HlsVideoSegmentFormat.TS;
    return Promise.resolve(request);
  }
);

context.start(castReceiverOptions);
