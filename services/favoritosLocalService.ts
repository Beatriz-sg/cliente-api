import AsyncStorage from "@react-native-async-storage/async-storage";

const LOJAS_KEY = "favoritos_lojas";
const PRODUTOS_KEY = "favoritos_produtos";

export async function getLojasFavoritas() {
  const data = await AsyncStorage.getItem(LOJAS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function getProdutosFavoritos() {
  const data = await AsyncStorage.getItem(PRODUTOS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function toggleLojaFavorita(loja: any) {
  const favoritas = await getLojasFavoritas();

  const existe = favoritas.some(
    (item: any) => item.id === loja.id
  );

  const novaLista = existe
    ? favoritas.filter((item: any) => item.id !== loja.id)
    : [...favoritas, loja];

  await AsyncStorage.setItem(
    LOJAS_KEY,
    JSON.stringify(novaLista)
  );

  return novaLista;
}

export async function toggleProdutoFavorito(produto: any) {
  const favoritos = await getProdutosFavoritos();

  const existe = favoritos.some(
    (item: any) => item.id === produto.id
  );

  const novaLista = existe
    ? favoritos.filter((item: any) => item.id !== produto.id)
    : [...favoritos, produto];

  await AsyncStorage.setItem(
    PRODUTOS_KEY,
    JSON.stringify(novaLista)
  );

  return novaLista;
}

export async function removerLojaFavorita(id: number) {
  const favoritas = await getLojasFavoritas();

  const novaLista = favoritas.filter(
    (item: any) => item.id !== id
  );

  await AsyncStorage.setItem(
    LOJAS_KEY,
    JSON.stringify(novaLista)
  );

  return novaLista;
}

export async function removerProdutoFavorito(id: number) {
  const favoritos = await getProdutosFavoritos();

  const novaLista = favoritos.filter(
    (item: any) => item.id !== id
  );

  await AsyncStorage.setItem(
    PRODUTOS_KEY,
    JSON.stringify(novaLista)
  );

  return novaLista;
}