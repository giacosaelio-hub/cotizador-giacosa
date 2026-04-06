import { useEffect, useState } from "react";
import { Trash2, PlusCircle } from "lucide-react";

const ADMIN_PASSWORD = "Lilaylola04$*";

type CuotaOpcion = { key: string; label: string; porcentaje: number; activo: boolean };
type TarjetaOpcion = { id: string; label: string; cuotas: CuotaOpcion[] };
type BobinaVariante = { id: string; calibre: number; ancho: number; tipo: "Galvanizada" | "Prepintada"; color: string | null; precio: number };

type Precios = {
  dolar: number;
  chapas_perfiladas: Record<string, number>;
  bobinas: Record<string, number>;
  bobinas_variantes?: BobinaVariante[];
  chapas_estandar: Record<string, Record<string, number>>;
  formas_pago?: TarjetaOpcion[];
};

const CHAPA_LABELS: Record<string, string> = {
  sinusoidal_galv_24: "Chapa Sinusoidal Galvanizada Cal. 24",
  sinusoidal_galv_27: "Chapa Sinusoidal Galvanizada Cal. 27",
  sinusoidal_cincalum_24: "Chapa Sinusoidal Cincalum Cal. 24",
  sinusoidal_cincalum_27: "Chapa Sinusoidal Cincalum Cal. 27",
  sinusoidal_prepintada_24: "Chapa Sinusoidal Prepintada Cal. 24",
  trapezoidal_galv_24: "Chapa Trapezoidal Galvanizada Cal. 24",
  trapezoidal_galv_27: "Chapa Trapezoidal Galvanizada Cal. 27",
  trapezoidal_cincalum_24: "Chapa Trapezoidal Cincalum Cal. 24",
  trapezoidal_cincalum_27: "Chapa Trapezoidal Cincalum Cal. 27",
  trapezoidal_prepintada_24: "Chapa Trapezoidal Prepintada Cal. 24",
};

