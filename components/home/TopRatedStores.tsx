import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { getStores, type LojaAPI } from "../../services/storeService";
import { imagemUrl } from "../../constants/api";

export default function TopRatedStores() {
  const [lojas, setLojas] = useState<LojaAPI[]>([]);

  useEffect(() => {
    getStores().then((data) => {
      const sorted = [...data].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 5);
      setLojas(sorted);
    });
  }, []);

  return (
    <View style={{ marginTop: 28 }}>
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          color: "#333",
          marginBottom: 18,
          paddingHorizontal: 22,
        }}
      >
        ⭐ Lojas Mais Bem Avaliadas
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 22 }}
      >
        {lojas.map((store) => {
          const fotoUri = imagemUrl(store.loja?.fotoUrl);
          return (
            <TouchableOpacity
              key={store.id}
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: "/loja", params: { lojaId: store.id } })}
              style={{
                width: 155,
                backgroundColor: "#fff",
                borderRadius: 22,
                marginRight: 16,
                overflow: "hidden",
              }}
            >
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

              <View style={{ padding: 6 }}>
                <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "bold", color: "#333" }}>
                  {store.name ?? store.nome}
                </Text>
                <Text numberOfLines={1} style={{ color: "#777", marginTop: 4, fontSize: 11 }}>
                  {store.description ?? store.loja?.descricao ?? "Confeitaria"}
                </Text>
                <Text style={{ color: "#ff69b4", marginTop: 8, fontWeight: "bold", fontSize: 12 }}>
                  ⭐ {store.rating ?? "—"}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
