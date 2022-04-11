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

	setTimeout(() => { initPlayer("A", "-10 -10", false, 'forward')}, 100)
	setTimeout(() => {  initPlayer("A", "-10 10", false, 'forward')}, 100)
  setTimeout(() => {  initPlayer("A", "-20 -20", false, 'forward')}, 100)
  setTimeout(() => {  initPlayer("A", "-20 20", false, 'forward')}, 100)
  setTimeout(() => {  initPlayer("A", "-10 0", false, 'forward')}, 100)
  setTimeout(() => {  initPlayer("A", "-25 0", false, 'defender')}, 100)
  setTimeout(() => {  initPlayer("A", "-30 -25", false, 'defender')}, 100)
  setTimeout(() => {  initPlayer("A", "-40 -10", false, 'defender')}, 100)
  setTimeout(() => {  initPlayer("A", "-30 25", false, 'defender')}, 100)
  setTimeout(() => {  initPlayer("A", "-40 10", false, 'defender')}, 100)
	setTimeout(() => {  initPlayer("A", "-45 0", true, 'goalie')}, 100)

	setTimeout(() => {  initPlayer("B", "-10 -10", false, 'forward')}, 100)
	setTimeout(() => {  initPlayer("B", "-10 10", false, 'forward')}, 100)
  setTimeout(() => {  initPlayer("B", "-20 -20", false, 'forward')}, 100)
  setTimeout(() => {  initPlayer("B", "-20 20", false, 'forward')}, 100)
  setTimeout(() => {  initPlayer("B", "-10 0", false, 'forward')}, 100)
  setTimeout(() => {  initPlayer("B", "-25 0", false, 'defender')}, 100)
  setTimeout(() => {  initPlayer("B", "-30 -25", false, 'defender')}, 100)
  setTimeout(() => {  initPlayer("B", "-40 -10", false, 'defender')}, 100)
  setTimeout(() => {  initPlayer("B", "-30 25", false, 'defender')}, 100)
  setTimeout(() => {  initPlayer("B", "-40 10", false, 'defender')}, 100)

	setTimeout(() => {  initPlayer("B", "-45 0", true, 'goalie')}, 100)
}, 100)
console.log("DON'T FORGET TO CLOSE ME")
