function start() {
  $("#start").hide();

  $("#background-game").append("<div id='player' class='animation-player'></div>");
  $("#background-game").append("<div id='enemy1' class='animation-enemy'></div>");
  $("#background-game").append("<div id='enemy2' class='animation-enemy2'></div>");
  $("#background-game").append("<div id='ally' class='animation-ally'></div>");
  $("#background-game").append("<div id='score'></div>");
  $("#background-game").append("<div id='energy'></div>");

  // GAME VARIABLES
  let game = {};

  let KEY = {
    W: 87,
    S: 83,
    D: 68,
  };

  game.press = [];

  let speedEnemy = 5;
  let enemyPositionY = parseInt(Math.random() * 334);
  let canShoot = true;
  let gameOver = false;

  let score = 0;
  let saved = 0;
  let lost = 0;

  let energyStatus = 3;

  let soundShoot = document.getElementById("shootSound");
  let soundExplosion = document.getElementById("explosionSound");
  let soundGameOver = document.getElementById("gameOverSOund");
  let soundSaved = document.getElementById("savedSound");
  let soundLost = document.getElementById("lostSound");
  let soundBG = document.getElementById("bgGameSound");

  // KEY PRESSED
  $(document).keydown(function (e) {
    game.press[e.which] = true;
  });

  $(document).keyup(function (e) {
    game.press[e.which] = false;
  });

  //GAME LOOP

  soundBG.addEventListener(
    "ended",
    function () {
      soundBG.currentTime = 0;
      soundBG.play();
    },
    false
  );
  soundBG.play();

  game.timer = setInterval(loop, 30);

  function loop() {
    moveBackground();
    movePlayer();
    moveEnemy();
    moveEnemy_truck();
    moveAlly();
    gameCollision();
    scoreUpdate();
    energyUpdate();
  }

  //FUNCTIONS - MOVE BACKGROUND

  function moveBackground() {
    moveLeft = parseInt($("#background-game").css("background-position"));
    $("#background-game").css("background-position", moveLeft - 1);
  }

  //MOVE PLAYER
  function movePlayer() {
    if (game.press[KEY.W]) {
      let top = parseInt($("#player").css("top"));
      $("#player").css("top", top - 10);

      if (top <= 0) {
        $("#player").css("top", top + 10);
      }
    }

    if (game.press[KEY.S]) {
      let top = parseInt($("#player").css("top"));
      $("#player").css("top", top + 10);

      if (top >= 434) {
        $("#player").css("top", top - 10);
      }
    }

    if (game.press[KEY.D]) {
      shoot();
    }
  }

  //MOVE ENEMY 1
  function moveEnemy() {
    let enemyPositionX = parseInt($("#enemy1").css("left"));
    $("#enemy1").css("left", enemyPositionX - speedEnemy);
    $("#enemy1").css("top", enemyPositionY);

    if (enemyPositionX <= 0) {
      enemyPositionY = parseInt(Math.random() * 334);
      $("#enemy1").css("left", 694);
      $("#enemy1").css("top", enemyPositionY);
    }
  }

  //MOVE ENEMY 2
  function moveEnemy_truck() {
    let enemyPositionX = parseInt($("#enemy2").css("left"));
    $("#enemy2").css("left", enemyPositionX - 3);

    if (enemyPositionX <= 0) {
      $("#enemy2").css("left", 775);
    }
  }

  // MOVE ALLY
  function moveAlly() {
    let allyPositionX = parseInt($("#ally").css("left"));
    $("#ally").css("left", allyPositionX + 1);

    if (allyPositionX >= 906) {
      $("#ally").css("left", 0);
    }
  }

  // SHOOT
  function shoot() {
    if (canShoot) {
      soundShoot.play();
      canShoot = false;
      let playerTop = parseInt($("#player").css("top"));
      let playerX = parseInt($("#player").css("left"));
      let shootX = playerX + 190;
      let shootTop = playerTop + 37;

      $("#background-game").append("<div id='shoot'></div>");
      $("#shoot").css("top", shootTop);
      $("#shoot").css("left", shootX);

      var shootTime = window.setInterval(moveShoot, 30);
    }

    //MOVE SHOOT
    function moveShoot() {
      let shootX = parseInt($("#shoot").css("left"));
      $("#shoot").css("left", shootX + 15);

      if (shootX > 900) {
        window.clearInterval(shootTime);
        shootTime = null;
        $("#shoot").remove();
        canShoot = true;
      }
    }
  }

  //COLLISIONS
  function gameCollision() {
    let collisionWithEnemy1 = $("#player").collision($("#enemy1"));
    let collisionWithEnemy2 = $("#player").collision($("#enemy2"));
    let collisionWithShoot1 = $("#shoot").collision($("#enemy1"));
    let collisionWithShoot2 = $("#shoot").collision($("#enemy2"));
    let collisionWithAlly = $("#player").collision($("#ally"));
    let collisionEnAlly = $("#enemy2").collision($("#ally"));

    // PLAYER WITH ENEMY1
    if (collisionWithEnemy1.length > 0) {
      energyStatus--;
      let enemyPX = parseInt($("#enemy1").css("left"));
      let enemyPY = parseInt($("#enemy1").css("top"));
      explosion1(enemyPX, enemyPY);

      enemyPositionY = parseInt(Math.random() * 334);
      $("#enemy1").css("left", 694);
      $("#enemy1").css("top", enemyPositionY);
    }

    //PLAYER WITH ENEMY2
    if (collisionWithEnemy2.length > 0) {
      energyStatus--;
      let enemy2PX = parseInt($("#enemy2").css("left"));
      let enemy2PY = parseInt($("#enemy2").css("top"));
      explosion2(enemy2PX, enemy2PY);

      $("#enemy2").remove();

      newPositionEnemy2();
    }

    // SHOOT WITH ENEMY1
    if (collisionWithShoot1.length > 0) {
      speedEnemy = speedEnemy + 0.2;
      score = score + 100;

      let enemy1PX = parseInt($("#enemy1").css("left"));
      let enemy1PY = parseInt($("#enemy1").css("top"));

      explosion1(enemy1PX, enemy1PY);
      $("#shoot").css("left", 950);

      enemyPositionY = parseInt(Math.random() * 334);
      $("#enemy1").css("left", 694);
      $("#enemy1").css("top", enemyPositionY);
    }

    //SHOOT WITH ENEMY2
    if (collisionWithShoot2.length > 0) {
      score = score + 50;
      let enemy2PX = parseInt($("#enemy2").css("left"));
      let enemy2PY = parseInt($("#enemy2").css("top"));
      $("#enemy2").remove();

      explosion2(enemy2PX, enemy2PY);
      $("#shoot").css("left", 950);

      newPositionEnemy2();
    }

    // PLAYER AND ALLY
    if (collisionWithAlly.length > 0) {
      saved++;
      soundSaved.play();
      newPositionAlly();
      $("#ally").remove();
    }

    // ENEMY2 WITH ALLY
    if (collisionEnAlly.length > 0) {
      lost++;
      let allyX = parseInt($("#ally").css("left"));
      let allyY = parseInt($("#ally").css("top"));
      explosion3(allyX, allyY);

      $("#ally").remove();
      newPositionAlly();
    }
  } //COLLISION FUNCTION END

  // EXPLOSION 1
  function explosion1(enemyPX, enemyPY) {
    soundExplosion.play();
    $("#background-game").append("<div id='explosion'></div>");
    $("#explosion").css("background-image", "url(/resources/imgs/explosao.png)");

    let div = $("#explosion");
    div.css("top", enemyPY);
    div.css("left", enemyPX);
    div.animate({ width: 200, opacity: 0 }, "slow");

    let explosionTime = window.setInterval(removeExplosion, 1000);

    function removeExplosion() {
      div.remove();
      window.clearInterval(explosionTime);
      explosionTime = null;
    }
  }

  //NEW POSITION ENEMY 2
  function newPositionEnemy2() {
    let moveTime = window.setInterval(newPosition, 5000);

    function newPosition() {
      window.clearInterval(moveTime);
      moveTime = null;

      if (gameOver == false) {
        $("#background-game").append("<div id='enemy2'></div");
      }
    }
  }

  //EXPLOSION 2
  function explosion2(enemy2PX, enemy2PY) {
    soundExplosion.play();
    $("#background-game").append("<div id='explosion2'></div");
    $("#explosion2").css("background-image", "url(/resources/imgs/explosao.png)");
    var div2 = $("#explosion2");
    div2.css("top", enemy2PY);
    div2.css("left", enemy2PX);
    div2.animate({ width: 200, opacity: 0 }, "slow");

    var explosionTime2 = window.setInterval(removeExplosion2, 1000);

    function removeExplosion2() {
      div2.remove();
      window.clearInterval(explosionTime2);
      explosionTime2 = null;
    }
  }

  // NEW POSITION ALLY
  function newPositionAlly() {
    let allyTime = window.setInterval(moveAlly, 6000);

    function moveAlly() {
      window.clearInterval(allyTime);
      allyTime = null;

      if (gameOver == false) {
        $("#background-game").append("<div id='ally' class='animation-ally'></div>");
      }
    }
  }

  // EXPLOSION 3
  function explosion3(allyX, allyY) {
    soundLost.play();
    $("#background-game").append(
      "<div id='explosion3' class='animation-ally-dead'></div>"
    );
    $("#explosion3").css("top", allyY);
    $("#explosion3").css("left", allyX);

    let explosionTime3 = window.setInterval(resetExplosion3, 1000);
    function resetExplosion3() {
      $("#explosion3").remove();
      window.clearInterval(explosionTime3);
      explosionTime3 = null;
    }
  }

  // SCORE
  function scoreUpdate() {
    $("#score").html(
      "<h2> Score: " + score + " | Saved: " + saved + " | Lost: " + lost + "</h2>"
    );
  }

  //ENERGY
  function energyUpdate() {
    if (energyStatus === 3) {
      $("#energy").css("background-image", "url('../resources/imgs/energia3.png')");
    } else if (energyStatus === 2) {
      $("#energy").css("background-image", "url('../resources/imgs/energia2.png')");
    } else if (energyStatus === 1) {
      $("#energy").css("background-image", "url('../resources/imgs/energia1.png')");
    } else if (energyStatus === 0) {
      $("#energy").css("background-image", "url('../resources/imgs/energia0.png')");
    }
  }
}
