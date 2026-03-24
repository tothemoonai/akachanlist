import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 所有113个产品图标URL
const itemIcons = [
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s01/img01.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s01/img02.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s01/img03.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s01/img04.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s01/img05.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s01/img07.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s01/img08.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s01/img09.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s01/img10.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s01/img11.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s01/img12.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s01/img13.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s01/img14.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s01/img15.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s02/img01.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s02/img02.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s02/img03.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s02/img04.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s02/img05.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s02/img07.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s02/img08.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s02/img09.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s02/img10.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s03/img02.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s03/img03.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s03/img04.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category02/img01.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category02/img02.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category02/img03.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category02/img04.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category02/img05.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category02/img06.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category03/img01.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category03/img02.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category03/img04.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category03/img06.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category03/img07.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category03/img09.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category03/img10.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category03/img11.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category03/img12.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category03/img13.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category03/img15.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category04/img01.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category04/img02.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category04/img03.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category04/img05.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category04/img06.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category04/img07.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category04/img08.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category04/img10.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category04/img11.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category04/img12.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category04/img13.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category04/img14.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category04/img15.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category04/img17.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category04/img18.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category05/img01.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category05/img02.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category05/img03.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category05/img04.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category05/img05.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category05/img06.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category05/img07.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category05/img08.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category05/img09.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category05/img10.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category05/img11.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category05/img12.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category06/img01.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category06/img06.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category06/img07.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category06/img08.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category06/img10.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category06/img11.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category06/img12.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category06/img13.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category06/img14.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category06/img15.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category06/img16.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category07/img01.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category07/img02.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category07/img03.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category07/img04.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category07/img05.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category07/img06.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category07/img07.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category07/img08.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category07/img09.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category07/img10.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category07/img11.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category07/img12.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category07/img13.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category07/img14.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category07/img15.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category08/img01.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category08/img02.gif?20240501',
  'https://www.akachan.jp/assets/dist_pages/junbilist/img/category08/img03.gif?20240501'
];

// 下载图片函数
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
        fileStream.on('error', (err) => {
          reject(err);
        });
      } else {
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

// 主函数
async function downloadAllIcons() {
  const iconsDir = path.join(process.cwd(), 'public', 'item-icons');

  // 创建目录
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  console.log(`📁 准备下载 ${itemIcons.length} 个图标到 ${iconsDir}`);

  let downloaded = 0;
  let failed = 0;

  for (let i = 0; i < itemIcons.length; i++) {
    const url = itemIcons[i];
    // 生成文件名：item-001.gif, item-002.gif, etc.
    const filename = `item-${String(i + 1).padStart(3, '0')}.gif`;
    const filepath = path.join(iconsDir, filename);

    try {
      await downloadImage(url, filepath);
      downloaded++;
      process.stdout.write(`\r✅ 已下载 ${downloaded}/${itemIcons.length}`);
    } catch (error) {
      failed++;
      console.error(`\n❌ 下载失败: ${url}`, error.message);
    }
  }

  console.log(`\n\n✨ 下载完成！`);
  console.log(`✅ 成功: ${downloaded}`);
  console.log(`❌ 失败: ${failed}`);
}

downloadAllIcons().catch(console.error);
