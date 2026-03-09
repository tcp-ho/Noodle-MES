import fs from 'fs';
import path from 'path';

const dir = 'src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Page.tsx'));

const colorMap = {
  'bg-blue-200': 'bg-red-200',
  'bg-orange-200': 'bg-amber-200',
  'bg-green-200': 'bg-emerald-200',
  'bg-purple-200': 'bg-slate-200',
  'bg-pink-200': 'bg-slate-200',
  'bg-green-700': 'bg-emerald-800',
  'bg-orange-700': 'bg-amber-800',
  'bg-cyan-100': 'bg-slate-100',
  'text-blue-200': 'text-red-200',
  'text-orange-200': 'text-amber-200',
  'text-green-200': 'text-emerald-200',
  'text-purple-200': 'text-slate-200',
  'text-pink-200': 'text-slate-200',
  'text-green-700': 'text-emerald-800',
  'text-orange-700': 'text-amber-800',
  'text-cyan-100': 'text-slate-100',
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
