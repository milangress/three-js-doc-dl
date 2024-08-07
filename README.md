# Web Crawl Doc AI

## Overview

Web Crawl Doc AI is a versatile website crawler and content extractor designed to crawl websites and save the content as markdown files. This tool is particularly useful for creating AI-friendly (embeddable) documentation from existing web content.

## Features

- Crawl websites starting from a specified URL
- Extract content using Readability
- Convert HTML content to Markdown
- Save crawled content as HTML and/or Markdown files
- Configurable crawl parameters
- Command-line interface for easy use

## Installation

To install the package globally, run:

```bash
npm install -g @milangress/web-crawl-doc-ai
```

## NPX (recommended)
Alternatively, you can use npx to run the package.
This allows you to use the latest version of the package without installing it globally.

```bash
npx @milangress/web-crawl-doc-ai crawl <startUrl> [options]
#eg:
npx @milangress/web-crawl-doc-ai crawl https://threejs.org/docs/ --format=markdown
```

## Usage

### As a CLI tool

The primary way to use this tool is through the command line interface:

```bash
web-crawl crawl <startUrl> [options]
```

Options:
- '--format': Output format (markdown, html, or both) (default: markdown)
- '--skipPaths': Array of path fragments to skip during crawling
- '--basePathOrGlobs': Base paths or globs for crawling (default: startUrl)
- '--projectDir': Directory to save crawled data (default: hostname of startUrl)
- '--overwriteProjectDir': Overwrite project directory if it exists (default: true)
- '--maxRequestsPerCrawl': Maximum number of requests per crawl
- '--waitForTimeout': Timeout to wait for each page load (default: 3000ms)

Example:
```bash
web-crawl crawl https://example.com --format=markdown --skipPaths=/blog /news
```
