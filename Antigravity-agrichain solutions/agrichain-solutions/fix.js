const fs = require('fs');
const path = 'src/app/page.tsx';

let buffer = fs.readFileSync(path);

// Check for UTF-8 BOM (EF BB BF)
let hasBOM = false;
if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
  hasBOM = true;
  buffer = buffer.slice(3);
}

// Assume the buffer is double-encoded UTF-8: original UTF-8 bytes were interpreted as Latin-1 and then re-encoded as UTF-8.
// To recover: treat buffer as UTF-8 string (gives us Latin-1 string), then encode that string as Latin-1 to get bytes, then decode those bytes as UTF-8.
let str = buffer.toString('utf-8'); // This interprets the bytes as UTF-8, giving us a string where each original Latin-1 character is now a Unicode character.
let latin1Bytes = Buffer.from(str, 'latin1'); // Encode the string as Latin-1 (ISO-8859-1) bytes.
let recovered = latin1Bytes.toString('utf-8'); // Decode those bytes as UTF-8 to get the original string.

if (hasBOM) {
  // Re-add the BOM
  recovered = '﻿' + recovered;
}

fs.writeFileSync(path, recovered, 'utf-8');
console.log('Fixed encoding');