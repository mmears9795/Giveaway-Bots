import { promises as fs } from "fs";
import require from 'dotenv/config';


async function fetchStats() {

    async function readData(fileName){
        let dataX = fs.readFile(fileName, "utf8", function (err, data) {
            return data;
        });
        return dataX;
    };

    var linkData = await readData('../linkcheck.json');
    linkData = JSON.parse(linkData);

    var referreeData = await readData('../referreecheck.json');
    referreeData = JSON.parse(referreeData);

    var referrerData = await readData('../referrercheck.json');
    referrerData = JSON.parse(referrerData);

    var drawData = await readData('../drawData.json');
    drawData = JSON.parse(drawData);

    linkData.forEach(element => {
        if (!isEmpty(element)) {
            let totalPoints = 0;


            linkData.forEach(element2 => {
                if (element2.note === element.link) {
                    totalPoints = totalPoints + 1;
                };
            });

            let referreeIndex = 0;

            referreeData.forEach(element3 => {
                if (element3.userID === element.userID) {
                    totalPoints = totalPoints + 1;
                    delete referreeData[referreeIndex];
                    referreeData = referreeData.filter(x => x !== null); 
                };
                referreeIndex = referreeIndex + 1;
            });

            let referrerIndex = 0;

            referrerData.forEach(element4 => {
                if (element4.link === element.link) {
                    totalPoints = totalPoints + element4.count;
                    delete referrerData[referrerIndex];
                    referrerData = referrerData.filter(x => x !== null);
                };
                referrerIndex = referrerIndex + 1;
            });

            if (totalPoints != 0) {
                let entry = {
                    userID: element.userID,
                    points: totalPoints
                };

                drawData.push(entry);

            }
        };
    });

    let referreeIndex2 = 0;

    referreeData.forEach(element5 => {
        let entry = {
            userID: element5.userID,
            points: 1
        };

        drawData.push(entry);

        delete referreeData[referreeIndex2];

        referreeIndex2 += 1;
    });

    console.log(referreeData);

    referreeData = referreeData.filter(x => x !== null); 
    
    referrerData = referrerData.filter(x => x !== null);

    referrerData = referrerData.filter(x => x.link !== "https://l.linklyhq.com/l/lbt6");

    
    fs.writeFile("../referreecheck.json", JSON.stringify(referreeData), function(err){
        if (err) throw err;
        console.log('The "data to append" was appended to file!');
    });

    fs.writeFile("../referrercheck.json", JSON.stringify(referrerData), function(err){
        if (err) throw err;
        console.log('The "data to append" was appended to file!');
    });

    fs.writeFile("../drawData.json", JSON.stringify(drawData), function(err){
        if (err) throw err;
        console.log('The "data to append" was appended to file!');
    });

};

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}

await fetchStats();
// process.exit("I am finished");