import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type TestResult = {
  name: string;
  passed: boolean;
  durationMs: number;
  description?: string;
};

async function runSingleTest(importPath: string, name: string): Promise<TestResult> {
  console.log(`\n=== Ejecutando ${name} ===`);

  // Reiniciar exitCode antes de cada prueba
  process.exitCode = 0;

  const start = performance.now();

  try {
    await import(importPath);
    const passed = !process.exitCode || process.exitCode === 0;
    const durationMs = performance.now() - start;
    console.log(`=== Resultado ${name}: ${passed ? 'OK' : 'FALLÓ'} ===`);
    console.log(`Duración aproximada: ${durationMs.toFixed(2)} ms`);
    return { name, passed, durationMs };
  } catch (err) {
    console.error(`Error ejecutando ${name}`, err);
    const durationMs = performance.now() - start;
    return { name, passed: false, durationMs };
  }
}

type PerformanceStats = {
  endpoint: string;
  iterations: number;
  okResponses: number;
  totalMs: number;
  avgMs: number;
  maxAvgMs: number;
  timestamp: string;
} | null;

function loadPerformanceStats(): PerformanceStats {
  try {
    const projectRoot = path.resolve(__dirname, '..', '..');
    const statsPath = path.join(projectRoot, 'test', 'results', 'performance-health.json');
    if (!fs.existsSync(statsPath)) {
      return null;
    }
    const raw = fs.readFileSync(statsPath, 'utf-8');
    return JSON.parse(raw) as PerformanceStats;
  } catch {
    return null;
  }
}

function buildHtmlReport(results: TestResult[], perfStats: PerformanceStats): string {
  const date = new Date().toLocaleString();
  const anyFailed = results.some((r) => !r.passed);
  const totalDuration = results.reduce((acc, r) => acc + r.durationMs, 0);
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;

  const rows = results
    .map((r) => {
      const color = r.passed ? '#2e7d32' : '#c62828';
      const status = r.passed ? 'OK' : 'FALLÓ';
      return `<tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${r.name}</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: ${color};">${status}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${r.durationMs.toFixed(2)} ms</td>
      </tr>`;
    })
    .join('\n');

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Resumen de pruebas</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; margin: 32px; }
    h1 { font-size: 20px; margin-bottom: 4px; }
    h2 { font-size: 16px; margin-top: 24px; }
    table { border-collapse: collapse; width: 100%; margin-top: 8px; }
    th { background: #f5f5f5; padding: 8px; border: 1px solid #ddd; text-align: left; }
  </style>
</head>
<body>
  <h1>Informe básico de pruebas</h1>
  <p><strong>Fecha de ejecución:</strong> ${date}</p>
  <p><strong>Resultado global:</strong> ${
    anyFailed ? '<span style="color:#c62828;">CON FALLOS</span>' : '<span style="color:#2e7d32;">OK</span>'
  }</p>
  <p><strong>Total de suites de prueba:</strong> ${results.length} (OK: ${passedCount}, Falló: ${failedCount})</p>
  <p><strong>Tiempo total aproximado:</strong> ${totalDuration.toFixed(2)} ms</p>

  <h2>Entorno</h2>
  <ul>
    <li><strong>Node.js</strong>: ${process.version}</li>
    <li><strong>Sistema operativo</strong>: ${process.platform} (${process.arch})</li>
    <li><strong>Ubicación del proyecto</strong>: ${path.resolve(__dirname, '..', '..')}</li>
  </ul>

  <h2>Resumen por tipo de prueba</h2>
  <table>
    <thead>
      <tr>
        <th>Tipo de prueba</th>
        <th>Estado</th>
        <th>Duración aprox.</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <h2>Detalle</h2>
  <ul>
    <li><strong>Unitarias</strong>: validan la función <code>generateProductCode</code> (códigos correctos, secuencial y manejo de valores desconocidos). Estas pruebas se enfocan en la lógica pura de negocio, sin acceder a base de datos ni red.</li>
    <li><strong>Funcionales</strong>: verifican el endpoint <code>/health</code> ejecutando el servidor Express en memoria (status 200, <code>success = true</code> y mensaje), comprobando el funcionamiento integrado de middlewares y rutas principales.</li>
    <li><strong>Performance</strong>: miden el tiempo promedio de respuesta de <code>/health</code> sobre múltiples requests (actualmente 20 iteraciones, umbral objetivo &lt;= 500 ms por request en entorno de desarrollo). Sirven como prueba de humo para detectar degradaciones importantes.</li>
  </ul>

  ${
    perfStats
      ? `<h2>Métricas detalladas de performance</h2>
  <p>Las siguientes métricas fueron registradas automáticamente por la prueba de performance sobre el endpoint <code>${perfStats.endpoint}</code>:</p>
  <ul>
    <li><strong>Iteraciones ejecutadas</strong>: ${perfStats.iterations}</li>
    <li><strong>Respuestas 200 OK</strong>: ${perfStats.okResponses} / ${perfStats.iterations}</li>
    <li><strong>Tiempo total medido</strong>: ${perfStats.totalMs.toFixed(2)} ms</li>
    <li><strong>Tiempo promedio por request</strong>: ${perfStats.avgMs.toFixed(2)} ms</li>
    <li><strong>Umbral configurado</strong>: ${perfStats.maxAvgMs} ms por request</li>
    <li><strong>Fecha/hora de la medición</strong>: ${perfStats.timestamp}</li>
  </ul>`
      : ''
  }

  <p>Para más detalle, consultar <code>test/INFORME_PRUEBAS.md</code> en el proyecto.</p>
</body>
</html>`;
}

async function generatePdf(results: TestResult[]) {
  const projectRoot = path.resolve(__dirname, '..', '..');
  const testDir = path.join(projectRoot, 'test');

  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  const perfStats = loadPerformanceStats();
  const html = buildHtmlReport(results, perfStats);
  const outputPath = path.join(testDir, 'INFORME_PRUEBAS_AUTO.pdf');

  console.log('\nGenerando PDF de resumen en:', outputPath);

  const browser = await puppeteer.launch({ headless: 'new' as any });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({ path: outputPath, format: 'A4', printBackground: true });
  await browser.close();

  console.log('✓ PDF de resumen generado correctamente.');
}

async function main() {
  const results: TestResult[] = [];

  // Rutas relativas desde este archivo (server/scripts)
  results.push(
    await runSingleTest('../../test/unit/generateProductCode.unit.test.ts', 'Pruebas unitarias'),
  );
  results.push(
    await runSingleTest('../../test/functional/health.functional.test.ts', 'Pruebas funcionales'),
  );
  results.push(
    await runSingleTest('../../test/performance/health.performance.test.ts', 'Pruebas de performance'),
  );

  await generatePdf(results);

  const anyFailed = results.some((r) => !r.passed);
  if (anyFailed) {
    process.exitCode = 1;
  } else {
    process.exitCode = 0;
  }
}

main().catch((err) => {
  console.error('Error inesperado al ejecutar pruebas y generar informe', err);
  process.exit(1);
});


