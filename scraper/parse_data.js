const fs = require('fs');
const path = require('path');
const vm = require('vm');

function extractFile(filename) {
    let content = fs.readFileSync(path.join(__dirname, filename), 'utf8');
    
    content = content.replace(/\bconst\s+([a-zA-Z0-9_]+)\s*=/g, 'this.$1 =');
    content = content.replace(/\blet\s+([a-zA-Z0-9_]+)\s*=/g, 'this.$1 =');
    content = content.replace(/\bvar\s+([a-zA-Z0-9_]+)\s*=/g, 'this.$1 =');
    
    const sandbox = {
        console,
        Math,
        parseInt,
        isNaN,
        Sortable: function() {},
        window: { onload: null },
        document: {
            addEventListener: (event, callback) => callback(),
            getElementById: () => ({ addEventListener: () => {}, textContent: '', value: '' }),
            querySelectorAll: () => []
        }
    };
    
    vm.createContext(sandbox);
    try {
        vm.runInContext(content, sandbox);
    } catch(e) { }
    
    const result = {};
    for (const key of Object.keys(sandbox)) {
        if (key.startsWith('questions1_') || 
            key.startsWith('question2Content_') ||
            key.startsWith('question4Text_') ||
            key.startsWith('question4Content_') ||
            key.startsWith('correctAnswersQuestion4_') ||
            key.startsWith('options_') ||
            key.startsWith('paragraph_question5_')) {
            result[key] = sandbox[key];
        }
    }
    return result;
}

const c1 = extractFile('reading_question1.js');
const c2 = extractFile('reading_question2.js');
const c4 = extractFile('reading_question4.js');
const c5 = extractFile('reading_question5.js');

const allData = { ...c1, ...c2, ...c4, ...c5 };
fs.writeFileSync(path.join(__dirname, 'parsed_data.json'), JSON.stringify(allData, null, 2));
