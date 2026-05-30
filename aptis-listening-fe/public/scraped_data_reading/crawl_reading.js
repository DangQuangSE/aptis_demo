const fs = require('fs');
const path = require('path');
const vm = require('vm');

const baseDir = __dirname;
const outputDir = baseDir;

async function fetchScript(url) {
  console.log(`Fetching: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return await response.text();
}

function cleanAndEvaluate(code, exposeVars) {
  let cleanCode = code;

  // Let's strip the specific DOMContentLoaded wrapper lines
  // These are very specific line patterns at the top and bottom of the files.
  
  // Replace the opening DOMContentLoaded wrapper
  cleanCode = cleanCode.replace(/document\.addEventListener\(\s*['"]DOMContentLoaded['"]\s*,\s*function\s*\(\s*\)\s*\{/, '');

  // Strip the matching closing brace at the bottom.
  // It is usually the last non-whitespace characters in the file: }); or }
  cleanCode = cleanCode.trim();
  if (cleanCode.endsWith('});')) {
    cleanCode = cleanCode.slice(0, -3);
  } else if (cleanCode.endsWith('}')) {
    cleanCode = cleanCode.slice(0, -1);
  } else if (cleanCode.endsWith('});\r\n') || cleanCode.endsWith('});\n')) {
    cleanCode = cleanCode.replace(/\}\);\s*$/, '');
  }

  // To make sure all the target variables are exposed to the sandbox global context,
  // we replace "const varName =" with "varName =" so that they become properties of the global object.
  exposeVars.forEach(v => {
    // Regex matches: declaration keyword (const, let, var) followed by variable name and assignment sign
    const regex = new RegExp(`\\b(?:const|let|var)\\s+(${v})\\s*=`, 'g');
    cleanCode = cleanCode.replace(regex, '$1 =');
  });

  // Mock a complete browser environment inside our sandbox so that all scripts execute
  // without any reference errors.
  const mockElement = {
    addEventListener: () => {},
    appendChild: () => {},
    querySelectorAll: () => [],
    querySelector: () => null,
    classList: { add: () => {}, remove: () => {} },
    setAttribute: () => {},
    style: {},
    innerText: '',
    innerHTML: '',
    textContent: '',
  };

  const mockDoc = {
    addEventListener: () => {},
    getElementById: () => mockElement,
    getElementsByClassName: () => [],
    querySelectorAll: () => [],
    querySelector: () => mockElement,
    createElement: () => mockElement,
    body: mockElement,
  };

  const mockWin = {
    onload: null,
    location: { href: '', search: '', hash: '' },
    addEventListener: () => {},
    document: mockDoc,
    localStorage: { getItem: () => null, setItem: () => {} },
    sessionStorage: { getItem: () => null, setItem: () => {} },
  };

  const sandbox = {
    document: mockDoc,
    window: mockWin,
    console: console,
    setTimeout: setTimeout,
    setInterval: () => {},
    Sortable: class { constructor() {} },
    Event: class { constructor() {} },
  };

  // Run the code in the sandbox context
  const context = vm.createContext(sandbox);
  try {
    vm.runInContext(cleanCode, context);
  } catch (err) {
    console.error("Evaluation error:", err);
  }

  // Extract the exposed variables
  const results = {};
  exposeVars.forEach(v => {
    results[v] = sandbox[v];
  });
  return results;
}

async function scrapePart1() {
  const code = await fetchScript('https://aptiskey.com/js/reading_question/reading_question1.js');
  const allVars = ['questionsArrays'];
  for (let i = 1; i <= 13; i++) {
    allVars.push(`questions1_${i}`);
  }
  const result = cleanAndEvaluate(code, allVars);
  const questionsArrays = result['questionsArrays'];

  if (!questionsArrays || questionsArrays.length === 0) {
    throw new Error("Failed to extract questionsArrays for Part 1");
  }

  const part1Data = questionsArrays.map((topicArray, index) => {
    const topicId = index + 1;
    return {
      topicId,
      title: `Topic: Sentence Comprehension ${topicId}`,
      instructions: "Choose the word that fits in the gap. The first one is done for you.",
      questions: topicArray.map((q, qIndex) => {
        return {
          id: `p1_q${qIndex + 1}`,
          text: `${q.questionStart} [blank] ${q.questionEnd}`,
          options: q.answerOptions.filter(Boolean),
          correctAnswer: q.correctAnswer
        };
      })
    };
  });

  return part1Data;
}

async function scrapePart2() {
  const code = await fetchScript('https://aptiskey.com/js/reading_question/reading_question2.js');
  const allVars = ['questionSets', 'questheader'];
  for (let i = 1; i <= 39; i++) {
    allVars.push(`question2Content_${i}`);
  }
  const result = cleanAndEvaluate(code, allVars);
  const questionSets = result['questionSets'];
  const questheader = result['questheader'];

  if (!questionSets || questionSets.length === 0) {
    throw new Error("Failed to extract questionSets for Part 2");
  }

  const part2Data = questionSets.map((sentencesList, index) => {
    const topicId = index + 1;
    const title = questheader && questheader[index] ? `Topic: ${questheader[index]}` : `Topic: Text Cohesion ${topicId}`;
    
    const originalSentences = sentencesList.map((text, idx) => ({
      id: `s${idx + 1}`,
      text: text
    }));

    // Deterministic consistent ordering for display sentences
    const sentences = [...originalSentences];
    sentences.sort((a, b) => {
      const charA = a.text.charCodeAt(1) || 0;
      const charB = b.text.charCodeAt(1) || 0;
      return charA - charB;
    });

    return {
      topicId,
      title,
      instructions: "Put the sentences below in the right order. The first sentence is done for you.",
      sentences,
      correctOrder: originalSentences.map(s => s.id)
    };
  });

  return part2Data;
}

async function scrapePart3() {
  const code = await fetchScript('https://aptiskey.com/js/reading_question/reading_question4.js');
  const allVars = ['question4Text', 'question4Content', 'correctAnswersQuestion4', 'question4Topic'];
  for (let i = 1; i <= 14; i++) {
    allVars.push(`question4Text_${i}`);
    allVars.push(`question4Content_${i}`);
    allVars.push(`correctAnswersQuestion4_${i}`);
  }
  
  const result = cleanAndEvaluate(code, allVars);
  const question4Text = result['question4Text'];
  const question4Content = result['question4Content'];
  const correctAnswersQuestion4 = result['correctAnswersQuestion4'];
  const question4Topic = result['question4Topic'];

  if (!question4Text || question4Text.length === 0) {
    throw new Error("Failed to extract question4Text for Part 3");
  }

  const part3Data = question4Text.map((textArray, index) => {
    const topicId = index + 1;
    const title = question4Topic && question4Topic[index] ? `Topic: ${question4Topic[index]}` : `Topic: Short Text Matching ${topicId}`;
    
    const cleanText = textArray
      .filter(t => t.includes('<strong>A:</strong>') || t.includes('<strong>B:</strong>') || t.includes('<strong>C:</strong>') || t.includes('<strong>D:</strong>') || t.startsWith('A:') || t.startsWith('B:') || t.startsWith('C:') || t.startsWith('D:'))
      .map(t => t.replace(/<\/?strong>/g, ''))
      .join('\n\n');

    const questionsList = question4Content[index];
    const correctAnswers = correctAnswersQuestion4[index];

    return {
      topicId,
      title,
      instructions: "Here is the perspective of four people on the above topic. Please read the content and answer the question.",
      text: cleanText,
      questions: questionsList.map((q, qIdx) => {
        return {
          id: q.id,
          text: q.question,
          options: ["A", "B", "C", "D"],
          correctAnswer: correctAnswers[qIdx] || q.answer
        };
      })
    };
  });

  return part3Data;
}

async function scrapePart4() {
  const code = await fetchScript('https://aptiskey.com/js/reading_question/reading_question5.js');
  const allVars = ['options', 'paragraph_question5', 'topic_name'];
  for (let i = 1; i <= 11; i++) {
    allVars.push(`options_${i}`);
    allVars.push(`paragraph_question5_${i}`);
  }
  
  const result = cleanAndEvaluate(code, allVars);
  const optionsList = result['options'];
  const paragraphsList = result['paragraph_question5'];
  const topicName = result['topic_name'];

  if (!optionsList || optionsList.length === 0) {
    throw new Error("Failed to extract options List for Part 4");
  }

  const part4Data = optionsList.map((opts, index) => {
    const topicId = index + 1;
    const titleKey = `topic_${topicId}`;
    const title = topicName && topicName[titleKey] ? `Topic: ${topicName[titleKey]}` : `Topic: Long Text Comprehension ${topicId}`;

    const paras = paragraphsList[index] || [];
    const paragraphs = paras.map((pText, pIdx) => ({
      id: `p4_para${pIdx + 1}`,
      text: pText
    }));

    const headings = opts
      .map((hText, hIdx) => {
        if (!hText) return null;
        return {
          id: `h${hIdx}`,
          text: hText
        };
      })
      .filter(Boolean);

    const correctAnswers = {};
    paragraphs.forEach((p, pIdx) => {
      correctAnswers[p.id] = `h${pIdx + 1}`;
    });

    return {
      topicId,
      title,
      instructions: "Match the headings to the correct paragraphs.",
      paragraphs,
      headings,
      correctAnswers
    };
  });

  return part4Data;
}

async function run() {
  try {
    console.log("Starting scraping of Aptis Reading questions...");
    
    const part1 = await scrapePart1();
    console.log(`Part 1 scraped successfully: ${part1.length} topics`);

    const part2 = await scrapePart2();
    console.log(`Part 2 scraped successfully: ${part2.length} topics`);

    const part3 = await scrapePart3();
    console.log(`Part 3 scraped successfully: ${part3.length} topics`);

    const part4 = await scrapePart4();
    console.log(`Part 4 scraped successfully: ${part4.length} topics`);

    // Write individual part files
    fs.writeFileSync(path.join(outputDir, 'reading_part1.json'), JSON.stringify(part1, null, 2), 'utf-8');
    fs.writeFileSync(path.join(outputDir, 'reading_part2.json'), JSON.stringify(part2, null, 2), 'utf-8');
    fs.writeFileSync(path.join(outputDir, 'reading_part3.json'), JSON.stringify(part3, null, 2), 'utf-8');
    fs.writeFileSync(path.join(outputDir, 'reading_part4.json'), JSON.stringify(part4, null, 2), 'utf-8');

    // Write the unified reading_all.json
    const allData = {
      part1,
      part2,
      part3,
      part4
    };
    fs.writeFileSync(path.join(outputDir, 'reading_all.json'), JSON.stringify(allData, null, 2), 'utf-8');

    console.log("All data successfully crawled and saved!");
  } catch (err) {
    console.error("Crawling failed:", err);
    process.exit(1);
  }
}

run();
