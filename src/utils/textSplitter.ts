export interface SplitResult {
  part1: string;
  part2: string;
  isMultiPage: boolean;
}

/**
 * Analisa o memorial descritivo e coordenadas geográficas para paginação oficial A4.
 *
 * Regras cruciais:
 * 1. Preenchimento COMPLETO da Folha 1: a primeira página nunca deve ficar pela metade!
 *    Textos de memorial descritivo com até ~1.200 caracteres (como o do Processo 046/2026)
 *    cabem perfeitamente na Folha 1 junto com o cabeçalho, os 2 parágrafos e a assinatura.
 * 2. Quando o memorial for realmente extenso (> 1.200 caracteres ou com dezenas de vértices),
 *    a Folha 1 é preenchida até o limite útil próximo ao rodapé (~1.000 a 1.250 caracteres),
 *    e apenas o excedente é continuado na Folha 2.
 */
export function splitMemorialDescritivo(text: string | undefined, forceTwoPages: boolean = false): SplitResult {
  if (!text || text.trim().length === 0) {
    return {
      part1: '',
      part2: '',
      isMultiPage: false,
    };
  }

  const clean = text.trim();

  // Se não foi forçado e o texto cabe completamente na primeira folha (até ~1.200 caracteres)
  if (!forceTwoPages && clean.length <= 1250) {
    return {
      part1: clean,
      part2: '',
      isMultiPage: false,
    };
  }

  // Se o texto é longo OU se o usuário escolheu forçar 2 páginas:
  // Queremos preencher a Página 1 ao MÁXIMO antes de quebrar!
  // Ponto alvo ideal na Página 1: entre 900 e 1.300 caracteres, ou 60% se for forçado.
  const targetSplitIndex = forceTwoPages && clean.length < 1400
    ? Math.floor(clean.length * 0.65)
    : Math.min(1200, Math.floor(clean.length * 0.7));

  // Palavras-chave técnicas para quebra limpa de azimute/coordenadas
  const breakKeywords = [
    'deste ponto segue',
    'deste deflete à direita',
    'deste deflete a direita',
    'deste deflete',
    'deste ponto',
    ';',
    ', até o ponto',
    '. '
  ];

  for (const kw of breakKeywords) {
    // Buscar próximo ao targetSplitIndex (janela de busca flexível)
    const idx = clean.indexOf(kw, Math.max(300, targetSplitIndex - 200));
    if (idx !== -1 && idx < targetSplitIndex + 250) {
      const splitAt = idx + kw.length;
      return {
        part1: clean.substring(0, splitAt).trim(),
        part2: clean.substring(splitAt).trim(),
        isMultiPage: true,
      };
    }
  }

  // Fallback: quebra no último espaço antes do limite da folha 1
  const spaceIdx = clean.lastIndexOf(' ', targetSplitIndex + 100);
  if (spaceIdx > 300) {
    return {
      part1: clean.substring(0, spaceIdx).trim(),
      part2: clean.substring(spaceIdx).trim(),
      isMultiPage: true,
    };
  }

  return {
    part1: clean,
    part2: '',
    isMultiPage: false,
  };
}
