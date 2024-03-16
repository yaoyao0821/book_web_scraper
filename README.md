# A web scraper for personal use, designed for online books

## Environment
Node 16
## Start
npm ci && npm run start
## Note
It's very easily to get a 429 request error due to large amount of requests. Thus we use retry to maintain the stability of the code.