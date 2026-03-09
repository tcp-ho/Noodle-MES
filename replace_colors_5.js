import fs from 'fs';
import path from 'path';

const dir = 'src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Page.tsx'));

const colorMap = {
  'border-blue-300': 'border-red-300',
  'border-blue-400': 'border-red-400',
  'border-blue-100': 'border-red-100',
  'border-orange-200': 'border-amber-200',
  'border-pink-200': 'border-slate-200',
  'border-purple-200': 'border-slate-200',
  'border-pink-400': 'border-slate-400',
  'border-purple-500': 'border-slate-500',
  'border-green-200': 'border-emerald-200',
  'border-green-600': 'border-emerald-600',
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
