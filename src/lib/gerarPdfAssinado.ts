import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export interface DadosSeguranca {
  nome: string;
  data: string;
  ip: string;
  docId: string;
  hash: string;
}

/**
 * Gera hash curto para integridade (SHA-256, primeiros 16 caracteres em hex).
 */
export async function hashSeguranca(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  const arr = Array.from(new Uint8Array(buffer));
  return arr.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

/**
 * Gera PDF com documento (HTML convertido via html2canvas), imagem da assinatura
 * e rodapé de segurança (Certificado de Assinatura).
 */
export async function gerarPdfAssinado(
  elemento: HTMLElement,
  assinaturaBase64: string,
  dadosSeguranca: DadosSeguranca
): Promise<jsPDF> {
  const doc = new jsPDF("p", "mm", "a4");
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 10;
  const contentW = pageW - 2 * margin;

  // 1. Converte o HTML do documento em imagem para manter a formatação
  const canvas = await html2canvas(elemento, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  });
  const imgData = canvas.toDataURL("image/png");
  const imgW = contentW;
  const contentAreaH = pageH - 2 * margin;
  const imgH = (canvas.height * imgW) / canvas.width;

  // 2. Adiciona o conteúdo ao PDF (uma ou mais páginas conforme a altura)
  let yOffset = margin;
  let remaining = imgH;
  let pageIndex = 0;

  while (remaining > 0) {
    if (pageIndex > 0) doc.addPage();
    const y = margin - (imgH - remaining);
    doc.addImage(imgData, "PNG", margin, y, imgW, imgH);
    remaining -= contentAreaH;
    pageIndex++;
  }

  // 3. Página final para certificado de assinatura
  doc.addPage();
  doc.setPage(doc.getNumberOfPages());

  // Imagem da assinatura centralizada
  doc.addImage(assinaturaBase64, "PNG", (pageW - 70) / 2, 20, 70, 30);

  // Linha e texto "Assinado digitalmente por..."
  doc.setFontSize(8);
  doc.text("__________________________________________", pageW / 2, 55, { align: "center" });
  doc.text(
    `Assinado digitalmente por ${dadosSeguranca.nome || "Signatário"} em ${dadosSeguranca.data}`,
    pageW / 2,
    62,
    { align: "center" }
  );

  // Rodapé com prova digital
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `IP: ${dadosSeguranca.ip || "—"} | ID: ${dadosSeguranca.docId} | Hash: ${dadosSeguranca.hash}`,
    margin,
    85,
    { maxWidth: pageW - 2 * margin }
  );

  return doc;
}
