const FL = "flag", KI = "kick";
const DT = {
  state: {
    next: 0,
    sequence: [{act: FL, fl: "fplc"}, {act: FL, fl: "b"}],
    command: null,
    wait_counter: 5,
    said_go: false
  },
  setTeamname(teamName) {
    this.teamName = teamName;
  },
  root: {
    exec(mgr, state) {
      state.action = state.sequence[state.next];
      state.command = null;
    },
    next: "goalVisible"
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
  rotate: {
    exec(mgr, state) {
      state.command = { n: "turn", v: "90" };
    },
    next: "sendCommand"
  },
  flagSeek: {
    condition: (mgr, state) => mgr.getDistance(state.action.fl) >= 10,
    trueCond: "runFast",
    falseCond: "flagClose"
  },
  flagClose: {
    condition: (mgr, state) => mgr.getDistance(state.action.fl) > 3,
    trueCond: "runSlow",
    falseCond: "rootNext"
  },
  rootNext: {
    condition: (mgr, state) => state.action.fl == "b",
    trueCond: "ballKickable",
    falseCond: "flagReached"
  },
  ballKickable: {
    condition: (mgr, state) => mgr.getDistance(state.action.fl) <= 0.5,
    trueCond: "seesTeammate",
    falseCond: "runSlow"
  },

  seesTeammate: {
    condition: (mgr, state) => mgr.seesTeammate(state.teamName),
    trueCond: "saidGo",
    falseCond: "waitForTeammate"
  },
  waitForTeammate: {
    condition: (mgr, state) => state.wait_counter > 0,
    trueCond: "wait",
    falseCond: "kickAround"
  },
  kickAround: {
    exec(mgr, state) {
      state.command = { n: "kick", v: "10", a: "90" };
    },
    next: "sendCommand"
  },
  wait: {
    exec(mgr, state) {
      state.wait_counter--;
      state.command = null;
    },
    next: "sendCommand"
  },
  saidGo: {
    condition: (mgr, state) => state.said_go,
    trueCond: "passToTeammate",
    falseCond: "sayGo"
  },
  passToTeammate: {
    exec(mgr, state) {
      state.command = { n: "kick", v: 100,
      a: mgr.getAngle(mgr.getTeammateName(state.teamName)) };
      state.said_go = false;
      state.wait_counter = 5;
    },
    next: "sendCommand"
  },
  sayGo: {
    exec(mgr, state) {
      state.command = { n: "say", v: "go" };
      state.said_go = true;
    },
    next: "sendCommand"
  },

  flagReached: {
    exec(mgr, state) {
      state.next++;
      state.action = state.sequence[state.next];
    },
    next: "goalVisible"
  },
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
  runSlow: {
    exec(mgr, state) {
      state.command = { n: "dash", v: "30" };
    },
    next: "sendCommand"
  },
  sendCommand: {
    command: (mgr, state) => state.command
  }

};

module.exports = DT;
