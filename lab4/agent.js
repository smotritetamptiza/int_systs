const Msg = require('./msg');
const readline = require('readline');
const managerDT = require('./managerDT');
const spDT = require('./singlePlayerDT');
const RoleDistributor = require('./roleDistributor');
let followingDT = require('./followingDT');
const goalieDT = require('./goalieDT');
const passDT = require('./passDT');
const scoreDT = require('./scoreDT');

const Flags = {
  ftl50: {x: -50, y: -39}, ftl40: {x: -40, y: -39},
  ftl30: {x: -30, y: -39}, ftl20: {x: -20, y: -39},
  ftl10: {x: -10, y: -39}, ft0: {x: 0, y: -39},
  ftr50: {x: 50, y: -39}, ftr40: {x: 40, y: -39},
  ftr30: {x: 30, y: -39}, ftr20: {x: 20, y: -39},
  ftr10: {x: 10, y: -39},
  fbl50: {x: -50, y: 39}, fbl40: {x: -40, y: 39},
  fbl30: {x: -30, y: 39}, fbl20: {x: -20, y: 39},
  fbl10: {x: -10, y: 39}, fb0: {x: 0, y: 39},
  fbr50: {x: 50, y: 39}, fbr40: {x: 40, y: 39},
  fbr30: {x: 30, y: 39}, fbr20: {x: 20, y: 39},
  fbr10: {x: 10, y: 39},
  flt30: {x: -57.5, y: -30}, flt20: {x: -57.5, y: -20},
  flt10: {x: -57.5, y: -10}, fl0: {x: -57.5, y: -0},
  flb30: {x: -57.5, y: 30}, flb20: {x: -57.5, y: 20},
  flb10: {x: -57.5, y: 10},
  frt30: {x: 57.5, y: -30}, frt20: {x: 57.5, y: -20},
  frt10: {x: 57.5, y: -10}, fr0: {x: 57.5, y: -0},
  frb30: {x: 57.5, y: 30}, frb20: {x: 57.5, y: 20},
  frb10: {x: 57.5, y: 10},
  flt: {x: -52.5, y: -34}, flb: {x: -52.5, y: 34},
  fglt: {x: -52.5, y: -7.01}, fglb: {x: -52.5, y: 7.01},
  gl: {x: -52.5, y: 0}, fplc: {x: -36, y: 0},
  fplt: {x: -36, y: -20.15}, fplb: {x: -36, y: 20.15},
  fc: {x: 0, y: 0}, fct: {x: 0, y: -34}, fcb: {x: 0, y: 34},
  frt: {x: 52.5, y: -34}, frb: {x: 52.5, y: 34},
  fgrt: {x: 52.5, y: -7.01}, fgrb: {x: 52.5, y: 7.01},
  gr: {x: 52.5, y: 0}, fprc: {x: 36, y: 0},
  fprt: {x: 36, y: -20.15}, fprb: {x: 36, y: 20.15}
};

