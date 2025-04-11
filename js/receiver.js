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

window.onerror = function (message, source, lineno, colno, error) {
  logError(`[Global Error] ${message} at ${source}:${lineno}:${colno}`, error);
};

window.onunhandledrejection = function (event) {
  logError('[Unhandled Promise Rejection]', event.reason);
};
playerManager.addEventListener(cast.framework.events.EventType.ERROR, (event) => {
  logError('[PlayerManager Error]', event);
});

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
    logError('request', request);
    playerManager.setPlaybackConfig(playbackConfig);
    log('[Receiver] PlaybackConfig set.');

    request.media.contentType = STREAM_TYPE;
    request.media.hlsSegmentFormat = cast.framework.messages.HlsSegmentFormat.TS;
    request.media.hlsVideoSegmentFormat = cast.framework.messages.HlsVideoSegmentFormat.TS;
    log(`[Receiver] Content type set to ${request.media.contentType}`);
    return Promise.resolve(request);
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
    logDiv.scrollTop = logDiv.scrollHeight; 
  }
}

function logError(message, error) {
  console.error(message, error);
  const details = typeof error === 'object' ? JSON.stringify(error, null, 2) : error;
  log(`${message} ${details}`);
}
