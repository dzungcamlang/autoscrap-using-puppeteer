'use strict';
const WINDOW_WIDTH = 1920;
const WINDOW_HEIGHT = 1080;
const MIN_LENGTH = 65;
const MAX_LENGTH = 220;
var timer = 0;
const fs = require('fs');
const os = require('os');
var tools = require('./common.js');
const preloadFile = fs.readFileSync('./preload.js', 'utf8');
const puppeteer = require("puppeteer-extra");
const pluginStealth = require("puppeteer-extra-plugin-stealth");
const DOMAIN = process.env.DOMAIN;
const USERAGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36';
const INPUT_USERNAME = 'input#ap_email';
const INPUT_PASSWORD = 'input#ap_password';
const INPUT_SUBMIT = 'input#signInSubmit';
const PLAYBUTTON = 'span.icon-play';
const RANDOM_BUTTON = 'span.shuffleButton';
const REPEAT_BUTTON = 'span.repeatButton';
if (DOMAIN === undefined) {
    console.log('please define Amazon Domain (fr or es)');
    return false;
}
const U_LOGIN_PAGE = 'https://www.amazon.fr/ap/signin?_encoding=UTF8&accountStatusPolicy=P1&openid.assoc_handle=amzn_webamp_fr&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.mode=checkid_setup&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.ns.pape=http%3A%2F%2Fspecs.openid.net%2Fextensions%2Fpape%2F1.0&openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.fr%3A443%2Fgp%2Fredirect.html%3F_encoding%3DUTF8%26location%3Dhttps%253A%252F%252Fmusic.amazon.fr%253Fref%253Ddm_wcp_af_nr%2526ref_%253Ddm_wcp_unrec_ctxt_sign_in%2526referer%253Dhttps%25253A%25252F%25252Fmusic.amazon.fr%25252Fhome%26source%3Dstandards%26token%3D87BFA8BEB16DB3B6C078A2CA41DA21AF661877BE%23&pageId=amzn_cpweb&showRmrMe=1';
const HOMEPAGE= 'https://music.amazon.' + DOMAIN;
const SITE = 'amazon-' + DOMAIN;
const PLAYLIST='https://music.amazon.' + DOMAIN + '/my/songs';
puppeteer.use(pluginStealth());

try {
    var credentials = tools.getCredentials(SITE);
} catch (err) {
    console.log(err.message);
    process.exit();
}
if (!credentials) {
    console.log("No available credentials");
    return false;
}

console.log('Credentials: ' + credentials.username + '/' + credentials.password + '/' + credentials.proxyport);
var dataDir = './profiles/' + credentials.username.split('@')[0] + '/' + SITE + '/UserData/';
fs.mkdir(dataDir, function() {});



const args = [
    '--window-position=4,3',
    '--disable-infobars',
    '--user-agent=' + USERAGENT,
    '--window-size=' + WINDOW_WIDTH + ',' + WINDOW_HEIGHT,
    '--no-sandbox',
    '--proxy-server=luminati.tsenagasy.com:' + credentials.proxyport,
    //'--user-data-dir=' + dataDir
];

const options = {
    args,
    headless: false,
    executablePath: '/usr/bin/google-chrome',
    slowMo: 50 // slow down
};

try {
    (async () => {

        const browser = await puppeteer.launch(options);
        const page = await browser.newPage();
        await page.evaluateOnNewDocument(preloadFile);

        await page.setExtraHTTPHeaders({
            'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8,it;q=0.7'
        });

        await page.setViewport({ width: WINDOW_WIDTH, height: WINDOW_HEIGHT });

        /* end optims */
        try {
            //
            await page.goto(U_LOGIN_PAGE);
            const siteTitle = await page.title();
            console.log('Starting player on ' + siteTitle);
            //
            if (await page.$(INPUT_USERNAME) !== null) {
                console.log('Filling user');
                console.log('Filling user');
                await page.type(INPUT_USERNAME, credentials.username);
            }
            if (await page.$(INPUT_PASSWORD) !== null) {
                console.log('Filling password 1st time');
                await page.type(INPUT_PASSWORD, credentials.password);
            }

            if (await page.$(INPUT_SUBMIT) !== null) {
                console.log('Login 1st time...');
                await page.click(INPUT_SUBMIT);
                await page.waitForNavigation();
            }

            if (await page.$(INPUT_PASSWORD) !== null) {
                console.log('Filling password 2nd time');
                await page.type(INPUT_PASSWORD, credentials.password);
                await page.click(INPUT_SUBMIT);
                await page.waitForNavigation();
            }

            console.log('Logged in...');
            browser.close();
            process.exit(0);
            await page.goto(PLAYLIST);
            await page.waitForNavigation();
            //
            console.log('Waiting for shuffle button visible');
            await page.waitForSelector(RANDOM_BUTTON);
            await page.click(RANDOM_BUTTON);

            await page.click(REPEAT_BUTTON);
            //
            console.log('Lets play the music...');
            process.exit();
            playMusic(page);

        } catch (err) {
            console.log(err.message);
            process.exit(255);
        }
    })()
} catch (err) {
    console.log(err.message);
    process.exit(255);
}


async function playMusic(page) {
    var musicLength = tools.getRandomInt(MIN_LENGTH, MAX_LENGTH);
    await page.click(PLAYBUTTON);
    // get song title, artist and album
    var songTitle = await page.evaluate(() => document.querySelector('section.playbackControlsView > span.trackInfoContainer > a > span').innerText);
    console.log('Playing ' + songTitle);
    process.exit();
    //
    timer = musicLength;
    var loop = setInterval(function() {
        timer-=10;
        console.log('Timeleft : ' + timer + 'sec');
    }, 10000);
    setTimeout(function() {
        console.log('saving data');
        tools.save(songTitle, credentials, SITE, musicLength);
        clearInterval(loop);
        console.log('Next...');
        playMusic(page, musicLength);
    }, musicLength*1000);
}