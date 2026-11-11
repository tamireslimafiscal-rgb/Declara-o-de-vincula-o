import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { downloadBlob } from './docxGenerator';

export async function exportElementToPdf(containerId: string, filename: string): Promise<void> {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Elemento com ID "${containerId}" não encontrado.`);
  }

  // Deslocar temporariamente scroll para topo para captura precisa
  const originalScrollY = window.scrollY;
  const originalScrollX = window.scrollX;

  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    // Buscar todas as páginas oficiais A4 renderizadas dentro do container
    const pageElements = Array.from(
      container.querySelectorAll<HTMLElement>('.official-document-page')
    );
    const targetPages = pageElements.length > 0 ? pageElements : [container];

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = 210; // A4 largura em mm
    const pageHeight = 297; // A4 altura em mm

    for (let i = 0; i < targetPages.length; i++) {
      const pageEl = targetPages[i];

      // A partir da segunda página, adicionar nova folha ao PDF
      if (i > 0) {
        pdf.addPage();
      }

      const canvas = await html2canvas(pageEl, {
        scale: 2, // Resolução nítida para impressão A4 oficial
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // No documento clonado, assegurar visibilidade de todos os ancestrais
          const clonedContainer = clonedDoc.getElementById(containerId);
          if (clonedContainer) {
            let current: HTMLElement | null = clonedContainer;
            while (current && current !== clonedDoc.body) {
              current.style.display = 'block';
              current.style.visibility = 'visible';
              current = current.parentElement;
            }
          }

          const clonedPages = clonedDoc.querySelectorAll<HTMLElement>('.official-document-page');
          const activeClonedPage = clonedPages[i] || clonedContainer;
          if (activeClonedPage) {
            activeClonedPage.style.display = 'flex';
            activeClonedPage.style.flexDirection = 'column';
            activeClonedPage.style.justifyContent = 'space-between';
            activeClonedPage.style.visibility = 'visible';
            activeClonedPage.style.boxShadow = 'none';
            activeClonedPage.style.border = 'none';
            activeClonedPage.style.margin = '0 auto';
            activeClonedPage.style.width = '794px';
            activeClonedPage.style.minWidth = '794px';
            activeClonedPage.style.maxWidth = '794px';
            activeClonedPage.style.minHeight = '1123px';
            activeClonedPage.style.boxSizing = 'border-box';
            activeClonedPage.style.backgroundColor = '#ffffff';
            activeClonedPage.style.fontFamily = '"Times New Roman", "Tinos", "Liberation Serif", Times, serif';
            activeClonedPage.style.fontSize = '11pt';
          }
        },
      });

      const canvasWidth = canvas && canvas.width > 0 ? canvas.width : 794;
      const canvasHeight = canvas && canvas.height > 0 ? canvas.height : 1123;

      let imgHeight = Number(((canvasHeight * pageWidth) / canvasWidth).toFixed(2));
      if (isNaN(imgHeight) || imgHeight <= 0) {
        imgHeight = pageHeight;
      }

      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      // Cada página é renderizada perfeitamente no formato A4 com cabeçalho e rodapé
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
    }

    // Gerar blob e baixar via tag <a> (evita bloqueio de popup em iframe)
    const pdfBlob = pdf.output('blob');
    downloadBlob(pdfBlob, filename);
  } finally {
    window.scrollTo(originalScrollX, originalScrollY);
  }
}
