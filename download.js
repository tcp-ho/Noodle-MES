import fs from 'fs';
import https from 'https';

const pages = [
  'FreezerPage.tsx',
  'FreezingProductivityPage.tsx',
  'POAnalysisPage.tsx',
  'PRAnalysisPage.tsx',
  'PurchaseOrderPage.tsx',
  'PurchaseRequisitionPage.tsx',
  'SoakingPage.tsx'
];

pages.forEach(page => {
  https.get(`https://raw.githubusercontent.com/tall-ho/NOODLE-FACT/main/src/pages/${page}`, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      fs.writeFileSync(`src/components/${page}`, data);
      console.log(`Downloaded ${page}`);
    });
  });
});
