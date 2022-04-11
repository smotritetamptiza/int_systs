const Agent = require('./agent'); //importing Agent

const VERSION = 7; // server version

function initPlayer(teamName, coordinates, goalie, role) {
  let agent = new Agent(teamName, coordinates, role);
  require('./socket')(agent, teamName, VERSION, goalie); // socket configuration
  setTimeout(function () {
    agent.socketSend('move', coordinates); // placing player on the field
  }, 10);
}


setTimeout(() =>{
	setTimeout(() => { initPlayer("A", "-5 -15", false, 'forward')}, 100)
	setTimeout(() => {  initPlayer("A", "-20 -10", false, 'forward')}, 100)
	setTimeout(() => { initPlayer("A", "-5 15", false, 'forward')}, 100)
	setTimeout(() => {  initPlayer("A", "-20 10", false, 'forward')}, 100)
	setTimeout(() => { initPlayer("A", "-15 0", false, 'forward')}, 100)
	
  	setTimeout(() => {  initPlayer("A", "-42 -17", false, 'defender')}, 100)
  	setTimeout(() => {  initPlayer("A", "-37 -7", false, 'defender')}, 100)
	setTimeout(() => {  initPlayer("A", "-42 17", false, 'defender')}, 100)
  	setTimeout(() => {  initPlayer("A", "-37 7", false, 'defender')}, 100)
  	setTimeout(() => {  initPlayer("A", "-32 0", false, 'defender')}, 100)
	
	setTimeout(() => {  initPlayer("A", "-45 0", true, 'goalie')}, 100)

	setTimeout(() => { initPlayer("B", "-5 -15", false, 'forward')}, 100)
	setTimeout(() => {  initPlayer("B", "-20 -10", false, 'forward')}, 100)
	setTimeout(() => { initPlayer("B", "-5 15", false, 'forward')}, 100)
	setTimeout(() => {  initPlayer("B", "-20 10", false, 'forward')}, 100)
	setTimeout(() => { initPlayer("B", "-15 0", false, 'forward')}, 100)
	
  	setTimeout(() => {  initPlayer("B", "-42 -17", false, 'defender')}, 100)
  	setTimeout(() => {  initPlayer("B", "-37 -7", false, 'defender')}, 100)
	setTimeout(() => {  initPlayer("B", "-42 17", false, 'defender')}, 100)
  	setTimeout(() => {  initPlayer("B", "-37 7", false, 'defender')}, 100)
  	setTimeout(() => {  initPlayer("B", "-32 0", false, 'defender')}, 100)
	setTimeout(() => {  initPlayer("B", "-45 0", true, 'goalie')}, 100)
}, 100)
console.log("DON'T FORGET TO CLOSE ME")
