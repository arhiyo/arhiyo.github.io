const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

const StreamType = {
  DASH: 'application/dash+xml',
  HLS: 'application/x-mpegurl'
};

const TEST_STREAM_TYPE = StreamType.HLS; // Change to DASH if needed

const mediaTokenKey = 'MEDIA-TOKEN';
const authorizationKey = 'Authorization';
const headers = {};

const playbackConfig = new cast.framework.PlaybackConfig();
const castReceiverOptions = new cast.framework.CastReceiverOptions();

castReceiverOptions.useShakaForHls = true;
castReceiverOptions.shakaVersion = '4.2.2';

console.log('[Receiver] Starting setup...');
const castDebugLogger = cast.debug.CastDebugLogger.getInstance();

cast.framework.CastReceiverContext.getInstance().addEventListener(cast.framework.system.EventType.READY, () => {
  if (!castDebugLogger.debugOverlayElement_) {
      castDebugLogger.setEnabled(true);
      castDebugLogger.showDebugLogs(true);
      castDebugLogger.clearDebugLogs();
  }
});

playerManager.setMessageInterceptor(
  cast.framework.messages.MessageType.LOAD,
  request => {
    try {
      log('[Receiver] LOAD message intercepted.');

      const token = request['customData']['mediaTokenKey'];
      const auth = request['customData']['authorizationKey'];

      log(`[Receiver] mediaTokenKey: ${token}`);
      log(`[Receiver] authorizationKey: ${auth}`);

      if (!token || !auth) {
        logError('[Receiver] Missing authentication tokens.');
        throw new Error('Missing required mediaTokenKey or authorizationKey');
      }

      headers[mediaTokenKey] = token;
      headers[authorizationKey] = auth;

      log(`[Receiver] mediaTokenKey: ${token}`);
      log(`[Receiver] authorizationKey: ${auth}`);

      playerManager.setPlaybackConfig(playbackConfig);
      log('[Receiver] PlaybackConfig set.');

      request.autoplay = true;

      request.media.contentType = TEST_STREAM_TYPE;
      request.media.hlsSegmentFormat = cast.framework.messages.HlsSegmentFormat.TS;
      request.media.hlsVideoSegmentFormat = cast.framework.messages.HlsVideoSegmentFormat.TS;

      log(`[Receiver] Content type set to ${request.media.contentType}`);

      return Promise.resolve(request);
    } catch (error) {
      logError('[Receiver] Error in LOAD message interceptor:', error);
      castDebugLogger.debug('Tag1', `${message} ${error?.message || error}`);
      return Promise.reject(error);
    }
  }
);

context.start(castReceiverOptions)

function log(message) {
  console.log(message);
  const logDiv = document.getElementById('log');
  if (logDiv) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    logDiv.innerText += `[${timestamp}] ${message}\n`;
    logDiv.scrollTop = logDiv.scrollHeight; // Auto-scroll
  }
}

function logError(message, error) {
  console.error(message, error);
  log(`${message} ${error?.message || error}`);
}
