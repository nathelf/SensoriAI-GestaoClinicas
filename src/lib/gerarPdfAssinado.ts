import type { jsPDF } from "jspdf";

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
  const [{ jsPDF: JsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);
  const doc = new JsPDF("p", "mm", "a4");
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
  let remaining = imgH;
  let pageIndex = 0;

  while (remaining > 0) {
    if (pageIndex > 0) doc.addPage();
    const y = margin - (imgH - remaining);
    doc.addImage(imgData, "PNG", margin, y, imgW, imgH);
    remaining -= contentAreaH;
    pageIndex++;
  }

  // 3. Página final: Certificado de Assinatura Eletrônica
  doc.addPage();
  doc.setPage(doc.getNumberOfPages());
  const protocolo = `SENTINEL-${dadosSeguranca.docId.slice(0, 8).toUpperCase()}`;

  doc.setFontSize(10);
  doc.setTextColor(155, 135, 245); // #9b87f5
  doc.text("Certificado de Assinatura Eletrônica", pageW / 2, 15, { align: "center" });
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  doc.text(`Protocolo: ${protocolo}`, pageW / 2, 22, { align: "center" });

  // Imagem da assinatura centralizada
  doc.addImage(assinaturaBase64, "PNG", (pageW - 70) / 2, 28, 70, 30);

  // Linha e texto "Assinado digitalmente por..."
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text("__________________________________________", pageW / 2, 65, { align: "center" });
  doc.text(
    `Assinado eletronicamente via SensoriAI por ${dadosSeguranca.nome || "Signatário"} em ${dadosSeguranca.data}`,
    pageW / 2,
    72,
    { align: "center" }
  );

  // Rodapé de auditoria
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `Documento assinado digitalmente | IP: ${dadosSeguranca.ip || "—"} | Timestamp: ${dadosSeguranca.data} | ID: ${dadosSeguranca.docId} | Hash: ${dadosSeguranca.hash}`,
    margin,
    88,
    { maxWidth: pageW - 2 * margin }
  );

  return doc;
}

/**
 * Gera PDF rascunho (apenas conteúdo) a partir de HTML. Usa um elemento temporário para html2canvas.
 */
export async function gerarPdfRascunho(htmlContent: string, _titulo: string): Promise<jsPDF> {
  const [{ jsPDF: JsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);
  const temp = document.createElement("div");
  temp.innerHTML = htmlContent || "<p>Sem conteúdo.</p>";
  temp.style.position = "fixed";
  temp.style.left = "-9999px";
  temp.style.top = "0";
  temp.style.width = "800px";
  temp.style.background = "#fff";
  temp.style.padding = "20px";
  temp.style.fontFamily = "Arial, sans-serif";
  document.body.appendChild(temp);

  try {
    const canvas = await html2canvas(temp, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });
    document.body.removeChild(temp);

    const doc = new JsPDF("p", "mm", "a4");
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 10;
    const contentW = pageW - 2 * margin;
    const imgData = canvas.toDataURL("image/png");
    const imgH = (canvas.height * contentW) / canvas.width;
    const contentAreaH = pageH - 2 * margin;

    let remaining = imgH;
    let pageIndex = 0;
    while (remaining > 0) {
      if (pageIndex > 0) doc.addPage();
      const y = margin - (imgH - remaining);
      doc.addImage(imgData, "PNG", margin, y, contentW, imgH);
      remaining -= contentAreaH;
      pageIndex++;
    }
    return doc;
  } catch {
    document.body.removeChild(temp);
    throw new Error("Erro ao gerar PDF.");
  }
}
