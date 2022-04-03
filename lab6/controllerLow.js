const Taken = require('./taken')
const CTRL_LOW = {
	execute(input, controllers){
		const next = controllers[0] // next level
		this.taken = Taken.setSee(input, this.team, this.side) //выделение объектов
		if(this.taken.ball & this.taken.ball.dist < 0.5)
			this.taken.canKick = true
		else	this.taken.canKick = false
		if(next) // Call for next level
			return next.execute(this.taken, controllers.slise(1))
	}
}
module.exports = CTRL_LOW