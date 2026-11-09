import React, { useState } from 'react';
import { DeclarationData } from '../types/declaration';
import { generateDeclarationDocx, downloadBlob } from '../utils/docxGenerator';
import {
  X,
  Search,
  FileText,
  Clock,
  Trash2,
  ExternalLink,
  Plus,
} from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: DeclarationData[];
  onSelectItem: (item: DeclarationData) => void;
  onDeleteItem: (id: string) => void;
  onNewDeclaration: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onSelectItem,
  onDeleteItem,
  onNewDeclaration,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredItems = items.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      (item.nome_proprietario || '').toLowerCase().includes(term) ||
      (item.cpf_proprietario || '').toLowerCase().includes(term) ||
      (item.protocolo_1doc || '').toLowerCase().includes(term) ||
      (item.termo_compensacao || '').toLowerCase().includes(term) ||
      (item.numero_declaracao || '').toLowerCase().includes(term) ||
      (item.inscricao_imovel || '').toLowerCase().includes(term)
    );
  });

  const handleDownloadDocx = async (e: React.MouseEvent, item: DeclarationData) => {
    e.stopPropagation();
    try {
      const blob = await generateDeclarationDocx(item);
      const cleanNum = (item.numero_declaracao || '000').padStart(3, '0');
      const cleanYear = item.ano_declaracao || '2026';
      const cleanOwner = (item.nome_proprietario || 'PROCESSO')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .substring(0, 25);
      downloadBlob(blob, `${cleanNum}_${cleanYear}_DECLARACAO_${cleanOwner}.docx`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-2xs animate-fadeIn">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header do Drawer */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Clock className="text-blue-600" size={18} />
            <h2 className="text-sm font-bold text-slate-800">
              Histórico de Declarações ({items.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Barra de Pesquisa e Nova Declaração */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Buscar por nome, CPF, 1DOC, TCA..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              onNewDeclaration();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs"
          >
            <Plus size={15} />
            Criar Nova Declaração em Branco
          </button>
        </div>

        {/* Lista de Registros */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Nenhuma declaração encontrada.
            </div>
          ) : (
            filteredItems.map((item) => {
              const isExterna = item.tipo_vinculacao === 'AREA_EXTERNA';
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectItem(item);
                    onClose();
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/30 transition-all cursor-pointer group shadow-2xs relative"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        Nº {item.numero_declaracao || '___'}/{item.ano_declaracao || '2026'}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isExterna
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {isExterna ? 'Área Externa' : 'Área Interna'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={(e) => handleDownloadDocx(e, item)}
                        title="Baixar Word (.docx)"
                        className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
                      >
                        <FileText size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Deseja excluir esta declaração do histórico?')) {
                            onDeleteItem(item.id);
                          }
                        }}
                        title="Excluir"
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-xs text-slate-800 truncate mb-1">
                    {item.nome_proprietario || 'Proprietário não informado'}
                  </h3>

                  <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-500">
                    <div>
                      <span className="text-slate-400">1DOC: </span>
                      {item.protocolo_1doc || '—'}
                    </div>
                    <div>
                      <span className="text-slate-400">TCA: </span>
                      {item.termo_compensacao || '—'}
                    </div>
                    <div className="truncate col-span-2">
                      <span className="text-slate-400">Lote/Quadra: </span>
                      Lote {item.lote || '—'}, Q. {item.quadra || '—'}
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{item.data_emissao || 'Sem data'}</span>
                    <span className="inline-flex items-center gap-1 text-blue-600 group-hover:underline font-medium">
                      Abrir no Editor <ExternalLink size={10} />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
