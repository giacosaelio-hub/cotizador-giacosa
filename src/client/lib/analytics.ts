// Eventos de "micro-conversión" para GTM/GA4 → import a Google Ads.
// Complementan a cotizacion_generada/cotizacion_completada, que son muy
// poco frecuentes para que Smart Bidding tenga señal suficiente.

export function trackWhatsAppClick(origen: string) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "click_whatsapp",
    contacto_origen: origen,
  });
}

export function trackMapsClick(origen: string) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "click_mapa",
    contacto_origen: origen,
  });
}
