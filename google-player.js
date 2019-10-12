const USERAGENT = 'Chrome/40.0.3729.131';
const WINDOW_WIDTH = 1200;
const WINDOW_HEIGHT = 800;
const puppeteer = require('puppeteer-extra');
const pluginStealth = require("puppeteer-extra-plugin-stealth");
var config = require('./play_google.js');
puppeteer.use(pluginStealth());
var randomUseragent = require('random-useragent');
const PuppeteerFlash = require('puppeteer-extra-plugin-flash');
puppeteer.use(PuppeteerFlash());
console.log(randomUseragent);

const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
puppeteer.use(
    RecaptchaPlugin({
        provider: { id: '2captcha', token: '70d6c0964ab021a52b6f4ee6e5c079d5' },
        visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
    })
);

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
            '--window-size=1200,800',
            '--user-agent=' + randomUseragent,
            '--no-sandbox',
            '--enable-webgl',
            '--enable-accelerated-2d-canvas',
            '--disable-dev-shm-usage',
            '--remote-debugging-port=9222',
            '--proxy-server=http=188.134.1.20:63756'
  
        ];

        return options = {
            args,
            headless: config.HEADLESS,
            ignoreHTTPSErrors: true,
            executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            slowMo: 25, // slow down,
            ignoreDefaultArgs: ["--hide-scrollbars", "--enable-automation", "--disable-infobars"],
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

        await page.waitForSelector(config.LOGIN_BUTTON, { timeout: 120000 });
        // Click facebook login button
        await page.click(config.LOGIN_BUTTON);
        await page.waitFor(7000);

        await page.waitForSelector(config.INPUT_USERNAME, { timeout: 120000 });
        await page.type(config.INPUT_USERNAME, 'Nyhirako78@gmail.com');
        await page.type(config.INPUT_USERNAME, String.fromCharCode(13));
        var randomPause = Math.ceil(Math.random() * 1000) * 1;
        await page.waitFor(5000);
        
        await page.type(config.INPUT_PASSWORD, 'Nyhirako456123');
        // Enter with username and password on facebook
        await page.type(config.INPUT_PASSWORD, String.fromCharCode(13));


        await page.waitFor(5000);

        await page.waitForSelector(config.INGORE_BUTTON, { timeout: 120000 });
        // Click facebook login button
        await page.click(config.INGORE_BUTTON);


        await page.waitFor(5000);

        await page.waitForSelector(config.RANDOM_BUTTON, { timeout: 120000 });
        // Click facebook login button
        //await page.click(config.RANDOM_BUTTON);

        

        

    }


};


try {
    player.start();
} catch (err) {
    console.log(err);
    process.exit(500);
}