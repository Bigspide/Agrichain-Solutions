const fs = require('fs');
const path = 'src/app/page.tsx';

let content = fs.readFileSync(path, 'utf-8');

// Replace copyright
content = content.replaceAll('?? 2024 AgriChain Solutions.', '© 2024 AgriChain Solutions.');

// Replace the Made with line
content = content.replaceAll(
  'Made with <span className="text-red-500">??</span> in C??te d&apos;Ivoire <span>????</span>',
  'Made with <span className="text-red-500">❤</span> in Côte d&apos;Ivoire <span>🇨🇮</span>'
);

fs.writeFileSync(path, content, 'utf-8');
console.log('Fixed footer');