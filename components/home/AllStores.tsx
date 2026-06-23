import { Image, Text, TouchableOpacity, View } from "react-native";

import { router } from "expo-router";

import { stores } from "../../data/stores";

import { Store } from "../../types/Store";

import { MaterialIcons } from "@expo/vector-icons";

import { useEffect, useState } from "react";

import { produtos } from "../../data/produtos";

import {
  getLojasFavoritas,
  toggleLojaFavorita,
} from "../../services/favoritosLocalService";

export default function AllStores(props: any) {
  const { categoriaSelecionada, busca } = props;
  const [favoritos, setFavoritos] = useState<number[]>([]);

  useEffect(() => {
    carregarFavoritos();
  }, []);

  async function carregarFavoritos() {
    const favoritas = await getLojasFavoritas();

    setFavoritos(favoritas.map((item: any) => item.id));
  }

  async function toggleFavorito(store: Store) {
    await toggleLojaFavorita({
      id: store.id,
      nomeFantasia: store.name,
      cidade: "",
      fotoUrl: null,
    });
    const favoritas = await getLojasFavoritas();

    setFavoritos(favoritas.map((item: any) => item.id));
  }

  const lojasFiltradas = stores
    .filter((loja) => {
      const possuiCategoria =
        categoriaSelecionada === "Todos" ||
        produtos.some(
          (produto) =>
            produto.lojaId === loja.id &&
            produto.categoria === categoriaSelecionada,
        );

      const textoBusca = busca?.toLowerCase() || "";

      const possuiBusca =
        textoBusca === "" ||
        loja.name.toLowerCase().includes(textoBusca) ||
        produtos.some(
          (produto) =>
            produto.lojaId === loja.id &&
            produto.nome.toLowerCase().includes(textoBusca),
        );

      return possuiCategoria && possuiBusca;
    })
    .sort((a, b) => Number(b.aberta) - Number(a.aberta));

  return (
    <View
      style={{
        marginTop: 30,

        paddingHorizontal: 18,
      }}
    >
      {/* TITLE */}

      <Text
        style={{
          fontSize: 20,

          fontWeight: "bold",

          color: "#333",

          marginBottom: 18,
        }}
      >
        Todas as Lojas
      </Text>

      {/* GRID */}

      <View
        style={{
          flexDirection: "row",

          flexWrap: "wrap",

          justifyContent: "space-between",
        }}
      >
        {lojasFiltradas.map((store: Store) => {
          const favorito = favoritos.includes(store.id);

          return (
            <TouchableOpacity
              key={store.id}
              onPress={() =>
                router.push({
                  pathname: "/loja",
                  params: {
                    lojaId: store.id,
                  },
                })
              }
              activeOpacity={0.9}
              style={{
                width: "48%",

                backgroundColor: store.aberta ? "#fff" : "#f3f4f6",

                opacity: store.aberta ? 1 : 0.6,

                borderRadius: 18,

                marginBottom: 16,

                overflow: "hidden",

                shadowColor: "#000",

                shadowOpacity: 0.04,

                shadowRadius: 6,

                elevation: 2,
              }}
            >
              {!store.aberta && (
                <View
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    backgroundColor: "#6b7280",
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: "bold",
                    }}
                  >
                    INDISPONÍVEL
                  </Text>
                </View>
              )}
              {/* IMAGE */}

              <View>
                <Image
                  source={store.image}
                  style={{
                    width: "100%",
                    height: 100,
                    opacity: store.aberta ? 1 : 0.35,
                  }}
                />

                {/* FAVORITE */}

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

              {/* INFO */}

              <View
                style={{
                  padding: 10,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 14,

                    fontWeight: "bold",

                    color: "#333",
                  }}
                >
                  {store.name}
                </Text>

                <Text
                  style={{
                    color: store.aberta ? "#22c55e" : "#9ca3af",
                    fontSize: 11,
                    fontWeight: "bold",
                  }}
                >
                  {store.aberta ? "● Aberta" : "● Fechada"}
                </Text>

                {/* FOOTER */}

                <View
                  style={{
                    marginTop: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "#ffb800",

                      fontSize: 11,

                      fontWeight: "bold",
                    }}
                  >
                    ⭐ {store.rating}
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",

                      alignItems: "center",

                      marginTop: 4,
                    }}
                  >
                    <MaterialIcons
                      name="directions-car"
                      size={14}
                      color="#7e22ce"
                    />

                    <Text
                      style={{
                        marginLeft: 4,

                        color: "#7e22ce",

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
      </View>
    </View>
  );
}
