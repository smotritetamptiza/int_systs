class DT {
  constructor() {
    this.state = {
      command: null,
      leader: null,
      position: null
    };
    this.root = {
      exec(mgr, state) {
          state.command = null;
      },
      next: "leaderVisible"
    };
    this.leaderVisible = {
      condition: (mgr, state) => mgr.getVisible(state.leader),
      trueCond: "farLeader",
      falseCond: "seekLeader"
    };
    this.farLeader = {
      condition: (mgr, state) => mgr.getDistance(state.leader) > 10,
      trueCond: "angleFar",
      falseCond: "checkLeft"
    };
    this.angleFar = {
      condition: (mgr, state) => Math.abs(mgr.getAngle(state.leader)) > 5,
      trueCond: "rotateFar",
      falseCond: "runFast"
    };
    this.rotateFar = {
      exec(mgr, state) {
        state.command = { n: "turn", v: mgr.getAngle(state.leader) };
      },
      next: "sendCommand"
    };
    this.runFast = {
      exec(mgr, state) {
        state.command = { n: "dash", v: "100" };
      },
      next: "sendCommand"
    };
    this.checkLeft = {
      condition: (mgr, state) => state.position == "left",
      trueCond: "angleCloseLeft",
      falseCond: "angleCloseRight"
    };
    this.angleCloseLeft = {
      condition: (mgr, state) => (mgr.getAngle(state.leader) > 40 ||
      mgr.getAngle(state.leader) < 25),
      trueCond: "rotateSlightlyLeft",
      falseCond: "closeLeader"
    };
    this.rotateSlightlyLeft = {
      exec(mgr, state) {
        state.command = { n: "turn", v: mgr.getAngle(state.leader) - 30 };
      },
      next: "sendCommand"
    };
    this.angleCloseRight = {
      condition: (mgr, state) => (mgr.getAngle(state.leader) < -40 ||
      mgr.getAngle(state.leader) > -25),
      trueCond: "rotateSlightlyRight",
      falseCond: "closeLeader"
    };
    this.rotateSlightlyRight = {
      exec(mgr, state) {
        state.command = { n: "turn", v: mgr.getAngle(state.leader) + 30 };
      },
      next: "sendCommand"
    };
    this.closeLeader = {
      condition: (mgr, state) => mgr.getDistance(state.leader) < 7,
      trueCond: "runVerySlow",
      falseCond: "runSlower"
    };
    this.runVerySlow = {
      exec(mgr, state) {
        state.command = { n: "dash", v: "20" };
      },
      next: "sendCommand"
    };
    this.runSlower = {
      exec(mgr, state) {
        state.command = { n: "dash", v: "40" };
      },
      next: "sendCommand"
    };
    this.seekLeader = {
      exec(mgr, state) {
        state.command = { n: "turn", v: "90" };
      },
      next: "sendCommand"
    };
    this.sendCommand = {
      command: (mgr, state) => state.command
    }
  }

  setLeader(leader) {
    this.state.leader = leader;
  }
  setPosition(position) {
    this.state.position = position;
  }
};

module.exports = DT;
