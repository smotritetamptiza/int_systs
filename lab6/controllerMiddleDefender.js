class CTRL_MIDDLE {
	constructor(){
		this.action = "return"
		this.turnData = "ft0"
	}
	execute(taken, controllers){
		if(taken.isGoal) {
			console.log("goal")
			taken.isGoal = false
			this.action = "return"
		}
		const next = controllers[0]

		let fptDist = taken.calculateDistanceToFlag(taken.pos, `fp${taken.side}t`)
		let fpbDist = taken.calculateDistanceToFlag(taken.pos, `fp${taken.side}b`)

		if(fptDist > 30 && fpbDist > 30 && (!taken.ball || (taken.side == "l" ? taken.ball.x >= 10 : taken.ball.x <= -10)))
			this.action = "return"

		switch (this.action){
			case "return":
				taken.cmd = this.actionReturn(taken)
				break
			case "rotateCenter":
				taken.cmd = this.rotateCenter(taken)
				break
			case "seekBall":
				taken.cmd = this.seekBall(taken)
				break
		}
		taken.action = this.action
		if(fptDist > 30 && fpbDist > 30) return taken.cmd

		if(next){ // call for next level

			const command = next.execute(taken, controllers.slice(1))
			if(command) return command
			if(taken.newAction) this.action = taken.newAction
			return taken.cmd
		}
	}
	actionReturn(taken){ // Come back to your gates
		let fptDist = taken.calculateDistanceToFlag(taken.pos, `fp${taken.side}t`)
		let fpcDist = taken.calculateDistanceToFlag(taken.pos, `fp${taken.side}c`)
		let fpbDist = taken.calculateDistanceToFlag(taken.pos, `fp${taken.side}b`)

		let closestDist = Math.min(fptDist, fpcDist, fpbDist)
		let closestFlag = `fp${taken.side}c`
		if (fptDist < fpcDist && fptDist < fpbDist) {
			closestFlag = `fp${taken.side}t`
		} else if (fpbDist < fpcDist && fpbDist < fptDist) {
			closestFlag = `fp${taken.side}b`
		}

		/*if(fptDist <= 15 || fpcDist <= 15 || fpbDist <= 15) {
			this.action = "rotateCenter"
			return {n: "turn", v: 180}
		}*/

		if(closestDist <= 15) {
			this.action = "rotateCenter"
			return {n: "turn", v: 180}
		}

		let clF = taken.flags.filter(fl => fl.n == closestFlag)

		if(clF.length == 0) return {n: "turn", v: taken.calculateAngle(closestFlag)*1.1}

		//console.log("min dist " + Math.min(fptDist, fpbDist));
		if(fptDist > 15 || fpcDist > 15 || fpbDist > 15) {
			if (Math.abs(clF[0].angle) > 10) return {n: "turn", v: clF[0].angle}
			return {n: "dash", v: closestDist * 2 + 30}

		}

		this.action = "rotateCenter"
		
		//return {n: "turn", v: 180}
	}
	rotateCenter(taken){
		let fc = taken.flags.filter(fl => fl.n == "fc")

		if (fc.length > 0) {
			this.action = "seekBall"
			if(Math.abs(fc[0].angle) < 5) return {n: "turn", v: 0}
			return {n: "turn", v: fc[0].angle}
		}

		return {n: "turn", v: 90}
	}
	/*seekBall(taken){
		this.action = "rotateCenter"
		if(taken.flags[this.turnData]){
			if(Math.abs(taken.flags[this.turnData].angle) > 10)
				return {n: "turn", v: taken.flags[this.turnData].angle}
			if(this.turnData == "ft0") this.turnData = "fb0"
			else
			if(this.turnData == "fb0"){
				this.turnData = "ft0"
				this.action = "rotateCenter"
				return this.rotateCenter(taken)
			}
		}
		if(this.turnData == "ft0")
			return {n: "turn", v: this.side =="l" ? -30 : 30}
		if(this.turnData == "fb0")
			return {n: "turn", v: this.side =="l" ? 30 : -30}
		throw 'Unexpected state ${JSON.stringify(this)}, ${JSON.stringify(taken)}'
	}*/
	seekBall(taken) {
    if (!taken.ball){
			this.action = "rotateCenter"
      return {n: "turn", v: taken.calculateAngle(`fc`)}
		}
	  //console.log(taken.id+ taken.side + " " + taken.ball.angle)
    if(Math.abs(taken.ball.angle) > 5){
      return {n: "turn", v: taken.ball.angle}
    }
	  return {n: "turn", v: 0}
  }
}
module.exports = CTRL_MIDDLE
