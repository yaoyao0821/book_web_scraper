# A web scraper for personal use, designed for online books

This is a personal-use web scraper designed for online books. We fetch the main book page to get the total page number of books and then create URLs for each chapter/page based on that. Then we fetch the book content chapter by chapter using the URL we created and write it into a local TXT file. In the end, we can get a local book file.
## Environment
Node 16
## Start
npm ci && npm run start
## Note
It's very easy to get a 429 request error due to a large amount of requests. Thus we use retry to maintain the stability of the code.
