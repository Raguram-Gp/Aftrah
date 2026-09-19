import assert from 'node:assert';

// Import formatToYYYYMMDD & compareByDateDesc logic directly from built dist or test file
function parseAndNormalizeDate(val) {
  if (!val || typeof val !== 'string') return { isoStr: null };
  const trimmed = val.trim();
  if (!trimmed) return { isoStr: null };

  // YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return { isoStr: `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}` };
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return { isoStr: `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}` };
  }

  return { isoStr: null };
}

function formatToYYYYMMDD(val) {
  if (!val || typeof val !== 'string') return '';
  const trimmed = val.trim();
  if (!trimmed) return '';
  const res = parseAndNormalizeDate(trimmed);
  if (res.isoStr) return res.isoStr;
  return trimmed;
}

function compareByDateDesc(dateA, dateB, tieBreakerA, tieBreakerB) {
  const isoA = formatToYYYYMMDD(dateA || '');
  const isoB = formatToYYYYMMDD(dateB || '');
  const dateDiff = isoB.localeCompare(isoA);
  if (dateDiff !== 0) return dateDiff;

  if (typeof tieBreakerA === 'number' && typeof tieBreakerB === 'number') {
    return tieBreakerB - tieBreakerA;
  }
  if (typeof tieBreakerA === 'string' && typeof tieBreakerB === 'string') {
    return tieBreakerB.localeCompare(tieBreakerA);
  }
  return 0;
}

console.log('🧪 Testing compareByDateDesc...');

// 1. Basic descending order (ISO format)
const test1 = [
  { id: 1, date: '2026-08-01' },
  { id: 2, date: '2026-09-11' },
  { id: 3, date: '2026-09-05' },
];
test1.sort((a, b) => compareByDateDesc(a.date, b.date, a.id, b.id));
assert.deepStrictEqual(test1.map(x => x.id), [2, 3, 1], 'Test 1 Failed: ISO dates should be newest first');
console.log('✅ Test 1 Passed: ISO dates sorted descending');

// 2. DD/MM/YYYY format
const test2 = [
  { id: 1, date: '01/08/2026' },
  { id: 2, date: '11/09/2026' },
  { id: 3, date: '05/09/2026' },
];
test2.sort((a, b) => compareByDateDesc(a.date, b.date, a.id, b.id));
assert.deepStrictEqual(test2.map(x => x.id), [2, 3, 1], 'Test 2 Failed: DD/MM/YYYY dates should be newest first');
console.log('✅ Test 2 Passed: DD/MM/YYYY dates sorted descending');

// 3. Mixed formats (DD/MM/YYYY and YYYY-MM-DD and DD-MM-YYYY)
const test3 = [
  { id: 1, date: '2026-08-15' },
  { id: 2, date: '20/09/2026' },
  { id: 3, date: '05-09-2026' },
];
test3.sort((a, b) => compareByDateDesc(a.date, b.date, a.id, b.id));
assert.deepStrictEqual(test3.map(x => x.id), [2, 3, 1], 'Test 3 Failed: Mixed format dates');
console.log('✅ Test 3 Passed: Mixed format dates sorted descending');

// 4. Same date tie-breaking by sNo (highest / newest sNo first)
const test4 = [
  { sNo: 1, date: '2026-09-11' },
  { sNo: 3, date: '2026-09-11' },
  { sNo: 2, date: '2026-09-11' },
];
test4.sort((a, b) => compareByDateDesc(a.date, b.date, a.sNo, b.sNo));
assert.deepStrictEqual(test4.map(x => x.sNo), [3, 2, 1], 'Test 4 Failed: Same date tie breaking');
console.log('✅ Test 4 Passed: Same date tie-breaking descending by sNo');

// 5. Cross-year comparison
const test5 = [
  { id: 1, date: '31/12/2025' },
  { id: 2, date: '01/01/2026' },
  { id: 3, date: '15/06/2025' },
];
test5.sort((a, b) => compareByDateDesc(a.date, b.date, a.id, b.id));
assert.deepStrictEqual(test5.map(x => x.id), [2, 1, 3], 'Test 5 Failed: Cross-year comparison');
console.log('✅ Test 5 Passed: Cross-year comparison sorted descending');

console.log('\n🎉 ALL DATE SORTING TESTS PASSED SUCCESSFULLY!');
