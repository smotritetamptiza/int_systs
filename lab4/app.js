const Agent = require('./agent'); //importing Agent
const readline = require('readline');

const VERSION = 7; // server version
let teamName, coordinates1, coordinates2;
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function initPlayer(teamName, coordinates, goalie, role) {
  let agent = new Agent(teamName, coordinates, goalie, role);
  require('./socket')(agent, teamName, VERSION, goalie); // socket configuration
  setTimeout(function () {
    agent.socketSend('move', coordinates); // placing player on the field
  }, 10);
}

rl.question("Enter team name: ", function (answer) {
  teamName = answer || "myTeam";
  rl.question("Enter initial coordinates of the first player (X must be negative): ", function (answer) {
    coordinates1 = answer || "-15 10";
    rl.question("Enter initial coordinates of the second player (X must be negative): ", function (answer) {
      coordinates2 = answer || "-15 -10";
      rl.close();
    })
  })
})


rl.on('close', async () => {
  await initPlayer(teamName, coordinates1, false, "pass");
  await initPlayer(teamName, coordinates2, false, "score");

  await initPlayer("not_" + teamName, "-51 7", false, null);
  await initPlayer("not_" + teamName, "-51 -7", false, null);


})
