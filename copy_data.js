const fs = require('fs');

try {
  const inputPath = '/Users/royce_295/.gemini/antigravity-ide/brain/562edad5-27ff-4fe3-bb79-8633e89947e7/.system_generated/steps/156/output.txt';
  const outputPath = '/Users/royce_295/Documents/aptis_demo/aptis-listening-fe/public/scraped_data_writing/writing_all.json';

  const text = fs.readFileSync(inputPath, 'utf8');
  
  // Extract just the JSON part from the markdown code block
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
  
  if (jsonMatch && jsonMatch[1]) {
    fs.writeFileSync(outputPath, jsonMatch[1].trim());
    console.log('Successfully saved 40 units to writing_all.json!');
  } else {
    console.log('Could not parse the JSON from the output file.');
  }
} catch (e) {
  console.error('Error:', e);
}
