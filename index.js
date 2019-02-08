const puppeteer = require('puppeteer');
const $ = require('cheerio');
const url = 'https://www.instagram.com/p/BtY0Bsrg1mS/';


async function rungProg(){
    console.log('running');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    await getComments(page);
    await printComments(page, browser);
};

rungProg();

async function getComments(page) {
    try {
        await Promise.all([
            await page.waitForSelector('button.Z4IfV'),
            page.click('button.Z4IfV'),
            console.log("clicked"),
            page.waitFor(500),
        ]);
    } catch (error) {
        console.log("The element didn't appear.")
    }
};

async function printComments(page, browser) {

    const html = await page.content()
    await $('h3 > a', html).each(function () {
        console.log($(this).text());
    });
    await browser.close();
}
