# Backend — Perfil do Cliente (Docelivery)

## CAUSAS DOS PROBLEMAS IDENTIFICADOS

### P1 — Login aceitava outros tipos de usuário
**Causa:** O endpoint `/auth/login` é genérico (aceita qualquer usuário).
O frontend não validava o `role`/`tipoUsuario` retornado.
**Correção frontend:** `authService.login()` agora lê `role`/`tipoUsuario`/`tipo` da resposta
e lança erro se não for `CLIENTE`.

### P2 — CPF e dataNascimento não apareciam
**Causa mais comum:** O DTO retornado por `GET /api/cliente/perfil` não inclui os campos
`cpf` e `dataNascimento` mesmo eles existindo na entidade.
**Verificar no backend:**
- A entidade `Usuario`/`Cliente` tem os campos com as anotações `@Column` corretas?
- O `ClienteDTO` mapeia esses campos?
- O `ClienteService.getPerfil()` copia esses campos da entidade para o DTO?

### P3 — Erro no upload de foto
**Causa:** endpoint `POST /api/cliente/foto` pode não existir ou a pasta de upload
não ter permissão de escrita. O `Content-Type` do FormData não deve ser definido
manualmente no React Native — o fetch define o boundary automaticamente.

---

## CHECKLIST BACKEND (verificar cada item)

### SecurityConfig
```java
// Liberar endpoints do perfil para usuários autenticados:
.requestMatchers("/api/cliente/perfil").authenticated()
.requestMatchers("/api/cliente/foto").authenticated()
// NÃO colocar esses endpoints como .permitAll()
```

### Entidade Usuario/Cliente
```java
@Column(name = "cpf")
private String cpf;  // ← deve existir

@Column(name = "data_nascimento")
private LocalDate dataNascimento;  // ← deve existir

@Column(name = "apelido")
private String apelido;

@Column(name = "telefone")
private String telefone;

@Column(name = "foto_perfil")
private String fotoPerfil;

@Column(name = "preferencias", columnDefinition = "NVARCHAR(MAX)")
private String preferencias; // JSON string: '["Bolos","Cupcakes"]'

@Column(name = "restricoes", columnDefinition = "NVARCHAR(MAX)")
private String restricoes;

// Endereço
@Column(name = "cep") private String cep;
@Column(name = "logradouro") private String logradouro;
@Column(name = "numero") private String numero;
@Column(name = "complemento") private String complemento;
@Column(name = "bairro") private String bairro;
@Column(name = "cidade") private String cidade;
@Column(name = "estado") private String estado;
```

### ClienteDTO (CRÍTICO para P2)
```java
public class ClienteDTO {
    private Long id;
    private String nome;
    private String apelido;
    private String cpf;           // ← OBRIGATÓRIO — P2
    private String dataNascimento; // formato YYYY-MM-DD — P2
    private String email;
    private String telefone;
    private String cep;
    private String logradouro;
    private String numero;
    private String complemento;
    private String bairro;
    private String cidade;
    private String estado;
    private String fotoPerfil;
    private List<String> preferencias;
    private List<String> restricoes;
}
```

### ClienteService — mapeamento Entity → DTO (CRÍTICO para P2)
```java
public ClienteDTO getPerfil(Long clienteId) {
    Usuario usuario = usuarioRepository.findById(clienteId)
        .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

    ClienteDTO dto = new ClienteDTO();
    dto.setId(usuario.getId());
    dto.setNome(usuario.getNome());
    dto.setApelido(usuario.getApelido());
    dto.setCpf(usuario.getCpf());           // ← P2: não esquecer!
    dto.setEmail(usuario.getEmail());
    dto.setTelefone(usuario.getTelefone());

    // Data: converter LocalDate → String YYYY-MM-DD
    if (usuario.getDataNascimento() != null) {
        dto.setDataNascimento(usuario.getDataNascimento().toString()); // P2
    }

    dto.setCep(usuario.getCep());
    dto.setLogradouro(usuario.getLogradouro());
    dto.setNumero(usuario.getNumero());
    dto.setComplemento(usuario.getComplemento());
    dto.setBairro(usuario.getBairro());
    dto.setCidade(usuario.getCidade());
    dto.setEstado(usuario.getEstado());
    dto.setFotoPerfil(usuario.getFotoPerfil());

    // Deserializar JSON string → List<String>
    dto.setPreferencias(parseJson(usuario.getPreferencias()));
    dto.setRestricoes(parseJson(usuario.getRestricoes()));

    return dto;
}

private List<String> parseJson(String json) {
    if (json == null || json.isBlank()) return Collections.emptyList();
    try {
        return objectMapper.readValue(json, new TypeReference<List<String>>() {});
    } catch (Exception e) {
        return Collections.emptyList();
    }
}
```

---

## ENDPOINTS

### GET /api/cliente/perfil
Retorna perfil do cliente autenticado pelo JWT.

