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

Última sincronización: **rev `2026-09`** (`formas_pago_rev` en `precios.json`).

### Criterio de la rev `2026-09`

Al comparar contra producción (`GET /api/precios`) se detectó que el panel de
admin ya tenía ediciones que **no estaban en el repo**, y que en varios casos son
posteriores a la planilla. El criterio acordado con el dueño del negocio fue:

> **Los valores que están hoy en la web son los correctos.** Solo se corrigen los
> planes que nunca se editaron desde el panel (los que seguían en el valor por
> defecto viejo de `main`).

Por eso `precios.json` ahora refleja **producción**, con una sola excepción: los
planes de **6 cuotas** que seguían en 0 % y que la planilla pone en −5 %.

## Cambios que aplica la rev `2026-09` sobre producción

| Tarjeta | Cuotas | Hoy en la web | Queda en |
|---|---|---|---|
| Visa / Mastercard | 6 | 0 % | **−5 %** |
| Naranja Visa | 6 | 0 % | **−5 %** |
| Cencosud | 6 | 0 % | **−5 %** |
| Titanio | 6 | 0 % | **−5 %** |
| Credicash | 6 | 0 % | **−5 %** |

Los otros 44 valores quedan idénticos a como están hoy en la web.

### Ediciones de admin que se respetan (NO se tocan)

Difieren de la planilla FEBRERO 2026 pero se conservan porque son decisiones
más recientes tomadas desde el panel:

| Tarjeta | Cuotas | Se conserva | La planilla decía |
|---|---|---|---|
| Naranja | 6 | +6 % | −5 % |
| Naranja | 9 | +6 % | 0 % |
| Naranja | 10 | +10 % | +5 % |
| Naranja | 12 | +9 % | 0 % |
| Sol | 18 | +12 % | +10 % |
| Amex propia | 6 | +6 % | (sin dato) |

Ya coincidían con la planilla y también se conservan: Sol 12 (+3 %),
Amex bancarizada 3 (0 %) y 6 (+5 %), Credicash 9 (+10 %).

**Si en algún momento se quiere volver a imponer la planilla sobre estos valores,
hay que editarlos en `precios.json` y subir `formas_pago_rev`.**

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
subir `formas_pago_rev` (p. ej. a `2026-10`). Sin ese cambio de revisión, el
archivo vivo no se actualiza.

## Pendientes de decisión comercial (NO se cambiaron)

Diferencias que no son un error de carga sino una decisión de qué ofrecer:

1. **Naranja «3 cuotas» y «Plan Zeta» son el mismo plan.** En la planilla el plan
   corto de Naranja es el **Plan Z** (−10 %) y no existe un «3»; la web los ofrece
   como dos opciones separadas, ambas al −10 %. No hay error de precio, pero el
   cliente ve duplicada la misma financiación. Además, con la clave `zeta`
   el carrito no muestra el valor por cuota (`Carrito.tsx:82`). Pendiente:
   unificar en una sola opción.
2. **American Express (propia / no bancaria)** — la planilla trae sus costos
   (2 c. 19,22 %, 3 c. 25,25 %, 6 c. 44,5 %) pero **no** tiene columna de interés
   a aplicar. Se mantiene lo que hay en la web: 3 c. 0 %, 6 c. **+6 %**.
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
