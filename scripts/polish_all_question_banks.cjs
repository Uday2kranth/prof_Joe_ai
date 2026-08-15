const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/examPrepData.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Helper to standardize unit boxes in question banks
function standardizeQuestionBankUnits(htmlStr, defaultColors = ['unit-cyan', 'unit-indigo', 'unit-pink']) {
  if (!htmlStr) return htmlStr;

  let unitIdx = 0;
  // Replace <div class="unit-box"> or <div class="unit-box"...>
  return htmlStr.replace(/<div class="unit-box"([^>]*)>\s*(?:<div class="unit-title"[^>]*>(.*?)<\/div>|<div style="[^"]*display:\s*flex[^"]*">[\s\S]*?<\/div>)/gi, (match, extraAttrs, unitTitle) => {
    const colorClass = defaultColors[unitIdx % defaultColors.length];
    const cleanTitle = (unitTitle || '').replace(/<[^>]+>/g, '').trim();
    unitIdx++;

    let badge = 'CORE CONCEPTS';
    if (/UNIT[- ]?I\b/i.test(cleanTitle)) badge = 'MODULE 1';
    else if (/UNIT[- ]?II\b/i.test(cleanTitle)) badge = 'MODULE 2';
    else if (/UNIT[- ]?III\b/i.test(cleanTitle)) badge = 'MODULE 3';

    const titleColor = colorClass === 'unit-cyan' ? '#38bdf8' : colorClass === 'unit-indigo' ? '#818cf8' : '#f472b6';

    return `<div class="unit-box ${colorClass}">
    <div class="unit-header-bar">
        <h4 class="unit-title" style="color: ${titleColor};">${cleanTitle || `UNIT - ${unitIdx}`}</h4>
        <span class="unit-badge" style="background: rgba(255, 255, 255, 0.1); color: #f8fafc;">${badge}</span>
    </div>`;
  });
}

// Polish question banks for all subjects
Object.keys(data).forEach(subjKey => {
  const subj = data[subjKey];
  if (subj['question-bank']) {
    subj['question-bank'] = standardizeQuestionBankUnits(subj['question-bank']);
  }
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully polished and standardized all question banks across all subjects!');
