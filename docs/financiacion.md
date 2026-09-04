# Financiación — sincronización con la planilla de intereses

## Fuente de verdad

Planilla: **`ELIO _ INTERES TARJETAS DE CREDITO.xlsx`**
<https://docs.google.com/spreadsheets/d/1fy6q8msLyqwhOjPbtKQePFC6Omm7wUaQ/edit>

- Solapa usada: **`FEBRERO 2026`** (la más reciente del archivo).
- Columna usada: **`INTERÉS A APLICAR (REDONDEADO)`** (col. `AF`), por plan (col. `AC`).
  Es exactamente el `porcentaje` que el cotizador aplica sobre el precio de lista:
  negativo = descuento, positivo = recargo.
- Supuestos de la planilla en esta revisión: lista = efectivo + 30 %, inflación
  proyectada 3 % mensual, tope de pérdida 24 %.

Última sincronización: **rev `2026-02`** (`formas_pago_rev` en `precios.json`).

## Cómo se propaga a producción

`precios.json` del repo **sólo siembra** el archivo vivo (`PRECIOS_PATH`, en volumen).
Para que los porcentajes nuevos lleguen a producción, `ensurePreciosFile()` en
`src/server/routes/precios.ts` sincroniza la financiación **una vez por revisión**:
si `formas_pago_rev` del bundleado difiere del vivo, copia el `porcentaje` de las
tarjetas/cuotas que existen en ambos y guarda la nueva revisión.

- No agrega, borra ni desactiva planes.
- No toca precios ni dólar.
- Las ediciones del panel de admin posteriores a la sincronización se respetan
  (hasta la próxima suba de `formas_pago_rev`).

**Para la próxima actualización:** editar los `porcentaje` en `precios.json` y
subir `formas_pago_rev` (p. ej. a `2026-09`). Sin ese cambio de revisión, el
archivo vivo no se actualiza.

## Cambios aplicados en la rev `2026-02`

| Tarjeta (web) | Bloque en la planilla | Cuotas | Antes | Ahora |
|---|---|---|---|---|
| Visa / Mastercard | FISERV CLOVER | 6 | 0 % | **−5 %** |
| Naranja Visa | FISERV CLOVER | 6 | 0 % | **−5 %** |
| Cencosud | FISERV CLOVER | 6 | 0 % | **−5 %** |
| Naranja | NARANJA común | 6 | 0 % | **−5 %** |
| Naranja | NARANJA común | 10 | +10 % | **+5 %** |
| Naranja | NARANJA común | 12 | +10 % | **0 %** |
| Sol | TARJETA SOL | 12 | 0 % | **+3 %** |
| American Express (bancarizada) | AMEX BANCARIZADAS | 3 | −10 % | **0 %** |
| American Express (bancarizada) | AMEX BANCARIZADAS | 6 | 0 % | **+5 %** |
| Titanio | TITANIO | 3 y 6 | 0 % (6) | **−5 %** (6) |
| Credicash | CREDICASH | 6 | 0 % | **−5 %** |
| Credicash | CREDICASH | 9 | +5 % | **+10 %** |

Ya coincidían y no se tocaron: Débito 1, Cabal 6 (−10 %), Sucredito 1/3/5/6,
Titanio Argencard 1/3/6, Sol 1/3/6/9/18, y las cuotas 1/3/9/12 de
Visa-Mastercard / Naranja Visa / Cencosud.

## Pendientes de decisión comercial (NO se cambiaron)

Diferencias que no son un error de carga sino una decisión de qué ofrecer:

1. **Naranja «3 cuotas» (−10 %) no existe en la planilla.** El plan corto de
   Naranja en la planilla es el **Plan Z** (−10 %), que la web ya ofrece aparte.
   Verificar si el plan de 3 cuotas sigue vigente con Naranja.
2. **American Express (propia / no bancaria)** — la planilla trae sus costos
   (2 c. 19,22 %, 3 c. 25,25 %, 6 c. 44,5 %) pero **no** tiene columna de interés
   a aplicar, así que la web quedó como estaba (3 c. 0 %, 6 c. +10 %).
3. **Débito y efectivo/transferencia/QR** no figuran en la planilla. Siguen en
   −15 % y −20 % respectivamente.
4. **Planes que la planilla calcula y la web no ofrece:**
   - Sucredito 9, 10, 11 y 12 cuotas → **+15 %**.
   - AMEX bancarizada 9 cuotas → **+30 %**.
   - Fiserv (Visa/Master/Cencosud/Naranja Visa) 2, 4, 5, 7, 8, 10 y 11 cuotas → 0 %.
   - Sol 2, 4, 5, 7, 8 y 14 cuotas → 0 %.
5. **Planes con pérdida en la planilla — no conviene ofrecerlos:** Naranja 14, 18
   y 24 cuotas dan ganancia negativa (−20,6 / −37,6 / −57,0 sobre base 100);
   Sol 7 y 8 cuotas también (−2,3 y −5,6). Ninguno está publicado hoy: está bien así.
6. **Bloques de la planilla sin tarjeta en la web:** GETNET (Santander), Hipotecario,
   VIUMI y Payway Cuota Simple. Son promociones por medio de cobro, no tarjetas del
   cliente; definir si alguna debería aparecer como opción.
7. **Fiserv 18 cuotas figura como `#REF!`** en la planilla (fórmula rota). Si se
   piensa ofrecer, hay que arreglar esa celda primero.
