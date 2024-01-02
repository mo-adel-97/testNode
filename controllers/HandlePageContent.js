const axios = require('axios');
const cheerio = require('cheerio');
const zlib = require('zlib');
const puppeteer = require('puppeteer');
const GetWebInformatio = require('./handleErrorPage')
const urlParser = require('url'); // Import the url package
async function scrapeWebsite(req, res) {

  const url = req.query.url;

  try {
    const startTime = new Date(); 

    const decodedUrl = decodeURIComponent(url);
    const response = await axios.get(decodedUrl);
    const html = response.data;
    const $ = cheerio.load(html);

    const endTime = new Date(); // Measure the end time
    const pageLoadTimeMilliseconds = endTime - startTime;
    const pageLoadTimeSeconds = (pageLoadTimeMilliseconds / 1000).toFixed(2);

    const doctypeDeclarationNode = $.root().contents().filter((index, node) => node.nodeType === 8)[0];
    const doctypeDeclaration = doctypeDeclarationNode?.dat

    console.log("doctypeDeclaration doctypeDeclaration doctypeDeclaration",doctypeDeclaration)

    let websiteInfoIp = null;
    let websiteInfoCountry = null;
    let websiteInfoOrganization = null;

    //obtain ip server and provider and country 
    try {
       const websiteInfo = await  GetWebInformatio.getWebsiteInformation(url);
       websiteInfoIp = websiteInfo.ip
       websiteInfoCountry = websiteInfo.country 
       websiteInfoOrganization = websiteInfo.organization
          // Now you can access properties like url, ipAddress, location, organization from websiteInfo
      console.log('IP:', websiteInfo.ip);
      console.log('country:', websiteInfo.country);
      console.log('Organization:', websiteInfo.organization);
    } catch (error) {
      console.error('Error:', error.message);
    }

        // Check for Google Analytics script
        const hasGoogleAnalytics = $('script[src*="google-analytics.com/analytics.js"]').length > 0;

        // Check for Matomo (Piwik) script
        const hasMatomo = $('script[src*="matomo.js"]').length > 0;
   
        const CheckAnaylstics = hasGoogleAnalytics || hasMatomo ;

        console.log("CheckAnaylstics CheckAnaylstics CheckAnaylstics CheckAnaylstics",CheckAnaylstics)

        // Capture screenshot using Puppeteer
        const browser = await puppeteer.launch({
          headless: 'new'
        });
        const page = await browser.newPage();
        await page.goto(decodedUrl);
        const screenshotBuffer = await page.screenshot();
        await browser.close();

        const screenShoot = screenshotBuffer.toString('base64')
let screenShootPhone = null ;
        try {
          // Capture screenshot using Puppeteer with mobile viewport
          const browser = await puppeteer.launch({ headless: 'new' });
          const pagePhone = await browser.newPage();
        
          // Emulate a mobile device
          await pagePhone.setViewport({
            width: 375, // iPhone 6/7/8 viewport width
            height: 667, // iPhone 6/7/8 viewport height
            isMobile: true,
            hasTouch: true,
            deviceScaleFactor: 2,
          });
        
          await pagePhone.goto(decodedUrl);
          const screenshotBufferMobile = await pagePhone.screenshot();  // Fix: Use pagePhone instead of page
          await browser.close();  // Fix: Close the browser, not browserPhone
        
          screenShootPhone = screenshotBufferMobile.toString('base64');
        } catch (err) {
          console.log("Error when extracting screenShoot", err);
        }

    // Check if the language is declared
    const langAttribute = $('html').attr('lang');
    const languageDeclared = langAttribute ? `جيد ، لقد أعلنت لغتك\nاللغة المعلنة: ${langAttribute}` : 'لم يتم الإعلان عن لغة';

    let CheckPage404 = false
    const nonExistentPageUrl =`${url}/no-existed-page`;
    try {
     // Append a non-existent page path
  
      const nonExistentPageResponse = await axios.get(nonExistentPageUrl);
  console.log("nonExistentPageResponse",nonExistentPageResponse)
      // Check if the response status code is 404
      if (nonExistentPageResponse.status === 404) {
        console.log("There is a custom 404 error page.");
        CheckPage404 = true

      } else if (hasCustom404Content(nonExistentPageResponse.data)) {
        console.log("There is a custom 404 error page.");
        CheckPage404 = true
      } else {
        console.log("There is no custom 404 error page.");
        CheckPage404 = false

      }
    } catch (nonExistentError) {
      console.error('Error checking non-existent page:', nonExistentError.message);
      if (nonExistentError.message.includes('404')){
         console.log("ther are page error 404")
         CheckPage404 = true
      }
    }
  
  function hasCustom404Content(htmlContent) {
    const $ = cheerio.load(htmlContent);
    const title = $('title').text().trim();
  
    return title.toLowerCase().includes('404');
  }


 // Parse the URL
const parsedUrl = urlParser.parse(url);

// Extract the domain name without the top-level domain
let domain = parsedUrl.hostname || '';
domain = domain.replace(/^www\./, ''); // Remove "www" subdomain if present
const domainName = domain.replace(/\..*$/, '');

const domainLength = domainName.length;

console.log("domainLength", domainLength);

      // Extract the favicon URL
    let faviconUrl = null;
    $('head link[rel="icon"]').each((index, element) => {
      const iconLink = $(element).attr('href');
      if (iconLink) {
        const parsedUrl = urlParser.parse(decodedUrl);
        faviconUrl = urlParser.resolve(parsedUrl.protocol + '//' + parsedUrl.host, iconLink);
        return false; // Exit the loop after finding the first favicon
      }
    });

    console.log('Favicon:', faviconUrl ? 'Exists' : 'Does not exist');

    // check site map urls or not in the targe website .........
    const sitemapUrl = new URL('/sitemap.xml', url);
  let UrlForSiteMap = null;
  let CheckForSiteMap = false
    try {
      const response = await axios.get(sitemapUrl.toString());
      if (response.status === 200) {
        console.log("sitemapUrl.href",sitemapUrl.href)
         UrlForSiteMap = sitemapUrl.href 
        console.log(`Sitemap.xml exists for ${url}`);
         CheckForSiteMap = true
        // Perform further operations if needed
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        CheckForSiteMap = false
        console.log(`Sitemap.xml does not exist for ${url}`);
      } else {
        console.log('An error occurred while checking sitemap:', error.message);
      }
    }

let containsEmbeddedObjects = false;

// Check for embedded objects
$('object, embed, iframe').each((index, element) => {
  containsEmbeddedObjects = true;
  return false; // Stop iterating further
});

if (containsEmbeddedObjects) {
  console.log('The website contains embedded objects.');
} else {
  console.log('No embedded objects were detected on the website.');
}




        // check robot.TXT files urls or not in the targe website .........
        const robotsTxtUrl  = new URL('/robots.txt', url);
        let UrlForRobotsTxt = null;
        let CheckFoRobotsTxt = false
          try {
            const response = await axios.get(robotsTxtUrl.toString());
            if (response.status === 200) {
              console.log(robotsTxtUrl.href)
              UrlForRobotsTxt = robotsTxtUrl.href 
              console.log(`Sitemap.xml exists for ${url}`);
              CheckFoRobotsTxt = true
              // Perform further operations if needed
            }
          } catch (error) {
            if (error.response && error.response.status === 404) {
              CheckFoRobotsTxt = false
              console.log(`Sitemap.xml does not exist for ${url}`);
            } else {
              console.log('An error occurred while checking sitemap:', error.message);
            }
          }

    // Extract text content
    const textContent = $('body').text();

    // Calculate the size of the text content in bytes

    const textContentSize = Buffer.from(textContent, 'utf-8').length.toFixed(2);

    // Calculate the total size of the HTML file in bytes
    const htmlSize = Buffer.from(html, 'utf-8').length.toFixed(2);

    const htmlSizeKB = (htmlSize / 1024).toFixed(0);


    // Calculate the percentage size of the text content compared to the total size
    const textContentPercentage = ((textContentSize / htmlSize) * 100).toFixed(2);


        // Compress the HTML content using GZIP
        const compressedHtml = zlib.gzipSync(html);
    
        // Calculate the compressed size in bytes
        const compressedSize = compressedHtml.length;
    
        // Calculate the size savings percentage
        const sizeSavings = ((htmlSize - compressedSize) / htmlSize * 100).toFixed(1);
    
        // Check if GZIP compression is enabled
        const isGzipEnabled = response.headers['content-encoding'] === 'gzip';
    
        // let output = "ياه! تم تمكين GZIP.\n";
        output = `صحيح يتم ضغط صفحة الويب الخاصة بك من ${htmlSize} KB إلى ${compressedSize} KB (${sizeSavings} % size savings)`;


    // Your existing code for other content extraction
    const title = $('title').text();
    const description = $('meta[name="description"]').attr('content') || '';
    const headings = {};

    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach((heading) => {
      headings[heading] = $(heading).length;
    });

    // Rest of your existing code for headings...

    const totalHeadings = Object.values(headings).reduce((sum, count) => sum + count, 0);
    const hasH1 = headings['h1'] > 0;
    const hasH2 = headings['h2'] > 0;
    const hasH3 = headings['h3'] > 0;

    let headingAnalysis = 'to be improved';


    // Add more conditions for a nuanced analysis
    if (totalHeadings >= 3 && hasH1) {
      headingAnalysis = 'good';
    } else if (totalHeadings >= 2 && hasH1 && hasH2) {
      headingAnalysis = 'good';
    } else if (totalHeadings >= 2 && (hasH1 || hasH2 || hasH3)) {
      headingAnalysis = 'to be improved';
    } else if (totalHeadings > 0) {
      headingAnalysis = 'bad';
    } else {
      headingAnalysis = 'no headings';
    }

    // Your existing code for other content extraction
    const paragraphs = [];
    $('p').each((index, element) => {
      paragraphs.push($(element).text());
    });
    const images = [];
    let totalImages = 0;
    let imagesWithAlt = 0;

        // Extract images and count those with "alt" attribute
        $('img').each((index, element) => {
          const src = $(element).attr('src');
          const alt = $(element).attr('alt');
    
          images.push(src);
          totalImages++;
    
          if (alt) {
            imagesWithAlt++;
          }
        });
        
    // Rest of your existing code for images...

    let imagesAltAnalysis = 'bad';

    if (totalImages > 0) {
      const percentageWithAlt = (imagesWithAlt / totalImages) * 100;

      if (percentageWithAlt >= 80) {
        imagesAltAnalysis = 'good';
      } else if (percentageWithAlt >= 50 && percentageWithAlt < 80) {
        imagesAltAnalysis = 'improve';
      } else {
        imagesAltAnalysis = 'bad';
      }
    }

    const headlines = {};

    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach((heading) => {
      headlines[heading] = [];
      $(heading).each((index, element) => {
        headlines[heading].push($(element).text());
      });
    });

const urls = [];

// Extract URLs from <a> tags
$('a').each((index, element) => {
  const url = $(element).attr('href');
  if (url) {
    urls.push(url);
  }
});

// Extract URLs from <img> tags
$('img').each((index, element) => {
  const url = $(element).attr('src');
  if (url) {
    urls.push(url);
  }
});

// Clean URL detection
const cleanUrls = [];
const underscoreUrls = [];
const cleanUrlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;

urls.forEach((url) => {
  if (cleanUrlRegex.test(url)) {
    cleanUrls.push(url);
  }
  if (url.includes('_')) {
    underscoreUrls.push(url);
  }
});


// Calculate the percentage of clean URLs
const cleanUrlPercentage = (cleanUrls.length / urls.length) * 100;

// Calculate the percentage of underscore Urls
const underscoreUrlPercentage = (underscoreUrls.length / urls.length) * 100;

const CleanUrls = cleanUrlPercentage.toFixed(2)

const underscoreUrl = underscoreUrlPercentage.toFixed(2);

console.log('Percentage of clean URLs:', CleanUrls, '%');
console.log('Percentage of underscore  URLs:', underscoreUrl, '%');


    res.json({
      pageLoadTimeSeconds,
      title,
      paragraphs,
      images,
      totalImages,
      imagesWithAlt,
      imagesAltAnalysis,
      description,
      headings,
      headingAnalysis,
      headlines,
      textContentPercentage,
      textContentSize,
      htmlSize,
      output,
      sizeSavings,
      UrlForSiteMap,
      CheckForSiteMap,
      UrlForRobotsTxt,
    CheckFoRobotsTxt,
    CleanUrls,
    underscoreUrl,
    containsEmbeddedObjects,
    domainLength,
    url,
    faviconUrl,
    CheckPage404,
    nonExistentPageUrl,
    htmlSizeKB,
    languageDeclared,
    screenShoot,
    screenShootPhone,
    websiteInfoIp ,
    websiteInfoCountry,
    websiteInfoOrganization,
    CheckAnaylstics
    });

    console.log('Title:', title);
    console.log('Headings:', headings);
    console.log('Heading Analysis:', headingAnalysis);
    console.log('Paragraphs:', paragraphs);
    console.log('Images:', images);
    console.log('Total Images:', totalImages);
    console.log('Images with Alt:', imagesWithAlt);
    console.log('Images Alt Analysis:', imagesAltAnalysis);
    console.log('Description:', description);
    console.log('htmlSize',htmlSize);
    console.log('textSize',textContentSize)
    console.log('textContentPercentage',textContentPercentage)
    console.log('output',output)
    console.log('UrlForSiteMap',UrlForSiteMap)
    console.log('CheckForSiteMap',CheckForSiteMap)
    console.log('UrlForSiteMap',UrlForRobotsTxt)
    console.log('CheckForSiteMap',CheckFoRobotsTxt)
    console.log("faviconUrl",faviconUrl)
    console.log("pageLoadTimeSeconds",pageLoadTimeSeconds)
    console.log("languageDeclared",languageDeclared)
  } catch (error) {
  console.error('Error:', error);
  throw new Error('Failed to fetch website information.');
}
}

module.exports = {
  scrapeWebsite,
};
