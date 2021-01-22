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

async function Start(mode, preifx, directory = "result") {
    const data = await GetCSVData(`data-${mode}.csv`);
    const timer = setInterval(ProcessLog(mode), 16);

    await MakeDirectory(directory);

    totalCount = data.length;
    latestFiles.length = 10;
    latestFiles.fill("");

    await GenerateImage(data, preifx, directory);

    clearInterval(timer);
    logUpdate.done();

    return data;
}

async function GetCSVData(file) {
    return Papa.parse(await readFile(file, { encoding: "utf8" }), {
        header: true
    }).data;
}

async function MakeDirectory(directory) {
    try {
        await mkdir(`./${directory}`);
    } catch (err) {
        if (err.code !== "EEXIST") throw err;
    }
}

async function CreateCSV(data, prefix, name = "image") {
    const result = [];
    const directory = {
        produce: "images/content/idols/name/",
        support: "images/content/support_idols/name/"
    };

    console.log(chalk.blueBright(`Create ${name}.csv...`));

    result = data.map((item) => [
        `${directory[item.type]}${item.hash}_${item.id}.png`,
        `${prefix}${item.id}.png`,
        item.version
    ]);

    await writeFile(`${name}.csv`, Papa.unparse(result));
}

async function GenerateImage(data, name = "", directory) {
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
        await sharp(buffer).resize(444, 198).toFile(`${directory}/${name}${item.id}.png`);
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

function Capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function ProcessLog(mode) {
    return () => {
        const percent = doneCount / totalCount;
        const percentString = (percent * 100).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        logUpdate(
            [
                chalk.blueBright(`Mode: ${Capitalize(mode)}`),
                ...latestFiles.slice(-10),
                "",
                chalk.yellow(`Processing... (${doneCount}/${totalCount})`),
                chalk.yellowBright(`Estimate: ${GetEstimatedTime()}`),
                chalk.yellow(`${GetProgressBar(percent, 20)} ${percentString}%`),
                ""
            ].join("\n")
        );
    };
}

(async function () {
    const mode = process.env.MODE;
    const prefix = "card_name_";

    if (mode === undefined) {
        console.error(
            chalk.bgRed("ERROR: You need to run this tool with 'npm run <command>'.")
        );
    }

    switch (mode) {
        case "normal":
            const data = await Start("normal", prefix);
            await CreateCSV(data, prefix);
            break;
        case "simple":
            await Start("simple", "");
            break;
        case "update":
            await Start("update", prefix);
            break;
        default:
            console.error(chalk.bgRed(`ERROR: Unknown command "${mode}"`));
            return;
    }

    console.log(chalk.green("Complete! Check the 'result' directory."));
})();
