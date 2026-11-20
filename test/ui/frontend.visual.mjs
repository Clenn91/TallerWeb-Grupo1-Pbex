// Run with the client dev server running: node test/ui/frontend.visual.mjs
// API requests are intercepted in the browser; no database or credentials are used.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from '../../server/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = path.join(root, 'test/results/frontend');
const base = process.env.PBEX_PREVIEW_URL || 'http://127.0.0.1:5173';
await fs.mkdir(output, { recursive: true });

const date = '2026-11-20T10:00:00Z';
const user = { id: 1, username: 'preview', fullName: 'María Torres', email: 'preview@example.test', role: 'administrador', active: true, createdAt: date };
const products = [
  { id: 1, name: 'BOTELLÓN CON CAÑO 20 L', code: 'BOT-PC-001', category: 'BOTELLONES', material: 'POLICARBONATO', imageUrl: '/products/botellon.png', description: 'Envase de policarbonato para agua, con caño dispensador.' },
  { id: 2, name: 'BASE SURTIDOR PARA BOTELLÓN 20 L', code: 'BAS-PC-002', category: 'BASES', material: 'POLICARBONATO', imageUrl: '/products/bases.png', description: 'Base para botellón de 20 litros.' },
  { id: 3, name: 'BIDÓN 20 L', code: 'BID-PE-003', category: 'BIDONES', material: 'POLIETILENO', imageUrl: '/products/bidones.png', description: 'Envase resistente para almacenamiento y transporte.' },
  { id: 4, name: 'BOTELLA 4 L', code: 'BOT-PET-004', category: 'BOTELLAS', material: 'PET', imageUrl: '/products/botellas.png', description: 'Botella de cuatro litros.' },
  { id: 5, name: 'TAPA CORTA', code: 'TAP-PP-005', category: 'TAPAS Y ASAS', material: 'POLIPROPILENO', imageUrl: '/products/tapas_y_asas.png', description: 'Tapa para envases plásticos.' },
  { id: 6, name: 'FRASCO', code: 'FRA-PP-006', category: 'FRASCOS', material: 'POLIPROPILENO', imageUrl: '/products/frasco.png', description: 'Frasco plástico.' },
].map(product => ({ ...product, active: true, alertThreshold: 5, createdAt: date }));
const record = { id: 1, productId: 1, product: products[0], lotNumber: 'PB-2026-0142', productionDate: date, shift: 'mañana', totalProduced: 1200, totalApproved: 1170, totalRejected: 30 };
const certificate = { id: 1, code: 'CERT-2026-0142', product: products[0], productionRecord: record, status: 'pendiente', createdAt: date };
const alert = { id: 1, product: products[0], productionRecord: record, alertType: 'waste_threshold', threshold: 5, actualValue: 6.8, status: 'activa' };
const checks = [];
const browser = await puppeteer.launch({ headless: 'new' });
const runtimeErrors = [];
let catalogMode = 'normal';

