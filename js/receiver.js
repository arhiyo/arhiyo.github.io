// Get the CastReceiverContext and PlayerManager instances
const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();
const StreamType = {
  DASH: 'application/dash+xml',
  HLS: 'application/x-mpegurl',
};
const STREAM_TYPE = StreamType.HLS; 
// Define the keys for token and authorization headers
const mediaTokenKey = 'MEDIA-TOKEN';
const authorizationKey = 'Authorization';
const headers = {};
const DEBUG = true
// Initialize playback config and cast receiver options
const playbackConfig = new cast.framework.PlaybackConfig();
const castReceiverOptions = new cast.framework.CastReceiverOptions();

// Set Shaka player options
castReceiverOptions.useShakaForHls = true;
castReceiverOptions.shakaVersion = '4.5.0';

// Global error handler
window.onerror = function (message, source, lineno, colno, error) {
  logError(`[Global Error] ${message} at ${source}:${lineno}:${colno}`, error);
};

// Log unhandled Promise rejections
window.onunhandledrejection = function (event) {
  logError('[Unhandled Promise Rejection]', event.reason);
};
playerManager.addEventListener(cast.framework.events.EventType.ERROR, (event) => {
  logError('[PlayerManager Error]', event);
});
// Set up message interceptor for 'LOAD' message type
playerManager.setMessageInterceptor(
  cast.framework.messages.MessageType.LOAD,
  (request) => {
    // Extract tokens and authorization info from the request
    const token = request['customData']['mediaTokenKey'];
    const auth = request['customData']['authorizationKey'];

    // Set up headers for authentication
    headers[mediaTokenKey] = token;
    headers[authorizationKey] = auth;
    playbackConfig.shakaConfiguration = {
        mediaSource: {
          forceTransmux: true
        },
        manifest: {
          dash: {
            ignoreDrmInfo: true
          }
        },
        networking: {
          fetch: {
            headers: {
              [mediaTokenKey]: token,
              [authorizationKey]: auth,
            },
          },
        },
    };

    playbackConfig.manifestRequestHandler = requestInfo => {
        requestInfo.headers = headers;
    };
    // Set media duration as Infinity for live streams (if applicable)
    // Set playback configurations and content type
    playerManager.setPlaybackConfig(playbackConfig);
    log('[Receiver] PlaybackConfig set.36');

    request.media.contentType = STREAM_TYPE;
    request.media.hlsSegmentFormat = cast.framework.messages.HlsSegmentFormat.TS;
    request.media.hlsVideoSegmentFormat = cast.framework.messages.HlsVideoSegmentFormat.TS;
    log(`[Receiver] Content type set to ${request.media.contentType}`);
    // Resolve the request to continue playback
    return Promise.resolve(request);
  }
);

// Start the receiver context
context.start(castReceiverOptions);

// Add event listener for receiver errors
context.addEventListener(cast.framework.system.EventType.ERROR, (e) => {
  logError('[Cast Receiver] Error:', e);
});

// Logging functions
function log(message) {
  const logDiv = document.getElementById('log');
  if (!DEBUG) {
    logDiv.style.display = 'none';
    return;
  }
  if (logDiv) logDiv.style.display = 'block';
  console.log(message);
  if (logDiv) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    logDiv.innerText += `[${timestamp}] ${message}\n`;
    logDiv.scrollTop = logDiv.scrollHeight; // Auto-scroll
  }
}

function logError(message, error) {
  if (!DEBUG) {
    logDiv.style.display = 'none';
    return;
  }
  console.error(message, error);
  const details = typeof error === 'object' ? JSON.stringify(error, null, 2) : error;
  log(`${message} ${details}`);
}
