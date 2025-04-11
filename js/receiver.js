const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

const StreamType = {
  DASH: 'application/dash+xml',
  HLS: 'application/x-mpegurl',
};

const TEST_STREAM_TYPE = StreamType.HLS; // Change to DASH if needed

const mediaTokenKey = 'MEDIA-TOKEN';
const authorizationKey = 'Authorization';
const headers = {};

const playbackConfig = new cast.framework.PlaybackConfig();
const castReceiverOptions = new cast.framework.CastReceiverOptions();

// castReceiverOptions.useShakaForHls = true;
castReceiverOptions.shakaVersion = '4.14.7';

console.log('[Receiver] Starting setup...');

try {
  const castEvents = [
    cast.framework.system.EventType.READY,
    cast.framework.system.EventType.PLAY,
    cast.framework.system.EventType.PAUSE,
    cast.framework.system.EventType.PERFORMANCE,
    cast.framework.system.EventType.ERROR,
  ];

  castEvents.forEach(event => {
    context.addEventListener(event, (e) => {
          log(`shaka error3`);
      log(`[Cast Receiver] Event: ${event}`, e);
    });
  });
} catch (error) {
  logError('[Receiver] Error in logger message interceptor:', error);
}

playerManager.setMessageInterceptor(
  cast.framework.messages.MessageType.LOAD,
  (request) => {
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

      try {
        const video = document.getElementById('castMediaElement');
        const shakaPlayer = new shaka.Player(video);
        const events = [
          'loadstart',
          'loadeddata',
          'play',
          'pause',
          'ended',
          'error',
          'ratechange',
          'seeking',
          'seeked',
          'timeupdate',
          'progress',
          'waiting',
          'canplay',
          'canplaythrough',
        ];

        events.forEach(event => {
          shakaPlayer.addEventListener(event, (e) => {
            log(`[Shaka] Event: ${event}`, e);
          });
        });

        // Handle Shaka error event
        shakaPlayer.addEventListener('error', (e) => {
          log(`shaka error2`);
          const error = e.detail;
          logErrorShaka('[Shaka] Error:', error);
        });
      } catch (error) {
        log(`shaka error`);
        logError('[Receiver] Error in LOAD message interceptor:', error);
      }

      // delete request['media']['duration'];
      // delete request['currentTime'];
      // delete request['playbackRate'];

      log(`[Receiver] authorizationKey: ${JSON.stringify(playbackConfig, null, 2)}`);

      playerManager.setPlaybackConfig(playbackConfig);
      log('[Receiver] PlaybackConfig set.');

      request.media.contentType = TEST_STREAM_TYPE;
      request.media.hlsSegmentFormat = cast.framework.messages.HlsSegmentFormat.FMP4;
      request.media.hlsVideoSegmentFormat = cast.framework.messages.HlsVideoSegmentFormat.FMP4;

      log(`[Receiver] Content type set to ${request.media.contentType}`);

      return Promise.resolve(request);
    } catch (error) {
      log(`promise error`);
      logError('[Receiver] Error in LOAD message interceptor:', error);
      request['media']['metadata']['title'] = `${message} ${error?.message || error}`;
      return Promise.reject(error);
    }
  }
);

context.start(castReceiverOptions);

context.addEventListener(cast.framework.system.EventType.ERROR, (e) => {
  logError('[Cast Receiver] Error:', e);
});

function log(message) {
  console.log(message);
  const logDiv = document.getElementById('log');
  if (logDiv) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    logDiv.innerText += `[${timestamp}] ${message}\n`;
    logDiv.scrollTop = logDiv.scrollHeight; // Auto-scroll
  }
}

function logErrorShaka(message, error) {
  console.error(message, error);
  const details = typeof error === 'object' ? JSON.stringify(error, null, 2) : error;
  log(`${message} ${details}`);
}

function logError(message, error) {
  log(`error`);
  console.error(message, error);
  log(`${message} ${error?.message || error}`);
}
