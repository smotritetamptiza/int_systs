const dgram = require('dgram');
module.exports = function(agent, teamName, version, goalie) {
  const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
  agent.setSocket(socket);
  socket.on('message', (msg, info) => {
    agent.msgGot(msg);
  });
  socket.sendMsg = function(msg) {
    socket.send(Buffer.from(msg), 6000, 'localhost', (err, bytes) => {
      if (err) throw err;
    });
  }
  if (goalie) {
    socket.sendMsg(`(init ${teamName} (version ${version}) (goalie))`);
  } else {
    socket.sendMsg(`(init ${teamName} (version ${version}))`);
  }
}
