const Flags = require('./flags');

let Taken = {
  setSee(input, team, side) {
    if (!input) throw "Can't see shit"
    if (this.ball) this.ballPrev = this.ball
    let flags = this.visibleFlags(input);
    if (this.pos && flags.length >= 2) {
      this.ball = this.locateGoal(input, flags, "b");
      let oppSide = side == "l" ? "r" : "l";
      this.goal = this.locateGoal(input, flags, "g" + oppSide);
      this.goalOwn = this.locateGoal(input, flags, "g" + side);
      this.teamOwn = this.locatePlayers(input, flags, (teamName) => team == teamName);
      this.team = this.locatePlayers(input, flags, (teamName) => team != teamName);
    }
	return this;  
  },
  setLocation(coords) {
    if (!coords) return
    this.pos = {
      x: Number(coords.x),
      y: Number(coords.y)
    };
  },
  setHear(input) {
    this.hear.unshift({
      time: input[0],
      who: input[1],
      msg: input[2]
    })
  },
  time: 0,
  pos: null,
  hear: [],
  ballPrev: null,
  ball: null,
  teamOwn: [],
  team: [],
  goalOwn: null,
  goal: null,
  visibleFlags(p) {
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
    return flags;
  },
  locateGoal(p, flags, obj) {
    let goal, goalCoordinates;
    for (let res of p) {
      if (res.cmd && res.cmd.p && res.cmd.p.length > 0 && res.cmd.p.join('') == obj) {
        goal = {
          d: res.p[0],
          a: res.p[1]
        };
        break;
      }
    }
    if (!goal) return;
    for (let i = 1; i < flags.length; i++) {
      if (!this.areOnTheLine(flags[0], this.pos, flags[i])) {
        goalCoordinates = this.locateObject(flags[0], flags[i], goal);
        if (goalCoordinates) return {
          x: goalCoordinates.x,
          y: goalCoordinates.y,
          f: obj,
          dist: goal.d,
          angle: goal.a
        };
      }
    }
    if (!goalCoordinates) {
      console.log("couldn't locate goal");
      return;
    }
  },
  locatePlayers(p, flags, teamNameCmp) {
    let players = [];
    for (let res of p) {
      if (res.cmd && res.cmd.p && res.cmd.p.length > 0 && res.cmd.p[0] == "p" &&
      res.cmd.p[1] && teamNameCmp((res.cmd.p[1]).slice(1, (res.cmd.p[1]).length -1)) && res.cmd.p[2]) {
        let player = {
          d: res.p[0],
          a: res.p[1]
        };
        let playerCoordinates;
				for (let i = 1; i < flags.length; i++) {
          if (!this.areOnTheLine(flags[0], this.coordinates, flags[i])) {
            playerCoordinates = this.locateObject(flags[0], flags[i], player);
            if (playerCoordinates) {
              players.push({
                x: Number(playerCoordinates.x),
                y: Number(playerCoordinates.y),
                f: res.cmd.p.join(""),
                dist: player.d,
                angle: player.a
              });
              break;
            }
					}
				}
      }
    }
    return players;
  },
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
  },
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
  },
  calculateDistanceAngle(f, a) {
    return Math.sqrt(f.d**2 + a.d**2 - 2*f.d*a.d*Math.cos(Math.abs(f.a - a.a) / 180 * Math.PI));
  },
  calculateDistanceCoords(c1, c2){
  	return Math.sqrt((c1.x - c2.x)**2 + (c1.y - c2.y)**2);
  },
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
      x: this.pos.x,
      y: this.pos.y,
      d: object.d
    }
    return this.threeFlagCoordinates(flag1, flag2, flag3);
  },
};

module.exports = Taken;
