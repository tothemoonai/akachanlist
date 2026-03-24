# -*- coding: utf-8 -*-
"""
安装命令说明：
pip install playwright
playwright install chromium

或者使用 poetry：
poetry add playwright
poetry run playwright install chromium
"""

import asyncio
import os
import re
import csv
import random
from urllib.parse import urlparse, urljoin
from playwright.async_api import async_playwright
import aiohttp
import aiofiles


async def download_image(session, url, filepath):
    """下载单张图片"""
    try:
        async with session.get(url) as response:
            if response.status == 200:
                content = await response.read()
                async with aiofiles.open(filepath, 'wb') as f:
                    await f.write(content)
                return True
    except Exception as e:
        print(f"  [X] Download failed {url}: {e}")
    return False


async def download_images_batch(urls_to_download, output_dir):
    """批量下载图片"""
    connector = aiohttp.TCPConnector(limit=10)  # 限制并发连接数
    async with aiohttp.ClientSession(connector=connector) as session:
        tasks = []
        for url, filename in urls_to_download:
            filepath = os.path.join(output_dir, filename)
            if not os.path.exists(filepath):
                task = download_image(session, url, filepath)
                tasks.append((task, url, filename))
            else:
                print(f"  [->] Skip existing: {filename}")

        # 并发下载
        downloaded = 0
        for task, url, filename in tasks:
            success = await task
            if success:
                downloaded += 1
                print(f"  [OK] Downloaded: {filename}")
            else:
                print(f"  [X] Failed: {filename}")

        return downloaded


def sanitize_filename(text, max_length=50):
    """清理文件名，移除特殊字符并限制长度"""
    # 移除或替换特殊字符
    text = re.sub(r'[<>:"/\\|?*]', '', text)
    text = text.strip()

    # 限制长度
    if len(text) > max_length:
        text = text[:max_length]

    # 如果为空，使用默认名称
    if not text:
        text = 'unnamed'

    return text


async def extract_images_and_text(page):
    """从页面中提取图片和对应的文字"""
    items = []

    # 使用 JavaScript 直接提取所有信息
    items_data = await page.evaluate('''
      () => {
        const items = [];

        // 查找所有 img 标签
        const images = document.querySelectorAll('img');

        images.forEach(img => {
          const src = img.src;

          // 只处理包含 junbilist/img 的 gif/png 图片
          if (src && src.includes('junbilist/img') && (src.endsWith('.gif') || src.endsWith('.png'))) {
            let text = '';

            // 方法1: 检查 alt 属性
            if (img.alt) {
              text = img.alt.trim();
            }

            // 方法2: 查找父元素中的文本
            if (!text) {
              let parent = img.closest('div, li, dt, dd, figure, a');
              if (parent) {
                // 查找包含文字的子元素
                const textElements = parent.querySelectorAll('h1, h2, h3, h4, h5, p, span, dt, dd, strong, b');

                for (let elem of textElements) {
                  const content = elem.textContent?.trim();
                  if (content && content.length > 0 && content.length < 100 && content !== img.alt) {
                    text = content;
                    break;
                  }
                }

                // 如果还没找到，取父元素的第一个文本节点
                if (!text) {
                  for (let node of parent.childNodes) {
                    if (node.nodeType === Node.TEXT_NODE) {
                      const content = node.textContent?.trim();
                      if (content && content.length > 0 && content.length < 100) {
                        text = content;
                        break;
                      }
                    }
                  }
                }
              }
            }

            // 方法3: 使用图片文件名
            if (!text) {
              const filename = src.split('/').pop();
              text = filename.replace('.gif', '').replace('.png', '').split('?')[0];
            }

            if (text) {
              items.push({
                text: text,
                url: src,
                cleanUrl: src.split('?')[0]
              });
            }
          }
        });

        return items;
      }
    ''')

    # 转换为字典格式
    for item in items_data:
        items.append({
            'text': item['text'],
            'url': item['url'],
            'clean_url': item['cleanUrl']
        })

    return items


