const fs = require('fs');
const path = require('path');

const pageSource = fs.readFileSync(path.join(__dirname, 'KravMagAJLPage.js'), 'utf8');

describe('KravMagAJLPage Calameo integration', () => {
  test('uses the summer 2026 magazine embed instead of the spring 2026 issue', () => {
    expect(pageSource).toContain('KRAV MAG AJL ETE 2026');
    expect(pageSource).toContain('00804450798efd0bdcc1b');
    expect(pageSource).toContain('v.calameo.com/?bkcode=00804450798efd0bdcc1b&mode=mini');
    expect(pageSource).not.toContain('0080445076f2c125b6d0c');
    expect(pageSource).not.toContain('Printemps 2026');
  });
});
