const https = require('https');
https.get('https://aptiskey.com/reading_question2.html', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const scripts = data.match(/<script[^>]+src="([^">]+)"/g);
    console.log(scripts);
  });
});
