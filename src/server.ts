import makeWASocket, { useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys";
import express, { Request, Response } from "express";
import qrcode from "qrcode-terminal";
import { Boom } from "@hapi/boom";

const app = express();
const PORT = 3000;

app.use(express.json());

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./auth");
    const sock = await makeWASocket({
        auth: state,
        printQRInTerminal: true,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            qrcode.generate(qr, { small: true });
        }
        if (connection === "close") {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log("Connection closed. Reconnecting:", shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === "open") {
            console.log("✅ WhatsApp Bot Connected!");
        }
    });

    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const sender = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

        console.log(`📩 Message from ${sender}: ${text}`);

        if (text.toLowerCase() === "ping") {
            await sock.sendMessage(sender!, { text: "Pong! 🏓" });
        }
    });

    return sock;
}

startBot();

app.get("/", (req: Request, res: Response) => {
    res.send("WhatsApp Bot Running!");
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
