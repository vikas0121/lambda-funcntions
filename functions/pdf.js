const middy = require('middy');
const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const { cors, doNotWaitForEmptyEventLoop, httpHeaderNormalizer, httpErrorHandler } = require('middy/middlewares');

module.exports.generatePdf = async event => {

  const data = JSON.parse(event.body)

  const { htmlString, options } = data
  const { format = 'A4', margin = { top: 5 }, printBackground = true } = options

  const browser = await puppeteer.launch()
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
