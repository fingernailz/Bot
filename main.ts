import dotenv from "dotenv"
dotenv.config()
import { Client, LocalAuth, Message } from 'whatsapp-web.js'
import qrcode from 'qrcode-terminal' // Importing error man fuck tsc, just import the function, don't default
import { RevokedMessage } from './src/classes/RevokedMessage'
import { SavedContact } from './src/classes/User'
import { MutedUser } from './src/classes/BlockedUsers'
import Pouch from "pouchdb"
import { saveDeletedMessage } from "./src/Events/messagedeletion"
import { StartClient } from "./src/Events/startup"
import { MessageEvent } from "./src/Events/messageevent"
import { addChatToDatabase } from "./src/Events/groupdatabase"
import { setMessageEdited } from "./src/client/getrevokedmessage"
import { IncomingCallEvent } from "./src/Events/call"

export const wwclient : Client = new Client(
    {
        authStrategy : new LocalAuth (
            {
                dataPath : "whatsapplog"
            }
        ),
        puppeteer : {
            headless : true,
            args : ['--no-sandbox', '--disable-setuid-sandbox']
        }
    }
)

export const startTime: number = Date.now()
export const database = new Pouch("Saves")
export let deletedMessage :Array<RevokedMessage> = new Array()
export let Groups: Array<MutedUser> = new Array()
export let Contacts: Array<SavedContact> = new Array()

const workFunction = (message: Message) => {}

wwclient.on('qr', qr => {
    qrcode.generate(
        qr,
        {
            small : true
        }
    )
})

wwclient.on("auth_failure", () => {
    console.log("Authentication failure")
})

wwclient.on("ready", async () => {

    // await StartClient(wwclient) // Change the function names 
    console.log("started")
    // wwclient.addListener("message", workFunction)
    await wwclient.sendMessage(process.env.PHONE_NUMBER_SERIALIZED as string, "Client started")
    // wwclient.removeListener("message", workFunction)
})

wwclient.initialize()

wwclient.on("message_edit", async (message, after, before) => await setMessageEdited(message, before.trim(), after.trim()))

wwclient.on('message_revoke_everyone', async (after, before) => {
    await saveDeletedMessage(wwclient, before, after)
})

wwclient.on("call", async (call) => await IncomingCallEvent(call))

wwclient.on("group_join", async (notification) => {
    // await addChatToDatabase(notification)
})
 
wwclient.on("message", MessageEvent)