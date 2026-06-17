package com.app.confeitaria.docelivery.controller;

import java.util.List;
import java.util.Map;

import com.app.confeitaria.docelivery.model.entity.Usuario;
import com.app.confeitaria.docelivery.service.FavoritoService;

@RestController
@RequestMapping("/api/favoritos")
@RequiredArgsConstructor
public class FavoritoController {

    private final FavoritoService favoritoService;

    @PostMapping("/lojas/{id}")
    public ResponseEntity<?> favoritarLoja(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        favoritoService.favoritarLoja(usuario, id);
        return ResponseEntity.ok(Map.of("message", "Loja favoritada"));
    }

    @DeleteMapping("/lojas/{id}")
    public ResponseEntity<?> desfavoritarLoja(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        favoritoService.desfavoritarLoja(usuario, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/lojas")
    public ResponseEntity<List<Long>> listarLojas(@AuthenticationPrincipal Usuario usuario) {
        List<Long> idsFavoritos = favoritoService.listarLojasFavoritas(usuario);
        return ResponseEntity.ok(idsFavoritos);
    }
}