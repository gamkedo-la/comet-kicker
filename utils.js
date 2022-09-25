// GLOBAL UTILS
initializeScores(); // needs to be called early to get score data before game runs

// general
function loopClamp(num, min, max) {
  // when a number exceeds a maximum or goes below a minimum, wrap it back around to the other end of the range
  // idk if 'loopClamp' is the name for this concept lol
  if (num < min) return max;
  if (num > max) return min;
  return num;
}

function clamp(num, min, max) {
  if (num < min) return min;
  if (num > max) return max;
  return num;
}

function easing(x, target) {
  return (x += (target - x) * 0.1);
}

function choose(choices) {
  return choices[Math.floor(Math.random() * choices.length)];
}

function randomInt(min, max) {
  // helper function (inclusive: eg 1,10 may include 1 or 10)
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// object positions/tracking
function assignId(obj) {
  if (!obj.id) {
    obj.id = object_id_counter.toString();
    object_id_counter += 1;
  }

  return obj.id;
}

function storePreviousPosition(obj) {
  // If no entry for this object exists, create one (default to array)
  if (!object_position_map[obj.id]) {
    object_position_map[obj.id] = [];
  }

  // Store the object's current position in the corresponding array
  object_position_map[obj.id].push({ x: obj.x, y: obj.y });

  // If the position array has exceeded the maximum size, remove the oldest position
  if (object_position_map[obj.id].length > max_position_count) {
    object_position_map[obj.id].shift();
  }
}

// spawning
function spawnObject(obj, x, y) {
  var new_obj = { ...obj };
  new_obj.x = x;
  new_obj.y = y;
  GAME_OBJECTS.push(new_obj);
  return new_obj;
}

function spawnBullet(source, direction, projectile) {
  // Center of bullet source
  var source_center_x = source.x + source.w / 2;
  var source_center_y = source.y + source.h / 2;

  // Bullet to spawn
  var new_bullet = { ...projectile };

  // Spawn bullet at center of source, with a buffer for the horizontal direction
  new_bullet.x = source_center_x - projectile.w / 2;
  new_bullet.y = source_center_y;

  // Center bullet with source object
  new_bullet.x += source.w * Math.cos((direction * Math.PI) / 180);
  new_bullet.y -= new_bullet.h / 2;

  // Set bullet to move in given direction
  new_bullet.direction = direction;

  // Spawn bullet
  GAME_OBJECTS.push(new_bullet);

  return new_bullet;
}

function spawnEnemy() {
  var new_enemy = { ...ENEMY };
  var spawn_point = choose(SPAWN_LOCATIONS);
  new_enemy.x = withGrid(spawn_point.x);
  new_enemy.y = withGrid(spawn_point.y);
  new_enemy.direction = Math.random() > 0.5 ? 180 : 0;
  GAME_OBJECTS.push(new_enemy);
}

function spawnCollectible() {
  var new_collect = choose(COLLECTIBLES);
  var temp_collect = { ...new_collect };
  var spawn_point = choose(COLLECTIBLE_LOCATIONS);
  temp_collect.x = withGrid(spawn_point.x);
  temp_collect.y = withGrid(spawn_point.y);
  GAME_OBJECTS.push(temp_collect);
}

function spawnShield() {
  var new_shield = { ...ROTATING_SHIELD };
  new_shield.x = PLAYER.x;
  new_shield.y = PLAYER.y;
  GAME_OBJECTS.push(new_shield);
  playSound(SOUNDS["shield_hit"]);
}

// powerups
function checkPlayerPowerup() {
  switch (PLAYER.powerup) {
    case PICKUPS.WIDE_SHOT:
      PLAYER.bullet_type = WIDE_BULLET;
      break;
    case PICKUPS.RAPID_FIRE:
      PLAYER.bullet_type = WIDE_BULLET;
      break;
    case PICKUPS.SHIELD:
      if (!shield_spawned) {
        spawnShield();
        shield_spawned = true;
      }
    default:
      PLAYER.bullet_type = BULLET;
      break;
  }
}

function checkPickupType(collectible) {
  switch (collectible.pickup) {
    case PICKUPS.HP:
      PLAYER.hp += 1;
      break;
    case PICKUPS.POINTS:
      score += collectible.points;
      break;
    default:
      break;
  }
}

// level/map
function checkIfOutOfBounds(object) {
  return (
    object.x < 0 ||
    object.x + object.width > GAME_W ||
    object.y < 0 ||
    object.y + object.height > GAME_H
  );
}

function buildMap() {
  BLOCK_MAP.forEach((block) => {
    var new_block = { ...BLOCK };
    new_block.x = withGrid(block.x);
    new_block.y = withGrid(block.y);
    GAME_OBJECTS.push(new_block);
  });
}

function withGrid(number) {
  return Math.floor(number * UNIT_SIZE);
}

// physics
function collisionDetected(obj_a, obj_b) {
  return (
    obj_a.x < obj_b.x + obj_b.w &&
    obj_a.x + obj_a.w > obj_b.x &&
    obj_a.y < obj_b.y + obj_b.h &&
    obj_a.y + obj_a.h > obj_b.y
  );
}

function removeObj(obj) {
  var index = GAME_OBJECTS.indexOf(obj);
  GAME_OBJECTS.splice(index, 1);
}

function getHitbox(object, box_name) {
  if (object.hitboxes) {
    const myBox = object.hitboxes.find((box) => box.name === box_name);

    return myBox ? myBox : null;
  }
}

function updateHitboxes(object) {
  if (object.hitboxes) {
    const left = object.hitboxes.find((box) => box.name === "left");
    const right = object.hitboxes.find((box) => box.name === "right");

    if (left && right) {
      left.x = object.x;
      left.y = object.y;

      right.x = object.x + object.w - right.w;
      right.y = object.y;
    }
  }
}

function drawHitboxes(object) {
  object.hitboxes.forEach((box) => {
    context.fillStyle = box.color;
    context.fillRect(box.x, box.y, box.w, box.h);
  });
}

function recoil(object, shot, recoil_amount) {
  object.x -=
    recoil_amount * Math.cos((shot.direction * Math.PI) / 180) * time_scale;
  object.y -=
    recoil_amount * Math.sin((shot.direction * Math.PI) / 180) * time_scale;
}

function moveInOwnDirection(object) {
  object.x +=
    object.speed * Math.cos((object.direction * Math.PI) / 180) * time_scale;
  object.y +=
    object.speed * Math.sin((object.direction * Math.PI) / 180) * time_scale;
}

// game state
function resetGame() {
  GAME_OBJECTS.length = 0;
  GAME_OBJECTS.push(PLAYER);
  game_state = STATES.GAME_OVER;
  resetPlayer();
  saveScore(score);
  buildMap();
}

function resetPlayer() {
  const player_keys = Object.keys(PLAYER);
  player_keys.forEach((key) => {
    PLAYER[key] = PLAYER_DEFAULT[key];
  });
}

function startGame() {
  GAME_OBJECTS.push(PLAYER);
  buildMap();
}

// scores
function initializeScores() {
  // RECENT SCORES
  if (window.localStorage.getItem("recent_scores")) {
    recent_scores = JSON.parse(window.localStorage.getItem("recent_scores"));
  } else {
    recent_scores = [];
  }

  // HIGH SCORES
  if (window.localStorage.getItem("high_scores")) {
    high_scores = JSON.parse(window.localStorage.getItem("high_scores"));
  } else {
    high_scores = [];
  }
}

function saveScore(score) {
  // add to list of recent scores
  recent_scores?.push(score);
  window.localStorage.setItem("recent_scores", JSON.stringify(recent_scores));

  // if no scores are recorded, make first entry in high score array
  if (high_scores.length === 0) {
    high_scores = [score];
    window.localStorage.setItem("high_scores", JSON.stringify(high_scores));
    return;
  }

  // if other scores exist, find a place in the high score array
  for (var i = 0; i < high_scores.length; i++) {
    if (high_scores[i] < score) {
      high_scores.splice(i, 0, score);
      break;
    }
  }

  // if the high score list has exceeded the maximum length, remove the excess scores
  if (high_scores.length > max_high_score_list_length) {
    high_scores.splice(max_high_score_list_length - 1);
  }

  // save high scores
  window.localStorage.setItem("high_scores", JSON.stringify(high_scores));
}

function getAverageScore() {
  var number_of_scores = recent_scores.length;
  var sum = 0;
  for (var i = 0; i < recent_scores.length; i++) {
    sum += recent_scores[i];
  }

  return sum / number_of_scores;
}

// text
function getTextWidth(text) {
  return context.measureText(text).width;
}

function drawCenteredText(text, y_value) {
  context.fillText(text, GAME_W / 2 - getTextWidth(text) / 2, y_value);
}

// vfx/animation
function getPlayerAnimation() {
  return ANIMATIONS[PLAYER_STATE_TO_ANIMATION[PLAYER.state]];
}

function drawTrail(obj) {
  object_position_map[obj.id]?.forEach((pos, i) => {
    let ratio = (i + 1) / object_position_map[obj.id].length;
    let w = clamp(ratio * obj.w, 1, obj.w);
    let h = clamp(ratio * obj.h, 1, obj.h);
    context.fillStyle = "rgba(255, 255, 255, " + ratio / 2 + ")";
    context.fillRect(pos.x, pos.y, w, h);
  });
}

function explosion(x, y) {
  sparkle_fx(x, y);
  smoke_fx(x, y);
  fire_fx(x, y);
  playSound(SOUNDS["explode"]);
}

function drawBitmapCenteredAtLocationWithRotation(
  graphic,
  atX,
  atY,
  withAngle,
  alpha
) {
  if (!graphic) return;
  context.save(); // allows us to undo translate movement and rotate spin
  context.translate(atX, atY); // sets the point where our graphic will go
  context.rotate(withAngle); // sets the rotation
  if (alpha != undefined) context.globalAlpha = alpha;
  context.drawImage(graphic, -graphic.width / 2, -graphic.height / 2); // center, draw
  if (alpha != undefined) context.globalAlpha = 1;
  context.restore(); // undo the translation movement and rotation since save()
}

function updateScreenshake() {
  if (PLAYER.screenshakesRemaining) {
    // starts max size and gets smaller
    let wobble = Math.round(
      (PLAYER.screenshakesRemaining / PLAYER_HIT_SCREENSHAKES) *
        SCREENSHAKE_MAX_SIZE
    );
    if (PLAYER.screenshakesRemaining % 4 < 2) wobble *= -1; // alternate left/right every 2 frames
    context.setTransform(1, 0, 0, 1, wobble, 0);
    PLAYER.screenshakesRemaining--;
  } else {
    context.setTransform(1, 0, 0, 1, 0, 0); // reset
  }
}

function drawErrorMessage(message) {
  context.fillStyle = WHITE;
  context.fillText(message, GAME_W / 2 - 100, 10);
  context.fillText(ERROR_MESSAGES.CHECK_CONSOLE, GAME_W / 2 - 100, 25);
}

// sound
function setMusicVolume(vol) {
  music_volume = vol;
}

function playMusic(song) {
  let playbackRate = 1;
  let pan = 0;
  let volume = music_volume / 10;
  let loop = true;
  let sound = playSound(SOUNDS[song], playbackRate, pan, volume, loop);
  if (sound) {
    song_playing = true;
  }
  return sound;
}

// options
function toggleFullscreen() {
  fullscreen = !fullscreen;
  if (fullscreen) {
    canvas.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

// character actions
function jump(obj) {
  if (obj.jump_height < obj.max_jump_height) {
    obj.jump_height += obj.jump_rate;
    obj.y -= obj.jump_rate;
    return;
  }

  if (obj.hang_time <= 0) {
    obj.jump_rate = PLAYER_DEFAULT.jump_rate;
    return;
  }

  if (obj.jumping) {
    obj.jump_rate = easing(obj.jump_rate, 0);
    obj.y -= obj.jump_rate;
    obj.hang_time -= 1;
  }
}

function easeMovement(obj, direction) {
  obj.state = PLAYER_STATES.RUNNING;
  obj.speed = easing(obj.speed, obj.max_speed);
  obj.direction = direction;
  moveInOwnDirection(obj);
  obj.x = Math.floor(obj.x);
}

function screenwrap(obj) {
  if (obj.x + obj.w > GAME_W) {
    obj.x = 0;
  }

  if (obj.x + obj.w < 0) {
    obj.x = GAME_W - obj.w;
  }

  if (obj.y + obj.h > GAME_H) {
    obj.y = 0;
  }
}