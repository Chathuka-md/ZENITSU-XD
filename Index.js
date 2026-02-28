const {
default: makeWASocket,
useMultiFileAuthState,
DisconnectReason,
fetchLatestBaileysVersion,
getContentType,
Browsers
} = require('@whiskeysockets/baileys')

const P = require('pino')
const fs = require('fs')
const qrcode = require('qrcode-terminal')
const axios = require('axios')
const express = require("express")

// ================= SETTINGS =================
const prefix = '.'
const botName = "ZENITSU-XD"
const ownerName = "Chathuka Dinujaya"
const ownerNumber = ['94788728028']

// AUTO FEATURES
const AUTO_TYPING = true
const AUTO_READ_STATUS = true
const AUTO_REACT_STATUS = true
const AUTO_SAVE_STATUS = true

// ================= EXPRESS =================
const app = express()
const port = process.env.PORT || 8000

app.get("/", (req, res) => {
res.send(`${botName} is running ✅`)
})

app.listen(port)

// ================= CONNECT =================
async function connectToWA() {

const { state, saveCreds } = await useMultiFileAuthState('./session')
const { version } = await fetchLatestBaileysVersion()

const conn = makeWASocket({
logger: P({ level: 'silent' }),
printQRInTerminal: false,
browser: Browsers.macOS("Firefox"),
auth: state,
version
})

conn.ev.on('creds.update', saveCreds)

conn.ev.on('connection.update', async (update) => {

const { connection, lastDisconnect, qr } = update

if (qr) {
console.log("Scan QR:")
qrcode.generate(qr, { small: true })
}

if (connection === 'close') {
const shouldReconnect =
lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

if (shouldReconnect) {
setTimeout(() => connectToWA(), 5000)
}
}

if (connection === 'open') {

let msg = `🤖 *${botName} Connected*

👑 Owner: ${Chathuka Dinujaya}
📱 ${ownerNumber[94788728028]}
🔠 Prefix: ${.}

Bot is Online 🚀`

await conn.sendMessage(ownerNumber[94788728028] + "@s.whatsapp.net", { text: msg })
}
})

// ================= MESSAGE =================
conn.ev.on('messages.upsert', async (mek) => {

mek = mek.messages[0]
if (!mek.message) return

const from = mek.key.remoteJid
const type = getContentType(mek.message)

// ================= STATUS AUTO =================
if (mek.key.remoteJid === 'status@broadcast') {

if (AUTO_READ_STATUS) await conn.readMessages([mek.key])

if (AUTO_REACT_STATUS) {
const reactions = ['❤️','🔥','😎','⚡']
const random = reactions[Math.floor(Math.random() * reactions.length)]
await conn.sendMessage('status@broadcast', {
react: { text: random, key: mek.key }
})
}

if (AUTO_SAVE_STATUS) {
if (!fs.existsSync("./status")) fs.mkdirSync("./status")
let media = await conn.downloadMediaMessage(mek)
fs.writeFileSync(`./status/${Date.now()}.jpg`, media)
}

return
}

// ================= BODY =================
const body =
(type === 'conversation') ? mek.message.conversation :
(type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text :
(type === 'imageMessage' && mek.message.imageMessage.caption) ? mek.message.imageMessage.caption :
(type === 'videoMessage' && mek.message.videoMessage.caption) ? mek.message.videoMessage.caption :
''

if (!body.startsWith(prefix)) return

if (AUTO_TYPING) {
await conn.sendPresenceUpdate('composing', from)
await new Promise(r => setTimeout(r, 700))
await conn.sendPresenceUpdate('paused', from)
}

const args = body.slice(prefix.length).trim().split(/ +/)
const command = args.shift().toLowerCase()

const reply = (text) => conn.sendMessage(from, { text }, { quoted: mek })

// ================= MENU =================
if (command === "menu") {
return reply(
`╭━━━〔 ${botName} MENU 〕━━━╮
┃ 🏓 .ping
┃ 👑 .owner
┃ ⚡ .alive
┃ 🎬 .movie <name>
┃ 📥 .yt <link>
┃ 📥 .tiktok <link>
┃ 📥 .ig <link>
┃ 📥 .song <name>
┃ 📥 .download <direct link>
┃ 🎮 .game <name>
┃ 🖼 .sticker
┃ 🔄 .toimg
╰━━━━━━━━━━━━━━━━━━╯`)
}

// BASIC
if (command === "ping") return reply("🏓 Pong!")
if (command === "owner") return reply(`👑 ${Chathuka Dinujaya}\n📱 ${ownerNumber[94788728028]}`)
if (command === "alive") return reply(`${botName} is running 🔥`)

// ================= MOVIE =================
if (command === "movie") {

if (!args[0]) return reply("Example: .movie Avatar")

let name = args.join(" ")
let res = await axios.get(`http://www.omdbapi.com/?t=${name}&apikey=564727fa`)
let data = res.data

if (data.Response === "False") return reply("Movie not found")

await conn.sendMessage(from, {
image: { url: data.Poster },
caption: `🎬 ${data.Title}\n⭐ ${data.imdbRating}\n📅 ${data.Year}\n\n${data.Plot}`
}, { quoted: mek })
}

// ================= YT =================
if (command === "yt") {
if (!args[0]) return reply("Example: .yt <link>")
try {
let res = await axios.get(`https://api.akuari.my.id/downloader/youtube?link=${args[0]}`)
await conn.sendMessage(from, {
video: { url: res.data.mp4 },
caption: "Downloaded 🔥"
}, { quoted: mek })
} catch { reply("Download failed") }
}

// ================= TIKTOK =================
if (command === "tiktok") {
if (!args[0]) return reply("Example: .tiktok <link>")
try {
let res = await axios.get(`https://api.akuari.my.id/downloader/tiktok?link=${args[0]}`)
await conn.sendMessage(from, {
video: { url: res.data.result.nowm },
caption: "Downloaded 🔥"
}, { quoted: mek })
} catch { reply("Download failed") }
}

// ================= INSTAGRAM =================
if (command === "ig") {
if (!args[0]) return reply("Example: .ig <link>")
try {
let res = await axios.get(`https://api.akuari.my.id/downloader/ig?link=${args[0]}`)
await conn.sendMessage(from, {
video: { url: res.data.url },
caption: "Instagram Downloaded 🔥"
}, { quoted: mek })
} catch { reply("Download failed") }
}

// ================= SONG =================
if (command === "song") {
if (!args[0]) return reply("Example: .song faded")
try {
let query = args.join(" ")
let res = await axios.get(`https://api.akuari.my.id/downloader/ytsearch?query=${query}`)
let data = res.data[0]
await conn.sendMessage(from, {
audio: { url: data.url },
mimetype: 'audio/mp4'
}, { quoted: mek })
} catch { reply("Song failed") }
}

// ================= DIRECT DOWNLOAD =================
if (command === "download") {
if (!args[0]) return reply("Example: .download <direct link>")
await conn.sendMessage(from, {
document: { url: args[0] },
fileName: "ZENITSU_File",
mimetype: "application/octet-stream"
}, { quoted: mek })
}

// ================= GAME INFO =================
if (command === "game") {
if (!args[0]) return reply("Example: .game gta v")
reply(`🎮 Searching game info for: ${args.join(" ")}\n\n(Search API key needed)`)
}

// ================= STICKER =================
if (command === "sticker") {
if (!mek.message.imageMessage)
return reply("Reply image with .sticker")
let media = await conn.downloadMediaMessage(mek)
await conn.sendMessage(from, { sticker: media }, { quoted: mek })
}

// ================= TO IMAGE =================
if (command === "toimg") {
if (!mek.message.stickerMessage)
return reply("Reply sticker with .toimg")
let media = await conn.downloadMediaMessage(mek)
await conn.sendMessage(from, { image: media }, { quoted: mek })
}

})

}

connectToWA()