async function preparePage(viewport, authenticated = false) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.evaluateOnNewDocument(authenticated => {
    if (authenticated) localStorage.setItem('token', 'visual-preview-only');
    else localStorage.removeItem('token');
  }, authenticated);
  page.on('pageerror', error => runtimeErrors.push(error.message));
  await page.setRequestInterception(true);
  page.on('request', async request => {
    const url = new URL(request.url());
    if (!url.pathname.startsWith('/api/')) { await request.continue(); return; }
    const route = url.pathname.slice(4);
    let data = [];
    if (route === '/auth/me') data = user;
    else if (route === '/products') {
      if (catalogMode === 'error') { await request.respond({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'Preview unavailable' }) }); return; }
      const categories = [...url.searchParams].filter(([key]) => key.startsWith('category')).map(([, value]) => value);
      const materials = [...url.searchParams].filter(([key]) => key.startsWith('material')).map(([, value]) => value);
      data = catalogMode === 'empty' ? [] : products.filter(product => (!categories.length || categories.includes(product.category)) && (!materials.length || materials.includes(product.material)));
    }
    else if (route === '/users') data = [user];
    else if (route === '/certificates') data = [certificate];
    else if (route === '/alerts') data = [alert];
    else if (route === '/non-conformities') data = [{ id: 1, code: 'NC-2026-003', product: products[0], description: 'Revisar acabado del envase en el lote seleccionado.', severity: 'media', status: 'abierta', createdAt: date }];
    else if (route === '/quality/production-records') data = request.method() === 'POST' ? record : [record];
    else if (route === '/quality/quality-controls') data = [];
    else if (route === '/dashboard/metrics') data = { production: { totalProduced: 12450, approvalRate: 97.5 }, quality: { avgWastePercentage: 2.5 }, alerts: { active: 1 }, productionByShift: [{ shift: 'mañana', totalProduced: 6000 }, { shift: 'tarde', totalProduced: 6450 }], defects: [{ type: 'rebaba', quantity: 20 }, { type: 'mancha', quantity: 11 }] };
    else if (route === '/dashboard/trends') data = [{ date: '2026-11-18', totalProduced: 11200, totalApproved: 10800 }, { date: '2026-11-19', totalProduced: 11800, totalApproved: 11450 }, { date: '2026-11-20', totalProduced: 12450, totalApproved: 12139 }];
    await request.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data }) });
  });
  return page;
}

async function visit(page, route) {
  await page.goto(`${base}${route}`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('h1, h2');
  console.log(`Checking ${page.viewport().width}px ${route}`);
}

async function clickText(page, text, selector = 'button') {
  const button = await page.evaluateHandle((selector, text) => [...document.querySelectorAll(selector)].find(element => element.textContent.trim().includes(text)), selector, text);
  assert(await button.asElement(), `Missing control: ${text}`);
  await button.asElement().click();
  await button.dispose();
}

async function screenshot(page, name) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    // Full-page captures must also load photos below the initial viewport.
    document.querySelectorAll('img').forEach(img => { img.loading = 'eager'; });
    await Promise.race([Promise.all([...document.images].map(img => img.decode().catch(() => {}))), new Promise(resolve => setTimeout(resolve, 5000))]);
  });
  const dimensions = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
  assert(dimensions.scroll <= dimensions.width + 1, `${name}: page overflows ${dimensions.scroll}/${dimensions.width}`);
  await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: !(await page.$('dialog[open]')) });
  checks.push(`${name}: layout fits viewport`);
}

async function checkDialog(page, name, opener) {
  await opener();
  await page.waitForSelector('dialog[open]');
  const state = await page.$eval('dialog', dialog => {
    const rect = dialog.getBoundingClientRect();
    return { fits: rect.left >= 0 && rect.right <= innerWidth && rect.top >= 0 && rect.bottom <= innerHeight + 1, name: !!document.getElementById(dialog.getAttribute('aria-labelledby'))?.textContent.trim() };
  });
  assert(state.fits && state.name, `${name}: dialog geometry and accessible heading`);
  for (let index = 0; index < 18; index++) {
    await page.keyboard.press('Tab');
    assert(await page.$eval('dialog', dialog => dialog.contains(document.activeElement)), `${name}: focus escaped dialog`);
  }
  await page.$eval('.dialog-body', body => { body.scrollTop = 0; });
  await screenshot(page, name);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('dialog[open]'));
  assert(await page.evaluate(() => document.activeElement !== document.body), `${name}: focus was not restored`);
  await opener();
  await page.waitForSelector('dialog[open]');
  await page.click('button[aria-label="Cerrar ventana"]');
  await page.waitForFunction(() => !document.querySelector('dialog[open]'));
  checks.push(`${name}: Tab, Escape, visible close, focus return`);
}

