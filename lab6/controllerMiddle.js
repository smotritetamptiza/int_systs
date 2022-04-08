const CTRL_MIDDLE = {
	action: "return",
	turnData: "ft0",
	execute(input, controllers){
		const next = controllers[0] // next level
		switch (this.action){
			case "return":
				input.cmd = this.actionReturn(input)
				break
			case "rotateCenter":
				input.cmd = this.rotateCenter(input)
				break
			case "seekBall":
				input.cmd = this.seekBall(input)
				break
		}
		input.action = this.action
		if(next){ // call for next level
			const command = next.execute(input, controllers.slice(1))
			if(command) return command
			if(input.newAction) this.action = input.newAction
			return input.cmd
		}
	},
	actionReturn(input){ // Come back to your gates
		if(!input.goalOwn) return {n: "turn", v: 60}
		if(Math.abs(input.goalOwn.angle) > 10)
			return {n: "dash", v: input.goalOwn.dist * 2 + 30}
		this.action = "rotateCenter"
		return {n: "turn", v: 180}
	},
	rotateCenter(input){ //rotate to face center
		if(!input.flags["fc"]) return {n: "turn", v: 60}
		this.action = "seekBall"
		return {n: "turn", v: input.flags["fc"].angle}
	},	
	seekBall(input){
		if(input.flags[this.turnData]){
			if(Math.abs(input.flags[this.turnData].angle) > 10)
				return {n: "turn", v: input.flags[this.turnData].angle}
			if(this.turnData == "ft0") this.turnData = "fb0"
			else
			if(this.turnData == "fb0"){
				this.turnData = "ft0"
				this.action = "rotateCenter"
				return this.rotateCenter(input)
			}	
		}
		if(this.turnData == "ft0")
			return {n: "turn", v: this.side =="l" ? -30 : 30}
		if(this.turnData == "fb0")
			return {n: "turn", v: this.side =="l" ? -30 : 30}	
		throw 'Unexpected state ${JSON.stringify(this)}, ${JSON.stringify(input)}'
	},
}
module.exports = CTRL_MIDDLE
