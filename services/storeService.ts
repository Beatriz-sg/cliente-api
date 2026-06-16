import { apiUrl } from "../constants/api";
import stores from "../mock/stores.json";

export async function getStores() {
  try {
    const res = await fetch(apiUrl("stores"));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch {
    // fallback para mock local quando a API não estiver disponível
    return stores;
  }
}