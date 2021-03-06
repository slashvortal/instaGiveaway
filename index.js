const puppeteer = require('puppeteer');
const $ = require('cheerio');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();

var PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
    console.log('Server Started on Port ', PORT);
})

// Middleware to parse the data from the front end form.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Global vars :(
var exists = true;
var comments = [];
var image = [];

//-------------------------------------------------------------------------------------------------


// Set Static Path
app.use(express.static(path.join(__dirname, '/public/')));

// Function to grab URL from front end, run the scraping program.
app.post('/submit-url', function (req, res) {
    exists = true;
    comments = [];
    image = [];
    var URL = req.body.url;
    res.sendStatus(200);
    rungProg(URL);
});

// Push the HTML to root on load
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + 'public/index.html'))
});

// Send comments to front end
app.get('/comments', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/comments.html'));
    // res.send(comments);
});

app.get('/send-comments', function (req, res) {
    // res.send(comments);
    res.send({ loading: exists, comments: comments });
});

app.get('/send-image', function (req, res) {
    res.send(image);
})






// Funciton to scrape comments
async function rungProg(url) {
    console.log('running');
    const browser = await puppeteer.launch({
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(url);
    grabImage(page);
    while (exists === true) {
        console.log(exists);
        await getComments(page);
    }
    console.log(comments);
    console.log(comments.length);
    console.log(image);
    await browser.close();
};



// If the "load more" button exists, it will be pressed until all comments have loaded. 
async function getComments(page) {
    if (await page.$('button.Z4IfV') !== null) {
        await page.click('button.Z4IfV');
        console.log("clicked");
        var wait = Math.floor(Math.random() * 1000) + 250;
        await page.waitFor(wait);
        comments = [];
        await printComments(page);
    } else {
        exists = false;
        console.log('not found');
        comments = [];
        await printComments(page);
    }
};



// Stores the comments to the comments array by grabbing internal text/comment link.
async function printComments(page) {
    const html = await page.content()
    await $('h3 > a', html).each(function () {
        comment = {
            username: $(this).text(),
            link: $(this).attr("href")
        }
        comments.push(comment);
    });
    console.log(comments.length);
};

// Stores image href for post
async function grabImage(page) {
    const html = await page.content();
    await $('.FFVAD', html).each(function () {
        var link = $(this).attr('src');
        image.push({ link: link })
    })
};

// Empties the comment string
app.post("/emptyVars", function (req, res) {
    res.sendStatus(200);
    exists = true;
    comments = [];
    // image = [];
    console.log(exists, comments);
});
