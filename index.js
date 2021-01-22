const path = require("path");
const util = require("util");
const fs = require("fs");
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);
const Papa = require("papaparse");
const sharp = require("sharp");
const puppeteer = require("puppeteer");
const logUpdate = require("log-update");
const chalk = require("chalk");

let time = 0;

let latestFiles = [];
let totalCount = 0;
let doneCount = 0;

async function Start(mode, namePrefix) {
    const rawData = await readFile(`data-${mode}.csv`, { encoding: "utf8" });
    const data = Papa.parse(rawData, { header: true }).data;
    const timer = setInterval(
        ProcessLog(mode.charAt(0).toUpperCase() + mode.slice(1)),
        16
    );

    try {
        await mkdir("./result");
    } catch (err) {
        if (err.code !== "EEXIST") throw err;
    }

    totalCount = data.length;
    latestFiles.length = 10;
    latestFiles.fill("");

    await GenerateImageList(data, namePrefix);

    clearInterval(timer);
    logUpdate.done();

    if (mode === "normal") {
        console.log(chalk.blueBright("Create image.csv..."));

        const resultData = [];
        const directory = {
            produce: "images/content/idols/name/",
            support: "images/content/support_idols/name/"
        };

        for (let item of data) {
            resultData.push([
                `${directory[item.type]}${item.hash}_${item.id}.png`,
                `${namePrefix}${item.id}.png`,
                item.version
            ]);
        }

        await writeFile("image.csv", Papa.unparse(resultData));
    }

    console.log(chalk.green("Complete! Check the 'result' directory."));
}

async function GenerateImageList(data, name) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(`file:${path.join(__dirname, "image.html")}`);
    await page.setViewport({ width: 480, height: 360, deviceScaleFactor: 2 });

    async function GetImage(item) {
        await page.evaluate((item) => {
            const rarity = ["n", "r", "sr", "ssr"];
            SetText(item.card_name, item.idol_name, rarity[item.rarity - 1]);
        }, item);

        const buffer = await page.screenshot({
            omitBackground: true,
            clip: { x: 0, y: 0, width: 444, height: 198 }
        });

        // Create image as 2x size, and resize it into 1x size.
        // I chose this way, because Puppeteer is create quite dirty image when I create 1x size image.
        // This way spend more time (about 10 ~ 20%) but create much better images :)
        await sharp(buffer).resize(444, 198).toFile(`result/${name}${item.id}.png`);
    }

    for (let item of data) {
        const start = new Date();
        await GetImage(item);
        time += new Date() - start;
        latestFiles.push(`${++doneCount}. [${item.card_name}] ${item.idol_name}`);
    }

    await browser.close();
}

function GetProgressBar(percentage, length) {
    const count = Math.floor(percentage * length);
    const result = [];
    for (let i = 0; i < length; i++) {
        if (i < count) {
            result.push("▶");
        } else {
            result.push("▷");
        }
    }
    return result.join("");
}

function GetEstimatedTime() {
    if (time === 0 || doneCount === 0) {
        return "";
    } else {
        const average = time / doneCount;
        const left = totalCount - doneCount;
        const estimate = Math.round((average * left) / 1000);
        return `${Math.floor(estimate / 60)}m ${estimate % 60}s`;
    }
}

function ProcessLog(mode) {
    return () => {
        const percentage = doneCount / totalCount;
        const percentageString = (percentage * 100).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        logUpdate(
            [
                chalk.blueBright(`Mode: ${mode}`),
                ...latestFiles.slice(-10),
                "",
                chalk.yellow(`Processing... (${doneCount}/${totalCount})`),
                chalk.yellowBright(`Estimate: ${GetEstimatedTime()}`),
                chalk.yellow(`${GetProgressBar(percentage, 20)} ${percentageString}%`),
                ""
            ].join("\n")
        );
    };
}

(async function () {
    const mode = process.env.MODE;
    const namePrefix = "card_name_";

    if (mode === undefined) {
        console.error(
            chalk.bgRed("ERROR: You need to run this tool with 'npm run <command>'.")
        );
    }

    switch (mode) {
        case "normal":
            await Start("normal", namePrefix);
            break;
        case "simple":
            await Start("simple", "");
            break;
        case "simple":
            await Start("update", namePrefix);
            break;
        default:
            console.error(chalk.bgRed(`ERROR: Unknown command "${mode}"`));
            break;
    }
})();
