export type DeclarationType = 'AREA_EXTERNA' | 'AREA_INTERNA' | 'PERSONALIZADA';

export interface DeclarationData {
  id: string;
  createdAt: string;
  updatedAt: string;
  
  // Tipo
  tipo_vinculacao: DeclarationType;

  // Cabeçalho institucional
  prefeitura: string;
  estado: string;
  secretaria: string;
  endereco_secretaria: string;
  contato_secretaria: string;

  // Identificação do Documento
  numero_declaracao: string;
  ano_declaracao: string;

  // Base Legal
  norma_consema: string;
  lei_complementar: string;

  // Imóvel Objeto da Supressão
  area_supressao: string; // m²
  estagio_supressao?: string; // ex: 'médio' ou 'inicial'
  inscricao_imovel: string;
  situacao_apm_app: string;
  logradouro: string;
  quadra: string;
  lote: string;
  bairro_condominio: string;
  cidade_imovel: string;
  uf_imovel: string;

  // Requerente / Proprietário
  nome_proprietario: string;
  cpf_proprietario: string;

  // Processo Administrativo
  termo_compensacao: string; // ex: N°166/2025
  tipo_processo_1doc?: string; // ex: 'Protocolo 1DOC' ou 'Licenciamento Ambiental 1DOC'
  protocolo_1doc: string;    // ex: 7.019/2024 ou 9.257/2025

  // Cartório de Registro de Imóveis para Averbação
  matricula_averbacao: string;
  cri_averbacao: string;

  // Campos específicos: ÁREA EXTERNA
  area_vinculada_externa?: string;        // ex: 674,10 m²
  matricula_origem_externa?: string;      // ex: 84.694
  cri_origem_externa?: string;            // ex: Mogi das Cruzes
  descricao_imovel_origem?: string;       // ex: Um terreno constituído pelas Glebas “A”...
  proprietario_compensacao?: string;      // ex: RICARDO CASEMIRO TOBERA
  area_total_gleba?: string;              // ex: 108,389ha.
  localizacao_zona_origem?: string;       // ex: zona rural do município de Mogi das Cruzes
  estagio_regeneracao?: string;           // ex: médio
  matricula_imovel_autorizado?: string;   // ex: 7.346
  cri_imovel_autorizado?: string;         // ex: Santa Isabel
  proprietario_autorizado?: string;       // ex: Bruno Welligton Basaglia
  area_total_lote_autorizado?: string;    // ex: 321,00m²
  endereco_lote_autorizado?: string;      // ex: Rua Alameda das Quaresmeiras, Lote 27, Quadra 28 - Arujá – SP
  coordenadas_poligono_externo?: string;  // ex: E383722,316 e N7405296,530...

  // Campos específicos: ÁREA INTERNA
  area_verde_interna?: string;            // ex: 96,30m²
  matricula_interna?: string;             // ex: 7.346
  cri_interna?: string;                   // ex: Santa Isabel
  descricao_lote_interna?: string;        // ex: Lote de terreno sob Nº 27 da Quadra 28
  bairro_interna?: string;                // ex: Caputera
  municipio_interna?: string;             // ex: Arujá
  proprietario_objeto?: string;           // ex: BRUNO WELLINGTON BASAGLIA
  area_total_lote_interna?: string;       // ex: 321,00m²
  endereco_lote_interna?: string;         // ex: Alameda das Quaresmeiras, s/n
  memorial_descritivo_vertices?: string;  // texto das coordenadas dos vértices V05, V06...

  // Texto customizado para parágrafo de averbação (se personalizado)
  texto_averbacao_customizado?: string;

  // Signatário e Data
  cidade_emissao: string;
  data_emissao: string; // formato texto livre ou gerado automático
  nome_secretario: string;
  cargo_secretario: string;

  // Metadados de controle interno
  observacoes_internas?: string;
  status?: 'RASCUNHO' | 'CONFERIDO' | 'EMITIDO';
}

export interface ValidationIssue {
  field: keyof DeclarationData;
  label: string;
  message: string;
  severity: 'error' | 'warning';
}
