const FL = "flag", KI = "kick";
const DT = {
  state: {
    next: 0,
    sequence: [{act: FL, fl: "fplb"},{act: FL, fl: "fgrb"}, {act: FL, fl: "b", goal: "gr"}],
    command: null,
	  heard_go: false
  },
  setTeamname(teamName) {
    this.state.teamName = teamName;
  },
  root: {
    exec(mgr, state) {
      state.action = state.sequence[state.next];
      state.command = null;
    },
    next: "rootNext"
  },
  rootNext: {
    condition: (mgr, state) => state.heard_go == true,
    trueCond: /*"GOAL",*/ "getPass",
    falseCond: "goalVisible"
  },
  /*GOAL: {
    exec(mgr, state) {
      //console.log("I HEARD GO");
      //state.next = 2;
      //state.action = state.sequence[state.next];
    },
    next: "getPass"
  },*/
  getPass: {
    condition: (mgr, state) => mgr.getVisible("b"),
    trueCond: "changeAction",
    falseCond: "goalVisible"
  },

  goalVisible: {
    condition: (mgr, state) => mgr.getVisible(state.action.fl),
    trueCond: "turnToGoal",
    falseCond: "rotate"
  },
  turnToGoal: {
    condition: (mgr, state) => mgr.getAngle(state.action.fl) != 0,
    trueCond: "rotateToGoal",
    falseCond: "flagSeek"
  },
  flagSeek: {
    condition: (mgr, state) => mgr.getDistance(state.action.fl) >= 10,
    trueCond: "runFast",
    falseCond: "flagClose"
  },
  flagClose: {
    condition: (mgr, state) => mgr.getDistance(state.action.fl) > 3,
    trueCond: "runSlow",
    falseCond: "flagReached"
  },
  flagReached: {
    exec(mgr, state) {
      if (state.heard_go) {
        state.next = 2;
      } else if (state.next < 1) {
        state.next++;
      } else {
        state.next = 0;
      }
      state.action = state.sequence[state.next];
    },
    next: "rootNext"
  },
	//BALL
  changeAction: {
    exec(mgr, state) {
      state.next = 2;
      state.action = state.sequence[state.next];
    },
    next: "turnToBALL"
  },
  turnToBALL: {
    condition: (mgr, state) => mgr.getAngle(state.action.fl) != 0,
    trueCond: "rotateToGoal",
    falseCond: "ballSeek"
  },
  ballSeek: {
    condition: (mgr, state) => mgr.getDistance(state.action.fl) >= 5,
    trueCond: "runFast",
    falseCond: "ballClose"
  },
  ballClose: {
    condition: (mgr, state) => mgr.getDistance(state.action.fl) > 0.5,
    trueCond: "runMedium",
    falseCond: "ballReached"
  },
  ballReached: {
    condition: (mgr, state) => mgr.getVisible(state.action.goal),
    trueCond: "ballGoalVisible",
    falseCond: "ballGoalInvisible"
  },
  ballGoalVisible: {
    condition: (mgr, state) => mgr.getDistance(state.action.goal) >= 40,
    trueCond: "kickNear",
    falseCond: "kickFar"
  },
  kickNear: {
    exec(mgr, state) {
      state.command = { n: "kick", v: "60", a: mgr.getAngle(state.action.goal) };
    },
    next: "sendCommand"
  },
  kickFar: {
    exec(mgr, state) {
      state.command = { n: "kick", v: "100", a: mgr.getAngle(state.action.goal) };
    },
    next: "sendCommand"
  },
  ballGoalInvisible: {
    exec(mgr, state) {
      state.command = { n: "kick", v: "10", a: "70" };
    },
    next: "sendCommand"
  },
	//basic movement
  rotateToGoal: {
    exec(mgr, state) {
      state.command = { n: "turn", v: mgr.getAngle(state.action.fl) };
    },
    next: "sendCommand"
  },
  runFast: {
    exec(mgr, state) {
      state.command = { n: "dash", v: "100" };
    },
    next: "sendCommand"
  },
  runMedium: {
    exec(mgr, state) {
      state.command = { n: "dash", v: "50" };
    },
    next: "sendCommand"
  },
  runSlow: {
    exec(mgr, state) {
      state.command = { n: "dash", v: "30" };
    },
    next: "sendCommand"
  },
  sendCommand: {
    command: (mgr, state) => state.command
  },
  rotate: {
    exec(mgr, state) {
	  console.log("turn");
      state.command = { n: "turn", v: "90" };
    },
    next: "sendCommand"
  }
};

module.exports = DT;
