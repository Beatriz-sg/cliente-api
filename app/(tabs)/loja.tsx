import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { MaterialIcons } from "@expo/vector-icons";

import { router } from "expo-router";

import { useCart } from "../../context/CartContext";

export default function LojaScreen() {

  const { addItem } = useCart();

  const produtos = [
    {
      id: 1,
      nome: "Bolo Red Velvet",
      descricao: "Fatia gourmet especial",
      preco: 24.9,
      imagem:
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587",
    },

    {
      id: 2,
      nome: "Donut Chocolate",
      descricao: "Cobertura premium",
      preco: 12.9,
      imagem:
        "https://images.unsplash.com/photo-1509440159596-0249088772ff",
    },

    {
      id: 3,
      nome: "Milk Shake",
      descricao: "Chocolate com chantilly",
      preco: 18.9,
      imagem:
        "https://images.unsplash.com/photo-1579954115563-e72bf1381629",
    },

    {
      id: 4,
      nome: "Cupcake Morango",
      descricao: "Recheio cremoso",
      preco: 14.9,
      imagem:
        "https://images.unsplash.com/photo-1486427944299-d1955d23e34d",
    },
  ];

  function adicionarCarrinho(produto) {

    addItem(produto);

    router.push("/carrinho");
  }

  return (

    <LinearGradient
      colors={["#fff7fc", "#f7ecff"]}
      style={{
        flex: 1,
      }}
    >

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >

        {/* BANNER */}

        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1551024601-bec78aea704b",
          }}
          style={{
            width: "100%",
            height: 240,
          }}
        />

        {/* CONTEÚDO */}

        <View
          style={{
            marginTop: -30,

            backgroundColor: "#fff",

            borderTopLeftRadius: 35,
            borderTopRightRadius: 35,

            paddingTop: 24,
            paddingHorizontal: 22,
          }}
        >

          {/* LOJA */}

          <View
            style={{
              flexDirection: "row",

              justifyContent: "space-between",

              alignItems: "center",
            }}
          >

            <View>

              <Text
                style={{
                  fontSize: 28,

                  fontWeight: "bold",

                  color: "#333",
                }}
              >
                Sweet Cake 🍰
              </Text>

              <Text
                style={{
                  color: "#777",

                  marginTop: 6,

                  fontSize: 14,
                }}
              >
                ⭐ 4.9 • 35-50 min
              </Text>

            </View>

            <TouchableOpacity>

              <MaterialIcons
                name="favorite-border"
                size={30}
                color="#ff69b4"
              />

            </TouchableOpacity>

          </View>

          {/* CATEGORIAS */}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{
              marginTop: 24,
              marginBottom: 24,
            }}
          >

            {[
              "Bolos",
              "Donuts",
              "Milk Shake",
              "Cupcakes",
              "Doces",
            ].map((categoria) => (

              <TouchableOpacity
                key={categoria}
                activeOpacity={0.8}
                style={{
                  backgroundColor: "#f9f3fb",

                  paddingHorizontal: 18,
                  paddingVertical: 10,

                  borderRadius: 20,

                  marginRight: 10,
                }}
              >

                <Text
                  style={{
                    color: "#a855f7",

                    fontWeight: "600",
                  }}
                >
                  {categoria}
                </Text>

              </TouchableOpacity>

            ))}

          </ScrollView>

          {/* PRODUTOS */}

          {produtos.map((produto) => (

            <View
              key={produto.id}
              style={{
                backgroundColor: "#fff",

                borderRadius: 26,

                marginBottom: 18,

                padding: 14,

                flexDirection: "row",

                shadowColor: "#c45ccf",

                shadowOpacity: 0.08,

                shadowRadius: 10,

                elevation: 4,
              }}
            >

              {/* IMAGEM */}

              <Image
                source={{
                  uri: produto.imagem,
                }}
                style={{
                  width: 100,
                  height: 100,

                  borderRadius: 20,
                }}
              />

              {/* INFO */}

              <View
                style={{
                  flex: 1,

                  marginLeft: 14,

                  justifyContent: "space-between",
                }}
              >

                <View>

                  <Text
                    style={{
                      fontSize: 18,

                      fontWeight: "bold",

                      color: "#333",
                    }}
                  >
                    {produto.nome}
                  </Text>

                  <Text
                    style={{
                      color: "#777",

                      marginTop: 6,

                      lineHeight: 20,
                    }}
                  >
                    {produto.descricao}
                  </Text>

                </View>

                <View
                  style={{
                    flexDirection: "row",

                    justifyContent: "space-between",

                    alignItems: "center",
                  }}
                >

                  <Text
                    style={{
                      color: "#ff69b4",

                      fontSize: 20,

                      fontWeight: "bold",
                    }}
                  >
                    R$ {produto.preco.toFixed(2)}
                  </Text>

                  {/* ADICIONAR */}

                  <TouchableOpacity
                    onPress={() => adicionarCarrinho(produto)}
                    activeOpacity={0.8}
                    style={{
                      backgroundColor: "#a855f7",

                      width: 42,
                      height: 42,

                      borderRadius: 14,

                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >

                    <MaterialIcons
                      name="add"
                      size={24}
                      color="#fff"
                    />

                  </TouchableOpacity>

                </View>

              </View>

            </View>

          ))}

        </View>

      </ScrollView>

    </LinearGradient>
  );
}