module.exports = {
    description: "Menampilkan ingfo bot",
    execute: async(msg, args, client) => {
        return client.sendMessage(msg.from, "Apa\nIngfo-ingfo an")
    }
}