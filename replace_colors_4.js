import fs from 'fs';
import path from 'path';

const dir = 'src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Page.tsx'));

const colorMap = {
  'text-blue-800': 'text-red-800',
  'text-blue-400': 'text-red-400',
  'text-cyan-700': 'text-slate-700',
  'text-orange-800': 'text-amber-800',
  'text-orange-400': 'text-amber-400',
  'text-orange-100': 'text-amber-100',
  'text-purple-800': 'text-slate-800',
  'text-purple-700': 'text-slate-700',
  'text-pink-800': 'text-slate-800',
  'text-pink-700': 'text-slate-700',
  'text-green-800': 'text-emerald-800',
  'text-green-400': 'text-emerald-400',
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
