var request = require('sync-request');
var querystring = require('querystring');
var https = require('https');
var os = require('os');
var random = Math.floor(Math.random() * (+100 - +150)) + +100;
var timer = 0;
//
const CREDENTIALS_URL = 'https://mymusic.tsenagasy.com/credentials.php?get&site=';
const USERAGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36';
const WINDOW_WIDTH = 1500 + random;
const WINDOW_HEIGHT = 600 + random;
const puppeteer = require('puppeteer-extra');
const fs = require('fs');
const preloadFile = fs.readFileSync('./preload.js', 'utf8');
const pluginStealth = require("puppeteer-extra-plugin-stealth");
const MIN_LENGTH = process.env.MIN_LENGTH || 90;
const MAX_LENGTH = process.env.MAX_LENGTH || 240;
const TIMEOUT = 30000;
puppeteer.use(pluginStealth());

/*
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const recaptchaPlugin = RecaptchaPlugin({
    provider: { id: '2captcha', token: 'XXXXXXX' }
});
puppeteer.use(recaptchaPlugin);
*/

var SITE = process.env.SITE || 'qobuz';
var config = require('./' + SITE + '.js');

var player = {
    browser: null,
    credentials: null,
    songTitle: null,
    siteTitle: null,
    songDuration: null,
    page: null,
    serverStarted: false,

    delay: function (time) {
        return new Promise(function(resolve) {
            setTimeout(resolve, time)
        });
    },

    getRandomInt: function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    getRequest: function(url) {
        var response = request(
            'GET',
            url
        );
        return JSON.parse(response.body);
    },


    save: function () {
        //
        var postData = querystring.stringify({
            username: this.credentials.username,
            site: SITE,
            title: this.songTitle,
            duration: this.songDuration
        });

        const postOptions = {
            host: 'mymusic.tsenagasy.com',
            port: '443',
            path: '/save.php',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': postData.length
            }
        };

        // Set up the request
        var post_req = https.request(postOptions, function(res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log('Response: ' + chunk);
            });
        });

        // post the data
        post_req.write(postData);
        post_req.end();
    },

    setCredentials: function() {
        console.log('Getting credentials for ' + SITE);
        var hostname = os.hostname();
        var self = this;
        var credentialsUrl = CREDENTIALS_URL  + SITE + '&hostname=' + hostname;
        var data = this.getRequest(credentialsUrl);
        if (data.success === true) {
            setInterval(function() {
               self.ping(SITE, data.credentials);
            }, 30000);
            this.credentials = data.credentials;
        } else {
            this.credentials = false;
        }
    },

    ping: function() {
        var hostname = os.hostname();
        var url = 'https://mymusic.tsenagasy.com/credentials.php?ping&site=' + SITE + '&username=' + this.credentials.username + '&hostname=' + hostname;
        var data = this.getRequest(url);
        return (data.success === true);
    },

    setReady: function() {
        var http = require('http');
        http.createServer(function (req, res) {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.write('OK');
            res.end();
        }).listen(8080);
    },

    startLiveness: function() {
        if (this.serverStarted) {
            return true;
        }
        var http = require('http');
        http.createServer(function (req, res) {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.write('OK');
            res.end();
        }).listen(9999);
        this.serverStarted = true;
    },

    getBrowserOptions: function()
    {
        var dataDir = './profiles/' + this.credentials.username.split('@')[0] + '-' + this.getRandomInt(1000, 9999);

        const args = [
            '--window-position=' + 10 + random/5 + ',' + 30 + random/5,
            '--user-agent=' + USERAGENT,
            '--window-size=' + WINDOW_WIDTH + ',' + WINDOW_HEIGHT,
            '--disable-infobars',
            '--no-sandbox',
            '--proxy-server=luminati.tsenagasy.com:' + this.credentials.proxyport,
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--no-gpu',
            '--disable-software-rasterizer',
            '--remote-debugging-port=9222',
            '--disable-dev-shm-usage'
            //'--data-dir=' + dataDir
        ];

        headlessVar = (SITE !== 'spotify');

        return options = {
            args,
            headless: headlessVar,
            executablePath: '/usr/bin/google-chrome',
            slowMo: 10, // slow down,
            //ignoreDefaultArgs: "--mute-audio"
            //ignoreDefaultArgs: ["--mute-audio", "--hide-scrollbars"]
            //userDataDir: './' + dataDir,
        };

    },

    getBrowser: async function()
    {
        if (this.browser === null) {
            this.browser = puppeteer.launch(this.getBrowserOptions());
        }
        return this.browser;
    },

    start: async function() {
        this.setCredentials();
        this.setReady();
        if (!this.credentials) {
            console.log("No available credentials");
            process.exit(404);
        }
        const browser = await this.getBrowser();
        const page = await browser.newPage();
        await page.evaluateOnNewDocument(preloadFile);
        await page.setViewport({ width: WINDOW_WIDTH, height: WINDOW_HEIGHT });
        //
        await this.login(page, browser);
        await this.skipModals(page);
        //
        console.log('Loading playlist');
        await page.goto(config.PLAYLIST);

        //
        try {
            console.log('Lets play the music...');
            await page.screenshot({path: 'storage/' + SITE + '.png'});
            await page.waitForSelector(config.PLAY_BUTTON, {timeout: TIMEOUT});
            await page.click(config.PLAY_BUTTON);
        } catch (err) {
            console.log('Play button not found');
            await await this.sendmail(page);
        }

        try {
            console.log('setting random and loop if any');
            await this.setPlayerOptions(page, browser);
        } catch (err) {
            console.log(err.message);
            await this.sendmail(page);
        }
        try {
            console.log('Lets start the folks...');
            await page.screenshot({path: 'storage/' + SITE + '.png'});
            await page.waitForSelector(config.PLAY_BUTTON, {timeout: 5000});
            await this.playMusic(page, browser);
        } catch (err) {
            console.log(err.message);
            await this.sendmail(page);
        }
    },

    mouseMove: async function(page) {
        (async function() {
            // randomly mouse move
            for (i = 0; i < 20; i++) {
                await page.mouse.move(self.getRandomInt(100 + i*20, 150 + i*10), self.getRandomInt(50 + i*5, 100 + i*10));
                await page.waitFor(self.getRandomInt(i*10 + 100, i*50 + 200));
            }
        }());
    },

    login: async function(page) {
        console.log(SITE + ' Login page with ' + this.credentials.username);
        self = this;

        try {
            await page.goto(config.LOGIN_PAGE, {waitUntil: 'networkidle0', timeout: TIMEOUT});
        } catch (err) {
            console.log(err.message);
            console.log('Is this Server authorized on proxy ?');
            await page.screenshot({path: 'storage/' + SITE + '.png'});
            await this.sendmail(page);
        }
        const siteTitle = await page.title();
        console.log('Starting player on ' + siteTitle);
        console.log('Filling user: ' + this.credentials.username);
        try {
            await page.screenshot({path: 'storage/' + SITE + '.png'});
            await page.type(config.INPUT_USERNAME, this.credentials.username);
            if (config.PRESS_ENTER) {
                await page.type(config.INPUT_USERNAME, String.fromCharCode(13));
            }
        } catch (err) {
            console.log('Failed typing username');
            console.log(err.message);
            await this.sendmail(page);
        }
        //
        console.log('Filling password : ' + this.credentials.password);
        try {
            await page.screenshot({path: 'storage/' + SITE + '.png'});
            await page.type(config.INPUT_PASSWORD, this.credentials.password);
        } catch (err) {
            console.log(err.message);
            await this.sendmail(page);
        }

        console.log('Login');
        if (config.PRESS_ENTER) {
            await page.type(config.INPUT_PASSWORD, String.fromCharCode(13));
        }
        //
        try {
            await page.screenshot({path: 'storage/' + SITE + '.png'});
            await page.click(config.LOGIN_BUTTON);
            await page.waitForNavigation({waitUntil: 'networkidle2', timeout: TIMEOUT});
        } catch (err) {
            console.log('failed login');
            await this.sendmail(page);
        }
        if (config.LOGGED_IN_CHECK !== '') {
            try {
                await page.screenshot({path: 'storage/' + SITE + '.png'});
                await page.waitForSelector(config.LOGGED_IN_CHECK, {timeout: 30000});
                console.log('Logged in');
            } catch (e) {
                console.log('Login Failed');
                await this.sendmail(page);
            }
        }
    },

    playMusic: async function(page) {
        await page.screenshot({path: 'storage/' + SITE + '.png'});
        this.songDuration = this.getRandomInt(MIN_LENGTH, MAX_LENGTH);
        // get song title, artist and album
        try {
            await page.waitForSelector(config.SKIP_BUTTON, {timeout: TIMEOUT});
            await page.click(config.SKIP_BUTTON);
        } catch (err) {
            console.log(err.message);
            await this.sendmail(page);
        }

        var self = this;

        //
        setTimeout(async function() {
            // wait few seconds before fetching title
            self.siteTitle = await page.title();
            self.songTitle = self.siteTitle.split('·')[0].trim();
            console.log('Playing ' + self.songTitle);
        }, 5000);

        //
        timer = this.songDuration;
        var loop = setInterval(function() {
            timer-=10;
            console.log('Timeleft : ' + timer + 'sec');
        }, 10000);
        setTimeout(function() {
            console.log('saving data');
            self.save();
            clearInterval(loop);
            console.log('Next...');
            self.playMusic(page, config.SKIP_BUTTON, self.credentials, SITE);
        }, self.songDuration*1000);
        
        this.startLiveness();

    },

    setPlayerOptions: async function(page, browser) {
        if (config.PAUSE_BUTTON !== '') {
            try {
                await page.screenshot({path: 'storage/' + SITE + '.png'});
                await page.waitForSelector(config.PAUSE_BUTTON, {timeout: 15000});
            } catch (err) {
                console.log('Seems not playing... retry');
                await page.click(config.PLAY_BUTTON);
                console.log('If not playing there, we reboot !');
                try {
                    await page.screenshot({path: 'storage/' + SITE + '.png'});
                    await page.waitForSelector(config.PAUSE_BUTTON, {timeout: 15000});
                } catch (err2) {
                    console.log(err2.message);
                    await this.sendmail(page);
                }
            }
        }

        //
        console.log('Enable randomization');
        if (config.RANDOM_BUTTON !== '') {
            await page.click(config.RANDOM_BUTTON);
            if (config.RANDOM_BUTTON_ACTIVATED !== '') {
                try {
                    console.log('Waiting confirmation of randomization');
                    await page.waitForSelector(config.RANDOM_BUTTON_ACTIVATED, {timeout: 10000});
                } catch (err) {
                    console.log(err.message);
                    console.log('Failed randomize... continue without');
                }
            }
        }

        //
        if (config.LOOP_BUTTON !== '') {
            try {
                // already looping ?
                console.log('Enable loop');
                await page.screenshot({path: 'storage/' + SITE + '.png'});
                await page.waitForSelector(config.LOOP_BUTTON);
                await page.click(config.LOOP_BUTTON);
                try {
                    console.log('Waiting confirmation of loop');
                    await page.screenshot({path: 'storage/' + SITE + '.png'});
                    await page.waitForSelector(config.LOOP_BUTTON_ACTIVATED);
                } catch (err) {
                    try {
                        console.log('2nd try');
                        await page.click(config.LOOP_BUTTON);
                        try {
                            await page.screenshot({path: 'storage/' + SITE + '.png'});
                            await page.waitForSelector(config.LOOP_BUTTON_ACTIVATED);
                        } catch (err) {
                            console.log('Failed loop... continue without');
                        }
                    } catch (err) {
                        console.log('Failed loop... continue without');
                    }
                }
            } catch (err) {
                console.log('Loop button not found');
                // nothing to do
            }
        }
    },

    skipModals: async function(page)
    {
        const skipWelcome = 'div.modal-footer > button:nth-child(1)';
        if (await page.$(skipWelcome) !== null) {
            try {
                await page.screenshot({path: 'storage/' + SITE + '.png'});
                await page.waitForSelector(skipWelcome, {visible: true});
                console.log('Found welcome modal... skipping');
                await page.click(skipWelcome);
                // confirm
                await this.delay(500);
                var skip = 'div.modal-footer > button.active';
                await page.screenshot({path: 'storage/' + SITE + '.png'});
                await page.waitForSelector(skip);
                await page.click(skip);
            } catch (err) {

            }
        }
        //
    },

    sendmail: async function(page) {
        console.log('Sending alert');
        var nodemailer = require('nodemailer');
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'eramahatra@gmail.com',
                pass: '4598667-Gl'
            }
        });

        var dest = process.env.EMAIL || 'papang0@yopmail.com';
        console.log('to ' + dest);

        var mailOptions = {
            from: 'eramahatra@gmail.com',
            to: dest,
            subject: 'Mymusic player failed',
            text: 'screenshot',
            attachments:[
                {
                    fileName: SITE + '.png',
                    streamSource: fs.createReadStream('./storage/' + SITE + '.png')
                }
            ]
        };

        transporter.sendMail(mailOptions);
        process.exit();
    }


};


try {
    player.start();
} catch (err) {
    console.log(err);
    process.exit(500);
}
