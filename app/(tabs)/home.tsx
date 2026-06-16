import Header from "../../components/home/Header";
import Categories from "../../components/home/Categories";
import OffersCarousel from "../../components/home/OffersCarousel";
import AllStores from "../../components/home/AllStores";
import BottomTabs from "../../components/home/BottomTabs";
import { getOffers } from "../../services/offerService";
import { Offer } from "../../types/Offer";
import { categories } from "../../data/categories";
import TopRatedStores from "../../components/home/TopRatedStores";
import NearbyStores from "../../components/home/NearbyStores";

import { View, TextInput, ScrollView } from "react-native";

import { useState, useRef, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";

import { MaterialIcons } from "@expo/vector-icons";

import { useCart } from "../../context/CartContext";

export default function HomeScreen() {
  const { itens, addItem } = useCart();

  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todos");

  const [busca, setBusca] = useState("");

  const scrollRef = useRef(null);
  const [offers, setOffers] = useState<any[]>([]);

  useEffect(() => {
    async function loadOffers() {
      const data = await getOffers();
      setOffers(data);
    }
    loadOffers();
  }, []);
  // FILTER OFFERS

  const filteredOffers = offers.filter((offer: Offer) => {
    const buscaLower = busca.toLowerCase();

    const matchBusca =
      offer.name.toLowerCase().includes(buscaLower) ||
      offer.category.toLowerCase().includes(buscaLower);

    const matchCategoria =
      categoriaSelecionada === "Todos" ||
      offer.category === categoriaSelecionada;

    return matchBusca && matchCategoria;
  });

  // ADD CART

  function adicionarCarrinho(offer: Offer) {
    addItem(offer);
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

        <Header />

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

        <NearbyStores />

        {/* ALL STORES */}

        <AllStores />
      </ScrollView>

      {/* BOTTOM TABS */}

      <BottomTabs itens={itens} activeTab="home" />
    </LinearGradient>
  );
}
