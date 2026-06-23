export function calcularDistancia(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function calcularFrete(distanciaKm: number) {
  if (distanciaKm <= 3) return 3.99;

  if (distanciaKm <= 5) return 5.99;

  if (distanciaKm <= 10) return 8.99;

  return 12.99;
}

export function calcularFreteGratis(
  subtotal: number,
  distanciaKm: number,
) {
  if (subtotal >= 50) {
    return 0;
  }

  return calcularFrete(distanciaKm);
}