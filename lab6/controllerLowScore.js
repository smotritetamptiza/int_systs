
class CTRL_LOW {
  execute(taken, controllers) {
    const next = controllers[0] 
    if(taken.ball && taken.ball.dist < 1) 
      taken.canKick = true
    else
      taken.canKick = false

    if(next) 
      return next.execute(taken, controllers.slice(1))
  }
}

module.exports = CTRL_LOW
