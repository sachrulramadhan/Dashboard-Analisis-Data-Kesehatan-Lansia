const fs = require('fs');

const raw = fs.readFileSync('src/data/raw_uploaded_data.csv', 'utf-8');

// Simple CSV parser handling quotes
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

const rows = parseCSV(raw);
console.log('Total rows in CSV:', rows.length);
console.log('Row 0 cols:', rows[0].length);
for (let i = 0; i < Math.min(10, rows.length); i++) {
  console.log(`Row ${i}: Puskesmas=[${rows[i][1]}], Kel=[${rows[i][2]}], Col3=[${rows[i][3]}], Col4=[${rows[i][4]}], Col5=[${rows[i][5]}], Col6=[${rows[i][6]}]`);
}
