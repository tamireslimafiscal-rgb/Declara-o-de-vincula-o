import React, { useState } from 'react';
import { DeclarationData } from '../types/declaration';
import { FileText, FileSpreadsheet, Printer, Copy, Check, Eye, EyeOff, FileDown, CheckCircle, Layers } from 'lucide-react';
import { generateDeclarationDocx, downloadBlob } from '../utils/docxGenerator';
import { exportDeclarationsToExcel } from '../utils/excelHandler';
import { exportElementToPdf } from '../utils/pdfGenerator';
import { splitMemorialDescritivo } from '../utils/textSplitter';
import { BRASAO_ARUJA_BASE64 } from '../assets/brasaoBase64';
import { formatAreaM2, formatMemorialWithQuotes, getAutoEnderecoImovel, formatEnderecoSupressao, formatTermoTCA, buildDeclarationFileName } from '../utils/formatUtils';

interface DocumentPreviewProps {
  data: DeclarationData;
  highlightVariables: boolean;
  onToggleHighlight: () => void;
  onFocusField?: (fieldName: keyof DeclarationData) => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  data,
  highlightVariables,
  onToggleHighlight,
  onFocusField,
}) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccessToast, setPdfSuccessToast] = useState(false);
  const [pageModeOverride, setPageModeOverride] = useState<'auto' | '1' | '2'>('auto');

  const isExterna = data.tipo_vinculacao === 'AREA_EXTERNA';
  const isInterna = data.tipo_vinculacao === 'AREA_INTERNA';

  // Analisar se o memorial descritivo exige divisão em 2 páginas
  const memorialText = data.memorial_descritivo_vertices || '';
  const isForcedTwo = pageModeOverride === '2';
  const memorialSplit = splitMemorialDescritivo(memorialText, isForcedTwo);

  // Determinar se o documento tem 2 páginas (apenas se forçado ou se o memorial ultrapassar ~1.250 caracteres)
  const isTwoPages =
    pageModeOverride === '2' ||
    (pageModeOverride === 'auto' && isInterna && memorialSplit.isMultiPage);

  const totalPages = isTwoPages ? 2 : 1;

  const renderVar = (
    text: string | undefined,
    fieldName: keyof DeclarationData,
    fallback: string = '____',
    extraClasses: string = ''
  ) => {
    const isMissing = !text || text.trim() === '' || text.includes('___');
    const content = text && text.trim() !== '' ? text : fallback;

    if (!highlightVariables) {
      return <span className={extraClasses}>{content}</span>;
    }

    return (
      <span
        onClick={() => onFocusField?.(fieldName)}
        title={`Clique para alterar no formulário: ${String(fieldName)}`}
        className={`inline-block px-1 py-0.2 rounded transition-all cursor-pointer ${
          isMissing
            ? 'bg-rose-100 text-rose-900 border border-rose-300 font-bold'
            : 'bg-amber-100 text-amber-950 border border-amber-300 hover:bg-amber-200'
        } ${extraClasses}`}
      >
        {content || (
          <span className="text-rose-600 font-normal italic text-[11px]">
            [preencher {String(fieldName).replace(/_/g, ' ')}]
          </span>
        )}
      </span>
    );
  };

  const getCleanFileName = (extension: 'pdf' | 'docx') => {
    return buildDeclarationFileName(data, extension);
  };

  const handleDownloadDocx = async () => {
    try {
      setIsGeneratingDocx(true);
      const blob = await generateDeclarationDocx(data);
      downloadBlob(blob, getCleanFileName('docx'));
    } catch (err) {
      console.error('Erro ao gerar Word:', err);
    } finally {
      setIsGeneratingDocx(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      await exportElementToPdf('printable-document', getCleanFileName('pdf'));
      setPdfSuccessToast(true);
      setTimeout(() => setPdfSuccessToast(false), 3000);
    } catch (err) {
      console.error('Erro ao gerar PDF pelo canvas:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleExportExcel = () => {
    const cleanNum = (data.numero_declaracao || '000').padStart(3, '0');
    const cleanYear = data.ano_declaracao || '2026';
    exportDeclarationsToExcel([data], `Declaracao_${cleanNum}_${cleanYear}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const sec = data.secretaria || 'SECRETARIA MUNICIPAL DE MEIO AMBIENTE E BEM-ESTAR ANIMAL';
    const areaSupFmt = formatAreaM2(data.area_supressao, '___m²');
    const estagioSup = data.estagio_supressao || 'médio';
    const matSupressao = data.matricula_imovel_supressao || (isInterna ? data.matricula_interna : data.matricula_imovel_autorizado) || '';
    const criSupressao = data.cri_imovel_supressao || 'Santa Isabel';
    const endSupressao = formatEnderecoSupressao(data);
    const nacionalidade = data.nacionalidade_proprietario || 'brasileira';
    const tcaFormatado = formatTermoTCA(data.termo_compensacao);
    const tipoProc = data.tipo_processo_1doc || 'Protocolo 1DOC Nº';

    const p1 = `A Secretaria Municipal de Meio Ambiente de Arujá, nas atribuições que lhe foram conferidas de acordo com a deliberação normativa ${data.norma_consema || 'CONSEMA nº 01/2024'} e com a ${data.lei_complementar || 'Lei Complementar Municipal nº 053/2022'}, declara que aprovou a supressão de ${areaSupFmt} de vegetação nativa em estágio ${estagioSup} de regeneração no imóvel registrado sob a matrícula nº ${matSupressao}, ${data.situacao_apm_app || 'fora de APM e APP'}, Registrado em Cartório do Registro de Imóveis de ${criSupressao}, localizado na ${endSupressao}, Arujá – SP, pertencente ao proprietário ${(data.nome_proprietario || '___').toUpperCase()}, CPF ${data.cpf_proprietario || '___'}, ${nacionalidade}, vinculado ao Termo de Compensação Ambiental ${tcaFormatado}, expedido no ${tipoProc} ${data.protocolo_1doc || '___'}. Declara-se, ainda, que, conforme solicitado, e após o envio e análise dos documentos apresentados, os quais foram aprovados por esta Secretaria no que se refere à solicitação de supressão de vegetação nativa e compensação ambiental correspondente, deve ser realizada a seguinte averbação à margem da matrícula nº ${data.matricula_averbacao || '___'} do CRI de ${data.cri_averbacao || '___'}. Tal averbação deverá ser apresentada a esta Secretaria para a emissão da autorização competente.`;

    const p2 = isExterna
      ? `“Fica vinculada uma área de ${formatAreaM2(data.area_vinculada_externa, '___m²')} do imóvel objeto da matrícula nº ${data.matricula_origem_externa || data.matricula_averbacao || '___'} do CRI de ${data.cri_origem_externa || data.cri_averbacao || '___'}, descrito como “${data.descricao_imovel_origem || '___'}”, de propriedade de ${(data.proprietario_compensacao || '___').toUpperCase()}, com área total de ${formatAreaM2(data.area_total_gleba, '___m²')}, situado á ${data.localizacao_zona_origem || '___'}, referente a compensação ambiental externa para atender à supressão de ${areaSupFmt} de vegetação nativa em estágio ${data.estagio_supressao || data.estagio_regeneracao || 'médio'} de regeneração, autorizada no imóvel objeto da matrícula ${data.matricula_imovel_autorizado || '___'} – CRI ${data.cri_imovel_autorizado || '___'}, de propriedade de ${data.proprietario_autorizado || data.nome_proprietario || '___'}, com área total de ${formatAreaM2(data.area_total_lote_autorizado, '___m²')}, situado ${data.endereco_lote_autorizado || getAutoEnderecoImovel(data) || '___'}, município de Arujá, afim de atender o Termo de Compensação Ambiental ${data.termo_compensacao || '___'}.\n\nÁrea de compensação ambiental matrícula ${data.matricula_origem_externa || data.matricula_averbacao || '___'} – Cartório de Registro de Imóveis de ${data.cri_origem_externa || data.cri_averbacao || '___'}, ${formatAreaM2(data.area_vinculada_externa, '___m²')}, coordenadas geográficas do polígono: ${formatMemorialWithQuotes(data.coordenadas_poligono_externo, '“___”')}”`
      : `“Fica vinculada uma área verde de ${formatAreaM2(data.area_verde_interna, '___m²')} do imóvel objeto da matrícula nº ${data.matricula_interna || data.matricula_averbacao || '___'} do CRI de ${data.cri_interna || data.cri_averbacao || '___'}, descrito como “${data.descricao_lote_interna || '___'}”, situado no bairro ${data.bairro_interna || '___'}, município de ${data.municipio_interna || 'Arujá'}, de propriedade de ${(data.proprietario_objeto || data.nome_proprietario || '___').toUpperCase()}, com área total de ${formatAreaM2(data.area_total_lote_interna, '___m²')}, situado à, ${data.endereco_lote_interna || getAutoEnderecoImovel(data) || '___'}, referente a obrigatoriedade de manter vegetação nativa em estágio ${data.estagio_regeneracao || data.estagio_supressao || 'médio'} de regeneração no lote para atender à supressão de ${areaSupFmt} de vegetação nativa, autorizada no mesmo imóvel, afim de atender o Termo de Compensação Ambiental ${data.termo_compensacao || '___'}.\n\nCoordenadas geográficas do polígono da Área Verde urbana obrigatória a ser mantida no lote: ${formatMemorialWithQuotes(data.memorial_descritivo_vertices, '“___”')}`;

    const full = `${data.prefeitura}\n${data.estado}\n${sec}\n\nDECLARAÇÃO PARA VINCULAÇÃO Nº ${data.numero_declaracao}/${data.ano_declaracao}\n\n${p1}\n\n${p2}\n\n${data.cidade_emissao}, ${data.data_emissao}.\n\n${data.nome_secretario}\n${data.cargo_secretario}`;

    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const secretariaTitulo =
    data.secretaria || 'SECRETARIA MUNICIPAL DE MEIO AMBIENTE E BEM-ESTAR ANIMAL';

  // Cabeçalho Oficial Idêntico para Todas as Páginas
  const renderHeader = () => (
    <div className="w-full">
      <div className="relative w-full flex items-center justify-center min-h-[110px] mb-0 border-0 outline-none">
        {/* Brasão ampliado posicionado no lado esquerdo com 100% de opacidade sem empurrar as letras centrais */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-start border-0 outline-none pointer-events-none">
          <img
            src={BRASAO_ARUJA_BASE64}
            alt="Brasão Oficial do Município de Arujá"
            className="w-28 sm:w-32 h-auto max-h-[114px] object-contain block border-0 outline-none opacity-100"
            crossOrigin="anonymous"
          />
        </div>

        {/* Textos institucionais 100% centralizados em relação à largura da folha */}
        <div className="w-full text-center border-0 outline-none px-4">
          <h1 className="text-[12pt] font-bold tracking-tight uppercase text-black leading-snug">
            {data.prefeitura || 'PREFEITURA DE ARUJÁ'}
          </h1>
          <h2 className="text-[10pt] font-medium uppercase text-black leading-snug mt-0.5">
            {data.estado || 'ESTADO DE SÃO PAULO'}
          </h2>
          <h3 className="text-[10pt] font-bold uppercase text-black leading-snug mt-0.5">
            {secretariaTitulo.toUpperCase()}
          </h3>
        </div>
      </div>

      {/* Linha horizontal preta sólida separadora colada no nome da secretaria (espaço mínimo) */}
      <hr className="w-full h-[1.5px] bg-black border-0 mt-0.5 mb-6 p-0" />
    </div>
  );

  // Rodapé Oficial Retangular Idêntico para Todas as Páginas com Paginação Dinâmica
  const renderFooter = (pageNumber: number) => {
    const endSec = data.endereco_secretaria || 'Rua Fenacita, nº 500, Jardim Fazenda Rincão – CEP 07428-205';
    const contSec = data.contato_secretaria || 'Telefone: (11) 4653-1845 – E-mail: meioambiente.diretoria@aruja.sp.gov.br';

    return (
      <div className="w-full border border-black p-2.5 mt-6 text-[8.5pt] text-black leading-tight">
        <div className="text-center font-bold">
          {endSec}
        </div>
        <div className="flex items-center justify-between mt-1 px-1 text-[8pt]">
          <div>
            {contSec}
          </div>
          <div className="font-bold whitespace-nowrap">
            Página {pageNumber} / {totalPages}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-200/70">
      {/* Toast de sucesso ao baixar PDF */}
      {pdfSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <CheckCircle size={16} />
          PDF gerado e baixado com sucesso!
        </div>
      )}

      {/* Barra de Ações Superior do Preview */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-white border-b border-slate-300 shadow-xs print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Modelo Oficial A4
          </span>

          {/* Indicador e seletor de páginas */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-md p-0.5 border border-slate-200 text-xs">
            <Layers size={13} className="text-slate-500 ml-1.5 mr-0.5" />
            <button
              type="button"
              onClick={() => setPageModeOverride('auto')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                pageModeOverride === 'auto'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Detectar automaticamente se o documento tem 1 ou 2 páginas"
            >
              Auto ({totalPages} {totalPages === 1 ? 'pág' : 'págs'})
            </button>
            <button
              type="button"
              onClick={() => setPageModeOverride('1')}
              className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-all ${
                pageModeOverride === '1'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Forçar 1 página"
            >
              1 Pág
            </button>
            <button
              type="button"
              onClick={() => setPageModeOverride('2')}
              className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-all ${
                pageModeOverride === '2'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Forçar 2 páginas com cabeçalho e rodapé em ambas"
            >
              2 Págs
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleHighlight}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              highlightVariables
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
            title="Destaque colorido nas variáveis para conferir antes de emitir"
          >
            {highlightVariables ? <Eye size={14} className="text-amber-700" /> : <EyeOff size={14} />}
            {highlightVariables ? 'Ocultar Destaque' : 'Destacar Variáveis'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyText}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 active:scale-95 transition-all"
            title="Copiar texto"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            {copied ? 'Copiado!' : 'Copiar'}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 active:scale-95 transition-all"
            title="Imprimir direto na impressora ou salvar pelo navegador"
          >
            <Printer size={14} />
            Imprimir
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-md hover:bg-emerald-100 active:scale-95 transition-all"
            title="Exportar dados para Excel (.xlsx)"
          >
            <FileSpreadsheet size={14} className="text-emerald-600" />
            Excel (.xlsx)
          </button>

          {/* Botão Baixar PDF */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-300 rounded-md hover:bg-rose-100 active:scale-95 transition-all shadow-xs disabled:opacity-50"
            title="Baixar arquivo em formato PDF com cabeçalho e rodapé em todas as páginas"
          >
            <FileDown size={14} className="text-rose-600" />
            {isGeneratingPdf ? 'Gerando PDF...' : `Baixar PDF (${totalPages} pág${totalPages > 1 ? 's' : ''})`}
          </button>

          {/* Botão Baixar Word */}
          <button
            type="button"
            onClick={handleDownloadDocx}
            disabled={isGeneratingDocx}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800 active:scale-95 transition-all shadow-xs disabled:opacity-50"
            title="Baixar documento editável no Microsoft Word (.docx) com cabeçalho e rodapé em todas as páginas"
          >
            <FileText size={14} />
            {isGeneratingDocx ? 'Gerando Word...' : 'Baixar Word (.docx)'}
          </button>
        </div>
      </div>

      {/* Visualização das Folhas A4 com proporções milimétricas oficiais */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 flex flex-col items-center gap-6">
        <div id="printable-document" className="w-full flex flex-col items-center gap-8">
          {/* ======================= PÁGINA 1 ======================= */}
          <div
            className="official-document-page w-full max-w-[210mm] min-h-[297mm] bg-white text-black shadow-xl border border-slate-300 px-10 py-8 sm:px-14 sm:py-10 flex flex-col justify-between print:shadow-none print:border-none print:m-0 print:p-6"
            style={{
              boxSizing: 'border-box',
              fontFamily: '"Times New Roman", "Tinos", "Liberation Serif", Times, serif',
              fontSize: '11pt',
            }}
          >
            {/* Bloco superior de conteúdo da Página 1 */}
            <div>
              {/* Cabeçalho Institucional Oficial */}
              {renderHeader()}

              {/* Título Oficial */}
              <div className="text-center mb-5">
                <h2 className="text-[11pt] font-bold tracking-wide text-black">
                  DECLARAÇÃO PARA VINCULAÇÃO Nº{' '}
                  {renderVar(data.numero_declaracao, 'numero_declaracao', '001')}/
                  {renderVar(data.ano_declaracao, 'ano_declaracao', '2026')}
                </h2>
              </div>

              {/* Primeiro Parágrafo com Espaçamento entre linhas de 1,5 e recuo de 1,5cm */}
              <div
                className="text-justify text-black mb-5 indent-[1.5cm]"
                style={{ lineHeight: '1.5' }}
              >
                A Secretaria Municipal de Meio Ambiente de Arujá, nas atribuições que lhe foram conferidas de
                acordo com a deliberação normativa{' '}
                {renderVar(data.norma_consema, 'norma_consema', 'CONSEMA nº 01/2024')} e com a{' '}
                {renderVar(data.lei_complementar, 'lei_complementar', 'Lei Complementar Municipal nº 053/2022')},
                declara que aprovou a supressão de{' '}
                <strong className="font-bold">
                  {renderVar(formatAreaM2(data.area_supressao, ''), 'area_supressao', '____m²')}
                </strong>{' '}
                de vegetação nativa em estágio{' '}
                {renderVar(data.estagio_supressao, 'estagio_supressao', 'médio')} de regeneração no imóvel registrado sob a matrícula nº{' '}
                <strong className="font-bold">
                  {renderVar(
                    data.matricula_imovel_supressao || (isInterna ? data.matricula_interna : data.matricula_imovel_autorizado),
                    'matricula_imovel_supressao',
                    ''
                  )}
                </strong>,{' '}
                {renderVar(data.situacao_apm_app, 'situacao_apm_app', 'fora de APM e APP')}, Registrado em Cartório do Registro de Imóveis de{' '}
                {renderVar(data.cri_imovel_supressao, 'cri_imovel_supressao', 'Santa Isabel')}, localizado na{' '}
                {renderVar(formatEnderecoSupressao(data), 'endereco_completo_supressao', 'Rua Exemplo, Lote 01, Quadra 02, Bairro Centro')}, Arujá – SP, pertencente ao proprietário{' '}
                <strong className="font-bold">
                  {renderVar(
                    data.nome_proprietario?.toUpperCase(),
                    'nome_proprietario',
                    '_____'
                  )}
                </strong>, CPF{' '}
                <strong className="font-bold">
                  {renderVar(data.cpf_proprietario, 'cpf_proprietario', '000.000.000-00')}
                </strong>,{' '}
                {renderVar(data.nacionalidade_proprietario, 'nacionalidade_proprietario', 'brasileira')}, vinculado ao{' '}
                <strong className="font-bold">
                  Termo de Compensação Ambiental {renderVar(formatTermoTCA(data.termo_compensacao), 'termo_compensacao', 'N°002/2026')}
                </strong>, expedido no{' '}
                <strong className="font-bold">
                  {renderVar(data.tipo_processo_1doc, 'tipo_processo_1doc', 'Protocolo 1DOC Nº')}{' '}
                  {renderVar(data.protocolo_1doc, 'protocolo_1doc', '_____')}
                </strong>. Declara-se, ainda, que, conforme solicitado, e após o envio e análise dos documentos apresentados, os
                quais foram aprovados por esta Secretaria no que se refere à solicitação de supressão de vegetação nativa e
                compensação ambiental correspondente, deve ser realizada a seguinte averbação à margem da{' '}
                <strong className="font-bold">
                  matrícula nº {renderVar(data.matricula_averbacao, 'matricula_averbacao', '_____')} do CRI de{' '}
                  {renderVar(data.cri_averbacao, 'cri_averbacao', 'Santa Isabel')}
                </strong>. Tal averbação deverá ser apresentada a esta Secretaria para a emissão da autorização competente.
              </div>

              {/* Segundo Parágrafo (Averbação) */}
              <div
                className="text-justify text-black mb-5 indent-[1.5cm]"
                style={{ lineHeight: '1.5' }}
              >
                {isExterna ? (
                  <>
                    “Fica vinculada uma área de{' '}
                    {renderVar(formatAreaM2(data.area_vinculada_externa, ''), 'area_vinculada_externa', '674,10m²')} do imóvel objeto da matrícula
                    nº{' '}
                    {renderVar(
                      data.matricula_origem_externa || data.matricula_averbacao,
                      'matricula_origem_externa',
                      '84.694'
                    )}{' '}
                    do CRI de{' '}
                    {renderVar(
                      data.cri_origem_externa || data.cri_averbacao,
                      'cri_origem_externa',
                      'Mogi das Cruzes'
                    )}
                    , descrito como “{renderVar(data.descricao_imovel_origem, 'descricao_imovel_origem', 'Um terreno constituído pelas Glebas “A”, “B” e “C”, , situado na Estrada do Paiva, no bairro do Itapeti, perímetro rural deste município e comarca')}”,
                    de propriedade de{' '}
                    <strong className="font-bold">
                      {renderVar(data.proprietario_compensacao?.toUpperCase(), 'proprietario_compensacao', 'RICARDO CASEMIRO TOBERA')}
                    </strong>
                    , com área total de{' '}
                    {renderVar(formatAreaM2(data.area_total_gleba, ''), 'area_total_gleba', '____m²')}, situado á{' '}
                    {renderVar(data.localizacao_zona_origem, 'localizacao_zona_origem', 'zona rural do município de Mogi das Cruzes')},{' '}
                    <u className="font-bold decoration-black">
                      referente a compensação ambiental externa para atender à supressão de{' '}
                      {renderVar(formatAreaM2(data.area_supressao, ''), 'area_supressao', '224,70m²')} de vegetação nativa em estágio{' '}
                      {renderVar(data.estagio_supressao || data.estagio_regeneracao, 'estagio_supressao', 'médio')} de regeneração
                    </u>
                    , autorizada no imóvel objeto da matrícula{' '}
                    {renderVar(data.matricula_imovel_autorizado, 'matricula_imovel_autorizado', '7.346')} – CRI{' '}
                    {renderVar(data.cri_imovel_autorizado, 'cri_imovel_autorizado', 'Santa Isabel')}, de propriedade de{' '}
                    {renderVar(data.proprietario_autorizado || data.nome_proprietario, 'proprietario_autorizado', 'Bruno Welligton Basaglia')},
                    com área total de{' '}
                    {renderVar(formatAreaM2(data.area_total_lote_autorizado, ''), 'area_total_lote_autorizado', '____m²')}, situado{' '}
                    {renderVar(data.endereco_lote_autorizado || getAutoEnderecoImovel(data), 'endereco_lote_autorizado', 'Rua Alameda das Quaresmeiras, Lote 27, Quadra 28 - Arujá – SP')},
                    município de Arujá, afim de atender o Termo de Compensação Ambiental{' '}
                    {renderVar(data.termo_compensacao, 'termo_compensacao', 'N°166/2025')}.
                    <div className="mt-4 indent-0" style={{ lineHeight: '1.7' }}>
                      Área de compensação ambiental matrícula{' '}
                      {renderVar(
                        data.matricula_origem_externa || data.matricula_averbacao,
                        'matricula_origem_externa',
                        '84.694'
                      )}{' '}
                      – Cartório de Registro de Imóveis de{' '}
                      {renderVar(
                        data.cri_origem_externa || data.cri_averbacao,
                        'cri_origem_externa',
                        'Mogi das Cruzes'
                      )}
                      , {renderVar(formatAreaM2(data.area_vinculada_externa, ''), 'area_vinculada_externa', '674,10m²')}, coordenadas
                      geográficas do polígono:{' '}
                      {formatMemorialWithQuotes(
                        data.coordenadas_poligono_externo,
                        '“E383722,316 e N7405296,530; E383741,297 e N7405278,731; E383699,940 e N7405275,631; E383699,968 e N7405279,310; E383694,170; N7405295,939.”'
                      )}
                    </div>
                  </>
                ) : isInterna ? (
                  <>
                    “Fica vinculada uma área verde de{' '}
                    {renderVar(formatAreaM2(data.area_verde_interna, ''), 'area_verde_interna', '96,30m²')} do imóvel objeto da matrícula nº{' '}
                    {renderVar(
                      data.matricula_interna || data.matricula_averbacao,
                      'matricula_interna',
                      '7.346'
                    )}{' '}
                    do CRI de{' '}
                    {renderVar(
                      data.cri_interna || data.cri_averbacao,
                      'cri_interna',
                      'Santa Isabel'
                    )}
                    , descrito como “{renderVar(data.descricao_lote_interna, 'descricao_lote_interna', 'Lote de terreno sob Nº 27 da Quadra 28')}”,
                    situado no bairro {renderVar(data.bairro_interna, 'bairro_interna', 'Caputera')}, município de{' '}
                    {renderVar(data.municipio_interna, 'municipio_interna', 'Arujá')}, de propriedade de{' '}
                    <strong className="font-bold">
                      {renderVar(data.proprietario_objeto || data.nome_proprietario?.toUpperCase(), 'proprietario_objeto', 'BRUNO WELLINGTON BASAGLIA')}
                    </strong>
                    , com área total de{' '}
                    {renderVar(formatAreaM2(data.area_total_lote_interna, ''), 'area_total_lote_interna', '____m²')}, situado à,{' '}
                    {renderVar(data.endereco_lote_interna || getAutoEnderecoImovel(data), 'endereco_lote_interna', 'Alameda das Quaresmeiras, s/n')},{' '}
                    <u className="font-bold decoration-black">
                      referente a obrigatoriedade de manter vegetação nativa em estágio{' '}
                      {renderVar(data.estagio_regeneracao || data.estagio_supressao, 'estagio_regeneracao', 'médio')} de regeneração no lote para
                      atender à supressão de {renderVar(formatAreaM2(data.area_supressao, ''), 'area_supressao', '224,70m²')} de vegetação nativa
                    </u>
                    , autorizada no mesmo imóvel, afim de atender o Termo de Compensação Ambiental{' '}
                    {renderVar(data.termo_compensacao, 'termo_compensacao', 'n°166/2025')}.
                    <div className="mt-4 indent-0" style={{ lineHeight: '1.7' }}>
                      Coordenadas geográficas do polígono da Área Verde urbana obrigatória a ser mantida no lote:{' '}
                      {isTwoPages ? (
                        <span>“{memorialSplit.part1}</span>
                      ) : (
                        <span>
                          {formatMemorialWithQuotes(
                            data.memorial_descritivo_vertices,
                            '“Inicia-se no ponto “V05”, definido pelas coordenadas E(X) 365.052,625 e N(Y) 7.409.373,001...”'
                          )}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <div>{renderVar(data.texto_averbacao_customizado, 'texto_averbacao_customizado', '“Texto de averbação personalizado...”')}</div>
                )}
              </div>

              {/* Se o documento for de apenas 1 página, inclui Local, Data e Assinatura na Página 1 */}
              {!isTwoPages && (
                <>
                  <div className="text-right my-7 text-[11pt] text-black">
                    {renderVar(data.cidade_emissao, 'cidade_emissao', 'Arujá')},{' '}
                    {renderVar(data.data_emissao, 'data_emissao', '14 de janeiro de 2026')}.
                  </div>

                  <div className="text-center mt-10 mb-6 text-[11pt]">
                    <p className="font-bold tracking-wide text-black uppercase">
                      {renderVar(data.nome_secretario, 'nome_secretario', 'JUVENAL FERNANDO PENTEADO')}
                    </p>
                    <p className="text-black">
                      {renderVar(
                        data.cargo_secretario,
                        'cargo_secretario',
                        'Secretário de Meio Ambiente e Bem-Estar Animal de Arujá'
                      )}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Rodapé Oficial da Página 1 */}
            {renderFooter(1)}
          </div>

          {/* ======================= PÁGINA 2 (SE HOUVER MAIS DE UMA PÁGINA) ======================= */}
          {isTwoPages && (
            <div
              className="official-document-page w-full max-w-[210mm] min-h-[297mm] bg-white text-black shadow-xl border border-slate-300 px-10 py-8 sm:px-14 sm:py-10 flex flex-col justify-between print:shadow-none print:border-none print:m-0 print:p-6"
              style={{
                boxSizing: 'border-box',
                fontFamily: '"Times New Roman", "Tinos", "Liberation Serif", Times, serif',
                fontSize: '11pt',
              }}
            >
              {/* Bloco superior de conteúdo da Página 2 */}
              <div>
                {/* O Cabeçalho Institucional Oficial aparece também na Página 2 conforme solicitação do usuário */}
                {renderHeader()}

                {/* Continuação da Averbação e Memorial Descritivo */}
                <div
                  className="text-justify text-black mb-6 indent-0"
                  style={{ lineHeight: '1.5' }}
                >
                  <span>{memorialSplit.part2}”</span>
                </div>

                {/* Local e Data */}
                <div className="text-right my-8 text-[11pt] text-black">
                  {renderVar(data.cidade_emissao, 'cidade_emissao', 'Arujá')},{' '}
                  {renderVar(data.data_emissao, 'data_emissao', '14 de janeiro de 2026')}.
                </div>

                {/* Assinatura Oficial do Secretário */}
                <div className="text-center mt-14 mb-6 text-[11pt]">
                  <p className="font-bold tracking-wide text-black uppercase">
                    {renderVar(data.nome_secretario, 'nome_secretario', 'JUVENAL FERNANDO PENTEADO')}
                  </p>
                  <p className="text-black">
                    {renderVar(
                      data.cargo_secretario,
                      'cargo_secretario',
                      'Secretário de Meio Ambiente e Bem-Estar Animal de Arujá'
                    )}
                  </p>
                </div>
              </div>

              {/* O Rodapé Oficial aparece também na Página 2 com Página 2 / 2 */}
              {renderFooter(2)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
