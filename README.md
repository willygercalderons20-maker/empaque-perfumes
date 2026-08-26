# Empaque de Perfumes — Calculadora Volumétrica

App de una sola página (HTML/JS) para llevar el catálogo de cajas de perfume,
el catálogo de cajas de envío, y calcular cuántas unidades caben en cada caja
de envío probando las 6 orientaciones posibles (no solo volumen÷volumen).

## Estructura
```
empaque-perfumes/
  index.html              <- toda la interfaz y lógica de acomodo
  functions/api/boxes.js  <- Cloudflare Pages Function (lee/escribe en KV)
```

Si abres `index.html` directamente en el navegador (sin desplegar), la app
detecta que no hay backend y guarda todo en `localStorage` — sirve para
probar antes de desplegar, pero solo persiste en ese navegador.

## Desplegar en Cloudflare Pages (con KV, como tus otras apps)

1. **Crear el KV namespace:**
   ```
   npx wrangler kv namespace create EMPAQUE_KV
   ```
   Copia el `id` que te devuelve.

2. **Crear el proyecto de Pages** (arrastrando esta carpeta en el dashboard
   de Cloudflare Pages, o vía `wrangler pages deploy empaque-perfumes`).

3. **Ligar el KV namespace al proyecto:**
   En el dashboard: *Pages → tu proyecto → Settings → Functions →
   KV namespace bindings* → agregar binding con nombre **`EMPAQUE_KV`**
   apuntando al namespace que creaste en el paso 1.
   (El nombre del binding tiene que ser exactamente `EMPAQUE_KV` porque
   así lo espera `functions/api/boxes.js`.)

4. Vuelve a desplegar (o espera el redeploy automático) — desde ese momento
   el catálogo se guarda en KV y lo vas a ver igual entrando desde el
   celular o la computadora.

## Notas sobre el cálculo

- Las cajas de envío se cargan por defecto con la tarifa que compartiste
  (convertida de pulgadas a cm). Puedes agregar más desde la pestaña
  "Cajas de Envío".
- Para cada caja de perfume, el sistema prueba las 6 formas de orientarla
  dentro del espacio disponible y usa la que más unidades permite acomodar
  (división entera por eje, sin mezclar orientaciones dentro de una misma
  fila).
- En la calculadora puedes agregar varias fragancias distintas con su
  cantidad (ej. 5 de "Oasis 100ml", 1 de "Verde 100") y ver en vivo el %
  de la caja de envío que van ocupando. El acomodo usa empaque 3D real
  (guillotine bin-packing): la caja de envío se trata como una lista de
  "huecos libres" (no uno solo), cada fragancia se reparte entre los
  huecos donde quepa probando sus 6 orientaciones, y cada hueco usado se
  divide en hasta 3 huecos libres nuevos sin traslape ni pérdida de
  volumen. Así el piso que una fragancia no ocupó queda disponible para
  las siguientes, en vez de bloquearse por altura como en un empaque por
  capas simple — si una cantidad no cabe completa en los huecos
  disponibles, se marca junto al máximo real que sí cabría.
- El orden en que se empacan las fragancias afecta cuánto termina cabiendo
  (la primera procesada tiene "primera opción" de piso libre). Por eso la
  calculadora no usa el orden en que agregaste las filas para empacar:
  con 7 fragancias o menos prueba TODAS las combinaciones de orden posibles
  y usa la que logra acomodar más unidades en total; con más de 7, usa la
  heurística de acomodar primero las de mayor volumen. Las filas se siguen
  mostrando en el orden en que las agregaste, solo el cálculo interno se
  reordena para aprovechar mejor el espacio.
- La mezcla que armas en la calculadora (caja de envío elegida +
  fragancias con cantidad) se guarda automáticamente igual que el
  catálogo, así que sigue ahí si recargas la página o vuelves después.
  El botón "Limpiar" la borra por completo cuando ya no la necesitas.
