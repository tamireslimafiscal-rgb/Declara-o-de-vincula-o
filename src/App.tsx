import React, { useState, useEffect } from 'react';
import { DeclarationData, DeclarationType } from './types/declaration';
import {
  SAMPLE_MODELO_EXTERNO,
  SAMPLE_MODELO_INTERNO,
  createNewBlankDeclaration,
  getFormattedDatePtBr,
} from './data/defaultTemplates';
import { validateDeclaration } from './utils/validation';
import { Header } from './components/Header';
import { DeclarationForm } from './components/DeclarationForm';
import { DocumentPreview } from './components/DocumentPreview';
import { BatchExcelModal } from './components/BatchExcelModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { FileEdit, Eye, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY_CURRENT = 'app_declaracoes_current_v1';
const STORAGE_KEY_HISTORY = 'app_declaracoes_history_v1';

export default function App() {
  // Inicialização com dados do histórico ou amostra
  const [history, setHistory] = useState<DeclarationData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [SAMPLE_MODELO_EXTERNO, SAMPLE_MODELO_INTERNO];
  });

  // O app agora inicia SEMPRE com todos os dados em branco, exceto os dados de cabeçalho oficiais
  const [currentDecl, setCurrentDecl] = useState<DeclarationData>(() => {
    try {
      localStorage.removeItem(STORAGE_KEY_CURRENT);
    } catch (e) {
      console.error(e);
    }
    return createNewBlankDeclaration('AREA_EXTERNA');
  });

  const [highlightVariables, setHighlightVariables] = useState<boolean>(true);
  const [focusedFieldName, setFocusedFieldName] = useState<keyof DeclarationData | null>(null);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isSavedJustNow, setIsSavedJustNow] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');

  // Salvar histórico no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error(e);
    }
  }, [history]);

  // Validação em tempo real
  const validation = validateDeclaration(currentDecl);

  // Ações de gerenciamento
  const handleSaveCurrent = () => {
    const updatedDecl: DeclarationData = {
      ...currentDecl,
      status: validation.percentage === 100 ? 'CONFERIDO' : 'RASCUNHO',
      updatedAt: new Date().toISOString(),
    };
    setCurrentDecl(updatedDecl);

    setHistory((prev) => {
      const existsIndex = prev.findIndex((item) => item.id === updatedDecl.id);
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = updatedDecl;
        return copy;
      }
      return [updatedDecl, ...prev];
    });

    setIsSavedJustNow(true);
    setTimeout(() => setIsSavedJustNow(false), 2000);
  };

  const handleNewDeclaration = () => {
    const blank = createNewBlankDeclaration('AREA_EXTERNA');
    setCurrentDecl(blank);
    setMobileTab('form');
  };

  const handleLoadSampleExterno = () => {
    setCurrentDecl({
      ...SAMPLE_MODELO_EXTERNO,
      id: 'decl-' + Date.now(),
      data_emissao: getFormattedDatePtBr(new Date()),
    });
  };

  const handleLoadSampleInterno = () => {
    setCurrentDecl({
      ...SAMPLE_MODELO_INTERNO,
      id: 'decl-' + Date.now(),
      data_emissao: getFormattedDatePtBr(new Date()),
    });
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleImportBatch = (items: DeclarationData[]) => {
    setHistory((prev) => [...items, ...prev]);
    if (items.length > 0) {
      setCurrentDecl(items[0]);
    }
  };

  // Duplicação inteligente para o outro modelo (ex: fez a Externa e agora precisa da Interna com os mesmos dados)
  const handleDuplicateForOppositeType = () => {
    const targetType: DeclarationType =
      currentDecl.tipo_vinculacao === 'AREA_EXTERNA' ? 'AREA_INTERNA' : 'AREA_EXTERNA';

    const currentNumInt = parseInt(currentDecl.numero_declaracao || '0', 10);
    const nextNum = isNaN(currentNumInt) ? '002' : String(currentNumInt + 1).padStart(3, '0');

    const duplicated: DeclarationData = {
      ...currentDecl,
      id: 'decl-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tipo_vinculacao: targetType,
      numero_declaracao: nextNum,
      // Se virou Interna, preencher dados específicos com valores base do imóvel
      ...(targetType === 'AREA_INTERNA'
        ? {
            matricula_averbacao: currentDecl.matricula_imovel_autorizado || currentDecl.matricula_averbacao || '7.346',
            cri_averbacao: currentDecl.cri_imovel_autorizado || 'Santa Isabel',
            matricula_interna: currentDecl.matricula_imovel_autorizado || currentDecl.matricula_averbacao || '7.346',
            cri_interna: currentDecl.cri_imovel_autorizado || 'Santa Isabel',
            descricao_lote_interna: `Lote de terreno sob Nº ${currentDecl.lote || '27'} da Quadra ${currentDecl.quadra || '28'}`,
            bairro_interna: 'Caputera',
            municipio_interna: 'Arujá',
            endereco_lote_interna: currentDecl.endereco_lote_autorizado || [currentDecl.logradouro, currentDecl.quadra ? `Quadra ${currentDecl.quadra}` : '', currentDecl.lote ? `Lote ${currentDecl.lote}` : '', currentDecl.bairro_condominio].filter(Boolean).join(', '),
            area_verde_interna: '',
            estagio_regeneracao: currentDecl.estagio_regeneracao || 'médio',
            memorial_descritivo_vertices: '',
          }
        : {
            matricula_averbacao: '84.694',
            cri_averbacao: 'Mogi das Cruzes',
            area_vinculada_externa: '674,10 m²',
            matricula_origem_externa: '84.694',
            cri_origem_externa: 'Mogi das Cruzes',
            descricao_imovel_origem: SAMPLE_MODELO_EXTERNO.descricao_imovel_origem,
            proprietario_compensacao: SAMPLE_MODELO_EXTERNO.proprietario_compensacao,
            area_total_gleba: '108,389ha.',
            localizacao_zona_origem: 'zona rural do município de Mogi das Cruzes',
            estagio_regeneracao: 'médio',
            matricula_imovel_autorizado: currentDecl.matricula_averbacao || '7.346',
            cri_imovel_autorizado: currentDecl.cri_averbacao || 'Santa Isabel',
            proprietario_autorizado: currentDecl.nome_proprietario,
            area_total_lote_autorizado: '321,00m²',
            endereco_lote_autorizado: `${currentDecl.logradouro}, Lote ${currentDecl.lote}, Quadra ${currentDecl.quadra} - Arujá – SP`,
            coordenadas_poligono_externo: SAMPLE_MODELO_EXTERNO.coordenadas_poligono_externo,
          }),
      status: 'RASCUNHO',
    };

    setCurrentDecl(duplicated);
    setMobileTab('form');
  };

  const handleFocusFieldFromPreview = (fieldName: keyof DeclarationData) => {
    setFocusedFieldName(fieldName);
    setMobileTab('form');
    // Rolar suavemente e focar no input correspondente
    setTimeout(() => {
      const el = document.getElementById(fieldName) || document.querySelector(`[name="${fieldName}"]`);
      if (el) {
        (el as HTMLElement).focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
    setTimeout(() => {
      setFocusedFieldName(null);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Top Navbar */}
      <Header
        onNewDeclaration={handleNewDeclaration}
        onLoadSampleExterno={handleLoadSampleExterno}
        onLoadSampleInterno={handleLoadSampleInterno}
        onOpenExcelModal={() => setIsExcelModalOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onSaveCurrent={handleSaveCurrent}
        historyCount={history.length}
        isSavedJustNow={isSavedJustNow}
        activeDeclNumber={currentDecl.numero_declaracao}
      />

      {/* Tabs para dispositivos móveis / telas estreitas */}
      <div className="lg:hidden flex bg-white border-b border-slate-200 sticky top-16 z-20">
        <button
          type="button"
          onClick={() => setMobileTab('form')}
          className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
            mobileTab === 'form'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileEdit size={16} />
          Preencher Dados ({validation.filledCount}/{validation.totalFields})
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
            mobileTab === 'preview'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Eye size={16} />
          Visualização A4 Oficial
        </button>
      </div>

      {/* Grid Principal: Dividido em Lado Esquerdo (Formulário) e Lado Direito (Preview A4) */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Painel Esquerdo: Formulário com Validação */}
        <section
          className={`lg:w-1/2 lg:block overflow-y-auto border-r border-slate-200 bg-slate-50/50 ${
            mobileTab === 'form' ? 'block' : 'hidden'
          }`}
        >
          <DeclarationForm
            data={currentDecl}
            onChange={setCurrentDecl}
            validation={validation}
            onDuplicateForOppositeType={handleDuplicateForOppositeType}
            focusedFieldName={focusedFieldName}
          />
        </section>

        {/* Painel Direito: Preview Oficial A4 e Botões de Download Word/Excel */}
        <section
          className={`lg:w-1/2 lg:block flex-1 overflow-hidden ${
            mobileTab === 'preview' ? 'block' : 'hidden'
          }`}
        >
          <DocumentPreview
            data={currentDecl}
            highlightVariables={highlightVariables}
            onToggleHighlight={() => setHighlightVariables(!highlightVariables)}
            onFocusField={handleFocusFieldFromPreview}
          />
        </section>
      </main>

      {/* Modal de Integração com Excel */}
      <BatchExcelModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        historyList={history}
        onLoadDeclaration={(decl) => {
          setCurrentDecl(decl);
          setMobileTab('form');
        }}
        onImportBatch={handleImportBatch}
      />

      {/* Drawer de Histórico */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={history}
        onSelectItem={(item) => {
          setCurrentDecl(item);
          setMobileTab('form');
        }}
        onDeleteItem={handleDeleteHistoryItem}
        onNewDeclaration={handleNewDeclaration}
      />
    </div>
  );
}
