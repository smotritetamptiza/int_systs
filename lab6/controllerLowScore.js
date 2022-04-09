
const CTRL_LOW = {
  execute(taken, controllers) {
    const next = controllers[0] // Следующий уровень
    if(taken.ball && taken.ball.dist < 0.5) // Мяч рядом
      taken.canKick = true
    else
      taken.canKick = false

    if(next) // Вызов следующего уровня
      return next.execute(taken, controllers.slice(1))
  }
}

module.exports = CTRL_LOW
