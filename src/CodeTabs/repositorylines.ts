import { Client, Message, MessageMedia } from "whatsapp-web.js";
import {newPlot, downloadImage, toImage} from "plotly.js-dist-min";
import puppeteer from "puppeteer";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";

export async function getRepositoryData(wwclient : Client, message : Message) {

    if (message.body.split(" ").length < 2) {
        return
    }

    let repository : string = message.links[0].link

    if (repository.startsWith("https://www.github.com/") || repository.startsWith("github.com/")) {
        repository = repository.split("/").slice(-2).join("/")
    }

    let branch : string = ""

    if (message.body.split(" ").length > 2) {
        if (message.body.split(" ")[2].toLowerCase().includes("--branch") || message.body.split(" ")[2].toLowerCase().includes("-b")) {
            branch = message.body.split(" ")[3]
        }
    }

    const endPoint : string = `https://api.codetabs.com/v1/loc?github=${repository}${(branch ? "&branch=" + branch : "")}`
    //@ts-ignore
    let responseFetch = await fetch(endPoint).catch(async error => await wwclient.sendMessage(process.env.PHONE_NUMBER_SERIALIZED, "error"))
    //@ts-ignore
    let response = await responseFetch.json()
    let reply : string = ""

    //@ts-ignore
    if (response.Error == "Incorrect user/repo") {
        return console.log("Incorrect user/repo")
    }

    let totalLines : number = response[response.length - 1].lines
    //I'm fucked

    let chatsj = new ChartJSNodeCanvas(
        {
            height : 1080,
            width : 1980
        }
    )

    const base64 = (await chatsj.renderToDataURL(
        {
            type : 'pie',
            data : {
                labels : //@ts-ignore
                response.filter(element => element.language.toLowerCase() != "total").map(element => element.language),
                datasets : [
                    {
                        label : "non",
                        data :  //@ts-ignore
                ((response.filter(element => element.language.toLowerCase() != "total").map(element => (element.lines / totalLines) * 100)) ) 
                    }
                ]
            }
        }
    )).split(",")[1]

    // let plot = newPlot(
    //     div,
    //     [
    //         {
    //             //@ts-ignore
    //           value : 
    //             //@ts-ignore
    //             ((response.filter(element => element.language.toLowerCase() != "total").map(element => (element.lines / totalLines) * 100)) ) 
    //           ,
    //           labels : 
    //             //@ts-ignore
    //             response.filter(element => element.language.toLowerCase() != "total").map(element => element.language)
    //           ,
    //           type : "pie"
    //         }
    //     ],
    //     {
    //         height : 500,
    //         width : 500
    //     }        
    // )
    // let base64 : string = ""
    // plot.then(
    //     () => {
    //         //@ts-ignore
    //     return toImage(div, {
    //         format : "jpeg",
    //         height : 500, 
    //         width : 500
    //     }) 
    //     }
    // ).then(
    //     (data : string) => {
    //         base64 = data.split(",")[1]
    //     }
    // )

    
    //@ts-ignore
    for (let language of response) {
                 //@ts-ignore
        reply += `\`\`\`Language : ${language.language}\n` +
                 //@ts-ignore
                 `Number of files : ${language.files}\n` +
                 //@ts-ignore
                 `Lines of Code : ${language.linesOfCode}\`\`\`\n\n`
    }
    await message.reply(new MessageMedia("image/jpeg", base64), undefined, {
        caption : reply
    })

    // return await wwclient.sendMessage(message.from, reply)
}
