const Agent = require('./agent'); //importing Agent
const readline = require('readline');

const VERSION = 7; // server version
let teamName = 'teamA';
let myCoordinates = "-15 0";
let velocity = "5";
let rival = false;
let rivalCoordinates = "15 0";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Enter team name: ", function (answer) {
  teamName = answer;
  rl.question("Enter initial coordinates: ", function (answer) {
    myCoordinates = answer;
    rl.question("Enter velocity: ", function (answer) {
      velocity = answer;
      rl.question("Do you want to place a rival player? (y/n) ", function (answer) {
        if (answer.toLowerCase() == "y") {
          rival = true;
          rl.question("Enter initial coordinates of the rival player:   ", function (answer) {
            rivalCoordinates = answer;
            rl.close();
          })
        } else {
          rl.close();
        }
      })
    })
  })
})


rl.on('close', () => {
  console.log(teamName);
  let agent = new Agent(velocity);
  require('./socket')(agent, teamName, VERSION); // socket configuration
  agent.socketSend('move', myCoordinates); // placing player on the field
})
