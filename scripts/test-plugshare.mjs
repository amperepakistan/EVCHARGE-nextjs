import puppeteer from 'puppeteer';
import fs from 'node:fs';

(async () => {
  console.log('Testing PlugShare region call with count=500...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Visit main page for CF cookies
  await page.goto('https://www.plugshare.com/location/856120', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  await page.setExtraHTTPHeaders({
    'Authorization': 'Basic d2ViX3YyOkVOanNuUE54NHhXeHVkODU=',
    'Accept': 'application/json, text/plain, */*'
  });

  async function fetchJson(url) {
    try {
      const response = await page.goto(url, { waitUntil: 'networkidle2' });
      if (response && response.ok()) {
        const text = await page.evaluate(() => document.body.innerText);
        return JSON.parse(text);
      } else {
        console.error(`Fetch failed for ${url}: status ${response ? response.status() : 'no response'}`);
        return null;
      }
    } catch (err) {
      console.error(`Error fetching ${url}:`, err.message);
      return null;
    }
  }

  // Test Karachi region with count=500
  const regionUrl = 'https://api.plugshare.com/v3/locations/region?count=500&latitude=24.8607&longitude=67.0011&spanLat=0.5&spanLng=0.5';
  console.log('Fetching:', regionUrl);
  const data = await fetchJson(regionUrl);

  if (Array.isArray(data)) {
    console.log(`BINGO! Successfully retrieved ${data.length} chargers in Karachi region!`);
    console.log('First 5 items preview:');
    data.slice(0, 5).forEach(loc => console.log(` - ID ${loc.id}: ${loc.name} (${loc.latitude}, ${loc.longitude})`));
    fs.writeFileSync('scripts/output/plugshare-raw-karachi.json', JSON.stringify(data, null, 2));
  } else {
    console.log('Result:', data);
  }

  await browser.close();
})();
