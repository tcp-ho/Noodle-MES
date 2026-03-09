import fs from 'fs';
import path from 'path';

const dir = 'src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Page.tsx'));

const colorMap = {
  'ring-purple-200': 'ring-slate-200',
};

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace colors
  for (const [oldColor, newColor] of Object.entries(colorMap)) {
    // For tailwind classes, use global replace
    content = content.split(oldColor).join(newColor);
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated colors in ${file}`);
});
