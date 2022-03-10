class RoleDistributor {
  constructor(team, id, goal) {
    this.state = {
      command: null,
      distance: null
    };
    this.state.team = team;
    this.state.id = id;
    this.state.goal = goal;
    this.root = {
      exec(mgr, state) {
        state.command = null;
      },
      next: "goalVisible"
    };
    this.goalVisible = {
      condition: (mgr, state) => mgr.getVisible(state.goal),
      trueCond: "shout",
      falseCond: "rotate"
    };
    this.shout = {
      exec(mgr, state) {
        state.distance = mgr.getDistance(state.goal);
        let msg = `${state.team} ${state.id} ${state.distance}`;
        console.log(msg);
        state.command = { n: "say", v: msg };
      },
      next: "sendCommand"
    };
    this.rotate = {
      exec(mgr, state) {
        state.command = { n: "turn", v: "90" };
      },
      next: "sendCommand"
    };
    this.sendCommand = {
      command: (mgr, state) => state.command
    };
  }
}

module.exports = RoleDistributor;
