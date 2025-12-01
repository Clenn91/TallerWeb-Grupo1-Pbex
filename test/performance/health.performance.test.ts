import app from '../../server/app.js';
import http from 'http';
import fs from 'fs';
import path from 'path';

async function callHealth(url: string) {
  const response = await fetch(url);
  await response.json();
  return response.status;
}

async function run() {
  console.log('Pruebas de performance - endpoint /health');

  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, () => resolve());
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    console.error('No se pudo obtener el puerto del servidor de pruebas');
    process.exit(1);
    return;
  }

  const port = address.port;
  const url = `http://localhost:${port}/health`;

  const iterations = 20;
  const start = performance.now();
  let okResponses = 0;

  try {
    for (let i = 0; i < iterations; i++) {
      const status = await callHealth(url);
      if (status !== 200) {
        console.error(`Iteración ${i + 1}: se esperaba status 200 y se obtuvo ${status}`);
        process.exitCode = 1;
        break;
      } else {
        okResponses++;
      }
    }
  } catch (err) {
    console.error('Error durante la prueba de performance', err);
    process.exitCode = 1;
  } finally {
    const end = performance.now();
    const totalMs = end - start;
    const avgMs = totalMs / iterations;

    console.log(`Total tiempo para ${iterations} requests: ${totalMs.toFixed(2)} ms`);
    console.log(`Tiempo promedio por request: ${avgMs.toFixed(2)} ms`);
    console.log(`Respuestas 200 OK: ${okResponses}/${iterations}`);

    // Umbral muy amplio, solo como smoke test
    const maxAvgMs = 500;
    if (avgMs > maxAvgMs) {
      console.error(
        `✗ El tiempo promedio por request (${avgMs.toFixed(
          2
        )} ms) superó el umbral aceptable de ${maxAvgMs} ms`
      );
      process.exitCode = 1;
    } else {
      if (!process.exitCode || process.exitCode === 0) {
        console.log('✓ Prueba de performance dentro de parámetros aceptables');
      }
    }

    // Guardar estadísticas en JSON para el informe automático
    try {
      const projectRoot = path.resolve(__dirname, '..', '..');
      const resultsDir = path.join(projectRoot, 'test', 'results');
      if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
      }
      const statsPath = path.join(resultsDir, 'performance-health.json');
      const stats = {
        endpoint: '/health',
        iterations,
        okResponses,
        totalMs,
        avgMs,
        maxAvgMs,
        timestamp: new Date().toISOString(),
      };
      fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2), 'utf-8');
    } catch (err) {
      console.error('No se pudieron guardar las estadísticas de performance', err);
    }

    server.close();
  }
}

run().catch((err) => {
  console.error('Error inesperado en pruebas de performance', err);
  process.exit(1);
});



