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
  de la caja de envío que van ocupando. El acomodo es secuencial: cada
  fragancia reserva capas completas de alto dentro del espacio que va
  quedando, y la siguiente fragancia solo ve lo que sobró — si una
  cantidad no cabe completa en lo que queda, se marca junto al máximo
  que sí cabría en esa posición.
- La mezcla que armas en la calculadora (caja de envío elegida +
  fragancias con cantidad) se guarda automáticamente igual que el
  catálogo, así que sigue ahí si recargas la página o vuelves después.
  El botón "Limpiar" la borra por completo cuando ya no la necesitas.
