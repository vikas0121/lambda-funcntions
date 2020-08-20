// const middy = require('middy');
const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
// const { cors, doNotWaitForEmptyEventLoop, httpHeaderNormalizer, httpErrorHandler } = require('middy/middlewares');

module.exports.generatePdf = async event => {
  console.log("event", event)
  // const data = JSON.parse(event.body)
  // console.log("data", data)

  const { htmlString, options } = event
  const { format = 'A4', margin = { top: 5 }, printBackground = true } = options
  const executablePath = event.isOffline
    ? './node_modules/puppeteer/.local-chromium/mac-674921/chrome-mac/Chromium.app/Contents/MacOS/Chromium'
    : await chromium.executablePath
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath
  })
  const page = await browser.newPage()
  await page.setContent(htmlString, { waitUntil: 'networkidle0' })

  const pdfOptions = {
    format,
    margin,
    printBackground
  }

  const pdfBuffer = await page.pdf(pdfOptions)

  await browser.close()
  return {
    statusCode: 200,
    isBase64Encoded: true,
    headers: {
      'Content-type': 'application/pdf'
    },
    body: pdfBuffer.toString('base64')
  }
}

// module.exports.generate = middy(handler)
//   .use(httpHeaderNormalizer())
//   .use(cors())
//   .use(doNotWaitForEmptyEventLoop())
//   .use(httpErrorHandler())
