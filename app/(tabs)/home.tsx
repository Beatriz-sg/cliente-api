import Header from "../../components/home/Header";
import Categories from "../../components/home/Categories";
import OffersCarousel from "../../components/home/OffersCarousel";
import AllStores from "../../components/home/AllStores";
import BottomTabs from "../../components/home/BottomTabs";
import { categories } from "../../data/categories";
import TopRatedStores from "../../components/home/TopRatedStores";
import NearbyStores from "../../components/home/NearbyStores";
import { produtos } from "../../data/produtos";
import { stores } from "../../data/stores";

import { View, TextInput, ScrollView } from "react-native";

import { useState, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";

import { MaterialIcons } from "@expo/vector-icons";

import { useCart } from "../../context/CartContext";

export default function HomeScreen() {
  const { itens, addItem } = useCart() as any;

  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [cidadeEntrega, setCidadeEntrega] = useState("");

  const scrollRef = useRef(null);

  // FILTER OFFERS

  const filteredOffers = produtos.filter((produto) => {
    const loja = stores.find((s) => s.id === produto.lojaId);

    const textoBusca = busca.toLowerCase();

    const matchBusca =
      produto.nome.toLowerCase().includes(textoBusca) ||
      produto.categoria.toLowerCase().includes(textoBusca) ||
      loja?.name.toLowerCase().includes(textoBusca);

    const matchCategoria =
      categoriaSelecionada === "Todos" ||
      produto.categoria === categoriaSelecionada;

    return matchBusca && matchCategoria;
  });

  // ADD CART

  function adicionarCarrinho(produto: any) {
    addItem(produto);
  }

  return (
    <LinearGradient
      colors={["#fff7fc", "#f7ecff"]}
      style={{
        flex: 1,
      }}
    >
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 140,
        }}
      >
        {/* HEADER */}

        <Header setCidadeEntrega={setCidadeEntrega} />

        {/* SEARCH */}

        <View
          style={{
            marginTop: 18,

            paddingHorizontal: 18,
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",

              borderRadius: 18,

              flexDirection: "row",

              alignItems: "center",

              paddingHorizontal: 16,

              height: 54,

              shadowColor: "#000",

              shadowOpacity: 0.04,

              shadowRadius: 6,

              elevation: 2,
            }}
          >
            <MaterialIcons name="search" size={22} color="#999" />

            <TextInput
              value={busca}
              onChangeText={setBusca}
              placeholder="Buscar doces, bolos..."
              placeholderTextColor="#999"
              style={{
                flex: 1,

                marginLeft: 10,

                fontSize: 15,

                color: "#333",
              }}
            />
          </View>
        </View>

        {/* TOP RATED */}

        <TopRatedStores />

        {/* CATEGORIES */}

        <Categories
          categorias={categories}
          categoriaSelecionada={categoriaSelecionada}
          setCategoriaSelecionada={setCategoriaSelecionada}
        />

        {/* OFFERS */}

        <OffersCarousel
          produtosFiltrados={filteredOffers}
          adicionarCarrinho={adicionarCarrinho}
        />

        {/* NEARBY STORES */}

        <NearbyStores
          categoriaSelecionada={categoriaSelecionada}
          busca={busca}
          cidadeEntrega={cidadeEntrega}
        />

        {/* ALL STORES */}

        <AllStores categoriaSelecionada={categoriaSelecionada} busca={busca} />
      </ScrollView>

      {/* BOTTOM TABS */}

      <BottomTabs itens={itens} activeTab="home" />
    </LinearGradient>
  );
}
