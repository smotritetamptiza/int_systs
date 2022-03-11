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
    next: "closeLeader"
  },
  closeLeader: {
    condition: (mgr, state) => (mgr.getDistance(state.leader) < 1 &&
    Math.abs(mgr.getAngle(state.leader)) < 40),
    trueCond: "rotate",
    falseCond: "farLeader"
  },
  rotate: {
    exec(mgr, state) {
      /*let angle = 30;
      if (mgr.getAngle(state.leader) < 0) {
        angle = -30;
      }*/
      state.command = { n: "turn", v: "30" };
    },
    next: "sendCommand"
  },
  farLeader: {
    condition: (mgr, state) => mgr.getDistance(state.leader) > 10,
    trueCond: "checkAngleFar",
    falseCond: "checkAngleClose"
  },
  checkAngleFar: {
    condition: (mgr, state) => Math.abs(mgr.getAngle(state.leader)) > 5,
    trueCond: "rotateToLeader",
    falseCond: "runFast"
  },
  rotateToLeader: {
    exec(mgr, state) {
      state.command = { n: "turn", v: mgr.getAngle(state.leader) };
    },
    next: "sendCommand"
  },
  runFast: {
    exec(mgr, state) {
      state.command = { n: "dash", v: "80" };
    },
    next: "sendCommand"
  },
  checkAngleClose: {
    condition: (mgr, state) => (Math.abs(mgr.getAngle(state.leader)) > 40 ||
    Math.abs(mgr.getAngle(state.leader)) < 25),
    trueCond: "rotateALittle",
    falseCond: "leaderRelativelyClose"
  },
  rotateALittle: {
    exec(mgr, state) {
      let angle = mgr.getAngle(state.leader);
      if (angle > 0) {
        angle -= 20;
      } else {
        angle += 20;
      }
      state.command = { n: "turn", v: angle };
    },
    next: "sendCommand"
  },
  leaderRelativelyClose: {
    condition: (mgr, state) => mgr.getDistance(state.leader) < 7,
    trueCond: "runVerySlow",
    falseCond: "runSlow"
  },
  runVerySlow: {
    exec(mgr, state) {
      state.command = { n: "dash", v: "20" };
    },
    next: "sendCommand"
  },
  runSlow: {
    exec(mgr, state) {
      state.command = { n: "dash", v: "40" };
    },
    next: "sendCommand"
  },
  sendCommand: {
    command: (mgr, state) => state.command
  }
};

module.exports = DT;
