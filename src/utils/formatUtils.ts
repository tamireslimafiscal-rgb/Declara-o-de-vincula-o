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
 * Monta o endereço da supressão (Item 2 do formulário).
 * Se o usuário digitou o endereço completo no campo único, usa-o.
 * Caso contrário, monta a partir de rua, quadra, lote e bairro.
 * Remove sufixos como ", Arujá – SP" para evitar duplicação no texto oficial.
 */
export function formatEnderecoSupressao(data: {
  endereco_completo_supressao?: string;
  logradouro?: string;
  quadra?: string;
  lote?: string;
  bairro_condominio?: string;
}, fallback: string = '____'): string {
  if (data.endereco_completo_supressao && data.endereco_completo_supressao.trim() !== '') {
    let clean = data.endereco_completo_supressao.trim();
    clean = clean.replace(/,?\s*Aruj[áa]\s*[–-]\s*SP$/i, '').trim();
    return clean || fallback;
  }

  const parts: string[] = [];
  if (data.logradouro && data.logradouro.trim()) parts.push(data.logradouro.trim());
  if (data.quadra && data.quadra.trim()) parts.push(`Quadra ${data.quadra.trim()}`);
  if (data.lote && data.lote.trim()) parts.push(`Lote ${data.lote.trim()}`);
  if (data.bairro_condominio && data.bairro_condominio.trim()) parts.push(data.bairro_condominio.trim());

  let joined = parts.join(', ');
  joined = joined.replace(/,?\s*Aruj[áa]\s*[–-]\s*SP$/i, '').trim();
  return joined || fallback;
}

/**
 * Formata o número do TCA sem duplicar o prefixo Nº
 */
export function formatTermoTCA(tca?: string, fallback: string = '____'): string {
  if (!tca || tca.trim() === '' || tca.includes('___')) return fallback;
  const clean = tca.trim().replace(/^N[º°o]?\s*/i, '').trim();
  return clean ? `Nº ${clean}` : fallback;
}

export const getAutoEnderecoImovel = formatEnderecoSupressao;

function sanitizeFilenamePart(value: string): string {
  return value
    .replace(/[\/\\]+/g, '-')
    .replace(/[:*?"<>|]+/g, '')
    .replace(/_+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Gera o nome do arquivo Word (.docx) ou PDF (.pdf) no padrão oficial:
 * número da declaração_ano da declaração_Declaração de vinculação_Número do processo_nome do proprietário da área_se é área interna ou externa
 */
export function buildDeclarationFileName(
  data: {
    numero_declaracao?: string;
    ano_declaracao?: string;
    protocolo_1doc?: string;
    nome_proprietario?: string;
    proprietario_objeto?: string;
    proprietario_compensacao?: string;
    tipo_vinculacao?: string;
  },
  extension: 'pdf' | 'docx'
): string {
  const rawNum = sanitizeFilenamePart(data.numero_declaracao || '');
  const num = rawNum ? rawNum.padStart(3, '0') : '000';
  const ano = sanitizeFilenamePart(data.ano_declaracao || '') || new Date().getFullYear().toString();
  const titulo = 'Declaração de vinculação';
  const processo = sanitizeFilenamePart(data.protocolo_1doc || '') || 'Sem processo';
  const isExterna = data.tipo_vinculacao === 'AREA_EXTERNA';
  const rawOwner =
    data.nome_proprietario ||
    (isExterna ? data.proprietario_compensacao : data.proprietario_objeto) ||
    'Proprietário';
  const proprietario = sanitizeFilenamePart(rawOwner) || 'Proprietário';
  const tipoArea =
    data.tipo_vinculacao === 'AREA_EXTERNA'
      ? 'Área Externa'
      : data.tipo_vinculacao === 'AREA_INTERNA'
      ? 'Área Interna'
      : 'Personalizada';

  return `${num}_${ano}_${titulo}_${processo}_${proprietario}_${tipoArea}.${extension}`;
}
