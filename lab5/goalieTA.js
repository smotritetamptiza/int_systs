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
    kick: { n: "kick", e: ["start"] },
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
    start_near: [{ guard: [{ s: "lt", l: {v: "dist"}, r: 10 },
                           { s: "lte", l: 2, r: {v: "dist"} }] }],
    start_far: [{ guard: [{ s: "lte", l: 10, r: {v: "dist"} }] }],
    close_catch: [{ synch: "catch!" }],
    catch_kick: [{ synch: "kick!" }],
    kick_start: [{ synch: "goBack!", assign: [{ n: "t", v: 0, type: "timer" }] }],
    far_start: [{ guard: [{ s: "lt", l: 10, r: {t: "t"} }], synch: "lookAround!",
                  assign: [{ n: "t", v: 0, type: "timer" }] },
                { guard: [{ s: "lte", l: {t: "t"}, r: 10 }], synch: "ok!" }],
    near_start: [{ synch: "empty!", assign: [{ n: "t", v: 0, type: "timer" }] }],
    near_intercept: [{ synch: "canIntercept?" }],
    intercept_start: [{ synch: "runToBall!",
                        assign: [{ n: "t", v: 0, type: "timer" }] }]
  },
  actions: {
    init(taken, state) {
      state.local.goalie = true
      state.local.catch = 0
    },
    beforeAction(taken, state) {
      if (taken.ball) state.variables.dist = taken.ball.dist
    },
    catch(taken, state) {
      if (!taken.ball) {
        state.next = true
        return
      }
      let angle = taken.ball.angle
      let dist = taken.ball.dist
      state.next = false
      if (dist > 0.5) {
        is (state.local.goalie) {
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
      state.next = true
      if (!taken.ball) return
      let dist = taken.ball.dist
      if (dist > 0.5) return
      let goal = taken.goal
      let player = taken.teamOwn ? taken.teamOwn[0] : null
      let target
      if (goal && player)
        target = goal.dist < player.dist ? goal : player
      else if (goal) target = goal
      else if (player) target = player
      if (target) return {n: "kick", v: target.dist*2+40, a: target.angle}
      return {n: "kick", v: 10, a: 45}
    },
    goBack(taken, state) {
      state.next = false
      let goalOwn = taken.goalOwn
      if (!goalOwn) return {n: "turn", v: 60}
      if (Math.abs(goalOwn.angle) > 10)
        return {n: "turn", v: goalOwn.angle}
      if (goalOwn.dist < 2) {
        state.next = true
        return {n: "turn", v: 180}
      }
      return {n: "dash", v: goalOwn.dist*2+20}
    },
    lookAround(taken, state) {
      state.next = false
      state.synch = "lookAround!"
      if (!state.local.look) state.local.look = "left"
      switch (state.local.look) {
        case "left": state.local.look = "center"; return {n: "turn", v: -60}
        case "center": state.local.look = "right"; return {n: "turn", v: 60}
        case "right": state.local.look = "back"; return {n: "turn", v: 60}
        case "back":
          state.local.look = "left"
          state.next = true
          state.synch = undefined
          return {n: "turn", v: -60}
        default: state.next = true
      }
    },
    canIntercept(taken, state) {
      let ball = taken.runToBall
      let ballPrev = taken.ballPrev
      state.next = true
      if (!ball) return false
      if (!ballPrev) return true
      if (ball.dist <= ballPrev.dist + 0.5) return true
      return false
    },
    runToBall(taken, state) {
      state.next = false
      let ball = taken.ball
      if (!ball) return this.goBack(taken, state)
      if (ball.dist <= 2) {
        state.next = true
        return
      }
      if (Math.abs(ball.angle) > 10) return {n: "turn", v: ball.angle}
      if (ball.dist < 2) {
        state.next = true
        return
      }
      return {n: "dash", v: 110}
    },
    ok(taken, state) {
      state.next = true
      return {n: "turn", v: 0}
    },
    empty(taken, state) { state.next = true }
  }
};

module.exports = TA;
