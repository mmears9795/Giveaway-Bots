import { Telegraf } from 'telegraf';
import require from 'dotenv/config';
import fetch from 'node-fetch';
import { promises as fs } from "fs";
import retry from 'async-retry';

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command('register', (ctx) => {
    if (ctx.message.text.startsWith('/register')) {
        async function createLink() {

            async function readData(){
                let dataX = fs.readFile('../linkcheck.json', "utf8", function (err, data) {
                    return data;
                });

                return dataX;

            }

            var dataFromFile = await readData();
            dataFromFile = JSON.parse(dataFromFile);

            if(dataFromFile.some(user => user.userID === ctx.message.from.id)){

                var objIndex = dataFromFile.findIndex((obj => obj.userID == ctx.message.from.id));
                ctx.reply("You have already entered into the giveaway.\n Here is your personal link: " + dataFromFile[objIndex].link);
                    return;
            }else{

                let referrer = ctx.message.text.substr("/register ".length);

                let referrerCheck = referrer.startsWith("https://l.linklyhq.com");

                let sender = ctx.message.from.first_name.toString();


                if (!referrerCheck) {
                    ctx.reply("Please provide the linkly referal code you were given or ask an admin to provide you with one! (In the format of [/register <link>])");
                    return;
                }

                const params = {
                    "email": "thecyberenterprise@gmail.com",
                    "api_key": process.env.LINKLY_API,
                    "workspace_id": 53822,
                    "url": "https://linktr.ee/TheCyberEnterprise",
                    "name": "Telegram - " + sender,
                    "note": referrer
                };

                let linkData = await fetchLink(params);

                ctx.reply("Here is your link for the giveaway!\n" + linkData.full_url + "\nGet shilling!");

                var data = {
                    userID : ctx.message.from.id,
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
            createLink();
        } catch (e) {
            console.log("Link error: ", e);
        }
    }
});

bot.command('referral', (ctx) => {
    if (ctx.message.text.startsWith('/referral')) {
        async function createReferrence() {

            let referrer = ctx.message.text.substr("/referrer ".length);

            let referrerCheck = referrer.startsWith("https://l.linklyhq.com");

            if (!referrerCheck) {
                ctx.reply("Please provide the linkly referral code you were given! (In the format of [/referrer <link>])");
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

            if(linkCheck.some(user => user.userID === ctx.message.from.id)){
                var linkIndex = linkCheck.findIndex((obj => obj.userID === ctx.message.from.id));
                if(linkCheck[linkIndex].link === referrer){
                    ctx.reply("You cannot use your own link for this command");
                    return;
                }
            }

            var dataFromFile1 = await readData('../referreecheck.json');
            dataFromFile1 = JSON.parse(dataFromFile1);

            if(dataFromFile1.some(user => user.userID === ctx.message.from.id)){
                ctx.reply("You have already entered your referrence code! If you entered the wrong link, let an admin know!");
                return;
            }else{
                var referreeData = {
                    platform : "Telegram",
                    username : ctx.message.from.first_name.toString(),
                    userID : ctx.message.from.id
                }
                dataFromFile1.push(referreeData);

                var dataFromFile2 = await readData('../referrercheck.json');

                dataFromFile2 = JSON.parse(dataFromFile2);

                if (dataFromFile2.some(link => link.link === referrer)){
                    var objIndex = dataFromFile2.findIndex((obj => obj.link === referrer));
                    if (dataFromFile2[objIndex].count >= 5) {
                        ctx.reply("Sorry, this referral link has been maxxed out for the week. You still get 1 point for using the /referral command!");
                    } else {
                    dataFromFile2[objIndex].count = dataFromFile2[objIndex].count + 1;
                    ctx.reply("Thank you! Your referral code has been counted!");
                    }
                } else {
                    var referrerData = {
                        link : referrer,
                        count : 1
                    }
                    
                    dataFromFile2.push(referrerData);

                    ctx.reply("Thank you! Your referral code has been counted!");
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
            createReferrence();
        } catch (e) {
            console.log("Referrence error ", e);
        }

    }
});

bot.command('stats', (ctx) => {
    if (ctx.message.text.startsWith('/stats')) {
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

            if(linkData.some(user => user.userID === ctx.message.from.id)){

                var objIndex = linkData.findIndex((obj => obj.userID === ctx.message.from.id));

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

                if(refData.some(user => user.userID === ctx.message.from.id)){
                    refCount = refCount + 1;
                }

                ctx.reply("Your total points this week are: " + refCount);

                return;
            } else if(refData.some(user => user.userID === ctx.message.from.id)){
                refCount = refCount + 1;
                ctx.reply("Your total points this week are: " + refCount);
                return;
            } else {
                ctx.reply("You are not entered in the giveaway");
                return;
            }
        
        }

        try {
            fetchStats()
        } catch (e) {
            console.log("Fetch Stats Error ", e);
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

bot.launch();
