const { db } = require('./db');
const { createIntent } = require(`./intents`)
const { getRoom } = require(`./radioRoom`)

const render = async (id, req, res) => {
  const radio = await db.radios.findOne({ id })
  const radioRoom = getRoom(id);

  if(!radio || !radioRoom) {
    res.status(404).send(`404`)
    return;
  }

  res.render("radio", {
    radio,
    data: {
      connectIntent: createIntent("connectRadio", {
        radioID: id
      }, 20_000),
    }
  })
}

module.exports = {
  render
}