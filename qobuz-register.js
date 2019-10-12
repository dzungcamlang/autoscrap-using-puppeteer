var random = Math.floor(Math.random() * (+100 - +150)) + +100;
var timer = 0;
//
const USERAGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36';
const WINDOW_WIDTH = 1500 + random;
const WINDOW_HEIGHT = 600 + random;
const puppeteer = require('puppeteer-extra');
const fs = require('fs');
const pluginStealth = require("puppeteer-extra-plugin-stealth");
const TIMEOUT = 30000;
puppeteer.use(pluginStealth());

const REGISTER_PAGE = 'www.napster.com';


var napster = {
    name: null,
    firstname: null,
    lastname: null,
    password: null,
    email: null,
    port: null,

    getRandomPort: function ()
    {
        var ports9 = [];
        for (i=9001; i < 9015; i++) {
            ports9.push(i);
        }
        //
        var ports8 = [];
        for (i=8001; i < 8055; i++) {
            ports8.push(i);
        }

        var ports7 = [];
        for (i=7001; i < 7020; i++) {
            ports7.push(i);
        }

        var ports6 = [];
        for (i=6001; i < 6010; i++) {
            ports6.push(i);
        }

        var ports5 = [];
        for (i=5001; i < 5010; i++) {
            ports5.push(i);
        }

        var ports = ports9.concat(ports8).concat(ports7).concat(ports6).concat(ports5);
        return ports[Math.floor(Math.random()*ports.length)];
    },

    getRandomDomain: function()
    {
        var domains = ['hotel-silaos.com', 'froggies.net', 'gotliebmusic.com', 'ibizar.net', 'kreativas.net', 'manjaka.com', 'solveg-networks.com', 'artisticalls.com'];
        return domains[Math.floor(Math.random()*domains.length)];
    },

    getRequest:  function(url) {
        var request = require('sync-request');
        var res = request('GET', url);
        var data = JSON.parse(res.getBody('utf8'));
        return data[0];
    },

    getRandomName: async function()
    {
        this.name = this.getRequest('http://names.drycodes.com/1?nameOptions=boy_names');
        fullname = this.name.split('_');
        this.firstname = fullname[1];
        this.lastname = fullname[0];
        this.email = this.firstname + '-' + this.lastname + '@' + this.getRandomDomain();
        this.password = this.firstname + '456123';
    },


    getBrowserOptions: function()
    {

        this.port = this.getRandomPort();
        console.log(this.port);

        const args = [
            '--window-position=' + 10 + random/5 + ',' + 30 + random/5,
            '--user-agent=' + USERAGENT,
            '--window-size=' + WINDOW_WIDTH + ',' + WINDOW_HEIGHT,
            '--disable-infobars',
            '--no-sandbox',
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--no-gpu',
            '--disable-software-rasterizer',
            '--remote-debugging-port=9222',
            '--disable-dev-shm-usage',
            //'--proxy-server=luminati.tsenagasy.com:' + this.port,
            //'--data-dir=' + dataDir
        ];

        headlessVar = false;

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
        this.browser = puppeteer.launch(this.getBrowserOptions());
        return this.browser;
    },

    register: async function()
    {
        self = this;
        this.getRandomName();
        this.port = this.getRandomPort();
        console.log(this.email, this.password, this.firstname, this.lastname);

        var day = (10 + Math.ceil(Math.random()*20)).toString();
        var month = Math.ceil(Math.random()*9).toString();
        var year = (1980 + Math.ceil(Math.random()*30)).toString();

        var ddn = day.toString() + month.toString() + year.toString();

        const browser = await this.getBrowser();
        const page = await browser.newPage();
        await page.setViewport({ width: WINDOW_WIDTH, height: WINDOW_HEIGHT });

        await page.goto('https://www.qobuz.com/signup');
        await page.type('#register_email', this.email);
        await page.type('#register_displayName', this.firstname);
        await page.type('#register__password', this.password);
        await page.type('#register_birthday', ddn);
        await page.click('#register_gender_0');
        await page.click('#register_register');

        await page.waitElementVisible('a.lnk-later');
        await page.click('a.lnk-later');
        //
        await page.goto('https://www.qobuz.com/account');
        await page.click('#section-menu-item-streaming');

    }

};

napster.register();