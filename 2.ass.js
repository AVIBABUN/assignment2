const puppeteer = require('puppeteer');
const fs = require('fs');
const csv = require('csv-parser');

// Function to perform web crawling
async function webCrawler(params) {
  const primaryCategory = params['Primary Category'] || '';
  const secondaryCategory = params['Secondary Category'] || '';
  const geography = params['Geography'] || '';
  const dateRange = params['Date Range'] || '';

  // Construct the search query based on parameters
  const searchQuery = `${primaryCategory} ${secondaryCategory} ${geography} ${dateRange}`;

  // Launch a headless browser using puppeteer
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Perform a Google search to find URLs matching the query
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
  await page.goto(googleUrl);

  // Extract and filter URLs from search results
  const urls = await page.evaluate(() => {
    const results = Array.from(document.querySelectorAll('.tF2Cxc a'));
    return results.map(result => result.href);
  });

  // Close the browser
  await browser.close();

  return urls;
}

// Main function
async function main() {
  // Example input JSON object
  const inputParams = {
    'Primary Category': 'Medical Journal',
    'Secondary Category': 'Orthopedic',
    'Geography': 'India',
    'Date Range': '2022'
  };

  // Perform web crawling
  const urls = await webCrawler(inputParams);

  // Write the results to a CSV file
  const csvData = [];
  urls.forEach(url => {
    csvData.push({ URL: url });
  });

  fs.writeFileSync('crawler_results.csv', '', 'utf-8'); // Create an empty CSV file
  fs.writeFileSync('crawler_results.csv', 'URL\n', 'utf-8'); // Write CSV header
  csvData.forEach(data => {
    fs.appendFileSync('crawler_results.csv', `${data.URL}\n`, 'utf-8'); // Append URLs to the CSV file
  });

  console.log('Crawling completed. URLs saved to crawler_results.csv');
}

main();
