import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type OrigemEndereco = "gps" | "perfil" | null;

export interface LocalizacaoEntrega {
  address: string | null;       // endereço formatado exibível
  cidadeEntrega: string;        // cidade usada para filtrar lojas (gravada em AsyncStorage)
  origemEndereco: OrigemEndereco;
  loading: boolean;
}

/** Mesma lógica do Header.tsx: GPS → reverseGeocode → perfil como fallback. */
export function useLocalizacaoEntrega(): LocalizacaoEntrega {
  const [address,        setAddress]        = useState<string | null>(null);
  const [cidadeEntrega,  setCidadeEntrega]  = useState("");
  const [origemEndereco, setOrigemEndereco] = useState<OrigemEndereco>(null);
  const [loading,        setLoading]        = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);

      (async () => {
        const raw  = await AsyncStorage.getItem("user");
        const user = raw ? JSON.parse(raw) : null;
        const cidadePerfil: string = user?.cidade ?? "";

        function buildAddressFromUser(u: any): string | null {
          if (!u) return null;
          const parts = [u.logradouro, u.bairro, u.cidade].filter(Boolean);
          return parts.length > 0 ? parts.join(", ") : null;
        }

        function applyPerfil() {
          if (!active) return;
          AsyncStorage.setItem("cidadeEntrega", cidadePerfil);
          setCidadeEntrega(cidadePerfil);
          setAddress(buildAddressFromUser(user));
          setOrigemEndereco(buildAddressFromUser(user) ? "perfil" : null);
        }

        try {
          const { status } = await Location.requestForegroundPermissionsAsync();

          if (status === "granted") {
            const position = await Location.getCurrentPositionAsync({});
            const [result]  = await Location.reverseGeocodeAsync(position.coords);

            if (!active) return;

            if (result) {
              const cidade = result.city || result.subregion || result.district || "";
              if (cidade) {
                await AsyncStorage.setItem("cidadeEntrega", cidade);
                setCidadeEntrega(cidade);
                const parts = [result.street, result.streetNumber, cidade].filter(Boolean);
                setAddress(parts.join(", "));
                setOrigemEndereco("gps");
              } else {
                applyPerfil();
              }
            } else {
              applyPerfil();
            }
          } else {
            applyPerfil();
          }
        } catch {
          applyPerfil();
        }

        if (active) setLoading(false);
      })();

      return () => { active = false; };
    }, []),
  );

  return { address, cidadeEntrega, origemEndereco, loading };
}
