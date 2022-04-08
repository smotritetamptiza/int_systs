const CTRL_HIGH = {
	execute(input){
		const immediate = this.immidiateReaction(input)
		if(immediate) return immediate
		const defend = this.defendGoal(input)
		if(defend) return defend
		if(this.last == "defend") input.newAction = "return"
		this.last = "previous"
	},
	immidiateReaction(input){
		if(input.canKick){
			this.last = "kick"
			if(input.goal)
				return {n: "kick", v: '110 ${input.goal.angle}'}
			return {n: "kick", v: '10 45'}
		}
	},
	defendGoal(input){
		if(input.ball){
			const close = input.closestToBall(true)
			if((close[0] && close[0].dist + 1 > input.ball.dist) || !close[0]){
				this.last = "defend"
				if(Math.abs(input.ball.angle) > 5)
					return {n: "turn", v: input.ball.angle}
				return {n: "dash", v: 110}
			}
		}
	},
}
module.exports = CTRL_HIGH

