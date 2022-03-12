const DT = {
  state: {
    next: 0,
    sequence: [{fl: "gr", max_dist: 5}, {fl: "fprt", max_dist: 28, min_dist: 20},
    {fl: "fprb", max_dist: 28, min_dist: 20}, {fl: "fprc", max_dist: 16, min_dist: 12}],
    command: null,
    ballAction: "catch"
  },
  root: {
    exec(mgr, state) {
      state.action = state.sequence[state.next];
      state.command = null;
    },
    next: "ballVisible"
  },
  ballVisible: {
    condition: (mgr, state) => mgr.getVisible("b"),
    trueCond: "distBall",
    falseCond: "goalVisible"
  },
  distBall: {
    condition: (mgr, state) => mgr.getDistance("b") < 10,
    trueCond: "ballClose",
    falseCond: "goalVisible"
  },
  ballClose: {
    condition: (mgr, state) => mgr.getDistance("b") < 2,
    trueCond: "chooseAction",
    falseCond: "ballCloser"
  },
  ballCloser: {
    exec(mgr, state) {
      state.ballAction = "kick";
    },
    next: "ballAngle"
  },
  ballAngle: {
    condition: (mgr, state) => mgr.getAngle("b") == 0,
    trueCond: "goalCloser",
    falseCond: "ballTurn"
  },
  ballTurn: {
    exec(mgr, state) {
      state.command = { n: "turn", v: mgr.getAngle("b") };
    },
    next: "sendCommand"
  },
  chooseAction: {
    condition: (mgr, state) => state.ballAction == "catch",
    trueCond: "ballCatch",
    falseCond: "glVisible"
  },
  ballCatch: {
    exec(mgr, state) {
      state.next = 0;
      state.command = { n: "catch", v: mgr.getAngle("b") };
    },
    next: "sendCommand"
  },
  glVisible: {
    condition: (mgr, state) => mgr.getVisible("gl"),
    trueCond: "glAngle",
    falseCond: "rotate"
  },
  glAngle: {
    condition: (mgr, state) => Math.abs(mgr.getAngle("gl")) < 5,
    trueCond: "ballKick",
    falseCond: "glTurn"
  },
  ballKick: {
    exec(mgr, state) {
      state.next = 0;
      state.command = { n: "kick", v: "100", a: mgr.getAngle("gl") };
      state.ballAction = "catch";
    },
    next: "sendCommand"
  },
  glTurn: {
    exec(mgr, state) {
      state.command = { n: "turn", v: mgr.getAngle("gl") };
    },
    next: "sendCommand"
  },
  goalVisible: {
    condition: (mgr, state) => mgr.getVisible(state.action.fl),
    trueCond: "goalAngle",
    falseCond: "rotate"
  },
  goalAngle: {
    condition: (mgr, state) => mgr.getAngle(state.action.fl) == 0,
    trueCond: "goalFar",
    falseCond: "turnToGoal"
  },
  goalFar: {
    condition: (mgr, state) => mgr.getDistance(state.action.fl) > state.action.max_dist,
    trueCond: "goalCloser",
    falseCond: "goalClose"
  },
  goalClose: {
    condition: (mgr, state) => (state.action.min_dist &&
      mgr.getDistance(state.action.fl) < state.action.min_dist),
    trueCond: "goalFarther",
    falseCond: "rootNext"
  },
  goalCloser: {
    exec(mgr, state) {
      state.command = { n: "dash", v: "20" };
    },
    next: "sendCommand"
  },
  goalFarther: {
    exec(mgr, state) {
      state.command = { n: "dash", v: "-15" };
    },
    next: "sendCommand"
  },
  turnToGoal: {
    exec(mgr, state) {
      state.command = { n: "turn", v: mgr.getAngle(state.action.fl) };
    },
    next: "sendCommand"
  },
  rootNext: {
    condition: (mgr, state) => state.next == state.sequence.length - 1,
    trueCond: "ballSeek",
    falseCond: "nextGoal"
  },
  ballSeek: {
    condition: (mgr, state) => mgr.getVisible("b"),
    trueCond: "ballTurn",
    falseCond: "rotate"
  },
  nextGoal: {
    exec(mgr, state) {
      state.next++;
    },
    next: "root"
  },
  rotate: {
    exec(mgr, state) {
      state.command = { n: "turn", v: "90" };
    },
    next: "sendCommand"
  },
  sendCommand: {
    command: (mgr, state) => state.command
  },
};

module.exports = DT;
