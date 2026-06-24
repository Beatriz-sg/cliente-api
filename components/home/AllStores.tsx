import { Image, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  getLojasFavoritas,
  toggleLojaFavorita,
} from "../../services/favoritosLocalService";
import { getStores, type LojaAPI } from "../../services/storeService";
import { imagemUrl } from "../../constants/api";

export default function AllStores(props: any) {
  const { categoriaSelecionada, busca } = props;
  const [stores, setStores] = useState<LojaAPI[]>([]);
  const [favoritos, setFavoritos] = useState<number[]>([]);

  useEffect(() => {
    getStores().then(setStores);
    carregarFavoritos();
  }, []);

  async function carregarFavoritos() {
    const favoritas = await getLojasFavoritas();
    setFavoritos(favoritas.map((item: any) => item.id));
  }

  async function toggleFavorito(store: LojaAPI) {
    await toggleLojaFavorita({
      id: store.id,
      nomeFantasia: store.name ?? store.nome,
      cidade: store.cidade ?? "",
      fotoUrl: imagemUrl(store.loja?.fotoUrl) ?? null,
    });
    carregarFavoritos();
  }

  const lojasFiltradas = stores.filter((loja) => {
    const textoBusca = busca?.toLowerCase() || "";
    return (
      (categoriaSelecionada === "Todos" || true) &&
      (textoBusca === "" || (loja.name ?? loja.nome).toLowerCase().includes(textoBusca))
    );
  });

  return (
    <View style={{ marginTop: 30, paddingHorizontal: 18 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 18 }}>
        Todas as Lojas
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
        {lojasFiltradas.map((store) => {
          const favorito = favoritos.includes(store.id);
          const fotoUri = imagemUrl(store.loja?.fotoUrl);

          return (
            <TouchableOpacity
              key={store.id}
              onPress={() => router.push({ pathname: "/loja", params: { lojaId: store.id } })}
              activeOpacity={0.9}
              style={{
                width: "48%",
                backgroundColor: "#fff",
                borderRadius: 18,
                marginBottom: 16,
                overflow: "hidden",
                shadowColor: "#000",
                shadowOpacity: 0.04,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <View>
                {fotoUri ? (
                  <Image source={{ uri: fotoUri }} style={{ width: "100%", height: 100 }} />
                ) : (
                  <View
                    style={{
                      width: "100%",
                      height: 100,
                      backgroundColor: "#f3e8ff",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <MaterialIcons name="store" size={36} color="#a855f7" />
                  </View>
                )}

                <TouchableOpacity
                  onPress={() => toggleFavorito(store)}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    backgroundColor: "rgba(255,255,255,0.95)",
                    width: 30,
                    height: 30,
                    borderRadius: 999,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <MaterialIcons
                    name={favorito ? "favorite" : "favorite-border"}
                    size={18}
                    color="#ff4d8d"
                  />
                </TouchableOpacity>
              </View>

              <View style={{ padding: 10 }}>
                <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "bold", color: "#333" }}>
                  {store.name ?? store.nome}
                </Text>
                <Text style={{ color: "#22c55e", fontSize: 11, fontWeight: "bold" }}>
                  ● Aberta
                </Text>
                <View style={{ marginTop: 8 }}>
                  <Text style={{ color: "#ffb800", fontSize: 11, fontWeight: "bold" }}>
                    ⭐ {store.rating ?? "—"}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                    <MaterialIcons name="directions-car" size={14} color="#7e22ce" />
                    <Text style={{ marginLeft: 4, color: "#7e22ce", fontSize: 10, fontWeight: "600" }}>
                      {store.deliveryTime ?? "—"}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
