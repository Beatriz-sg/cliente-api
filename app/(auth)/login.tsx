import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { router } from "expo-router";

export default function LoginScreen() {
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
              fontSize: 30,
              fontWeight: "bold",

              color: "#333",

              textAlign: "center",
            }}
          >
            Docelivery 💖
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
            Os melhores doces e confeitarias perto de você 🍰
          </Text>

          {/* JÁ TENHO CONTA */}

          <TouchableOpacity
            onPress={() => router.push("/entrar")}
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
                Já tenho uma conta
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* CRIAR CONTA */}

          <TouchableOpacity
            onPress={() => router.push("/register")}
            activeOpacity={0.8}
            style={{
              borderWidth: 1.5,
              borderColor: "#ff69b4",

              borderRadius: 18,

              paddingVertical: 17,

              alignItems: "center",

              marginTop: 16,
            }}
          >
            <Text
              style={{
                color: "#ff69b4",

                fontWeight: "bold",

                fontSize: 16,
              }}
            >
              Criar nova conta
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/home")}
            activeOpacity={0.8}
            style={{
              marginTop: 16,
            }}
          ></TouchableOpacity>

          {/* VISITANTE */}

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/home")}
            activeOpacity={0.8}
          >
            <Text
              style={{
                textAlign: "center",

                color: "#a855f7",

                fontSize: 16,

                fontWeight: "bold",
              }}
            >
              Continuar como visitante
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
