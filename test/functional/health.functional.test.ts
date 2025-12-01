import app from '../../server/app.js';
import http from 'http';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`✗ ${message}`);
    process.exitCode = 1;
  }
}

async function callHealth(url: string) {
  const response = await fetch(url);
  const body = await response.json();
  return { status: response.status, body };
}

async function run() {
  console.log('Pruebas funcionales - endpoint /health');

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

  try {
    const { status, body } = await callHealth(url);

    assert(status === 200, `El endpoint /health debe responder 200 (obtenido ${status})`);
    assert(
      body && body.success === true,
      'El cuerpo de la respuesta debe incluir success=true'
    );
    assert(
      typeof body.message === 'string' && body.message.length > 0,
      'El cuerpo de la respuesta debe incluir un mensaje'
    );

    if (process.exitCode && process.exitCode !== 0) {
      console.error('Algunas pruebas funcionales fallaron');
    } else {
      console.log('✓ Todas las pruebas funcionales pasaron');
    }
  } catch (err) {
    console.error('Error al ejecutar la prueba funcional de /health', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

run().catch((err) => {
  console.error('Error inesperado en pruebas funcionales', err);
  process.exit(1);
});


