let canPlay = false;

function initForm() {
  const playBtn = document.getElementById('playBtn');
  const fileInput = document.getElementById('fileInput');

  playBtn.addEventListener("click", () => {
    const file = fileInput.files[0];
    if (!file) {
      return;
    }
    readFile(fileInput.files[0])
      .catch(error => {
        console.error('Error reading file:', error);
      });
  });
}

const readFile = async (file) => {
  const text = await file.text();
  textJson = JSON.parse(text);
  try {
    window['mpdUri'] = textJson['mpdUri'];
    window['initData'] = textJson['initData'];
    window['response'] = textJson['response'];
  } catch (e) {
    console.error('Error parsing file: missing field(s).');
    return;
  }
  initPlayer();
  console.log("Done parsing file");
};


/*****************
Shaka Player Code
*****************/
function initApp() {
  // Install built-in polyfills to patch browser incompatibilities.
  shaka.polyfill.installAll();

  // Check to see if the browser supports the basic APIs Shaka needs.
  if (shaka.Player.isBrowserSupported()) {
    // Everything looks good!
    return true;
  } else {
    // This browser does not have the minimum set of APIs we need.
    console.error('Browser not supported!');
    return false;
  }
}

async function initPlayer() {
  // Create a Player instance.
  const video = document.getElementById('video');
  const player = new shaka.Player();
  await player.attach(video);

  // Attach player to the window to make it easy to access in the JS console.
  window.player = player;

  // Listen for error events.
  player.addEventListener('error', onErrorEvent);

  player.configure({
    drm: {
      servers: {
        'com.widevine.alpha': 'https://cwip-shaka-proxy.appspot.com/no_auth'
      }
    }
  });

  // Try to load a manifest.
  // This is an asynchronous process.
  try {
    await player.load(window['mpdUri']);
    // This runs if the asynchronous load is successful.
    console.log('The video has now been loaded!');
  } catch (e) {
    // onError is executed if the asynchronous load fails.
    onError(e);
  }
}

function onErrorEvent(event) {
  // Extract the shaka.util.Error object from the event.
  onError(event.detail);
}

function onError(error) {
  // Log the error.
  console.error('Error code', error.code, 'object', error);
}

document.addEventListener('DOMContentLoaded', () => {
  if (initApp())
    initForm();
});