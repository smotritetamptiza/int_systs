class RoleDistributor {
  constructor(team, id, goal) {
    this.state = {
      command: null,
      mindistance: null,
	  leaderid: null,
	  turns: 0
    };
	this.state.role = null;
    this.state.team = team;
    this.state.id = id;
    this.state.goal = goal;
	this.state.goalcoords = null;

    this.root = {
      exec(mgr, state) {
        state.command = null;
      },
      next: "start"
    };
	this.start = {
	  condition: (mgr, state) => state.mindistance,
      trueCond: "teammaterotate",
      falseCond: "goalVisible"
    };
    this.goalVisible = {
      condition: (mgr, state) => mgr.getVisible(state.goal),
      trueCond: "mydistance",
      falseCond: "rotate"
    };
    this.mydistance = {
      exec(mgr, state) {
        state.mindistance = mgr.getDistance(state.goal);
		state.leaderid = state.id;
		console.log("mydistance")  ;
		  //add gole coords here or in agent? this.state.goalcoords

      },
      next: "teammaterotate"
    };
	this.teammaterotate = {
	  condition: (mgr, state) => 4 > state.turns,
      trueCond: "serchteammate",
      falseCond: "chooseleader"
    };
	this.serchteammate = {
      exec(mgr, state) {
        state.command = { n: "turn", v: "90" };
		state.turns = state.turns+1;
		console.log("serchteammate "+ state.turns);
      },
      next: "sendCommand"
    };
	this.chooseleader = {
	  condition: (mgr, state) => state.id == state.leaderid,
      trueCond: "leader",
      falseCond: "following"
    };
	this.leader = {
      exec(mgr, state) {
        state.role = "leader";
		  console.log(state.role);
		  state.command = { n: "turn", v: "0" };
      },
      next: "sendCommand"
    };
	this.following = {
      exec(mgr, state) {
        state.role = "following";
		  console.log(state.role);
		  state.command = { n: "turn", v: "0" };
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
