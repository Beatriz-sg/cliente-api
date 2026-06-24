import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { getStores, type LojaAPI } from "../../services/storeService";
import {
  getLojasFavoritas,
  toggleLojaFavorita,
} from "../../services/favoritosLocalService";
import { imagemUrl } from "../../constants/api";

export default function NearbyStores(props: any) {
  const { cidadeEntrega, categoriaSelecionada } = props;
  const [stores, setStores] = useState<LojaAPI[]>([]);
  const [favoritos, setFavoritos] = useState<number[]>([]);

  useEffect(() => {
    getStores().then(setStores);
    carregarFavoritos();
  }, []);

  async function carregarFavoritos() {
    const favs = await getLojasFavoritas();
    setFavoritos(favs.map((item: any) => item.id));
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
    const mesmaCidade =
      !cidadeEntrega ||
      (loja.cidade ?? "").toLowerCase() === cidadeEntrega.toLowerCase();
    return mesmaCidade;
  });

  return (
    <View style={{ marginTop: 30 }}>
      <View style={{ paddingHorizontal: 18, marginBottom: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#333" }}>
          📍 Confeitarias Próximas
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 18 }}
      >
        {lojasFiltradas.map((store) => {
          const favorito = favoritos.includes(store.id);
          const fotoUri = imagemUrl(store.loja?.fotoUrl);

          return (
            <TouchableOpacity
              key={store.id}
              activeOpacity={0.9}
              onPress={() => router.push({ pathname: "/loja", params: { lojaId: store.id } })}
              style={{
                width: 210,
                backgroundColor: "#fff",
                borderRadius: 18,
                marginRight: 14,
                overflow: "hidden",
                shadowColor: "#000",
                shadowOpacity: 0.04,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <View>
                {fotoUri ? (
                  <Image source={{ uri: fotoUri }} style={{ width: "100%", height: 110 }} />
                ) : (
                  <View
                    style={{
                      width: "100%",
                      height: 110,
                      backgroundColor: "#f3e8ff",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <MaterialIcons name="store" size={40} color="#a855f7" />
                  </View>
                )}

                <TouchableOpacity
                  onPress={() => toggleFavorito(store)}
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    backgroundColor: "rgba(255,255,255,0.95)",
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <MaterialIcons
                    name={favorito ? "favorite" : "favorite-border"}
                    size={20}
                    color="#ff4d8d"
                  />
                </TouchableOpacity>
              </View>

              <View style={{ padding: 12 }}>
                <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: "bold", color: "#333" }}>
                  {store.name ?? store.nome}
                </Text>
                <Text style={{ marginTop: 4, color: "#22c55e", fontSize: 11, fontWeight: "bold" }}>
                  ● Aberta
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 10,
                  }}
                >
                  <Text style={{ color: "#ffb800", fontSize: 12, fontWeight: "bold" }}>
                    ⭐ {store.rating ?? "—"}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MaterialIcons name="directions-car" size={15} color="#7e22ce" />
                    <Text style={{ marginLeft: 4, color: "#7e22ce", fontSize: 10, fontWeight: "600" }}>
                      {store.deliveryTime ?? "—"}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
