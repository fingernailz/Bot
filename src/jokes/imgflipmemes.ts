import { Client, Message, MessageMedia } from "whatsapp-web.js";

let counter: number = 0

export async function memes(wwclient: Client, message: Message) {
    
    const URL: string = "https://api.imgflip.com/get_memes"

    let response = await fetch(URL).then(async json => await json.json()).catch(err => err)

    if (!response.success) {
        return
    }

    //I'm not mentally sane Am I???
    return await wwclient.sendMessage(message.from, await MessageMedia.fromUrl(response.data.memes[counter].url), {caption : response.data.memes[counter].name + (message.body.toLowerCase().split(" ").includes("--url") || message.body.toLowerCase().split(" ").includes("-u") ? `\n\n URL : \`\`\`${response.data.memes[counter ++].url}\`\`\`` : `${counter ++}`.replace(counter.toString(), "") ), sendMediaAsSticker : message.body.toLowerCase().split(" ").includes("--sticker") || message.body.toLowerCase().split(" ").includes("-s")})
}

//I'm hot and I'm proud :: this one gives templates not memes lol
