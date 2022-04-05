const puppeteer = require('puppeteer');
const UserAgent = require('user-agents');
// const fakeUa = require('fake-useragent');
// console.log(fakeUa(), '---fake ui');

const randomUseragent = require('random-useragent');
console.log(randomUseragent.getRandom());

const userAgent = new UserAgent();

const express = require('express')
const app = express()

app.post('/getSearchResults', async function (req, res) {
  try {

        const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
        const page = await browser.newPage();

        await page.setUserAgent(randomUseragent.getRandom());

        // go to the target web
        await page.goto('https://steamdb.info/instantsearch/?query=pubg');

        // wait for element defined by XPath appear in page
   
        await page.waitForXPath("(//a[@class='app s-hit-list'])");

        let hitname = await page.$x("(//a[@class='app s-hit-list'])");

        // prepare to get the textContent of the selector above (use page.evaluate)
        let firstRowdata = await page.evaluate(el => el.textContent, hitname[0]);
        
        const hrefs = await Promise.all((await page.$x('//a[@class="app s-hit-list"]')).map(async item => await (await item.getProperty('href')).jsonValue()));

        firstRowdata = firstRowdata.trim().split(" ");

        let gameName = ""
        let gameDetails = []
        i = 0
        while(i < firstRowdata.length && firstRowdata[i] != '') {
            gameName += " " + firstRowdata[i]
            i++
        }
        while(i < firstRowdata.length && firstRowdata[i] == '') 
            i++
        
        while(i < firstRowdata.length) {
            if(firstRowdata[i] == '')
                gameDetails.push('-')
            else
                gameDetails.push(firstRowdata[i])
            i++
        }

        let releaseYear = gameDetails[0]
        let rating = gameDetails[1]
        let price = gameDetails[2]

        console.log("gameName = ", gameName)
        console.log("releaseYear = ", releaseYear)
        console.log("rating = ", rating)
        console.log("price = ", price)

        let productDetailsURL = hrefs[0]
        await page.goto(productDetailsURL);
        await browser.close();
        return res.send('Hello World')
  } catch (error) {
      return res.send("catch block")
  }
})

app.listen(3000)
