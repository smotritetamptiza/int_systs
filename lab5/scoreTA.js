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
    start: { n: "start", e: ["goalVisible", "start"] },
    goalVisible: { n: "goalVisible", e: ["flagClose", "ballClose", "start"] },
    flagClose: { n: "flagClose", e: ["flagReached", "start"] },
    ballClose: { n: "ballClose", e: ["ballReached", "start"] },
    flagReached: { n: "flagReached", e: ["start"] },
    ballReached: { n: "ballReached", e: ["start"] },
  },
  edges: {
    start_goalVisible: [{ synch: "seesGoal?" }],
    start_start: [{ synch: "lookAround!" }],
    goalVisible_flagClose: [{ guard: [{s: "eq", l: {v: "action"}, r: "flag"},
                                      {s: "lt", l: {v: "dist"}, r: 10}]}],
    goalVisible_ballClose: [{ guard: [{s: "eq", l: {v: "action"}, r: "kick"},
                                      {s: "lt", l: {v: "dist"}, r: 5}]}],
    goalVisible_start: [{ synch: "run!" }],
    flagClose_flagReached: [{ guard: [{s: "lt", l: {v: "dist"}, r: 3}]}],
    flagClose_start: [{ synch: "run!" }],
    ballClose_ballReached: [{ guard: [{s: "lt", l: {v: "dist"}, r: 0.5}]}],
    ballClose_start: [{ synch: "run!" }],
    flagReached_start: [{ synch: "nextAction!" }],
    ballReached_start: [{ synch: "kickBall!" }],

  },
  actions: {
    init(state, position) {
      let side = (position == "l" ? "r" : "l")
      console.log(position, side)
      state.next = true
      state.local.goalie = false
      state.local.sequence = [{act: "flag", fl: "g" + position}, /*{act: "flag", fl: "fplc"}, {act: "flag", fl: "fcb"}, {act: "flag", fl: "frb"}, {act: "flag", fl: "fc"},*/
      {act: "kick", fl: "b", goal: "g" + side}]
      state.local.nextAction = 0
//      state.local.catch = 0
    },
    beforeAction(taken, state) {
      state.variables.action = state.local.sequence[state.local.nextAction].act
      state.variables.flag = state.local.sequence[state.local.nextAction].fl
      state.variables.goal = state.local.sequence[state.local.nextAction].goal

      if (state.variables.action == "flag") {
        let currFlag = taken.flags.filter(fl => fl.n == state.variables.flag)
        if (currFlag.length > 0) {
          state.variables.dist = currFlag[0].d
        }
      }
      if (state.variables.action == "kick") {
        if (taken.ball) state.variables.dist = taken.ball.dist
      }
    },
    seesGoal(taken, state) {
      //console.log("seesGoal?")
      if (state.variables.action == "flag") {
        let currFlag = taken.flags.filter(fl => fl.n == state.variables.flag)
        return currFlag.length > 0
      }
      if (state.variables.action == "kick") {
        return taken.ball
      }
    },
    run(taken, state) {
      state.next = true
      let angle, dist
      if (state.variables.action == "flag") {
        let currFlag = taken.flags.filter(fl => fl.n == state.variables.flag)
        if (currFlag.length > 0) {
          angle = currFlag[0].a
          dist = currFlag[0].d
        }
      }
      if (state.variables.action == "kick") {
        if (taken.ball) {
          angle = taken.ball.angle
          dist = taken.ball.dist
        }
      }
      if (angle == undefined) return {n: "turn", v: 180}
      if (angle && Math.abs(angle) > 5) return {n: "turn", v: angle}
      return {n: "dash", v: dist ? dist*2+20 : 100 }
    },
    nextAction(taken, state) {
      state.local.nextAction++
      state.next = true
      //console.log("next action " + state.local.nextAction);
    },
    kickBall(taken, state) {
      state.next = true
      if (!taken.goal) return { n: "kick", v: "10", a: "45"}
      if (taken.goal.dist > 40) return { n: "kick", v: "60", a: taken.goal.angle}
      return { n: "kick", v: "100", a: taken.goal.angle}
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
    ok(taken, state) {
		//console.log("ok")
      state.next = true
      return {n: "turn", v: 0}
    },
    empty(taken, state) { state.next = true }
  }
};

module.exports = TA;
