const CTRL_MIDDLE = {
  action: "return",
  execute(taken, controllers) {
    const next = controllers[0]
	
    switch (this.action) {
      case "return":
        taken.cmd = this.actionReturnArrack(taken)
        break
      case "seekBall":
        taken.cmd = this.seekBall(taken)
        break
    }
	  
    taken.action = this.action
    if(next) { 
      const command = next.execute(taken, controllers.slice(1))
	  //console.log(JSON.stringify(command))
      if(command) return command;
      if(taken.newAction) this.action = taken.newAction
      return taken.cmd
    }
  },
  actionReturnArrack(taken) { // Возврат к своим воротам
    let goal = ''
    if (taken.id === 1) {
      goal = (taken.side === 'l') ? 'fprc' : 'fplc'
    } else if (taken.id === 2) {
      goal = (taken.side === 'l') ? 'fprt' : 'fplb'
    } else if (taken.id === 3){
      goal = (taken.side === 'l') ? 'fprb' : 'fplt'
    } else if (taken.id < 6) {
      goal = 'fc'
    } else if (taken.id === 6) {
      goal = 'fct'
    } else if (taken.id === 7) {
      goal = 'fcb'
    } else if (taken.id === 8) {
      goal = (taken.side === 'l') ? 'fplt' : 'fprb'
    } else if (taken.id === 9) {
      goal = (taken.side === 'l') ? 'fplc' : 'fprc'
    } else if (taken.id === 10) {
      goal = (taken.side === 'l') ? 'fplb' : 'fprt'
    }
    if(!taken.flags[goal]) return {n: "turn", v: 60}
    if(Math.abs(taken.flags[goal].angle) > 10)
      return {n: "turn", v: taken.flags[goal].angle}
    if(taken.flags[goal].dist > 3)
      return {n: "dash", v: 80}
    this.action = "seekBall"
    return {n: "turn", v: 180}
  },
  seekBall(taken) { // Осмотр поля
    if (!taken.ball)
      return {n: "turn", v: 45}
    else {
      return {n: "turn", v: taken.ball.angle}
    }
  },
}
module.exports = CTRL_MIDDLE
