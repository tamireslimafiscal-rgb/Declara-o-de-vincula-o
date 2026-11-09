import React, { useState, useRef } from 'react';
import { DeclarationData } from '../types/declaration';
import {
  downloadSampleExcelTemplate,
  parseExcelFile,
  exportDeclarationsToExcel,
} from '../utils/excelHandler';
import { generateDeclarationDocx, downloadBlob } from '../utils/docxGenerator';
import {
  FileSpreadsheet,
  Download,
  Upload,
  X,
  FileCheck,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface BatchExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  historyList: DeclarationData[];
  onLoadDeclaration: (decl: DeclarationData) => void;
  onImportBatch: (items: DeclarationData[]) => void;
}

export const BatchExcelModal: React.FC<BatchExcelModalProps> = ({
  isOpen,
  onClose,
  historyList,
  onLoadDeclaration,
  onImportBatch,
}) => {
  const [importedRows, setImportedRows] = useState<Partial<DeclarationData>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const rows = await parseExcelFile(file);
      if (rows.length === 0) {
        setErrorMsg('A planilha selecionada não possui linhas de dados válidas.');
      } else {
        setImportedRows(rows);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Não foi possível ler o arquivo Excel. Verifique o formato do arquivo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyRowToEditor = (row: Partial<DeclarationData>) => {
    // Mesclar com os dados institucionais padrão
    const fullDecl: DeclarationData = {
      id: row.id || 'decl-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tipo_vinculacao: row.tipo_vinculacao || 'AREA_EXTERNA',
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

      numero_declaracao: row.numero_declaracao || '',
      ano_declaracao: row.ano_declaracao || '2026',
      area_supressao: row.area_supressao || '',
      inscricao_imovel: row.inscricao_imovel || '',
      logradouro: row.logradouro || '',
      quadra: row.quadra || '',
      lote: row.lote || '',
      bairro_condominio: row.bairro_condominio || '',
      nome_proprietario: row.nome_proprietario || '',
      cpf_proprietario: row.cpf_proprietario || '',
      termo_compensacao: row.termo_compensacao || '',
      protocolo_1doc: row.protocolo_1doc || '',
      matricula_averbacao: row.matricula_averbacao || '',
      cri_averbacao: row.cri_averbacao || '',

      area_vinculada_externa: row.area_vinculada_externa || '',
      area_verde_interna: row.area_verde_interna || '',
      data_emissao: row.data_emissao || '',
      status: 'CONFERIDO',
    };

    onLoadDeclaration(fullDecl);
    onClose();
  };

  const handleImportAllToHistory = () => {
    const fullItems: DeclarationData[] = importedRows.map((row) => ({
      id: row.id || 'decl-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tipo_vinculacao: row.tipo_vinculacao || 'AREA_EXTERNA',
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

      numero_declaracao: row.numero_declaracao || '',
      ano_declaracao: row.ano_declaracao || '2026',
      area_supressao: row.area_supressao || '',
      inscricao_imovel: row.inscricao_imovel || '',
      logradouro: row.logradouro || '',
      quadra: row.quadra || '',
      lote: row.lote || '',
      bairro_condominio: row.bairro_condominio || '',
      nome_proprietario: row.nome_proprietario || '',
      cpf_proprietario: row.cpf_proprietario || '',
      termo_compensacao: row.termo_compensacao || '',
      protocolo_1doc: row.protocolo_1doc || '',
      matricula_averbacao: row.matricula_averbacao || '',
      cri_averbacao: row.cri_averbacao || '',
      area_vinculada_externa: row.area_vinculada_externa || '',
      area_verde_interna: row.area_verde_interna || '',
      data_emissao: row.data_emissao || '',
      status: 'CONFERIDO',
    }));

    onImportBatch(fullItems);
    setImportedRows([]);
    onClose();
  };

  const handleDownloadSingleDocxFromRow = async (row: Partial<DeclarationData>) => {
    const fullDecl: DeclarationData = {
      id: row.id || 'decl-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tipo_vinculacao: row.tipo_vinculacao || 'AREA_EXTERNA',
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

      numero_declaracao: row.numero_declaracao || '',
      ano_declaracao: row.ano_declaracao || '2026',
      area_supressao: row.area_supressao || '',
      inscricao_imovel: row.inscricao_imovel || '',
      logradouro: row.logradouro || '',
      quadra: row.quadra || '',
      lote: row.lote || '',
      bairro_condominio: row.bairro_condominio || '',
      nome_proprietario: row.nome_proprietario || '',
      cpf_proprietario: row.cpf_proprietario || '',
      termo_compensacao: row.termo_compensacao || '',
      protocolo_1doc: row.protocolo_1doc || '',
      matricula_averbacao: row.matricula_averbacao || '',
      cri_averbacao: row.cri_averbacao || '',
      data_emissao: row.data_emissao || '',
      status: 'CONFERIDO',
    };

    const blob = await generateDeclarationDocx(fullDecl);
    downloadBlob(blob, `Declaracao_${row.numero_declaracao || '000'}_${row.ano_declaracao || '2026'}.docx`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Integração & Controle com Excel (.xlsx)
              </h2>
              <p className="text-xs text-slate-500">
                Preencha múltiplos processos no Excel ou exporte o histórico para relatórios
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Seção de Download e Upload de Planilha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bloco 1: Modelo do Excel */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 font-semibold text-sm text-slate-800">
                  <Download size={16} className="text-blue-600" />
                  1. Baixar Modelo Excel Pré-formatado
                </div>
                <p className="text-xs text-slate-600 mb-4">
                  Baixe a planilha oficial com todas as colunas já preparadas (Proprietário, CPF,
                  Protocolo 1DOC, TCA, Inscrição, Matrícula). Basta preencher suas linhas no Excel!
                </p>
              </div>
              <button
                type="button"
                onClick={downloadSampleExcelTemplate}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Download size={14} />
                Baixar Modelo_Importacao_Declaracoes.xlsx
              </button>
            </div>

            {/* Bloco 2: Importar Arquivo Excel */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 font-semibold text-sm text-slate-800">
                  <Upload size={16} className="text-emerald-600" />
                  2. Importar Planilha do Excel
                </div>
                <p className="text-xs text-slate-600 mb-4">
                  Envie sua planilha preenchida (.xlsx). O sistema lerá cada linha e permitirá preencher
                  o formulário ou gerar os documentos Word correspondentes.
                </p>
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 rounded-lg hover:bg-emerald-200 transition-colors disabled:opacity-50"
                >
                  <Upload size={14} />
                  {isLoading ? 'Lendo arquivo...' : 'Selecionar Arquivo .xlsx do Computador'}
                </button>
              </div>
            </div>
          </div>

          {/* Erro se houver */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-800">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tabela de Linhas Importadas */}
          {importedRows.length > 0 && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  {importedRows.length} Declaração(ões) encontrada(s) na planilha
                </span>
                <button
                  type="button"
                  onClick={handleImportAllToHistory}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors"
                >
                  <FileCheck size={14} />
                  Adicionar todas ao Histórico
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Nº / Ano</th>
                      <th className="p-2.5">Tipo</th>
                      <th className="p-2.5">Proprietário</th>
                      <th className="p-2.5">CPF</th>
                      <th className="p-2.5">Protocolo 1DOC</th>
                      <th className="p-2.5">TCA</th>
                      <th className="p-2.5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {importedRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-2.5 font-bold font-mono">
                          {row.numero_declaracao || '___'}/{row.ano_declaracao || '2026'}
                        </td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              row.tipo_vinculacao === 'AREA_EXTERNA'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {row.tipo_vinculacao === 'AREA_EXTERNA' ? 'Externa' : 'Interna'}
                          </span>
                        </td>
                        <td className="p-2.5 font-medium">{row.nome_proprietario || '—'}</td>
                        <td className="p-2.5 font-mono text-slate-500">{row.cpf_proprietario || '—'}</td>
                        <td className="p-2.5">{row.protocolo_1doc || '—'}</td>
                        <td className="p-2.5">{row.termo_compensacao || '—'}</td>
                        <td className="p-2.5 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleApplyRowToEditor(row)}
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            Abrir no Editor
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadSingleDocxFromRow(row)}
                            className="text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
                            title="Baixar Word desta linha diretamente"
                          >
                            <FileText size={12} />
                            Word
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bloco 3: Exportar Histórico Atual */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Exportar Histórico Completo ({historyList.length} registros salvos)
              </h4>
              <p className="text-[11px] text-slate-500">
                Gera uma planilha Excel com todas as declarações criadas neste app.
              </p>
            </div>
            <button
              type="button"
              onClick={() => exportDeclarationsToExcel(historyList)}
              disabled={historyList.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-40"
            >
              <FileSpreadsheet size={15} />
              Exportar Histórico para Excel (.xlsx)
            </button>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
