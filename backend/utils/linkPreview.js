const axios = require('axios');
const cheerio = require('cheerio');

async function fetchLinkPreview(url) {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    const html = response.data;
    const $ = cheerio.load(html);
    
    const title = $('meta[property="og:title"]').attr('content') || $('title').text() || url;
    const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
    const image = $('meta[property="og:image"]').attr('content') || '';
    const domain = new URL(url).hostname;
    
    return { title, description, image, domain, url };
  } catch (err) {
    return { title: url, description: 'Aperçu non disponible', image: '', domain: new URL(url).hostname, url };
  }
}

module.exports = { fetchLinkPreview };