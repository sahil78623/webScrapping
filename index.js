const puppeteer = require('puppeteer');
const UserAgent = require('user-agents');

const userAgent = new UserAgent();
console.log(userAgent.toString());
// test-------
(async () => {
    try {
        // set some options (set headless to false so we can see 
        // this automated browsing experience)

        const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
        const page = await browser.newPage();

        // set viewport and user agent (just in case for nice viewing)
        await page.setUserAgent(userAgent.toString());

        // go to the target web
        await page.goto('https://steamdb.info/instantsearch/?query=pubg');

        // wait for element defined by XPath appear in page
   
        await page.waitForXPath("(//a[@class='app s-hit-list'])");
        // await page.waitForXPath("(//div[@class='sc-94726ce4-1 iNShGo'])//h1");

        // evaluate XPath expression of the target selector (it return array of ElementHandle)
        let hitname = await page.$x("(//a[@class='app s-hit-list'])");
        // await page.waitForXPath("(//div[@class='app s-hit-list'])");

        // prepare to get the textContent of the selector above (use page.evaluate)
        let firstRowdata = await page.evaluate(el => el.textContent, hitname[0]);
        
        const hrefs = await Promise.all((await page.$x('//a[@class="app s-hit-list"]')).map(async item => await (await item.getProperty('href')).jsonValue()));
        // let hitreleaseData = await page.evaluate(el => el.textContent, hitrelease[0]);

        firstRowdata = firstRowdata.trim().split(" ");
        // console.log('first row', firstRowdata);
        // console.log("href = ",  hrefs[0])

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

        // await page.waitForXPath("(//table[@class='table table-bordered table-hover table-responsive-flex'])//tbody");

        // let productDetailsData = await page.$x("(//table[@class='table table-bordered table-hover table-responsive-flex'])//tbody");

        // console.log("productDetailsData = ",  productDetailsData)
        // close the browser
        await browser.close();
    }
    catch(error) {
        console.log(error, "---error")
    }
    
})();
