import { useState } from 'react';
import api from '@/services/api';

interface FavoritoButtonProps {
  relatorioId: string;
  isFavorito?: boolean;
  onToggle?: (isFavorito: boolean) => void;
}

export function FavoritoButton({ relatorioId, isFavorito: initialFavorito = false, onToggle }: FavoritoButtonProps) {
  const [isFavorito, setIsFavorito] = useState(initialFavorito);
  const [loading, setLoading] = useState(false);

  async function toggleFavorito() {
    setLoading(true);
    try {
      if (isFavorito) {
        await api.delete(`/favoritos/${relatorioId}/`);
        setIsFavorito(false);
        onToggle?.(false);
      } else {
        await api.post('/favoritos/', { relatorio_id: relatorioId });
        setIsFavorito(true);
        onToggle?.(true);
      }
    } catch (error) {
      console.error('Erro ao alternar favorito:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggleFavorito}
      disabled={loading}
      className="text-2xl hover:scale-110 transition-transform disabled:opacity-50"
      title={isFavorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      {isFavorito ? '⭐' : '☆'}
    </button>
  );
}
