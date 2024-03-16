const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs/promises');
require('dotenv').config();

const FILE_NAME = 'test.txt'

const base_url = process.env.BASE_URL;
const novel_url = `${base_url}/novel/290862.html`;

async function getStartAndEndLinks() {
    const response = await axios.get(novel_url)
    const html = response.data;
    const $ = cheerio.load(html);

    const startElement = $('div.readlink').children()
        .filter(function() {
            return $(this).text() === '开始阅读';
        });
    const lastElement = $('div.book_last dl dd').last().find('a');
    return [startElement?.attr('href'), lastElement?.attr('href')];
}

function getNumFromUrl(url) {
    // /novel/290862/1.html
    const fileNameRegex = /\/([^/]+)\.[^.]+$/;
    let fileNameWithoutExtension = '';
    const matches = url.match(fileNameRegex);
    if (matches) {
        fileNameWithoutExtension = matches[1];
    } else {
        console.log('未找到文件名');
    }
    return Number(fileNameWithoutExtension);
}

function getURLArray(startHref, lastHref) {
    const [startNum, lastNum] = [getNumFromUrl(startHref), getNumFromUrl(lastHref)];
    const path_url = startHref.split('/').slice(0, -1).join('/');
    let urlArray = [];
    for (let i = startNum; i <= lastNum; i++) {
        let tmp = `${base_url}${path_url}/${i}.html`;
        urlArray.push(tmp);
    }
    return urlArray;
}

async function fetchData(url) {
    const instance = axios.create({
        timeout: 5000, // 设置请求超时时间（单位：毫秒）
      });
    // 发送请求并实现请求重试
    async function sendRequestWithRetry(url, maxRetries = 3) {
        let retries = 0;
    
        while (retries < maxRetries) {
            try {
                const response = await instance.get(url);
                return response; // 请求成功，结束函数
            } catch (error) {
                if (error.response && error.response.status === 429) {
                    console.log('请求过多，正在等待重试...', url);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    retries++;
                } else {
                console.error('请求失败:', error.message);
                return;
                }
            }
        }
        console.error('重试次数超过限制');
    }

    const response = await sendRequestWithRetry(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const chaptercontent = $('div#chaptercontent').html();
    const textWithLineBreak = chaptercontent.replace(/<br\s*\/?>/g, '\n');
    return textWithLineBreak;
}


async function writeIntoFile(urlArray) {
    for (const url of urlArray) {
        let text = await fetchData(url);
        await fs.appendFile(FILE_NAME, text);
    }
}

async function main() {
    try {
        const [startHref, lastHref] = await getStartAndEndLinks();
        const urlArray = getURLArray(startHref, lastHref);
        await writeIntoFile(urlArray);
    } catch (error) {
        console.log(error);
    }
}

main();