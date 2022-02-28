const Agent = require('./agent'); //importing Agent
const readline = require('readline');

const VERSION = 7; // server version
let teamName, myCoordinates, velocity, rival, rivalCoordinates;
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function initPlayer(teamName, coordinates, velocity, printLocation) {
  let agent = new Agent(velocity, printLocation);
  require('./socket')(agent, teamName, VERSION); // socket configuration
  setTimeout(function () {
    agent.socketSend('move', coordinates); // placing player on the field
  }, 10);
}

rl.question("Enter team name: ", function (answer) {
  teamName = answer || "myTeam";
  rl.question("Enter initial coordinates (X must be negative): ", function (answer) {
    myCoordinates = answer || "-15 0";
    rl.question("Enter velocity: ", function (answer) {
      velocity = answer || "2";
      rl.question("Do you want to place a rival player? (y/n) ", function (answer) {
        if (answer.toLowerCase() == "y") {
          rival = true;
          rl.question("Enter initial coordinates of the rival player (X must be negative): ", function (answer) {
			let [x, y] = answer.split(' ');
			y = (-1) * Number(y);
			answer = x + ' ' + y;
            rivalCoordinates = answer || "-15 0";
            rl.close();
          })
        } else {
          rival = false;
          rl.close();
        }
      })
    })
  })
})


rl.on('close', async () => {
  await initPlayer(teamName, myCoordinates, velocity, true);
  if (rival) {
    await initPlayer('not_' + teamName, rivalCoordinates, 0, false);
  }
})
