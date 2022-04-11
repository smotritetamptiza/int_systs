class CTRL_HIGH {
	constructor(){
		this.last == "previous"
	}
  execute(taken) {

    const immediate = this.immediateReaction(taken)
    if(immediate) return immediate

    const chase = this.chaseBall(taken)
    if(chase) return chase

    if(this.last == "chase" && (!taken.ball ||
			(taken.side == "l" ? taken.ball.x >= 10 : taken.ball.x <= -10)))
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

     return {n: "kick", v: 10, a: taken.side == "l" ? 55 : -55}
    }

  }

  chaseBall(taken) {
    if(taken.ball) {
      const close = taken.closestToBall(true)
	  	this.last = "chase"
			if (Math.abs(taken.ball.angle) > 5)
				return {n: "turn", v: taken.ball.angle}
			if (Math.abs(taken.pos.y) > 35) return
			if (taken.side == "r" ? taken.ball.x >= 10 : taken.ball.x <= -10) {
				if((close[0] && close[0].dist >= taken.ball.dist) || !close[0]) {
					if (taken.ball.dist > 1)
						return {n: "dash", v: 100}
					 else
						return {n: "dash", v: 30}
		    }
				if (taken.ball.dist > 20)
					return {n: "dash", v: 20}
			}
    }

  }
}
module.exports = CTRL_HIGH
