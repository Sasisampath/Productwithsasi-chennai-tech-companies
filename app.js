'use strict';

const search = document.getElementById('q');
const partFilter = document.getElementById('part');
const results = document.getElementById('results');
const count = document.getElementById('result-count');
let companies = [];

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function render() {
  const term = search.value.trim().toLowerCase();
  const filtered = companies.filter(company =>
    (partFilter.value === 'all' || company.part === partFilter.value) &&
    [company.name, company.category, company.description].join(' ').toLowerCase().includes(term)
  );
  results.replaceChildren();
  count.textContent = `Showing ${filtered.length} of ${companies.length} companies`;
  if (!filtered.length) {
    results.append(element('p', 'empty', 'No companies found. Try another search or change the filter.'));
    return;
  }
  for (const part of ['Part 2', 'Part 1']) {
    const group = filtered.filter(company => company.part === part);
    if (!group.length) continue;
    const heading = element('h3', 'sectiontag', part === 'Part 2' ? 'PART 2  /  NEW FINDS' : 'PART 1  /  ORIGINAL COLLECTION');
    heading.id = part === 'Part 2' ? 'part-2-heading' : 'part-1-heading';
    const grid = element('section', 'grid');
    grid.setAttribute('aria-labelledby', heading.id);
    for (const company of group) {
      const card = element('article', 'card');
      const row = element('div', 'row');
      row.append(element('h4', 'name', company.name));
      card.append(row, element('div', 'category', company.category), element('p', 'desc', company.description));
      const links = element('div', 'links');
      for (const [label, url] of [['LinkedIn', company.linkedin], ['Careers', company.careers]]) {
        const link = element('a', '', `${label} ↗`);
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.setAttribute('aria-label', `${company.name} ${label} (opens in a new tab)`);
        links.append(link);
      }
      card.append(links);
      grid.append(card);
    }
    results.append(heading, grid);
  }
}

async function loadCompanies() {
  search.disabled = true;
  partFilter.disabled = true;
  results.setAttribute('aria-busy', 'true');
  count.textContent = 'Loading companies…';
  results.replaceChildren();
  try {
    const response = await fetch('./companies.json');
    if (!response.ok) throw new Error('Directory request failed');
    const data = await response.json();
    if (!Array.isArray(data) || !data.length || !data.every(company =>
      ['name', 'category', 'description', 'linkedin', 'careers', 'part'].every(key => typeof company[key] === 'string') &&
      ['Part 1', 'Part 2'].includes(company.part) &&
      [company.linkedin, company.careers].every(url => /^https:\/\//.test(url))
    )) throw new Error('Invalid directory data');
    companies = data;
    search.disabled = false;
    partFilter.disabled = false;
    render();
  } catch {
    count.textContent = 'The directory could not be loaded. Retry or download the PDF above.';
    const retry = element('button', 'btn light', 'Retry loading');
    retry.type = 'button';
    retry.addEventListener('click', loadCompanies);
    results.append(retry);
  } finally {
    results.setAttribute('aria-busy', 'false');
  }
}

search.addEventListener('input', render);
partFilter.addEventListener('change', render);
loadCompanies();
