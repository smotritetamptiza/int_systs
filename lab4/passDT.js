const FL = "flag", KI = "kick";
const DT = {
  state: {
    next: 0,
    sequence: [{act: FL, fl: "fplc"}, {act: FL, fl: "b"}],
    command: null,
    wait_counter: 15,
    said_go: false,
    passed: false,
    coordinates: null,
    teammateCoordinates: null,
    teammateVector: null
  },
  setTeamname(teamName) {
    this.state.teamName = teamName;
  },
  setMyCoordinates(coordinates) {
    if (coordinates) {
      this.state.coordinates = {
        x: Number(coordinates.x),
        y: Number(coordinates.y),
      };
    }
  },
  setTeammateCoordinates(coordinates) {
    if (this.state.teammateCoordinates && coordinates) {
      this.state.teammateVector = {
        x: Number(coordinates.x) - this.state.teammateCoordinates.x,
        y: Number(coordinates.y) - this.state.teammateCoordinates.y,
      };
    }
    if (coordinates) {
      this.state.teammateCoordinates = {
        x: Number(coordinates.x),
        y: Number(coordinates.y),
      };
    }
  },
  root: {
    exec(mgr, state) {
      if (state.next == 0) {
        state.passed = false;
      }
      state.action = state.sequence[state.next];
      state.command = null;
    },
    next: "passed"
  },
  passed: {
    condition: (mgr, state) => state.passed,
    trueCond: "wait",
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
      let oldDistance = mgr.getTeammateDistance(state.teamName);
      let coeff = oldDistance / 1.8 + 1;
      let currCoordRel = {
        x: state.teammateCoordinates.x - state.coordinates.x,
        y: state.teammateCoordinates.y - state.coordinates.y,
      };
      let nextPosRel = {
        x: currCoordRel.x + coeff*state.teammateVector.x,
        y: currCoordRel.y + coeff*state.teammateVector.y
      };
      let oldAngle = Math.atan(currCoordRel.y / currCoordRel.x);
      let nextPosRotated = {
        x: Math.cos(oldAngle) * nextPosRel.x + Math.sin(oldAngle) * nextPosRel.y,
        y: -Math.sin(oldAngle) * nextPosRel.x + Math.cos(oldAngle) * nextPosRel.y
      };
      let newAngle = Math.atan(nextPosRotated.y / nextPosRotated.x);

      let coordCheck = {
        x: Math.cos(oldAngle) * currCoordRel.x - Math.sin(oldAngle) * currCoordRel.y,
        y: Math.sin(oldAngle) * currCoordRel.x + Math.cos(oldAngle) * currCoordRel.y
      };

      //console.log("check: " + JSON.stringify(coordCheck));

      console.log("curr pos: " + JSON.stringify(currCoordRel));
      console.log("next pos: " + JSON.stringify(nextPosRel));

      //console.log("curr angle: " + JSON.stringify(oldAngle));
      console.log("next angle (rel): " + (newAngle / Math.PI * 180));

      state.command = { n: "kick", v: 90,
      a: mgr.getTeammateAngle(state.teamName) + (newAngle / Math.PI * 180)}; // НАДО ОПРЕДЕЛЯТЬ ЗНАК УГЛА
      state.said_go = false;
      state.wait_counter = 15;
      state.passed = true;
    },
    next: "sendCommand"
  },
  sayGo: {
    exec(mgr, state) {
      state.command = { n: "say", v: "go" };
      state.said_go = true;
      console.log("i said go");
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
