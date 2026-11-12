import { Ollama } from "ollama"
import { Client, Message, MessageMedia } from "whatsapp-web.js";
import { OlammaAIModels } from "../types/AiTypes";

export const availableModels: Array<OlammaAIModels> = [
    OlammaAIModels.Deepseek_R_1,
    OlammaAIModels.Granite_3_2_vision
]
const model: Ollama = new Ollama()

let currentModelInUse: OlammaAIModels = OlammaAIModels.Deepseek_R_1

export async function chooseModel(message: Message) {
    let flag: number | string = message.body.split(" ")[1]
    
    if (!(/\d/.test(flag))) {
        return
    }

    flag = parseInt(flag)

    if (flag < 0 || flag > availableModels.length) {
        return await message.react("x")
    }

    currentModelInUse = availableModels[flag]
    return await message.reply("Now using " + currentModelInUse)
}

export async function askOllama(wwclient: Client, message: Message) {
    if (message.body.toLowerCase().split(" ")[1].startsWith("--models")) {
        return await message.reply(
            "Models Available\n" +
                availableModels
            )
        
    } 

    let media: null | MessageMedia | undefined = null

    if (!message.hasMedia) {
        if (message.hasQuotedMsg) {
            if ((await message.getQuotedMessage()).hasMedia) {
                media = await (await message.getQuotedMessage()).downloadMedia()
            }
        }
    } else {
        media = await message.downloadMedia()
    }

    const RESPONSE = await model.chat(
        {
          model: currentModelInUse,
          stream: false,
          messages: [
            {
                role: "system",
                content: "you are a ai assistance"
            },
            (
                (
                    media == null
                ) ? (
                        {
                            role: "user",
                            content: message.body.split(" ").slice(1).join(" ")
                        }
                ) : (
                        {
                            role: "user",
                            content: message.body.split(" ").slice(1).join(" "),
                            images: [
                                media.data
                            ]
                        }
                )
            ) 
          ]
        }
    )


    if (!RESPONSE.done) {
        return
    }

    return await message.reply(
        (
            (
                RESPONSE.message.images != undefined
            ) ? (
                //@ts-ignore
                new MessageMedia("image/png" ,RESPONSE.message.images[0])
            ) : (
                RESPONSE.message.content
            )
        ),
        undefined,
        {
            caption: (
                media == null
            ) ? (
                ""
            ) : (
                RESPONSE.message.content
            )
        }
    )
}
