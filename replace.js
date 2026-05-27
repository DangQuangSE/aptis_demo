const fs = require('fs');
const content = fs.readFileSync('aptis-listening-fe/src/app/page.js', 'utf8');
let newContent = content.replace(/\/\/ ── Auto Answer Logic(.*?)\];/s, '');
fs.writeFileSync('aptis-listening-fe/src/app/page.js', newContent);
