const Msg = require('./msg');
const readline = require('readline');

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
  constructor(velocity, locate) {
    this.position = 'l';
    this.run = false;
    this.act = null;
    this.moment = velocity * 360 / 10;
    this.locate = locate;
    this.coordinates;
    /*this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.rl.on('line', (input) => {
      if (this.run) {
        if ("w" == input) this.act = {n: "dash", v: 100}
        if ("d" == input) this.act = {n: "turn", v: 20}
        if ("a" == input) this.act = {n: "turn", v: -20}
        if ("s" == input) this.act = {n: "kick", v: 100}

      }
    });*/
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
    if (data.cmd == "hear") this.run = true;
    if (data.cmd == "init") this.initAgent(data.p);
    this.analyzeEnv(data.msg, data.cmd, data.p);
  }
  initAgent(p) {
    if (p[0] == "r") this.position = "r";
    if (p[1]) this.id = p[1];
  }
  analyzeEnv(msg, cmd, p) {
    if (cmd == 'see') {
      if (p && p.length > 3) {
        // p[0] - time
        // p[1] - 1 Flag
        // p[2] - 2 Flag
        // p[3] - 3 Flag
        /* p[i]: {"p": [dist dir ... ... ],
                  "cmd": { "p": ["f", ".." flag name]}
                 }
        */
        if (this.locate) {
          let flags = [];
          let player;
          let playerCoordinates;
          for (let res of p) {
            if (res.cmd && res.cmd.p && res.cmd.p.length > 0 && res.cmd.p[0] == "f") {
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
            else if (res.cmd && res.cmd.p && res.cmd.p.length > 0 && res.cmd.p[0] == "p") {
              player = {
                d: res.p[0],
                a: res.p[1]
              };
            }
          }
          if (flags.length >= 3) {
            for (let i = 2; i < flags.length; i++) {
              if (flags[0].x == flags[1].x) {
                if (flags[i].x != flags[0].x) {
                  this.coordinates = this.threeFlagCoordinates(flags[0], flags[1], flags[i]);
                  break;
                }
              } else if (flags[0].y == flags[1].y) {
                if (flags[i].y != flags[0].y) {
                  this.coordinates = this.threeFlagCoordinates(flags[0], flags[1], flags[i]);
                  break;
                }
              } else {
                let alpha = (flags[0].y - flags[1].y) / (flags[0].x - flags[1].x);
                let beta = flags[0].y - alpha * flags[0].x;
                if (flags[i].y != alpha * flags[i].x + beta) {
                  this.coordinates = this.threeFlagCoordinates(flags[0], flags[1], flags[i]);
                  break;
                }
              }
            }
            if (!this.coordinates) {
              console.log("could not calculate coordinates");
              return;
            }
            console.log("My coordinates: " + JSON.stringify(this.coordinates));

            if (player) {
              for (let i = 1; i < flags.length; i++) {
                if (flags[0].x == this.coordinates.x) {
                  if (flags[i].x != flags[0].x) {
                    playerCoordinates = this.locateObject(flags[0], flags[i], player);
                    break;
                  }
                } else if (flags[0].y == this.coordinates.y) {
                  if (flags[i].y != flags[0].y) {
                    playerCoordinates = this.locateObject(flags[0], flags[i], player);
                    break;
                  }
                } else {
                  let alpha = (flags[0].y - this.coordinates.y) / (flags[0].x - this.coordinates.x);
                  let beta = flags[0].y - alpha * flags[0].x;
                  if (flags[i].y != alpha * flags[i].x + beta) {
                    playerCoordinates = this.locateObject(flags[0], flags[i], player);
                    break;
                  }
                }
              }
              if (!playerCoordinates) {
                console.log("could not calculate other player's coordinates");
              } else {
                console.log("Rival's coordinates: " + JSON.stringify(playerCoordinates));
              }
            }
          }
        }
      }
    }
  } //message analysis
  sendCmd() {
    if (this.run) {
      this.act = { n: "turn", v: this.moment };
      if (this.act) {
        if (this.act.n == "kick") {
          this.socketSend(this.act.n, this.act.v + "0");
        } else {
          this.socketSend(this.act.n, this.act.v);
        }
      }
      this.act = null;
    }
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
    } else if (f1.y == f2.y || f1.y == f3.y) {
      let g1, g2, g3;
      if (f1.y == f2.y) {
        g1 = f1;
        g2 = f2;
        g3 = f3;
      } else {
        g1 = f1;
        g2 = f3;
        g3 = f2;
      }
      x = (g2.x**2 - g1.x**2 + g1.d**2 - g2.d**2) / 2 /(g2.x - g1.x);
      y = (g1.d**2 - g3.d**2 - g1.x**2 + g3.x**2 -g1.y**2 +g3.y**2 +
        2*x*(g1.x - g3.x)) / 2 / (g3.y - g1.y);
    } else {
      let alpha1 = (f1.y - f2.y) / (f2.x - f1.x);
      let beta1 = (f2.y**2 - f1.y**2 + f2.x**2 - f1.x**2 + f1.d**2 - f2.d**2) / 2 / (f2.x - f1.x);
      let alpha2 = (f1.y - f3.y) / (f3.x - f1.x);
      let beta2 = (f3.y**2 - f1.y**2 + f3.x**2 - f1.x**2 + f1.d**2 - f3.d**2) / 2 / (f3.x - f1.x);
      y = (beta1 - beta2) / (alpha2 - alpha1);
      x = alpha1 * y + beta1;
    }
    return { x: x, y: y };
  }
  calculateDistance(f, a) {
    return Math.sqrt(f.d**2 + a.d**2 - 2*f.d*a.d*Math.cos(Math.abs(f.a - a.a) / 180 * Math.PI));
  }
  locateObject(f1, f2, object) {
    let da1 = this.calculateDistance(f1, object);
    let da2 = this.calculateDistance(f2, object);
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
