import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Header,
  Footer,
  PageNumber,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ImageRun,
  PageBreak,
} from 'docx';
import { DeclarationData } from '../types/declaration';
import { BRASAO_RAW_BASE64 } from '../assets/brasaoBase64';
import { formatAreaM2, formatMemorialWithQuotes, getAutoEnderecoImovel, formatEnderecoSupressao, formatTermoTCA } from './formatUtils';

function getBrasaoBuffer(): Uint8Array {
  try {
    const binaryString = atob(BRASAO_RAW_BASE64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    console.error('Erro ao converter base64 do brasão:', e);
    return new Uint8Array(0);
  }
}

export async function generateDeclarationDocx(data: DeclarationData): Promise<Blob> {
  const isExterna = data.tipo_vinculacao === 'AREA_EXTERNA';
  const isInterna = data.tipo_vinculacao === 'AREA_INTERNA';
  const brasaoBytes = getBrasaoBuffer();

  const secName = data.secretaria
    ? data.secretaria
    : 'SECRETARIA MUNICIPAL DE MEIO AMBIENTE E BEM-ESTAR ANIMAL';

  const areaSupressaoFmt = formatAreaM2(data.area_supressao);
  const estagioSup = data.estagio_supressao || 'médio';
  const matSupressao = data.matricula_imovel_supressao || (isInterna ? data.matricula_interna : data.matricula_imovel_autorizado) || '';
  const criSupressao = data.cri_imovel_supressao || 'Santa Isabel';
  const endSupressao = formatEnderecoSupressao(data);
  const nacionalidade = data.nacionalidade_proprietario || 'brasileira';
  const tcaFormatado = formatTermoTCA(data.termo_compensacao);
  const tipoProc1doc = data.tipo_processo_1doc || 'Protocolo 1DOC Nº';

  // Montagem do Primeiro Parágrafo com os destaques em negrito oficiais
  const p1Runs: TextRun[] = [
    new TextRun({
      text: `A Secretaria Municipal de Meio Ambiente de Arujá, nas atribuições que lhe foram conferidas de acordo com a deliberação normativa ${data.norma_consema || 'CONSEMA nº 01/2024'} e com a ${data.lei_complementar || 'Lei Complementar Municipal nº 053/2022'}, declara que aprovou a supressão de `,
    }),
    new TextRun({
      text: `${areaSupressaoFmt}`,
      bold: true,
    }),
    new TextRun({
      text: ` de vegetação nativa em estágio ${estagioSup} de regeneração no imóvel registrado sob a matrícula nº `,
    }),
    new TextRun({
      text: `${matSupressao}`,
      bold: true,
    }),
    new TextRun({
      text: `, ${data.situacao_apm_app || 'fora de APM e APP'}, Registrado em Cartório do Registro de Imóveis de ${criSupressao}, localizado na ${endSupressao}, Arujá – SP, pertencente ao proprietário `,
    }),
    new TextRun({
      text: `${(data.nome_proprietario || '___').toUpperCase()}`,
      bold: true,
    }),
    new TextRun({
      text: `, CPF `,
    }),
    new TextRun({
      text: `${data.cpf_proprietario || '___'}`,
      bold: true,
    }),
    new TextRun({
      text: `, ${nacionalidade}, vinculado ao `,
    }),
    new TextRun({
      text: `Termo de Compensação Ambiental ${tcaFormatado}`,
      bold: true,
    }),
    new TextRun({
      text: `, expedido no `,
    }),
    new TextRun({
      text: `${tipoProc1doc} ${data.protocolo_1doc || '___'}`,
      bold: true,
    }),
    new TextRun({
      text: `. Declara-se, ainda, que, conforme solicitado, e após o envio e análise dos documentos apresentados, os quais foram aprovados por esta Secretaria no que se refere à solicitação de supressão de vegetação nativa e compensação ambiental correspondente, deve ser realizada a seguinte averbação à margem da `,
    }),
    new TextRun({
      text: `matrícula nº ${data.matricula_averbacao || '___'} do CRI de ${data.cri_averbacao || '___'}`,
      bold: true,
    }),
    new TextRun({
      text: `. Tal averbação deverá ser apresentada a esta Secretaria para a emissão da autorização competente.`,
    }),
  ];

  // Montagem do Segundo Parágrafo (Averbação)
  const p2Runs: TextRun[] = [];

  if (isExterna) {
    const areaVinculadaExtFmt = formatAreaM2(data.area_vinculada_externa);
    const areaTotalGlebaFmt = formatAreaM2(data.area_total_gleba);
    const areaTotalLoteAutFmt = formatAreaM2(data.area_total_lote_autorizado);
    const endLoteAut = data.endereco_lote_autorizado || getAutoEnderecoImovel(data) || '___';
    const coordsExt = formatMemorialWithQuotes(data.coordenadas_poligono_externo);

    p2Runs.push(
      new TextRun({
        text: `“Fica vinculada uma área de ${areaVinculadaExtFmt} do imóvel objeto da matrícula nº ${data.matricula_origem_externa || data.matricula_averbacao || '___'} do CRI de ${data.cri_origem_externa || data.cri_averbacao || '___'}, descrito como “${data.descricao_imovel_origem || '___'}”, de propriedade de `,
      }),
      new TextRun({
        text: `${(data.proprietario_compensacao || '___').toUpperCase()}`,
        bold: true,
      }),
      new TextRun({
        text: `, com área total de ${areaTotalGlebaFmt}, `,
      }),
      new TextRun({
        text: `situado á ${data.localizacao_zona_origem || '___'}, `,
      }),
      new TextRun({
        text: `referente a compensação ambiental externa para atender à supressão de ${areaSupressaoFmt} de vegetação nativa em estágio ${data.estagio_supressao || data.estagio_regeneracao || 'médio'} de regeneração`,
        bold: true,
        underline: {},
      }),
      new TextRun({
        text: `, autorizada no imóvel objeto da matrícula ${data.matricula_imovel_autorizado || '___'} – CRI ${data.cri_imovel_autorizado || '___'}, de propriedade de ${data.proprietario_autorizado || data.nome_proprietario || '___'}, com área total de ${areaTotalLoteAutFmt}, `,
      }),
      new TextRun({
        text: `situado ${endLoteAut}, município de Arujá, afim de atender o Termo de Compensação Ambiental ${data.termo_compensacao || '___'}.\n\n`,
      }),
      new TextRun({
        text: `Área de compensação ambiental matrícula ${data.matricula_origem_externa || data.matricula_averbacao || '___'} – Cartório de Registro de Imóveis de ${data.cri_origem_externa || data.cri_averbacao || '___'}, ${areaVinculadaExtFmt}, coordenadas geográficas do polígono: ${coordsExt}”`,
      })
    );
  } else if (data.tipo_vinculacao === 'AREA_INTERNA') {
    const areaVerdeIntFmt = formatAreaM2(data.area_verde_interna);
    const areaTotalLoteIntFmt = formatAreaM2(data.area_total_lote_interna);
    const endInterna = data.endereco_lote_interna || getAutoEnderecoImovel(data) || '___';
    const memorialWithQuotes = formatMemorialWithQuotes(data.memorial_descritivo_vertices);

    p2Runs.push(
      new TextRun({
        text: `“Fica vinculada uma área verde de ${areaVerdeIntFmt} do imóvel objeto da matrícula nº ${data.matricula_interna || data.matricula_averbacao || '___'} do CRI de ${data.cri_interna || data.cri_averbacao || '___'}, descrito como “${data.descricao_lote_interna || '___'}”, situado no bairro ${data.bairro_interna || '___'}, município de ${data.municipio_interna || 'Arujá'}, de propriedade de `,
      }),
      new TextRun({
        text: `${(data.proprietario_objeto || data.nome_proprietario || '___').toUpperCase()}`,
        bold: true,
      }),
      new TextRun({
        text: `, com área total de ${areaTotalLoteIntFmt}, situado à, ${endInterna}, `,
      }),
      new TextRun({
        text: `referente a obrigatoriedade de manter vegetação nativa em estágio ${data.estagio_regeneracao || data.estagio_supressao || 'médio'} de regeneração no lote para atender à supressão de ${areaSupressaoFmt} de vegetação nativa`,
        bold: true,
        underline: {},
      }),
      new TextRun({
        text: `, autorizada no mesmo imóvel, afim de atender o Termo de Compensação Ambiental ${data.termo_compensacao || '___'}.\n\n`,
      }),
      new TextRun({
        text: `Coordenadas geográficas do polígono da Área Verde urbana obrigatória a ser mantida no lote: ${memorialWithQuotes}`,
      })
    );
  } else {
    p2Runs.push(
      new TextRun({
        text: data.texto_averbacao_customizado || '“Texto da averbação não preenchido.”',
      })
    );
  }

  // Cabeçalho Timbrado Oficial: Brasão no lado esquerdo ampliado sem alterar a centralização das letras
  const headerCells: TableCell[] = [];

  // Coluna Esquerda: Brasão ampliado (92x106)
  headerCells.push(
    new TableCell({
      width: { size: 22, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      },
      children: [
        brasaoBytes.length > 0
          ? new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: { before: 0, after: 0 },
              children: [
                new ImageRun({
                  data: brasaoBytes,
                  transformation: {
                    width: 92, // Imagem maior (92x106)
                    height: 106,
                  },
                  type: 'png',
                }),
              ],
            })
          : new Paragraph({ children: [] }),
      ],
    })
  );

  // Coluna Central: Textos 100% centralizados na página
  headerCells.push(
    new TableCell({
      width: { size: 56, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 15, line: 240 },
          children: [
            new TextRun({
              text: data.prefeitura.toUpperCase(),
              bold: true,
              size: 24, // 12pt
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 15, line: 240 },
          children: [
            new TextRun({
              text: data.estado.toUpperCase(),
              size: 20, // 10pt
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 0, line: 220 }, // Espaço mínimo: colado na linha!
          children: [
            new TextRun({
              text: secName.toUpperCase(),
              bold: true,
              size: 20, // 10pt
            }),
          ],
        }),
      ],
    })
  );

  // Coluna Direita: Espaçador com a mesma largura da esquerda (22%) para manter as letras perfeitamente centralizadas
  headerCells.push(
    new TableCell({
      width: { size: 22, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      },
      children: [new Paragraph({ children: [] })],
    })
  );

  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    },
    rows: [
      new TableRow({
        children: headerCells,
      }),
    ],
  });

  // Linha preta horizontal sólida separadora colada no nome da secretaria
  const headerDivider = new Paragraph({
    spacing: { before: 0, after: 280 }, // Espaçamento antes reduzido a zero
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        size: 12, // 1.5 pt
        color: '000000',
      },
    },
  });

  // Criar documento Word com Times New Roman tamanho 11 e espaçamento de 1,5 linha (360 twips)
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Times New Roman',
            size: 22, // 11pt
            color: '000000',
          },
          paragraph: {
            spacing: {
              line: 360, // Espaçamento entre linhas de 1,5 (padrão oficial 360 twips)
              after: 240,
            },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1417,    // 2.5 cm
              bottom: 1417, // 2.5 cm
              left: 1417,   // 2.5 cm
              right: 1417,  // 2.5 cm
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              headerTable,
              headerDivider,
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
                  bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
                  left: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
                  right: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
                  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                  insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        columnSpan: 2,
                        margins: { top: 80, bottom: 20, left: 100, right: 100 },
                        borders: {
                          top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                          bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                          left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                          right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                        },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 0, after: 30 },
                            children: [
                              new TextRun({
                                text: `${data.endereco_secretaria || 'Rua Fenacita, nº 500, Jardim Fazenda Rincão – CEP 07428-205'}`,
                                size: 17, // ~8.5pt
                                font: 'Times New Roman',
                                bold: true,
                                color: '000000',
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        width: { size: 75, type: WidthType.PERCENTAGE },
                        margins: { top: 10, bottom: 80, left: 100, right: 20 },
                        borders: {
                          top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                          bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                          left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                          right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                        },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.LEFT,
                            spacing: { before: 0, after: 0 },
                            children: [
                              new TextRun({
                                text: `${data.contato_secretaria || 'Telefone: (11) 4653-1845 – E-mail: meioambiente.diretoria@aruja.sp.gov.br'}`,
                                size: 16, // 8pt
                                font: 'Times New Roman',
                                color: '000000',
                              }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        width: { size: 25, type: WidthType.PERCENTAGE },
                        margins: { top: 10, bottom: 80, left: 20, right: 100 },
                        borders: {
                          top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                          bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                          left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                          right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                        },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            spacing: { before: 0, after: 0 },
                            children: [
                              new TextRun({
                                text: 'Página ',
                                size: 16,
                                font: 'Times New Roman',
                                bold: true,
                                color: '000000',
                              }),
                              new TextRun({
                                children: [PageNumber.CURRENT],
                                size: 16,
                                font: 'Times New Roman',
                                bold: true,
                                color: '000000',
                              }),
                              new TextRun({
                                text: ' / ',
                                size: 16,
                                font: 'Times New Roman',
                                bold: true,
                                color: '000000',
                              }),
                              new TextRun({
                                children: [PageNumber.TOTAL_PAGES],
                                size: 16,
                                font: 'Times New Roman',
                                bold: true,
                                color: '000000',
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // Título do Documento com espaçamento (Times New Roman 11)
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 360, line: 360 },
            children: [
              new TextRun({
                text: `DECLARAÇÃO PARA VINCULAÇÃO Nº ${data.numero_declaracao || '___'}/${data.ano_declaracao || '2026'}`,
                bold: true,
                font: 'Times New Roman',
                size: 22, // 11pt
              }),
            ],
          }),

          // Primeiro Parágrafo com espaçamento 1,5 e recuo de 1,25 cm (720 twips)
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: 720 },
            spacing: { after: 280, line: 360 },
            children: p1Runs,
          }),

          // Segundo Parágrafo (Averbação) com espaçamento 1,5
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: 720 },
            spacing: { after: 360, line: 360 },
            children: p2Runs,
          }),

          // Local e Data alinhado à direita
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 240, after: 600, line: 360 },
            children: [
              new TextRun({
                text: `${data.cidade_emissao || 'Arujá'}, ${data.data_emissao || '___'}.`,
                font: 'Times New Roman',
                size: 22, // 11pt
              }),
            ],
          }),

          // Assinatura
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 300, after: 40, line: 260 },
            children: [
              new TextRun({
                text: (data.nome_secretario || 'JUVENAL FERNANDO PENTEADO').toUpperCase(),
                bold: true,
                font: 'Times New Roman',
                size: 22, // 11pt
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100, line: 240 },
            children: [
              new TextRun({
                text: data.cargo_secretario || 'Secretário de Meio Ambiente e Bem-Estar Animal de Arujá',
                font: 'Times New Roman',
                size: 22, // 11pt
              }),
            ],
          }),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