```java
@GetMapping("/cliente/perfil")
public ResponseEntity<ClienteDTO> getPerfil(@AuthenticationPrincipal UserDetails userDetails) {
    Long clienteId = ((UsuarioDetails) userDetails).getId();
    return ResponseEntity.ok(clienteService.getPerfil(clienteId));
}
```

**Response 200:**
```json
{
  "id": 1,
  "nome": "Maria Silva",
  "apelido": "Mari",
  "cpf": "123.456.789-00",
  "dataNascimento": "1995-04-10",
  "email": "maria@email.com",
  "telefone": "11999999999",
  "cep": "01310100",
  "logradouro": "Avenida Paulista",
  "numero": "1000",
  "complemento": "Apto 42",
  "bairro": "Bela Vista",
  "cidade": "São Paulo",
  "estado": "SP",
  "fotoPerfil": "https://servidor/fotos/perfil_1.jpg",
  "preferencias": ["Bolos", "Cupcakes"],
  "restricoes": ["Sem Glúten"]
}
```

---

### PUT /api/cliente/perfil
Atualiza perfil. **CPF não deve ser alterado — ignorar campo se enviado.**

```java
@PutMapping("/cliente/perfil")
public ResponseEntity<ClienteDTO> atualizarPerfil(
    @AuthenticationPrincipal UserDetails userDetails,
    @RequestBody AtualizarPerfilRequest req
) {
    Long clienteId = ((UsuarioDetails) userDetails).getId();
    return ResponseEntity.ok(clienteService.atualizar(clienteId, req));
}
```

No service, ao salvar `preferencias` e `restricoes`:
```java
if (req.getPreferencias() != null) {
    usuario.setPreferencias(objectMapper.writeValueAsString(req.getPreferencias()));
}
if (req.getRestricoes() != null) {
    usuario.setRestricoes(objectMapper.writeValueAsString(req.getRestricoes()));
}
if (req.getDataNascimento() != null) {
    usuario.setDataNascimento(LocalDate.parse(req.getDataNascimento())); // YYYY-MM-DD
}
// NUNCA atualizar CPF aqui:
// usuario.setCpf(...) — NÃO FAZER
```

---

### POST /api/cliente/foto (P3)

```java
@PostMapping("/cliente/foto")
public ResponseEntity<?> uploadFoto(
    @RequestParam("foto") MultipartFile foto,
    @AuthenticationPrincipal UserDetails userDetails
) throws IOException {
    Long clienteId = ((UsuarioDetails) userDetails).getId();

    // Salvar arquivo
    String uploadDir = "uploads/fotos/";
    String filename = "perfil_" + clienteId + "_" + System.currentTimeMillis() + ".jpg";
    Path path = Paths.get(uploadDir + filename);
    Files.createDirectories(path.getParent());
    foto.transferTo(path);

    // URL pública (configurar baseUrl no application.properties)
    String fotoUrl = baseUrl + "/fotos/" + filename;

    // Atualizar banco
    Usuario usuario = usuarioRepository.findById(clienteId).orElseThrow();
    usuario.setFotoPerfil(fotoUrl);
    usuarioRepository.save(usuario);

    return ResponseEntity.ok(Map.of("fotoUrl", fotoUrl));
}
```

**application.properties:**
```properties
app.base-url=http://10.0.2.2:8080
spring.web.resources.static-locations=file:uploads/
```

**Para servir os arquivos de foto estaticamente no Spring Boot:**
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/fotos/**")
                .addResourceLocations("file:uploads/fotos/");
    }
}
```

---

## VALIDAÇÃO DE ROLE NO LOGIN

O endpoint `/auth/login` deve retornar o campo `role` ou `tipoUsuario` na resposta:

```json
{
  "token": "eyJ...",
  "user": {
    "id": 1,
    "nome": "Maria",
    "email": "maria@email.com",
    "role": "ROLE_CLIENTE",
    "tipoUsuario": "CLIENTE"
  }
}
```

O frontend agora rejeita automaticamente qualquer role que não contenha "CLIENTE".

---

## MAPEAMENTO DE CAMPOS

| Frontend JSON      | Banco SQL Server     | Java (entidade)   |
|--------------------|----------------------|-------------------|
| `nome`             | `nome`               | `nome`            |
| `apelido`          | `apelido`            | `apelido`         |
| `cpf`              | `cpf`                | `cpf` (readonly)  |
| `dataNascimento`   | `data_nascimento`    | `dataNascimento`  |
| `email`            | `email`              | `email`           |
| `telefone`         | `telefone`           | `telefone`        |
| `cep`              | `cep`                | `cep`             |
| `logradouro`       | `logradouro`         | `logradouro`      |
| `numero`           | `numero`             | `numero`          |
| `complemento`      | `complemento`        | `complemento`     |
| `bairro`           | `bairro`             | `bairro`          |
| `cidade`           | `cidade`             | `cidade`          |
| `estado`           | `estado`             | `estado`          |
| `fotoPerfil`       | `foto_perfil`        | `fotoPerfil`      |
| `preferencias`     | `preferencias`       | `preferencias`    |
| `restricoes`       | `restricoes`         | `restricoes`      |
