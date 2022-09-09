const SOUNDS = {}; // GLOBAL SOUND ARRAY: DON'T EDIT
const soundList = [
  // MUSIC
  // Add your music asset here ^

  // SFX
  { file: "shoot.wav", name: "shoot" },
  { file: "collect.wav", name: "collect" },
  { file: "collect-spawn.wav", name: "collect_spawn" },
  { file: "explode.wav", name: "explode" },
  { file: "shield-hit.wav", name: "shield_hit" },
  // Add your sound asset here ^
];

// set only once the user interacts with the page
// to comply with browser "no autoplaying audio" rules
var audioCtx, audioMaster, compressor;

var sounds_to_load;
var sounds_loaded = true;

async function loadSounds(sound_object) {
  if (location.protocol == "file:") {
    console.log("not using a web server: unable to download sounds. ignoring.");
    return; // no sound if no web server
  }

  sounds_to_load = soundList.length;

  // Check for any errors in loading sound assets
  for (let i = 0; i < soundList.length; i++) {
    if (
      !soundList[i] ||
      checkForNamingCollisions(soundList, soundList[i].name, ASSET_TYPES.SOUND)
    ) {
      break;
    }

    sound_object[soundList[i].name] = await beginLoadingSound(
      soundList[i].name,
      soundList[i].file
    );
    sounds_to_load--;
  }

  if (!sound_loading_error) {
    console.log("sounds loaded");
    console.log(sound_object);
    sounds_loaded = true;
    return sound_object;
  }

  return {};
}

async function beginLoadingSound(sndName, fileName) {
  if (!audioCtx) {
    console.log("ERROR: beginLoadingSound has no audioCtx: " + fileName);
    return;
  }

  let src = "sounds/" + fileName;

  const response = await fetch(src);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  return audioBuffer;
}

function initSounds(sound_object) {
  // this must be run during the first click
  // and will cause a browser error if run earlier than that
  audioCtx = new AudioContext();
  audioMaster = audioCtx.createGain();

  // Create a compressor node
  compressor = audioCtx.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-60, audioCtx.currentTime);
  compressor.knee.setValueAtTime(40, audioCtx.currentTime); // was 50, but this causes a warning message in the console about it being out of range 0..40
  compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
  compressor.attack.setValueAtTime(0, audioCtx.currentTime);
  compressor.release.setValueAtTime(0.25, audioCtx.currentTime);
  audioMaster.connect(compressor);
  compressor.connect(audioCtx.destination);

  // finally we are allowed to run this safely
  return loadSounds(sound_object);
}

var is_chrome = navigator.userAgent.indexOf("Chrome") > -1;
var is_safari = navigator.userAgent.indexOf("Safari") > -1;
var noSoundDueToSafari = false;
if (is_chrome && is_safari) {
  is_safari = false;
} // Chrome also has "Safari" on Mac
noSoundDueToSafari = is_safari;
if (noSoundDueToSafari) {
  console.log(
    "Safari detected, skipping webAudio initialization to avoid crash"
  );
  initSounds = function () {};
}

function playSound(
  buffer,
  playbackRate = 1,
  pan = 0,
  volume = 0.2,
  loop = false
) {
  console.log(buffer);

  if (!buffer || !audioCtx) return;

  var source = audioCtx.createBufferSource();
  var gainNode = audioCtx.createGain();
  var panNode = audioCtx.createStereoPanner();

  source.buffer = buffer;
  source.connect(panNode);
  panNode.connect(gainNode);

  gainNode.connect(audioMaster);

  source.playbackRate.value = playbackRate;
  source.loop = loop;
  gainNode.gain.value = volume;
  panNode.pan.value = pan;
  source.start();
  return { volume: gainNode, sound: source };
}

initSounds(SOUNDS);
