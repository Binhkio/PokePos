const express = require('express')
const app = express()
const cheerio = require('cheerio')
const cors = require('cors')
const cloudscraper = require('cloudscraper')
const axios = require('axios')
const path = require('path')

app.use(express.json())
app.use(express.static(path.join(__dirname, '/')));
app.use(cors())
// app.options('*', cors())


var authorization = 'Njk1ODAxMTgxMzkzNTE4Njky.GmUkn4.ADojIaVMNhJ5ZKi7JQ6REHru9G1lxi5n77up-s'
var cookie = '__dcfduid=5eaa8a20e15411ecb909877d783ce8c3; __sdcfduid=5eaa8a21e15411ecb909877d783ce8c3f2036ce5f4c64b1873916b8a6c4caf84213512fa430b5db78030339813d1040e; _ga=GA1.2.616097936.1654051304; _gcl_au=1.1.1814232549.1672735547; OptanonConsent=isIABGlobal=false&datestamp=Tue+Jan+03+2023+15%3A45%3A47+GMT%2B0700+(Indochina+Time)&version=6.33.0&hosts=&landingPath=https%3A%2F%2Fdiscord.com%2F&groups=C0001%3A1%2CC0002%3A1%2CC0003%3A1; locale=vi; __cfruid=704c1e4e0b2e8d1db5c04f46ae87e8815423e6c1-1672839359; __cf_bm=KW2xJwI.gAgKkt2JTVCcoWe6bJigV5wmXVvN9SJLqe4-1672839606-0-Add0+90SDl6rfJPcZpR4eDvfX8RWIW7Zpk+VSUCYf/yYVS7XSaA+6kIxPI6LgxftqtGM8ur4Z6YxMbNxoywy1oM4uLEDci2Vyoakgptgbl+2Wlja7MHO30btdvRl9226mTeqwW2sgfs4aooyRh6sRhU='
var cookie_session = 'sessionid=j13ui737ne39xsrzg2okloej3fykhjrx; csrftoken=JCUz0rOC0iVqfGQRsaAmVFJWe5eKi1aUtzNFTe90YArku3xi38SesplvILLRqChD'
// Number of messages
var numsOfMessages = 20


function distance(lat1, lon1, lat2, lon2, unit) {
    lat1 = parseFloat(lat1)
    lon1 = parseFloat(lon1)
    lat2 = parseFloat(lat2)
    lon2 = parseFloat(lon2)
    if ((lat1 === lat2) && (lon1 === lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1 / 180;
        var radlat2 = Math.PI * lat2 / 180;
        var theta = lon1 - lon2;
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
        dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit === "K") { dist = dist * 1.609344 }
        if (unit === "N") { dist = dist * 0.8684 }
        return dist.toFixed(1);
    }
}

const getPokeStatus = async (data) => {
    try {
        //name, iv, cp, dsp, lv, timeStart, image, location, country
        const ans = {}
        // get name
        ans.name = data.content.split('***')[1]
        // get iv
        ans.iv = data.content.split('***')[2].split('**')[0].split(' ')[2].slice(2)
        // get cp
        ans.cp = data.content.split('***')[2].split('**')[1].slice(2)
        // get lv
        ans.lv = data.content.split('***')[2].split('**')[3].slice(1)
        // get dsp
        ans.dsp = data.content.slice(data.content.indexOf(' in ') + 4, data.content.indexOf(' in ') + 6)
        // get time
        ans.timeStart = new Date(data.timestamp).toLocaleString()
        // get country 
        ans.country = 'https://flagcdn.com/48x36/' + data.content.split('***')[0].split(':')[1].split('_')[1] + '.png'
        // get image
        ans.image = `https://cdn.discordapp.com/emojis/${data.content.split('***')[2].split(' ')[1].split(':')[2].slice(0, -3)}.gif?size=56&quality=lossless`
        // get location
        const link = data.embeds[0].description.split('|')[0].split('(')[1].trim().slice(0, -1)
        let html = await cloudscraper.get(link, {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "accept-language": "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
                "cache-control": "max-age=0",
                "sec-ch-ua": "\"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"108\", \"Google Chrome\";v=\"108\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "cross-site",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
                "cookie": cookie_session
            },
            "referrerPolicy": "no-referrer",
            "body": null
        });
        // html = await html.text()
        const $ = cheerio.load(html)
        ans.location = $('#community-coord').attr('value')

        return ans
    } catch (error) {
        console.log(error);
        return {}
    }
}

