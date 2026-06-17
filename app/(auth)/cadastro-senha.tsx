import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { MaterialIcons } from "@expo/vector-icons";

import { router, useLocalSearchParams } from "expo-router";

import { useState } from "react";
import { register } from "../../services/authService";

export default function CadastroSenhaScreen() {
  const { email, nome, sobrenome, cpf, dataNascimento } = useLocalSearchParams<{
    email: string;
    nome: string;
    sobrenome?: string;
    cpf: string;
    dataNascimento: string;
  }>();

  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCadastro() {
    if (senha.length < 6) {
      Alert.alert("Atenção", "A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert("Atenção", "As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      await register({
        nome,
        email,
        cpf,
        dataNascimento,
        senha,
        ...(sobrenome ? { sobrenome } : {}),
      });
      Alert.alert("Sucesso", "Cadastro realizado com sucesso!", [
        { text: "OK", onPress: () => router.replace("/(tabs)/home") },
      ]);
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

            marginTop: 45,

            marginBottom: -15,

            zIndex: 10,
          }}
        >
          <Image
            source={require("../../assets/images/logo.png")}
            style={{
              width: 75,
              height: 75,

              borderRadius: 70,

              shadowColor: "#c45ccf",
              shadowOpacity: 0.25,
              shadowRadius: 10,
            }}
          />
        </View>

        {/* CARD */}

        <View
          style={{
            backgroundColor: "#fff",

            borderRadius: 35,

            paddingTop: 40,
            paddingBottom: 25,
            paddingHorizontal: 24,

            shadowColor: "#c45ccf",

            shadowOpacity: 0.12,

            shadowRadius: 18,

            elevation: 12,
          }}
        >
          {/* ETAPA */}

          <Text
            style={{
              textAlign: "center",

              color: "#a855f7",

              fontWeight: "bold",

              marginBottom: 8,
            }}
          >
            Etapa 4 de 4
          </Text>

          {/* ÍCONE */}

          <View
            style={{
              width: 65,
              height: 65,

              borderRadius: 50,

              alignSelf: "center",

              justifyContent: "center",
              alignItems: "center",

              marginBottom: 18,
            }}
          >
            <LinearGradient
              colors={["#ff69b4", "#a855f7"]}
              style={{
                width: 60,
                height: 60,

                borderRadius: 50,

                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialIcons name="lock" size={30} color="#fff" />
            </LinearGradient>
          </View>

          {/* TÍTULO */}

          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",

              color: "#333",

              textAlign: "center",

              marginBottom: 8,
            }}
          >
            Criar Senha 💖
          </Text>

          {/* SUBTÍTULO */}

          <Text
            style={{
              textAlign: "center",

              color: "#777",

              fontSize: 13,

              lineHeight: 20,

              marginBottom: 20,
            }}
          >
            Crie uma senha segura para acessar o Docelivery
          </Text>

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
            placeholder="Mínimo de 6 caracteres"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
            style={{
              backgroundColor: "#f9f3fb",

              borderRadius: 16,

              paddingHorizontal: 18,
              paddingVertical: 16,

              fontSize: 13,

              marginBottom: 20,

              borderWidth: 1,
              borderColor: "#f1d4ff",
            }}
          />

          {/* CONFIRMAR SENHA */}

          <Text
            style={{
              color: "#555",

              marginBottom: 8,

              fontWeight: "600",
            }}
          >
            Confirmar Senha
          </Text>

          <TextInput
            placeholder="Confirme sua senha"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            style={{
              backgroundColor: "#f9f3fb",

              borderRadius: 16,

              paddingHorizontal: 18,
              paddingVertical: 16,

              fontSize: 13,

              marginBottom: 20,

              borderWidth: 1,
              borderColor: "#f1d4ff",
            }}
          />

          {/* TERMOS */}

          <View
            style={{
              flexDirection: "row",

              alignItems: "flex-start",

              marginBottom: 22,
            }}
          >
            <Switch
              value={aceitouTermos}
              onValueChange={setAceitouTermos}
              trackColor={{
                false: "#ddd",
                true: "#c084fc",
              }}
              thumbColor={aceitouTermos ? "#a855f7" : "#f4f4f4"}
            />

            <Text
              style={{
                flex: 1,

                marginLeft: 10,

                color: "#666",

                fontSize: 11,

                lineHeight: 18,
              }}
            >
              Ao continuar, você concorda com os{" "}
              <Text
                style={{
                  color: "#a855f7",
                  fontWeight: "bold",
                }}
              >
                Termos de Uso
              </Text>{" "}
              e está ciente da{" "}
              <Text
                style={{
                  color: "#a855f7",
                  fontWeight: "bold",
                }}
              >
                Declaração de Privacidade
              </Text>
              .
            </Text>
          </View>

          {/* BOTÃO */}

          <TouchableOpacity
            disabled={!aceitouTermos || loading}
            onPress={handleCadastro}
            activeOpacity={0.8}
            style={{
              borderRadius: 18,
              overflow: "hidden",

              opacity: aceitouTermos ? 1 : 0.5,
            }}
          >
            <LinearGradient
              colors={["#ff69b4", "#a855f7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                paddingVertical: 16,
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

                    fontSize: 16,
                  }}
                >
                  Finalizar Cadastro
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* VOLTAR */}

          <TouchableOpacity onPress={() => router.back()}>
            <Text
              style={{
                marginTop: 12,

                textAlign: "center",

                color: "#444",

                fontWeight: "bold",
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
