function start() {
  $("#start").hide();

  $("#background-game").append("<div id='player' class='animation-player'></div>");
  $("#background-game").append("<div id='enemy1' class='animation-enemy'></div>");
  $("#background-game").append("<div id='enemy2' class='animation-enemy2'></div>");
  $("#background-game").append("<div id='ally' class='animation-ally'></div>");

  let game = {};

  game.timer = setInterval(loop, 30);

  function loop() {
    moveBackground();
  }

  function moveBackground() {
    moveLeft = parseInt($("#background-game").css("background-position"));
    $("#background-game").css("background-position", moveLeft - 1);
  }
}
