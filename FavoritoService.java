package com.app.confeitaria.docelivery.service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoritoService {

    private static final String TIPO_LOJA = "LOJA";
    private final FavoritoRepository favoritoRepository;

    @Transactional
    public void favoritarLoja(Usuario usuario, Long lojaId) {
        if (!favoritoRepository.existsByUsuarioIdAndTipoAndReferenciaId(usuario.getId(), TIPO_LOJA, lojaId)) {
            Favorito favorito = new Favorito();
            favorito.setUsuario(usuario);
            favorito.setTipo(TIPO_LOJA);
            favorito.setReferenciaId(lojaId);
            favoritoRepository.save(favorito);
        }
    }

    @Transactional
    public void desfavoritarLoja(Usuario usuario, Long lojaId) {
        favoritoRepository.deleteByUsuarioIdAndTipoAndReferenciaId(usuario.getId(), TIPO_LOJA, lojaId);
    }

    @Transactional(readOnly = true)
    public List<Long> listarLojasFavoritas(Usuario usuario) {
        return favoritoRepository.findReferenciasIdsByUsuarioAndTipo(usuario, TIPO_LOJA);
    }
}