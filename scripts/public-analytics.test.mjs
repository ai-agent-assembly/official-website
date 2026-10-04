import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import {URL} from 'node:url';
import ts from 'typescript';

function load(relative, context, dependencies = {}) {
  const source = fs.readFileSync(new URL(relative, import.meta.url), 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: {module: ts.ModuleKind.CommonJS},
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    ...context,
    exports,
    require: (name) => dependencies[name],
    URL,
  });
  return exports;
}

test('product events exclude request, identity, security and private repository values', () => {
  const canary = 'HORO1700_SYNTHETIC';
  const window = {
    location: {
      hostname: 'agent-assembly.com',
      pathname: '/',
      search: `?prompt=${canary}`,
      hash: `#${canary}`,
    },
    dataLayer: [],
  };
  const document = {
    title: 'Agent Assembly',
    querySelector: () => ({
      href: `https://agent-assembly.com/product?repo=${canary}#${canary}`,
    }),
  };
  const context = {window, document};
  const helpers = load('../src/analytics/publicPage.ts', context);
  const {trackEvent} = load('../src/analytics/trackEvent.ts', context, {
    './publicPage': helpers,
  });
  trackEvent('cta_click', {
    link_url: `https://github.com/owner/${canary}?token=${canary}`,
    prompt: canary,
    email: canary,
    security_payload: canary,
    page_path: canary,
  });
  trackEvent('cta_click', {link_url: `mailto:${canary}@example.invalid`});
  assert.equal(JSON.stringify(window.dataLayer).includes(canary), false);
  assert.equal(
    window.dataLayer[0].page_location,
    'https://agent-assembly.com/product',
  );
  assert.equal(window.dataLayer[0].link_url, 'https://github.com');
  assert.equal(window.dataLayer[1].link_url, '');
});

test('initial and SPA views use generated identity and clear private referrers', () => {
  const canary = 'HORO1700_SYNTHETIC';
  const calls = [];
  let canonical = `https://agent-assembly.com/?repo=${canary}#${canary}`;
  const window = {gtag: (...args) => calls.push(args)};
  const document = {
    referrer: `https://example.invalid/private/${canary}`,
    querySelector: () => ({href: canonical}),
  };
  const context = {window, document, setTimeout: (fn) => fn()};
  const helpers = load('../src/analytics/publicPage.ts', context);
  const {onRouteDidUpdate} = load(
    '../src/analytics/publicPageViews.ts',
    context,
    {'./publicPage': helpers},
  );
  const first = {
    pathname: '/',
    search: `?prompt=${canary}`,
    hash: `#${canary}`,
  };
  onRouteDidUpdate({location: first, previousLocation: null});
  canonical = `https://agent-assembly.com/install?repo=${canary}`;
  onRouteDidUpdate({
    location: {...first, pathname: '/install'},
    previousLocation: first,
  });
  assert.equal(calls.length, 4);
  assert.equal(calls[0][0], 'set');
  assert.equal(calls[1][1], 'page_view');
  assert.equal(calls[3][2].page_location, 'https://agent-assembly.com/install');
  assert.equal(calls[3][2].page_referrer, '');
  assert.equal(JSON.stringify(calls).includes(canary), false);
});
