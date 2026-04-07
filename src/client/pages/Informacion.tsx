interface Props {
  onCotizar: () => void;
}

const GREEN = "#008C45";
const RED = "#CD212A";

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
      {children}
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-bold text-gray-900 mb-3" style={{ color: GREEN }}>
      {children}
    </h2>
  );
}

function Bullet({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 mt-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: GREEN }} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SubCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
      <p className="font-semibold text-gray-800 text-sm mb-0.5">{title}</p>
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}

function CotizarBtn({ onCotizar }: { onCotizar: () => void }) {
  return (
    <button
      onClick={onCotizar}
      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90"
      style={{ background: GREEN }}
    >
      Cotizar ahora →
    </button>
  );
}

export default function Informacion({ onCotizar }: Props) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* H1 */}
      <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-2 text-center">
        Chapas y bobinas en Tucumán:<br />
        <span style={{ color: GREEN }}>cómo elegir y calcular correctamente</span>
      </h1>
      <p className="text-center text-sm text-gray-400 mb-7">
        Guía de productos · Giacosa Elio — Corralón y Materiales para la Construcción
      </p>

      {/* CTA top */}
      <div className="text-center mb-8">
        <CotizarBtn onCotizar={onCotizar} />
      </div>

      {/* Sección 1 */}
      <Section>
        <H2>Qué estás por comprar</H2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          En este cotizador trabajamos con dos tipos principales de materiales: <strong>chapas para techo</strong> y <strong>bobinas de acero</strong> (también conocidas como chapa en bobina).
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          Cada uno tiene una forma distinta de uso, cálculo y aplicación, por lo que es importante entender sus diferencias antes de cotizar.
        </p>
      </Section>

      {/* Sección 2 */}
      <Section>
        <H2>Chapas para techo</H2>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          Las chapas para techo se utilizan principalmente en viviendas, galpones y estructuras metálicas en Tucumán y toda la región.
          Se trabajan a medida, es decir, el largo se adapta según la necesidad del cliente.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SubCard
            title="Sinusoidal"
            text="Mayor resistencia estructural. Ideal para superficies más grandes o exigidas como galpones industriales."
          />
          <SubCard
            title="Trapezoidal"
            text="Uso general en techos y cerramientos. El perfil ondulado es el más común en construcciones residenciales."
          />
        </div>
      </Section>

      {/* Sección 3 */}
      <Section>
        <H2>Materiales de las chapas</H2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
          <SubCard
            title="Galvanizada"
            text="Opción económica. Recubrimiento de zinc que la protege de la corrosión."
          />
          <SubCard
            title="Cincalum"
            text="Mayor durabilidad frente a la intemperie. Ideal para techos expuestos en Tucumán."
          />
          <SubCard
            title="Prepintada"
            text="Mejor terminación estética y mayor protección. Disponible en varios colores."
          />
        </div>
      </Section>

      {/* Sección 4 */}
      <Section>
        <H2>Calibres (espesor del material)</H2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          El calibre define el espesor de la chapa o bobina. A mayor número de calibre, menor espesor del material.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 flex items-center gap-3">
            <span className="text-2xl font-black" style={{ color: GREEN }}>24</span>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Calibre 24</p>
              <p className="text-xs text-gray-500">Más grueso y resistente</p>
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 flex items-center gap-3">
            <span className="text-2xl font-black" style={{ color: RED }}>27</span>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Calibre 27</p>
              <p className="text-xs text-gray-500">Más liviano y económico</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">La elección depende del uso y la estructura a cubrir.</p>
      </Section>

      {/* Sección 5 */}
      <Section>
        <H2>Cómo se calcula el largo de una chapa</H2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          El largo de la chapa depende de la superficie a cubrir en tu obra o proyecto.
        </p>
        <Bullet items={[
          "Medí desde la cumbrera hasta el final del techo, siguiendo la pendiente.",
          "Agregá entre 15 y 20 cm de vuelo (sobrante en el alero).",
          "Las chapas se cortan a medida para evitar desperdicio y facilitar la instalación.",
        ]} />
      </Section>

      {/* Sección 6 */}
      <Section>
        <H2>Ancho útil y orientación</H2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          Cada tipo de chapa tiene un ancho útil diferente. Esto es importante para calcular cuántas chapas necesitás.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <SubCard title="Trapezoidal" text="Ancho útil: aproximadamente 1.10 m" />
          <SubCard title="Sinusoidal" text="Ancho útil: aproximadamente 1.00 m" />
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          La colocación se realiza en el sentido de la pendiente del techo, de abajo hacia arriba, con traslapes en los costados.
        </p>
      </Section>

      {/* Sección 7 */}
      <Section>
        <H2>Bobinas de acero (chapa en bobina)</H2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          Las bobinas de acero, también conocidas como <strong>chapa en bobina</strong>, son rollos de material que se venden por metro lineal en Tucumán.
          Su precio depende principalmente del calibre y el ancho.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          Son utilizadas principalmente por hojalateros, zingueros y profesionales del rubro para fabricar:
        </p>
        <Bullet items={[
          "Canaletas y bajadas pluviales",
          "Cumbreras para cubiertas",
          "Conductos de ventilación y extracción",
          "Piezas y desarrollos a medida",
        ]} />
      </Section>

      {/* Sección 8 */}
      <Section>
        <H2>Cómo se calcula el precio</H2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          El precio de los materiales en Giacosa Elio depende de varios factores combinados:
        </p>
        <Bullet items={[
          "Tipo de producto (chapa perfilada, bobina, chapa estándar)",
          "Calibre del material (espesor)",
          "Formato (largo en chapas, ancho en bobinas)",
          "Cantidad solicitada",
          "Forma de pago (efectivo, tarjeta de débito, crédito)",
        ]} />
        <div className="mt-5 rounded-xl p-4 text-center" style={{ background: "#f0faf4", border: "1.5px solid #c3e8d4" }}>
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Calculá el valor exacto de tu pedido con nuestro cotizador online
          </p>
          <CotizarBtn onCotizar={onCotizar} />
        </div>
      </Section>

      {/* CTA bottom */}
      <div className="text-center mt-4 mb-6">
        <p className="text-sm text-gray-500 mb-3">¿Ya sabés lo que necesitás? Empezá tu cotización ahora.</p>
        <CotizarBtn onCotizar={onCotizar} />
      </div>

    </div>
  );
}
