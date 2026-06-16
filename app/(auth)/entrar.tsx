import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { router } from "expo-router";
import { useState } from "react";
import { login } from "../../services/authService";

export default function EntrarScreen() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !senha) {
      Alert.alert("Atenção", "Preencha e-mail e senha.");
      return;
    }
    setLoading(true);
    try {
      await login({ email, senha });
      router.replace("/(tabs)/home");
    } catch (e: any) {
      Alert.alert("Erro", e.message);
    } finally {
      setLoading(false);
    }
  }

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
            Entrar 💖
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
            Entre com sua conta para continuar
          </Text>

          {/* EMAIL */}

          <Text
            style={{
              color: "#555",

              marginBottom: 8,

              fontWeight: "600",
            }}
          >
            E-mail
          </Text>

          <TextInput
            placeholder="Digite seu e-mail"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            style={{
              backgroundColor: "#f9f3fb",

              borderRadius: 16,

              paddingHorizontal: 18,
              paddingVertical: 16,

              fontSize: 15,

              marginBottom: 20,

              borderWidth: 1,
              borderColor: "#f1d4ff",
            }}
          />

          {/* SENHA */}

          <Text
            style={{
              color: "#555",

              marginBottom: 8,

              fontWeight: "600",
            }}
          >
            Senha
          </Text>

          <TextInput
            placeholder="Digite sua senha"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
            style={{
              backgroundColor: "#f9f3fb",

              borderRadius: 16,

              paddingHorizontal: 18,
              paddingVertical: 16,

              fontSize: 15,

              marginBottom: 15,

              borderWidth: 1,
              borderColor: "#f1d4ff",
            }}
          />

          {/* ESQUECI SENHA */}

          <TouchableOpacity
            onPress={() => router.push("/recuperar-senha")}

            activeOpacity={0.8}
          >

            <Text
              style={{
                textAlign: "right",

                color: "#a855f7",

                marginBottom: 30,

                fontWeight: "600",
              }}
            >
              Esqueceu a senha?
            </Text>

          </TouchableOpacity>

          {/* BOTÃO */}

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
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
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  style={{
                    color: "#fff",

                    fontWeight: "bold",

                    fontSize: 17,
                  }}
                >
                  Entrar
                </Text>
              )}
            </LinearGradient>

          </TouchableOpacity>

          {/* VOLTAR */}

          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
          >

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