function LoginGate({ onAuth }: { onAuth: () => void }) {
  const [pass, setPass] = useState("");
  const [err, setErr] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pass === ADMIN_PASSWORD) {
      onAuth();
    } else {
      setErr(true);
      setPass("");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "#f0faf4" }}>
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-xl font-black text-gray-900">Panel de Administración</h2>
          <p className="text-sm text-gray-400 mt-1">Giacosa Elio — Acceso restringido</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            value={pass}
            onChange={(e) => { setPass(e.target.value); setErr(false); }}
            placeholder="Contraseña"
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#008C45] transition-colors"
            autoFocus
          />
          {err && <p className="text-xs text-[#CD212A] font-medium">Contraseña incorrecta</p>}
          <button
            type="submit"
            className="py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: "#008C45" }}
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Add variant form ────────────────────────────────────────────────────────
function AddVarianteForm({ onAdd }: { onAdd: (v: Omit<BobinaVariante, "id">) => void }) {
  const [calibre, setCalibre] = useState("22");
  const [ancho, setAncho] = useState("1.00");
  const [tipo, setTipo] = useState<"Galvanizada" | "Prepintada">("Galvanizada");
  const [color, setColor] = useState("");
  const [precio, setPrecio] = useState("");
  const [open, setOpen] = useState(false);

  function handleAdd() {
    if (!precio || isNaN(parseFloat(precio))) return;
    onAdd({
      calibre: parseInt(calibre, 10),
      ancho: parseFloat(ancho),
      tipo,
      color: tipo === "Prepintada" && color ? color : null,
      precio: parseFloat(precio),
    });
    setPrecio("");
    setColor("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm font-semibold mt-3 px-3 py-2 rounded-lg border-2 border-dashed transition-colors hover:border-[#008C45] hover:text-[#008C45] text-gray-400 border-gray-200 w-fit"
      >
        <PlusCircle className="w-4 h-4" /> Agregar variante
      </button>
    );
  }

  return (
    <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Nueva variante</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Calibre</label>
          <select value={calibre} onChange={e => setCalibre(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#008C45]">
            {[22, 25, 27].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Ancho (mts)</label>
          <input type="number" value={ancho} onChange={e => setAncho(e.target.value)} step="0.01" min="0.1"
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#008C45]" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Tipo</label>
          <select value={tipo} onChange={e => setTipo(e.target.value as "Galvanizada" | "Prepintada")} className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#008C45]">
            <option value="Galvanizada">Galvanizada</option>
            <option value="Prepintada">Prepintada</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Color (prepintada)</label>
          <input type="text" value={color} onChange={e => setColor(e.target.value)} placeholder="Blanco, Negro..."
            disabled={tipo === "Galvanizada"}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#008C45] disabled:opacity-40" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Precio USD/metro</label>
          <input type="number" value={precio} onChange={e => setPrecio(e.target.value)} step="0.01" min="0" placeholder="0.00"
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm w-28 focus:outline-none focus:border-[#008C45]" />
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={handleAdd} className="px-4 py-1.5 rounded-lg text-white text-sm font-semibold" style={{ background: "#008C45" }}>
            Agregar
          </button>
          <button onClick={() => setOpen(false)} className="px-3 py-1.5 rounded-lg text-gray-500 text-sm border border-gray-200 hover:border-gray-300">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main admin panel ────────────────────────────────────────────────────────
export default function AdminPrecios() {
  const [auth, setAuth] = useState(false);
  const [precios, setPrecios] = useState<Precios | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!auth) return;
    fetch("/api/precios")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!data.chapas_perfiladas) throw new Error("Estructura inválida");
        setPrecios(data);
      })
      .catch((e) => setError(`No se pudo cargar precios.json: ${e.message}`));
  }, [auth]);

  if (!auth) return <LoginGate onAuth={() => setAuth(true)} />;

  // ── Updaters ──────────────────────────────────────────────────────────────

  function setDolar(val: string) {
    if (!precios) return;
    setPrecios({ ...precios, dolar: parseFloat(val) || 0 });
  }

  function setFlat(section: "chapas_perfiladas", key: string, val: string) {
    if (!precios) return;
    setPrecios({ ...precios, [section]: { ...precios[section], [key]: parseFloat(val) || 0 } });
  }

  function setEstandar(cat: string, key: string, val: string) {
    if (!precios) return;
    setPrecios({
      ...precios,
      chapas_estandar: { ...precios.chapas_estandar, [cat]: { ...precios.chapas_estandar[cat], [key]: parseFloat(val) || 0 } },
    });
  }

  function setBobinaVariantePrecio(id: string, val: string) {
    if (!precios || !precios.bobinas_variantes) return;
    setPrecios({
      ...precios,
      bobinas_variantes: precios.bobinas_variantes.map(v => v.id !== id ? v : { ...v, precio: parseFloat(val) || 0 }),
    });
  }

  function addBobinaVariante(variante: Omit<BobinaVariante, "id">) {
    if (!precios) return;
    const id = `bob-${Date.now()}`;
    setPrecios({ ...precios, bobinas_variantes: [...(precios.bobinas_variantes ?? []), { id, ...variante }] });
  }

  function removeBobinaVariante(id: string) {
    if (!precios || !precios.bobinas_variantes) return;
    setPrecios({ ...precios, bobinas_variantes: precios.bobinas_variantes.filter(v => v.id !== id) });
  }

  function setCuotaPorcentaje(tarjetaId: string, cuotaKey: string, val: string) {
    if (!precios || !precios.formas_pago) return;
    setPrecios({
      ...precios,
      formas_pago: precios.formas_pago.map(t =>
        t.id !== tarjetaId ? t : { ...t, cuotas: t.cuotas.map(c => c.key !== cuotaKey ? c : { ...c, porcentaje: parseFloat(val) || 0 }) }
      ),
    });
  }

  function setCuotaActivo(tarjetaId: string, cuotaKey: string, activo: boolean) {
    if (!precios || !precios.formas_pago) return;
    setPrecios({
      ...precios,
      formas_pago: precios.formas_pago.map(t =>
        t.id !== tarjetaId ? t : { ...t, cuotas: t.cuotas.map(c => c.key !== cuotaKey ? c : { ...c, activo }) }
      ),
    });
  }

  async function handleGuardar() {
    if (!precios) return;
    setSaving(true);
    setMsg("");
    setError("");
    try {
      const res = await fetch("/api/precios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(precios),
      });
      if (!res.ok) throw new Error("Error al guardar");
      setMsg("✅ Cambios guardados correctamente.");
    } catch {
      setError("❌ Error al guardar. Verificá la conexión.");
    } finally {
      setSaving(false);
    }
  }

  if (error && !precios) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-red-600 font-semibold">{error}</div>;
  }
  if (!precios) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-400 text-sm">Cargando...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 mb-1">Panel de Administración</h1>
        <p className="text-sm text-gray-500">Editá precios y configuración. Los cambios se aplican de inmediato al guardar.</p>
      </div>

      {/* Dólar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <h2 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider">Tipo de cambio</h2>
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-600 font-medium w-24">Dólar (ARS)</label>
          <input
            type="number"
            value={precios.dolar}
            onChange={(e) => setDolar(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold w-36 focus:outline-none focus:border-[#008C45]"
            step="1" min="0"
          />
        </div>
      </div>

      {/* Chapas Perfiladas */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <h2 className="font-bold text-gray-800 mb-1 text-sm uppercase tracking-wider">Chapas Perfiladas</h2>
        <p className="text-xs text-gray-400 mb-4">Precio en USD por 42.65 pies (precio lista base sin IVA)</p>
        <div className="flex flex-col gap-3">
          {Object.entries(precios.chapas_perfiladas).map(([k, v]) => (
            <div key={k} className="flex items-center gap-3">
              <label className="text-sm text-gray-600 flex-1">{CHAPA_LABELS[k] ?? k}</label>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">USD</span>
                <input
                  type="number"
                  value={v}
                  onChange={(e) => setFlat("chapas_perfiladas", k, e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-24 text-right focus:outline-none focus:border-[#008C45]"
                  step="0.01" min="0"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bobinas Variantes */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <h2 className="font-bold text-gray-800 mb-1 text-sm uppercase tracking-wider">Bobinas de Acero – Variantes</h2>
        <p className="text-xs text-gray-400 mb-5">Precio en USD por metro. Cada fila es una variante disponible en el cotizador.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">
                <th className="text-left pb-2 pr-3">Descripción</th>
                <th className="text-right pb-2 pr-3">USD/metro</th>
                <th className="pb-2 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {(precios.bobinas_variantes ?? []).map((v) => {
                const desc = v.tipo === "Prepintada" && v.color
                  ? `Bobina Prepintada ${v.color} Cal. ${v.calibre} — ${v.ancho.toFixed(2)} mts`
                  : `Bobina Galvanizada Cal. ${v.calibre} — ${v.ancho.toFixed(2)} mts`;
                return (
                  <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 pr-3 text-gray-700 font-medium">{desc}</td>
                    <td className="py-2.5 pr-3 text-right">
                      <input
                        type="number"
                        value={v.precio}
                        onChange={(e) => setBobinaVariantePrecio(v.id, e.target.value)}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-sm w-20 text-right focus:outline-none focus:border-[#008C45]"
                        step="0.01" min="0"
                      />
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => removeBobinaVariante(v.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-[#CD212A] hover:bg-red-50 transition-all"
                        title="Eliminar variante"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <AddVarianteForm onAdd={addBobinaVariante} />
      </div>

      {/* Chapas Estándar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <h2 className="font-bold text-gray-800 mb-1 text-sm uppercase tracking-wider">Chapas Estándar</h2>
        <p className="text-xs text-gray-400 mb-5">Precio en USD por unidad</p>
        <div className="flex flex-col gap-6">
          {Object.entries(precios.chapas_estandar).map(([cat, items]) => {
            const catLabels: Record<string, string> = {
              estampada: "Chapa Negra Estampada",
              lisa_negra: "Chapa Lisa Negra (LAF)",
              lisa_galv: "Chapa Lisa Galvanizada",
              lisa_cincalum: "Chapa Lisa Cincalum",
              lisa_prepintada: "Chapa Lisa Prepintada",
            };
            const medidaLabels: Record<string, string> = {
              "1x2": "1.00 × 2.00 mts",
              "1.22x2.44": "1.22 × 2.44 mts",
            };
            function formatKey(k: string): string {
              const parts = k.split("_");
              if (parts.length < 2) return k;
              const cal = parts[0];
              const medida = parts.slice(1).join("_");
              return `${cal} — ${medidaLabels[medida] ?? medida}`;
            }
            return (
              <div key={cat}>
                <p className="text-xs font-bold text-gray-600 mb-2 border-b border-gray-100 pb-1">{catLabels[cat] ?? cat.replace(/_/g, " ")}</p>
                <div className="flex flex-col gap-2">
                  {Object.entries(items).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-3">
                      <label className="text-sm text-gray-600 flex-1">{formatKey(k)}</label>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">USD</span>
                        <input
                          type="number"
                          value={v}
                          onChange={(e) => setEstandar(cat, k, e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-24 text-right focus:outline-none focus:border-[#008C45]"
                          step="0.01" min="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Formas de pago */}
      {precios.formas_pago && precios.formas_pago.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-1 text-sm uppercase tracking-wider">Formas de Pago</h2>
          <p className="text-xs text-gray-400 mb-5">Descuento (negativo) o recargo (positivo) en % por cuota. Tildá para activar la opción.</p>
          <div className="flex flex-col gap-6">
            {precios.formas_pago.map((tarjeta) => (
              <div key={tarjeta.id}>
                <p className="text-xs font-bold text-gray-600 mb-2 border-b border-gray-100 pb-1">{tarjeta.label}</p>
                <div className="flex flex-col gap-2">
                  {tarjeta.cuotas.map((cuota) => (
                    <div key={cuota.key} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={cuota.activo}
                        onChange={(e) => setCuotaActivo(tarjeta.id, cuota.key, e.target.checked)}
                        className="accent-[#008C45] w-4 h-4 flex-shrink-0"
                      />
                      <label className="text-xs text-gray-500 flex-1">{cuota.label}</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={cuota.porcentaje}
                          onChange={(e) => setCuotaPorcentaje(tarjeta.id, cuota.key, e.target.value)}
                          className="border border-gray-200 rounded-lg px-2 py-1 text-sm w-20 text-right focus:outline-none focus:border-[#008C45]"
                          step="1"
                        />
                        <span className="text-xs text-gray-400">%</span>
                      </div>
                      <span className={`text-xs w-16 text-right font-medium ${cuota.porcentaje < 0 ? "text-green-600" : cuota.porcentaje > 0 ? "text-amber-600" : "text-gray-400"}`}>
                        {cuota.porcentaje < 0 ? `Desc. ${Math.abs(cuota.porcentaje)}%` : cuota.porcentaje > 0 ? `Rec. ${cuota.porcentaje}%` : "Sin rec."}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {msg && <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl px-4 py-3 mb-4">{msg}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-[#CD212A] text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

      <button
        onClick={handleGuardar}
        disabled={saving}
        className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-60"
        style={{ background: "#008C45" }}
      >
        {saving ? (
          <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Guardando...</>
        ) : "Guardar cambios"}
      </button>
    </div>
  );
}
