const CTRL = {
	execute(input, controllers){
		const next = controllers[0] //следующий уровень
		let results = undefined
		//TODO выполнение вычислений (results)
		if(next){ //вызов следующего уровня
			const upper = next.execute(result, controllers.slise(1))
			//TODO Обработка ответа upper (обработка result)
		}
		return result
	}
}
module.exports = CTRL