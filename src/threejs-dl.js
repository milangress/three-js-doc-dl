import { PlaywrightCrawler, Configuration, Dataset, log } from 'crawlee';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { URL } from 'url';


const config = {
    startUrls: ['https://threejs.org/docs/index.html'],
    basePathOrGlobs: ['https://threejs.org/docs/'],
    projectDir: 'threejs-docs',
    overwriteProjectDir: true,
    maxRequestsPerCrawl: undefined, // Set to undefined to crawl all pages
    waitForTimeout: 3000,
};

const createGlobs = paths => paths.map(p => p.includes('*') ? p : `${p.endsWith('/') ? p : `${p}/`}**`);
const globs = createGlobs(config.basePathOrGlobs);
console.log(globs);

function sanitizeFolderName(name) {
    return name
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    //should not stop or start with a dash
    .replace(/^[-_]/g, '')
    .replace(/[-_]$/g, '')
    //multiple dashes should be reduced to one
    .replace(/[-_]{2,}/g, '-')
    .toLowerCase();
}

function escapeString(str) {
    return str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

function matchesBaseUrl(url, baseUrl) {
    const urlObj = new URL(url);
    return url.startsWith(baseUrl);
}

function generateFolderStructure(url, baseUrl) {
    const urlObj = new URL(url);
    let path = urlObj.pathname;
    if (urlObj.hash) {
        path += urlObj.hash.replace('#', '-');
    }
    return path.split('/').filter(Boolean).map(sanitizeFolderName).join('/');
}

const crawler = new PlaywrightCrawler({
    // Use a configuration object for better control
    requestHandler: async ({ request, page, enqueueLinks, log }) => {
        await page.waitForTimeout(config.waitForTimeout);

        const title = await page.title();
        log.info(`Processing: ${title}`);

        const body = await page.frame("viewer").evaluate(() => document.body.outerHTML);
        const mockHtml = `<!DOCTYPE html><html><head><title>${title}</title></head><body>${body}</body></html>`.replace(/"/g, '/"');
        const escapedTitle = escapeString(title);

        await Dataset.pushData({
            title,
            url: request.loadedUrl,
            mockHtml,
            escapedTitle
        });

        await enqueueLinks({
            globs: globs,
            strategy: 'same-domain'
        });
        // const queueWasAlreadyHandled = queueRequests.processedRequests.filter(request => request.wasAlreadyHandled);
        // const queueAlreadyPresent = queueRequests.processedRequests.filter(request => request.wasAlreadyPresent);
        // const queueNew = queueRequests.processedRequests.filter(request => !request.wasAlreadyPresent && !request.wasAlreadyHandled);
        // const queueToDo = queueRequests.processedRequests.filter(request => !request.wasAlreadyHandled);
        // log.info(`Queued links: ${queueRequests.processedRequests.length} (+${queueRequests.unprocessedRequests.length}) `);
        // log.info(`Queue was already handled: ${queueWasAlreadyHandled.length}`);
        // log.info(`Queue already present: ${queueAlreadyPresent.length}`);
        // log.info(`Queue new: ${queueNew.length}`);
        // log.info(`Queue to do: ${queueToDo.map(request => request.uniqueKey).join('\n')}`);
    },
    maxRequestsPerCrawl: config.maxRequestsPerCrawl,
}, new Configuration({
    persistStorage: false,
}));

log.info('Starting the crawl.');
await crawler.run(config.startUrls);

log.info('Crawl finished. Processing data...');



const data = await Dataset.getData();

//log properties of data Object (not items)
console.log(Object.keys(data), Object.keys(data.items[0]), 'lenght: ', data.items.length);

if (!config.overwriteProjectDir) {
    let i = 0;
    let baseDir = config.projectDir;
    while (fs.existsSync(config.projectDir)) {
        const match = baseDir.match(/^(.*?)(-\d+)?$/);
        if (match) {
            baseDir = match[1];
        }
        config.projectDir = `${baseDir}-${i}`;
        i++;
    }
} else {
    fs.existsSync(config.projectDir) && fs.rmSync(config.projectDir, { recursive: true });
}

!fs.existsSync(config.projectDir) && fs.mkdirSync(config.projectDir, { recursive: true });

const filePaths = data.items.map(item => {
    const matchingBaseUrl = config.basePathOrGlobs.find(baseUrl => matchesBaseUrl(item.url, baseUrl));
    if (!matchingBaseUrl) {
        console.log('No matching base URL for', item.url);
        return null;
    }

    const baseFolderName = sanitizeFolderName(matchingBaseUrl);
    const relativeStructure = generateFolderStructure(item.url, matchingBaseUrl);
    const fullPath = path.join(config.projectDir, baseFolderName, relativeStructure);

    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    const fileName = `${escapeString(path.basename(fullPath) || 'index')}.html`;
    const filePath = path.join(path.dirname(fullPath), fileName);
    fs.writeFileSync(filePath, item.mockHtml);

    return {
        filepath: filePath,
        relativePath: path.join(baseFolderName, relativeStructure, fileName).replace(/\\/g, '/'),
        ...item
    };
}).filter(Boolean);

log.info('Generated file paths:', filePaths.map(item => item.filepath));

const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>ThreeJS Docs and Examples</title>
    <meta name="viewport" content="width=device-width">
    <link rel="shortcut icon" href="../files/favicon_white.ico" media="(prefers-color-scheme: dark)">
    <link rel="shortcut icon" href="../files/favicon.ico" media="(prefers-color-scheme: light)">
    <link rel="stylesheet" type="text/css" href="../files/main.css">
</head>
<body>
<h1>ThreeJS Docs and Examples</h1>
<nav>
<ul>
${filePaths.map(item => `<li><a href="${item.relativePath}">${item.title}</a></li>`).join('')}
</ul>
</nav>
</body>
</html>`;

fs.writeFileSync(path.join(config.projectDir, 'index.html'), indexHtml);
log.info("Index file created successfully.");