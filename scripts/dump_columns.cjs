const fs = require('fs');

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  const rows = [];
  for (const line of lines) {
    const row = [];
    let insideQuote = false;
    let cell = '';
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        row.push(cell.trim());
        cell = '';
      } else {
        cell += char;
      }
    }
    row.push(cell.trim());
    rows.push(row);
  }
  return rows;
}

const raw = fs.readFileSync('src/data/raw_uploaded_data.csv', 'utf-8');
const rows = parseCSV(raw);

console.log('--- COLUMN MAP (Indices 0 to ' + (rows[0].length - 1) + ') ---');
for (let c = 0; c < rows[0].length; c++) {
  const h0 = rows[0][c] || '';
  const h1 = rows[1][c] || '';
  const h2 = rows[2][c] || '';
  const h3 = rows[3][c] || '';
  const h4 = rows[4][c] || '';
  const valSample = rows[6][c] || '';
  console.log(`${c}: [${h0} | ${h1} | ${h2} | ${h3} | ${h4}] => sample: ${valSample}`);
}