const getMessage = async (groupId, groupName, Position, PokeName) => {
    try {
        const res = await axios.get("https://discord.com/api/v9/channels/" + groupId + "/messages?limit=" + numsOfMessages, {
            "headers": {
                "accept": "*/*",
                "accept-language": "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
                "authorization": authorization,
                "sec-ch-ua": "\"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"108\", \"Google Chrome\";v=\"108\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-debug-options": "bugReporterEnabled",
                "x-discord-locale": "en-US",
                "x-super-properties": "eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEwOC4wLjAuMCBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTA4LjAuMC4wIiwib3NfdmVyc2lvbiI6IjEwIiwicmVmZXJyZXIiOiJodHRwczovL3d3dy5nb29nbGUuY29tLyIsInJlZmVycmluZ19kb21haW4iOiJ3d3cuZ29vZ2xlLmNvbSIsInNlYXJjaF9lbmdpbmUiOiJnb29nbGUiLCJyZWZlcnJlcl9jdXJyZW50IjoiIiwicmVmZXJyaW5nX2RvbWFpbl9jdXJyZW50IjoiIiwicmVsZWFzZV9jaGFubmVsIjoic3RhYmxlIiwiY2xpZW50X2J1aWxkX251bWJlciI6MTY1NDg1LCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ==",
                "cookie": cookie,
                "Referer": "https://discord.com/channels/252776251708801024/" + groupId,
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": null
        })
        const resJson = res.data
        const data = []
        const promiseArray = []
        for (let index = 0; index < resJson.length; index++) {
            promiseArray.push(getPokeStatus(resJson[index]))
            if ((index + 1) % 5 === 0 || index + 1 === resJson.length) {
                await Promise.all(promiseArray).then(values => {
                    values.forEach(item => {
                        const { name, iv, cp, dsp, lv, timeStart, image, location, country } = item
                        if(!!PokeName){     // Find by name
                            if(name !== PokeName){
                                return null
                            }
                        }
                        let curDistance = 0
                        if(!!Position){     // Find nearest pokemon
                            if(!!location){
                                const [lat1, lon1] = location.split(',')
                                const [lat2, lon2] = Position.split(',')
                                curDistance = distance(lat1, lon1, lat2, lon2, 'K')
                                if(curDistance > 10000){
                                    return null
                                }
                            }
                        }

                        data.push({
                            id: data.length + 1,
                            group: groupName,
                            name,
                            iv,
                            cp,
                            dsp,
                            lv,
                            timeStart,
                            image,
                            location,
                            distance: curDistance,
                            country
                        })
                    })
                })
            }
        }
        // console.log(data);
        return data
    } catch (error) {
        console.log(error, "Get discord page");
        return false
    }
}

app.get('/', (req, res) => {
    return res.render(path.join(__dirname + '/index.html'))
})

app.post('/data', async (req, res) => {
    try {
        console.log("Getting data...");
        const groupData = req.body
        let promiseGroupData = groupData.map((group, index) => {
            return getMessage(group.id, group.name, group.poke.pos, group.poke.name)
        })
        Promise.all(promiseGroupData).then((results) => {
            results.forEach((val) => {
                if(val === false){
                    return res.json({ success: false, message: "Something error!" })
                }
            })
            console.log("Done...");
            return res.json({ success: true, results })
        })
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: 'server error' })
    }
})

app.listen(8080, () => {
    console.log('server running in port 8080....');
})