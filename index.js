const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const qrcode = require("qrcode-terminal");
const { Client, LegacySessionAuth, Buttons } = require("whatsapp-web.js");

let session_config;
if (fs.existsSync("./session.json")) {
  session_config = require("./session.json");
}

const client = new Client({
  authStrategy: new LegacySessionAuth({ session: session_config }),
  puppeteer: { args: ["--no-sandbox"] },
});
const config = require("./bot.config");

client.initialize();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  if (config.mongoose_uri) {
    mongoose.connect(config.mongoose_uri, () =>
      console.log("Terkoneksi ke Database!")
    );
  }

  console.log("Hai, sayang :3");
});

client.on("authenticated", (session) => {
  session_config = session;
  fs.writeFile("./session.json", JSON.stringify(session), (e) =>
    console.error(e)
  );
});

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const commandDir = fs
  .readdirSync(path.join(__dirname, "commands"))
  .filter((f) => f.endsWith(".js"));
let commandList = [];
commandDir.forEach((f) => {
  commandList.push({
    name: f.split(".js")[0],
    execute: require(`./commands/${f}`),
  });
});

client.on("message", async (msg) => {
  const prefix = config.prefix;
  const message = msg.body.toLocaleLowerCase();

  if(message == "p"){
    const button = new Buttons("Kenapa, yank? :3", [
      {
        body: `${prefix}help`
      },
      {
        body: `${prefix}ingfo`
      },
      {
        body: "Gak, Rindu aja...."
      }
    ])

    return client.sendMessage(msg.from, button)
  }

  const prefixRegex = new RegExp(`^(${escapeRegex(prefix)})\\s*`);
  if (!prefixRegex.test(message)) return;

  const [matchedPrefix] = message.match(prefixRegex);

  const args = message.slice(matchedPrefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = commandList.find((f) => f.name == commandName);

  if (!command) return;

  try {
    await command.execute.execute(msg, args, client);
  } catch (e) {
    console.error(e);
    msg.reply(`Error while executing command!\n\n_Reason: ${e}_`);
  }
});

console.clear();
console.log("Mengaktifkan Bot....");
