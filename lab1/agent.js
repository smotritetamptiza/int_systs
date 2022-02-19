const Msg = require('./msg');
const readline = require('readline');

const Flags = {
  ftl50: {x: -50, y: 39}, ftl40: {x: -40, y: 39},
  ftl30: {x: -30, y: 39}, ftl20: {x: -20, y: 39},
  ftl10: {x: -10, y: 39}, ft0: {x: 0, y: 39},
  ftr50: {x: 50, y: 39}, ftr40: {x: 40, y: 39},
  ftr30: {x: 30, y: 39}, ftr20: {x: 20, y: 39},
  ftr10: {x: 10, y: 39},
  fbl50: {x: -50, y: -39}, fbl40: {x: -40, y: -39},
  fbl30: {x: -30, y: -39}, fbl20: {x: -20, y: -39},
  fbl10: {x: -10, y: -39}, fb0: {x: 0, y: -39},
  fbr50: {x: 50, y: -39}, fbr40: {x: 40, y: -39},
  fbr30: {x: 30, y: -39}, fbr20: {x: 20, y: -39},
  fbr10: {x: 10, y: -39},
  flt30: {x: -57.5, y: 30}, flt20: {x: -57.5, y: 20},
  flt10: {x: -57.5, y: 10}, fl0: {x: -57.5, y: 0},
  flb30: {x: -57.5, y: -30}, flb20: {x: -57.5, y: -20},
  flb10: {x: -57.5, y: -10},
  frt30: {x: 57.5, y: 30}, frt20: {x: 57.5, y: 20},
  frt10: {x: 57.5, y: 10}, fr0: {x: 57.5, y: 0},
  frb30: {x: 57.5, y: -30}, frb20: {x: 57.5, y: -20},
  frb10: {x: 57.5, y: -10},
  flt: {x: -52.5, y: 34}, flb: {x: -52.5, y: -34},
  fglt: {x: -52.5, y: 7.01}, fglb: {x: -52.5, y: -7.01},
  gl: {x: -52.5, y: 0}, fplc: {x: -36, y: 0},
  fplt: {x: -36, y: 20.15}, fplb: {x: -36, y: -20.15},
  fc: {x: 0, y: 0}, fct: {x: 0, y: 34}, fcb: {x: 0, y: -34},
  frt: {x: 52.5, y: 34}, frb: {x: 52.5, y: -34},
  fgrt: {x: 52.5, y: 7.01}, fgrb: {x: 52.5, y: -7.01},
  gr: {x: 52.5, y: 0}, fprc: {x: 36, y: 0},
  fprt: {x: 36, y: 20.15}, fprb: {x: 36, y: -20.15},
  distance(p1, p2) {
    return Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
  }
};

class Agent {
  constructor(velocity) {
    this.position = 'l';
    this.run = false;
    this.act = null;
    this.momentum = velocity * 360 / 10;
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
        let flags = [];
        for (let res of p) {
          if (res.cmd && res.cmd.p && res.cmd.p.length > 0 && res.cmd.p[0] == "f") {
            let f_name = res.cmd.p.join('');
            try {
              let f = {
                x: Flags[f_name].x,
                y: Flags[f_name].y,
                d: res.p[0]
              };
              flags.push(f);
            } catch (e) {
              console.log(f_name);
              console.log(e);
            }
          }
        }
        if (flags.length >= 3) {
          let coordinates;
          for (let i = 2; i < flags.length; i++) {
            if (flags[0].x == flags[1].x) {
              if (flags[i].x != flags[0].x) {
                coordinates = this.threeFlagCoordinates(flags[0], flags[1], flags[i]);
                break;
              }
            } else if (flags[0].y == flags[1].y) {
              if (flags[i].y != flags[0].y) {
                coordinates = this.threeFlagCoordinates(flags[0], flags[1], flags[i]);
                break;
              }
            } else {
              let alpha = (flags[0].y - flags[1].y) / (flags[0].x - flags[1].x);
              let beta = flags[0].y - alpha * flags[0].x;
              if (flags[i].y != alpha * flags[i].x + beta) {
                coordinates = this.threeFlagCoordinates(flags[0], flags[1], flags[i]);
                break;
              }
            }
          }
          if (!coordinates) {
            console.log("could not calculate coordinates");
          } else {
            console.log(coordinates);
          }
        }
      }
    }
  } //message analysis
  sendCmd() {
    if (this.run) {
      this.act = { n: "turn", v: this.momentum };
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
    if (f1.x == f2.x) {
      y = (f2.y**2 - f1.y**2 + f1.d**2 - f2.d**2) / 2 /(f2.y - f1.y);
      x = (f1.d**2 - f3.d**2 - f1.x**2 + f3.x**2 -f1.y**2 +f3.y**2 +
        2*y*(f1.y - f3.y)) / 2 / (f3.x - f1.x);
    } else if (f1.y == f2.y){
      x = (f2.x**2 - f1.x**2 + f1.d**2 - f2.d**2) / 2 /(f2.x - f1.x);
      y = (f1.d**2 - f3.d**2 - f1.x**2 + f3.x**2 -f1.y**2 +f3.y**2 +
        2*x*(f1.x - f3.x)) / 2 / (f3.y - f1.y);
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
}
module.exports = Agent;
