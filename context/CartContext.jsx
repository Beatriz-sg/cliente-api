import React, {
  createContext,
  useContext,
  useState,
} from "react";

import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { stores } from "../data/stores";

const CartContext = createContext(null);

export function CartProvider({ children }) {

  const [itens, setItens] = useState([]);

  // ADICIONAR ITEM

  async function addItem(produto) {

    const cidadeEntrega =
  await AsyncStorage.getItem("cidadeEntrega");

const loja = stores.find(
  (s) => s.id === produto.lojaId
);

console.log("Cidade Cliente:", cidadeEntrega);
console.log("Cidade Loja:", loja?.cidade);

if (
  cidadeEntrega &&
  loja?.cidade &&
  loja.cidade.toLowerCase() !==
    cidadeEntrega.toLowerCase()
) {

  Alert.alert(
    "Entrega indisponível",
    `Esta loja não atende sua região. Entregas apenas para ${loja.cidade}.`
  );

  return;
}

  // VERIFICA SE JÁ EXISTE ITEM DE OUTRA LOJA

  if (itens.length > 0) {

    const lojaCarrinho = itens[0].lojaId;

 if (produto.lojaId !== lojaCarrinho) {

  Alert.alert(
    "Trocar loja",
    "Seu carrinho possui produtos de outra loja. Deseja limpar o carrinho e adicionar este produto?",
    [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Trocar Loja",
        onPress: () => {

          setItens([
            {
              ...produto,
              quantidade: 1,
            },
          ]);

        },
      },
    ]
  );

  return;
}
  }

  const itemExiste = itens.find(
    (item) => item.id === produto.id
  );

  // SE ITEM JÁ EXISTE

  if (itemExiste) {

    const novosItens = itens.map((item) => {

      if (item.id === produto.id) {

        return {
          ...item,
          quantidade: item.quantidade + 1,
        };
      }

      return item;
    });

    setItens(novosItens);

    return;
  }

  // NOVO ITEM

  setItens([
    ...itens,
    {
      ...produto,
      quantidade: 1,
    },
  ]);
}

  // REMOVER ITEM

  function removerItem(id) {

    const novosItens = itens.filter(
      (item) => item.id !== id
    );

    setItens(novosItens);
  }

  // AUMENTAR QUANTIDADE

  function aumentarQuantidade(id) {

    const novosItens = itens.map((item) => {

      if (item.id === id) {

        return {
          ...item,
          quantidade: item.quantidade + 1,
        };
      }

      return item;
    });

    setItens(novosItens);
  }

  // DIMINUIR QUANTIDADE

  function diminuirQuantidade(id) {

  const itemExiste = itens.find(
    (item) => item.id === id
  );

  if (
    itemExiste &&
    itemExiste.quantidade === 1
  ) {

    removerItem(id);

    return;
  }

  const novosItens = itens.map((item) => {

    if (item.id === id) {

      return {
        ...item,
        quantidade: item.quantidade - 1,
      };
    }

    return item;
  });

  setItens(novosItens);
}

  // LIMPAR CARRINHO

  function limparCarrinho() {

    setItens([]);
  }

  // SUBTOTAL

  const subtotal = itens.reduce((total, item) => {

    return total + item.preco * item.quantidade;

  }, 0);

  return (

    <CartContext.Provider
      value={{
        itens,

        addItem,

        removerItem,

        aumentarQuantidade,

        diminuirQuantidade,

        limparCarrinho,

        subtotal,
      }}
    >

      {children}

    </CartContext.Provider>
  );
}

// HOOK

export function useCart() {

  return useContext(CartContext);
}