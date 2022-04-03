const TA = {
  current: "start",
  state: {
    variables: { dist: null },
    timers: { t: 0 },
    next: true,
    sync: undefined,
    local: {},
  },
  nodes: {
    start: { n: "start", e: ["close", "near", "far"] },
    close: { n: "close", e: ["catch"] },
    catch: { n: "catch", e: ["kick"] },
    kick: { n: "kick", e: ["faceCenter"] },
    faceCenter: { n: "faceCenter", e: ["start"] },
    far: { n: "far", e: ["start"] },
    near: { n: "near", e: ["intercept", "start"] },
    intercept: { n: "intercept", e: ["start"] },
  },
  edges: {
    /* "guard" describes conditions;
       "sync" calls a function;
       "assign" assigns values to the variables
    */
    start_close: [{ guard: [{ s: "lt", l: {v: "dist"}, r: 2 }] }],
    start_near: [{ guard: [{ s: "lt", l: {v: "dist"}, r: 20 },
                           { s: "lte", l: 2, r: {v: "dist"} }] }],
    start_far: [{ guard: [{ s: "lte", l: 20, r: {v: "dist"} }] }],
    close_catch: [{ synch: "catch!" }],
    catch_kick: [{ synch: "kick!" }],
    kick_faceCenter: [{ synch: "goBack!", assign: [{ n: "t", v: 0, type: "timer" }] }],
    faceCenter_start: [{ synch: "turnToCenter!" }],
    far_start: [{ guard: [{ s: "lt", l: 10, r: {t: "t"} }], synch: "lookAround!",
                  assign: [{ n: "t", v: 0, type: "timer" }] },
                { guard: [{ s: "lte", l: {t: "t"}, r: 10 }], synch: "ok!" }],
    near_start: [{ synch: "empty!", assign: [{ n: "t", v: 0, type: "timer" }] }],
    near_intercept: [{ synch: "canIntercept?" }],
    intercept_start: [{ synch: "runToBall!",
                        assign: [{ n: "t", v: 0, type: "timer" }] }]
  },
  actions: {
    init(state) {
      state.local.goalie = true
      state.local.catch = 0
      state.local.kick = 0
    },
    beforeAction(taken, state) {
      if (taken.ball) state.variables.dist = taken.ball.dist
    },
    catch(taken, state) {
		console.log("catch")
      if (!taken.ball && !taken.ballPrev) {
        state.next = true
        return {n: "catch", v: 0}
      }
      let angle = taken.ball ? taken.ball.angle : taken.ballPrev.angle
      let dist = taken.ball ? taken.ball.dist : taken.ballPrev.dist
      state.next = false
      if (dist > 0.5) {
        if (state.local.goalie) {
          if (state.local.catch < 3) {
            state.local.catch++
            return {n: "catch", v: angle}
          } else state.local.catch = 0
        }
        if (Math.abs(angle) > 15) return {n: "turn", v: angle}
        return {n: "dash", v: 20}
      }
      state.next = true
    },
    kick(taken, state) {
		console.log("kick")
      state.next = true
      if (!taken.ball && !taken.ballPrev) return {n: "kick", v: 100, a: 0}
      let dist = taken.ball ? taken.ball.dist : taken.ballPrev.dist
      console.log("kick dist " + dist);
      if (dist > 1) return
      let goal = taken.goal
      let player = taken.teamOwn ? taken.teamOwn[0] : null
      let target
      if (goal && player)
        target = goal.dist < player.dist ? goal : player
      else if (goal) target = goal
      else if (player) target = player
      if (state.local.kick < 3) {
        console.log("kick #" + state.local.kick);
        state.next = false
        state.local.kick++
        if (target) return {n: "kick", v: 100, a: target.angle}
        return {n: "kick", v: 100, a: 45}
      } else state.local.kick = 0
    },
    goBack(taken, state) {
      state.next = false
      let goalOwn = taken.goalOwn
	     //console.log("go back to " + goalOwn)
      if (!goalOwn) return {n: "turn", v: 60}
      if (Math.abs(goalOwn.angle) > 10)
        return {n: "turn", v: goalOwn.angle}
      if (goalOwn.dist < 2) {
        state.next = true
        return {n: "turn", v: 180}
      }
      return {n: "dash", v: goalOwn.dist*2+20}
    },
    turnToCenter(taken, state) {
      state.next = true
      let angle = 30
      let fc = taken.flags.filter(fl => fl.n == "fc")
      if (fc.length > 0) {
        angle = fc[0].a
      }
      return {n: "turn", v: angle}
    },
    lookAround(taken, state) {
		//console.log("look around")
      state.next = true
      if (state.variables.action == "flag") {
         let angle = taken.calculateAngle(state.variables.flag)
         return {n: "turn", v: angle}
       }
       return {n: "turn", v: 90}
    },
    canIntercept(taken, state) {
		  //console.log("can intercept")
      let ball = taken.ball // taken.runToBall
      let ballPrev = taken.ballPrev
      state.next = true
      if (!ball) return false
      if (!ballPrev) return true
      if (ball.dist <= ballPrev.dist + 0.5) return true
      return false
    },
    runToBall(taken, state) {
		//console.log("run to ball")
      state.next = false
      let ball = taken.ball
      if (!ball) return this.goBack(taken, state)
      if (ball.dist <= 3) {
        state.next = true
        return
      }
      //if (Math.abs(ball.angle) > 5) return {n: "turn", v: ball.angle}

      /* ANOTHER WEIRD CALCULATION */
      let intPoint = taken.interceptionPoint();
      if (!intPoint || ball.dist <= 5) {
        if (Math.abs(ball.angle) > 5 && ball.dist > 5) return {n: "turn", v: ball.angle}
        return {n: "dash", v: ball.dist*10+10}
      }
      if (Math.abs(intPoint.angle) > 5) return {n: "turn",
      v: intPoint.angle + Math.sign(intPoint.angle) * 2.5}
      return {n: "dash", v: 100}
      /*****************************/

      //return {n: "dash", v: ball.dist*10+10}
    },
    ok(taken, state) {
		    //console.log("ok")
      state.next = true
      return {n: "turn", v: 0}
    },
    empty(taken, state) { state.next = true }
  }
};

module.exports = TA;
