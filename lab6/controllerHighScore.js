const CTRL_HIGH = {
  execute(taken) {

	//console.log("           " + JSON.stringify(taken))  
    const immediate = this.immediateReaction(taken)
	
    if(immediate) return immediate
	  
    const defend = this.defendGoal(taken)
    if(defend) return defend
    if(this.last == "defend")
      taken.newAction = "return"
    this.last = "previous"
  },
  immediateReaction(taken) { // Немедленная реакция
    if(taken.canKick) {
      this.last = "kick"
        if (taken.playersListMy && taken.playersListMy.length && taken.id > 3) {
          taken.newAction = "return"
          taken.playersListMy.sort((p1, p2) => {
            return p1.p[1] - p2.p[2]
          })
		if("too far from gates, pass to teammate if they are closer")	
          if ((!taken.goal || taken.playersListMy[0].p[1] < taken.goal.dist - 15)
              && taken.playersListMy[0].p[1] > 4 && (!taken.goalOwn || taken.goalOwn.dist > 25))
            return {n: "kick", v: taken.playersListMy[0].p[1]*2, a: taken.playersListMy[0].p[0]}
        }
        if (taken.goal) { //!! ADD smart kick here - from smart rotation
          if (taken.goal.dist > 40)
            return {n: "kick", v: 30, a: taken.goal.angle}
          return {n: "kick", v: 100, a: taken.goal.angle}
        }
     return {n: "kick", v: 30, a:45}
    }
	  
  },
  defendGoal(taken) { // Защита ворот
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
            return {n: "dash", v: 30}
        }
      }
    }
  },
}
module.exports = CTRL_HIGH
