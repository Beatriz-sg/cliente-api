import { apiUrl } from "../constants/api";
import offers from "../mock/offers.json";

export async function getOffers() {
  try {
    const res = await fetch(apiUrl("offers"));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch {
    // fallback para mock local quando a API não estiver disponível
    return offers;
  }
}