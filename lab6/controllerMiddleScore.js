class CTRL_MIDDLE {
	constructor(){
  		this.action = "return"
	}
  execute(taken, controllers) {
    const next = controllers[0]
	
    switch (this.action) {
      case "return":
        taken.cmd = this.positionYourself(taken)
        break
      case "seekBall":
        taken.cmd = this.seekBall(taken)
        break
    }
	  
    taken.action = this.action
    if(next) { 
      const command = next.execute(taken, controllers.slice(1))
      if(command) return command;
      if(taken.newAction) this.action = taken.newAction
      return taken.cmd
    }
  }
	
  positionYourself(taken) {
    let side = (taken.side == "l" ? "r" : "l")
	let dist = [taken.calculateDistanceToFlag(taken.pos, "fp" + side + "t"), taken.calculateDistanceToFlag(taken.pos, "fp" + side + "c"), taken.calculateDistanceToFlag(taken.pos, "fp" + side + "b")]
	
	let goal = "fp" + side + "b"
	if(dist[0] <= dist[1]) goal = "fp" + side + "t"
	else if(dist[1] < dist[2]) goal = "fp" + side + "c"	
	  
	let goa = taken.flags.filter(fl => fl.n == goal)  
    if(goa.length < 1) {
		return {n: "turn", v: 60}
	}
    if(Math.abs(goa[0].angle) > 10)
      return {n: "turn", v: goa[0].angle}
	  
    if(goa[0].dist > 5)
      return {n: "dash", v: 100}
	  
    this.action = "seekBall"
    return this.seekBall(taken)
  }
	
  seekBall(taken) { 
    if (!taken.ball){
      return {n: "turn", v: 45}
	}
	  //console.log(taken.id+ taken.side + " " + taken.ball.angle)
    if(Math.abs(taken.ball.angle) > 5){
      return {n: "turn", v: taken.ball.angle}
    }
	  return {n: "turn", v: 0}
  }
}
module.exports = CTRL_MIDDLE
