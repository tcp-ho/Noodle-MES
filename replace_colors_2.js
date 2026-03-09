import fs from 'fs';
import path from 'path';

const dir = 'src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Page.tsx'));

const colorMap = {
  '#448C11': '#1A1D24', // Green -> Dark Navy
  '#465902': '#1A1D24', // Dark Green -> Dark Navy
  'bg-blue-600': 'bg-red-700',
  'bg-blue-700': 'bg-red-800',
  'bg-blue-500': 'bg-red-600',
  'bg-blue-100': 'bg-red-100',
  'bg-blue-50': 'bg-red-50',
  'text-blue-600': 'text-red-700',
  'text-blue-700': 'text-red-800',
  'text-blue-500': 'text-red-600',
  'border-blue-200': 'border-red-200',
  'border-blue-500': 'border-red-500',
  'bg-orange-500': 'bg-amber-600',
  'bg-orange-600': 'bg-amber-700',
  'bg-orange-100': 'bg-amber-100',
  'bg-orange-50': 'bg-amber-50',
  'text-orange-500': 'text-amber-600',
  'text-orange-600': 'text-amber-700',
  'bg-green-500': 'bg-emerald-600',
  'bg-green-600': 'bg-emerald-700',
  'bg-green-100': 'bg-emerald-100',
  'bg-green-50': 'bg-emerald-50',
  'text-green-500': 'text-emerald-600',
  'text-green-600': 'text-emerald-700',
  'bg-purple-100': 'bg-slate-100',
  'bg-purple-50': 'bg-slate-50',
  'text-purple-600': 'text-slate-700',
  'bg-pink-100': 'bg-slate-100',
  'bg-pink-50': 'bg-slate-50',
  'text-pink-600': 'text-slate-700',
};

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace colors
  for (const [oldColor, newColor] of Object.entries(colorMap)) {
    // Case insensitive replacement for hex codes
    if (oldColor.startsWith('#')) {
      const regex = new RegExp(oldColor, 'gi');
      content = content.replace(regex, newColor);
    } else {
      // For tailwind classes, use global replace
      content = content.split(oldColor).join(newColor);
    }
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated colors in ${file}`);
});
