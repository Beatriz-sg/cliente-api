import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { router } from "expo-router";

export default function CodigoRecuperacaoScreen() {
  return (
    <LinearGradient
      colors={["#f8edf7", "#f2dcff"]}
      style={{
        flex: 1,
      }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 25,
          paddingBottom: 40,
        }}
      >
        {/* LOGO */}

        <View
          style={{
            alignItems: "center",

            marginTop: 40,

            marginBottom: -30,

            zIndex: 10,
          }}
        >
          <Image
            source={require("../../assets/images/logo.png")}
            style={{
              width: 105,
              height: 105,

              borderRadius: 70,

              shadowColor: "#c45ccf",
              shadowOpacity: 0.25,
              shadowRadius: 12,

                         }}
          />
        </View>

        {/* CARD */}

        <View
          style={{
            backgroundColor: "#fff",

            borderRadius: 38,

            paddingTop: 75,
            paddingBottom: 32,
            paddingHorizontal: 28,

            shadowColor: "#c45ccf",

            shadowOpacity: 0.12,

            shadowRadius: 18,

            elevation: 12,
          }}
        >
          {/* TÍTULO */}

          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",

              color: "#333",

              textAlign: "center",
            }}
          >
            Verificar Código 💖
          </Text>

          {/* SUBTÍTULO */}

          <Text
            style={{
              textAlign: "center",

              color: "#777",

              fontSize: 14,

              lineHeight: 22,

              marginTop: 10,

              marginBottom: 32,
            }}
          >
            Digite o código enviado para seu e-mail
          </Text>

          {/* CAMPOS CÓDIGO */}

          <View
            style={{
              flexDirection: "row",

              justifyContent: "center",
              gap: 8,

              marginBottom: 30,
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <TextInput
                key={item}
                keyboardType="number-pad"
                maxLength={1}
                style={{
                  width: 42,
                  height: 52,
                  backgroundColor: "#f9f3fb",

                  borderRadius: 14,

                  textAlign: "center",

                  fontSize: 20,

                  color: "#333",

                  borderWidth: 1,
                  borderColor: "#f1d4ff",
                }}
              />
            ))}
          </View>

          {/* BOTÃO */}

          <TouchableOpacity
            onPress={() => router.push("/redefinir-senha")}
            activeOpacity={0.8}
            style={{
              borderRadius: 18,
              overflow: "hidden",
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

                  fontSize: 17,
                }}
              >
                Verificar código
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* REENVIAR */}

          <TouchableOpacity activeOpacity={0.8}>
            <Text
              style={{
                textAlign: "center",

                color: "#a855f7",

                marginTop: 18,

                fontWeight: "600",
              }}
            >
              Reenviar código
            </Text>
          </TouchableOpacity>

          {/* VOLTAR */}

          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
            <Text
              style={{
                textAlign: "center",

                color: "#777",

                marginTop: 18,

                fontWeight: "600",
              }}
            >
              Voltar
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
