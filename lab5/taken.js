const Flags = require('./flags');

let Taken = {
  setSee(input, team, side) {
    if (!input) throw "Can't see shit"
    this.setMemory(); 	  
    this.flags = this.visibleFlags(input);
    if (this.pos && this.flags.length >= 2) {
      this.ball = this.locateGoal(input, this.flags, "b");
      let oppSide = side == "l" ? "r" : "l";
      this.goal = this.locateGoal(input, this.flags, "g" + oppSide);
      this.goalOwn = this.locateGoal(input, this.flags, "g" + side);
      this.teamOwn = this.locatePlayers(input, this.flags, (teamName) => team == teamName);
      this.team = this.locatePlayers(input, this.flags, (teamName) => team != teamName);
		
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
  ball: null,
  teamOwn: [],
  team: [],
  goalOwn: null,
  goal: null,
  memories: {
	ticks: 3,  
  	prevTeamOwn: [],
	prevTeam: [],
	prevPos: [],
	prevBall: [],
  },
  flags: [],
  setMemory(){
	  if(this.memories.prevPos.length >= this.memories.ticks){
	  	this.memories.prevTeamOwn.pop();
	  	this.memories.prevTeam.pop();
		this.memories.prevPos.pop();
	  	this.memories.prevBall.pop();
	  }
  		if(this.teamOwn) this.memories.prevTeamOwn.unshift(this.teamOwn);
	  	if(this.team) this.memories.prevTeam.unshift(this.team);
		if(this.pos) this.memories.prevPos.unshift(this.pos);
	  	if(this.ball) this.memories.prevBall.unshift(this.ball);
	  //console.log(JSON.stringify(this.memories.prevTeam));
  },	
  visibleFlags(p) {
    let flags = [];
    for (let res of p) {
      if (res.cmd && res.cmd.p && res.cmd.p.length > 0 && (res.cmd.p[0] == "f" || res.cmd.p[0] == "g")) {
        let f_name = res.cmd.p.join('');
        try {
          let f = {
            n: f_name,
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
          if (!this.areOnTheLine(flags[0], this.pos, flags[i])) {
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
  calculateAngle(f_name){
  	let f1 = {
            n: f_name,
            x: Flags[f_name].x,
            y: Flags[f_name].y
          };
	if(!this.flags || !this.pos) return 90;
	  let f2 = this.flags[0];
	  if(this.flags[1]) f2 = this.flags[1];
	  
	  let v1 = {x: f1.x - this.pos.x, y: f1.y - this.pos.y};
	  let v2 = {x: f2.x - this.pos.x, y: f2.y - this.pos.y};
	  let angle = Math.acos((v1.x*v2.x+v1.y*v2.y)/(Math.sqrt(v1.x**2 + v1.y**2)*Math.sqrt(v2.x**2 + v2.y**2)));
	  
	  if((angle + f2.a).toFixed(0) == 0) return 180;
	  return (angle + f2.a).toFixed(1);
  },
};

module.exports = Taken;
