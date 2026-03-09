import fs from 'fs';
import path from 'path';

const dir = 'src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Page.tsx'));

const colorMap = {
  '#0D1826': '#1A1D24', // Dark Navy
  '#3981BF': '#B91C1C', // Blue -> Red
  '#F25D27': '#B91C1C', // Orange -> Red
  '#F2C849': '#D97706', // Yellow -> Gold
  '#73A2BF': '#718096', // Light Blue -> Gray
  '#F2F0E4': '#F4F3EF', // Background
  '#F9F8F4': '#F4F3EF', // Background
  '#809BBF': '#718096', // Another light blue
  '#D4AF37': '#D97706', // Gold
  '#B8860B': '#D97706', // Dark Gold
  '#3A3659': '#1A1D24', // Dark purple
  '#EA580C': '#B91C1C', // Orange
  '#05AFF2': '#B91C1C', // Bright blue
  '#E0F7FF': '#FEE2E2', // Light blue bg -> Light red bg
  '#FFF6F2': '#FEF2F2', // Light orange bg -> Light red bg
  '#F28F79': '#FCA5A5', // Light orange -> Light red
  '#D66B70': '#EF4444', // Pinkish red -> Red
  '#C3D9A3': '#BBF7D0', // Light green
  '#A66556': '#B91C1C', // Brownish red
  '#3F4859': '#4A5568', // Grayish blue
};

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace colors
  for (const [oldColor, newColor] of Object.entries(colorMap)) {
    // Case insensitive replacement for hex codes
    const regex = new RegExp(oldColor, 'gi');
    content = content.replace(regex, newColor);
  }
  
  // Also replace some specific classes if needed, but hex codes are the main thing.
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated colors in ${file}`);
});
