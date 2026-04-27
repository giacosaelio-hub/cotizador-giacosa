import { useEffect, useState, useRef, useCallback, FormEvent } from "react";
import { Trash2, Info } from "lucide-react";

// Tipos existentes
type CuotaOpcion = { key: string; label: string; porcentaje: number; activo: boolean };
type TarjetaOpcion = { id: string; label: string; cuotas: CuotaOpcion[] };
type BobinaVariante = {
  id: string;
  calibre: number;
  ancho: number;
  tipo: "Galvanizada" | "Prepintada";
  color: string | null;
  precio: number;
};

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

// Mantener tu implementación real
type AjustesMasivosProps = {
  precios: Precios | null;
  editValues: EditValues;
  setPreview: (obj: EditValues | null) => void;
  preview: EditValues | null;
  applyMassAdjustment: () => void;
  canUndo: boolean;
  undoMassAdjustment: () => void;
  onResetPreview: () => void;
  successMsg: string;
  setSuccessMsg: React.Dispatch<React.SetStateAction<string>>;
};

// IMPORTANTE:
// Dejá aquí tu componente real AjustesMasivos
function AjustesMasivos(_props: AjustesMasivosProps) {
  return null;
}

// ====================================
/** MASS ADJUSTMENT PANEL COMPONENT **/
function MassAdjustmentPanel({
  precios,
  editValues,
  setEditValues,
  setDirty,
  // ---- NUEVO ----
  lastMassAdjustmentSnapshot,
  handleUndoLastMassAdjustment,
  massAdjustmentSuccessMsg,
}: {
  precios: Precios | null;
  editValues: EditValues;
  setEditValues: React.Dispatch<React.SetStateAction<EditValues>>;
  setDirty: React.Dispatch<React.SetStateAction<boolean>>;
  lastMassAdjustmentSnapshot?: EditValues | null; // nuevo prop opcional
  handleUndoLastMassAdjustment?: () => void;
  massAdjustmentSuccessMsg?: string;
}) {
  const [grupo, setGrupo] = useState<string>("");
  // PERFILADAS
  const [perfiladasTipo, setPerfiladasTipo] = useState<string>("");
  const [perfiladasMaterial, setPerfiladasMaterial] = useState<string>("");
  const [perfiladasCalibre, setPerfiladasCalibre] = useState<string>("");

  // BOBINAS
  const [bobinaCalibre, setBobinaCalibre] = useState<string>("");
  const [bobinaAncho, setBobinaAncho] = useState<string>("");

  // ESTANDAR
  const [estandarCat, setEstandarCat] = useState<string>("");
  const [estandarCalibre, setEstandarCalibre] = useState<string>("");
  const [estandarMedida, setEstandarMedida] = useState<string>("");

  const [porcentaje, setPorcentaje] = useState<string>("");

  const [mensaje, setMensaje] = useState<string>("");

  // --- DATA DERIVADA ---

  // OBTENER CATÁLOGOS DINÁMICOS

  // Para PERFILADAS
  // Keys están en format tipo_material_calibre (ej: "trapezoidal_galv_24")
  const perfiladasTipos = Array.from(new Set(Object.keys(precios?.chapas_perfiladas ?? {}).map(k => k.split("_")[0])));
  const perfiladasMateriales =
    perfiladasTipo
      ? Array.from(
          new Set(
            Object.keys(precios?.chapas_perfiladas ?? {})
              .filter(k => k.startsWith(perfiladasTipo))
              .map(k => k.split("_")[1])
          )
        )
      : [];
  const perfiladasCalibres =
    perfiladasTipo && perfiladasMaterial
      ? Array.from(
          new Set(
            Object.keys(precios?.chapas_perfiladas ?? {})
              .filter(k => k.startsWith(perfiladasTipo + "_" + perfiladasMaterial))
              .map(k => k.split("_")[2])
          )
        )
      : [];

  // Para BOBINAS
  // Las variantes tienen calibre, ancho, tipo.
  const bobinaCalibres =
    precios?.bobinas_variantes && precios.bobinas_variantes.length > 0
      ? Array.from(new Set(precios.bobinas_variantes.map(v => v.calibre.toString())))
      : [];
  const bobinaAnchos =
    bobinaCalibre && precios?.bobinas_variantes
      ? Array.from(
          new Set(
            precios.bobinas_variantes
              .filter(v => v.calibre.toString() === bobinaCalibre)
              .map(v => v.ancho.toFixed(2))
          )
        )
      : [];

  // Para ESTANDAR
  const estandarCats = Object.keys(precios?.chapas_estandar ?? {});
  // clave: cat -> k="24_1x2", "calibre_medida"
  const estandarCalibres =
    estandarCat
      ? Array.from(
          new Set(
            Object.keys(precios?.chapas_estandar?.[estandarCat] ?? {})
              .map(k => k.split("_")[0])
          )
        )
      : [];
  const estandarMedidas =
    estandarCat && estandarCalibre
      ? Array.from(
          new Set(
            Object.keys(precios?.chapas_estandar?.[estandarCat] ?? {}).filter(k => k.split("_")[0] === estandarCalibre).map(k => k.split("_").slice(1).join("_"))
          )
        )
      : [];

  // --- Aplicar ajuste masivo ---
  function applyMassAdjustmentToEditValues() {
    const pct = Number(porcentaje);
    if (!porcentaje || isNaN(pct)) {
      setMensaje("Ingresá un porcentaje válido.");
      return;
    }
    let modificado = false;

    // Copia profunda de editValues
    const next = JSON.parse(JSON.stringify(editValues)) as EditValues;

    if (grupo === "perfiladas") {
      // key: tipo_material_calibre
      Object.entries(next.chapas_perfiladas ?? {}).forEach(([k, v]) => {
        const [tipo, mat, cal] = k.split("_");
        if (
          (!perfiladasTipo || tipo === perfiladasTipo) &&
          (!perfiladasMaterial || mat === perfiladasMaterial) &&
          (!perfiladasCalibre || cal === perfiladasCalibre)
        ) {
          const viejo = Number(v || 0);
          const nuevo = (viejo * (1 + pct / 100)).toFixed(2);
          next.chapas_perfiladas[k] = nuevo;
          modificado = true;
        }
      });
    } else if (grupo === "bobinas") {
      // filtrar variantes por calibre/ancho
      if (!precios?.bobinas_variantes) return;
      for (const variante of precios.bobinas_variantes) {
        if ((bobinaCalibre === "" || variante.calibre.toString() === bobinaCalibre) &&
            (bobinaAncho === "" || variante.ancho.toFixed(2) === bobinaAncho)
        ) {
          const id = variante.id;
          const v = next.bobinas_variantes[id];
          const viejo = Number(v || 0);
          const nuevo = (viejo * (1 + pct / 100)).toFixed(2);
          next.bobinas_variantes[id] = nuevo;
          modificado = true;
        }
      }
    } else if (grupo === "estandar") {
      // cat, key = calibre_medida
      Object.entries(next.chapas_estandar ?? {}).forEach(([cat, obj]) => {
        if (!estandarCat || cat === estandarCat) {
          Object.entries(obj ?? {}).forEach(([k, v]) => {
            const [cal, ...rest] = k.split("_");
            const medida = rest.join("_");
            if (
              (!estandarCalibre || cal === estandarCalibre) &&
              (!estandarMedida || medida === estandarMedida)
            ) {
              const viejo = Number(v || 0);
              const nuevo = (viejo * (1 + pct / 100)).toFixed(2);
              next.chapas_estandar[cat][k] = nuevo;
              modificado = true;
            }
          });
        }
      });
    }

    if (modificado) {
      setEditValues(next);
      setDirty(true);
      setMensaje("Ajuste masivo aplicado. Recordá guardar los cambios.");
    } else {
      setMensaje("No hay valores para ajustar con los filtros seleccionados.");
    }
  }

  // --- Resetear selects al cambiar grupo
  function clearAll() {
    setPerfiladasTipo("");
    setPerfiladasMaterial("");
    setPerfiladasCalibre("");
    setBobinaCalibre("");
    setBobinaAncho("");
    setEstandarCat("");
    setEstandarCalibre("");
    setEstandarMedida("");
    setMensaje("");
    setPorcentaje("");
  }

  // Al cambiar grupo, limpiar selects dependientes y mensaje
  function onChangeGrupo(val: string) {
    setGrupo(val);
    clearAll();
  }

  // Limpiar hijos
  function onChangePerfiladasTipo(val: string) {
    setPerfiladasTipo(val);
    setPerfiladasMaterial("");
    setPerfiladasCalibre("");
  }
  function onChangePerfiladasMaterial(val: string) {
    setPerfiladasMaterial(val);
    setPerfiladasCalibre("");
  }
  function onChangePerfiladasCalibre(val: string) {
    setPerfiladasCalibre(val);
  }

  function onChangeBobinaCalibre(val: string) {
    setBobinaCalibre(val);
    setBobinaAncho("");
  }
  function onChangeBobinaAncho(val: string) {
    setBobinaAncho(val);
  }

  function onChangeEstandarCat(val: string) {
    setEstandarCat(val);
    setEstandarCalibre("");
    setEstandarMedida("");
  }
  function onChangeEstandarCalibre(val: string) {
    setEstandarCalibre(val);
    setEstandarMedida("");
  }
  function onChangeEstandarMedida(val: string) {
    setEstandarMedida(val);
  }

  // ---- INICIO AGREGADO BOTÓN DESHACER ----
  // Si los props extras para deshacer no están, usar falsy por defecto.
  const showUndoBtn =
    typeof lastMassAdjustmentSnapshot !== "undefined" && lastMassAdjustmentSnapshot;

  // ---- FIN AGREGADO BOTÓN DESHACER ----

  return (
    <div
      style={{ marginBottom: 24, background: "#fff" }}
      className="rounded-2xl shadow-sm border border-gray-100 p-6 mb-4"
    >
      <h2 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wider">
        <span role="img" aria-label="Ajustes masivos">📊</span> Ajuste Masivo de Precios
      </h2>

      {/* ---- BOTÓN para deshacer último ajuste masivo ---- */}
      {showUndoBtn && handleUndoLastMassAdjustment && (
        <div className="mb-4">
          <button
            type="button"
            className="py-2 px-4 rounded-xl bg-[#CD212A] text-white font-bold hover:bg-[#A50F18] transition-all disabled:opacity-60"
            style={{ minWidth: 160 }}
            onClick={handleUndoLastMassAdjustment}
          >
            Deshacer último ajuste
          </button>
        </div>
      )}

      {massAdjustmentSuccessMsg === "Se revirtió el último ajuste." && (
        <div className="mb-3 px-2 py-2 rounded border text-sm"
          style={{
            background: "#F0FDF4",
            color: "#096B29",
            borderColor: "#BBF7D0"
          }}
        >
          ¡Último ajuste masivo deshecho!
        </div>
      )}
      {/* ---- FIN BOTÓN Y MENSAJE DESHACER ---- */}

      <div className="flex flex-wrap items-end gap-3">

        {/* GRUPO */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Grupo</label>
          <select
            className="border border-gray-200 rounded-lg px-2 py-1 text-sm"
            value={grupo}
            onChange={e => onChangeGrupo(e.target.value)}
          >
            <option value="">-- Seleccionar --</option>
            <option value="perfiladas">Perfiladas</option>
            <option value="bobinas">Bobinas</option>
            <option value="estandar">Estándar</option>
          </select>
        </div>

        {/* PERFILADAS SELECTS */}
        {grupo === "perfiladas" && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
              <select
                className="border border-gray-200 rounded-lg px-2 py-1 text-sm"
                value={perfiladasTipo}
                onChange={e => onChangePerfiladasTipo(e.target.value)}
              >
                <option value="">-- Todos --</option>
                {perfiladasTipos.map(t => (
                  <option value={t} key={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            {perfiladasTipo && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Material</label>
                <select
                  className="border border-gray-200 rounded-lg px-2 py-1 text-sm"
                  value={perfiladasMaterial}
                  onChange={e => onChangePerfiladasMaterial(e.target.value)}
                >
                  <option value="">-- Todos --</option>
                  {perfiladasMateriales.map(m => (
                    <option value={m} key={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                  ))}
                </select>
              </div>
            )}
            {perfiladasTipo && perfiladasMaterial && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Calibre</label>
                <select
                  className="border border-gray-200 rounded-lg px-2 py-1 text-sm"
                  value={perfiladasCalibre}
                  onChange={e => onChangePerfiladasCalibre(e.target.value)}
                >
                  <option value="">-- Todos --</option>
                  {perfiladasCalibres.map(cal => (
                    <option value={cal} key={cal}>{cal}</option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        {/* BOBINAS SELECTS */}
        {grupo === "bobinas" && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Calibre</label>
              <select
                className="border border-gray-200 rounded-lg px-2 py-1 text-sm"
                value={bobinaCalibre}
                onChange={e => onChangeBobinaCalibre(e.target.value)}
              >
                <option value="">-- Todos --</option>
                {bobinaCalibres.map(c => (
                  <option value={c} key={c}>{c}</option>
                ))}
              </select>
            </div>
            {bobinaCalibre && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Ancho</label>
                <select
                  className="border border-gray-200 rounded-lg px-2 py-1 text-sm"
                  value={bobinaAncho}
                  onChange={e => onChangeBobinaAncho(e.target.value)}
                >
                  <option value="">-- Todos --</option>
                  {bobinaAnchos.map(a => (
                    <option value={a} key={a}>{a} mts</option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        {/* ESTANDAR SELECTS */}
        {grupo === "estandar" && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Categoría</label>
              <select
                className="border border-gray-200 rounded-lg px-2 py-1 text-sm"
                value={estandarCat}
                onChange={e => onChangeEstandarCat(e.target.value)}
              >
                <option value="">-- Todas --</option>
                {estandarCats.map(c => (
                  <option value={c} key={c}>{c.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
            {estandarCat && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Calibre</label>
                <select
                  className="border border-gray-200 rounded-lg px-2 py-1 text-sm"
                  value={estandarCalibre}
                  onChange={e => onChangeEstandarCalibre(e.target.value)}
                >
                  <option value="">-- Todos --</option>
                  {estandarCalibres.map(cal => (
                    <option value={cal} key={cal}>{cal}</option>
                  ))}
                </select>
              </div>
            )}
            {estandarCat && estandarCalibre && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Medida</label>
                <select
                  className="border border-gray-200 rounded-lg px-2 py-1 text-sm"
                  value={estandarMedida}
                  onChange={e => onChangeEstandarMedida(e.target.value)}
                >
                  <option value="">-- Todas --</option>
                  {estandarMedidas.map(med => (
                    <option value={med} key={med}>{med}</option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        {/* PORCENTAJE */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Porcentaje (%)</label>
          <input
            type="number"
            className="border border-gray-200 rounded-lg px-2 py-1 text-sm w-28"
            value={porcentaje}
            onChange={e => setPorcentaje(e.target.value)}
            placeholder="Ej: 10"
            step="any"
          />
        </div>

        <div>
          <button
            type="button"
            className="py-2 px-4 rounded-xl bg-[#008C45] text-white font-bold hover:bg-[#00703A] transition-all disabled:opacity-60"
            style={{ minWidth: 112 }}
            onClick={applyMassAdjustmentToEditValues}
          >
            Aplicar ajuste
          </button>
        </div>
      </div>
      {mensaje && (
        <div className="mt-3 px-2 py-2 rounded border text-sm"
          style={{
            background: mensaje.startsWith("Ajuste masivo aplicado") ? "#F0FDF4" : "#FEF6F6",
            color: mensaje.startsWith("Ajuste masivo aplicado") ? "#096B29" : "#B91C1C",
            borderColor: mensaje.startsWith("Ajuste masivo aplicado") ? "#BBF7D0" : "#FECACA"
          }}
        >
          {mensaje}
        </div>
      )}
    </div>
  );
}
// ====================================

// --- Implementaciones mínimas (real) ---

function LoginGate(props: {
  onAuth: () => Promise<void> | void;
  loginMsg?: string;
}): JSX.Element {
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) {
        await props.onAuth?.();
      } else {
        setError("Contraseña incorrecta o acceso denegado.");
      }
    } catch (e) {
      setError("Error de conexión.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xs mx-auto p-8 mt-32 bg-white rounded-2xl border border-gray-200 shadow">
      <h2 className="font-black text-base text-gray-800 mb-6">Login administrador</h2>
      {props.loginMsg && (
        <div className="mb-2 text-green-700 text-sm rounded border border-green-100 bg-green-50 px-3 py-2">
          {props.loginMsg}
        </div>
      )}
      {error && (
        <div className="mb-2 text-red-700 text-sm rounded border border-red-100 bg-red-50 px-3 py-2">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="password"
          value={pw}
          required
          onChange={e => setPw(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-base focus:outline-none"
          placeholder="Contraseña"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-2 py-2 rounded-xl bg-[#008C45] text-white font-bold hover:bg-[#00703A] transition-all disabled:opacity-60"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}

function NumericControlledInput(props: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  step?: string;
  min?: string;
  placeholder?: string;
}): JSX.Element {
  return (
    <input
      type="number"
      value={props.value}
      onChange={e => props.onChange(e.target.value)}
      className={props.className}
      step={props.step}
      min={props.min}
      placeholder={props.placeholder}
    />
  );
}

function AddVarianteForm(props: {
  onAdd: (variant: Omit<BobinaVariante, "id">) => void;
}): JSX.Element | null {
  // Implementación mínima segura: no rompe el render, permite ampliación futura.
  return null;
}

// ---

type EditValues = {
  dolar: string;
  chapas_perfiladas: Record<string, string>;
  chapas_estandar: Record<string, Record<string, string>>;
  bobinas_variantes: Record<string, string>;
  formas_pago: Record<string, Record<string, string>>;
};

function buildEditValuesFromPrecios(precios: Precios): EditValues {
  const next: EditValues = {
    dolar: precios.dolar?.toString() ?? "",
    chapas_perfiladas: {},
    chapas_estandar: {},
    bobinas_variantes: {},
    formas_pago: {},
  };

  Object.entries(precios.chapas_perfiladas ?? {}).forEach(([k, v]) => {
    next.chapas_perfiladas[k] = v?.toString() ?? "";
  });

  Object.entries(precios.chapas_estandar ?? {}).forEach(([cat, obj]) => {
    next.chapas_estandar[cat] = {};
    Object.entries(obj).forEach(([k, v]) => {
      next.chapas_estandar[cat][k] = v?.toString() ?? "";
    });
  });

  if (Array.isArray(precios.bobinas_variantes)) {
    for (const variante of precios.bobinas_variantes) {
      next.bobinas_variantes[variante.id] = variante.precio?.toString() ?? "";
    }
  }

  if (Array.isArray(precios.formas_pago)) {
    for (const tarjeta of precios.formas_pago) {
      next.formas_pago[tarjeta.id] = {};
      for (const cuota of tarjeta.cuotas) {
        next.formas_pago[tarjeta.id][cuota.key] = cuota.porcentaje?.toString() ?? "";
      }
    }
  }

  return next;
}

export default function AdminPrecios() {
  const [authChecking, setAuthChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [loadingPrecios, setLoadingPrecios] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [sessionMsg, setSessionMsg] = useState<string | undefined>(undefined);

  const [precios, setPrecios] = useState<Precios | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const [dirty, setDirty] = useState(false);
  const lastSavedPrecios = useRef<Precios | null>(null);

  const [editValues, setEditValues] = useState<EditValues>({
    dolar: "",
    chapas_perfiladas: {},
    chapas_estandar: {},
    bobinas_variantes: {},
    formas_pago: {},
  });

  const [massAdjustmentPreview, setMassAdjustmentPreview] = useState<EditValues | null>(null);
  const [lastMassAdjustmentSnapshot, setLastMassAdjustmentSnapshot] = useState<EditValues | null>(null);
  const [massAdjustmentSuccessMsg, setMassAdjustmentSuccessMsg] = useState("");

  const loadAdminData = useCallback(async () => {
    setAuthChecking(true);
    setLoadingPrecios(false);
    setErrorMsg("");
    setSessionMsg(undefined);
    setMsg("");
    setError("");

    try {
      const authRes = await fetch("/api/admin/me", { credentials: "include" });

      if (authRes.status === 401 || authRes.status === 403) {
        setAuthenticated(false);
        setPrecios(null);
        setAuthChecking(false);
        return;
      }

      if (!authRes.ok) {
        const text = await authRes.text().catch(() => "");
        setAuthenticated(false);
        setPrecios(null);
        setAuthChecking(false);
        setErrorMsg(`Error al verificar sesión: ${text || authRes.statusText || "Desconocido"}`);
        return;
      }

      setAuthenticated(true);
      setAuthChecking(false);
      setLoadingPrecios(true);

      const preRes = await fetch("/api/precios", { credentials: "include" });

      if (!preRes.ok) {
        const text = await preRes.text().catch(() => "");
        setPrecios(null);
        setLoadingPrecios(false);
        setErrorMsg(`No se pudieron cargar los precios: ${text || preRes.statusText || "Error desconocido"}`);
        return;
      }

      const preciosData = await preRes.json();

      if (!preciosData || typeof preciosData !== "object") {
        setPrecios(null);
        setLoadingPrecios(false);
        setErrorMsg("Error: Datos de precios inválidos.");
        return;
      }

      setPrecios(preciosData as Precios);
      setLoadingPrecios(false);
    } catch {
      setAuthenticated(false);
      setPrecios(null);
      setAuthChecking(false);
      setLoadingPrecios(false);
      setErrorMsg("No se pudo conectar al servidor (red o backend sin respuesta).");
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  useEffect(() => {
    if (!precios || typeof precios !== "object") return;
    const next = buildEditValuesFromPrecios(precios);
    setEditValues(next);
    lastSavedPrecios.current = precios;
    setDirty(false);
  }, [precios]);

  useEffect(() => {
    if (!precios) return;
    const valuesFromPrecios = buildEditValuesFromPrecios(precios);
    setDirty(JSON.stringify(editValues) !== JSON.stringify(valuesFromPrecios));
  }, [editValues, precios]);

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    } catch {}
    setAuthenticated(false);
    setSessionMsg("Sesión finalizada.");
    setPrecios(null);
  }

  const setDolar = (value: string) => {
    setEditValues(e => ({ ...e, dolar: value }));
  };

  const setFlat = (cat: "chapas_perfiladas", key: string, v: string) => {
    setEditValues(e => ({
      ...e,
      [cat]: { ...e[cat], [key]: v },
    }));
  };

  const setBobinaVariantePrecio = (id: string, value: string) => {
    setEditValues(e => ({
      ...e,
      bobinas_variantes: { ...e.bobinas_variantes, [id]: value },
    }));
  };

  const removeBobinaVariante = (id: string) => {
    setPrecios(prev => {
      if (!prev?.bobinas_variantes) return prev;
      return {
        ...prev,
        bobinas_variantes: prev.bobinas_variantes.filter(v => v.id !== id),
      };
    });
  };

  const addBobinaVariante = (variant: Omit<BobinaVariante, "id">) => {
    setPrecios(prev => {
      if (!prev) return prev;
      const newId =
        Math.max(
          0,
          ...(prev.bobinas_variantes?.map(v => Number((v.id || "0").replace(/[^\d]/g, ""))) ?? [])
        ) + 1;

      const v: BobinaVariante = { ...variant, id: String(newId) };

      return {
        ...prev,
        bobinas_variantes: [...(prev.bobinas_variantes || []), v],
      };
    });
  };

  const setEstandar = (cat: string, key: string, value: string) => {
    setEditValues(e => ({
      ...e,
      chapas_estandar: {
        ...e.chapas_estandar,
        [cat]: {
          ...(e.chapas_estandar[cat] ?? {}),
          [key]: value,
        },
      },
    }));
  };

  const setCuotaActivo = (tarjetaId: string, cuotaKey: string, active: boolean) => {
    setPrecios(prev => {
      if (!prev?.formas_pago) return prev;
      return {
        ...prev,
        formas_pago: prev.formas_pago.map(tarj =>
          tarj.id === tarjetaId
            ? {
                ...tarj,
                cuotas: tarj.cuotas.map(q =>
                  q.key === cuotaKey ? { ...q, activo: active } : q
                ),
              }
            : tarj
        ),
      };
    });
  };

  const setCuotaPorcentaje = (tarjetaId: string, cuotaKey: string, value: string) => {
    setEditValues(e => ({
      ...e,
      formas_pago: {
        ...e.formas_pago,
        [tarjetaId]: {
          ...(e.formas_pago[tarjetaId] ?? {}),
          [cuotaKey]: value,
        },
      },
    }));
  };

  async function handleGuardar() {
    if (!precios) return;

    setSaving(true);
    setError("");
    setMsg("");

    try {
      const nuevos: Precios = {
        ...precios,
        dolar: Number(editValues.dolar || 0),
        chapas_perfiladas: Object.fromEntries(
          Object.entries(editValues.chapas_perfiladas).map(([k, v]) => [k, Number(v || 0)])
        ),
        chapas_estandar: Object.fromEntries(
          Object.entries(editValues.chapas_estandar).map(([cat, obj]) => [
            cat,
            Object.fromEntries(
              Object.entries(obj).map(([k, v]) => [k, Number(v || 0)])
            ),
          ])
        ),
        bobinas: precios.bobinas ?? {},
        bobinas_variantes: precios.bobinas_variantes
          ? precios.bobinas_variantes.map(v => ({
              ...v,
              precio: Number(editValues.bobinas_variantes[v.id] ?? v.precio ?? 0),
            }))
          : undefined,
        formas_pago: precios.formas_pago
          ? precios.formas_pago.map(tarjeta => ({
              ...tarjeta,
              cuotas: tarjeta.cuotas.map(cuota => ({
                ...cuota,
                porcentaje:
                  editValues.formas_pago[tarjeta.id] &&
                  typeof editValues.formas_pago[tarjeta.id][cuota.key] !== "undefined"
                    ? Number(editValues.formas_pago[tarjeta.id][cuota.key] || 0)
                    : cuota.porcentaje,
              })),
            }))
          : undefined,
      };

      // CORREGIDO: hace POST a /api/precios (no /api/admin/precios)
      const res = await fetch("/api/precios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(nuevos),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        setError(text || "Error al guardar los precios.");
        return;
      }

      const data = await res.json();
      // CORREGIDO: la respuesta es { success: true, precios: updated }
      setPrecios(data.precios);
      setMsg("Cambios guardados con éxito.");
      setTimeout(() => setMsg(""), 3500);
    } catch (err: any) {
      setError(err?.message ?? "Error al guardar los cambios");
      setTimeout(() => setError(""), 3500);
    } finally {
      setSaving(false);
    }
  }

  function handleApplyMassAdjustment() {
    if (!massAdjustmentPreview) {
      setMassAdjustmentSuccessMsg("");
      return;
    }
    setLastMassAdjustmentSnapshot(JSON.parse(JSON.stringify(editValues)));
    setEditValues(massAdjustmentPreview);
    setDirty(true);
    setMassAdjustmentPreview(null);
    setMassAdjustmentSuccessMsg(
      "Se aplicó el ajuste masivo correctamente. Recordá guardar los cambios para hacerlo permanente."
    );
  }

  function handleUndoLastMassAdjustment() {
    if (!lastMassAdjustmentSnapshot) return;
    setEditValues(lastMassAdjustmentSnapshot);
    setLastMassAdjustmentSnapshot(null);
    setDirty(true);
    setMassAdjustmentSuccessMsg("Se revirtió el último ajuste.");
  }

  function resetMassPreview() {
    setMassAdjustmentPreview(null);
  }

  if (authChecking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-400 text-sm">
        Verificando acceso de administrador...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <LoginGate
        onAuth={async () => {
          await loadAdminData();
        }}
        loginMsg={sessionMsg}
      />
    );
  }

  if (loadingPrecios) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-400 text-sm">
        Cargando panel...
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 border border-red-200 text-[#CD212A] text-sm font-semibold rounded-xl px-4 py-4">
          {errorMsg}
        </div>
        <div className="mt-5">
          <button
            className="py-2 px-6 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm font-semibold"
            onClick={loadAdminData}
          >
            Volver a intentar
          </button>
        </div>
      </div>
    );
  }

  if (!precios) {
    return <div style={{ padding: 20 }}>Cargando precios...</div>;
  }

  let ajustesMasivosBloque: React.ReactNode = null;
  let ajustesMasivosError = false;

  if (authenticated && precios && !loadingPrecios && !errorMsg) {
    try {
      ajustesMasivosBloque = (
        <div style={{ marginBottom: "20px" }}>
          <AjustesMasivos
            precios={precios}
            editValues={editValues}
            setPreview={setMassAdjustmentPreview}
            preview={massAdjustmentPreview}
            applyMassAdjustment={handleApplyMassAdjustment}
            canUndo={!!lastMassAdjustmentSnapshot}
            undoMassAdjustment={handleUndoLastMassAdjustment}
            onResetPreview={resetMassPreview}
            successMsg={massAdjustmentSuccessMsg}
            setSuccessMsg={setMassAdjustmentSuccessMsg}
          />
        </div>
      );
    } catch {
      ajustesMasivosError = true;
    }
  }

  // --- AGREGADO: Mostrar MassAdjustmentPanel con props para deshacer --- 
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* INSERT: MassAdjustmentPanel arriba del panel admin */}
      <MassAdjustmentPanel
        precios={precios}
        editValues={editValues}
        setEditValues={setEditValues}
        setDirty={setDirty}
        // Nuevo: props para botón deshacer y mensaje
        lastMassAdjustmentSnapshot={lastMassAdjustmentSnapshot}
        handleUndoLastMassAdjustment={handleUndoLastMassAdjustment}
        massAdjustmentSuccessMsg={massAdjustmentSuccessMsg}
      />

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 mb-1">Panel de Administración</h1>
          <p className="text-sm text-gray-500">
            Editá precios y configuración global.{" "}
            <span className="font-semibold text-gray-600">
              Los cambios afectan el cotizador y a todos los usuarios.
            </span>{" "}
            Recordá presionar <b>Guardar cambios</b>.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold"
        >
          Cerrar sesión
        </button>
      </div>

      {dirty && (
        <div className="mb-6 flex items-center gap-2 rounded-xl px-4 py-3 bg-yellow-50 border border-yellow-200 text-yellow-800 font-semibold">
          <Info className="w-5 h-5 text-yellow-500" />
          Tenés cambios sin guardar
        </div>
      )}

      {ajustesMasivosError ? (
        <div className="mb-4 px-4 py-3 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-900 font-semibold text-center">
          No se pudo cargar Ajustes Masivos
        </div>
      ) : (
        ajustesMasivosBloque
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <h2 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wider">
          Tipo de cambio
        </h2>
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-600 font-medium w-28">Dólar (ARS)</label>
          <NumericControlledInput
            value={editValues.dolar ?? ""}
            onChange={setDolar}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold w-36 focus:outline-none focus:border-[#008C45]"
            step="1"
            min="0"
            placeholder="Por ej: 1100"
          />
        </div>
      </div>

      {precios.chapas_perfiladas && Object.keys(precios.chapas_perfiladas).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <h2 className="font-bold text-gray-800 mb-1 text-sm uppercase tracking-wider">
            Chapas Perfiladas
          </h2>
          <div className="flex flex-col gap-3">
            {Object.entries(precios.chapas_perfiladas).map(([k]) => (
              <div key={k} className="flex items-center gap-3">
                <label className="text-sm text-gray-600 flex-1">{CHAPA_LABELS[k] ?? k}</label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">USD</span>
                  <NumericControlledInput
                    value={editValues.chapas_perfiladas[k] ?? ""}
                    onChange={val => setFlat("chapas_perfiladas", k, val)}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-24 text-right focus:outline-none focus:border-[#008C45]"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {precios && Array.isArray(precios.bobinas_variantes) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <h2 className="font-bold text-gray-800 mb-1 text-sm uppercase tracking-wider">
            Bobinas de Acero · Variantes
          </h2>

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
                {precios.bobinas_variantes.map((v) => {
                  const desc =
                    v.tipo === "Prepintada" && v.color
                      ? `Bobina Prepintada ${v.color} Cal. ${v.calibre} — ${v.ancho.toFixed(2)} mts`
                      : `Bobina Galvanizada Cal. ${v.calibre} — ${v.ancho.toFixed(2)} mts`;

                  return (
                    <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 pr-3 text-gray-700 font-medium">{desc}</td>
                      <td className="py-2.5 pr-3 text-right">
                        <NumericControlledInput
                          value={editValues.bobinas_variantes[v.id] ?? ""}
                          onChange={val => setBobinaVariantePrecio(v.id, val)}
                          className="border border-gray-200 rounded-lg px-2 py-1 text-sm w-20 text-right focus:outline-none focus:border-[#008C45]"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
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
      )}

      {precios.chapas_estandar && Object.keys(precios.chapas_estandar).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <h2 className="font-bold text-gray-800 mb-1 text-sm uppercase tracking-wider">
            Chapas Estándar
          </h2>

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
                  <p className="text-xs font-bold text-gray-600 mb-2 border-b border-gray-100 pb-1">
                    {catLabels[cat] ?? cat.replace(/_/g, " ")}
                  </p>
                  <div className="flex flex-col gap-2">
                    {Object.entries(items).map(([k]) => (
                      <div key={k} className="flex items-center gap-3">
                        <label className="text-sm text-gray-600 flex-1">{formatKey(k)}</label>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400">USD</span>
                          <NumericControlledInput
                            value={editValues.chapas_estandar[cat]?.[k] ?? ""}
                            onChange={val => setEstandar(cat, k, val)}
                            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-24 text-right focus:outline-none focus:border-[#008C45]"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
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
      )}

      {precios.formas_pago && precios.formas_pago.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-1 text-sm uppercase tracking-wider">
            Formas de Pago
          </h2>

          <div className="flex flex-col gap-6">
            {precios.formas_pago.map((tarjeta) => (
              <div key={tarjeta.id}>
                <p className="text-xs font-bold text-gray-600 mb-2 border-b border-gray-100 pb-1">
                  {tarjeta.label}
                </p>
                <div className="flex flex-col gap-2">
                  {tarjeta.cuotas.map((cuota) => {
                    const editedValue =
                      editValues.formas_pago[tarjeta.id] &&
                      typeof editValues.formas_pago[tarjeta.id][cuota.key] !== "undefined"
                        ? Number(editValues.formas_pago[tarjeta.id][cuota.key] || 0)
                        : cuota.porcentaje;

                    return (
                      <div key={cuota.key} className="flex flex-wrap items-center gap-3">
                        <input
                          type="checkbox"
                          checked={cuota.activo}
                          onChange={(e) => setCuotaActivo(tarjeta.id, cuota.key, e.target.checked)}
                          className="accent-[#008C45] w-4 h-4 flex-shrink-0"
                          id={`cb-${tarjeta.id}-${cuota.key}`}
                        />
                        <label
                          htmlFor={`cb-${tarjeta.id}-${cuota.key}`}
                          className="text-xs text-gray-500 flex-1 min-w-[100px]"
                        >
                          {cuota.label}
                        </label>
                        <div className="flex items-center gap-1">
                          <NumericControlledInput
                            value={editValues.formas_pago[tarjeta.id]?.[cuota.key] ?? ""}
                            onChange={val => setCuotaPorcentaje(tarjeta.id, cuota.key, val)}
                            className="border border-gray-200 rounded-lg px-2 py-1 text-sm w-20 text-right focus:outline-none focus:border-[#008C45]"
                            step="1"
                            placeholder="0"
                          />
                          <span className="text-xs text-gray-400">%</span>
                        </div>
                        <span
                          className={[
                            "text-xs w-24 text-right font-semibold inline-block",
                            editedValue < 0
                              ? "text-green-600"
                              : editedValue > 0
                              ? "text-amber-600"
                              : "text-gray-500",
                          ].join(" ")}
                        >
                          {editedValue < 0
                            ? `Descuento ${Math.abs(editedValue)}%`
                            : editedValue > 0
                            ? `Recargo ${editedValue}%`
                            : "Sin recargo"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl px-4 py-3 mb-4">
          {msg}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-[#CD212A] text-sm rounded-xl px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <button
        onClick={handleGuardar}
        disabled={saving}
        className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-60"
        style={{ background: "#008C45" }}
      >
        {saving ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Guardando...
          </>
        ) : (
          "Guardar cambios"
        )}
      </button>
    </div>
  );
}