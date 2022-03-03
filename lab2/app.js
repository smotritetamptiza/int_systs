const Agent = require('./agent'); //importing Agent
const readline = require('readline');

const VERSION = 7; // server version
let teamName, myCoordinates;
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function initPlayer(teamName, coordinates) {
  let agent = new Agent();
  require('./socket')(agent, teamName, VERSION); // socket configuration
  setTimeout(function () {
    agent.socketSend('move', coordinates); // placing player on the field
  }, 10);
}

rl.question("Enter team name: ", function (answer) {
  teamName = answer || "myTeam";
  rl.question("Enter initial coordinates (X must be negative): ", function (answer) {
    myCoordinates = answer || "-15 0";
    rl.close();
  })
})


rl.on('close', async () => {
  await initPlayer(teamName, myCoordinates);
})
