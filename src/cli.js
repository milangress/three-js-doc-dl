#!/usr/bin/env node

import crawlWebsite from './main.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

yargs(hideBin(process.argv))
    .command('crawl <startUrl>', 'Crawl a website', (yargs) => {
        return yargs
            .positional('startUrl', {
                describe: 'The starting URL to crawl',
                type: 'string'
            })
            .option('format', {
                describe: 'Format of the output [markdown, html]',
                type: 'string',
                default: 'markdown'
            })
            .option('skipPaths', {
                describe: 'Skip paths that include these strings',
                type: 'array',
                default: []
            })
            .option('basePathOrGlobs', {
                describe: 'Base paths or globs for crawling',
                type: 'array',
                default: []
            })
            .option('projectDir', {
                describe: 'Directory to save crawled data',
                type: 'string',
                default: undefined
            })
            .option('overwriteProjectDir', {
                describe: 'Overwrite project directory if it exists',
                type: 'boolean',
                default: true
            })
            .option('maxRequestsPerCrawl', {
                describe: 'Maximum number of requests per crawl',
                type: 'number',
                default: undefined
            })
            .option('waitForTimeout', {
                describe: 'Timeout to wait for each page load',
                type: 'number',
                default: 3000
            });
    }, async (argv) => {
        try {
            await crawlWebsite({
                startUrls: [argv.startUrl],
                basePathOrGlobs: argv.basePathOrGlobs.length ? argv.basePathOrGlobs : [argv.startUrl],
                projectDir: argv.projectDir,
                overwriteProjectDir: argv.overwriteProjectDir,
                maxRequestsPerCrawl: argv.maxRequestsPerCrawl,
                waitForTimeout: argv.waitForTimeout,
                skipPathIncludes: argv.skipPaths,
                format: argv.format
            });
        } catch (error) {
            console.error('Error during crawl:', error);
            process.exit(1);
        }
    })
    .help()
    .argv;