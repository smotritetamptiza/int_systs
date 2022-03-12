const FL = "flag", KI = "kick";
const DT = {
  state: {
    next: 0,
    sequence: [/*{act: FL, fl: "frb"},*/ {act: FL, fl: "gl"},
    {act: KI, fl: "b", goal: "gr"}],
    command: null
  },
  root: {
    exec(mgr, state) {
      if (state.next == state.sequence.length) {
        state.next = 0;
      }
      state.action = state.sequence[state.next];
      state.command = null;
    },
    next: "goalVisible"
  },
  goalVisible: {
    condition: (mgr, state) => mgr.getVisible(state.action.fl),
    trueCond: "rootNext",
    falseCond: "rotate"
  },
  rotate: {
    exec(mgr, state) {
      state.command = { n: "turn", v: "90" };
    },
    next: "sendCommand"
  },
  rootNext: {
    condition: (mgr, state) => state.action.act == FL,
    trueCond: "flagSeek",
    falseCond: "ballSeek"
  },
  flagSeek: {
    condition: (mgr, state) => 3 > mgr.getDistance(state.action.fl),
    trueCond: "closeFlag",
    falseCond: "farGoal"
  },
  closeFlag: {
    exec(mgr, state) {
      state.next++;
      state.action = state.sequence[state.next];
    },
    next: "goalVisible"
  },
  farGoal: {
    condition: (mgr, state) => mgr.getAngle(state.action.fl) != 0,
    trueCond: "rotateToGoal",
    falseCond: "runToGoal"
  },
  rotateToGoal: {
    exec(mgr, state) {
      state.command = { n: "turn", v: mgr.getAngle(state.action.fl) };
    },
    next: "sendCommand"
  },
  runToGoal: {
    exec(mgr, state) {
      state.command = { n: "dash", v: "100" };
    },
    next: "sendCommand"
  },
  sendCommand: {
    command: (mgr, state) => state.command
  },
  ballSeek: {
    condition: (mgr, state) => 0.5 > mgr.getDistance(state.action.fl),
    trueCond: "closeBall",
    falseCond: "farGoal"
  },
  closeBall: {
    condition: (mgr, state) => mgr.getVisible(state.action.goal),
    trueCond: "ballGoalVisible",
    falseCond: "ballGoalInvisible"
  },
  ballGoalVisible: {
    exec(mgr, state) {
      state.command = { n: "kick", v: "100", a: mgr.getAngle(state.action.goal) };
    },
    next: "sendCommand"
  },
  ballGoalInvisible: {
    exec(mgr, state) {
      state.command = { n: "kick", v: "100", a: "90" };
    },
    next: "sendCommand"
  }
};

module.exports = DT;
