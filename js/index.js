// logic loop
// -- check for errors
// -- update music
// -- process input
// -- update player
// -- update objects
// -- run physics

// LOOP FUNCTIONS
function update(dt) {
  // ERROR MESSAGES
  if (image_loading_error || sound_loading_error) {
    return;
  }

  if (!images_loaded || !sounds_loaded) {
    return;
  }

  // PARTICLE SYSTEM
  particles.update();

  // MUSIC
  updateMusic();

  // PARALLAX BACKGROUNDS
  updateBackground();

  // MENU NAVIGATION/INTERACTION
  if (game_state === STATES.MENU) {
    updateMenuNavigation();
    return;
  }

  if (game_state === STATES.GAME_OVER) {
    updateGameOverScreen();
    return;
  }

  // PAUSING
  if (game_state === STATES.GAME) {
    pauseGame();
  }

  // ==============
  // --- PLAYER ---
  // ==============
  // PLAYER MOVEMENT
  playerMove();

  // SHOOTING
  playerShoot();

  // JUMPING
  playerJump();

  // ANIMATIONS
  PLAYER.animation = getPlayerAnimation();

  // POWERUPS
  checkPlayerPowerup();

  // IFRAME COUNTER
  updateIFrameCounter();

  // SCREEN WRAPPING
  screenwrap(PLAYER);

  // HITBOXES
  updateHitboxes(PLAYER);

  // SHIELD
  var shield = GAME_OBJECTS.find((obj) => obj.type === "shield");
  if (shield) {
    rotateShield(shield); // updates shield timer
  }

  if (shield && shield_timer > 80) {
    despawnShield(shield);
  }

  // ====================
  // --- GAME OBJECTS ---
  // ====================
  // OBJECT COLLECTIONS
  var enemies = GAME_OBJECTS.filter((obj) => obj.type === "enemy");
  var collectibles = GAME_OBJECTS.filter((obj) => obj.type === "collect");
  var blocks = GAME_OBJECTS.filter((obj) => obj.type === "floor");
  var bullets = GAME_OBJECTS.filter((obj) => obj.type === "bullet");
  var text = GAME_OBJECTS.filter((obj) => obj.type === "text");

  // UPDATE OBJECT COLLECTIONS
  updateShots(bullets);
  updateEnemies(enemies);
  updateText(text);

  // COLLECTIBLE SPAWNS
  updateCollectibleSpawnTimer(collectibles);

  // ENEMY SPAWNS
  updateEnemySpawnTimer(enemies);

  // ==============
  // --- PHYSICS ---
  // ==============
  // PHYSICS
  applyGravityToObjects();

  PLAYER.y -= PLAYER.y_velocity;

  // COLLISION CHECKS
  // player to block
  PLAYER.hit_ground = false;
  blocks.forEach((block) => {
    if (collisionDetected(block, PLAYER)) {
      PLAYER.hit_ground = true;
      PLAYER.jumping = false;
      PLAYER.hang_time = PLAYER_DEFAULT.hang_time;
      PLAYER.jump_height = PLAYER_DEFAULT.jump_height;
      PLAYER.y_velocity = PLAYER_DEFAULT.y_velocity;
      if (!PLAYER.hit_ground_last_frame) fall_fx(PLAYER.x, PLAYER.y);
      PLAYER.y = PLAYER.prev_y;
    }

    const leftBox = getHitbox(PLAYER, "left");
    const rightBox = getHitbox(PLAYER, "right");

    if (
      collisionDetected(block, leftBox) ||
      collisionDetected(block, rightBox)
    ) {
      PLAYER.hit_wall = true;
      PLAYER.x = PLAYER.prev_x;
    }
  });

  // collectible to player
  collectibles.forEach((coll) => {
    coll.life_timer -= 1;

    if (coll.life_timer <= 0) {
      removeObj(coll);
      return;
    }

    if (collisionDetected(coll, PLAYER)) {
      checkPickupType(coll);

      removeObj(coll);

      playSoundEffect("collect");

      let new_text_obj = spawnObject(TEXT_OBJECT, PLAYER.x, PLAYER.y);
      new_text_obj.text = PICKUP_TEXT[coll.pickup].toUpperCase();
      if (new_text_obj.text === PICKUPS.POINTS.toUpperCase()) {
        new_text_obj.text = "+" + coll.points;
      }

      if (coll.pickup !== PICKUPS.HP || coll.pickup !== PICKUPS.POINTS) {
        PLAYER.powerup = coll.pickup;
      }
    }

    // floating animation
    coll.y = coll.y + Math.sin(coll.life_timer * 0.1) * 0.5;
  });

  // bullet to enemy
  bullets.forEach((bullet) => {
    enemies.forEach((enemy) => {
      if (collisionDetected(enemy, bullet)) {
        removeObj(enemy);
        if (start_combo) {
          multiplier += 1;
          multiplier_timer = 200;
        }
        score += enemy_point_value * multiplier;
        let text_object = spawnObject(TEXT_OBJECT, enemy.x, enemy.y);
        text_object.text = "+" + enemy_point_value + " x " + multiplier;
        explosion(enemy.x, enemy.y);
        start_combo = true;
      }
    });
  });

  // enemies
  enemies.forEach((enemy) => {
    // enemy to player
    if (collisionDetected(enemy, PLAYER)) {
      if (!PLAYER.hit) {
        PLAYER.hp -= 1;
        removeObj(enemy);
        playSoundEffect("lose_hp");
      }
      PLAYER.hit = true;
      PLAYER.screenshakesRemaining = PLAYER_HIT_SCREENSHAKES;
      explosion(PLAYER.x, PLAYER.y);
    }

    // enemy to shield
    if (shield && collisionDetected(enemy, shield)) {
      removeObj(enemy);
      PLAYER.screenshakesRemaining = PLAYER_HIT_SCREENSHAKES;
      explosion(shield.x, shield.y);
    }

    blocks.forEach((block) => {
      if (collisionDetected(block, enemy)) {
        if (enemy.exploding) {
          // destroy platform
          removeObj(enemy);
          removeObj(block);
          explosion(enemy.x, enemy.y);
        }
      }
    });
  });

  // ===============
  // --- SCORING ---
  // ===============
  // SCORE
  updateScore();

  // COMBOS
  updateComboTimer();

  // ============================
  // --- END OF FRAME CLEANUP ---
  // ============================
  // TRACKING
  // track all game objects and their previous positions
  trackPositionsOfObjects();

  // ROUNDING
  // round object's x & y movement to prevent blurriness
  GAME_OBJECTS.forEach((obj) => {
    if (obj.type === "collect") return;
    obj.x = Math.floor(obj.x);
    obj.y = Math.floor(obj.y);
  });
  PLAYER.y = Math.floor(PLAYER.y);
  PLAYER.x = Math.floor(PLAYER.x);

  // store whether or not the player hit the ground in this frame,
  // use on next frame to determine if we render a dust effect
  PLAYER.hit_ground_last_frame = PLAYER.hit_ground;
  PLAYER.hit_wall = false;

  checkForGameOver();
}

