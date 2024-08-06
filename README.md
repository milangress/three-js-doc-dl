# Website Crawler

A general-purpose website crawler and saver.

## Installation

```bash
npm install -g website-crawler
```

## Usage

### As a CLI tool

```bash
website-crawler crawl <startUrl> [options]
```

Options:
- `--basePathOrGlobs`: Base paths or globs for crawling (default: startUrl)
- `--projectDir`: Directory to save crawled data (default: 'crawled-website')
- `--overwriteProjectDir`: Overwrite project directory if it exists (default: true)
- `--maxRequestsPerCrawl`: Maximum number of requests per crawl
- `--waitForTimeout`: Timeout to wait for each page load (default: 3000)

Example:
```bash
website-crawler crawl https://example.com --projectDir my-crawl --maxRequestsPerCrawl 100
```

## License

MIT