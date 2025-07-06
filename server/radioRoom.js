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
    this.lastTenTracks = db.lastTenTracks || []

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
    if (!this.currentTrack?.id || Date.now() > this.currentTrack.nowEndTimer) {
      const chooseFrom = this.dbData.possibleTracks.filter((a) => !this.lastTenTracks.includes(a))
      const possibleTracks = (await db.tracks.find({ id: { $in: chooseFrom } }).toArray()).filter((t)=>t.album != "Monarch of Monsters");
      const nextTrack = /*possibleTracks.find((t)=>t.title == "LESBIAN PONIES WITH WEAPONS") || */possibleTracks[Math.floor(Math.random() * possibleTracks.length)];

      this.currentTrack = nextTrack
      this.currentTrack.nowEndTimer = Date.now() + (nextTrack.endTime ? (nextTrack.endTime - nextTrack.startTime) * 1000 : nextTrack.length * 1000)

      io().to(this.id).emit("trackChange", this.currentTrack);

      if(this.lastTenTracks.length >= 10) this.lastTenTracks.shift();
      this.lastTenTracks.push(nextTrack.id)

      await db.radios.updateOne({ id: this.id }, {
        $set: {
          currentTrack: this.currentTrack,
          lastTenTracks: this.lastTenTracks
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