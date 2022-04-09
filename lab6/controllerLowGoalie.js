//const Taken = require('./taken')
const CTRL_LOW = {
	execute(taken, controllers){
		const next = controllers[0] // next level
		
		
		/*if (state.local.catch < 3) {
              state.local.catch++
              return {n: "catch", v: angle}
            } else state.local.catch = 0*/
		if(taken.ball && taken.ball.dist < 1)
			taken.canCatch = true
		else taken.canCatch = false
		
		if(taken.ball && taken.ball.dist < 2)
			taken.canKick = true
		else taken.canKick = false
		
		if(next) // Call for next level
			return next.execute(taken, controllers.slice(1))
	}
}
module.exports = CTRL_LOW

