const middy = require('middy');
const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const { cors, doNotWaitForEmptyEventLoop, httpHeaderNormalizer, httpErrorHandler } = require('middy/middlewares');

const handler = async event => {
  const executablePath = event.isOffline
    ? './node_modules/puppeteer/.local-chromium/mac-674921/chrome-mac/Chromium.app/Contents/MacOS/Chromium'
    : await chromium.executablePath;

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath
  });

  const page = await browser.newPage();

  await page.goto("https://www.google.com", {
    waitUntil: ["networkidle0", "load", "domcontentloaded"]
  });

  const pdfStream = await page.pdf();

  return {
    statusCode: 200,
    isBase64Encoded: true,
    headers: {
      "Content-type": "application/pdf"
    },
    body: pdfStream.toString("base64")
  };
};

export const generate = middy(handler)
  .use(httpHeaderNormalizer())
  .use(cors())
  .use(doNotWaitForEmptyEventLoop())
  .use(httpErrorHandler())
