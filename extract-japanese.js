const fs = require('fs');
const path = require('path');

// Read the markdown file
const markdown = fs.readFileSync(
  path.join(__dirname, '.firecrawl', 'akachan-page.md'),
  'utf8'
);

// Read the Chinese structure
const chineseData = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, 'public', 'data', 'items-zh.json'),
    'utf8'
  )
);

// Extract categories and their content
const lines = markdown.split('\n');

// Build the Japanese data structure
const japaneseData = {
  meta: {
    title: "作ろう！めばえリスト",
    subtitle: "アカチャンホンポの推奨リストに基づく",
    lastUpdated: "2026-03-23"
  },
  categories: []
};

// Parse function to extract sections
let currentLine = 0;

function findLine(pattern, start = 0) {
  for (let i = start; i < lines.length; i++) {
    if (lines[i].includes(pattern)) {
      return i;
    }
  }
  return -1;
}

function extractBetween(startMarker, endMarker, startPos = 0) {
  const start = findLine(startMarker, startPos);
  if (start === -1) return null;
  const end = findLine(endMarker, start + 1);
  if (end === -1) return null;
  return lines.slice(start + 1, end).join('\n');
}

// Map main category titles
const categoryMappings = {
  'マタニティ＆ママ': 'maternity-mama',
  '赤ちゃん（0〜3ヶ月）': 'baby-0-3m',
  '赤ちゃん（3〜6ヶ月）': 'baby-3-6m',
  '外出グッズ': 'outing'
};

// Find main categories
for (const [jaTitle, catId] of Object.entries(categoryMappings)) {
  const catLine = findLine(`## ${jaTitle}`);
  if (catLine === -1) continue;

  console.log(`Found category: ${jaTitle}`);

  // Find the next main category or end
  let nextCatLine = lines.length;
  for (const nextTitle of Object.keys(categoryMappings)) {
    if (nextTitle === jaTitle) continue;
    const nextLine = findLine(`## ${nextTitle}`, catLine + 1);
    if (nextLine !== -1 && nextLine < nextCatLine) {
      nextCatLine = nextLine;
    }
  }

  const categorySection = lines.slice(catLine, nextCatLine).join('\n');

  // Extract subcategories
  const subcategoryPattern = /### ([^\n]+)/g;
  const subcategories = [];
  let subMatch;

  while ((subMatch = subcategoryPattern.exec(categorySection)) !== null) {
    const subJaTitle = subMatch[1];
    console.log(`  Found subcategory: ${subJaTitle}`);

    // Find corresponding Chinese subcategory
    const chineseCategory = chineseData.categories.find(c => c.id === catId);
    if (!chineseCategory) continue;

    const chineseSubcategory = chineseCategory.subcategories.find(sc => sc.title.includes(subJaTitle.substring(0, 2)));
    if (!chineseSubcategory) continue;

    // Extract items for this subcategory
    const subStart = subMatch.index;
    const nextSubMatch = subcategoryPattern.exec(categorySection);
    const subEnd = nextSubMatch ? nextSubMatch.index : categorySection.length;
    const subSection = categorySection.substring(subStart, subEnd);

    // Extract items
    const itemPattern = /目安数：([^\n]+)\n\n(.+?)\n(.+?)\n\nめばえリスト/gs;
    const items = [];
    let itemMatch;

    // Reset regex
    subcategoryPattern.lastIndex = 0;

    // Parse items differently - look for priority markers and item names
    const itemSections = subSection.split(/!(?:\[必要\]|\[あれば便利\])/);

    for (let i = 1; i < itemSections.length; i++) {
      const itemText = itemSections[i];
      const lines2 = itemText.split('\n').filter(l => l.trim());

      if (lines2.length < 3) continue;

      // Extract item details
      const itemNameMatch = itemText.match(/([^\n!]+)\n\n目安数：([^\n]+)/);
      if (!itemNameMatch) continue;

      const itemName = itemNameMatch[1].trim();
      const quantity = itemNameMatch[2].trim();

      // Extract description
      const descMatch = itemText.match(/!.*?\n\n(.+?)\n\n/);
      const description = descMatch ? descMatch[1].trim() : '';

      // Determine priority
      const priority = itemText.includes('![必要]') ? 'required' : 'recommended';

      items.push({
        name: itemName,
        priority,
        description,
        quantity
      });
    }

    subcategories.push({
      id: chineseSubcategory.id,
      title: subJaTitle,
      description: chineseSubcategory.description, // Keep Chinese description for now
      items
    });
  }

  const chineseCat = chineseData.categories.find(c => c.id === catId);

  japaneseData.categories.push({
    id: catId,
    title: jaTitle,
    icon: chineseCat?.icon || 'list',
    subcategories
  });
}

// Write the output
fs.writeFileSync(
  path.join(__dirname, 'public', 'data', 'items-ja.json'),
  JSON.stringify(japaneseData, null, 2),
  'utf8'
);

console.log('\n✓ Created items-ja.json');
console.log(`  Categories: ${japaneseData.categories.length}`);
