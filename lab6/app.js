const Agent = require('./agent'); //importing Agent
const readline = require('readline');

const VERSION = 7; // server version

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


setTimeout(() =>{
	setTimeout(() => { initPlayer("A", "-20 0", false, true)}, 100)
	//setTimeout(() => {  initPlayer("A", "-20 5", false, true)}, 100)
	//setTimeout(() => {  initPlayer("A", "-45 0", true, false)}, 100)
	
	//setTimeout(() => {  initPlayer("B", "-20 -15", false, true)}, 100)
	//setTimeout(() => {  initPlayer("B", "-20 5", false, true)}, 100)
	setTimeout(() => {  initPlayer("B", "-45 0", true, false)}, 100)
}, 100)
console.log("DON'T FORGET TO CLOSE ME")
