class CTRL_HIGH {
	constructor(){
		this.last = "defend"
	}
	execute(taken){
		if(this.last == "catch") return this.kickAfterCatch(taken)
		const immediate = this.immidiateReaction(taken)
		if(immediate) return immediate

		const defend = this.defendGoal(taken)
		if(defend) return defend

		if(this.last == "defend") taken.newAction = "return"
		else taken.newAction = null

		this.last = "previous"
	}
	immidiateReaction(taken){
		if(taken.canCatch){
			taken.canCatch = false
			this.last = "catch"
			return {n: "catch", v: taken.ball.angle}
		}
		if(taken.canKick){
			this.last = "kick"
			if(taken.goal)
				return {n: "kick", v: 100, a: taken.goal.angle} //SMART KICK!
			return {n: "kick", v: 10, a: 45}
		}

	}
	kickAfterCatch(taken){
		this.last = "kick"
		if(taken.goal)
			return {n: "kick", v: 100, a: taken.goal.angle} //SMART KICK!
		return {n: "kick", v: 10, a: 45}

	}
	defendGoal(taken){
		//check if we are too far from gates, check if ball coming to gates, intersept
		if(taken.ball && taken.ball.dist < 15){

			if(Math.abs(taken.ball.angle) > 5)
					return {n: "turn", v: taken.ball.angle}
			this.last = "defend"
			return {n: "dash", v: taken.ball.dist*10+20}
		}
	}
}
module.exports = CTRL_HIGH
