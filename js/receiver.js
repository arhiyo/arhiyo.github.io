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

castReceiverOptions.useShakaForHls = true;
castReceiverOptions.shakaVersion = '4.14.7';

window.onerror = function (message, source, lineno, colno, error) {
  logError(`[Global Error] ${message} at ${source}:${lineno}:${colno}`, error);
};

// Log unhandled Promise rejections
window.onunhandledrejection = function (event) {
  logError('[Unhandled Promise Rejection]', event.reason);
};

// Initialize the player
const video = document.getElementById('video'); // The video element
const player = new shaka.Player(video);

player.attach(video)  // Attach player to video element
  .then(() => {
    // Intercept LOAD requests
    playerManager.setMessageInterceptor(
      cast.framework.messages.MessageType.LOAD,
      (request) => {
        log('[Receiver] LOAD message intercepted.');

        const token = request['customData']?.[mediaTokenKey];
        const auth = request['customData']?.[authorizationKey];

        log(`[Receiver] mediaTokenKey: ${token}`);
        log(`[Receiver] authorizationKey: ${auth}`);

        if (!token || !auth) {
          logError('[Receiver] Missing authentication tokens.');
          throw new Error('Missing required mediaTokenKey or authorizationKey');
        }

        // Set up headers for authentication
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

        // Set media duration as Infinity for live streams (if applicable)
        request.media.duration = Infinity;

        // Configure player
        player.configure({
          streaming: {
            bufferingGoal: 30,  // Adjust based on your needs
            rebufferingGoal: 10,
          },
        });

        // Load stream URL using Shaka Player
        const streamUrl = request.media.id; 
        player.load(streamUrl).then(() => {
          log('The stream has been loaded successfully!');
        }).catch(error => {
          logError('Error loading the stream:', error);
        });

        // Set playback configurations and content type
        playerManager.setPlaybackConfig(playbackConfig);
        log('[Receiver] PlaybackConfig set.');

        request.media.contentType = TEST_STREAM_TYPE;
        request.media.hlsSegmentFormat = cast.framework.messages.HlsSegmentFormat.AAC;
        request.media.hlsVideoSegmentFormat = cast.framework.messages.HlsVideoSegmentFormat.FMP4;
        log(`[Receiver] Content type set to ${request.media.contentType}`);

        // Resolve request to continue playback
        return Promise.resolve(request);
      }
    );

    // Start the receiver context
    context.start(castReceiverOptions);

    // Add event listener for receiver errors
    context.addEventListener(cast.framework.system.EventType.ERROR, (e) => {
      logError('[Cast Receiver] Error:', e);
    });

  }).catch(error => {
    logError('Error initializing Shaka player:', error);
  });

// Logging functions
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
  const details = typeof error === 'object' ? JSON.stringify(error, null, 2) : error;
  log(`${message} ${details}`);
}
