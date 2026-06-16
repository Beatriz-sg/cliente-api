import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";

// ─── MÁSCARAS ────────────────────────────────────────────────────────────────

function mascaraCPF(valor: string): string {
  const n = valor.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 3) return n;
  if (n.length <= 6) return n.slice(0, 3) + "." + n.slice(3);
  if (n.length <= 9) return n.slice(0, 3) + "." + n.slice(3, 6) + "." + n.slice(6);
  return n.slice(0, 3) + "." + n.slice(3, 6) + "." + n.slice(6, 9) + "-" + n.slice(9);
}

function mascaraData(valor: string): string {
  const n = valor.replace(/\D/g, "").slice(0, 8);
  if (n.length <= 2) return n;
  if (n.length <= 4) return n.slice(0, 2) + "/" + n.slice(2);
  return n.slice(0, 2) + "/" + n.slice(2, 4) + "/" + n.slice(4);
}

// ─── VALIDAÇÕES ──────────────────────────────────────────────────────────────

function validarCPF(valor: string): string {
  const n = valor.replace(/\D/g, "");
  if (n.length === 0) return "CPF é obrigatório.";
  if (n.length !== 11) return "CPF deve conter 11 dígitos.";
  if (/^(\d)\1{10}$/.test(n)) return "CPF inválido.";

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(n[i]) * (10 - i);
  let r = (soma * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(n[9])) return "CPF inválido.";

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(n[i]) * (11 - i);
  r = (soma * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(n[10])) return "CPF inválido.";

  return "";
}

function validarData(valor: string): string {
  if (!valor || valor.replace(/\D/g, "").length === 0) return "Data de nascimento é obrigatória.";
  if (valor.length < 10) return "Informe uma data de nascimento válida.";

  const [diaStr, mesStr, anoStr] = valor.split("/");
  const dia = parseInt(diaStr, 10);
  const mes = parseInt(mesStr, 10);
  const ano = parseInt(anoStr, 10);

  if (mes < 1 || mes > 12) return "Informe uma data de nascimento válida.";
  if (dia < 1 || dia > 31) return "Informe uma data de nascimento válida.";
  if (ano < 1900) return "Informe uma data de nascimento válida.";

  const data = new Date(ano, mes - 1, dia);
  if (
    data.getFullYear() !== ano ||
    data.getMonth() !== mes - 1 ||
    data.getDate() !== dia
  ) return "Informe uma data de nascimento válida.";

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  if (data > hoje) return "Informe uma data de nascimento válida.";

  const diffMs = hoje.getTime() - data.getTime();
  const idade = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
  if (idade < 18) return "Você deve ter pelo menos 18 anos para se cadastrar.";

  return "";
}

function toISO(valor: string): string {
  const [dia, mes, ano] = valor.split("/");
  return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
}

// ─── COMPONENTE ──────────────────────────────────────────────────────────────

