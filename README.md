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
  (7! = 5040, resultado exacto). Con más de 7, probar todas es imposible
  (25! es astronómico), así que usa una búsqueda con presupuesto de tiempo
  de 300ms (`localSearchPacking`): explora muchas variantes de orden con
  intercambios aleatorios que solo se quedan si no empeoran (hill
  climbing), y se queda con la mejor encontrada — en la práctica da
  resultados muy superiores a un solo orden fijo (en una prueba con 25
  fragancias distintas y demanda que superaba la caja, pasó de 34 a 114
  unidades acomodadas). Las filas se siguen mostrando en el orden en que
  las agregaste, solo el cálculo interno se reordena.
- La mezcla que armas en la calculadora (caja de envío elegida +
  fragancias con cantidad) se guarda automáticamente igual que el
  catálogo, así que sigue ahí si recargas la página o vuelves después.
  El botón "Limpiar" la borra por completo cuando ya no la necesitas.
- Hay buscador en dos lugares para cuando el catálogo crezca: arriba de
  la tabla en "Cajas de Perfume" (filtra por nombre) y en cada fila de
  la calculadora, con un combobox propio (no el datalist nativo del
  navegador): al hacer clic se despliega la lista completa como un
  `<select>`, y escribir la filtra en vivo. Clic afuera cierra y
  revierte a la fragancia realmente seleccionada si el texto no
  coincide con ninguna.
- El % mostrado siempre corresponde al volumen real ocupado por la
  cantidad exacta que pusiste, capa por capa y fila por fila — nunca se
  "congela" al llegar a una capa completa. `reservedFootprint()` separa
  a propósito el volumen real (para el %) de la huella que se reserva
  para cortar el espacio libre (para lo que sigue empacando).
- Dentro de cada hueco libre, una misma fragancia puede terminar usando
  MÁS de una orientación: `packItemIntoSpace()` coloca primero la mejor
  orientación para ese hueco y, si sobran unidades por meter y sobra
  espacio en ese mismo hueco, se llama a sí misma sobre cada sobrante —
  que puede aprovecharse con una orientación distinta (acostada, de pie,
  lo que quepa), igual que alguien acomodando cajas a mano en vez de
  apilar todo igual.