class Agent {
  constructor(teamName, initialCoordinates, goalie, role) {
    this.teamName = teamName;
    this.initialCoordinates = initialCoordinates;
    this.position = 'l';
    this.run = false;
    this.act = null;
    this.coordinates;
    this.vector;
    this.lastact;
    this.role = role;
    this.DT = null;
    this.goalie = goalie;
    this.teammates = [];
  }
  msgGot(msg) {
    let data = msg.toString('utf8');
    this.processMsg(data);
    this.sendCmd();
  }
  setSocket(socket) {
    this.socket = socket;
  }
  socketSend(cmd, value) {
    this.socket.sendMsg(`(${cmd} ${value})`);
  }
  processMsg(msg) {
    let data = Msg.parseMsg(msg);
    if (!data) throw new Error("Parse error\n" + msg);
    if (data.cmd == "init") this.initAgent(data.p);
    this.analyzeEnv(data.msg, data.cmd, data.p);
  }
  initAgent(p) {
    if (p[0] == "r") this.position = "r";
    if (p[1]) this.id = p[1];
    if (this.role == "pass") {
      this.DT = passDT;
      this.DT.setTeamname(this.teamName);
    }
	if (this.role == "score") {
      this.DT = scoreDT;
      this.DT.setTeamname(this.teamName);
    }
  }
  analyzeEnv(msg, cmd, p) {
    if (cmd == 'see') {
      this.locateSelf(p);
      if (this.run && this.DT) {
        managerDT.getAction(this.DT, p);
        this.act = this.DT.state.command;
      }
    }

    if (cmd == 'hear') {
      console.log(p);
      if (p && p.length >= 3) {
        if (p[2] == "play_on") {
          this.run = true;
        } 
		if (this.run && p[2].startsWith("goal_")) {
          this.run = false;
          this.socketSend('move', this.initialCoordinates);
        }
		if(p[1] != "self" && p[2] == "go" && !p[1].startsWith("not")){
			this.DT.state.heard_go = true;
		}  
      }
    }
  }
  sendCmd() {
    if (this.run) {
      if (this.act) {
        if (this.act.n == "kick") {
          if (!this.act.a) this.act.a = 0;
          this.socketSend(this.act.n, this.act.v + " " + this.act.a);
        } else {
          this.socketSend(this.act.n, this.act.v);
        }
        this.lastact = { n: this.act.n, v: this.act.v };
      }
      this.act = null;
    }
  }
  locateSelf(p) {
    if (p && p.length > 3) {
      let flags = [];
      for (let res of p) {
        if (res.cmd && res.cmd.p && res.cmd.p.length > 0 && (res.cmd.p[0] == "f" || res.cmd.p[0] == "g")) {
          let f_name = res.cmd.p.join('');
          try {
            let f = {
              x: Flags[f_name].x,
              y: Flags[f_name].y,
              d: res.p[0],
              a: res.p[1]
            };
            flags.push(f);
          } catch (e) {
            console.log(f_name);
            console.log(e);
          }
        }
      }
      if (flags.length >= 3) {
        for (let i = 2; i < flags.length; i++) {
          if (!this.areOnTheLine(flags[0], flags[1], flags[i])) {
            if(this.coordinates) this.vector = { x: this.coordinates.x, y: this.coordinates.y };
            else this.vector = { x: 0, y: 0 };
            this.coordinates = this.threeFlagCoordinates(flags[0], flags[1], flags[i]);
            if(this.coordinates) {
              this.vector = { x: (this.coordinates.x - this.vector.x).toFixed(2), y: (this.coordinates.y - this.vector.y).toFixed(2) };
            }
            break;
          }
        }
      } else if (this.coordinates && this.lastact && this.lastact.n == "dash") {
        this.coordinates = {
          x: (Number(this.coordinates.x) + Number(this.vector.x)).toFixed(2),
          y: (Number(this.coordinates.y) + Number(this.vector.y)).toFixed(2)
        };
      }
    }
  }
  locateGoal(p, obj) {
    if (p && p.length > 3) {
      let flags = [];
	  let goalCoordinates = null;
	  let goal;
      for (let res of p) {
        if (res.cmd && res.cmd.p && res.cmd.p.length > 0 && (res.cmd.p[0] == "f" || res.cmd.p[0] == "g")) {
          let f_name = res.cmd.p.join('');
          try {
            let f = {
              x: Flags[f_name].x,
              y: Flags[f_name].y,
              d: res.p[0],
              a: res.p[1]
            };
            flags.push(f);
          }
			catch (e) {
            console.log(f_name);
            console.log(e);
          }

        }
		  if (res.cmd && res.cmd.p && res.cmd.p.length > 0 && res.cmd.p.join('') == obj) {
              goal = {
                d: res.p[0],
                a: res.p[1]
              };
            }
      }
      for (let i = 1; i < flags.length; i++) {
        if (!this.areOnTheLine(flags[0], this.coordinates, flags[i])) {
            goalCoordinates = this.locateObject(flags[0], flags[i], goal);
            return goalCoordinates;
            }
       	}
    }
	console.log("I can't locate goal!!!");

  }
  closestPlayertoGoal(p, team, goalCoordinates) {
    if (p && p.length > 3) {
      let flags = [];
      for (let res of p) {
        if (res.cmd && res.cmd.p && res.cmd.p.length > 0 && (res.cmd.p[0] == "f" || res.cmd.p[0] == "g")) {
          let f_name = res.cmd.p.join('');
          try {
            let f = {
              x: Flags[f_name].x,
              y: Flags[f_name].y,
              d: res.p[0],
              a: res.p[1]
            };
            flags.push(f);
          }
			catch (e) {
            console.log(f_name);
            console.log(e);
          }

        }
	  }
		for (let res of p) {
			if (res.cmd && res.cmd.p && res.cmd.p.length > 0 && res.cmd.p[0] == "p" &&
      res.cmd.p[1] && (team == (res.cmd.p[1]).slice(1, (res.cmd.p[1]).length -1)) && res.cmd.p[2]) {
              let player = {
                d: res.p[0],
                a: res.p[1]
              };
              let playerCoordinates;
          	  let distance;
				for (let i = 1; i < flags.length; i++) {
					if (!this.areOnTheLine(flags[0], this.coordinates, flags[i])) {
						playerCoordinates = this.locateObject(flags[0], flags[i], player);
						distance = this.calculateDistanceCoords(playerCoordinates, goalCoordinates);
            if (playerCoordinates && distance) break;
					}
				}
        let isin = this.teammates.filter(tm => tm.id == res.cmd.p[2]);
        if (isin.length == 0) {
          this.teammates.push({
            id: res.cmd.p[2],
            coords: playerCoordinates,
            dist: distance
          });
        }
      }
    }
    }
  }
  areOnTheLine(p1, p2, p3) {
    if (p1.x == p2.x && p1.x == p3.x) {
      return true;
    }
    if (p1.y == p2.y && p1.y == p3.y) {
      return true;
    }
    let alpha = (p1.y - p2.y) / (p1.x - p2.x);
    let beta = p1.y - alpha * p1.x;
    if (p3.y == alpha * p3.x + beta) {
      return true;
    }
    return false;
  }
  threeFlagCoordinates(f1, f2, f3) {
    let x = 0;
    let y = 0;
    if (f1.x == f2.x || f1.x == f3.x) {
      let g1, g2, g3;
      if (f1.x == f2.x) {
        g1 = f1;
        g2 = f2;
        g3 = f3;
      } else {
        g1 = f1;
        g2 = f3;
        g3 = f2;
      }
      y = (g2.y**2 - g1.y**2 + g1.d**2 - g2.d**2) / 2 /(g2.y - g1.y);
      x = (g1.d**2 - g3.d**2 - g1.x**2 + g3.x**2 -g1.y**2 +g3.y**2 +
        2*y*(g1.y - g3.y)) / 2 / (g3.x - g1.x);
    } else {
      let alpha1 = (f1.y - f2.y) / (f2.x - f1.x);
      let beta1 = (f2.y**2 - f1.y**2 + f2.x**2 - f1.x**2 + f1.d**2 - f2.d**2) / 2 / (f2.x - f1.x);
      let alpha2 = (f1.y - f3.y) / (f3.x - f1.x);
      let beta2 = (f3.y**2 - f1.y**2 + f3.x**2 - f1.x**2 + f1.d**2 - f3.d**2) / 2 / (f3.x - f1.x);
      y = (beta1 - beta2) / (alpha2 - alpha1);
      x = alpha1 * y + beta1;
    }
    return { x: x.toFixed(2), y: y.toFixed(2) };
  }
  calculateDistanceAngle(f, a) {
    return Math.sqrt(f.d**2 + a.d**2 - 2*f.d*a.d*Math.cos(Math.abs(f.a - a.a) / 180 * Math.PI));
  }
  calculateDistanceCoords(c1, c2){
  	return Math.sqrt((c1.x - c2.x)**2 + (c1.y - c2.y)**2);
  }
  locateObject(f1, f2, object) {
    let da1 = this.calculateDistanceAngle(f1, object);
    let da2 = this.calculateDistanceAngle(f2, object);
    let flag1 = {
      x: f1.x,
      y: f1.y,
      d: da1
    }
    let flag2 = {
      x: f2.x,
      y: f2.y,
      d: da2
    }
    let flag3 = {
      x: this.coordinates.x,
      y: this.coordinates.y,
      d: object.d
    }
    return this.threeFlagCoordinates(flag1, flag2, flag3);
  }

}
module.exports = Agent;
