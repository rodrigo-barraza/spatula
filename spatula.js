// For more information, see https://crawlee.dev/
import { PlaywrightCrawler, Dataset } from 'crawlee';
import fs from 'fs'
import axios from 'axios';

//add javascript code to have depth for crawler to go to next page
//add javascript code to have crawler to go to next page

async function downloadImage(url, path) {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
    });
  
    const file = fs.createWriteStream(path);
    response.data.pipe(file);
    console.log(path)
    await new Promise((resolve, reject) => {
     
      file.on('finish', resolve);
      file.on('error', reject);
    });
  }


function fileformat(string) {
    const parsedString = string.toLowerCase();
    const isItJpg = parsedString.includes('jpg');
    const isItJpeg = parsedString.includes('jpeg');
    const isItPng = parsedString.includes('png');
    const isItWebm = parsedString.includes('webm'); 
    const isItGif = parsedString.includes('gif');
    const isItSvg = parsedString.includes('svg'); 
    const isItTiff = parsedString.includes('tiff');   
    const isItTif = parsedString.includes('tif');    
    if (isItJpg){
        return 'jpg';
    } else if (isItPng){
        return 'png';
    } else if (isItWebm){
        return 'webm';
    } else if (isItGif){
        return 'gif';
    } else if (isItSvg){
        return 'svg';
    } else if (isItJpeg){
        return 'jpeg';
    } else if (isItTiff){
        return 'tiff';
    }  else if (isItTif){
        return 'tif';
    } else {
        return 'jpg';
    }
}

const crawler = new PlaywrightCrawler({
    async requestHandler({ request, page, enqueueLinks, log }) {
        const title = await page.title();
        const images = await page.$$eval('img', imgs => imgs.map(img => img.src));
        const backgroundImages = await page.$$eval('*', elements => {
            return elements
                .filter(element => window.getComputedStyle(element).backgroundImage !== 'none')
                .map(element => window.getComputedStyle(element).backgroundImage.replace(/^url\("(.+)"\)$/, '$1'))
        });
        const folderPath = 'C:\\develop\\spatula\\paigesierracom';
        const allImages = images.concat(backgroundImages);

        for (const image of allImages) {
            console.log(image);
            if (!image.includes('gradient')) {
                const { width, height } = await page.evaluate(imgSrc => {
                    return new Promise(resolve => {
                        const img = new Image();
                        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
                        img.src = imgSrc;
                    });
                }, image);
                
                if (width >= 512 && height >= 512) {
                    const imagePath = image.replace(/[-_;@&+$!*/:\?=&.,#~']/g,'').replace('https','').replace('jpg','').replace('png','').replace('webm','').replace('gif','').replace('svg','').replace('jpeg','').replace('tiff','').replace('tif','');
                    const fullPath = `${folderPath}\\${imagePath}.${fileformat(image)}`;
                    if (!fs.existsSync(fullPath)) {
                        await downloadImage(image, fullPath);
                    }
                }
            }
        }

        log.info(`Title of ${request.loadedUrl} is '${title}'`);
        await Dataset.pushData({ title, url: request.loadedUrl });
        await enqueueLinks();
    },
    // headless: false,
});

await crawler.run(['https://www.paigesierra.com/',]);

