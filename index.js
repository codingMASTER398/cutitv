require(`dotenv`).config();

const { db } = require('./server/db');
const { socketeer } = require(`./server/socket`);
const { createIntent, consumeIntent } = require(`./server/intents`);
const { room } = require(`./server/radioRoom`);
const radioPage = require('./server/radioPage');

const { createServer } = require('node:http');
const express = require(`express`)
const ejs = require(`ejs`)
const app = express()
const server = createServer(app);

const DEVELOPMENT = process.env.DEVELOPMENT == "true"

app.set('view engine', 'ejs')

  ; (async () => {
    await db.awaitConnected()
    socketeer(server)

    console.log("Connected to DB")

    app.use("/nerd", express.static("./public", {
      maxAge: DEVELOPMENT ? 0 : 10_000
    }))

    app.get("/", (req, res) => {
      radioPage.render("vyletpony", req, res)
      //res.send("hi luna & meow person i dont' actually know the real name of.<br>got to get a db and infra set up so this will be placeholder for a while.<br>basically a <b>Vylet Pony radio station</b><br><br><a href='https://coding398.dev'>coding398.dev</a>")
    })

    new room("vyletpony")

    server.listen(process.env.PORT)
  })()