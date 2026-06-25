import { useState, useEffect } from "react";
import { Image, Text, TouchableOpacity, View, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalizacaoEntrega } from "../../hooks/useLocalizacaoEntrega";

export default function Header({ setCidadeEntrega: setCidadeExterna }: any) {
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const { address, cidadeEntrega, loading } = useLocalizacaoEntrega();

  // Carrega foto do perfil do cache local
  useEffect(() => {
    AsyncStorage.getItem("user").then((raw) => {
      if (raw) setProfilePhoto(JSON.parse(raw)?.fotoPerfil ?? null);
    });
  }, []);

  // Propaga cidade para o HomeScreen sempre que o hook resolver
  useEffect(() => {
    if (cidadeEntrega) setCidadeExterna(cidadeEntrega);
  }, [cidadeEntrega]);

  function handleSelectAddress() {
    Alert.alert(
      "Defina sua localização",
      "Ative o GPS ou atualize seu endereço no perfil.",
      [{ text: "OK" }],
    );
  }

  return (
    <View style={{ paddingTop: 55, paddingHorizontal: 18, backgroundColor: "#fff7fc" }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image
          source={
            profilePhoto
              ? { uri: profilePhoto }
              : require("../../assets/images/logo.png")
          }
          style={{ width: 42, height: 42, borderRadius: 999 }}
        />

        <TouchableOpacity
          onPress={!address ? handleSelectAddress : undefined}
          style={{ marginLeft: 10, flex: 1 }}
        >
          <Text style={{ fontSize: 11, color: "#999" }}>Entrega em</Text>
          {loading ? (
            <Text style={{ fontSize: 11, color: "#aaa" }}>Buscando localização...</Text>
          ) : (
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ fontSize: 12, fontWeight: "bold", color: "#333" }}
            >
              {address ?? "Defina sua localização"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