try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const size = viewport.width > 1000 ? 'desktop' : 'mobile';
    const page = await preparePage(viewport);
    for (const [route, name] of [['/', 'home'], ['/nosotros', 'about'], ['/login', 'login'], ['/public-products', 'catalog']]) {
      await visit(page, route);
      await screenshot(page, `${size}-${name}`);
    }
    if (size === 'mobile') {
      await page.click('button[aria-label="Abrir menú"]');
      await screenshot(page, `${size}-navigation`);
      await page.keyboard.press('Escape');
      assert.equal(await page.$eval('#main-navigation', element => getComputedStyle(element).display), 'none');
      await clickText(page, 'Filtros');
    }
    await page.click('#catalog-filters input');
    await page.waitForFunction(() => location.search.includes('categories='));
    await clickText(page, 'Limpiar filtros');
    await page.waitForFunction(() => !location.search);
    await visit(page, '/public-products?category=bases');
    assert.equal(await page.$$eval('#catalog-filters input:checked', inputs => inputs.length), 1);
    await page.waitForFunction(() => document.querySelectorAll('.catalog-card').length === 1);
    checks.push(`${size}: category links, filter toggles, reset`);
    await page.close();

    const admin = await preparePage(viewport, true);
    for (const [route, name] of [['', 'dashboard'], ['/products', 'products'], ['/users', 'users'], ['/certificates', 'certificates'], ['/alerts', 'alerts'], ['/non-conformities', 'non-conformities'], ['/quality/register', 'quality']]) {
      await visit(admin, `/dashboard${route}`);
      await screenshot(admin, `${size}-${name}`);
      if (name === 'products') await checkDialog(admin, `${size}-dialog-product`, () => clickText(admin, 'Crear Producto'));
      if (name === 'users') {
        await checkDialog(admin, `${size}-dialog-user`, () => clickText(admin, 'Crear Usuario'));
        await checkDialog(admin, `${size}-dialog-deactivate`, () => clickText(admin, 'Desactivar'));
      }
      if (name === 'certificates') {
        await checkDialog(admin, `${size}-dialog-certificate`, () => clickText(admin, 'Nuevo Certificado'));
        await checkDialog(admin, `${size}-dialog-reject`, () => clickText(admin, 'Rechazar'));
      }
      if (name === 'alerts') await checkDialog(admin, `${size}-dialog-alert`, () => clickText(admin, 'Resolver'));
      if (name === 'non-conformities') await checkDialog(admin, `${size}-dialog-non-conformity`, () => clickText(admin, 'Reportar', 'main button'));
      if (name === 'quality') {
        await admin.select('main select', '1');
        await admin.type('#qualityregister-field-2', 'PB-2026-0142');
        await admin.$eval('#qualityregister-field-6', field => { field.value = ''; });
        await admin.type('#qualityregister-field-6', '1200');
        await clickText(admin, 'Continuar a control');
        await admin.waitForFunction(() => document.querySelector('[aria-current="step"]')?.textContent.includes('2.'));
        await screenshot(admin, `${size}-quality-step-2`);
        await checkDialog(admin, `${size}-dialog-production`, () => clickText(admin, 'Editar'));
        await checkDialog(admin, `${size}-dialog-summary`, () => clickText(admin, 'Revisar y Confirmar'));
      }
    }
    await admin.close();
  }
  const page = await preparePage({ width: 390, height: 844 });
  catalogMode = 'empty';
  await visit(page, '/public-products');
  await screenshot(page, 'mobile-catalog-empty');
  catalogMode = 'error';
  await visit(page, '/public-products');
  await page.waitForSelector('[role="alert"]', { timeout: 20000 });
  await screenshot(page, 'mobile-catalog-error');
  catalogMode = 'normal';
  await clickText(page, 'Reintentar');
  await page.waitForSelector('.catalog-card');
  checks.push('Catalog empty/error states and retry verified');
  assert.deepEqual(runtimeErrors, [], 'Browser runtime errors');
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify({ base, fixtures: true, checks, runtimeErrors }, null, 2));
  console.log(JSON.stringify({ result: 'passed', checks: checks.length, screenshots: (await fs.readdir(output)).filter(name => name.endsWith('.png')).length, output }, null, 2));
} finally { await browser.close(); }