async def process_subpage(page, url, output_dir, all_items):
    """处理单个子页面"""
    try:
        print(f"\n[*] Visiting subpage: {url}")
        await page.goto(url, wait_until='networkidle', timeout=30000)

        # 等待页面加载
        await asyncio.sleep(random.uniform(1, 3))

        # 提取图片和文字
        items = await extract_images_and_text(page)

        print(f"  [+] Found {len(items)} products")

        # 添加到总列表
        for item in items:
            # 生成文件名
            base_name = sanitize_filename(item['text'])
            filename = f"{base_name}.gif"

            # 检查文件名是否已存在，如果存在则添加数字后缀
            counter = 1
            original_filename = filename
            while any(existing_item['filename'] == filename for existing_item in all_items):
                name_without_ext = original_filename.replace('.gif', '')
                filename = f"{name_without_ext}_{counter}.gif"
                counter += 1

            all_items.append({
                'text': item['text'],
                'url': item['url'],
                'filename': filename
            })

    except Exception as e:
        print(f"  [X] Failed to process subpage {url}: {e}")


async def main():
    # 创建输出目录
    output_dir = 'akachan_images'
    os.makedirs(output_dir, exist_ok=True)

    # CSV 文件路径
    csv_file = 'items.csv'

    print("[*] Starting to download akachan.jp icons...")
    print(f"[.] Output directory: {output_dir}")
    print(f"[.] CSV file: {csv_file}\n")

    all_items = []

    async with async_playwright() as p:
        # 启动浏览器（headless=False 以便查看过程）
        browser = await p.chromium.launch(
            headless=False,
            slow_mo=500  # 慢速模式，便于观察
        )

        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )

        page = await context.new_page()

        try:
            # 访问主页面
            print("[*] Visiting main page...")
            await page.goto('https://www.akachan.jp/junbilist/childbirth/', wait_until='networkidle', timeout=30000)

            print("[OK] Main page loaded")

            # 等待页面完全加载
            await asyncio.sleep(2)

            # 查找所有包含「もっと見る」的链接
            print("\n[*] Looking for 'more' links...")

            more_links = await page.query_selector_all('a:has-text("もっと見る")')

            if not more_links:
                # 尝试其他选择器
                more_links = await page.query_selector_all('a[href*="/products?junbilist_id="]')

            print(f"[OK] Found {len(more_links)} subpage links")

            # 提取所有链接的 URL
            subpage_urls = []
            for link in more_links:
                try:
                    href = await link.get_attribute('href')
                    if href:
                        # 转换为完整 URL
                        full_url = urljoin('https://www.akachan.jp/', href)
                        if full_url not in subpage_urls:
                            subpage_urls.append(full_url)
                except Exception as e:
                    print(f"  [!] Extract link failed: {e}")
                    continue

            print(f"[*] Subpages to process: {len(subpage_urls)}")

            # 如果没有找到「もっと見る」链接，直接处理当前页面
            if not subpage_urls:
                print("\n[!] No subpage links found, processing current page...")
                await process_subpage(page, page.url, output_dir, all_items)
            else:
                # 处理每个子页面
                for i, url in enumerate(subpage_urls, 1):
                    print(f"\n[{i}/{len(subpage_urls)}] Processing subpage...")
                    await process_subpage(page, url, output_dir, all_items)

                    # 随机延时，避免被封
                    if i < len(subpage_urls):
                        delay = random.uniform(1, 3)
                        print(f"[.] Waiting {delay:.1f} seconds...")
                        await asyncio.sleep(delay)

            print(f"\n[*] Total products found: {len(all_items)}")

            # 下载图片
            if all_items:
                print(f"\n[*] Starting download {len(all_items)} images...")

                urls_to_download = [(item['url'], item['filename']) for item in all_items]
                downloaded = await download_images_batch(urls_to_download, output_dir)

                print(f"\n[OK] Downloaded {downloaded}/{len(all_items)} images")

            # 保存 CSV 文件
            if all_items:
                csv_path = os.path.join(output_dir, csv_file)
                async with aiofiles.open(csv_path, 'w', newline='', encoding='utf-8') as f:
                    writer = csv.writer(f)
                    writer.writerow(['Japanese Name', 'Image URL', 'Filename'])

                    for item in all_items:
                        writer.writerow([item['text'], item['url'], item['filename']])

                print(f"\n[OK] CSV file saved: {csv_path}")

            print("\n[OK] Processing completed!")
            print(f"[.] Output directory: {output_dir}")
            print(f"[.] Total products: {len(all_items)}")

        except Exception as e:
            print(f"\n[X] Error occurred: {e}")
            import traceback
            traceback.print_exc()

        finally:
            await browser.close()


if __name__ == '__main__':
    print("=" * 60)
    print("  akachan.jp Icon Downloader")
    print("=" * 60)
    print()

    asyncio.run(main())
