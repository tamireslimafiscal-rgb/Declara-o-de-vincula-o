import { DeclarationData, DeclarationType } from '../types/declaration';

export const INSTITUTIONAL_DEFAULT = {
  prefeitura: 'PREFEITURA DE ARUJÁ',
  estado: 'ESTADO DE SÃO PAULO',
  secretaria: 'SECRETARIA MUNICIPAL DE MEIO AMBIENTE E BEM-ESTAR ANIMAL',
  endereco_secretaria: 'Rua Fenacita, nº 500, Jardim Fazenda Rincão – CEP 07428-205',
  contato_secretaria: 'Telefone: (11) 4653-1845 – E-mail: meioambiente.diretoria@aruja.sp.gov.br',
  norma_consema: 'CONSEMA nº 01/2024',
  lei_complementar: 'Lei Complementar Municipal nº 053/2022',
  situacao_apm_app: 'fora de APM e APP',
  cidade_imovel: 'Arujá',
  uf_imovel: 'SP',
  cidade_emissao: 'Arujá',
  nome_secretario: 'JUVENAL FERNANDO PENTEADO',
  cargo_secretario: 'Secretário de Meio Ambiente e Bem-Estar Animal de Arujá',
};

// Modelo 1: 001/2026 - Compensação Ambiental Externa (conforme PDF enviado)
export const SAMPLE_MODELO_EXTERNO: DeclarationData = {
  id: 'decl-001-2026',
  createdAt: '2026-01-14T10:00:00Z',
  updatedAt: '2026-01-14T10:00:00Z',
  tipo_vinculacao: 'AREA_EXTERNA',
  ...INSTITUTIONAL_DEFAULT,
  numero_declaracao: '001',
  ano_declaracao: '2026',

  area_supressao: '224,70',
  inscricao_imovel: 'SE12010801.000',
  logradouro: 'Alameda das Quaresmeiras',
  quadra: '28',
  lote: '27',
  bairro_condominio: 'Arujá Country Club - Arujá – SP',

  nome_proprietario: 'BRUNO WELLINGTON BASAGLIA',
  cpf_proprietario: '358.065.568-08',

  termo_compensacao: 'N°166/2025',
  protocolo_1doc: '7.019/2024',

  matricula_averbacao: '84.694',
  cri_averbacao: 'Mogi das Cruzes',

  // Detalhes da compensação externa
  area_vinculada_externa: '674,10 m²',
  matricula_origem_externa: '84.694',
  cri_origem_externa: 'Mogi das Cruzes',
  descricao_imovel_origem: 'Um terreno constituído pelas Glebas “A”, “B” e “C”, , situado na Estrada do Paiva, no bairro do Itapeti, perímetro rural deste município e comarca',
  proprietario_compensacao: 'RICARDO CASEMIRO TOBERA',
  area_total_gleba: '108,389ha.',
  localizacao_zona_origem: 'zona rural do município de Mogi das Cruzes',
  estagio_regeneracao: 'médio',
  matricula_imovel_autorizado: '7.346',
  cri_imovel_autorizado: 'Santa Isabel',
  proprietario_autorizado: 'Bruno Welligton Basaglia',
  area_total_lote_autorizado: '321,00m²',
  endereco_lote_autorizado: 'Rua Alameda das Quaresmeiras, Lote 27, Quadra 28 - Arujá – SP',
  coordenadas_poligono_externo: 'E383722,316 e N7405296,530; E383741,297 e N7405278,731; E383699,940 e N7405275,631; E383699,968 e N7405279,310; E383694,170; N7405295,939.',

  data_emissao: '14 de janeiro de 2026',
  observacoes_internas: 'Compensação externa em Mogi das Cruzes',
  status: 'EMITIDO'
};

