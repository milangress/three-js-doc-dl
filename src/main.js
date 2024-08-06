import { PlaywrightCrawler, Configuration, Dataset, playwrightUtils } from 'crawlee';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';
import { Readability, isProbablyReaderable } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';

const turndownService = new TurndownService();

function sanitizeFolderName(name) {
    return name
        .replace(/[^a-zA-Z0-9-_]/g, '-')
        .replace(/^[-_]/g, '')
        .replace(/[-_]$/g, '')
        .replace(/[-_]{2,}/g, '-')
        .toLowerCase();
}

function escapeString(str) {
    return str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

function matchesBaseUrl(url, baseUrl) {
    return url.startsWith(baseUrl);
}

function generateFolderStructure(url, baseUrl) {
    const urlObj = new URL(url);
    let urlPath = urlObj.pathname;
    if (urlObj.hash) {
        urlPath += urlObj.hash.replace('#', '-');
    }
    return urlPath.split('/').filter(Boolean).map(sanitizeFolderName).join('/');
}

async function crawlWebsite(config) {
    let {
        startUrls,
        basePathOrGlobs,
        projectDir,
        overwriteProjectDir = true,
        maxRequestsPerCrawl = 9,
        waitForTimeout = 3000,
    } = config;

    if (basePathOrGlobs.length === 0) {
        basePathOrGlobs = [startUrls];
    }
    if (!projectDir) {
        projectDir = new URL(startUrls[0]).hostname;
    }

    const createGlobs = paths => paths.map(p => p.includes('*') ? p : `${p.endsWith('/') ? p : `${p}/`}**`);
    const globs = createGlobs(basePathOrGlobs);

    const crawler = new PlaywrightCrawler({
        preNavigationHooks: [async (ctx, gotoOptions) => {
            gotoOptions.waitUntil = 'networkidle';
        }],
        requestHandler: async ({ request, page, enqueueLinks }) => {
            await page.waitForTimeout(waitForTimeout);

            const title = await page.title();
            console.log(`Processing: ${title}`);

            const $ = await playwrightUtils.parseWithCheerio(page,false,false);

            const removeSelectors = [
                'nav',
                'footer',
                'script',
                'style',
                'noscript',
                'svg',
                '[role="alert"]',
                '[role="banner"]',
                '[role="dialog"]',
                '[role="alertdialog"]',
                '[role="region"][aria-label*="skip" i]',
                '[aria-modal="true"]'
            ];

            removeSelectors.forEach(selector => {
                $(selector).remove();
            });

            const body = $('body').html();
            // const dom = await new JSDOM(`<body>${body}</body>`, { url: request.loadedUrl });

            // console.log(dom);
            // const reader = await new Readability(dom.window.document, {
            //     //charThreshold: 200,
            // });
    
            // const { content } = await reader.parse();

            // const reader = await page.evaluate(() => {
            //     var article = new Readability(document, {
            //         debug: true
            //     }).parse();
            //     return article;
            // });

            // console.log(reader);

            //const body = await page.evaluate(() => document.body.outerHTML);
            const mockHtml = `<!DOCTYPE html><html><head><title>${title}</title></head><body>${body}</body></html>`;

            const dom = new JSDOM(mockHtml, { url: request.loadedUrl });
            
            let markdown = '';
            let contentRead = '';
            if (isProbablyReaderable(dom.window.document)) {
                console.log('Probably readerable');
                const reader = new Readability(dom.window.document, {
                    //debug: true,
                });

                let { content } = reader.parse();
                markdown = turndownService.turndown(content);
                contentRead = content;
            } else {
                console.log('Not readerable');
                markdown = turndownService.turndown(mockHtml);
            }



            const escapedTitle = escapeString(title);

            await Dataset.pushData({
                title,
                url: request.loadedUrl,
                mockHtml,
                readability: contentRead,
                markdown,
                escapedTitle
            });

            await enqueueLinks({
                globs: globs,
            });
        },
        maxRequestsPerCrawl: maxRequestsPerCrawl,
    }, new Configuration({
        persistStorage: false,
    }));

    console.log('Starting the crawl.');
    await crawler.run(startUrls);
    console.log('Crawl finished. Processing data...');

    const data = await Dataset.getData();

    if (!overwriteProjectDir) {
        let i = 0;
        let baseDir = projectDir;
        while (fs.existsSync(projectDir)) {
            const match = baseDir.match(/^(.*?)(-\d+)?$/);
            if (match) {
                baseDir = match[1];
            }
            projectDir = `${baseDir}-${i}`;
            i++;
        }
    } else {
        fs.existsSync(projectDir) && fs.rmSync(projectDir, { recursive: true });
    }
    
    !fs.existsSync(projectDir) && fs.mkdirSync(projectDir, { recursive: true });

    const filePaths = data.items.map(item => {
        const matchingBaseUrl = basePathOrGlobs.find(baseUrl => matchesBaseUrl(item.url, baseUrl));
        if (!matchingBaseUrl) {
            console.log('No matching base URL for', item.url);
            return null;
        }

        const baseFolderName = sanitizeFolderName(matchingBaseUrl);
        const relativeStructure = generateFolderStructure(item.url, matchingBaseUrl);
        const fullPath = path.join(projectDir, baseFolderName, relativeStructure);

        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        const fileNameBase = escapeString(path.basename(fullPath) || 'index');
        const htmlFilePath = path.join(path.dirname(fullPath), `${fileNameBase}.html`);
        const markdownFilePath = path.join(path.dirname(fullPath), `${fileNameBase}.md`);

        fs.writeFileSync(htmlFilePath, item.mockHtml);
        fs.writeFileSync(markdownFilePath, item.markdown);

        return {
            filepath: htmlFilePath,
            markdownPath: markdownFilePath,
            relativePath: path.join(baseFolderName, relativeStructure, `${fileNameBase}.html`).replace(/\\/g, '/'),
            relativeMarkdownPath: path.join(baseFolderName, relativeStructure, `${fileNameBase}.md`).replace(/\\/g, '/'),
            ...item
        };
    }).filter(Boolean);

    console.log('Generated file paths:', filePaths.map(item => item.filepath));

    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Crawled Website</title>
    <meta name="viewport" content="width=device-width">
</head>
<body>
<h1>Crawled Website</h1>
<nav>
<ul>
${filePaths.map(item => `<li><a href="${item.relativePath}">${item.title}</a></li>`).join('')}
</ul>
</nav>
</body>
</html>`;

    fs.writeFileSync(path.join(projectDir, 'index.html'), indexHtml);
    console.log("Index file created successfully.");
}

export default crawlWebsite;