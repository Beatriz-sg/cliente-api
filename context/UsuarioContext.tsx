import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getToken } from "../services/authService";
import { apiUrl } from "../constants/api";

interface UsuarioContexto {
  id: number | null;
  nome: string;
  email: string;
  fotoPerfil: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  cep: string | null;
  estado: string | null;
  recarregar: () => Promise<void>;
}

const UsuarioContext = createContext<UsuarioContexto>({
  id: null, nome: "", email: "", fotoPerfil: null,
  logradouro: null, numero: null, complemento: null,
  bairro: null, cidade: null, cep: null, estado: null,
  recarregar: async () => {},
});

export function UsuarioProvider({ children }: { children: React.ReactNode }) {
  const [id, setId] = useState<number | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [logradouro,  setLogradouro]  = useState<string | null>(null);
  const [numero,      setNumero]      = useState<string | null>(null);
  const [complemento, setComplemento] = useState<string | null>(null);
  const [bairro,      setBairro]      = useState<string | null>(null);
  const [cidade,      setCidade]      = useState<string | null>(null);
  const [cep,         setCep]         = useState<string | null>(null);
  const [estado,      setEstado]      = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    try {
      const token = await getToken();
      if (token) {
        // Tenta buscar do backend primeiro
        const res = await fetch(apiUrl("/cliente/perfil"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          aplicar(data);
          await AsyncStorage.setItem("user", JSON.stringify(data));
          return;
        }
      }
    } catch { /* fallback para cache */ }

    // Fallback: cache local
    try {
      const raw = await AsyncStorage.getItem("user");
      if (raw) aplicar(JSON.parse(raw));
    } catch { /* sem dados */ }
  }, []);

  function aplicar(u: any) {
    setId(u.id ?? null);
    setNome(u.nome ?? "");
    setEmail(u.email ?? "");
    setFotoPerfil(u.fotoPerfil ?? u.foto ?? u.foto_perfil ?? null);
    setLogradouro(u.logradouro ?? u.endereco ?? null);
    setNumero(u.numero ?? null);
    setComplemento(u.complemento ?? null);
    setBairro(u.bairro ?? null);
    setCidade(u.cidade ?? null);
    setCep(u.cep ?? null);
    setEstado(u.estado ?? u.uf ?? null);
  }

  useEffect(() => { recarregar(); }, [recarregar]);

  return (
    <UsuarioContext.Provider value={{
      id, nome, email, fotoPerfil,
      logradouro, numero, complemento, bairro, cidade, cep, estado, recarregar,
    }}>
      {children}
    </UsuarioContext.Provider>
  );
}

export function useUsuario() {
  return useContext(UsuarioContext);
}
