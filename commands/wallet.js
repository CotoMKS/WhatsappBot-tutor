const {Schema, model} = require('mongoose')

const WalletSchema = new Schema({
    user_id: String,
    coins: Number
})

const Wallet = model('wallet', WalletSchema)

const extractPN = (msg) => {
    if(msg.author){
        const number = msg.author.split("@")[0]
        return number
    }else{
        const number = msg.from.split("@")[0]
        return number
    }
}

module.exports = {
    description: 'Menampilkan isi dompet',
    execute: async (msg, args, client) => {
        const nomor_wa = extractPN(msg)
        
        const profile = await Wallet.findOne({user_id: nomor_wa})

        if(profile) {
            return client.sendMessage(msg.from, `Your coins = ${profile.coins}`)
        }else {
            await new Wallet({
                user_id: nomor_wa,
                coins: 0
            }).save()
            
            return client.sendMessage(msg.from, `Your coins = 0`)
        }
    }
}