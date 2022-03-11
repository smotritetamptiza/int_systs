let DT = {
  state: {
    command: null,
    leader: null
  },
  setLeader(leader) {
    this.state.leader = leader;
  },
  root: {
    exec(mgr, state) {
        state.command = null;
    },
    next: "leaderVisible"
  },
  leaderVisible: {
    condition: (mgr, state) => mgr.getVisible(state.leader),
    trueCond: "farLeader",
    falseCond: "seekLeader"
  },
  farLeader: {
    condition: (mgr, state) => mgr.getDistance(state.leader) > 10,
    trueCond: "angleFar",
    falseCond: "angleClose"
  },
  angleFar: {
    condition: (mgr, state) => Math.abs(mgr.getAngle(state.leader)) > 5,
    trueCond: "rotateFar",
    falseCond: "runFast"
  },
  rotateFar: {
    exec(mgr, state) {
      state.command = { n: "turn", v: mgr.getAngle(state.leader) };
    },
    next: "sendCommand"
  },
  runFast: {
    exec(mgr, state) {
      state.command = { n: "dash", v: "100" };
    },
    next: "sendCommand"
  },
  angleClose: {
    condition: (mgr, state) => (Math.abs(mgr.getAngle(state.leader)) > 40 ||
     Math.abs(mgr.getAngle(state.leader)) < 25),
    trueCond: "rotateSlightly",
    falseCond: "closeLeader"
  },
  rotateSlightly: {
    exec(mgr, state) {
      let angle = mgr.getAngle(state.leader);
      if (angle > 0) {
        angle -= 30;
      } else {
        angle += 30;
      }
      state.command = { n: "turn", v: angle };
    },
    next: "sendCommand"
  },
  closeLeader: {
    condition: (mgr, state) => mgr.getDistance(state.leader) < 7,
    trueCond: "veryCloseLeader",
    falseCond: "runSlower"
  },
  veryCloseLeader: {
    condition: (mgr, state) => (mgr.getDistance(state.leader) < 1 &&
    Math.abs(mgr.getAngle(state.leader)) < 40),
    trueCond: "rotateClose",
    falseCond: "runVerySlow"
  },
  rotateClose: {
    exec(mgr, state) {
      state.command = { n: "turn", v: "30" };
    },
    next: "sendCommand"
  },
  runVerySlow: {
    exec(mgr, state) {
      state.command = { n: "dash", v: "20" };
    },
    next: "sendCommand"
  },
  runSlower: {
    exec(mgr, state) {
      state.command = { n: "dash", v: "40" };
    },
    next: "sendCommand"
  },
  seekLeader: {
    exec(mgr, state) {
      state.command = { n: "turn", v: "90" };
    },
    next: "sendCommand"
  },
  sendCommand: {
    command: (mgr, state) => state.command
  }
};

module.exports = DT;
