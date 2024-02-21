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
    headers[mediaTokenKey] = request.media.customData['mediaTokenKey'];
    headers[authorizationKey] = request.media.customData['authorizationKey'];

    playbackConfig.manifestRequestHandler = requestInfo => {
      requestInfo.headers = headers
    };
    const data = request["media"]['contentUrl'];
    const title = request.media.customData['title'];
    const subtitle = request.media.customData['subtitle'];

    request.media.hlsSegmentFormat = cast.framework.messages.HlsSegmentFormat.TS;
    request.media.hlsVideoSegmentFormat = cast.framework.messages.HlsVideoSegmentFormat.TS;

    request.media.contentType = StreamType.HLS;

    request.media.contentUrl = data;
    return new Promise((resolve, reject) => {
        let metadata = new cast.framework.messages.GenericMediaMetadata();
        metadata.title = title;
        metadata.subtitle = subtitle;

        request.media.metadata = metadata;
        resolve(request);
      });
  });


context.start(castReceiverOptions)