export default function CadastroDadosScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();

  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");

  const [erroCpf, setErroCpf] = useState("");
  const [erroData, setErroData] = useState("");
  const [tocouCpf, setTocouCpf] = useState(false);
  const [tocouData, setTocouData] = useState(false);

  // Erros em tempo real só aparecem depois que o campo foi tocado
  const cpfValido = validarCPF(cpf) === "";
  const dataValida = validarData(dataNascimento) === "";
  const podeContinuar =
    nome.trim().length > 0 &&
    sobrenome.trim().length > 0 &&
    cpfValido &&
    dataValida;

  function handleCpfChange(texto: string) {
    const mascarado = mascaraCPF(texto);
    setCpf(mascarado);
    if (tocouCpf) setErroCpf(validarCPF(mascarado));
  }

  function handleCpfBlur() {
    setTocouCpf(true);
    setErroCpf(validarCPF(cpf));
  }

  function handleDataChange(texto: string) {
    const mascarado = mascaraData(texto);
    setDataNascimento(mascarado);
    if (tocouData) setErroData(validarData(mascarado));
  }

  function handleDataBlur() {
    setTocouData(true);
    setErroData(validarData(dataNascimento));
  }

  function handleContinuar() {
    // Força validação visível de todos os campos
    setTocouCpf(true);
    setTocouData(true);
    const erroCpfFinal = validarCPF(cpf);
    const erroDataFinal = validarData(dataNascimento);
    setErroCpf(erroCpfFinal);
    setErroData(erroDataFinal);

    if (!nome.trim() || !sobrenome.trim() || erroCpfFinal || erroDataFinal) return;

    router.push({
      pathname: "/cadastro-senha",
      params: {
        email,
        nome: nome.trim(),
        sobrenome: sobrenome.trim(),
        cpf: cpf.replace(/\D/g, ""),
        dataNascimento: toISO(dataNascimento),
      },
    });
  }

  const inputBase = {
    backgroundColor: "#f9f3fb",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#f1d4ff",
    color: "#333",
  } as const;

  const inputErro = { borderColor: "#ef4444" } as const;

  return (
    <LinearGradient colors={["#f8edf7", "#f2dcff"]} style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 25,
          paddingBottom: 40,
        }}
      >
        {/* LOGO */}
        <View style={{ alignItems: "center", marginTop: 40, marginBottom: -25, zIndex: 10 }}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={{ width: 95, height: 95, borderRadius: 70 }}
          />
        </View>

        {/* CARD */}
        <View style={{
          backgroundColor: "#fff",
          borderRadius: 35,
          paddingTop: 60,
          paddingBottom: 28,
          paddingHorizontal: 28,
          shadowColor: "#c45ccf",
          shadowOpacity: 0.12,
          shadowRadius: 18,
          elevation: 12,
        }}>

          {/* ETAPA */}
          <Text style={{ textAlign: "center", color: "#a855f7", fontWeight: "bold", marginBottom: 10 }}>
            Etapa 3 de 4
          </Text>

          {/* ÍCONE */}
          <View style={{ alignSelf: "center", marginBottom: 22 }}>
            <LinearGradient
              colors={["#ff69b4", "#a855f7"]}
              style={{ width: 75, height: 75, borderRadius: 50, justifyContent: "center", alignItems: "center" }}
            >
              <MaterialIcons name="person" size={36} color="#fff" />
            </LinearGradient>
          </View>

          {/* TÍTULO */}
          <Text style={{ fontSize: 28, fontWeight: "bold", color: "#333", textAlign: "center", marginBottom: 10 }}>
            Seus Dados 💖
          </Text>

          <Text style={{ textAlign: "center", color: "#777", fontSize: 15, lineHeight: 22, marginBottom: 30 }}>
            Preencha seus dados para continuar
          </Text>

          {/* NOME */}
          <Text style={{ color: "#555", marginBottom: 8, fontWeight: "600" }}>Nome *</Text>
          <TextInput
            placeholder="Digite seu nome"
            placeholderTextColor="#aaa"
            value={nome}
            onChangeText={setNome}
            style={{ ...inputBase, marginBottom: 20 }}
          />

          {/* SOBRENOME */}
          <Text style={{ color: "#555", marginBottom: 8, fontWeight: "600" }}>Sobrenome *</Text>
          <TextInput
            placeholder="Digite seu sobrenome"
            placeholderTextColor="#aaa"
            value={sobrenome}
            onChangeText={setSobrenome}
            style={{ ...inputBase, marginBottom: 20 }}
          />

          {/* CPF */}
          <Text style={{ color: "#555", marginBottom: 8, fontWeight: "600" }}>CPF *</Text>
          <TextInput
            placeholder="000.000.000-00"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={cpf}
            onChangeText={handleCpfChange}
            onBlur={handleCpfBlur}
            maxLength={14}
            style={{ ...inputBase, ...(erroCpf ? inputErro : {}), marginBottom: erroCpf ? 4 : 20 }}
          />
          {erroCpf ? (
            <Text style={{ color: "#ef4444", fontSize: 12, marginBottom: 16 }}>{erroCpf}</Text>
          ) : null}

          {/* DATA DE NASCIMENTO */}
          <Text style={{ color: "#555", marginBottom: 8, fontWeight: "600" }}>Data de Nascimento *</Text>
          <TextInput
            placeholder="DD/MM/AAAA"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={dataNascimento}
            onChangeText={handleDataChange}
            onBlur={handleDataBlur}
            maxLength={10}
            style={{ ...inputBase, ...(erroData ? inputErro : {}), marginBottom: erroData ? 4 : 28 }}
          />
          {erroData ? (
            <Text style={{ color: "#ef4444", fontSize: 12, marginBottom: 24 }}>{erroData}</Text>
          ) : null}

          {/* BOTÃO CONTINUAR */}
          <TouchableOpacity
            onPress={handleContinuar}
            activeOpacity={podeContinuar ? 0.8 : 1}
            style={{ borderRadius: 18, overflow: "hidden", opacity: podeContinuar ? 1 : 0.45 }}
          >
            <LinearGradient
              colors={["#ff69b4", "#a855f7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ paddingVertical: 18, alignItems: "center" }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 17 }}>Continuar</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* VOLTAR */}
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ marginTop: 22, textAlign: "center", color: "#444", fontWeight: "bold" }}>
              Voltar
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </LinearGradient>
  );
}
