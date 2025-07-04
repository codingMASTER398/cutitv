let intents = {};

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}

module.exports = {
  createIntent: (context, data, expiry = 10_000) => {
    const uuid = uuidv4();

    intents[uuid] = {
      context,
      data
    }

    setTimeout(() => {
      delete intents[uuid]
    }, expiry)

    return uuid;
  },
  consumeIntent: (context, id) => {
    const intent = intents[id];

    if(intent) delete intents[id];

    if(!intent || intent.context !== context) return false;
    return intent.data;
  }
}