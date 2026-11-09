import * as XLSX from 'xlsx';
import { DeclarationData, DeclarationType } from '../types/declaration';

// Mapeamento amigável de colunas do Excel
export interface ExcelDeclarationRow {
  'Nº Declaração': string;
  'Ano': string;
  'Tipo de Vinculação': string;
  'Proprietário': string;
  'CPF': string;
  'Protocolo 1DOC': string;
  'Termo TCA': string;
  'Inscrição Imóvel': string;
  'Logradouro': string;
  'Quadra': string;
  'Lote': string;
  'Bairro': string;
  'Área Supressão (m²)': string;
  'Matrícula Averbação': string;
  'CRI Averbação': string;
  'situado (Endereço Supressão)': string;
  'situado á (Endereço Compensação)': string;
  'Área Vinculada / Verde (m²)': string;
  'Detalhes Compensação': string;
  'Data Emissão': string;
  'Secretário': string;
  'Status': string;
}

export function declarationToExcelRow(item: DeclarationData): ExcelDeclarationRow {
  const isExterna = item.tipo_vinculacao === 'AREA_EXTERNA';
  const tipoLabel = isExterna ? 'Área Externa' : item.tipo_vinculacao === 'AREA_INTERNA' ? 'Área Interna' : 'Personalizada';
  const areaCompensada = isExterna ? (item.area_vinculada_externa || '') : (item.area_verde_interna || '');
  const detalhes = isExterna
    ? `Prop: ${item.proprietario_compensacao || ''} | Matr: ${item.matricula_origem_externa || ''} (${item.cri_origem_externa || ''})`
    : `Lote: ${item.descricao_lote_interna || ''} (${item.bairro_interna || ''})`;

  return {
    'Nº Declaração': item.numero_declaracao || '',
    'Ano': item.ano_declaracao || '',
    'Tipo de Vinculação': tipoLabel,
    'Proprietário': item.nome_proprietario || '',
    'CPF': item.cpf_proprietario || '',
    'Protocolo 1DOC': item.protocolo_1doc || '',
    'Termo TCA': item.termo_compensacao || '',
    'Inscrição Imóvel': item.inscricao_imovel || '',
    'Logradouro': item.logradouro || '',
    'Quadra': item.quadra || '',
    'Lote': item.lote || '',
    'Bairro': item.bairro_condominio || '',
    'Área Supressão (m²)': item.area_supressao || '',
    'Matrícula Averbação': item.matricula_averbacao || '',
    'CRI Averbação': item.cri_averbacao || '',
    'situado (Endereço Supressão)': item.endereco_lote_autorizado || '',
    'situado á (Endereço Compensação)': item.localizacao_zona_origem || item.endereco_lote_interna || '',
    'Área Vinculada / Verde (m²)': areaCompensada,
    'Detalhes Compensação': detalhes,
    'Data Emissão': item.data_emissao || '',
    'Secretário': item.nome_secretario || '',
    'Status': item.status || 'EMITIDO',
  };
}

