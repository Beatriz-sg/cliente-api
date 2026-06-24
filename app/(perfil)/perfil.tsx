import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  ActionSheetIOS,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { logout } from "../../services/authService";
import {
  getPerfil,
  atualizarPerfil,
  uploadFoto,
  buscarCep,
  type ClientePerfil,
} from "../../services/perfilService";

// ─── CONSTANTES ──────────────────────────────────────────────────────────────

const PREFERENCIAS_OPCOES = [
  "Bolos",
  "Cupcakes",
  "Brigadeiros",
  "Tortas",
  "Churros",
  "Mousses",
  "Docinhos",
  "Brownies",
];

const RESTRICOES_OPCOES = [
  "Sem Glúten",
  "Sem Lactose",
  "Vegano",
  "Diabético",
  "Sem Açúcar",
  "Sem Ovos",
  "Sem Nozes",
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function maskCep(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function maskDate(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

function maskCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/** Converte YYYY-MM-DD → DD/MM/YYYY para exibição */
function isoParaDisplay(iso?: string): string {
  if (!iso) return "";
  // Já no formato display
  if (iso.includes("/")) return iso;
  const partes = iso.split("-");
  if (partes.length !== 3) return iso;
  const [y, m, d] = partes;
  return `${d}/${m}/${y}`;
}

/** Converte DD/MM/YYYY → YYYY-MM-DD para envio */
function displayParaIso(display: string): string {
  if (!display || !display.includes("/")) return display;
  const [d, m, y] = display.split("/");
  if (!d || !m || !y || y.length < 4) return display;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function preencherCampos(
  data: ClientePerfil,
  setters: ReturnType<typeof criarSetters>,
) {
  setters.setNome(data.nome ?? "");
  setters.setApelido(data.apelido ?? "");
  setters.setDataNascimento(isoParaDisplay(data.dataNascimento));
  setters.setEmail(data.email ?? "");
  setters.setTelefone(maskPhone(data.telefone ?? ""));
  setters.setCep(maskCep(data.cep ?? ""));
  setters.setLogradouro(data.logradouro ?? "");
  setters.setNumero(data.numero ?? "");
  setters.setComplemento(data.complemento ?? "");
  setters.setBairro(data.bairro ?? "");
  setters.setCidade(data.cidade ?? "");
  setters.setEstado(data.estado ?? "");
  setters.setFotoPerfil(data.fotoPerfil ?? null);
  setters.setPreferencias(data.preferencias ?? []);
  setters.setRestricoes(data.restricoes ?? []);
}

// Tipo auxiliar usado apenas dentro do componente
type Setters = {
  setNome: (v: string) => void;
  setApelido: (v: string) => void;
  setDataNascimento: (v: string) => void;
  setEmail: (v: string) => void;
  setTelefone: (v: string) => void;
  setCep: (v: string) => void;
  setLogradouro: (v: string) => void;
  setNumero: (v: string) => void;
  setComplemento: (v: string) => void;
  setBairro: (v: string) => void;
  setCidade: (v: string) => void;
  setEstado: (v: string) => void;
  setFotoPerfil: (v: string | null) => void;
  setPreferencias: (v: string[]) => void;
  setRestricoes: (v: string[]) => void;
};

// Dummy só para inferir o tipo — nunca chamado
function criarSetters(): Setters {
  return {} as Setters;
}

// ─── ESTILOS ─────────────────────────────────────────────────────────────────

const inputBase = {
  backgroundColor: "#fff",
  borderRadius: 14,
  paddingHorizontal: 16,
  paddingVertical: 13,
  fontSize: 14,
  color: "#333",
  borderWidth: 1,
  borderColor: "#f1d4ff",
} as const;

const inputReadonly = {
  ...inputBase,
  backgroundColor: "#f5f5f5",
  color: "#888",
} as const;

const labelSt = {
  color: "#888",
  fontSize: 12,
  marginBottom: 5,
  fontWeight: "600" as const,
};

const secaoTitulo = {
  fontSize: 15,
  fontWeight: "bold" as const,
  color: "#333",
  marginBottom: 14,
  marginTop: 6,
};

// ─── COMPONENTE ──────────────────────────────────────────────────────────────

export default function PerfilScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [perfil, setPerfil] = useState<ClientePerfil | null>(null);

  const [nome, setNome] = useState("");
  const [apelido, setApelido] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [preferencias, setPreferencias] = useState<string[]>([]);
  const [restricoes, setRestricoes] = useState<string[]>([]);

  const setters: Setters = {
    setNome,
    setApelido,
    setDataNascimento,
    setEmail,
    setTelefone,
    setCep,
    setLogradouro,
    setNumero,
    setComplemento,
    setBairro,
    setCidade,
    setEstado,
    setFotoPerfil,
    setPreferencias,
    setRestricoes,
  };

  // ── Carregamento ─────────────────────────────────────────────────────────

  const carregarPerfil = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPerfil();
      setPerfil(data);
      preencherCampos(data, setters);
    } catch (e: any) {
      Alert.alert(
        "Erro ao carregar perfil",
        e.message ?? "Verifique sua conexão e tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    carregarPerfil();
  }, [carregarPerfil]);

  // ── CEP auto-fill ────────────────────────────────────────────────────────

  async function handleCepChange(v: string) {
    const masked = maskCep(v);
    setCep(masked);
    if (masked.replace(/\D/g, "").length === 8) {
      const dados = await buscarCep(masked);
      if (dados) {
        setLogradouro(dados.logradouro);
        setBairro(dados.bairro);
        setCidade(dados.cidade);
        setEstado(dados.estado);
      }
    }
  }

  // ── Foto ─────────────────────────────────────────────────────────────────

  function abrirOpcoesFoto() {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancelar", "Tirar foto", "Escolher da galeria"],
          cancelButtonIndex: 0,
        },
        (i) => {
          if (i === 1) tirarFoto();
          else if (i === 2) escolherGaleria();
        },
      );
    } else {
      Alert.alert("Foto de perfil", "Escolha uma opção", [
        { text: "Cancelar", style: "cancel" },
        { text: "📷 Câmera", onPress: tirarFoto },
        { text: "🖼️ Galeria", onPress: escolherGaleria },
      ]);
    }
  }

  async function tirarFoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Permita o acesso à câmera nas configurações.",
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.75,
    });
    if (!result.canceled && result.assets[0])
      setFotoPerfil(result.assets[0].uri);
  }

  async function escolherGaleria() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Permita o acesso à galeria nas configurações.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.75,
    });
    if (!result.canceled && result.assets[0])
      setFotoPerfil(result.assets[0].uri);
  }

  // ── Toggle chips ─────────────────────────────────────────────────────────

  function toggleItem(
    lista: string[],
    item: string,
    setLista: (v: string[]) => void,
  ) {
    setLista(
      lista.includes(item) ? lista.filter((i) => i !== item) : [...lista, item],
    );
  }

  // ── Salvar ────────────────────────────────────────────────────────────────

  async function salvar() {
    if (!nome.trim()) {
      Alert.alert("Atenção", "O nome é obrigatório.");
      return;
    }
    setSaving(true);
    try {
      let fotoUrl: string | undefined = fotoPerfil ?? undefined;

      // Upload de foto apenas quando for URI local (nova foto selecionada)
      const isLocalUri =
        fotoPerfil &&
        (fotoPerfil.startsWith("file://") ||
          fotoPerfil.startsWith("content://") ||
          fotoPerfil.startsWith("/"));
      if (isLocalUri) {
        try {
          fotoUrl = await uploadFoto(fotoPerfil!);
        } catch (uploadErr: any) {
          // Upload falhou mas não bloqueia salvar os outros dados
          Alert.alert(
            "Atenção",
            `Não foi possível enviar a foto: ${uploadErr.message ?? "Erro desconhecido"}.\nOs outros dados serão salvos normalmente.`,
          );
          fotoUrl = perfil?.fotoPerfil ?? undefined; // mantém a foto anterior
        }
      }

      const payload = {
        nome: nome.trim(),
        apelido: apelido.trim() || undefined,
        dataNascimento: dataNascimento
          ? displayParaIso(dataNascimento)
          : undefined,
        email: email.trim(),
        telefone: telefone.replace(/\D/g, "") || undefined,
        cep: cep.replace(/\D/g, "") || undefined,
        logradouro: logradouro.trim() || undefined,
        numero: numero.trim() || undefined,
        complemento: complemento.trim() || undefined,
        bairro: bairro.trim() || undefined,
        cidade: cidade.trim() || undefined,
        estado: estado.trim() || undefined,
        fotoPerfil: fotoUrl,
        preferencias,
        restricoes,
      };

      const atualizado = await atualizarPerfil(payload);
      setPerfil(atualizado);
      setFotoPerfil(atualizado.fotoPerfil ?? fotoUrl ?? null);
      Alert.alert(
        "💖 Perfil atualizado!",
        "Suas informações foram salvas com sucesso.",
      );
    } catch (e: any) {
      Alert.alert(
        "Erro ao salvar",
        e.message ?? "Não foi possível salvar o perfil.",
      );
    } finally {
      setSaving(false);
    }
  }

  // ── Logout ────────────────────────────────────────────────────────────────

  function handleLogout() {
    Alert.alert("Sair da conta", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff7fc",
        }}
      >
        <ActivityIndicator size="large" color="#a855f7" />
        <Text style={{ color: "#a855f7", marginTop: 12, fontSize: 14 }}>
          Carregando perfil...
        </Text>
      </View>
    );
  }

  // URI local (câmera/galeria antes de salvar) → usa direto
  // URL completa retornada pela API após upload → usa direto
  const fotoSource =
    fotoPerfil && fotoPerfil.trim() !== ""
      ? { uri: fotoPerfil }
      : require("../../assets/images/logo.png");

  // CPF com máscara para exibição
  const cpfExibicao = perfil?.cpf ? maskCpf(perfil.cpf) : "";

  return (
    <LinearGradient colors={["#fff7fc", "#f7ecff"]} style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── HEADER ── */}
        <View
          style={{ paddingTop: 60, paddingHorizontal: 22, marginBottom: 4 }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 26,
              fontWeight: "bold",
              color: "#333",
              marginTop: 12,
            }}
          >
            Meu Perfil
          </Text>
        </View>

        {/* ── AVATAR ── */}
        <View style={{ alignItems: "center", marginVertical: 24 }}>
          <TouchableOpacity onPress={abrirOpcoesFoto} activeOpacity={0.85}>
            <Image
              source={fotoSource}
              style={{
                width: 108,
                height: 108,
                borderRadius: 54,
                borderWidth: 3,
                borderColor: "#a855f7",
              }}
            />
            <View
              style={{
                position: "absolute",
                bottom: 2,
                right: 2,
                backgroundColor: "#a855f7",
                borderRadius: 16,
                padding: 7,
                borderWidth: 2,
                borderColor: "#fff",
              }}
            >
              <MaterialIcons name="camera-alt" size={15} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text
            style={{
              marginTop: 12,
              fontSize: 17,
              fontWeight: "bold",
              color: "#333",
            }}
          >
            {nome || "Seu nome"}
          </Text>
          {perfil?.email ? (
            <Text style={{ color: "#999", fontSize: 13, marginTop: 3 }}>
              {perfil.email}
            </Text>
          ) : null}
        </View>

        <View style={{ paddingHorizontal: 22 }}>
          {/* ════ DADOS PESSOAIS ════ */}
          <Text style={secaoTitulo}>👤 Dados Pessoais</Text>

          <Text style={labelSt}>Nome *</Text>
          <TextInput
            value={nome}
            onChangeText={setNome}
            placeholder="Seu nome completo"
            placeholderTextColor="#bbb"
            style={{ ...inputBase, marginBottom: 14 }}
          />

          <Text style={labelSt}>Apelido</Text>
          <TextInput
            value={apelido}
            onChangeText={setApelido}
            placeholder="Como prefere ser chamado"
            placeholderTextColor="#bbb"
            style={{ ...inputBase, marginBottom: 14 }}
          />

          {/* CPF — somente leitura */}
          <Text style={labelSt}>CPF (não editável)</Text>
          <View style={{ marginBottom: 14 }}>
            <TextInput
              value={cpfExibicao || "Não informado"}
              editable={false}
              style={inputReadonly}
            />
            {!cpfExibicao && (
              <Text style={{ color: "#f59e0b", fontSize: 11, marginTop: 4 }}>
                ⚠️ CPF não carregado — verifique a API
              </Text>
            )}
          </View>

          <Text style={labelSt}>Data de Nascimento</Text>
          <View style={{ marginBottom: 14 }}>
            <TextInput
              value={dataNascimento}
              onChangeText={(v) => setDataNascimento(maskDate(v))}
              keyboardType="numeric"
              maxLength={10}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#bbb"
              style={inputBase}
            />
            {!dataNascimento && (
              <Text style={{ color: "#f59e0b", fontSize: 11, marginTop: 4 }}>
                ⚠️ Data não carregada — verifique a API
              </Text>
            )}
          </View>

          <Text style={labelSt}>E-mail *</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="seu@email.com"
            placeholderTextColor="#bbb"
            style={{ ...inputBase, marginBottom: 14 }}
          />

          <Text style={labelSt}>Telefone</Text>
          <TextInput
            value={telefone}
            onChangeText={(v) => setTelefone(maskPhone(v))}
            keyboardType="phone-pad"
            maxLength={15}
            placeholder="(11) 99999-9999"
            placeholderTextColor="#bbb"
            style={{ ...inputBase, marginBottom: 24 }}
          />

          {/* ════ ENDEREÇO ════ */}
          <Text style={secaoTitulo}>📍 Endereço</Text>

          <Text style={labelSt}>CEP</Text>
          <TextInput
            value={cep}
            onChangeText={handleCepChange}
            keyboardType="numeric"
            maxLength={9}
            placeholder="00000-000"
            placeholderTextColor="#bbb"
            style={{ ...inputBase, marginBottom: 14 }}
          />

          <Text style={labelSt}>Logradouro</Text>
          <TextInput
            value={logradouro}
            onChangeText={setLogradouro}
            placeholder="Rua, Avenida..."
            placeholderTextColor="#bbb"
            style={{ ...inputBase, marginBottom: 14 }}
          />

          <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
            <View style={{ flex: 1 }}>
              <Text style={labelSt}>Número</Text>
              <TextInput
                value={numero}
                onChangeText={setNumero}
                keyboardType="numeric"
                placeholder="Nº"
                placeholderTextColor="#bbb"
                style={inputBase}
              />
            </View>
            <View style={{ flex: 2 }}>
              <Text style={labelSt}>Complemento</Text>
              <TextInput
                value={complemento}
                onChangeText={setComplemento}
                placeholder="Apto, Bloco..."
                placeholderTextColor="#bbb"
                style={inputBase}
              />
            </View>
          </View>

          <Text style={labelSt}>Bairro</Text>
          <TextInput
            value={bairro}
            onChangeText={setBairro}
            placeholder="Bairro"
            placeholderTextColor="#bbb"
            style={{ ...inputBase, marginBottom: 14 }}
          />

          <View style={{ flexDirection: "row", gap: 10, marginBottom: 26 }}>
            <View style={{ flex: 3 }}>
              <Text style={labelSt}>Cidade</Text>
              <TextInput
                value={cidade}
                onChangeText={setCidade}
                placeholder="Cidade"
                placeholderTextColor="#bbb"
                style={inputBase}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={labelSt}>Estado</Text>
              <TextInput
                value={estado}
                onChangeText={setEstado}
                autoCapitalize="characters"
                maxLength={2}
                placeholder="UF"
                placeholderTextColor="#bbb"
                style={inputBase}
              />
            </View>
          </View>

          {/* ════ PREFERÊNCIAS ════ */}
          <Text style={secaoTitulo}>🍰 Preferências</Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
              marginBottom: 24,
            }}
          >
            {PREFERENCIAS_OPCOES.map((item) => {
              const ativo = preferencias.includes(item);
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() =>
                    toggleItem(preferencias, item, setPreferencias)
                  }
                  activeOpacity={0.75}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 9,
                    borderRadius: 22,
                    borderWidth: 1.5,
                    borderColor: ativo ? "#a855f7" : "#ddb6f8",
                    backgroundColor: ativo ? "#a855f7" : "#fdf5ff",
                  }}
                >
                  <Text
                    style={{
                      color: ativo ? "#fff" : "#9333ea",
                      fontSize: 13,
                      fontWeight: "600",
                    }}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ════ RESTRIÇÕES ALIMENTARES ════ */}
          <Text style={secaoTitulo}>🚫 Restrições Alimentares</Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
              marginBottom: 30,
            }}
          >
            {RESTRICOES_OPCOES.map((item) => {
              const ativo = restricoes.includes(item);
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => toggleItem(restricoes, item, setRestricoes)}
                  activeOpacity={0.75}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 9,
                    borderRadius: 22,
                    borderWidth: 1.5,
                    borderColor: ativo ? "#ef4444" : "#fca5a5",
                    backgroundColor: ativo ? "#ef4444" : "#fff5f5",
                  }}
                >
                  <Text
                    style={{
                      color: ativo ? "#fff" : "#dc2626",
                      fontSize: 13,
                      fontWeight: "600",
                    }}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ════ BOTÃO SALVAR ════ */}
          <TouchableOpacity
            onPress={salvar}
            disabled={saving}
            activeOpacity={0.85}
            style={{ borderRadius: 18, overflow: "hidden", marginBottom: 14 }}
          >
            <LinearGradient
              colors={["#ff69b4", "#a855f7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ paddingVertical: 17, alignItems: "center" }}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}
                >
                  Salvar Perfil
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* ════ LOGOUT ════ */}
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              alignItems: "center",
              paddingVertical: 14,
              marginBottom: 6,
            }}
          >
            <Text
              style={{ color: "#ef4444", fontWeight: "bold", fontSize: 15 }}
            >
              Sair da conta
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
