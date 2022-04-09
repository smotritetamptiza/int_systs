const CTRL_MIDDLE = {
	action: "return",
	turnData: "ft0",
	execute(taken, controllers){
		const next = controllers[0] // next level
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
		if(next){ // call for next level
			const command = next.execute(taken, controllers.slice(1))
			if(command) return command
			if(taken.newAction) this.action = taken.newAction
			return taken.cmd
		}
	},
	actionReturn(taken){ // Come back to your gates
		
		if(!taken.goalOwn) return {n: "turn", v: taken.calculateAngle("g" + taken.side)}
		if(Math.abs(taken.goalOwn.dist) > 3)
			return {n: "dash", v: taken.goalOwn.dist * 2 + 30}
		this.action = "rotateCenter"
		return {n: "turn", v: 180}
	},
	rotateCenter(taken){ 
		
		//this.action = "seekBall"
		if(taken.flags["fc"] && Math.abs(taken.flags["fc"].angle) < 5) return {n: "turn", v: 0}
		else if (taken.flags["fc"]) return {n: "turn", v: taken.flags["fc"].angle}
		return {n: "turn", v: 60} //taken.calculateAngle("fc")
	},	
	seekBall(taken){
		this.action = "rotateCenter"
		/*if(taken.flags[this.turnData]){
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
		throw 'Unexpected state ${JSON.stringify(this)}, ${JSON.stringify(taken)}'*/
	},
}
module.exports = CTRL_MIDDLE
