const { Server } = require("socket.io");
const { createIntent, consumeIntent } = require(`./intents`)
const { getRoom } = require(`./radioRoom`)

let io;

function socketeer(server) {
  io = new Server(server);

  io.on('connection', (socket) => {
    // Check intent
    const data = consumeIntent("connectRadio", socket.handshake.headers?.authorization)

    if(!data) {
      socket.emit('disconnecting_reason', 'Intent invalid');
      socket.disconnect();
      return;
    }


    // Check radio room
    const radioRoom = getRoom(data.radioID)

    if(!radioRoom) {
      socket.emit('disconnecting_reason', 'Radio not found');
      socket.disconnect();
      return;
    }

    // Emit initial data
    socket.emit("initialData", radioRoom.getInitialData())
    socket.join(data.radioID)
  });
}

module.exports = {
  socketeer, io: ()=>io
}