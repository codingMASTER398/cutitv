const { Server } = require("socket.io");
const { createIntent, consumeIntent } = require(`./intents`)
const { getRoom } = require(`./radioRoom`)

let io;

function socketeer(server) {
  io = new Server(server);

  io.on('connection', (socket) => {
    // Check intent
    const data = consumeIntent("connectRadio", socket.handshake.headers?.authorization)

    if (!data) {
      socket.emit('disconnecting_reason', 'Intent invalid');
      socket.disconnect();
      return;
    }


    // Check radio room
    const radioRoom = getRoom(data.radioID)

    if (!radioRoom) {
      socket.emit('disconnecting_reason', 'Radio not found');
      socket.disconnect();
      return;
    }

    let thisVote = -1, thisVoteIID = radioRoom.voteIID;

    radioRoom.listeners ??= 0;
    radioRoom.listeners++;

    // Emit initial data

    io.to(data.radioID).emit("listeners", radioRoom.listeners)
    socket.emit("initialData", radioRoom.getInitialData())
    socket.emit("votes", radioRoom.votes)
    socket.emit("listeners", radioRoom.listeners)

    socket.on("vote", (i) => {
      if (![0, 1, 2].includes(i)) return;

      if (radioRoom.voteIID != thisVoteIID) { // the song changed
        thisVote = -1;
        thisVoteIID = radioRoom.voteIID
      } else if (thisVote != -1) {
        radioRoom.votes[thisVote]--;
      }

      radioRoom.votes[i]++;
      thisVote = i;

      io.to(data.radioID).emit("votes", radioRoom.votes)
    })

    socket.on('disconnect', () => {
      if (radioRoom.voteIID == thisVoteIID && thisVote != -1) {
        radioRoom.votes[thisVote]--;
      }

      radioRoom.listeners--;
      io.to(data.radioID).emit("listeners", radioRoom.listeners)
    })

    socket.join(data.radioID)
  });
}

module.exports = {
  socketeer, io: () => io
}