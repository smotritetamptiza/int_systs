class CTRL_HIGH {
	constructor(){
		this.last == "previous"
	}
  execute(taken) {

    const immediate = this.immediateReaction(taken)
    if(immediate) return immediate

    const chase = this.chaseBall(taken)
    if(chase) return chase

    if(this.last == "chase")
      taken.newAction = "return"
    this.last = "previous"
  }
  immediateReaction(taken) {
    if(taken.canKick) {
      this.last = "kick"

		let dist = taken.closestToFlag(true, "g" + (taken.side == "l" ? "r" : "l"));
		if(dist[0] && dist[0].dist <= taken.calculateDistanceToFlag(taken.pos, "g" + (taken.side == "l" ? "r" : "l"))){
			this.last = "pass"
			return {n: "kick", v: dist[0].player.dist*4, a: dist[0].player.angle}

		}

		let fc = taken.flags.filter(fl => fl.n == "fc")

		if (fc.length > 0) { //!! ADD smart kick here - from smart rotation
			if (Math.abs(taken.ball.x) > 20)
				return {n: "kick", v: 40, a: fc[0].angle}
			return {n: "kick", v: 100, a: fc[0].angle}
		}

        /*if (taken.goal) { //!! ADD smart kick here - from smart rotation
          if (taken.goal.dist > 40)
            return {n: "kick", v: 40, a: taken.goal.angle}
          return {n: "kick", v: 100, a: taken.goal.angle}
        }*/

     return {n: "kick", v: 10, a: 55}
    }

  }

  /*defense(taken) { // Защита ворот
    if(taken.ball) {
      const close = taken.closestToBall(true)
      if((close[0] && close[0].dist > taken.ball.dist) || !close[0]) {
        this.last = "defend"
        if (taken.id < 4 && taken.goalOwn && taken.goalOwn.dist < 50) {
          taken.newAction = "return"
        }
		else if (taken.id > 7 && taken.goal && taken.goal.dist < 50) {
          taken.newAction = "return"
        }
		else if (taken.id > 3 && taken.id < 8 && taken.goalOwn && taken.goalOwn.dist < 25){
          taken.newAction = "return"
        }
        else {
          if (Math.abs(taken.ball.angle) > 5)
            return {n: "turn", v: taken.ball.angle}
          if (taken.ball.dist > 1)
            return {n: "dash", v: 100}
          else
            return {n: "dash", v: 20}
        }
      }
    }
  }*/
  chaseBall(taken) {

    if(taken.ball) {
      const close = taken.closestToBall(true)
	  this.last = "chase"
		if (Math.abs(taken.ball.angle) > 5)
			return {n: "turn", v: taken.ball.angle}
      if((close[0] && close[0].dist > taken.ball.dist + 10) || !close[0]) {

		  if (taken.ball.dist > 1)
			return {n: "dash", v: 100}
		  else
			return {n: "dash", v: 30}

      }
    }

  }
}
module.exports = CTRL_HIGH
