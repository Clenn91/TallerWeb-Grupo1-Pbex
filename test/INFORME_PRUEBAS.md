## Informe básico de pruebas

### 1. Alcance

Este informe resume las **pruebas unitarias**, **funcionales** y de **performance** mínimas realizadas sobre el backend (`server`) del sistema de gestión de calidad PBEX.

Las pruebas se enfocan en:
- **Pruebas unitarias**: verificación de la lógica de generación de códigos de producto.
- **Pruebas funcionales**: verificación del correcto funcionamiento del endpoint de salud `/health`.
- **Pruebas de performance**: medición básica del tiempo de respuesta promedio del endpoint `/health`.

### 2. Entorno

- **Proyecto**: TallerWeb-Grupo2-Pbex
- **Módulo probado**: Backend (`server`)
- **Node.js**: >= 18 (según `package.json`)
- **Herramienta de ejecución**: `tsx`

Para ejecutar las pruebas se utiliza el directorio `server` como raíz de comandos.

### 3. Tipos de pruebas y comandos

- **Pruebas unitarias**
  - **Archivo**: `test/unit/generateProductCode.unit.test.ts`
  - **Objetivo**: validar que la función `generateProductCode` genera códigos correctos para:
    - Categoría y material conocidos.
    - Uso de número secuencial.
    - Categoría y material desconocidos (código por defecto).
  - **Comando**:
    - Desde la carpeta raíz del proyecto:
      - `cd server`
      - `npm run test:unit`

- **Pruebas funcionales**
  - **Archivo**: `test/functional/health.functional.test.ts`
  - **Objetivo**: comprobar que el endpoint `/health`:
    - Responde con **status 200**.
    - Devuelve un cuerpo JSON con `success = true` y un mensaje.
  - **Comando**:
    - Desde la carpeta raíz del proyecto:
      - `cd server`
      - `npm run test:functional`

- **Pruebas de performance**
  - **Archivo**: `test/performance/health.performance.test.ts`
  - **Objetivo**:
    - Realizar múltiples requests al endpoint `/health`.
    - Medir el **tiempo total** y el **tiempo promedio por request**.
    - Verificar que el tiempo promedio sea menor a un umbral amplio (500 ms) como prueba de humo de performance.
  - **Comando**:
    - Desde la carpeta raíz del proyecto:
      - `cd server`
      - `npm run test:performance`

- **Ejecución completa de pruebas**
  - **Comando**:
    - Desde la carpeta raíz del proyecto:
      - `cd server`
      - `npm test`

### 4. Resultados esperados (resumen)

- **Pruebas unitarias**:
  - Todas las aserciones de `generateProductCode` deben pasar.
- **Pruebas funcionales**:
  - El endpoint `/health` debe responder **200** y `success = true`.
- **Pruebas de performance**:
  - El tiempo promedio por request debe estar **por debajo de 500 ms** en el entorno de desarrollo.

### 5. Cómo generar el PDF

Este informe está en formato **Markdown** (`test/INFORME_PRUEBAS.md`). Para obtener el PDF puedes usar cualquiera de las siguientes opciones:

- Abrir el archivo en tu editor (VS Code / Cursor) y usar la opción de **exportar a PDF** si está disponible.
- Usar una herramienta de línea de comandos como `pandoc`, por ejemplo:
  - `pandoc test/INFORME_PRUEBAS.md -o INFORME_PRUEBAS.pdf`

Este documento cubre lo **mínimo indispensable** para documentar las pruebas básicas del backend.


