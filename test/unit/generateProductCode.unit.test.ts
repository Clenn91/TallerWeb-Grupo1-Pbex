import { generateProductCode, CATEGORY_CODE_MAP, MATERIAL_CODE_MAP } from '../../server/config/constants.js';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`✗ ${message}`);
    process.exitCode = 1;
  }
}

async function run() {
  console.log('Pruebas unitarias - generateProductCode');

  const category = 'BOTELLONES';
  const material = 'PET';
  const expectedCode = `PT${CATEGORY_CODE_MAP[category]}${MATERIAL_CODE_MAP[material]}`;
  const result = generateProductCode(category, material);

  assert(
    result === expectedCode,
    `Debe generar código básico correcto para categoría y material (esperado ${expectedCode}, obtenido ${result})`
  );

  const seqResult = generateProductCode(category, material, 5);
  const expectedSeq = `PT${CATEGORY_CODE_MAP[category]}005`;

  assert(
    seqResult === expectedSeq,
    `Debe usar número secuencial cuando se provee (esperado ${expectedSeq}, obtenido ${seqResult})`
  );

  const unknownResult = generateProductCode('DESCONOCIDA', 'DESCONOCIDO');
  assert(
    unknownResult === 'PT000000',
    `Debe manejar categoría/material desconocidos usando códigos 000 (obtenido ${unknownResult})`
  );

  if (process.exitCode && process.exitCode !== 0) {
    console.error('Algunas pruebas unitarias fallaron');
  } else {
    console.log('✓ Todas las pruebas unitarias pasaron');
  }
}

run().catch((err) => {
  console.error('Error inesperado en pruebas unitarias', err);
  process.exit(1);
});


