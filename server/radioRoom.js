const { createIntent, consumeIntent } = require(`./intents`);
const { db } = require('./db');

let rooms = {}, io;

class room {
  constructor(id) {
    if (rooms[id]) return false;

    if (!io) {
      io = require(`./socket`).io;
    }

    this.id = id;
    this.setup();

    rooms[id] = this;
  }

  async setup() {
    const dbData = await db.radios.findOne({ id: this.id })

    if (!dbData) return;

    this.dbData = dbData;
    this.ready = true;
    this.currentTrack = dbData.currentTrack || {};
    this.lastTenTracks = dbData.lastTenTracks || [];
    this.nextThreePick = dbData.nextThreePick || [];
    this.votes = [0, 0, 0];
    this.voteIID = 0;

    await this.tick();
    this.tickInterval = setInterval(() => {
      this.tick()
    }, 500)
  }

  getInitialData() {
    return {
      "currentTrack": this.currentTrack
    }
  }

  async tick() {
    if (!this.currentTrack?.id || Date.now() > this.currentTrack.nowEndTimer - 500) {
      const chooseFrom = this.dbData.possibleTracks.filter((a) => !this.lastTenTracks.includes(a))
      const possibleTracks = (await db.tracks.find({ id: { $in: chooseFrom } }).toArray()).filter((t) => t.album != "Monarch of Monsters");
      const nextTrack = this.nextThreePick?.[2] ? (this.nextThreePick.map((a, i) => {
        return {
          votes: this.votes[i],
          track: a
        }
      }).sort((a, b) => b.votes - aa.votes)[0].track) : (possibleTracks[Math.floor(Math.random() * possibleTracks.length)])
      const nextThreePick = possibleTracks.filter((t)=>t.title != nextTrack.title).sort(() => Math.random() - Math.random()).slice(0, 3);
    
      this.voteIID++;
      this.nextThreePick = nextThreePick;
      this.currentTrack = nextTrack;
      this.votes = [0, 0, 0];
      this.currentTrack.nextThreePick = nextThreePick.map((a)=>{
        return {
          ytID: a.ytID,
          title: a.title
        }
      });
      this.currentTrack.nowEndTimer = Date.now() + (nextTrack.endTime ? (nextTrack.endTime - nextTrack.startTime) * 1000 : nextTrack.length * 1000) + 200

      io().to(this.id).emit("trackChange", this.currentTrack);
      io().to(this.id).emit("votes", [0,0,0]);

      if (this.lastTenTracks.length >= 30) this.lastTenTracks.shift();
      this.lastTenTracks.push(nextTrack.id)

      await db.radios.updateOne({ id: this.id }, {
        $set: {
          currentTrack: this.currentTrack,
          lastTenTracks: this.lastTenTracks,
          nextThreePick: this.nextThreePick
        }
      })
      return;
    }
  }
}

module.exports = {
  room,
  getRoom: (id) => {
    return rooms[id]
  }
}
