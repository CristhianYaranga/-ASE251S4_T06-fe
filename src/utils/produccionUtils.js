/**
 * Conversión de unidades para Producción.
 * Backend: Kilogramos (cantidadKg).
 * Frontend UI: Toneladas.
 */
export function kgToTonDisplay(kg) {
  if (kg == null) return '—';
  const ton = kg / 1000;
  return parseFloat(ton.toFixed(2)).toString();
}

export function kgToTonNum(kg) {
  if (kg == null) return null;
  return parseFloat((kg / 1000).toFixed(4));
}

export function tonToKg(ton) {
  if (ton == null) return 0;
  return parseFloat((Number(ton) * 1000).toFixed(2));
}
