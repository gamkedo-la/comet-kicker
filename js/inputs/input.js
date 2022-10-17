// ---Input Constants---
const INPUTS = {
  // == KEYBOARD ==
  // Arrow keys
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
  ArrowDown: false,

  // Letter Keys
  a: false,
  b: false,
  c: false,
  d: false,
  e: false,
  f: false,
  g: false,
  h: false,
  i: false,
  j: false,
  k: false,
  l: false,
  m: false,
  n: false,
  o: false,
  p: false,
  q: false,
  r: false,
  s: false,
  t: false,
  u: false,
  v: false,
  w: false,
  x: false,
  y: false,
  z: false,

  // SPACE
  [" "]: false,

  // MISC KEYS
  Enter: false,
  Escape: false,

  // == GAMEPAD ==
  left: false,
  right: false,
  down: false,
  up: false,
  lookleft: false,
  lookright: false,

  // analog sticks
  leftStick_xAxis: false,
  leftStick_yAxis: false,
  rightStick_xAxis: false,
  rightStick_yAxis: false,

  // buttons
  buttonA: false,
  buttonB: false,
  buttonX: false,
  buttonY: false,
  leftShoulder: false,
  rightShoulder: false,
  leftTrigger: false,
  rightTrigger: false,
  select: false,
  start: false,
  dpadUp: false,
  dpadDown: false,
  dpadLeft: false,
  dpadRight: false,
};

const INPUT_STATES = {
  idle: "idle",
  held: "held",
  pressed: "pressed",
  released: "released",
};

const DEFAULT_INPUT_STATE = {
  state: INPUT_STATES.idle,
  timer: 0,
  inputs: [],
};

/**
 * This data structure gets change in initializeInputState
 * Each element winds up looking like:
 * {
 *   "state": "idle",
 *   "timer": 0,
 *   "inputs": [
 *     "x",
 *     "buttonX",
 *     "c"
 *   ],
 *   "name": "shoot"
 * }
 */
const CONTROLS = {
  shoot: ["x", "buttonX", "c"],
  jump: [" ", "buttonA", "buttonY"],
  moveLeft: ["ArrowLeft", "dpadLeft", "left"],
  moveRight: ["ArrowRight", "dpadRight", "right"],
  moveUp: ["ArrowUp", "dpadUp", "up"],
  moveDown: ["ArrowDown", "dpadDown", "down"],
  pause: ["Escape", "start"],
  select: [" ", "select"],
  start: ["start", "Enter"],
  accept: ["Enter", "buttonA", "x"],
  decline: ["Escape", "buttonB", " "],
  autoKill: ["c"],
};

function initializeInputState() {
  for(let control in CONTROLS){
    if(localStorage.getItem(control)) {
      CONTROLS[control] = JSON.parse(localStorage.getItem(control));
    }
  }
  const controls = Object.keys(CONTROLS);
  controls.forEach(function (control) {
    const inputs = [...CONTROLS[control]];
    CONTROLS[control] = { ...DEFAULT_INPUT_STATE, inputs, name: control };
  });
}

initializeInputState();

// --- State Checks ---
function wasPressed(inputs) {
  var pressed = false;
  inputs.forEach((input) => {
    if (INPUTS[input]) {
      pressed = true;
    }
  });
  return pressed;
}

function wasReleased(inputs) {
  var released = true;
  inputs.forEach((input) => {
    if (INPUTS[input]) {
      released = false;
    }
  });
  return released;
}

function inputStateMachine(input) {
  // Button states:
  // Idle
  // -- default state
  // -- if activated, go to Pressed state
  // Pressed
  // -- if released, go to Idle state
  // -- If still pressed on next frame, go to Held state
  // Held
  // -- increment hold timer
  // -- if released, go to Idle state. Reset timer.
  switch (input.state) {
    // IDLE
    case INPUT_STATES.idle:
      if (wasPressed(input.inputs)) {
        input.state = INPUT_STATES.pressed;
      }

      break;

    // PRESSED
    case INPUT_STATES.pressed:
      if (wasReleased(input.inputs)) {
        input.state = INPUT_STATES.idle;
      }

      input.state = INPUT_STATES.held;

      break;

    // HELD
    case INPUT_STATES.held:
      input.timer++;

      if (wasReleased(input.inputs)) {
        input.state = INPUT_STATES.released;
        input.timer = 0;
      }

      break;

    // RELEASED
    case INPUT_STATES.released:
      input.state = INPUT_STATES.idle;

      break;
  }
}

// ---INPUT API---

// Only detects first input
// if (onPress(CONTROLS.myInput)) {
//    (...some logic)
// }
function onPress(input) {
  return input.state === INPUT_STATES.pressed;
}

// Only detects when button is released
// if (onRelease(CONTROLS.myInput)) {
//    (...some logic)
// }
function onRelease(input) {
  if (input.state === INPUT_STATES.released) {
    input.state = INPUT_STATES.idle;
    return true;
  }

  return false;
}

// Returns true for as long as the button is held
// if (onHold(CONTROLS.myInput)) {
//    (...some logic)
// }
function onHold(input) {
  return input.state === INPUT_STATES.held;
}

// -- Remapping ---
function remapInput(control, newInput, index) {
  if (CONTROLS[control]) {
    CONTROLS[control].inputs[index] = newInput;
    localStorage.setItem(control, JSON.stringify(CONTROLS[control].inputs));
  }
}

// ---Listeners---
function keyListener() {
  const input_keys = Object.keys(CONTROLS);
  input_keys.forEach((key) => {
    inputStateMachine(CONTROLS[key]);
  });
}

function gamepadListener() {
  const inputs = Object.keys(GAMEPAD);
  inputs.forEach((input) => {
    if (
      typeof GAMEPAD[input] === "function" &&
      input !== "butt" &&
      input !== "axis"
    ) {
      INPUTS[input] = GAMEPAD[input]() ? true : false;
    }
  });
}

function inputListener() {
  gamepadListener();
  keyListener();
}

window.addEventListener("keydown", function (e) {
  console.log(e);
  if (Object.keys(INPUTS).includes(e.key)) {
    console.log(e.key + " is held");
    INPUTS[e.key] = true;
  }
});

window.addEventListener("keyup", function (e) {
  console.log(e);
  if (Object.keys(INPUTS).includes(e.key)) {
    console.log(e.key + " is lifted");
    INPUTS[e.key] = false;
  }
});
