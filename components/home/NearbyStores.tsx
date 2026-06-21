import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { stores as storesData } from "../../data/stores";

import { useState } from "react";

import { MaterialIcons } from "@expo/vector-icons";

import { produtos } from "../../data/produtos";

import { router } from "expo-router";

export default function NearbyStores(props: any) {
  const { cidadeEntrega } = props;
  const { categoriaSelecionada } = props;
  const [stores] = useState(storesData);

  const [favoritos, setFavoritos] = useState<number[]>([]);

  function toggleFavorito(id: number) {
    if (favoritos.includes(id)) {
      setFavoritos(favoritos.filter((item) => item !== id));
    } else {
      setFavoritos([...favoritos, id]);
    }
  }

  const lojasFiltradas = stores.filter((loja) => {
    const mesmaCidade =
      !cidadeEntrega ||
      loja.cidade?.toLowerCase() === cidadeEntrega.toLowerCase();

    const mesmaCategoria =
      categoriaSelecionada === "Todos" ||
      produtos.some(
        (produto) =>
          produto.lojaId === loja.id &&
          produto.categoria === categoriaSelecionada,
      );

    return mesmaCidade && mesmaCategoria;
  });

  console.log("CIDADE ENTREGA:", cidadeEntrega);
  console.log("LOJAS FILTRADAS:", lojasFiltradas);

  console.log(
    lojasFiltradas.map((l) => ({
      nome: l.name,
      aberta: l.aberta,
    })),
  );

  return (
    <View
      style={{
        marginTop: 30,
      }}
    >
      {/* TITLE */}

      <View
        style={{
          paddingHorizontal: 18,

          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontSize: 20,

            fontWeight: "bold",

            color: "#333",
          }}
        >
          📍 Confeitarias Próximas
        </Text>
      </View>

      {/* LIST */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingLeft: 18,
        }}
      >
        {lojasFiltradas.map((store: any) => {
          const favorito = favoritos.includes(store.id);

          return (
            <TouchableOpacity
  key={store.id}
  activeOpacity={0.9}
  onPress={() =>
    router.push({
      pathname: "/loja",
      params: {
        lojaId: store.id,
      },
    })
  }
  style={{
                width: 210,

                backgroundColor: store.aberta ? "#fff" : "#e5e7eb",

                borderRadius: 18,

                marginRight: 14,

                overflow: "hidden",

                opacity: 1,

                shadowColor: "#000",

                shadowOpacity: 0.04,

                shadowRadius: 6,

                elevation: 2,
              }}
            >
              {/* IMAGE */}

              <View>
                <Image
                  source={store.image}
                  style={{
                    width: "100%",
                    height: 110,
                    opacity: store.aberta ? 1 : 0.02,
                  }}
                />

                {!store.aberta && (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(180,180,180,0.90)",
                    }}
                  />
                )}

                {/* FAVORITE */}

                <TouchableOpacity
                  onPress={() => toggleFavorito(store.id)}
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

              {/* INFO */}

              <View
                style={{
                  padding: 12,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 15,

                    fontWeight: "bold",

                    color: store.aberta ? "#333" : "#8b8b8b",
                  }}
                >
                  {store.name}
                </Text>
                <Text
                  style={{
                    marginTop: 4,
                    color: store.aberta ? "#22c55e" : "#6b7280",
                    fontSize: 11,
                    fontWeight: "bold",
                  }}
                >
                  {store.aberta ? "● Aberta" : "● Fechada"}
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 10,
                  }}
                >
                  <Text
                    style={{
                      color: store.aberta ? "#ffb800" : "#9ca3af",
                      fontSize: 12,
                      fontWeight: "bold",
                    }}
                  >
                    ⭐ {store.rating}
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <MaterialIcons
                      name="directions-car"
                      size={15}
                      color={store.aberta ? "#7e22ce" : "#9ca3af"}
                    />

                    <Text
                      style={{
                        marginLeft: 4,
                        color: store.aberta ? "#7e22ce" : "#9ca3af",
                        fontSize: 10,
                        fontWeight: "600",
                      }}
                    >
                      {store.deliveryTime}
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
