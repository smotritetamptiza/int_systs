const CTRL_HIGH = {
	execute(taken){
		const immediate = this.immidiateReaction(taken)
		if(immediate) return immediate
		const defend = this.defendGoal(taken)
		if(defend) return defend
		if(this.last == "defend") taken.newAction = "return"
		this.last = "previous"
	},
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
		
	},
	defendGoal(taken){
		//check if we are too far from gates, check if ball coming to gates, intersept
		if(taken.ball && taken.ball.dist < 10){
			const close = taken.closestToBall(true)
			//if((close[0] && close[0].dist + 1 > taken.ball.dist) || !close[0]){
				this.last = "defend"
				if(Math.abs(taken.ball.angle) > 5)
					return {n: "turn", v: taken.ball.angle}
				return {n: "dash", v: 15}
			//}
		}
	},
}
module.exports = CTRL_HIGH

