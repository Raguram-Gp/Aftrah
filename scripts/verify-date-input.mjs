import assert from 'node:assert';

// Import from the ts file
import {
  autoFormatDateInput,
  parseAndNormalizeDate,
  isValidDate,
  isValidCalendarDate,
  formatToDDMMYYYY,
  formatToDDMMYYYYDash,
  formatToYYYYMMDD,
  getTodayDDMMYYYY
} from '../src/components/afrah-app/components/DateInput.tsx';

console.log('--- Running DateInput Unit & Integration Tests ---');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}:`, err.message);
    failed++;
  }
}

// 1. Typing & autoFormatDateInput tests
test('autoFormatDateInput: 1 digit should NOT prepend 0 or add slash', () => {
  assert.strictEqual(autoFormatDateInput('4'), '4');
  assert.strictEqual(autoFormatDateInput('1'), '1');
  assert.strictEqual(autoFormatDateInput('9'), '9');
});

test('autoFormatDateInput: 2 digits should append slash', () => {
  assert.strictEqual(autoFormatDateInput('20'), '20/');
  assert.strictEqual(autoFormatDateInput('04'), '04/');
  assert.strictEqual(autoFormatDateInput('31'), '31/');
});

test('autoFormatDateInput: should NOT clamp day while typing', () => {
  assert.strictEqual(autoFormatDateInput('35'), '35/');
  assert.strictEqual(autoFormatDateInput('99'), '99/');
});

test('autoFormatDateInput: 3 digits should NOT prepend 0 or add second slash', () => {
  assert.strictEqual(autoFormatDateInput('200'), '20/0');
  assert.strictEqual(autoFormatDateInput('201'), '20/1');
  assert.strictEqual(autoFormatDateInput('209'), '20/9');
});

test('autoFormatDateInput: 4 digits should append second slash', () => {
  assert.strictEqual(autoFormatDateInput('2002'), '20/02/');
  assert.strictEqual(autoFormatDateInput('2012'), '20/12/');
});

test('autoFormatDateInput: should NOT clamp month while typing', () => {
  assert.strictEqual(autoFormatDateInput('2013'), '20/13/');
  assert.strictEqual(autoFormatDateInput('2099'), '20/99/');
});

test('autoFormatDateInput: 5 to 8 digits for year', () => {
  assert.strictEqual(autoFormatDateInput('20022'), '20/02/2');
  assert.strictEqual(autoFormatDateInput('200220'), '20/02/20');
  assert.strictEqual(autoFormatDateInput('2002202'), '20/02/202');
  assert.strictEqual(autoFormatDateInput('20022026'), '20/02/2026');
});

test('autoFormatDateInput: caps at 8 digits', () => {
  assert.strictEqual(autoFormatDateInput('200220269999'), '20/02/2026');
});

test('autoFormatDateInput: preserves shortcuts during typing', () => {
  assert.strictEqual(autoFormatDateInput('t'), 't');
  assert.strictEqual(autoFormatDateInput('to'), 'to');
  assert.strictEqual(autoFormatDateInput('today'), 'today');
  assert.strictEqual(autoFormatDateInput('TODAY'), 'TODAY');
});

test('autoFormatDateInput: converts ISO string directly', () => {
  assert.strictEqual(autoFormatDateInput('2026-09-11'), '11/09/2026');
});

// 2. Calendar Validity & Leap Years
test('isValidCalendarDate: handles standard dates and leap years correctly', () => {
  assert.strictEqual(isValidCalendarDate(2024, 2, 29), true, '2024 is a leap year');
  assert.strictEqual(isValidCalendarDate(2025, 2, 29), false, '2025 is not a leap year');
  assert.strictEqual(isValidCalendarDate(2026, 4, 30), true, 'April has 30 days');
  assert.strictEqual(isValidCalendarDate(2026, 4, 31), false, 'April does not have 31 days');
  assert.strictEqual(isValidCalendarDate(2026, 12, 31), true, 'December has 31 days');
});

// 3. Shorthand expansion & parseAndNormalizeDate
test('parseAndNormalizeDate: "t" and "today" expand to current date', () => {
  const resT = parseAndNormalizeDate('t');
  assert.strictEqual(resT.isValid, true);
  assert.strictEqual(resT.displayStr, getTodayDDMMYYYY());

  const resToday = parseAndNormalizeDate('today');
  assert.strictEqual(resToday.isValid, true);
  assert.strictEqual(resToday.displayStr, getTodayDDMMYYYY());
});

test('parseAndNormalizeDate: 6-digit expands YY to 4-digit year', () => {
  const res1 = parseAndNormalizeDate('110926');
  assert.strictEqual(res1.isValid, true);
  assert.strictEqual(res1.displayStr, '11/09/2026');
  assert.strictEqual(res1.isoStr, '2026-09-11');

  const res2 = parseAndNormalizeDate('150898');
  assert.strictEqual(res2.isValid, true);
  assert.strictEqual(res2.displayStr, '15/08/1998');
  assert.strictEqual(res2.isoStr, '1998-08-15');
});

test('parseAndNormalizeDate: 8-digit expands to DD/MM/YYYY', () => {
  const res = parseAndNormalizeDate('11092026');
  assert.strictEqual(res.isValid, true);
  assert.strictEqual(res.displayStr, '11/09/2026');
  assert.strictEqual(res.isoStr, '2026-09-11');
});

test('parseAndNormalizeDate: delimited DMY and single-digit components', () => {
  const res1 = parseAndNormalizeDate('1/9/2026');
  assert.strictEqual(res1.isValid, true);
  assert.strictEqual(res1.displayStr, '01/09/2026');
  assert.strictEqual(res1.isoStr, '2026-09-01');

  const res2 = parseAndNormalizeDate('11-09-26');
  assert.strictEqual(res2.isValid, true);
  assert.strictEqual(res2.displayStr, '11/09/2026');

  const res3 = parseAndNormalizeDate('11.09.2026');
  assert.strictEqual(res3.isValid, true);
  assert.strictEqual(res3.displayStr, '11/09/2026');
});

test('parseAndNormalizeDate: ISO string parsing', () => {
  const res = parseAndNormalizeDate('2026-09-11');
  assert.strictEqual(res.isValid, true);
  assert.strictEqual(res.displayStr, '11/09/2026');
  assert.strictEqual(res.isoStr, '2026-09-11');
});

test('parseAndNormalizeDate: minDate and maxDate bounds', () => {
  const resBeforeMin = parseAndNormalizeDate('10/09/2026', '2026-09-15', undefined);
  assert.strictEqual(resBeforeMin.isValid, false);
  assert.strictEqual(resBeforeMin.error, 'min');

  const resAfterMax = parseAndNormalizeDate('20/09/2026', undefined, '2026-09-15');
  assert.strictEqual(resAfterMax.isValid, false);
  assert.strictEqual(resAfterMax.error, 'max');

  const resWithin = parseAndNormalizeDate('15/09/2026', '2026-09-10', '2026-09-20');
  assert.strictEqual(resWithin.isValid, true);
  assert.strictEqual(resWithin.error, undefined);
});

// 4. isValidDate helper
test('isValidDate: returns true for valid calendar dates, false otherwise', () => {
  assert.strictEqual(isValidDate('20/02/2026'), true);
  assert.strictEqual(isValidDate('2026-02-20'), true);
  assert.strictEqual(isValidDate('35/02/2026'), false);
  assert.strictEqual(isValidDate('20/13/2026'), false);
  assert.strictEqual(isValidDate('29/02/2025'), false);
  assert.strictEqual(isValidDate('29/02/2024'), true);
  assert.strictEqual(isValidDate('30/02/2024'), false);
  assert.strictEqual(isValidDate('31/04/2026'), false);
  assert.strictEqual(isValidDate('30/04/2026'), true);
  assert.strictEqual(isValidDate('31/12/2026'), true);
  assert.strictEqual(isValidDate('110926'), true);
  assert.strictEqual(isValidDate('today'), true);
  assert.strictEqual(isValidDate('  t  '), true);
});

// 5. formatToDDMMYYYY, formatToYYYYMMDD, formatToDDMMYYYYDash
test('format helpers', () => {
  assert.strictEqual(formatToDDMMYYYY('2026-09-11'), '11/09/2026');
  assert.strictEqual(formatToYYYYMMDD('11/09/2026'), '2026-09-11');
  assert.strictEqual(formatToDDMMYYYYDash('2026-09-11'), '11-09-2026');
  assert.strictEqual(formatToDDMMYYYYDash('11/09/2026'), '11-09-2026');
  assert.strictEqual(formatToDDMMYYYY('110926'), '11/09/2026');
  assert.strictEqual(formatToYYYYMMDD('110926'), '2026-09-11');
});

// 6. Caret calculation algorithm verification
function computeCaretPos(rawVal, cursorPos) {
  const digitsBeforeCursor = rawVal.slice(0, cursorPos).replace(/\D/g, '').length;
  const formatted = autoFormatDateInput(rawVal);
  let newCursorPos = 0;
  let digitsSeen = 0;

  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) {
      digitsSeen++;
      if (digitsSeen === digitsBeforeCursor) {
        if (i + 1 < formatted.length && formatted[i + 1] === '/') {
          newCursorPos = i + 2;
        } else {
          newCursorPos = i + 1;
        }
        break;
      }
    }
  }

  if (digitsBeforeCursor === 0) {
    newCursorPos = 0;
  } else if (digitsSeen < digitsBeforeCursor) {
    newCursorPos = formatted.length;
  }
  return { formatted, newCursorPos };
}

test('Caret calculation: typing at end moves caret forward past slashes', () => {
  // Type '2'
  assert.deepStrictEqual(computeCaretPos('2', 1), { formatted: '2', newCursorPos: 1 });
  // Type '0' -> '20/' -> caret placed after slash at pos 3
  assert.deepStrictEqual(computeCaretPos('20', 2), { formatted: '20/', newCursorPos: 3 });
  // Type '0' -> '20/0' -> caret at pos 4
  assert.deepStrictEqual(computeCaretPos('20/0', 4), { formatted: '20/0', newCursorPos: 4 });
  // Type '2' -> '20/02/' -> caret placed after slash at pos 6
  assert.deepStrictEqual(computeCaretPos('20/02', 5), { formatted: '20/02/', newCursorPos: 6 });
  // Type '2' -> '20/02/2' -> caret at pos 7
  assert.deepStrictEqual(computeCaretPos('20/02/2', 7), { formatted: '20/02/2', newCursorPos: 7 });
  // Complete 2026
  assert.deepStrictEqual(computeCaretPos('20/02/2026', 10), { formatted: '20/02/2026', newCursorPos: 10 });
});

test('Caret calculation: middle-of-string year editing maintains stable caret', () => {
  // Suppose user has 20/02/2026 and cursor is between 20 and 26 (index 8), deletes '0'
  // rawVal becomes 20/02/226 with cursor at 7
  const res = computeCaretPos('20/02/226', 7);
  assert.strictEqual(res.newCursorPos, 7);
  assert.strictEqual(res.formatted, '20/02/226');
});

test('Caret calculation: middle-of-string month editing replaces digit without snapping to end', () => {
  // User highlights month '02' in 20/02/2026 and types '11'
  const res = computeCaretPos('20/11/2026', 5);
  assert.strictEqual(res.newCursorPos, 6); // after month slash
  assert.strictEqual(res.formatted, '20/11/2026');
});

// 7. Backspace across delimiters simulation
function simulateBackspace(text, selectionStart) {
  if (selectionStart === 3 && text[2] === '/') {
    const before = text.slice(0, 1);
    const after = text.slice(3);
    const newText = before + after;
    const formatted = autoFormatDateInput(newText);
    return { text: formatted, pos: 1 };
  }
  if (selectionStart === 6 && text[5] === '/') {
    const before = text.slice(0, 4);
    const after = text.slice(6);
    const newText = before + after;
    const formatted = autoFormatDateInput(newText);
    return { text: formatted, pos: 4 };
  }
  return null;
}

test('Backspace across delimiters: cleanly deletes preceding digit without format trap', () => {
  // Backspacing from '20/|' at pos 3 deletes '0' and slash, leaving '2' with caret at 1
  const step1 = simulateBackspace('20/', 3);
  assert.deepStrictEqual(step1, { text: '2', pos: 1 });

  // Backspacing from '20/02/|' at pos 6 deletes '2' and slash, leaving '20/0' with caret at 4
  const step2 = simulateBackspace('20/02/', 6);
  assert.deepStrictEqual(step2, { text: '20/0', pos: 4 });
});

console.log(`\nTests completed: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  process.exit(1);
}
