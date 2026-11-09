import { DeclarationData, ValidationIssue } from '../types/declaration';

export function validateDeclaration(data: DeclarationData): {
  issues: ValidationIssue[];
  percentage: number;
  totalFields: number;
  filledCount: number;
} {
  const issues: ValidationIssue[] = [];

  // Campos essenciais gerais
  const requiredGeneral: { key: keyof DeclarationData; label: string }[] = [
    { key: 'numero_declaracao', label: 'Número da Declaração' },
    { key: 'ano_declaracao', label: 'Ano da Declaração' },
    { key: 'area_supressao', label: 'Área de Supressão (m²)' },
    { key: 'inscricao_imovel', label: 'Inscrição Imobiliária' },
    { key: 'logradouro', label: 'Logradouro / Rua' },
    { key: 'quadra', label: 'Quadra' },
    { key: 'lote', label: 'Lote' },
    { key: 'nome_proprietario', label: 'Nome do Proprietário / Requerente' },
    { key: 'cpf_proprietario', label: 'CPF do Proprietário' },
    { key: 'termo_compensacao', label: 'Termo de Compensação (TCA)' },
    { key: 'protocolo_1doc', label: 'Protocolo 1DOC' },
    { key: 'matricula_averbacao', label: 'Matrícula da Averbação' },
    { key: 'cri_averbacao', label: 'Cartório de Registro de Imóveis (CRI)' },
  ];

  requiredGeneral.forEach(({ key, label }) => {
    const val = (data[key] as string || '').trim();
    if (!val) {
      issues.push({
        field: key,
        label,
        message: `O campo "${label}" está em branco.`,
        severity: 'error',
      });
    } else if (val.includes('___') || val.includes('XXXX') || val.includes('[') || val.includes('{')) {
      issues.push({
        field: key,
        label,
        message: `O campo "${label}" contém marcadores provisórios não preenchidos.`,
        severity: 'warning',
      });
    }
  });

  // Validações específicas por tipo
  if (data.tipo_vinculacao === 'AREA_EXTERNA') {
    const requiredExternal: { key: keyof DeclarationData; label: string }[] = [
      { key: 'area_vinculada_externa', label: 'Área Vinculada Externa' },
      { key: 'matricula_origem_externa', label: 'Matrícula do Imóvel de Origem' },
      { key: 'cri_origem_externa', label: 'CRI do Imóvel de Origem' },
      { key: 'proprietario_compensacao', label: 'Proprietário da Área de Compensação' },
      { key: 'localizacao_zona_origem', label: 'situado á (Endereço da Compensação)' },
      { key: 'matricula_imovel_autorizado', label: 'Matrícula do Imóvel Autorizado' },
      { key: 'cri_imovel_autorizado', label: 'CRI do Imóvel Autorizado' },
      { key: 'endereco_lote_autorizado', label: 'situado (Endereço da Supressão)' },
      { key: 'coordenadas_poligono_externo', label: 'Coordenadas Geográficas do Polígono' },
    ];

    requiredExternal.forEach(({ key, label }) => {
      const val = (data[key] as string || '').trim();
      if (!val) {
        issues.push({
          field: key,
          label,
          message: `Área Externa: o campo "${label}" está pendente.`,
          severity: 'error',
        });
      }
    });
  } else if (data.tipo_vinculacao === 'AREA_INTERNA') {
    const requiredInternal: { key: keyof DeclarationData; label: string }[] = [
      { key: 'area_verde_interna', label: 'Área Verde Interna Obrigatória' },
      { key: 'matricula_interna', label: 'Matrícula do Imóvel' },
      { key: 'cri_interna', label: 'CRI da Comarca' },
      { key: 'memorial_descritivo_vertices', label: 'Memorial Descritivo / Vértices do Polígono' },
    ];

    requiredInternal.forEach(({ key, label }) => {
      const val = (data[key] as string || '').trim();
      if (!val) {
        issues.push({
          field: key,
          label,
          message: `Área Interna: o campo "${label}" precisa ser preenchido.`,
          severity: 'error',
        });
      }
    });
  }

  const totalFields = requiredGeneral.length + (data.tipo_vinculacao === 'AREA_EXTERNA' ? 7 : 4);
  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const filledCount = Math.max(0, totalFields - errorCount);
  const percentage = Math.round((filledCount / totalFields) * 100);

  return {
    issues,
    percentage,
    totalFields,
    filledCount,
  };
}
