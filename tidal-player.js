const USERAGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36';
const WINDOW_WIDTH = 1200;
const WINDOW_HEIGHT = 800;
const puppeteer = require('puppeteer-extra');
const pluginStealth = require("puppeteer-extra-plugin-stealth");
var config = require('./tidal.js');
puppeteer.use(pluginStealth());
var randomUseragent = require('random-useragent');


var player = {
    browser: null,
    credentials: null,
    songTitle: null,
    siteTitle: null,
    songDuration: null,
    page: null,
    serverStarted: false,

    getBrowserOptions: function () {
        const args = [
            '--window-position=50,50',
            '--user-agent=' + USERAGENT,
            '--window-size=' + WINDOW_WIDTH + ',' + WINDOW_HEIGHT,
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--remote-debugging-port=9222',
        ];

        return options = {
            args,
            headless: config.HEADLESS,
            executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            slowMo: 25, // slow down,
            ignoreDefaultArgs: ["--mute-audio", "--hide-scrollbars", "--enable-automation", "--disable-infobars"],
        };

    },

    getBrowser: async function () {
        if (this.browser === null) {
            this.browser = puppeteer.launch(this.getBrowserOptions());
        }
        return this.browser;
    },

    start: async function () {
        const browser = await this.getBrowser();
        const page = await browser.newPage();


        await page.setViewport({ width: WINDOW_WIDTH, height: WINDOW_HEIGHT });

        //
        // Go to Login PAge
        await page.goto(config.LOGIN_PAGE, { waitUntil: 'networkidle0' });
        // Click facebook login button
        
        await page.waitForSelector(config.FACEBOOK_BUTTON, { timeout: 120000 });
        await page.click(config.FACEBOOK_BUTTON);
        await page.waitFor(7000);
        // Type Login username
        await page.waitForSelector(config.INPUT_USERNAME, { timeout: 120000 });
        await page.type(config.INPUT_USERNAME, 'antoinette@hotel-silaos.com');
        var randomPause = Math.ceil(Math.random() * 1000) * 1;
        await page.waitFor(randomPause);
        // Type Password
        await page.type(config.INPUT_PASSWORD, 'Antoinette456123');
        // Enter with username and password on facebook
        await page.type(config.INPUT_PASSWORD, String.fromCharCode(13));

        await page.waitFor(10000);
        await page.goto(config.PLAYLIST, { waitUntil: 'networkidle0' });
        await page.waitFor(5000);


        // // Load PLAYLIST
        await page.waitForSelector(config.RANDOM_BUTTON, { timeout: 5000 });
        await page.click(config.RANDOM_BUTTON);
        console.log('----------DONE---------');

    }


};


try {
    player.start();
} catch (err) {
    console.log(err);
    process.exit(500);
}