export function exportDeclarationsToExcel(items: DeclarationData[], fileName: string = 'Controle_Declaracoes_Ambientais.xlsx') {
  const rows = items.map(declarationToExcelRow);
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Auto-ajustar larguras de colunas
  const colWidths = [
    { wch: 14 }, // Nº Declaração
    { wch: 8 },  // Ano
    { wch: 16 }, // Tipo
    { wch: 32 }, // Proprietário
    { wch: 18 }, // CPF
    { wch: 16 }, // Protocolo
    { wch: 16 }, // Termo TCA
    { wch: 18 }, // Inscrição
    { wch: 28 }, // Logradouro
    { wch: 8 },  // Quadra
    { wch: 8 },  // Lote
    { wch: 22 }, // Bairro
    { wch: 18 }, // Supressão
    { wch: 18 }, // Matrícula
    { wch: 18 }, // CRI
    { wch: 20 }, // Área Vinculada
    { wch: 36 }, // Detalhes
    { wch: 20 }, // Data
    { wch: 26 }, // Secretário
    { wch: 12 }, // Status
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Declarações');

  XLSX.writeFile(workbook, fileName);
}

export function downloadSampleExcelTemplate() {
  const sampleData: ExcelDeclarationRow[] = [
    {
      'Nº Declaração': '001',
      'Ano': '2026',
      'Tipo de Vinculação': 'Área Externa',
      'Proprietário': 'BRUNO WELLINGTON BASAGLIA',
      'CPF': '358.065.568-08',
      'Protocolo 1DOC': '7.019/2024',
      'Termo TCA': 'N°166/2025',
      'Inscrição Imóvel': 'SE12010801.000',
      'Logradouro': 'Alameda das Quaresmeiras',
      'Quadra': '28',
      'Lote': '27',
      'Bairro': 'Arujá Country Club - Arujá – SP',
      'Área Supressão (m²)': '224,70',
      'Matrícula Averbação': '84.694',
      'CRI Averbação': 'Mogi das Cruzes',
      'situado (Endereço Supressão)': 'Rua Alameda das Quaresmeiras, Lote 27, Quadra 28 - Arujá – SP',
      'situado á (Endereço Compensação)': 'zona rural do município de Mogi das Cruzes',
      'Área Vinculada / Verde (m²)': '674,10 m²',
      'Detalhes Compensação': 'Glebas A, B e C, Estrada do Paiva, Itapeti',
      'Data Emissão': '14 de janeiro de 2026',
      'Secretário': 'JUVENAL FERNANDO PENTEADO',
      'Status': 'EMITIDO',
    },
    {
      'Nº Declaração': '002',
      'Ano': '2026',
      'Tipo de Vinculação': 'Área Interna',
      'Proprietário': 'BRUNO WELLINGTON BASAGLIA',
      'CPF': '358.065.568-08',
      'Protocolo 1DOC': '7.019/2024',
      'Termo TCA': 'N°166/2025',
      'Inscrição Imóvel': 'SE12010801.000',
      'Logradouro': 'Alameda das Quaresmeiras',
      'Quadra': '28',
      'Lote': '27',
      'Bairro': 'Arujá Country Club - Arujá – SP',
      'Área Supressão (m²)': '224,70',
      'Matrícula Averbação': '7.346',
      'CRI Averbação': 'Santa Isabel',
      'situado (Endereço Supressão)': 'Alameda das Quaresmeiras, s/n',
      'situado á (Endereço Compensação)': '',
      'Área Vinculada / Verde (m²)': '96,30m²',
      'Detalhes Compensação': 'Área verde no próprio lote (Caputera)',
      'Data Emissão': '14 de janeiro de 2026',
      'Secretário': 'JUVENAL FERNANDO PENTEADO',
      'Status': 'EMITIDO',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Modelo Importação');
  XLSX.writeFile(wb, 'Modelo_Importacao_Declaracoes.xlsx');
}

export async function parseExcelFile(file: File): Promise<Partial<DeclarationData>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet);

        const parsedDeclarations: Partial<DeclarationData>[] = json.map((row) => {
          const tipoRaw = String(row['Tipo de Vinculação'] || row['Tipo'] || '').toLowerCase();
          const tipo: DeclarationType = tipoRaw.includes('intern')
            ? 'AREA_INTERNA'
            : tipoRaw.includes('personal')
            ? 'PERSONALIZADA'
            : 'AREA_EXTERNA';

          return {
            id: 'decl-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            numero_declaracao: String(row['Nº Declaração'] || row['Numero'] || row['Nº'] || ''),
            ano_declaracao: String(row['Ano'] || new Date().getFullYear()),
            tipo_vinculacao: tipo,
            nome_proprietario: String(row['Proprietário'] || row['Nome'] || ''),
            cpf_proprietario: String(row['CPF'] || ''),
            protocolo_1doc: String(row['Protocolo 1DOC'] || row['Protocolo'] || ''),
            termo_compensacao: String(row['Termo TCA'] || row['TCA'] || ''),
            inscricao_imovel: String(row['Inscrição Imóvel'] || row['Inscrição'] || ''),
            logradouro: String(row['Logradouro'] || row['Endereço'] || ''),
            quadra: String(row['Quadra'] || ''),
            lote: String(row['Lote'] || ''),
            bairro_condominio: String(row['Bairro'] || ''),
            area_supressao: String(row['Área Supressão (m²)'] || row['Área Supressão'] || ''),
            estagio_supressao: String(row['Estágio Supressão'] || 'médio'),
            situacao_apm_app: String(row['Situação APM/APP'] || 'fora de APM e APP'),
            tipo_processo_1doc: String(row['Tipo Processo'] || 'Protocolo 1DOC'),
            matricula_averbacao: String(row['Matrícula Averbação'] || row['Matrícula'] || ''),
            cri_averbacao: String(row['CRI Averbação'] || row['CRI'] || ''),
            endereco_lote_autorizado: String(row['situado (Endereço Supressão)'] || row['situado'] || ''),
            localizacao_zona_origem: String(row['situado á (Endereço Compensação)'] || row['situado á'] || ''),
            endereco_lote_interna: String(row['situado à (Endereço Área Verde)'] || row['situado à'] || row['situado (Endereço Supressão)'] || ''),
            area_vinculada_externa: tipo === 'AREA_EXTERNA' ? String(row['Área Vinculada / Verde (m²)'] || '') : undefined,
            area_verde_interna: tipo === 'AREA_INTERNA' ? String(row['Área Vinculada / Verde (m²)'] || '') : undefined,
            data_emissao: String(row['Data Emissão'] || ''),
            status: 'CONFERIDO',
          };
        });

        resolve(parsedDeclarations);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
