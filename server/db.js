const { MongoClient } = require('mongodb');

// Connection URL
const url = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@localhost:27017/cutitv?authSource=admin`;
const client = new MongoClient(url);

// Database Name
const dbName = 'cutitv';

class db {
  constructor() {
    client.connect().then(() => {
      this.onConnected();
    })

    this.c = client;
  }

  onConnected() {
    const db = client.db(dbName);
    const radios = db.collection('radios');
    const tracks = db.collection('tracks');

    this.radios = radios;
    this.tracks = tracks;

    this.onConnectedCB?.();
  }

  awaitConnected() {
    return new Promise((r) => {
      this.onConnectedCB = r;
    })
  }
}

module.exports =  {
  db: new db()
}