function draw(offset) {
  context.globalAlpha = 1;
  context.fillStyle = PURPLE;
  context.fillRect(0, 0, GAME_W, GAME_H);

  // ERROR MESSAGES
  if (image_loading_error) {
    drawErrorMessage(ERROR_MESSAGES.IMAGE_LOADING_ERROR);
    return;
  }

  if (sound_loading_error) {
    drawErrorMessage(ERROR_MESSAGES.SOUND_LOADING_ERROR);
    return;
  }

  // LOADING SCREEN
  if (!images_loaded || !sounds_loaded) {
    context.fillStyle = WHITE;
    context.fillText("Loading assets...", GAME_W / 2 - 50, 10);
    return;
  }

  // SCREENSHAKE
  updateScreenshake();

  // PARTICLES
  particles.draw();

  // GAME/PAUSE
  if (game_state === STATES.GAME || game_state === STATES.PAUSE) {
    drawBackground();

    drawObjects();

    drawScore();

    drawHP();
  }

  // DRAW PAUSE SCREEN
  if (game_state === STATES.PAUSE) {
    // overlay
    context.globalAlpha = 0.5;
    context.fillStyle = "black";
    context.fillRect(0, 0, GAME_W, GAME_H);
    context.globalAlpha = 1;

    // pause text
    context.fillStyle = WHITE;
    context.fillText(getText("game_paused"), GAME_W / 2 - 90, 100);
    context.fillText(getText("press_enter_to_continue"), GAME_W / 2 - 90, 150);
  }

  // DRAW GAME OVER SCREEN
  if (game_state === STATES.GAME_OVER) {
    drawPauseScreen();
  }

  // DRAW CURRENT MENU
  if (game_state === STATES.MENU) {
    titlescreenFX();
    context.fillStyle = WHITE;
    renderMenu(getCurrentMenu());
  }
}

// CORE GAME LOOP
// fixed time-step loop with variable rendering
function loop() {
  let current_time = Date.now();
  let elapsed = current_time - start_time;
  start_time = current_time;
  lag += elapsed;

  inputListener();

  if (game_state === STATES.PAUSE) {
    if (onPress(CONTROLS.start)) {
      game_state = STATES.GAME;
    }
  } else {
    while (lag > frame_duration) {
      update(elapsed);
      lag -= 1000 / fps;
      if (lag < 0) lag = 0;
    }
  }

  var lag_offset = lag / frame_duration;
  draw(lag_offset);

  window.requestAnimationFrame(loop);
}

// INIT
startGame();

loop();
