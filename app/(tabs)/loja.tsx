import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import {
  getLojasFavoritas,
  getProdutosFavoritos,
  toggleLojaFavorita,
  toggleProdutoFavorito,
} from "../../services/favoritosLocalService";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCart } from "../../context/CartContext";
import BottomTabs from "../../components/home/BottomTabs";
import { getStores, getStoreProdutos, getStoreKits } from "../../services/storeService";
import { imagemUrl } from "../../constants/api";

function ProdutoCard({
  produto,
  favorito,
  onFavoritar,
  onAdicionar,
  deliveryFee,
  deliveryTime,
}: any) {
  const uri = imagemUrl(produto.imagemUrl ?? produto.imagem);
  return (
    <View
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
      {uri ? (
        <Image source={{ uri }} style={{ width: 110, height: 110, borderRadius: 20 }} />
      ) : (
        <View
          style={{
            width: 110,
            height: 110,
            borderRadius: 20,
            backgroundColor: "#fce7f3",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MaterialIcons name="cake" size={40} color="#ff69b4" />
        </View>
      )}

      <TouchableOpacity
        onPress={onFavoritar}
        style={{ position: "absolute", top: 10, right: 10, zIndex: 99 }}
      >
        <MaterialIcons
          name={favorito ? "favorite" : "favorite-border"}
          size={24}
          color="#ff4d8d"
        />
      </TouchableOpacity>

      <View style={{ flex: 1, marginLeft: 14, justifyContent: "space-between" }}>
        <View>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#333" }}>
            {produto.nome}
          </Text>
          <Text style={{ color: "#777", marginTop: 4, lineHeight: 18, flexShrink: 1 }}>
            {produto.descricao}
          </Text>
          <View style={{ marginTop: 8 }}>
            {deliveryFee && (
              <Text style={{ color: "#22c55e", fontSize: 11, marginTop: 2 }}>
                🚚 Entrega: {deliveryFee}
              </Text>
            )}
            <Text style={{ color: "#f97316", fontSize: 11, marginTop: 2 }}>
              🎁 Acima de R$ 50 frete grátis
            </Text>
            {deliveryTime && (
              <Text style={{ color: "#6366f1", fontSize: 11, marginTop: 2 }}>
                ⏱️ {deliveryTime}
              </Text>
            )}
          </View>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ color: "#ff69b4", fontSize: 20, fontWeight: "bold" }}>
            R$ {Number(produto.preco).toFixed(2)}
          </Text>
          <TouchableOpacity
            onPress={onAdicionar}
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
            <MaterialIcons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function LojaScreen() {
  const [busca, setBusca] = useState("");
  const [mostrarBusca, setMostrarBusca] = useState(false);
  const { lojaId } = useLocalSearchParams();
  const { addItem, itens } = useCart() as any;

  const [loja, setLoja] = useState<any>(null);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [kits, setKits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [favoritosProdutos, setFavoritosProdutos] = useState<number[]>([]);
  const [lojaFavorita, setLojaFavorita] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Tudo");

  useEffect(() => {
    carregarDados();
    carregarFavoritos();
  }, [lojaId]);

  async function carregarDados() {
    setLoading(true);
    try {
      const [lojas, prods, ks] = await Promise.all([
        getStores(),
        getStoreProdutos(Number(lojaId)),
        getStoreKits(Number(lojaId)),
      ]);
      const lojaEncontrada = lojas.find((l) => l.id === Number(lojaId));
      setLoja(lojaEncontrada ?? null);
      // Separa kits dos produtos comuns (a API já retorna separados, mas garantimos)
      const produtosComuns = prods.filter(
        (p: any) => !(p.categoria?.descricao === "Kits e Combos" || p.isKit)
      );
      setProdutos(produtosComuns);
      setKits(ks);
    } finally {
      setLoading(false);
    }
  }

  async function carregarFavoritos() {
    const [favLojas, favProd] = await Promise.all([
      getLojasFavoritas(),
      getProdutosFavoritos(),
    ]);
    setLojaFavorita(favLojas.some((item: any) => item.id === Number(lojaId)));
    setFavoritosProdutos(favProd.map((item: any) => item.id));
  }

  async function favoritarLoja() {
    if (!loja) return;
    await toggleLojaFavorita({
      id: loja.id,
      nomeFantasia: loja.name ?? loja.nome,
      cidade: loja.cidade ?? "",
      fotoUrl: loja.loja?.fotoUrl ?? null,
    });
    carregarFavoritos();
  }

  async function favoritarProduto(produto: any) {
    await toggleProdutoFavorito({
      id: produto.id,
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      fotoUrl: imagemUrl(produto.imagemUrl) ?? null,
    });
    carregarFavoritos();
  }

  function adicionarCarrinho(produto: any) {
    addItem({
      ...produto,
      imagem: imagemUrl(produto.imagemUrl) ?? produto.imagem,
    });
    router.push("/carrinho");
  }

  const categorias = ["Tudo", ...new Set(produtos.map((p) => p.categoria?.descricao ?? ""))];

  const produtosExibidos = produtos.filter((p) => {
    const matchCat =
      categoriaSelecionada === "Tudo" ||
      (p.categoria?.descricao ?? "") === categoriaSelecionada;
    const matchBusca =
      busca === "" || p.nome.toLowerCase().includes(busca.toLowerCase());
    return matchCat && matchBusca;
  });

  if (loading) {
    return (
      <LinearGradient colors={["#fff7fc", "#f7ecff"]} style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#a855f7" />
      </LinearGradient>
    );
  }

  const fotoUri = loja?.loja?.fotoUrl ? imagemUrl(loja.loja.fotoUrl) : null;

  return (
    <LinearGradient colors={["#fff7fc", "#f7ecff"]} style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* BANNER */}
        <View>
          {fotoUri ? (
            <Image source={{ uri: fotoUri }} style={{ width: "100%", height: 240 }} />
          ) : (
            <View
              style={{
                width: "100%",
                height: 240,
                backgroundColor: "#f3e8ff",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialIcons name="store" size={80} color="#a855f7" />
            </View>
          )}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              position: "absolute",
              top: 50,
              left: 20,
              backgroundColor: "rgba(255,255,255,0.9)",
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialIcons name="arrow-back" size={24} color="#a855f7" />
          </TouchableOpacity>
        </View>

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
          {/* CABEÇALHO DA LOJA */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 28, fontWeight: "bold", color: "#333" }}>
                {loja?.name ?? loja?.nome ?? "Loja"}
              </Text>
              <Text style={{ color: "#777", marginTop: 6, fontSize: 14 }}>
                ⭐ {loja?.rating ?? "—"} • {loja?.deliveryTime ?? "—"}
              </Text>
              {loja?.loja?.endereco && (
                <Text style={{ color: "#999", marginTop: 4, fontSize: 12 }}>
                  📍 {loja.loja.endereco}
                </Text>
              )}
              <Text style={{ fontSize: 12, marginTop: 4, color: "#22c55e", fontWeight: "600" }}>
                ● Aberta
              </Text>
              <Text style={{ color: "#999", marginTop: 4, fontSize: 12 }}>
                {produtos.length} produto{produtos.length !== 1 ? "s" : ""}
                {kits.length > 0 ? ` • ${kits.length} kit${kits.length !== 1 ? "s" : ""}` : ""}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <TouchableOpacity onPress={() => setMostrarBusca(!mostrarBusca)}>
                <MaterialIcons name="search" size={28} color="#a855f7" />
              </TouchableOpacity>
              <TouchableOpacity onPress={favoritarLoja}>
                <MaterialIcons
                  name={lojaFavorita ? "favorite" : "favorite-border"}
                  size={30}
                  color="#ff69b4"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* BOTÕES */}
          <View style={{ flexDirection: "row", gap: 10, marginTop: 16, marginBottom: 4 }}>
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: "#a855f7", paddingVertical: 12, borderRadius: 18, alignItems: "center" }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>🛒 Pronta Entrega</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: "#f9f3fb", paddingVertical: 12, borderRadius: 18, alignItems: "center", borderWidth: 1, borderColor: "#a855f7" }}
            >
              <Text style={{ color: "#a855f7", fontWeight: "700", fontSize: 14 }}>📅 Agendar</Text>
            </TouchableOpacity>
          </View>

          {/* CATEGORIAS */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 24, marginBottom: 24 }}>
            {categorias.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategoriaSelecionada(cat)}
                style={{
                  backgroundColor: categoriaSelecionada === cat ? "#a855f7" : "#f9f3fb",
                  paddingHorizontal: 18,
                  paddingVertical: 10,
                  borderRadius: 20,
                  marginRight: 10,
                }}
              >
                <Text style={{ color: categoriaSelecionada === cat ? "#fff" : "#a855f7", fontWeight: "600" }}>
                  {cat || "Geral"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {mostrarBusca && (
            <View
              style={{
                backgroundColor: "#f5f5f5",
                borderRadius: 16,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 12,
                marginBottom: 20,
                height: 50,
              }}
            >
              <MaterialIcons name="search" size={20} color="#999" />
              <TextInput
                value={busca}
                onChangeText={setBusca}
                placeholder={`Buscar em ${loja?.name ?? "loja"}`}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          )}

          {/* PRODUTOS */}
          {produtosExibidos.length === 0 && (
            <Text style={{ color: "#bbb", textAlign: "center", marginVertical: 20 }}>
              Nenhum produto encontrado.
            </Text>
          )}
          {produtosExibidos.map((produto) => (
            <ProdutoCard
              key={produto.id}
              produto={produto}
              favorito={favoritosProdutos.includes(produto.id)}
              onFavoritar={() => favoritarProduto(produto)}
              onAdicionar={() => adicionarCarrinho(produto)}
              deliveryFee={loja?.deliveryFee}
              deliveryTime={loja?.deliveryTime}
            />
          ))}

          {/* KITS E COMBOS */}
          {kits.length > 0 && (
            <>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, marginBottom: 16, gap: 8 }}>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: "#333", flex: 1 }}>
                  🎁 Kits e Combos
                </Text>
                <Text style={{ fontSize: 12, color: "#999" }}>
                  {kits.length} item{kits.length !== 1 ? "s" : ""}
                </Text>
              </View>
              {kits.map((kit) => (
                <ProdutoCard
                  key={kit.id}
                  produto={kit}
                  favorito={favoritosProdutos.includes(kit.id)}
                  onFavoritar={() => favoritarProduto(kit)}
                  onAdicionar={() => adicionarCarrinho(kit)}
                  deliveryFee={loja?.deliveryFee}
                  deliveryTime={loja?.deliveryTime}
                />
              ))}
            </>
          )}
        </View>
      </ScrollView>
      <BottomTabs itens={itens} />
    </LinearGradient>
  );
}
