import React from 'react';
import { BrasaoAruja } from './BrasaoAruja';
import {
  FileSpreadsheet,
  Clock,
  Plus,
  Save,
  Check,
  FileCheck2,
} from 'lucide-react';

interface HeaderProps {
  onNewDeclaration: () => void;
  onLoadSampleExterno: () => void;
  onLoadSampleInterno: () => void;
  onOpenExcelModal: () => void;
  onOpenHistory: () => void;
  onSaveCurrent: () => void;
  historyCount: number;
  isSavedJustNow: boolean;
  activeDeclNumber: string;
}

export const Header: React.FC<HeaderProps> = ({
  onNewDeclaration,
  onLoadSampleExterno,
  onLoadSampleInterno,
  onOpenExcelModal,
  onOpenHistory,
  onSaveCurrent,
  historyCount,
  isSavedJustNow,
  activeDeclNumber,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Lado Esquerdo: Identidade da Aplicação */}
        <div className="flex items-center gap-3">
          <BrasaoAruja className="w-9 h-10 shrink-0" size={38} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base tracking-tight text-white">
                Declarações Ambientais
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-blue-600/60 text-blue-200 border border-blue-400/30 rounded-full">
                Word (.docx) & Excel (.xlsx)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Prefeitura de Arujá • Secretaria Municipal de Meio Ambiente e Bem-Estar Animal
            </p>
          </div>
        </div>

        {/* Centro / Ações Rápidas de Modelos dos PDFs */}
        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            onClick={onNewDeclaration}
            className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-md transition-all flex items-center gap-1.5 shadow-xs"
            title="Iniciar nova declaração com todos os campos em branco (mantém apenas dados do cabeçalho oficial)"
          >
            <Plus size={14} className="text-emerald-400" />
            <span>Novo em Branco</span>
          </button>
          <span className="text-xs text-slate-600 font-medium mx-0.5">|</span>
          <span className="text-xs text-slate-400 font-medium">Exemplos:</span>
          <button
            type="button"
            onClick={onLoadSampleExterno}
            className="px-2 py-1 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-md transition-all"
            title="Carregar Modelo 001/2026 (Área Externa - Basaglia)"
          >
            Mod. 001 Externa
          </button>
          <button
            type="button"
            onClick={onLoadSampleInterno}
            className="px-2 py-1 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-md transition-all"
            title="Carregar Modelo 002/2026 (Área Interna - Basaglia)"
          >
            Mod. 002 Interna
          </button>
        </div>

        {/* Lado Direito: Novo (mobile), Excel, Histórico e Salvar */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNewDeclaration}
            className="md:hidden inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-all"
            title="Nova declaração em branco"
          >
            <Plus size={14} className="text-emerald-400" />
            <span>Novo</span>
          </button>
          <button
            type="button"
            onClick={onOpenExcelModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/50 rounded-lg transition-all"
            title="Controle em lote, importação e exportação para Excel"
          >
            <FileSpreadsheet size={15} className="text-emerald-400" />
            <span className="hidden sm:inline">Excel</span>
          </button>

          <button
            type="button"
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-lg transition-all"
            title="Ver declarações salvas anteriormente"
          >
            <Clock size={15} />
            <span className="hidden sm:inline">Histórico</span>
            <span className="bg-slate-700 text-slate-200 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              {historyCount}
            </span>
          </button>

          <button
            type="button"
            onClick={onSaveCurrent}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all shadow-xs ${
              isSavedJustNow
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'
            }`}
            title="Salvar esta declaração no histórico do navegador"
          >
            {isSavedJustNow ? <Check size={15} /> : <Save size={15} />}
            <span>{isSavedJustNow ? 'Salvo!' : 'Salvar'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
