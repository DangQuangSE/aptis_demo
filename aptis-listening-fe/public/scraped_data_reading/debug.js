const fs = require('fs');

async function check() {
  const res = await fetch('https://aptiskey.com/js/reading_question/reading_question2.js');
  const text = await res.text();
  const lines = text.split('\n');
  console.log("Lines 545 to 575:");
  for (let i = 545; i <= 575; i++) {
    console.log(`${i}: ${lines[i]}`);
  }
}
check();
