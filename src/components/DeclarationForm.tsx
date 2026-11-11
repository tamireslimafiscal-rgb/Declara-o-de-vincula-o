import React from 'react';
import { DeclarationData, DeclarationType, ValidationIssue } from '../types/declaration';
import { getFormattedDatePtBr } from '../data/defaultTemplates';
import { getAutoEnderecoImovel } from '../utils/formatUtils';
import {
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  Building2,
  Copy,
  Sparkles,
} from 'lucide-react';

interface DeclarationFormProps {
  data: DeclarationData;
  onChange: (updated: DeclarationData) => void;
  validation: {
    issues: ValidationIssue[];
    percentage: number;
    totalFields: number;
    filledCount: number;
  };
  onDuplicateForOppositeType: () => void;
  focusedFieldName?: keyof DeclarationData | null;
}

export const DeclarationForm: React.FC<DeclarationFormProps> = ({
  data,
  onChange,
  validation,
  onDuplicateForOppositeType,
  focusedFieldName,
}) => {
  const updateField = (field: keyof DeclarationData, value: any) => {
    onChange({
      ...data,
      [field]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.substring(0, 11);
    if (v.length > 9) {
      v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (v.length > 6) {
      v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (v.length > 3) {
      v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
    updateField('cpf_proprietario', v);
  };

  const setTodayDate = () => {
    updateField('data_emissao', getFormattedDatePtBr(new Date()));
  };

  const isExterna = data.tipo_vinculacao === 'AREA_EXTERNA';
  const isInterna = data.tipo_vinculacao === 'AREA_INTERNA';

  const getInputClass = (fieldName: keyof DeclarationData) => {
    const hasError = validation.issues.some((i) => i.field === fieldName && i.severity === 'error');
    const isTarget = focusedFieldName === fieldName;
    return `w-full text-xs sm:text-sm rounded-md px-3 py-2 border transition-all outline-none ${
      isTarget
        ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/40'
        : hasError
        ? 'border-rose-300 bg-rose-50/50 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
        : 'border-slate-300 bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
    }`;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Alerta de Validação & Progresso */}
      <div
        className={`p-4 rounded-xl border transition-all ${
          validation.percentage === 100
            ? 'bg-emerald-50/80 border-emerald-200'
            : 'bg-amber-50/80 border-amber-200'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {validation.percentage === 100 ? (
              <CheckCircle2 className="text-emerald-600 shrink-0" size={18} />
            ) : (
              <AlertTriangle className="text-amber-600 shrink-0" size={18} />
            )}
            <span className="text-xs sm:text-sm font-semibold text-slate-900">
              {validation.percentage === 100
                ? 'Todos os campos preenchidos com sucesso!'
                : `${validation.issues.length} campo(s) pendente(s) ou com atenção`}
            </span>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
            {validation.filledCount} / {validation.totalFields} ({validation.percentage}%)
          </span>
        </div>

        {/* Barra de Progresso */}
        <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden mb-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              validation.percentage === 100
                ? 'bg-emerald-600'
                : validation.percentage > 70
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
            style={{ width: `${validation.percentage}%` }}
          />
        </div>

        {validation.issues.length > 0 && (
          <div className="text-xs text-slate-600 mt-2 space-y-1">
            <span className="font-medium text-slate-700">Verifique antes de emitir: </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {validation.issues.map((issue, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                    issue.severity === 'error'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {issue.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Seletor de Tipo de Vinculação */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Tipo de Declaração / Modelo
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => updateField('tipo_vinculacao', 'AREA_EXTERNA')}
            className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
              isExterna
                ? 'border-blue-600 bg-blue-50/70 text-blue-950 ring-1 ring-blue-600'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div
              className={`p-2 rounded-md ${
                isExterna ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <MapPin size={16} />
            </div>
            <div>
              <div className="font-semibold text-xs sm:text-sm">Área Externa (Compensação)</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Ex: Modelo 001/2026. Vinculação em gleba rural/externa (ex: Mogi das Cruzes).
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => updateField('tipo_vinculacao', 'AREA_INTERNA')}
            className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
              isInterna
                ? 'border-blue-600 bg-blue-50/70 text-blue-950 ring-1 ring-blue-600'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div
              className={`p-2 rounded-md ${
                isInterna ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Layers size={16} />
            </div>
            <div>
              <div className="font-semibold text-xs sm:text-sm">Área Interna (No Lote)</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Ex: Modelo 002/2026. Área Verde obrigatória com vértices e memorial no lote.
              </div>
            </div>
          </button>
        </div>

        {/* Botão de Duplicação Inteligente */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Precisa fazer as duas declarações para o mesmo processo?
          </span>
          <button
            type="button"
            onClick={onDuplicateForOppositeType}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
          >
            <Copy size={13} />
            Gerar {isExterna ? 'Área Interna' : 'Área Externa'} com estes mesmos dados
          </button>
        </div>
      </div>

      {/* Seção de Cabeçalho Institucional Oficial */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-blue-700" />
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-800">
              Dados do Cabeçalho Oficial (Prefeitura & Secretaria)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-normal">
            Impresso no topo de cada documento
          </span>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Nome da Secretaria *
          </label>
          <input
            type="text"
            placeholder="SECRETARIA MUNICIPAL DE MEIO AMBIENTE E BEM-ESTAR ANIMAL"
            value={data.secretaria || 'SECRETARIA MUNICIPAL DE MEIO AMBIENTE E BEM-ESTAR ANIMAL'}
            onChange={(e) => updateField('secretaria', e.target.value.toUpperCase())}
            className={getInputClass('secretaria')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Prefeitura
            </label>
            <input
              type="text"
              value={data.prefeitura}
              onChange={(e) => updateField('prefeitura', e.target.value.toUpperCase())}
              className={getInputClass('prefeitura')}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Estado
            </label>
            <input
              type="text"
              value={data.estado}
              onChange={(e) => updateField('estado', e.target.value.toUpperCase())}
              className={getInputClass('estado')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Endereço (Rodapé)
            </label>
            <input
              type="text"
              value={data.endereco_secretaria}
              onChange={(e) => updateField('endereco_secretaria', e.target.value)}
              className={getInputClass('endereco_secretaria')}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Telefone e E-mail (Rodapé)
            </label>
            <input
              type="text"
              value={data.contato_secretaria}
              onChange={(e) => updateField('contato_secretaria', e.target.value)}
              className={getInputClass('contato_secretaria')}
            />
          </div>
        </div>
      </div>

      {/* Seção 1: Identificação do Documento e Processo */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <Building2 size={16} className="text-blue-600" />
          <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-800">
            1. Identificação do Documento & Processo
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nº Declaração *
            </label>
            <input
              type="text"
              placeholder="001"
              value={data.numero_declaracao}
              onChange={(e) => updateField('numero_declaracao', e.target.value)}
              className={getInputClass('numero_declaracao')}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Ano *
            </label>
            <input
              type="text"
              placeholder="2026"
              value={data.ano_declaracao}
              onChange={(e) => updateField('ano_declaracao', e.target.value)}
              className={getInputClass('ano_declaracao')}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Processo de Expedição *
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={data.tipo_processo_1doc || 'Protocolo 1DOC Nº'}
                onChange={(e) => updateField('tipo_processo_1doc', e.target.value)}
                className="w-full sm:w-1/2 text-xs sm:text-sm rounded-md px-3 py-2 border border-slate-300 bg-white font-medium"
              >
                <option value="Protocolo 1DOC Nº">Protocolo 1DOC Nº</option>
                <option value="Licenciamento Ambiental Nº">Licenciamento Ambiental Nº</option>
              </select>
              <input
                type="text"
                placeholder="Número (ex: 7.019/2024)"
                value={data.protocolo_1doc}
                onChange={(e) => updateField('protocolo_1doc', e.target.value)}
                className={getInputClass('protocolo_1doc')}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Termo TCA *
            </label>
            <input
              type="text"
              placeholder="Ex: 002/2026 ou 166/2025"
              value={data.termo_compensacao}
              onChange={(e) => updateField('termo_compensacao', e.target.value)}
              className={getInputClass('termo_compensacao')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Norma CONSEMA
            </label>
            <input
              type="text"
              placeholder="CONSEMA nº 01/2024"
              value={data.norma_consema}
              onChange={(e) => updateField('norma_consema', e.target.value)}
              className={getInputClass('norma_consema')}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Lei Complementar Municipal
            </label>
            <input
              type="text"
              placeholder="Lei Complementar Municipal nº 053/2022"
              value={data.lei_complementar}
              onChange={(e) => updateField('lei_complementar', e.target.value)}
              className={getInputClass('lei_complementar')}
            />
          </div>
        </div>
      </div>

      {/* Seção 2: Primeiro Parágrafo - Proprietário e Imóvel da Supressão */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-emerald-600" />
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-800">
              2. Primeiro Parágrafo: Proprietário & Imóvel da Supressão
            </h3>
          </div>
          <button
            type="button"
            onClick={() => updateField('nome_proprietario', data.nome_proprietario.toUpperCase())}
            className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
            title="Formatar nome em MAIÚSCULAS conforme padrão de certidões"
          >
            <Sparkles size={12} />
            MAIÚSCULAS
          </button>
        </div>

        {/* Dados do Proprietário */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nome do Proprietário / Requerente *
            </label>
            <input
              type="text"
              placeholder="Ex: PAULO ROGÉRIO SANTOS"
              value={data.nome_proprietario}
              onChange={(e) => updateField('nome_proprietario', e.target.value)}
              className={getInputClass('nome_proprietario')}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              CPF do Proprietário *
            </label>
            <input
              type="text"
              placeholder="000.000.000-00"
              value={data.cpf_proprietario}
              onChange={handleCpfChange}
              className={getInputClass('cpf_proprietario')}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700">
                Nacionalidade *
              </label>
              <button
                type="button"
                onClick={() => updateField('nacionalidade_proprietario', 'brasileira')}
                className={`px-2 py-0.5 text-[10px] rounded border font-medium transition-all ${
                  (data.nacionalidade_proprietario || 'brasileira') === 'brasileira'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                brasileira
              </button>
            </div>
            <input
              type="text"
              placeholder="brasileira"
              value={data.nacionalidade_proprietario || 'brasileira'}
              onChange={(e) => updateField('nacionalidade_proprietario', e.target.value)}
              className={getInputClass('nacionalidade_proprietario')}
            />
          </div>
        </div>

        {/* Dados do Lote Autorizado para Supressão */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50/80 rounded-lg border border-slate-200">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Área de Supressão *
              </label>
              <span className="text-[10px] text-blue-600 font-semibold">m² automático</span>
            </div>
            <input
              type="text"
              placeholder="ex: 205,00"
              value={data.area_supressao}
              onChange={(e) => updateField('area_supressao', e.target.value)}
              className={getInputClass('area_supressao')}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Matrícula do Lote da Supressão *
            </label>
            <input
              id="matricula_imovel_supressao"
              name="matricula_imovel_supressao"
              type="text"
              placeholder="Digite o número da matrícula"
              value={data.matricula_imovel_supressao ?? (isInterna ? data.matricula_interna : data.matricula_imovel_autorizado) ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                const updates: Partial<DeclarationData> = {
                  matricula_imovel_supressao: val,
                };
                if (isInterna) {
                  updates.matricula_interna = val;
                  if (!data.matricula_averbacao || data.matricula_averbacao === data.matricula_interna || data.matricula_averbacao === data.matricula_imovel_supressao) {
                    updates.matricula_averbacao = val;
                  }
                } else if (isExterna) {
                  updates.matricula_imovel_autorizado = val;
                }
                onChange({
                  ...data,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                });
              }}
              className={getInputClass('matricula_imovel_supressao')}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                CRI do Imóvel da Supressão *
              </label>
              <div className="flex gap-1">
                {['Santa Isabel', 'Mogi das Cruzes'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      updateField('cri_imovel_supressao', c);
                      if (data.tipo_vinculacao === 'AREA_EXTERNA') {
                        updateField('cri_imovel_autorizado', c);
                      }
                    }}
                    className={`px-1.5 py-0.2 text-[10px] rounded border font-medium ${
                      (data.cri_imovel_supressao || 'Santa Isabel') === c
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {c.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              placeholder="Santa Isabel"
              value={data.cri_imovel_supressao || 'Santa Isabel'}
              onChange={(e) => updateField('cri_imovel_supressao', e.target.value)}
              className={getInputClass('cri_imovel_supressao')}
            />
          </div>
        </div>

        {/* Estágio da Vegetação da Supressão e Situação APM / APP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50/80 rounded-lg border border-slate-200">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Estágio da Vegetação da Supressão *
            </label>
            <div className="flex items-center gap-1.5 mb-1.5">
              {['médio', 'inicial'].map((est) => (
                <button
                  key={est}
                  type="button"
                  onClick={() =>
                    onChange({
                      ...data,
                      estagio_supressao: est,
                      estagio_regeneracao: est,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    (data.estagio_supressao || 'médio') === est
                      ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {est.charAt(0).toUpperCase() + est.slice(1)}
                </button>
              ))}
            </div>
            <input
              id="estagio_supressao"
              name="estagio_supressao"
              type="text"
              placeholder="médio ou inicial"
              value={data.estagio_supressao || 'médio'}
              onChange={(e) => {
                const val = e.target.value;
                onChange({
                  ...data,
                  estagio_supressao: val,
                  estagio_regeneracao: val,
                  updatedAt: new Date().toISOString(),
                });
              }}
              className={getInputClass('estagio_supressao')}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Situação de APM e APP (Dentro ou Fora) *
            </label>
            <div className="flex flex-wrap gap-1 mb-1.5">
              {[
                'fora de APM e APP',
                'dentro de APM e APP',
                'fora de APM e dentro de APP',
                'dentro de APM e fora de APP',
              ].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => updateField('situacao_apm_app', opt)}
                  className={`px-2 py-0.5 text-[11px] rounded border font-medium transition-all ${
                    data.situacao_apm_app === opt
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="fora de APM e APP"
              value={data.situacao_apm_app || 'fora de APM e APP'}
              onChange={(e) => updateField('situacao_apm_app', e.target.value)}
              className={getInputClass('situacao_apm_app')}
            />
          </div>
        </div>

        {/* Endereço do Lote da Supressão */}
        <div className="space-y-2 p-3 bg-slate-50/80 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700">
              Endereço Completo do Imóvel da Supressão (Rua, Lote, Quadra, Bairro) *
            </label>
            <span className="text-[10px] text-slate-500">Arujá – SP incluído no texto oficial</span>
          </div>
          <input
            type="text"
            placeholder="Ex: Alameda das Quaresmeiras, Lote 27, Quadra 28, Bairro Arujá Country Club"
            value={data.endereco_completo_supressao || ''}
            onChange={(e) => {
              const val = e.target.value;
              updateField('endereco_completo_supressao', val);
              if (data.tipo_vinculacao === 'AREA_EXTERNA' && !data.endereco_lote_autorizado) {
                updateField('endereco_lote_autorizado', val);
              }
            }}
            className={getInputClass('endereco_completo_supressao')}
          />

          <details className="text-xs text-slate-600 pt-1">
            <summary className="cursor-pointer text-[11px] font-medium text-blue-600 hover:text-blue-800">
              Ou preencher campos detalhados (Rua, Quadra, Lote, Bairro)
            </summary>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Rua / Logradouro</label>
                <input
                  type="text"
                  placeholder="Alameda das Quaresmeiras"
                  value={data.logradouro}
                  onChange={(e) => updateField('logradouro', e.target.value)}
                  className="w-full text-xs rounded-md p-1.5 border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Quadra</label>
                <input
                  type="text"
                  placeholder="28"
                  value={data.quadra}
                  onChange={(e) => updateField('quadra', e.target.value)}
                  className="w-full text-xs rounded-md p-1.5 border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Lote</label>
                <input
                  type="text"
                  placeholder="27"
                  value={data.lote}
                  onChange={(e) => updateField('lote', e.target.value)}
                  className="w-full text-xs rounded-md p-1.5 border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Bairro / Condomínio</label>
                <input
                  type="text"
                  placeholder="Arujá Country Club"
                  value={data.bairro_condominio}
                  onChange={(e) => updateField('bairro_condominio', e.target.value)}
                  className="w-full text-xs rounded-md p-1.5 border border-slate-300"
                />
              </div>
            </div>
          </details>
        </div>

        {/* Averbação a ser Realizada (Final do 1º Parágrafo) */}
        <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-900">
              Averbação a ser Realizada (Final do 1º Parágrafo)
            </span>
            <span className="text-[11px] text-blue-700">
              {isExterna ? 'Matrícula da Área Externa' : 'Matrícula da Área Interna'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Matrícula para Averbação *
              </label>
              <input
                id="matricula_averbacao"
                name="matricula_averbacao"
                type="text"
                placeholder={isExterna ? "Ex: 84.694 (área externa)" : "Ex: 7.346 (área interna)"}
                value={data.matricula_averbacao ?? (isInterna ? (data.matricula_imovel_supressao || data.matricula_interna) : '') ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  const updates: Partial<DeclarationData> = { matricula_averbacao: val };
                  if (isInterna) {
                    updates.matricula_imovel_supressao = val;
                    updates.matricula_interna = val;
                  }
                  onChange({ ...data, ...updates, updatedAt: new Date().toISOString() });
                }}
                className={getInputClass('matricula_averbacao')}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700">
                  CRI para Averbação *
                </label>
                <div className="flex gap-1">
                  {['Santa Isabel', 'Mogi das Cruzes'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => updateField('cri_averbacao', c)}
                      className={`px-1.5 py-0.2 text-[10px] rounded border font-medium ${
                        (data.cri_averbacao || 'Santa Isabel') === c
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {c.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                placeholder="Ex: Santa Isabel ou Mogi das Cruzes"
                value={data.cri_averbacao}
                onChange={(e) => updateField('cri_averbacao', e.target.value)}
                className={getInputClass('cri_averbacao')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Seção 3: Detalhes da Averbação (Específica do Tipo Escolhido) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <Layers size={16} className="text-indigo-600" />
          <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-800">
            3. Dados da Averbação ({isExterna ? 'Compensação Externa' : 'Área Verde no Lote'})
          </h3>
        </div>

        {isExterna ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Área Vinculada (Externa) *
                </label>
                <input
                  type="text"
                  placeholder="674,10 m²"
                  value={data.area_vinculada_externa || ''}
                  onChange={(e) => updateField('area_vinculada_externa', e.target.value)}
                  className={getInputClass('area_vinculada_externa')}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Matrícula do Imóvel Vinculado *
                </label>
                <input
                  type="text"
                  placeholder="84.694"
                  value={data.matricula_origem_externa || ''}
                  onChange={(e) => updateField('matricula_origem_externa', e.target.value)}
                  className={getInputClass('matricula_origem_externa')}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  CRI do Imóvel Vinculado *
                </label>
                <input
                  type="text"
                  placeholder="Mogi das Cruzes"
                  value={data.cri_origem_externa || ''}
                  onChange={(e) => updateField('cri_origem_externa', e.target.value)}
                  className={getInputClass('cri_origem_externa')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Proprietário do Imóvel de Compensação *
                </label>
                <input
                  type="text"
                  placeholder="RICARDO CASEMIRO TOBERA"
                  value={data.proprietario_compensacao || ''}
                  onChange={(e) => updateField('proprietario_compensacao', e.target.value)}
                  className={getInputClass('proprietario_compensacao')}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Área Total da Gleba *
                  </label>
                  <span className="text-[10px] text-blue-600 font-semibold">m² automático</span>
                </div>
                <div className="relative">
                  <input
                    id="area_total_gleba"
                    name="area_total_gleba"
                    type="text"
                    placeholder="ex: 5.000,00"
                    value={data.area_total_gleba || ''}
                    onChange={(e) => updateField('area_total_gleba', e.target.value)}
                    className={`${getInputClass('area_total_gleba')} pr-9`}
                  />
                  {!/ha\.?$|hectare|m²|m2/i.test(data.area_total_gleba || '') && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                      m²
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Descrição do Imóvel Objeto
              </label>
              <textarea
                rows={2}
                placeholder="Um terreno constituído pelas Glebas “A”, “B” e “C”, , situado na Estrada do Paiva..."
                value={data.descricao_imovel_origem || ''}
                onChange={(e) => updateField('descricao_imovel_origem', e.target.value)}
                className={getInputClass('descricao_imovel_origem')}
              />
            </div>

            {/* Campo "situado á" - Endereço da propriedade onde ocorrerá a compensação */}
            <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-200">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-indigo-950 uppercase tracking-wide">
                  situado á *
                </label>
                <span className="text-[11px] font-semibold text-indigo-700">
                  Endereço da propriedade em que ocorrerá a compensação
                </span>
              </div>
              <input
                type="text"
                placeholder="ex: zona rural do município de Mogi das Cruzes / Estrada do Paiva, Bairro do Itapeti"
                value={data.localizacao_zona_origem || ''}
                onChange={(e) => updateField('localizacao_zona_origem', e.target.value)}
                className={getInputClass('localizacao_zona_origem')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Matrícula do Imóvel Autorizado *
                </label>
                <input
                  id="matricula_imovel_autorizado"
                  name="matricula_imovel_autorizado"
                  type="text"
                  placeholder="7.346"
                  value={data.matricula_imovel_autorizado ?? data.matricula_imovel_supressao ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    onChange({
                      ...data,
                      matricula_imovel_autorizado: val,
                      matricula_imovel_supressao: val,
                      updatedAt: new Date().toISOString(),
                    });
                  }}
                  className={getInputClass('matricula_imovel_autorizado')}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  CRI Imóvel Autorizado *
                </label>
                <input
                  type="text"
                  placeholder="Santa Isabel"
                  value={data.cri_imovel_autorizado || ''}
                  onChange={(e) => updateField('cri_imovel_autorizado', e.target.value)}
                  className={getInputClass('cri_imovel_autorizado')}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Proprietário Autorizado (Supressão)
                </label>
                <input
                  type="text"
                  placeholder="Bruno Welligton Basaglia"
                  value={data.proprietario_autorizado || data.nome_proprietario || ''}
                  onChange={(e) => updateField('proprietario_autorizado', e.target.value)}
                  className={getInputClass('proprietario_autorizado')}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Área Total do Lote Autorizado
                  </label>
                  <span className="text-[10px] text-blue-600 font-semibold">m² automático</span>
                </div>
                <div className="relative">
                  <input
                    id="area_total_lote_autorizado"
                    name="area_total_lote_autorizado"
                    type="text"
                    placeholder="ex: 321,00"
                    value={data.area_total_lote_autorizado || ''}
                    onChange={(e) => updateField('area_total_lote_autorizado', e.target.value)}
                    className={`${getInputClass('area_total_lote_autorizado')} pr-9`}
                  />
                  {!/ha\.?$|hectare|m²|m2/i.test(data.area_total_lote_autorizado || '') && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                      m²
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Campo "situado" - Endereço da propriedade onde haverá a supressão */}
            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wide">
                  situado *
                </label>
                <span className="text-[11px] font-semibold text-blue-700">
                  Endereço da propriedade em que haverá supressão
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ex: Rua Alameda das Quaresmeiras, Lote 27, Quadra 28 - Arujá – SP"
                  value={data.endereco_lote_autorizado || ''}
                  onChange={(e) => updateField('endereco_lote_autorizado', e.target.value)}
                  className={getInputClass('endereco_lote_autorizado')}
                />
                {(!data.endereco_lote_autorizado && data.logradouro) && (
                  <button
                    type="button"
                    onClick={() => {
                      const parts = [
                        data.logradouro,
                        data.lote ? `Lote ${data.lote}` : '',
                        data.quadra ? `Quadra ${data.quadra}` : '',
                        data.bairro_condominio || 'Arujá – SP'
                      ].filter(Boolean);
                      updateField('endereco_lote_autorizado', parts.join(', '));
                    }}
                    className="shrink-0 px-2.5 py-1 text-xs bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-300 font-medium transition-colors"
                    title="Copiar endereço preenchido no item 2"
                  >
                    Copiar do item 2
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Coordenadas Geográficas do Polígono da Compensação *
              </label>
              <textarea
                rows={3}
                placeholder="E383722,316 e N7405296,530; E383741,297 e N7405278,731..."
                value={data.coordenadas_poligono_externo || ''}
                onChange={(e) => updateField('coordenadas_poligono_externo', e.target.value)}
                className={getInputClass('coordenadas_poligono_externo')}
              />
            </div>
          </div>
        ) : isInterna ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Área Verde Interna *
                  </label>
                  <span className="text-[10px] text-blue-600 font-semibold">m² automático</span>
                </div>
                <input
                  type="text"
                  placeholder="ex: 366,34"
                  value={data.area_verde_interna || ''}
                  onChange={(e) => updateField('area_verde_interna', e.target.value)}
                  className={getInputClass('area_verde_interna')}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Matrícula do Lote *
                </label>
                <input
                  id="matricula_interna"
                  name="matricula_interna"
                  type="text"
                  placeholder="28.692"
                  value={data.matricula_interna ?? data.matricula_imovel_supressao ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    onChange({
                      ...data,
                      matricula_interna: val,
                      matricula_imovel_supressao: val,
                      matricula_averbacao: val,
                      updatedAt: new Date().toISOString(),
                    });
                  }}
                  className={getInputClass('matricula_interna')}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  CRI da Comarca *
                </label>
                <input
                  type="text"
                  placeholder="Santa Isabel"
                  value={data.cri_interna || ''}
                  onChange={(e) => updateField('cri_interna', e.target.value)}
                  className={getInputClass('cri_interna')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Descrição do Lote
                </label>
                <input
                  type="text"
                  placeholder="Um lote de terreno sob nº05 da quadra 21..."
                  value={data.descricao_lote_interna || ''}
                  onChange={(e) => updateField('descricao_lote_interna', e.target.value)}
                  className={getInputClass('descricao_lote_interna')}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Bairro do Imóvel
                </label>
                <input
                  type="text"
                  placeholder="Caputera"
                  value={data.bairro_interna || ''}
                  onChange={(e) => updateField('bairro_interna', e.target.value)}
                  className={getInputClass('bairro_interna')}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Área Total do Lote *
                  </label>
                  <span className="text-[10px] text-blue-600 font-semibold">m² automático</span>
                </div>
                <div className="relative">
                  <input
                    id="area_total_lote_interna"
                    name="area_total_lote_interna"
                    type="text"
                    placeholder="ex: 1.221,00"
                    value={data.area_total_lote_interna || ''}
                    onChange={(e) => updateField('area_total_lote_interna', e.target.value)}
                    className={`${getInputClass('area_total_lote_interna')} pr-9`}
                  />
                  {!/ha\.?$|hectare|m²|m2/i.test(data.area_total_lote_interna || '') && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                      m²
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Campo "situado à" - Endereço do Lote / Imóvel da Área Verde */}
            <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-200">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wide">
                  situado à *
                </label>
                <span className="text-[11px] font-semibold text-emerald-700">
                  Endereço da propriedade em que ocorrerá a vinculação da área verde
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ex: Rua Maranhão, Quadra 21, Lote 05 – Condomínio Arujazinho III, Arujá – SP"
                  value={data.endereco_lote_interna || ''}
                  onChange={(e) => updateField('endereco_lote_interna', e.target.value)}
                  className={getInputClass('endereco_lote_interna')}
                />
                <button
                  type="button"
                  onClick={() => {
                    const autoEnd = getAutoEnderecoImovel(data);
                    if (autoEnd) {
                      updateField('endereco_lote_interna', autoEnd);
                    }
                  }}
                  className="shrink-0 px-2.5 py-1 text-xs bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-300 font-medium transition-colors"
                  title="Copiar endereço preenchido no item 2"
                >
                  Copiar do item 2
                </button>
              </div>
            </div>

            {/* Estágio da Vegetação a manter na Área Verde */}
            <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estágio de Regeneração da Vegetação na Área Verde *
              </label>
              <div className="flex items-center gap-2 mb-1.5">
                <button
                  type="button"
                  onClick={() => updateField('estagio_regeneracao', 'médio')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    (data.estagio_regeneracao || 'médio') === 'médio'
                      ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Médio
                </button>
                <button
                  type="button"
                  onClick={() => updateField('estagio_regeneracao', 'inicial')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    data.estagio_regeneracao === 'inicial'
                      ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Inicial
                </button>
                <input
                  id="estagio_regeneracao"
                  name="estagio_regeneracao"
                  type="text"
                  placeholder="médio ou inicial"
                  value={data.estagio_regeneracao || 'médio'}
                  onChange={(e) => updateField('estagio_regeneracao', e.target.value)}
                  className={getInputClass('estagio_regeneracao')}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700">
                  Memorial Descritivo / Coordenadas dos Vértices da Área Verde *
                </label>
                <span className="text-[11px] text-slate-500">
                  As aspas obrigatórias “...” são aplicadas automaticamente
                </span>
              </div>
              <textarea
                rows={5}
                placeholder="Inicia-se no ponto P03, de coordenadas N 7.409.099,18m e E 366.573,85m ; deste confrontando com o lote 06..."
                value={data.memorial_descritivo_vertices || ''}
                onChange={(e) => updateField('memorial_descritivo_vertices', e.target.value)}
                className={getInputClass('memorial_descritivo_vertices')}
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Texto da Averbação (Personalizado)
            </label>
            <textarea
              rows={6}
              value={data.texto_averbacao_customizado || ''}
              onChange={(e) => updateField('texto_averbacao_customizado', e.target.value)}
              className={getInputClass('texto_averbacao_customizado')}
            />
          </div>
        )}
      </div>

      {/* Seção 4: Local, Data e Signatário */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-amber-600" />
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-800">
              4. Local, Data & Signatário
            </h3>
          </div>
          <button
            type="button"
            onClick={setTodayDate}
            className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
          >
            <Calendar size={12} />
            Usar data de hoje
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Cidade de Emissão
            </label>
            <input
              type="text"
              value={data.cidade_emissao}
              onChange={(e) => updateField('cidade_emissao', e.target.value)}
              className={getInputClass('cidade_emissao')}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Data de Emissão (por extenso)
            </label>
            <input
              type="text"
              placeholder="14 de janeiro de 2026"
              value={data.data_emissao}
              onChange={(e) => updateField('data_emissao', e.target.value)}
              className={getInputClass('data_emissao')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nome do Secretário / Responsável
            </label>
            <input
              type="text"
              value={data.nome_secretario}
              onChange={(e) => updateField('nome_secretario', e.target.value)}
              className={getInputClass('nome_secretario')}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Cargo do Signatário
            </label>
            <input
              type="text"
              value={data.cargo_secretario}
              onChange={(e) => updateField('cargo_secretario', e.target.value)}
              className={getInputClass('cargo_secretario')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
