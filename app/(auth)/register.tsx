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

import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { register } from "../../services/authService";
import { isValidCpf } from "../../utils/cpf";

import * as cpfUtils from "../../utils/cpf";

console.log(cpfUtils);

const inputStyle = {
  backgroundColor: "#f9f3fb",
  borderRadius: 16,
  paddingHorizontal: 18,
  paddingVertical: 16,
  fontSize: 15,
  marginBottom: 20,
  borderWidth: 1,
  borderColor: "#f1d4ff",
} as const;

const labelStyle = {
  color: "#555",
  marginBottom: 8,
  fontWeight: "600",
} as const;

function maskCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

export default function RegisterScreen() {
  const [etapa, setEtapa] = useState(1);

  // Etapa 1 — Dados pessoais
  const [nome, setNome] = useState("");
  const [apelido, setApelido] = useState("");
  const [cpf, setCpf] = useState("");
  const [cpfErro, setCpfErro] = useState<string | null>(null);
  const [dataNascimento, setDataNascimento] = useState("");
  const [telefone, setTelefone] = useState("");

  // Etapa 2 — Acesso
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleProximo() {
    if (!nome.trim()) {
      Alert.alert("Atenção", "Informe seu nome.");
      return;
    }

    const cpfLimpo = cpf.replace(/\D/g, "");

    if (!cpfLimpo) {
      Alert.alert("Atenção", "Informe o CPF.");
      return;
    }

    if (!isValidCpf(cpfLimpo)) {
      setCpfErro("CPF inválido.");
      return;
    }


    if (!dataNascimento.trim()) {
      Alert.alert("Atenção", "Informe a data de nascimento.");
      return;
    }

    const partes = dataNascimento.split("/");

    if (partes.length !== 3) {
      Alert.alert("Atenção", "Data de nascimento inválida.");
      return;
    }

    const dia = Number(partes[0]);
    const mes = Number(partes[1]);
    const ano = Number(partes[2]);

    const data = new Date(ano, mes - 1, dia);

    if (
      data.getDate() !== dia ||
      data.getMonth() !== mes - 1 ||
      data.getFullYear() !== ano
    ) {
      Alert.alert("Atenção", "Data de nascimento inválida.");
      return;
    }

    const hoje = new Date();

    let idade = hoje.getFullYear() - ano;

    const mesAtual = hoje.getMonth() + 1;
    const diaAtual = hoje.getDate();

    if (mesAtual < mes || (mesAtual === mes && diaAtual < dia)) {
      idade--;
    }

    if (idade < 18) {
      Alert.alert("Atenção", "É necessário ter pelo menos 18 anos.");
      return;
    }

    if (!telefone.trim()) {
      Alert.alert("Atenção", "Informe o telefone.");
      return;
    }

    setEtapa(2);
  }

  function maskDate(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 8);

    if (d.length <= 2) return d;

    if (d.length <= 4) {
      return `${d.slice(0, 2)}/${d.slice(2)}`;
    }

    return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
  }

  async function handleCadastro() {
    if (!email) {
      Alert.alert("Atenção", "Preencha o e-mail.");
      return;
    }
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
      const payload: import("../../services/authService").RegisterPayload = {
        nome,
        email,
        cpf: cpf.replace(/\D/g, ""),
        dataNascimento: `${dataNascimento.split("/")[2]}-${dataNascimento.split("/")[1]}-${dataNascimento.split("/")[0]}`,
        senha,
        ...(apelido.trim() && { apelido: apelido.trim() }),
        ...(telefone.trim() && { telefone: telefone.replace(/\D/g, "") }),
      };
      await register(payload);

      Alert.alert(
        "Cadastro realizado",
        "Agora faça seu login para continuar.",
        [
          {
            text: "Entrar",
            onPress: () =>
              router.replace({
                pathname: "/(auth)/entrar",
                params: { email },
              }),
          },
        ],
      );
    } catch (e: any) {
      if (
        e.message?.toLowerCase().includes("email") ||
        e.message?.toLowerCase().includes("e-mail")
      ) {
        Alert.alert(
          "E-mail já cadastrado",
          "Este e-mail já possui uma conta. Deseja fazer login?",
          [
            {
              text: "Cancelar",
              style: "cancel",
            },
            {
              text: "Ir para Login",
              onPress: () => router.replace("/entrar"),
            },
          ],
        );

        return;
      }

      // Show the exact message returned by the backend (HTTP 400 or any other error)
      Alert.alert("Erro no cadastro", e.message ?? "Não foi possível concluir o cadastro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={["#f8edf7", "#f2dcff"]} style={{ flex: 1 }}>
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
            marginBottom: -25,
            zIndex: 10,
          }}
        >
          <Image
            source={require("../../assets/images/logo.png")}
            style={{ width: 95, height: 95, borderRadius: 70 }}
          />
        </View>

        {/* CARD */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 35,
            paddingTop: 60,
            paddingBottom: 28,
            paddingHorizontal: 28,
            shadowColor: "#c45ccf",
            shadowOpacity: 0.12,
            shadowRadius: 18,
            elevation: 12,
          }}
        >
          {/* INDICADOR DE ETAPAS */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 24,
              gap: 8,
            }}
          >
            {[1, 2].map((n) => (
              <View
                key={n}
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: etapa >= n ? "#a855f7" : "#e9d5ff",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: etapa >= n ? "#fff" : "#a855f7",
                      fontWeight: "bold",
                      fontSize: 14,
                    }}
                  >
                    {n}
                  </Text>
                </View>
                {n < 2 && (
                  <View
                    style={{
                      width: 40,
                      height: 2,
                      backgroundColor: etapa > n ? "#a855f7" : "#e9d5ff",
                    }}
                  />
                )}
              </View>
            ))}
          </View>

          {/* ÍCONE */}
          <View style={{ alignSelf: "center", marginBottom: 18 }}>
            <LinearGradient
              colors={["#ff69b4", "#a855f7"]}
              style={{
                width: 70,
                height: 70,
                borderRadius: 50,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialIcons
                name={etapa === 1 ? "person" : "lock"}
                size={32}
                color="#fff"
              />
            </LinearGradient>
          </View>

          {/* TÍTULO */}
          <Text
            style={{
              fontSize: 26,
              fontWeight: "bold",
              color: "#333",
              textAlign: "center",
              marginBottom: 6,
            }}
          >
            {etapa === 1 ? "Dados Pessoais 💖" : "Dados de Acesso 💖"}
          </Text>
          <Text
            style={{
              textAlign: "center",
              color: "#777",
              fontSize: 14,
              lineHeight: 22,
              marginBottom: 28,
            }}
          >
            {etapa === 1
              ? "Preencha seus dados para continuar"
              : "Crie seu e-mail e senha de acesso"}
          </Text>

          {/* ── ETAPA 1 ── */}
          {etapa === 1 && (
            <>
              <Text style={labelStyle}>Nome Completo *</Text>
              <TextInput
                placeholder="Digite seu nome"
                placeholderTextColor="#aaa"
                value={nome}
                onChangeText={setNome}
                style={inputStyle}
              />

              <Text style={labelStyle}>Apelido (Opcional)</Text>
              <TextInput
                placeholder="Como prefere ser chamado"
                placeholderTextColor="#aaa"
                value={apelido}
                onChangeText={setApelido}
                style={inputStyle}
              />

              <Text style={labelStyle}>CPF *</Text>
              <TextInput
                placeholder="000.000.000-00"
                placeholderTextColor="#aaa"
                keyboardType="numeric"
                value={cpf}
                onChangeText={(v) => {
                  const masked = maskCpf(v);
                  setCpf(masked);
                  const digits = masked.replace(/\D/g, "");
                  if (digits.length === 11) {
                    setCpfErro(cpfUtils.isValidCpf(digits) ? null : "CPF inválido.");
                  } else {
                    setCpfErro(null);
                  }
                }}
                maxLength={14}
                style={[
                  inputStyle,
                  cpfErro ? { borderColor: "#ef4444", marginBottom: 4 } : {},
                ]}
              />
              {cpfErro ? (
                <Text style={{ color: "#ef4444", fontSize: 12, marginBottom: 16, marginTop: -2 }}>
                  {cpfErro}
                </Text>
              ) : null}

              <Text style={labelStyle}>Data de Nascimento *</Text>
              <TextInput
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#aaa"
                keyboardType="numeric"
                value={dataNascimento}
                onChangeText={(v) => setDataNascimento(maskDate(v))}
                maxLength={10}
                style={inputStyle}
              />

              <Text style={labelStyle}>Telefone *</Text>
              <TextInput
                placeholder="(11) 99999-9999"
                placeholderTextColor="#aaa"
                keyboardType="phone-pad"
                value={telefone}
                onChangeText={(v) => setTelefone(maskPhone(v))}
                maxLength={15}
                style={{ ...inputStyle, marginBottom: 30 }}
              />

              <TouchableOpacity
                onPress={handleProximo}
                activeOpacity={0.8}
                style={{ borderRadius: 18, overflow: "hidden" }}
              >
                <LinearGradient
                  colors={["#ff69b4", "#a855f7"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ paddingVertical: 18, alignItems: "center" }}
                >
                  <Text
                    style={{ color: "#fff", fontWeight: "bold", fontSize: 17 }}
                  >
                    Próximo
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push("/login")}>
                <Text
                  style={{
                    marginTop: 22,
                    textAlign: "center",
                    color: "#ff69b4",
                    fontWeight: "bold",
                  }}
                >
                  Já possui conta? Entrar
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── ETAPA 2 ── */}
          {etapa === 2 && (
            <>
              <Text style={labelStyle}>E-mail *</Text>
              <TextInput
                placeholder="Digite seu e-mail"
                placeholderTextColor="#aaa"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                style={inputStyle}
              />

              <Text style={labelStyle}>Senha *</Text>
              <TextInput
                placeholder="Mínimo de 6 caracteres"
                placeholderTextColor="#aaa"
                secureTextEntry
                value={senha}
                onChangeText={setSenha}
                style={inputStyle}
              />

              <Text style={labelStyle}>Confirmar Senha *</Text>
              <TextInput
                placeholder="Confirme sua senha"
                placeholderTextColor="#aaa"
                secureTextEntry
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                style={{ ...inputStyle, marginBottom: 24 }}
              />

              {/* TERMOS */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  marginBottom: 24,
                }}
              >
                <Switch
                  value={aceitouTermos}
                  onValueChange={setAceitouTermos}
                  trackColor={{ false: "#ddd", true: "#c084fc" }}
                  thumbColor={aceitouTermos ? "#a855f7" : "#f4f4f4"}
                />
                <Text
                  style={{
                    flex: 1,
                    marginLeft: 10,
                    color: "#666",
                    fontSize: 12,
                    lineHeight: 18,
                  }}
                >
                  Ao continuar, você concorda com os{" "}
                  <Text style={{ color: "#a855f7", fontWeight: "bold" }}>
                    Termos de Uso
                  </Text>{" "}
                  e está ciente da{" "}
                  <Text style={{ color: "#a855f7", fontWeight: "bold" }}>
                    Declaração de Privacidade
                  </Text>
                  .
                </Text>
              </View>

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
                  style={{ paddingVertical: 18, alignItems: "center" }}
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
                      Finalizar Cadastro
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setEtapa(1)}>
                <Text
                  style={{
                    marginTop: 18,
                    textAlign: "center",
                    color: "#444",
                    fontWeight: "bold",
                  }}
                >
                  Voltar
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
