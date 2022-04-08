const Agent = require('./agent') // Импорт агента
const VERSION = 7 // Версия сервера
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

setTimeout(() => {
  setTimeout(() => {
    createAgent('A', 0, -10, 0)
  }, 100)
  setTimeout(() => {
    createAgent('A', 0, -5, -25)
  }, 110)
  setTimeout(() => {
    createAgent('A', 0, -5, 25)
  }, 120)
  setTimeout(() => {
    createAgent('A', 0, -15, -15)
  }, 130)
  setTimeout(() => {
    createAgent('A', 0, -15, 15)
  }, 140)
  setTimeout(() => {
    createAgent('A', 0, -25, -15)
  }, 150)
  setTimeout(() => {
    createAgent('A', 0, -25, 15)
  }, 160)
  setTimeout(() => {
    createAgent('A', 0, -35, -25)
  }, 170)
  setTimeout(() => {
    createAgent('A', 0, -35, 0)
  }, 180)
  setTimeout(() => {
    createAgent('A', 0, -35, 25)
  }, 190)
  setTimeout(() => {
    createAgent('A', 0, -50, 0, 'goalie')
  }, 200)
  setTimeout(() => {
    createAgent('B', 0, -10, 0)
  }, 210)
  setTimeout(() => {
    createAgent('B', 0, -5, -25)
  }, 220)
  setTimeout(() => {
    createAgent('B', 0, -5, 25)
  }, 230)
  setTimeout(() => {
    createAgent('B', 0, -15, -15)
  }, 240)
  setTimeout(() => {
    createAgent('B', 0, -15, 15)
  }, 250)
  setTimeout(() => {
    createAgent('B', 0, -25, -15)
  }, 260)
  setTimeout(() => {
    createAgent('B', 0, -25, 15)
  }, 270)
  setTimeout(() => {
    createAgent('B', 0, -35, -25)
  }, 280)
  setTimeout(() => {
    createAgent('B', 0, -35, 0)
  }, 290)
  setTimeout(() => {
    createAgent('B', 0, -35, 25)
  }, 300)
  setTimeout(() => {
    createAgent('B', 0, -50, 0, "goalie")
  }, 310)
}, 1000)
// createAgent('B', 0, -51, -8)
// createAgent('B', 0, -51, 8)

function createAgent(teamName, speed, x, y, goalie) {
  let agent = new Agent(speed, teamName) // Создание экземпляра агента
  require('./socket')(agent, teamName, VERSION, goalie) //Настройка сокета
  setTimeout(() => {
    agent.socketSend("move", `${x} ${y}`)
  }, 100)
}

