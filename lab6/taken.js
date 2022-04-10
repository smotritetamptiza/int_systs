const Flags = require('./flags');

class Taken {
  constructor(id) {
	this.isGoal = false
	this.id = id
    this.pos = null
    this.side = "l"
    this.hear = []
    this.ball = null
    this.teamOwn = []
    this.team = []
    this.goalOwn = null
    this.goal = null
    /*this.memories = {
      ticks: 3,
      prevTeamOwn: [],
      prevTeam: [],
      prevPos: [],
      prevBall: [],
    }*/
    this.flags = []
  }
  setSee(input, team, side, id) {
	  this.id = id
    this.side = side
    if (!input) throw "Can't see shit"
    //this.setMemory();
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
  }
  setLocation(coords) {
    if (!coords) return
    this.pos = {
      x: Number(coords.x),
      y: Number(coords.y)
    };
  }
  setHear(input) {
    this.hear.unshift({
      time: input[0],
      who: input[1],
      msg: input[2]
    })
	if(this.hear.length > 1) this.hear.pop();
  }
  /*setMemory(){
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
  }*/
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
            dist: res.p[0],
            angle: res.p[1]
          };
          flags.push(f);
        } catch (e) {
          console.log(f_name);
          console.log(e);
        }
      }
    }
    return flags;
  }
  locateGoal(p, flags, obj) {
    let goal, goalCoordinates;
    for (let res of p) {
      if (res.cmd && res.cmd.p && res.cmd.p.length > 0 && res.cmd.p.join('') == obj) {
        goal = {
          dist: res.p[0],
          angle: res.p[1]
        };
        break;
      }
    }
    if (!goal) return;
    for (let i = 1; i < flags.length; i++) {
      if (!this.areOnTheLine(flags[0], this.pos, flags[i])) {
        goalCoordinates = this.locateObject(flags[0], flags[i], goal);
		//if(goalCoordinates.x == NaN || goalCoordinates.y == NaN || goalCoordinates.x == "NaN" || goalCoordinates.y == "NaN") console.log(JSON.stringify(flags[0])+ JSON.stringify(flags[i])+ JSON.stringify(goal) )
        if (goalCoordinates) return {
          x: goalCoordinates.x,
          y: goalCoordinates.y,
          f: obj,
          dist: goal.dist,
          angle: goal.angle
        };
      }
    }
    if (!goalCoordinates) {
      console.log("couldn't locate goal");
      return;
    }
  }
  locatePlayers(p, flags, teamNameCmp) {
    let players = [];
    for (let res of p) {
      if (res.cmd && res.cmd.p && res.cmd.p.length > 0 && res.cmd.p[0] == "p" &&
      res.cmd.p[1] && teamNameCmp((res.cmd.p[1]).slice(1, (res.cmd.p[1]).length -1)) && res.cmd.p[2]) {
        let player = {
          dist: res.p[0],
          angle: res.p[1]
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
                dist: player.dist,
                angle: player.angle
              });
              break;
            }
					}
				}
      }
    }
    return players;
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
      y = (g2.y**2 - g1.y**2 + g1.dist**2 - g2.dist**2) / 2 /(g2.y - g1.y);
      x = (g1.dist**2 - g3.dist**2 - g1.x**2 + g3.x**2 -g1.y**2 +g3.y**2 +
        2*y*(g1.y - g3.y)) / 2 / (g3.x - g1.x);
    } else {
      let alpha1 = (f1.y - f2.y) / (f2.x - f1.x);
      let beta1 = (f2.y**2 - f1.y**2 + f2.x**2 - f1.x**2 + f1.dist**2 - f2.dist**2) / 2 / (f2.x - f1.x);
      let alpha2 = (f1.y - f3.y) / (f3.x - f1.x);
      let beta2 = (f3.y**2 - f1.y**2 + f3.x**2 - f1.x**2 + f1.dist**2 - f3.dist**2) / 2 / (f3.x - f1.x);
      y = (beta1 - beta2) / (alpha2 - alpha1);
      x = alpha1 * y + beta1;
    }
    return { x: x.toFixed(2), y: y.toFixed(2) };
  }
  calculateDistanceAngle(f, angle) {
    return Math.sqrt(f.dist**2 + angle.dist**2 - 2*f.dist*angle.dist*Math.cos(Math.abs(f.angle - angle.angle) / 180 * Math.PI));
  }
  calculateDistanceCoords(c1, c2){
  	return Math.sqrt((c1.x - c2.x)**2 + (c1.y - c2.y)**2);
  }
  calculateDistanceToFlag(c1, f_name){
  	return Math.sqrt((c1.x - Flags[f_name].x)**2 + (c1.y - Flags[f_name].y)**2);
  }
  locateObject(f1, f2, object) {
    let da1 = this.calculateDistanceAngle(f1, object);
    let da2 = this.calculateDistanceAngle(f2, object);
    let flag1 = {
      x: f1.x,
      y: f1.y,
      dist: da1
    }
    let flag2 = {
      x: f2.x,
      y: f2.y,
      dist: da2
    }
    let flag3 = {
      x: this.pos.x,
      y: this.pos.y,
      dist: object.dist
    }
    return this.threeFlagCoordinates(flag1, flag2, flag3);
  }
  calculateAngle(f_name){
    return this.calculateAngleFromCoords(Flags[f_name].x, Flags[f_name].y)
  }
  calculateAngleFromCoords(x, y) {
      if(!this.flags || !this.pos) return 90;
  	  let f2 = this.flags[0];
  	  //if(this.flags[1]) f2 = this.flags[1];
  	  let v1 = {x: x - this.pos.x, y: y - this.pos.y};
  	  let v2 = {x: f2.x - this.pos.x, y: f2.y - this.pos.y};
  	  let angle = Math.acos((v1.x*v2.x+v1.y*v2.y)/(Math.sqrt(v1.x**2 + v1.y**2)*Math.sqrt(v2.x**2 + v2.y**2)));

  	  if((angle + f2.angle).toFixed(0) == 0) return 180;
  	  return (angle + f2.angle).toFixed(1);
  }
  interceptionPoint() {
    let k1 = (Flags["g"+this.side].y - this.ball.y)/(Flags["g"+this.side].x - this.ball.x)
    let b1 = k1*this.ball.x + this.ball.y
    let k2 = (Flags["fc"].y - this.pos.y)/(Flags["fc"].x - this.pos.x)
    let b2 = k2*this.pos.x + this.pos.y
    let x_intercept = (b2 - b1) / (k1 - k2)
    let y_intercept = k1 * x_intercept + b1
    if (isNaN(x_intercept) || isNaN(y_intercept)) return
    return {
      x: x_intercept,
      y: y_intercept,
      dist: Math.sqrt((this.pos.x - x_intercept)**2 + (this.pos.y - y_intercept)**2),
      angle: this.calculateAngleFromCoords(x_intercept, y_intercept)
    }

  }
  closestToFlag(myTeam, f_name){
  	if (Flags[f_name]) {
		const distanceList = []
		let playersList = []
		if (myTeam) playersList = this.teamOwn
		else playersList = this.team
		let flagCoords = {x: Flags[f_name].x, y: Flags[f_name].y};
		playersList.forEach((p) => {
		 let playerCoords = {x: p.x, y: p.y};
		  if (playerCoords) {
			distanceList.push({
			  player: p,	
			  coords: playerCoords,
			  dist: this.calculateDistanceCoords(playerCoords, flagCoords)
			})
		  }
		})

		distanceList.sort((dist1, dist2) => {
		  return dist1.dist - dist2.dist
		})
		return  distanceList 
    }
    return []
  }		
  closestToBall(myTeam) {
        if (this.ball) {
            
            const distanceList = []
            let playersList = []
            if (myTeam) playersList = this.teamOwn
			else playersList = this.team
			let ballCoords = {x: this.ball.x, y: this.ball.y};
            playersList.forEach((p) => {
			 let playerCoords = {x: p.x, y: p.y};
              
              if (playerCoords) {
                distanceList.push({
                  coords: playerCoords,
                  dist: this.calculateDistanceCoords(playerCoords, ballCoords)
                })
              }
            })
			  
            distanceList.sort((dist1, dist2) => {
              return dist1.dist - dist2.dist
            })
            return  distanceList
          
        }
        return []
      }
};

module.exports = Taken;
