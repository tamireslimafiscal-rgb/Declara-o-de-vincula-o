/**
 * Funções utilitárias de formatação para documentos oficiais da Prefeitura de Arujá
 */

/**
 * Garante que qualquer valor numérico ou texto de área seja formatado automaticamente com m²,
 * sem que o usuário precise digitar "m²" manualmente e sem duplicar se o usuário já tiver digitado.
 * Preserva unidades em hectares (ha/hectares).
 */
export function formatAreaM2(val?: string | number, fallback: string = '____'): string {
  if (val === undefined || val === null) return fallback;
  const str = String(val).trim();
  if (!str || str === '___' || str === '____') return fallback;

  // Se já for especificado em hectares (ex: 108,389ha.), preserva
  if (/ha\.?$|hectare/i.test(str)) {
    return str;
  }

  // Remove m², m2, m^2, mts2, metros quadrados duplicados no final
  const clean = str
    .replace(/\s*(m²|m2|m\^2|mts\^2|mts2|metros\s*quadrados)\s*$/i, '')
    .trim();

  if (!clean) return fallback;
  return `${clean}m²`;
}

/**
 * Garante que o texto do memorial descritivo / coordenadas geográficas possua as aspas obrigatórias
 * de abertura e fechamento (“...”), sem duplicar se já existirem.
 */
export function formatMemorialWithQuotes(memorial?: string, fallback: string = '____'): string {
  if (!memorial || memorial.trim() === '') return fallback;
  let text = memorial.trim();

  // Remove aspas existentes nas bordas para padronizar com aspas tipográficas oficiais
  text = text.replace(/^["“'”]+/, '').replace(/["“'”]+$/, '').trim();

  return `“${text}”`;
}

/**
 * Monta o endereço padrão a partir dos dados do lote da supressão (Item 2 do formulário)
 * para ser utilizado automaticamente caso o campo específico "situado à" não tenha sido digitado.
 */
export function getAutoEnderecoImovel(data: {
  logradouro?: string;
  quadra?: string;
  lote?: string;
  bairro_condominio?: string;
  cidade_imovel?: string;
  uf_imovel?: string;
}): string {
  const parts: string[] = [];
  if (data.logradouro) parts.push(data.logradouro);
  if (data.quadra) parts.push(`Quadra ${data.quadra}`);
  if (data.lote) parts.push(`Lote ${data.lote}`);
  if (data.bairro_condominio) parts.push(data.bairro_condominio);

  return parts.join(', ');
}
