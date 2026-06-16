import { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Image, ActivityIndicator, Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUser, getToken, logout } from "../../services/authService";
import { apiUrl } from "../../constants/api";

interface UserData {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  apelido?: string;
  foto?: string;
}

export default function PerfilScreen() {
  const [user, setUser] = useState<UserData | null>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [apelido, setApelido] = useState("");
  const [endereco, setEndereco] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [cep, setCep] = useState("");
  const [foto, setFoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await getUser();
      if (u) {
        setUser(u);
        setNome(u.nome ?? "");
        setTelefone(u.telefone ?? "");
        setApelido(u.apelido ?? "");
        setEndereco(u.endereco ?? "");
        setBairro(u.bairro ?? "");
        setCidade(u.cidade ?? "");
        setUf(u.uf ?? "");
        setCep(u.cep ?? "");
        setFoto(u.foto ?? null);
      }
      setLoading(false);
    })();
  }, []);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Permita o acesso à galeria para escolher uma foto.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setFoto(result.assets[0].uri);
    }
  }

  async function salvar() {
    if (!user?.id) return;
    setSaving(true);
    try {
      const token = await getToken();
      const payload: any = { nome, telefone, apelido, endereco, bairro, cidade, uf, cep };

      // Upload de foto se mudou e é URI local
      if (foto && foto.startsWith("file")) {
        const formData = new FormData();
        formData.append("foto", { uri: foto, name: "perfil.jpg", type: "image/jpeg" } as any);
        const fotoRes = await fetch(apiUrl(`/cliente/foto/${user.id}`), {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (fotoRes.ok) {
          const fotoData = await fotoRes.json();
          payload.foto = fotoData.fotoUrl ?? fotoData.foto ?? foto;
        }
      }

      const res = await fetch(apiUrl(`/cliente/atualizar/${user.id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao salvar.");

      const updated = await res.json();
      const newUser = { ...user, ...updated, foto: payload.foto ?? foto };
      await AsyncStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
      setFoto(newUser.foto ?? null);
      Alert.alert("Perfil atualizado! 💖");
    } catch (e: any) {
      Alert.alert("Erro", e.message ?? "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    Alert.alert("Sair", "Deseja sair da conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair", style: "destructive", onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        }
      },
    ]);
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff7fc" }}>
        <ActivityIndicator size="large" color="#a855f7" />
      </View>
    );
  }

  return (
    <LinearGradient colors={["#fff7fc", "#f7ecff"]} style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* HEADER */}
        <View style={{ paddingTop: 60, paddingHorizontal: 22, marginBottom: 8 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={{ fontSize: 26, fontWeight: "bold", color: "#333", marginTop: 12 }}>Meu Perfil</Text>
        </View>

        {/* AVATAR */}
        <View style={{ alignItems: "center", marginVertical: 20 }}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
            {foto ? (
              <Image source={{ uri: foto }} style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: "#a855f7" }} />
            ) : (
              <Image source={require("../../assets/images/logo.png")} style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: "#a855f7" }} />
            )}
            <View style={{
              position: "absolute", bottom: 0, right: 0,
              backgroundColor: "#a855f7", borderRadius: 14,
              padding: 6, borderWidth: 2, borderColor: "#fff",
            }}>
              <MaterialIcons name="camera-alt" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={{ marginTop: 10, fontSize: 16, fontWeight: "bold", color: "#333" }}>
            {nome || "Seu nome"}
          </Text>
          {user?.email ? (
            <Text style={{ color: "#777", fontSize: 13 }}>{user.email}</Text>
          ) : null}
        </View>

        {/* FORMULÁRIO */}
        <View style={{ paddingHorizontal: 22 }}>
          {[
            { label: "Nome", value: nome, set: setNome },
            { label: "Apelido", value: apelido, set: setApelido },
            { label: "Telefone", value: telefone, set: setTelefone, keyboard: "phone-pad" as const },
            { label: "CEP", value: cep, set: setCep, keyboard: "numeric" as const },
            { label: "Endereço", value: endereco, set: setEndereco },
            { label: "Bairro", value: bairro, set: setBairro },
            { label: "Cidade", value: cidade, set: setCidade },
            { label: "UF", value: uf, set: setUf },
          ].map(({ label, value, set, keyboard }) => (
            <View key={label} style={{ marginBottom: 14 }}>
              <Text style={{ color: "#777", fontSize: 12, marginBottom: 4 }}>{label}</Text>
              <TextInput
                value={value}
                onChangeText={set}
                keyboardType={keyboard ?? "default"}
                style={{
                  backgroundColor: "#fff", borderRadius: 14,
                  paddingHorizontal: 16, paddingVertical: 12,
                  fontSize: 14, color: "#333",
                  borderWidth: 1, borderColor: "#f1d4ff",
                }}
              />
            </View>
          ))}

          {/* SALVAR */}
          <TouchableOpacity onPress={salvar} disabled={saving} activeOpacity={0.85} style={{ borderRadius: 16, overflow: "hidden", marginTop: 8 }}>
            <LinearGradient
              colors={["#ff69b4", "#a855f7"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ paddingVertical: 16, alignItems: "center" }}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>Salvar alterações</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* SAIR */}
          <TouchableOpacity onPress={handleLogout} style={{ marginTop: 16, alignItems: "center", paddingVertical: 14 }}>
            <Text style={{ color: "#ef4444", fontWeight: "bold", fontSize: 15 }}>Sair da conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