// Modelo 2: 002/2026 - Área Verde Interna / Obrigatória no Lote (conforme PDF enviado)
export const SAMPLE_MODELO_INTERNO: DeclarationData = {
  id: 'decl-002-2026',
  createdAt: '2026-01-14T11:00:00Z',
  updatedAt: '2026-01-14T11:00:00Z',
  tipo_vinculacao: 'AREA_INTERNA',
  ...INSTITUTIONAL_DEFAULT,
  numero_declaracao: '002',
  ano_declaracao: '2026',

  area_supressao: '224,70',
  inscricao_imovel: 'SE12010801.000',
  logradouro: 'Alameda das Quaresmeiras',
  quadra: '28',
  lote: '27',
  bairro_condominio: 'Arujá Country Club - Arujá – SP',

  nome_proprietario: 'BRUNO WELLINGTON BASAGLIA',
  cpf_proprietario: '358.065.568-08',

  termo_compensacao: 'N°166/2025',
  protocolo_1doc: '7.019/2024',

  matricula_averbacao: '7.346',
  cri_averbacao: 'Santa Isabel',

  // Detalhes da área interna
  area_verde_interna: '96,30m²',
  matricula_interna: '7.346',
  cri_interna: 'Santa Isabel',
  descricao_lote_interna: 'Lote de terreno sob Nº 27 da Quadra 28',
  bairro_interna: 'Caputera',
  municipio_interna: 'Arujá',
  area_total_lote_interna: '321,00m²',
  endereco_lote_interna: 'Alameda das Quaresmeiras, s/n',
  memorial_descritivo_vertices: `Inicia-se no ponto “V05”, definido pelas coordenadas E(X) 365.052,625 e N(Y) 7.409.373,001, que está distante 8,05m do ponto “V01”. Do ponto “V05” segue, em sentido horário, confrontando com o Lote 27 da Quadra 28, com azimute de 353°21'25" e distância de 1,51m até o ponto V06 definido pelas coordenadas E(X) 365.052,451 e N(Y) 7.409.374,497, deste ponto segue com azimute de 83°21'25" e distância de 9,35m até o ponto V07 definido pelas coordenadas E(X) 365.061,739 e N(Y) 7.409.375,579, deste ponto segue com azimute de 353°21'25" e distância de 7,99m até o ponto V08 definido pelas coordenadas E(X) 365.060,814 e N(Y) 7.409.383,519, deste ponto segue com azimute de 263°21'27" e distância de 2,25m até o ponto V09 definido pelas coordenadas E(X) 365.058,583 e N(Y) 7.409.383,259, deste ponto segue com azimute de 353°05'40" e distância de 0,85m até o ponto V10 definido pelas coordenadas E(X) 365.058,481 e N(Y) 7.409.384,103, deste ponto segue com azimute de 263°21'25" e distância de 1,65m até o ponto V11 definido pelas coordenadas E(X) 365.056,842 e N(Y) 7.409.383,912, deste ponto segue com azimute de 353°21'25" e distância de 0,45m até o ponto V12 definido pelas coordenadas E(X) 365.056,790 e N(Y) 7.409.384,359, deste ponto segue com azimute de 263°21'25" e distância de 1,75m até o ponto V13 definido pelas coordenadas E(X) 365.055,052 e N(Y) 7.409.384,157, deste ponto segue com azimute de 353°21'25" e distância de 2,09m até o ponto V14 definido pelas coordenadas E(X) 365.054,809 e N(Y) 7.409.386,237, deste ponto deflete a direita e segue agora confrontando com o Lote 26 da Quadra 28, com azimute de 99°14'19" e distância de 12,88m até o ponto V03 definido pelas coordenadas E(X) 365.067,524 e N(Y) 7.409.384,169, deste ponto deflete a direita e segue agora confrontando com a Área Verde, com um desenvolvimento em curva de 9,44m até o ponto V04 definido pelas coordenadas E(X) 365.069,462 e N(Y) 7.409.374,962, deste ponto deflete a direita e segue agora confrontando com o Lote 28 da Quadra 28, com azimute de 263°21'25" e distância de 16,95m até o ponto V05 início desta descrição.`,

  data_emissao: '14 de janeiro de 2026',
  observacoes_internas: 'Área verde no próprio lote (Santa Isabel)',
  status: 'EMITIDO'
};

export function getFormattedDatePtBr(date: Date = new Date()): string {
  const meses = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  const dia = date.getDate();
  const mes = meses[date.getMonth()];
  const ano = date.getFullYear();
  return `${dia} de ${mes} de ${ano}`;
}

export function createNewBlankDeclaration(type: DeclarationType = 'AREA_EXTERNA'): DeclarationData {
  const now = new Date();
  const currentYear = now.getFullYear().toString();
  return {
    id: 'decl-' + Date.now(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    tipo_vinculacao: type,
    ...INSTITUTIONAL_DEFAULT,
    numero_declaracao: '',
    ano_declaracao: currentYear,

    area_supressao: '',
    estagio_supressao: 'médio',
    inscricao_imovel: '',
    situacao_apm_app: 'fora de APM e APP',
    logradouro: '',
    quadra: '',
    lote: '',
    bairro_condominio: '',

    nome_proprietario: '',
    cpf_proprietario: '',

    termo_compensacao: '',
    tipo_processo_1doc: 'Protocolo 1DOC',
    protocolo_1doc: '',

    matricula_averbacao: '',
    cri_averbacao: '',

    // Externa
    area_vinculada_externa: '',
    matricula_origem_externa: '',
    cri_origem_externa: '',
    descricao_imovel_origem: '',
    proprietario_compensacao: '',
    area_total_gleba: '',
    localizacao_zona_origem: '',
    estagio_regeneracao: 'médio',
    matricula_imovel_autorizado: '',
    cri_imovel_autorizado: '',
    proprietario_autorizado: '',
    area_total_lote_autorizado: '',
    endereco_lote_autorizado: '',
    coordenadas_poligono_externo: '',

    // Interna
    area_verde_interna: '',
    matricula_interna: '',
    cri_interna: '',
    descricao_lote_interna: '',
    bairro_interna: '',
    municipio_interna: 'Arujá',
    area_total_lote_interna: '',
    endereco_lote_interna: '',
    memorial_descritivo_vertices: '',

    data_emissao: getFormattedDatePtBr(now),
    observacoes_internas: '',
    status: 'RASCUNHO'
  };
}
