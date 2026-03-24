# -*- coding: utf-8 -*-
"""
安装命令说明：
pip install playwright
playwright install chromium
"""

import asyncio
import os
import re
import csv
from playwright.async_api import async_playwright


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


async def main():
    # 创建输出目录
    output_dir = 'akachan_images'
    os.makedirs(output_dir, exist_ok=True)

    # CSV 文件路径
    csv_file = 'items.csv'

    print("[*] Starting to download akachan.jp icons from main page...")
    print(f"[.] Output directory: {output_dir}")
    print(f"[.] CSV file: {csv_file}\n")

    all_items = []

    async with async_playwright() as p:
        # 启动浏览器（headless=False 以便查看过程）
        browser = await p.chromium.launch(
            headless=False,
            slow_mo=500
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
            await asyncio.sleep(3)

            # 使用 JavaScript 提取所有图片和文字
            print("\n[*] Extracting images and text...")

            items_data = await page.evaluate('''
              async () => {
                const items = [];

                // 查找所有 img 标签
                const images = document.querySelectorAll('img');

                images.forEach((img, index) => {
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
                      let parent = img.closest('div, li, dt, dd, figure, a, span');
                      if (parent) {
                        // 查找包含文字的子元素
                        const textElements = parent.querySelectorAll('h1, h2, h3, h4, h5, p, span, dt, dd, strong, b, div');

                        for (let elem of textElements) {
                          const content = elem.textContent?.trim();
                          if (content && content.length > 0 && content.length < 200 && content !== img.alt) {
                            // 排除常见的无关文本
                            if (!content.includes('必要') && !content.includes('あれば便利') &&
                                !content.includes('アカチャンホンポ') && !content.includes('赤ちゃん本舗')) {
                              text = content;
                              break;
                            }
                          }
                        }
                      }
                    }

                    // 方法3: 查找相邻的文本元素
                    if (!text) {
                      // 查找前面的元素
                      let prev = img.previousElementSibling;
                      let attempts = 0;
                      while (prev && attempts < 5) {
                        const content = prev.textContent?.trim();
                        if (content && content.length > 0 && content.length < 200) {
                          if (!content.includes('必要') && !content.includes('あれば便利')) {
                            text = content;
                            break;
                          }
                        }
                        prev = prev.previousElementSibling;
                        attempts++;
                      }
                    }

                    // 方法4: 使用图片文件名
                    if (!text) {
                      const filename = src.split('/').pop();
                      text = filename.replace('.gif', '').replace('.png', '').split('?')[0];
                    }

                    if (text) {
                      items.push({
                        text: text,
                        url: src
                      });
                    }
                  }
                });

                return items;
              }
            ''')

            print(f"[OK] Found {len(items_data)} images")

            # 处理并去重
            seen_urls = set()
            for item in items_data:
                url = item['url']
                if url not in seen_urls:
                    seen_urls.add(url)

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
                        'url': url,
                        'filename': filename
                    })

            print(f"\n[*] Total unique items: {len(all_items)}")

            # 下载图片
            if all_items:
                print(f"\n[*] Starting download {len(all_items)} images...")

                downloaded = 0
                failed = 0

                for i, item in enumerate(all_items, 1):
                    filepath = os.path.join(output_dir, item['filename'])

                    try:
                        # 使用 playwright 的下载功能
                        response = await page.goto(item['url'], timeout=30000)
                        if response and response.status == 200:
                            # 保存图片
                            buffer = await response.body()
                            with open(filepath, 'wb') as f:
                                f.write(buffer)
                            downloaded += 1
                            print(f"  [{i}/{len(all_items)}] [OK] Downloaded: {item['filename']}")
                        else:
                            failed += 1
                            print(f"  [{i}/{len(all_items)}] [X] Failed: {item['filename']}")
                    except Exception as e:
                        failed += 1
                        print(f"  [{i}/{len(all_items)}] [X] Error downloading {item['filename']}: {e}")

                    # 添加小延时避免过快请求
                    if i % 10 == 0:
                        await asyncio.sleep(0.5)

                print(f"\n[OK] Downloaded: {downloaded}/{len(all_items)}")
                print(f"[X] Failed: {failed}/{len(all_items)}")

            # 保存 CSV 文件
            if all_items:
                csv_path = os.path.join(output_dir, csv_file)
                with open(csv_path, 'w', newline='', encoding='utf-8') as f:
                    writer = csv.writer(f)
                    writer.writerow(['Japanese Name', 'Image URL', 'Filename'])

                    for item in all_items:
                        writer.writerow([item['text'], item['url'], item['filename']])

                print(f"\n[OK] CSV file saved: {csv_path}")

            print("\n[OK] Processing completed!")
            print(f"[.] Output directory: {output_dir}")
            print(f"[.] Total items: {len(all_items)}")

        except Exception as e:
            print(f"\n[X] Error occurred: {e}")
            import traceback
            traceback.print_exc()

        finally:
            await browser.close()


if __name__ == '__main__':
    print("=" * 60)
    print("  akachan.jp Main Page Icon Downloader")
    print("=" * 60)
    print()

    asyncio.run(main())
