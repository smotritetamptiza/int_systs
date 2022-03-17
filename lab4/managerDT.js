const Manager = {
  getAction(dt, p) {
    this.p = p;
    function execute(dt, title) {
      const action = dt[title];
      if (typeof action.exec == "function") {
        action.exec(Manager, dt.state);
        return execute(dt, action.next);
      }
      if (typeof action.condition == "function") {
        const cond = action.condition(Manager, dt.state);
        if (cond) {
          return execute(dt, action.trueCond);
        }
        return execute(dt, action.falseCond);
      }
      if (typeof action.command == "function") {
        return action.command(Manager, dt.state);
      }
      throw new Error(`Unexpected node in DT: ${title}`);
    }
    return execute(dt, "root");
  },
  getVisible(obj) {
    if (!this.p) {
      return false;
    }
    for (let res of this.p) {
      if (res.cmd && res.cmd.p && res.cmd.p.length > 0) {
        let f_name = res.cmd.p.join('');
        if (f_name == obj) {
          return true;
        }
      }
    }
    return false;
  },
  getDistance(obj) {
    if (!this.p) {
      throw new Error("I can't see shit!");
    }
    for (let res of this.p) {
      if (res.cmd && res.cmd.p && res.cmd.p.length > 0) {
        let f_name = res.cmd.p.join('');
        if (f_name == obj) {
          return res.p[0];
        }
      }
    }
    throw new Error("I can't see the shit!");
  },
  getAngle(obj) {
    if (!this.p) {
      throw new Error("I can't see shit!");
    }
    for (let res of this.p) {
      if (res.cmd && res.cmd.p && res.cmd.p.length > 0) {
        let f_name = res.cmd.p.join('');
        if (f_name == obj) {
          return res.p[1];
        }
      }
    }
    throw new Error("I can't see the shit!");
  },
  seesTeammate(teamName) {
  	if (this.p) {
    	for (let res of this.p) {
        /*if (res.cmd && res.cmd.p && res.cmd.p.length > 1) {
          console.log(res.cmd.p);
        }*/

        if (res.cmd && res.cmd.p && res.cmd.p.length > 0 && res.cmd.p[0] == "p" &&
        res.cmd.p[1] && (res.cmd.p[1] == "\"" + teamName + "\"")) {
          console.log("I see my teammate");
          return true;
        }
      }
  	}
    return false;
  },
  getTeammateAngle(teamName) {
    if (this.p) {
      for (let res of this.p) {
        if (res.cmd && res.cmd.p && res.cmd.p.length > 0 && res.cmd.p[0] == "p" &&
        res.cmd.p[1] && (res.cmd.p[1] == "\"" + teamName + "\"")) {
          console.log("I see my teammate");
          return res.p[1];
        }
      }
    }
    console.error("I can't see the shit");
  }
};

module.exports = Manager;
