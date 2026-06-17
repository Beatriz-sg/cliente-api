# ✅ GUIA DE TESTES - MÓDULO DE FAVORITOS

## 📋 ARQUIVOS MODIFICADOS

### 1. **TopRatedStores.tsx**
✅ **Alterações**:
- Adicionado estado `favoritos` (Set<number>)
- Adicionado carregamento de favoritos ao montar componente
- Adicionado UI do coração (favorite-border / favorite)
- Adicionado toggle de favoritos com chamadas à API
- Adicionado ícone visual no componente

### 2. **OffersCarousel.tsx**
✅ **Alterações**:
- Alterado estado de `array` para `Set<number>`
- Adicionada autenticação (getToken)
- Adicionado carregamento de favoritos (getProdutosFavoritos)
- Conectado ao favoritosService (adicionarProdutoFavorito, removerProdutoFavorito)
- Removida lógica de estado local sem persistência

### 3. **produto.tsx**
✅ **Alterações**:
- Refatorado para receber ID via rota (useLocalSearchParams)
- Adicionado carregamento de dados do produto
- Adicionado estado de favoritos conectado à API
- Adicionado botão voltar funcional (router.back)
- Adicionado quantidade com incremento/decremento
- Adicionado botão "Adicionar ao Carrinho" funcional
- Adicionado loading state

---

## 🧪 PLANO DE TESTES

### TESTE 1: Favoritar Loja (Seção "Lojas Mais Bem Avaliadas")
**Passos**:
1. Abrir app e fazer login
2. Ir para tela HOME
3. Rolar para "⭐ Lojas Mais Bem Avaliadas"
4. Clicar no coração ❤️ de uma loja
5. Verificar:
   - [ ] Ícone muda para filled (vermelho)
   - [ ] Nenhum erro em console
   - [ ] Não recarrega a tela

**Validação**: Ir para tela FAVORITOS > aba LOJAS
   - [ ] Loja aparece listada
   - [ ] Foto carrega corretamente

---

### TESTE 2: Desfavoritar Loja (Seção "Lojas Mais Bem Avaliadas")
**Passos**:
1. Na tela HOME, na seção "Lojas Mais Bem Avaliadas"
2. Clicar no coração ❤️ (preenchido) da loja favoritada
3. Verificar:
   - [ ] Ícone volta para outline (branco)
   - [ ] Sem erros em console

**Validação**: Ir para tela FAVORITOS > aba LOJAS
   - [ ] Loja desaparece da lista

---

### TESTE 3: Favoritar Loja (Seção "Confeitarias Próximas")
**Passos**:
1. Na tela HOME, na seção "📍 Confeitarias Próximas"
2. Clicar no coração ❤️ de uma loja
3. Verificar:
   - [ ] Ícone muda para filled (vermelho)
   - [ ] Sem erros em console

**Validação**: Ir para tela FAVORITOS > aba LOJAS
   - [ ] Loja aparece na lista

---

### TESTE 4: Favoritar Loja (Seção "Todas as Lojas")
**Passos**:
1. Na tela HOME, rolar para "Todas as Lojas"
2. Clicar no coração ❤️ de uma loja
3. Verificar:
   - [ ] Ícone muda para filled (vermelho)

**Validação**: Ir para tela FAVORITOS > aba LOJAS
   - [ ] Loja aparece

---

### TESTE 5: Favoritar Produto (Seção "Ofertas Doces")
**Passos**:
1. Na tela HOME, na seção "Ofertas Doces"
2. Clicar no coração ♡ de um produto
3. Verificar:
   - [ ] Ícone muda para ♥ (vermelho)
   - [ ] Sem erros em console

**Validação**: Ir para tela FAVORITOS > aba PRODUTOS
   - [ ] Produto aparece listado
   - [ ] Preço exibe corretamente

---

### TESTE 6: Desfavoritar Produto (Seção "Ofertas Doces")
**Passos**:
1. Na tela HOME, clicar no coração ♥ (preenchido) de um produto
2. Verificar:
   - [ ] Ícone volta para ♡ (outline)

**Validação**: Ir para tela FAVORITOS > aba PRODUTOS
   - [ ] Produto desaparece da lista

---

### TESTE 7: Remover Favorito da Tela Favoritos (Loja)
**Passos**:
1. Ir para tela FAVORITOS > aba LOJAS
2. Clicar no coração ❤️ ao lado de uma loja
3. Verificar:
   - [ ] Alert de confirmação aparece
   - [ ] Clicar "Remover"
   - [ ] Loja desaparece da lista

**Validação**: Voltar para HOME
   - [ ] Coração da loja em "Lojas Mais Bem Avaliadas" está outline

---

### TESTE 8: Remover Favorito da Tela Favoritos (Produto)
**Passos**:
1. Ir para tela FAVORITOS > aba PRODUTOS
2. Clicar no coração ❤️ ao lado de um produto
3. Verificar:
   - [ ] Alert de confirmação aparece
   - [ ] Clicar "Remover"
   - [ ] Produto desaparece da lista

---

### TESTE 9: Favoritos Persistem após Reload
**Passos**:
1. Favoritar uma loja e um produto
2. Ir para tela FAVORITOS e verificar que aparecem
3. Fechar app completamente
4. Reabrir app
5. Ir para tela FAVORITOS
6. Verificar:
   - [ ] Loja ainda aparece
   - [ ] Produto ainda aparece
   - [ ] Contador está correto

---

### TESTE 10: Nenhuma Duplicata de Lojas
**Passos**:
1. Na tela HOME, favoritar a mesma loja em múltiplas seções:
   - "Lojas Mais Bem Avaliadas"
   - "Confeitarias Próximas"
   - "Todas as Lojas"
2. Ir para FAVORITOS > LOJAS
3. Verificar:
   - [ ] Loja aparece apenas UMA VEZ
   - [ ] Sem duplicação

---

### TESTE 11: Produto Detalhe com Favorito
**Passos**:
1. Na tela HOME, clicar em um produto (se houver navegação)
2. Verificar:
   - [ ] Página carrega dados do produto
   - [ ] Coração funciona (toggle favorito)
   - [ ] Quantidade funciona (incrementar/decrementar)
   - [ ] Botão "Adicionar ao Carrinho" funciona

---

### TESTE 12: Sem Login - Favoritos Desabilitados
**Passos**:
1. Fazer logout
2. Na tela HOME, tentar clicar em favorito
3. Verificar:
   - [ ] Nenhum efeito ou mensagem de "faça login"
   - [ ] Sem erros em console

---

## 🎯 CHECKLIST FINAL

- [ ] Teste 1: Favoritar loja (Top Rated)
- [ ] Teste 2: Desfavoritar loja (Top Rated)
- [ ] Teste 3: Favoritar loja (Nearby)
- [ ] Teste 4: Favoritar loja (All Stores)
- [ ] Teste 5: Favoritar produto
- [ ] Teste 6: Desfavoritar produto
- [ ] Teste 7: Remover favorito (Loja)
- [ ] Teste 8: Remover favorito (Produto)
- [ ] Teste 9: Persistência após reload
- [ ] Teste 10: Sem duplicatas
- [ ] Teste 11: Detalhe produto
- [ ] Teste 12: Sem login

**✅ Quando todos os testes passarem, o módulo de favoritos está 100% funcional!**
