const USERAGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36';
const WINDOW_WIDTH = 1200;
const WINDOW_HEIGHT = 800;
const puppeteer = require('puppeteer-extra');
const pluginStealth = require("puppeteer-extra-plugin-stealth");
var config = require('./amazon-config.js');
puppeteer.use(pluginStealth());
var randomUseragent = require('random-useragent');
const PuppeteerFlash = require('puppeteer-extra-plugin-flash');
// puppeteer.use(PuppeteerFlash());


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
            '--user-agent=' + USERAGENT,
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
        // await page.setUserAgent(randomUseragent.getRandom())

        await page.setViewport({ width: WINDOW_WIDTH, height: WINDOW_HEIGHT });
        //
        // Go to Login PAge
        await page.goto(config.LOGIN_PAGE, { waitUntil: 'networkidle0' });

        await page.waitForSelector(config.PRELOGIN_BUTTON, { timeout: 120000 });
        // Click facebook login button
        await page.click(config.PRELOGIN_BUTTON);
        await page.waitFor(7000);


        await page.waitForSelector(config.INPUT_USERNAME, { timeout: 120000 });
        await page.type(config.INPUT_USERNAME, 'steeve@ibizar.net');


        await page.waitForSelector(config.INPUT_PASSWORD, { timeout: 120000 });
        await page.type(config.INPUT_PASSWORD, 'Steeve456123');


        await page.waitForSelector(config.LOGIN_BUTTON, { timeout: 120000 });
        // Click facebook login button
        await page.click(config.LOGIN_BUTTON);
        await page.waitFor(7000);



        await page.waitForSelector(config.INPUT_USERNAME, { timeout: 120000 });
        await page.type(config.INPUT_USERNAME, 'steeve@ibizar.net');
        await page.waitFor(7000);

        await page.waitForSelector(config.INPUT_PASSWORD, { timeout: 120000 });
        await page.type(config.INPUT_PASSWORD, 'Steeve456123');
        
        await page.waitForSelector(config.LOGIN_BUTTON, { timeout: 120000 });
        // Click facebook login button
        await page.click(config.LOGIN_BUTTON);
        await page.waitFor(7000);


        await page.goto(config.RANDOM_URL, { waitUntil: 'networkidle0' });
        
        await page.waitForSelector(config.PLAY_RANDOM_BTN, { timeout: 120000 });
        // Click facebook login button
        await page.click(config.PLAY_RANDOM_BTN);
        await page.waitFor(7000);
        await page.waitForSelector(config.CONFIRM_BTN, { timeout: 120000 });
        // Click facebook login button
        await page.click(config.CONFIRM_BTN);
        await page.waitFor(7000);

        

    }


};


try {
    player.start();
} catch (err) {
    console.log(err);
    process.exit(500);
}