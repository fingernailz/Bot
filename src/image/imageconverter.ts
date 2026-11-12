import { Message, MessageMedia } from "whatsapp-web.js";

export default async function changeImageMimeType(message: Message) {
  let target: undefined | MessageMedia
  
  if (message.body.split(" ").length == 1) {
    return await message.react("❌");
  }

  let newMimeType = (message: Message) : string => {
    switch (message.body.split(" ")[1]) {
      case "--jpg":
        return "image/jpeg"
      case "--jpeg":
        return "image/jpeg"
      case "--png":
        return "image/png"
      case "--webp":
        return "image/webp"
      case "--gif":
        return "image/gif"
      case "--mp4":
        return "video/mp4"
      case "--3gpp":
        return "video/3gpp"
      case "--pdf":
        return "application/pdf"
      case "--msword":
        return "application/msword"
      case "--msexcel":
        return "application/vnd.ms-excel"
      default:
        throw new Error("Invalid flag")
    }
  }

  if (message.hasMedia) {
    target = await message.downloadMedia()
  } else if (message.hasQuotedMsg) {
    if ((await message.getQuotedMessage()).hasMedia) {
      target = await (await message.getQuotedMessage()).downloadMedia()
    } else {
       return
    }
  } else {
    return 
  }

  if (target == undefined) {
    console.log('error, give some thing')
    return
  }

  return await message.reply(
    new MessageMedia(
      newMimeType(message),
      target.data
    ),
    undefined,
    {
      caption: `Converted from ${target.mimetype.split("/")[1]} to ${newMimeType(message).split("/")[1]}`,
      sendMediaAsDocument: (newMimeType(message).split("/")[1].trim().includes("pdf") || newMimeType(message).split("/")[1].trim().includes("msword") || newMimeType(message).split("/")[1].trim().includes("vnd.ms-excel")),
      sendVideoAsGif: (newMimeType(message).split("/")[1].trim().includes("gif"))
    }
  )
}
