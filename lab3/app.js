const Agent = require('./agent'); //importing Agent
const readline = require('readline');

const VERSION = 7; // server version
let teamName, coordinates1, coordinates2, coordinates3;
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function initPlayer(teamName, coordinates, goalie) {
  let agent = new Agent(teamName, coordinates, goalie);
  require('./socket')(agent, teamName, VERSION, goalie); // socket configuration
  setTimeout(function () {
    agent.socketSend('move', coordinates); // placing player on the field
  }, 10);
}

rl.question("Enter team name: ", function (answer) {
  teamName = answer || "myTeam";
  rl.question("Enter initial coordinates of the first player (X must be negative): ", function (answer) {
    coordinates1 = answer || "-15 0";
    rl.question("Do you want to add a second player? (y/n) ", function (answer) {
      if (answer.toLowerCase() == "y") {
        rl.question("Enter initial coordinates of the second player (X must be negative): ", function (answer) {
          coordinates2 = answer || "-15 0";
          rl.question("Do you want to add a third player? (y/n) ", function (answer) {
            if (answer.toLowerCase() == "y") {
              rl.question("Enter initial coordinates of the third player (X must be negative): ", function (answer) {
                coordinates3 = answer || "-15 0";
                rl.close();
              });
            } else {
              rl.close();
            }
          })
        });
      } else {
        rl.close();
      }
    })
  })
})


rl.on('close', async () => {
  await initPlayer(teamName, coordinates1, false);
  await initPlayer("not_" + teamName, "-50 0", true);
  if (coordinates2) {
    await initPlayer(teamName, coordinates2, false);
  }
  if (coordinates3) {
    await initPlayer(teamName, coordinates3, false);
  }
})
