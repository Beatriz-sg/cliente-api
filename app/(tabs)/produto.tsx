import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { MaterialIcons } from "@expo/vector-icons";

export default function ProdutoScreen() {

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

        {/* IMAGEM */}

        <View
          style={{
            position: "relative",
          }}
        >

          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1578985545062-69928b1d9587",
            }}
            style={{
              width: "100%",
              height: 330,
            }}
          />

          {/* BOTÕES TOPO */}

          <View
            style={{
              position: "absolute",

              top: 55,

              left: 20,

              right: 20,

              flexDirection: "row",

              justifyContent: "space-between",
            }}
          >

            <TouchableOpacity
              activeOpacity={0.8}
              style={{
                width: 45,
                height: 45,

                borderRadius: 30,

                backgroundColor: "#ffffffdd",

                justifyContent: "center",
                alignItems: "center",
              }}
            >

              <MaterialIcons
                name="arrow-back"
                size={24}
                color="#333"
              />

            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={{
                width: 45,
                height: 45,

                borderRadius: 30,

                backgroundColor: "#ffffffdd",

                justifyContent: "center",
                alignItems: "center",
              }}
            >

              <MaterialIcons
                name="favorite-border"
                size={24}
                color="#ff69b4"
              />

            </TouchableOpacity>

          </View>

        </View>

        {/* CARD */}

        <View
          style={{
            backgroundColor: "#fff",

            marginTop: -30,

            borderTopLeftRadius: 35,
            borderTopRightRadius: 35,

            paddingTop: 28,
            paddingHorizontal: 24,
            paddingBottom: 40,

            minHeight: 500,
          }}
        >

          {/* NOME */}

          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",

              color: "#333",
            }}
          >
            Bolo Red Velvet 🍰
          </Text>

          {/* INFO */}

          <View
            style={{
              flexDirection: "row",

              alignItems: "center",

              marginTop: 12,
            }}
          >

            <Text
              style={{
                color: "#ff69b4",

                fontWeight: "bold",

                marginRight: 15,
              }}
            >
              ⭐ 4.9
            </Text>

            <Text
              style={{
                color: "#777",
              }}
            >
              120 avaliações
            </Text>

          </View>

          {/* DESCRIÇÃO */}

          <Text
            style={{
              color: "#666",

              fontSize: 15,

              lineHeight: 24,

              marginTop: 22,
            }}
          >
            Delicioso bolo Red Velvet com massa macia,
            recheio cremoso e cobertura especial.
            Preparado artesanalmente para deixar
            seu momento ainda mais doce 💖
          </Text>

          {/* PREÇO */}

          <View
            style={{
              flexDirection: "row",

              justifyContent: "space-between",

              alignItems: "center",

              marginTop: 30,
            }}
          >

            <View>

              <Text
                style={{
                  color: "#999",

                  marginBottom: 4,
                }}
              >
                Preço
              </Text>

              <Text
                style={{
                  color: "#ff69b4",

                  fontSize: 30,

                  fontWeight: "bold",
                }}
              >
                R$ 24,90
              </Text>

            </View>

            {/* QUANTIDADE */}

            <View
              style={{
                flexDirection: "row",

                alignItems: "center",

                backgroundColor: "#f9f3fb",

                borderRadius: 18,

                paddingHorizontal: 14,
                paddingVertical: 10,
              }}
            >

              <TouchableOpacity>

                <MaterialIcons
                  name="remove"
                  size={24}
                  color="#a855f7"
                />

              </TouchableOpacity>

              <Text
                style={{
                  marginHorizontal: 18,

                  fontWeight: "bold",

                  fontSize: 16,

                  color: "#333",
                }}
              >
                1
              </Text>

              <TouchableOpacity>

                <MaterialIcons
                  name="add"
                  size={24}
                  color="#a855f7"
                />

              </TouchableOpacity>

            </View>

          </View>

          {/* BOTÃO */}

          <TouchableOpacity
            activeOpacity={0.8}
            style={{
              borderRadius: 22,

              overflow: "hidden",

              marginTop: 35,
            }}
          >

            <LinearGradient
              colors={["#ff69b4", "#a855f7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                paddingVertical: 18,

                alignItems: "center",
              }}
            >

              <Text
                style={{
                  color: "#fff",

                  fontWeight: "bold",

                  fontSize: 18,
                }}
              >
                Adicionar ao Carrinho 🛒
              </Text>

            </LinearGradient>

          </TouchableOpacity>

        </View>

      </ScrollView>

    </LinearGradient>
  );
}