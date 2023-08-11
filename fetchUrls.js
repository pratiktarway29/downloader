const fs = require('fs');
const cheerio = require('cheerio');
const axios = require('axios');

async function fetchPages() {
    const baseUrl = 'insetBaseUrl';
    const startPage = 1;
    const endPage = 100;
    const outputFile = 'output.txt';
    const urlsSet = new Set();
    const urlsSet2 = new Set();

    for (let page = startPage; page <= endPage; page++) {
        const url = `${baseUrl}${page}/`;

        try {
            const response = await axios.get(url);
            const content = response.data;

            const $ = cheerio.load(content);

            $('a').each((index, element) => {
                const href = $(element).attr('href');
                if (href && href.startsWith('urlPrefix')) {
                    urlsSet.add(href);
                }
            });

            console.log(`Processed page ${page}`);
        } catch (error) {
            console.error(`Error fetching page ${page}:`, error.message);
        }
    }

    const urlsArray = [...urlsSet];

    for (let i = 0; i < urlsArray.length; i++) {
        const url = urlsArray[i];

        try {
            const response = await axios.get(url);
            const content = response.data;

            const $ = cheerio.load(content);

            $('a').each((index, element) => {
                const href = $(element).attr('href');
                if (href && href.startsWith('downloadLinkPrefix')) {
                    urlsSet2.add(href);
                }
            });

            console.log(`Completed ${i} / ${urlsArray.length}`);
        } catch (error) {
            console.error(`Error fetching URL ${url}:`, error.message);
        }
    }

    const urlsArray2 = [...urlsSet2];

    urlsArray2.forEach((url, index) => {
        const line = `${url}\n`;
        fs.appendFileSync(outputFile, line, 'utf-8');
    });
}

fetchPages().catch(error => {
    console.error('An error occurred:', error);
});
