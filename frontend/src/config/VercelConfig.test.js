const fs = require('fs');
const path = require('path');

const vercelConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../vercel.json'), 'utf8')
);

describe('frontend Vercel config', () => {
  test('routes API calls to the self-hosted Levinet backend instead of Render', () => {
    const rewrites = vercelConfig.rewrites || [];
    const apiRewrite = rewrites.find((rewrite) => rewrite.source === '/api/:path*');

    expect(apiRewrite).toBeDefined();
    expect(apiRewrite.destination).toBe('https://api-academielevinet.mybotia.com/api/:path*');
    expect(JSON.stringify(vercelConfig)).not.toContain('onrender.com');
  });
});
