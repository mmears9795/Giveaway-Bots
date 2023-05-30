import {Client, Intents, Collection, MessageEmbed, MessageAttachment, DiscordAPIError} from 'discord.js';
import require from 'dotenv/config';
import fetch from 'node-fetch';
import { promises as fs } from "fs";
import retry from 'async-retry';

const botToken = process.env.BOT_TOKEN;

const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

bot.on("ready", () => {
    console.log("The bot is ready");
});

bot.on('messageCreate', message => {
    if(!message.content.startsWith(process.env.BOT_PREFIX || message.author.bot)) return;

    const args = message.content.slice(process.env.BOT_PREFIX.length).split(/ + /);
    const command = args.shift().toLowerCase();

    if(command.startsWith('register')){
        async function createLink() {

            async function readData(){
                let dataX = fs.readFile('../linkcheck.json', "utf8", function (err, data) {
                    return data;
                });

                return dataX;

            }

            var dataFromFile = await readData();
            dataFromFile = JSON.parse(dataFromFile);

            if(dataFromFile.some(user => user.userID === message.author.id)){

                var objIndex = dataFromFile.findIndex((obj => obj.userID == message.author.id));
                message.channel.send("<@" + message.author.id + "> you have already entered into the giveaway.\n Here is your personal link: " + dataFromFile[objIndex].link);
                    return;
            }else{

                let referrer = message.content.substr("!register ".length);

                let referrerCheck = referrer.startsWith("https://l.linklyhq.com");

                let sender = message.author.username.toString();


                if (!referrerCheck) {
                    message.channel.send("<@" + message.author.id + 
                    "> please provide the linkly referal code you were given or ask a core team member to provide you with one! (In the format of [!register <referral link>])");
                    return;
                }

                const params = {
                    "email": "thecyberenterprise@gmail.com",
                    "api_key": process.env.LINKLY_API,
                    "workspace_id": 53822,
                    "url": "https://linktr.ee/TheCyberEnterprise",
                    "name": "Discord - " + sender,
                    "note": referrer
                };

                let linkData = await fetchLink(params);

                message.channel.send("<@" + message.author.id + "> here is your link for the giveaway!\n" + linkData.full_url + "\nGet shilling!");

                var data = {
                    userID : message.author.id,
                    link : linkData.full_url,
                    linkID : linkData.id,
                    note : linkData.note,
                    date : linkData.inserted_at
                }

                data.date = data.date.substr(0,10);

                dataFromFile.push(data);
            }

            fs.writeFile("../linkcheck.json", JSON.stringify(dataFromFile), function(err){
                if (err) throw err;
                console.log('The "data to append" was appended to file!');
            });
        }

        try {
            if (message.channel == process.env.REGISTER_CHANNEL_ID) {
                createLink();
            } else {
                message.channel.send("Please send this command in the <#" + process.env.REGISTER_CHANNEL_ID + "> !!!")
            }
        } catch (e) {
            console.log("Link error: ", e);
        }
    }

    if (command.startsWith('referral')) {
        async function createReferrence() {

            let referrer = message.content.substr("!referral ".length);

            let referrerCheck = referrer.startsWith("https://l.linklyhq.com");

            if (!referrerCheck) {
                message.channel.send("Please provide the linkly referal code you were given! (In the format of [!referral <referral link>])");
                return;
            }

            async function readData(fileName){
                let dataX = fs.readFile(fileName, "utf8", function (err, data) {
                    return data;
                });
                return dataX;
            }

            var linkCheck = await readData('../linkcheck.json');
            linkCheck = JSON.parse(linkCheck);

            if(linkCheck.some(user => user.userID === message.author.id)){
                var linkIndex = linkCheck.findIndex((obj => obj.userID === message.author.id));
                if(linkCheck[linkIndex].link === referrer){
                    message.channel.send("You cannot use your own link for this command");
                    return;
                }
            }

            var dataFromFile1 = await readData('../referreecheck.json');
            dataFromFile1 = JSON.parse(dataFromFile1);

            if(dataFromFile1.some(user => user.userID === message.author.id)){
                message.channel.send("You have already entered your referrence code! If you entered the wrong link, let a core team member know!");
                return;
            }else{
                
                var referreeData = {
                    platform : "Discord",
                    username : message.author.username.toString(),
                    userID : message.author.id
                }
                dataFromFile1.push(referreeData);

                var dataFromFile2 = await readData('../referrercheck.json');

                dataFromFile2 = JSON.parse(dataFromFile2);

                if (dataFromFile2.some(link => link.link === referrer)){
                    var objIndex = dataFromFile2.findIndex((obj => obj.link === referrer));
                    if (dataFromFile2[objIndex].count >= 5) {
                        message.channel.send("Sorry, this referral link has been maxxed out for the week. You still get 1 point for using the !referral command!");
                    } else {
                    dataFromFile2[objIndex].count = dataFromFile2[objIndex].count + 1;
                    message.channel.send("Thank you! Your referral code has been counted!");
                    }
                } else {
                    var referrerData = {
                        link : referrer,
                        count : 1
                    }
                    
                    dataFromFile2.push(referrerData);

                    message.channel.send("Thank you! Your referral code has been counted!");
                }
    
            }

            fs.writeFile("../referreecheck.json", JSON.stringify(dataFromFile1), function(err){
                if (err) throw err;
                console.log('The "data to append" was appended to file!');
            });

            fs.writeFile("../referrercheck.json", JSON.stringify(dataFromFile2), function(err){
                if (err) throw err;
                console.log('The "data to append" was appended to file!');
            });

        }

        try {
            if (message.channel == process.env.REFERRAL_CHANNEL_ID) {
            createReferrence();
            } else {
                message.channel.send("Please send this command in the <#" + process.env.REFERRAL_CHANNEL_ID + "> !!!")
            }
        } catch (e) {
            console.log("Referrence error ", e);
        }

    }

    if (command.startsWith('stats')) {
        async function fetchStats() {

            async function readData(fileName){
                let dataX = fs.readFile(fileName, "utf8", function (err, data) {
                    return data;
                });
                return dataX;
            }

            var linkData = await readData('../linkcheck.json');
            linkData = JSON.parse(linkData);

            var refData = await readData('../referreecheck.json');
            refData = JSON.parse(refData);

            let refCount = 0;

            if(linkData.some(user => user.userID === message.author.id)){

                var objIndex = linkData.findIndex((obj => obj.userID === message.author.id));

                for (let i = 0; i < linkData.length; i++) {
                    if (linkData[i].note === linkData[objIndex].link) {
                        if (
                            linkData[i].date == process.env.DATE1 ||
                            linkData[i].date == process.env.DATE2 ||
                            linkData[i].date == process.env.DATE3 ||
                            linkData[i].date == process.env.DATE4 ||
                            linkData[i].date == process.env.DATE5 ||
                            linkData[i].date == process.env.DATE6 ||
                            linkData[i].date == process.env.DATE7
                        )
                        refCount = refCount + 1;
                    }
                }

                let checkRef = await readData('../referrercheck.json');
                checkRef = JSON.parse(checkRef);

                if(checkRef.some(data => data.link === linkData[objIndex].link)) {
                    let countIndex = checkRef.findIndex((obj => obj.link === linkData[objIndex].link));
                    refCount = refCount + checkRef[countIndex].count;
                }

                if(refData.some(user => user.userID === message.author.id)){
                    refCount = refCount + 1;
                }

                message.channel.send("Your total points this week are: " + refCount);

                return;
            } else if(refData.some(user => user.userID === message.author.id)){
                refCount = refCount + 1;
                message.channel.send("Your total points this week are: " + refCount);
                return;
            } else {
                message.channel.send("You are not entered in the giveaway");
                return;
            }
           
        }

        try {
            fetchStats()
        } catch (e) {
            console.log("Fetch Stats Error ", e);
        }
        
    }

    if (command.startsWith('addpoint')) {
        async function addPoints() {

            let referrer = message.content.substr("!referrer ".length);

            async function readData(fileName){
                let dataX = fs.readFile(fileName, "utf8", function (err, data) {
                    return data;
                });
                return dataX;
            }

            let refData = await readData('../referrercheck.json');

            refData = JSON.parse(refData);

            if(refData.some(ref => ref.link === referrer)){
                let countIndex = refData.findIndex((obj => obj.link === referrer));
                refData[countIndex].count = refData[countIndex].count +1;
                message.channel.send("A point has been added to this referal.")
            } else {
                var referrerData = {
                    link : referrer,
                    count : 1
                }
                
                refData.push(referrerData);

                message.channel.send("Count has been updated!");
            }

            fs.writeFile("../referrercheck.json", JSON.stringify(refData), function(err){
                if (err) throw err;
                console.log('The "data to append" was appended to file!');
            });
        }

        try {
            if (message.author.id == process.env.QUOKKA_ID || message.author.id == process.env.PHATE_ID || message.author.id == process.env.MDKING_ID || message.author.id == process.env.PLUMS_ID || message.author.id == process.env.MARZ_ID || message.author.id == process.env.DAN_ID || message.author.id == process.env.ODY_ID || message.author.id == process.env.DARTH_ID || message.author.id == process.env.GREEK_ID || message.author.id == process.env.CUZZY_ID || message.author.id == process.env.VITO_ID) {
                addPoints()
            }
        } catch (e) {
            console.log("Add points error: ", e);
        }
    }

});

async function fetchLink(params) {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(params)
    };

    var data = await retry(
        async (bail) => {
            const response = await fetch('https://app.linklyhq.com/api/v1/link', options);

            if (403 === response.status) {
                bail(new Error('Unauthorized'));
                return;
            }

            const data = await response.json();

            return data;
        },
        {
            retries: 5,
            minTimeout: 5000,
        }
    );

    return data;
}

bot.login(botToken);