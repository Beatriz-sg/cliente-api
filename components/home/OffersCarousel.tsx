import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { useState } from "react";

import { MaterialIcons } from "@expo/vector-icons";

import { offerImages } from "../../constants/images";

export default function OffersCarousel({
  produtosFiltrados,
  adicionarCarrinho,
}) {
  const [favoritos, setFavoritos] = useState([]);

  function toggleFavorito(id) {
    if (favoritos.includes(id)) {
      setFavoritos(
        favoritos.filter((item) => item !== id)
      );
    } else {
      setFavoritos([...favoritos, id]);
    }
  }

  return (
    <View
      style={{
        marginTop: 28,
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
          Ofertas Doces
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
        {(produtosFiltrados ?? []).map((produto) => {
          const favorito =
            favoritos.includes(produto.id);

          return (
            <TouchableOpacity
              key={produto.id}
              activeOpacity={0.85}
              style={{
                width: 155,

                backgroundColor: "#fff",

                borderRadius: 20,

                marginRight: 14,

                overflow: "hidden",

                shadowColor: "#000",

                shadowOpacity: 0.04,

                shadowRadius: 6,

                elevation: 2,
              }}
            >
              {/* FAVORITE */}

              <TouchableOpacity
                onPress={() =>
                  toggleFavorito(produto.id)
                }
                style={{
                  position: "absolute",

                  top: 10,

                  right: 10,

                  zIndex: 99,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,

                    color: favorito
                      ? "#ff4d8d"
                      : "#fff",
                  }}
                >
                  {favorito ? "♥" : "♡"}
                </Text>
              </TouchableOpacity>

              {/* DISCOUNT */}

              <View
                style={{
                  position: "absolute",

                  top: 10,

                  left: 10,

                  zIndex: 99,

                  backgroundColor: "#9333ea",

                  paddingHorizontal: 6,

                  paddingVertical: 3,

                  borderRadius: 999,
                }}
              >
                <Text
                  style={{
                    color: "#fff",

                    fontSize: 9,

                    fontWeight: "bold",
                  }}
                >
                  {produto.discount}% OFF
                </Text>
              </View>

              {/* IMAGE */}

              <Image
                source={
                  offerImages[
                    produto.imageUrl
                  ]
                }
                style={{
                  width: "100%",

                  height: 105,
                }}
              />

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

                    color: "#333",
                  }}
                >
                  {produto.name}
                </Text>

                <Text
                  style={{
                    marginTop: 4,

                    color: "#888",

                    fontSize: 12,
                  }}
                >
                  {produto.category}
                </Text>

                {/* DELIVERY */}

                <View
                  style={{
                    flexDirection: "row",

                    alignItems: "center",

                    marginTop: 4,
                  }}
                >
                  <MaterialIcons
                    name="directions-car"
                    size={16}
                    color="#7e22ce"
                  />

                  <Text
                    style={{
                      marginLeft: 4,

                      color: "#7e22ce",

                      fontSize: 9,

                      fontWeight: "600",
                    }}
                  >
                    {produto.deliveryTime}
                  </Text>
                </View>

                {/* PRICE */}

                <View
                  style={{
                    marginTop: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,

                      fontWeight: "bold",

                      color: "#7e22ce",
                    }}
                  >
                    R$ {produto.price.toFixed(2)}
                  </Text>

                  <Text
                    style={{
                      fontSize: 11,

                      color: "#999",

                      textDecorationLine:
                        "line-through",

                      marginTop: 2,
                    }}
                  >
                    R${" "}
                    {produto.oldPrice.toFixed(
                      2
                    )}
                  </Text>
                </View>

                {/* BUTTON */}

                <TouchableOpacity
                  onPress={() =>
                    adicionarCarrinho(produto)
                  }
                  activeOpacity={0.85}
                  style={{
                    marginTop: 12,

                    borderRadius: 12,

                    overflow: "hidden",
                  }}
                >
                  <LinearGradient
                    colors={[
                      "#f9a8d4",
                      "#ec4899",
                      "#9333ea",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      height: 38,

                      justifyContent:
                        "center",

                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",

                        fontWeight: "bold",

                        fontSize: 13,
                      }}
                    >
                      Adicionar
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}