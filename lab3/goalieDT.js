const DT = {
  state: {
    next: 0,
    sequence: [{fl: "gr", max_dist: 5}, {fl: "fprt", max_dist: 28, min_dist: 20},
    {fl: "fprb", max_dist: 28, min_dist: 20}, {fl: "fprc", max_dist: 16, min_dist: 12}],
    command: null,
    ballPrevPos: null,
    ballVelocity: null,
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
    condition: (mgr, state) => mgr.getDistance("b") < 20,
    trueCond: "ballClose",
    falseCond: "goalVisible"
  },
  ballClose: {
    condition: (mgr, state) => mgr.getDistance("b") < 1.8,
    trueCond: "distanceHigh", 
    falseCond: "ballAngle"
  },
 /* prevPosKnown: {
    condition: (mgr, state) => state.ballPrevPos != null,
    trueCond: "calculateVelocity",
    falseCond: "setPrevPos"
  },
  calculateVelocity: {
    exec(mgr, state) {
      state.ballVelocity = state.ballPrevPos - mgr.getDistance("b");
      state.ballPrevPos = mgr.getDistance("b");
      console.log("Ball dist is "+ mgr.getDistance("b"));
      if(state.ballVelocity != 0)
        console.log("Ball velocity is " + state.ballVelocity);
    },
    next: "velocityHigh"
  },
  setPrevPos: {
    exec(mgr, state) {
      state.ballPrevPos = mgr.getDistance("b");
    },
    next: "goalVisible"
  },
  velocityHigh: {
    condition: (mgr, state) => state.ballVelocity > 0.1,
    trueCond: "ballCatch",
    falseCond: "glVisible"
  },*/
  distanceHigh: {
    condition: (mgr, state) => mgr.getDistance("b") < 1,
    trueCond: "ballCatch", // ballCatch
    falseCond: "glVisible" 
  },
  /*velocityPositive: {
    condition: (mgr, state) => state.ballVelocity >= 0,
    trueCond: "glVisible",
    falseCond: "goalVisible"
  },*/
  ballAngle: {
    condition: (mgr, state) => Math.abs(mgr.getAngle("b")) <= 28, //5
    trueCond: "run",
    falseCond: "ballTurn"
  },
  run: {
    exec(mgr, state) {
      state.command = { n: "dash", v: "40" };
    },
    next: "sendCommand"
  },
  ballTurn: {
    exec(mgr, state) {
      state.command = { n: "turn", v: mgr.getAngle("b") };
    },
    next: "sendCommand"
  },
  ballCatch: {
    exec(mgr, state) {
      state.next = 0;
      state.ballPrevPos = mgr.getDistance("b");
      state.ballVelocity = 0;
      console.log("caught");
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
    condition: (mgr, state) => Math.abs(mgr.getAngle("gl")) < 10,
    trueCond: "ballKickHard",
    falseCond: "ballKickSoft"
  },
  ballKickHard: {
    exec(mgr, state) {
      state.next = 0;
      state.ballPrevPos = null;
      state.ballVelocity = null;
      console.log("kick hard");
      state.command = { n: "kick", v: "100", a: mgr.getAngle("gl") };
    },
    next: "sendCommand"
  },
  ballKickSoft: {
    exec(mgr, state) {
      state.next = 0;
      state.ballPrevPos = null;
      state.ballVelocity = null;
      console.log("kick soft");
      state.command = { n: "kick", v: "60", a: mgr.getAngle("gl") };
    },
    next: "sendCommand"
  },
  // fixing position
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
  // basic movements
  goalCloser: {
    exec(mgr, state) {
      state.command = { n: "dash", v: "40" };
    },
    next: "sendCommand"
  },
  goalFarther: {
    exec(mgr, state) {
      state.command = { n: "dash", v: "-25" };
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
