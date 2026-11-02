const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const base = path.join(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(base, 'companies.json'), 'utf8'));
const code = fs.readFileSync(path.join(base, 'app.js'), 'utf8');

// Minimal DOM adapter executes the actual browser script, including its async load.
class Element {
  constructor(tag) { this.tagName = tag; this.children = []; this.attributes = {}; this.events = {}; this.value = ''; }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; }
  setAttribute(key, value) { this.attributes[key] = value; }
  addEventListener(type, callback) { this.events[type] = callback; }
}
async function boot(fetcher = async () => ({ok:true, json:async () => data})) {
  const nodes = Object.fromEntries(['q', 'part', 'results', 'result-count'].map(id => [id, new Element('div')]));
  nodes.part.value = 'all';
  vm.runInNewContext(code, {document: {getElementById:id => nodes[id], createElement:tag => new Element(tag)}, fetch:fetcher});
  await new Promise(resolve => setImmediate(resolve));
  return nodes;
}
function descendants(node) { return node.children.flatMap(child => [child, ...descendants(child)]); }
function cards(nodes) { return descendants(nodes.results).filter(node => node.className === 'card'); }
function names(nodes) { return descendants(nodes.results).filter(node => node.className === 'name').map(node => node.textContent); }

test('exactly 33 unique companies, expected split, valid secure links', () => {
  assert.equal(data.length, 33);
  assert.equal(new Set(data.map(company => company.name)).size, 33);
  assert.equal(data.filter(company => company.part === 'Part 1').length, 24);
  assert.equal(data.filter(company => company.part === 'Part 2').length, 9);
  for (const company of data) {
    assert.equal(new URL(company.linkedin).hostname, 'www.linkedin.com');
    for (const key of ['linkedin', 'careers']) assert.equal(new URL(company[key]).protocol, 'https:');
  }
});
test('renders every company and its own two links safely', async () => {
  const nodes = await boot();
  assert.deepEqual(names(nodes), data.map(company => company.name));
  assert.equal(cards(nodes).length, 33);
  cards(nodes).forEach((card, index) => {
    const links = descendants(card).filter(node => node.tagName === 'a');
    assert.deepEqual(links.map(link => link.href), [data[index].linkedin, data[index].careers]);
    links.forEach(link => { assert.equal(link.target, '_blank'); assert.equal(link.rel, 'noopener noreferrer'); });
  });
  assert.equal(nodes['result-count'].textContent, 'Showing 33 of 33 companies');
  assert.equal(nodes.results.attributes['aria-busy'], 'false');
});
test('filters, trimmed case-insensitive search, combined empty state and recovery', async () => {
  const nodes = await boot();
  for (const [part, count] of [['Part 2',9], ['Part 1',24]]) {
    nodes.part.value = part; nodes.part.events.change(); assert.equal(cards(nodes).length, count);
  }
  nodes.q.value = '  FrEsHwOrKs  '; nodes.q.events.input(); assert.deepEqual(names(nodes), ['Freshworks']);
  nodes.part.value = 'Part 2'; nodes.part.events.change(); assert.equal(cards(nodes).length, 0);
  assert.match(nodes.results.children[0].textContent, /No companies found/);
  nodes.q.value = ''; nodes.part.value = 'all'; nodes.q.events.input(); assert.equal(cards(nodes).length,33);
  for (const [term, expected] of [['bank',['Clayfin','Standard Chartered','HSBC']], ['AT&T',['AT&T']]]) {
    nodes.q.value = term; nodes.q.events.input(); assert.deepEqual(names(nodes), expected);
  }
});
test('failed request can retry successfully', async () => {
  let attempts = 0;
  const nodes = await boot(async () => { if (++attempts === 1) throw Error('offline'); return {ok:true,json:async()=>data}; });
  assert.equal(nodes.q.disabled,true);
  assert.match(nodes['result-count'].textContent,/could not be loaded/);
  await nodes.results.children[0].events.click();
  assert.equal(cards(nodes).length,33);
  assert.equal(nodes.q.disabled,false);
});
test('HTTP errors and malformed data show recovery instead of a blank directory', async () => {
  for (const response of [{ok:false}, {ok:true,json:async()=>({})}, {ok:true,json:async()=>[{name:'invalid'}]}]) {
    const nodes = await boot(async () => response);
    assert.match(nodes['result-count'].textContent,/could not be loaded/);
    assert.equal(nodes.results.children[0].textContent,'Retry loading');
    assert.equal(nodes.results.attributes['aria-busy'],'false');
  }
});
test('PDF is bundled and analytics uses the supported static endpoint', () => {
  const html = fs.readFileSync(path.join(base, 'index.html'), 'utf8');
  const pdfName = 'Chennai_Product_Companies_Part1_Part2_2026.pdf';
  assert.ok(html.includes(`href="./${pdfName}" download`));
  const pdf = fs.readFileSync(path.join(base,pdfName));
  assert.equal(pdf.subarray(0,5).toString(),'%PDF-');
  assert.ok(pdf.length > 100000);
  assert.match(html, /<script defer src="\/_vercel\/insights\/script.js">\s*<\/script>/);
  assert.ok(html.includes('window.vaq'));
  assert.ok(html.includes('<noscript>'));
  const config = JSON.parse(fs.readFileSync(path.join(base,'vercel.json'),'utf8'));
  assert.equal(config.buildCommand,''); assert.equal(config.outputDirectory,'.');
});
