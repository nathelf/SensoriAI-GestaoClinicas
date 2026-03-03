"""
SensoriAI Document Engine - Microserviço FastAPI para conversão e geração de documentos.
Conversão PDF <-> Word com alta fidelidade e limpeza automática de temporários.
"""
import base64
import hashlib
import shutil
import uuid
from io import BytesIO
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel

app = FastAPI(
    title="SensoriAI Document Engine",
    description="Conversão PDF↔Word e geração de documentos para a SensoriAI",
    version="1.0.0",
)

# CORS para o frontend (React) em desenvolvimento e produção
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = Path("temp_files")
TEMP_DIR.mkdir(exist_ok=True)


def _cleanup(*paths: Path) -> None:
    """Remove arquivos temporários de forma segura."""
    for p in paths:
        try:
            if p.exists():
                p.unlink()
        except OSError:
            pass


class SignedPdfRequest(BaseModel):
    """Payload para geração de PDF com certificado de assinatura."""

    content: str  # Conteúdo do documento (texto ou HTML simplificado)
    signature_base64: str  # Imagem da assinatura em base64 (data:image/png;base64,... ou só base64)
    nome: str = ""
    data: str = ""
    ip: str = ""
    doc_id: str = ""


@app.post("/convert/pdf-to-word")
async def pdf_to_word(file: UploadFile = File(...)):
    """Converte PDF para Word (.docx) com alta fidelidade (pdf2docx)."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="O arquivo deve ser um PDF.")

    file_id = str(uuid.uuid4())
    pdf_path = TEMP_DIR / f"{file_id}.pdf"
    docx_path = TEMP_DIR / f"{file_id}.docx"

    try:
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="O arquivo PDF está vazio.")
        pdf_path.write_bytes(content)
    except HTTPException:
        raise
    except Exception as e:
        _cleanup(pdf_path)
        raise HTTPException(status_code=400, detail=f"Erro ao salvar arquivo: {str(e)}")

    try:
        from pdf2docx import Converter

        cv = Converter(str(pdf_path))
        cv.convert(str(docx_path), start=0, end=None)
        cv.close()
    except Exception as e:
        _cleanup(pdf_path, docx_path)
        msg = str(e).replace("\n", " ")
        raise HTTPException(
            status_code=500,
            detail=f"Erro na conversão PDF→Word. O PDF pode estar protegido ou ser apenas imagem. Tente outro arquivo. Detalhe: {msg[:200]}",
        )

    _cleanup(pdf_path)
    if not docx_path.exists():
        raise HTTPException(status_code=500, detail="Conversão não gerou arquivo Word.")

    out_bytes = docx_path.read_bytes()
    _cleanup(docx_path)
    out_name = (file.filename or "documento").replace(".pdf", "").replace(".PDF", "") + ".docx"
    return Response(
        content=out_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{out_name}"'},
    )


@app.post("/convert/word-to-pdf")
async def word_to_pdf(file: UploadFile = File(...)):
    """Converte Word (.docx) para PDF. Requer LibreOffice (Linux/Mac) ou Word (Windows) para docx2pdf."""
    if not file.filename or not file.filename.lower().endswith(".docx"):
        raise HTTPException(status_code=400, detail="O arquivo deve ser um .docx.")

    file_id = str(uuid.uuid4())
    docx_path = TEMP_DIR / f"{file_id}.docx"
    pdf_path = TEMP_DIR / f"{file_id}.pdf"

    try:
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="O arquivo Word está vazio.")
        docx_path.write_bytes(content)
    except HTTPException:
        raise
    except Exception as e:
        _cleanup(docx_path)
        raise HTTPException(status_code=400, detail=f"Erro ao salvar arquivo: {str(e)}")

    try:
        from docx2pdf import convert as docx2pdf_convert

        docx2pdf_convert(str(docx_path), str(pdf_path))
    except Exception as e:
        _cleanup(docx_path, pdf_path)
        raise HTTPException(
            status_code=500,
            detail=f"Erro na conversão Word→PDF. Instale LibreOffice (Linux/Mac) ou use a conversão no navegador. Detalhe: {str(e)}",
        )

    if not pdf_path.exists():
        _cleanup(docx_path)
        raise HTTPException(status_code=500, detail="Arquivo PDF não foi gerado.")

    out_bytes = pdf_path.read_bytes()
    _cleanup(docx_path, pdf_path)
    out_name = (file.filename or "documento").replace(".docx", "").replace(".DOCX", "") + ".pdf"
    return Response(
        content=out_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{out_name}"'},
    )


def _build_signed_pdf_bytes(body: "SignedPdfRequest") -> bytes:
    """Gera PDF com conteúdo e página de certificado de assinatura (ReportLab)."""
    import re

    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.lib.units import mm
    from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer

    buffer = BytesIO()
    doc_id = body.doc_id or str(uuid.uuid4())
    payload = f"{body.content}|{doc_id}|{body.data}"
    doc_hash = hashlib.sha256(payload.encode("utf-8")).hexdigest()[:16]

    sig_b64 = body.signature_base64
    if "," in sig_b64:
        sig_b64 = sig_b64.split(",", 1)[1]
    try:
        sig_img_bytes = base64.b64decode(sig_b64)
    except Exception:
        sig_img_bytes = b""

    page_w, page_h = A4
    margin = 25 * mm
    content_w = page_w - 2 * margin

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=margin,
        rightMargin=margin,
        topMargin=margin,
        bottomMargin=margin,
    )
    styles = getSampleStyleSheet()
    normal = styles["Normal"]
    text = re.sub(r"<[^>]+>", " ", body.content or "Sem conteúdo.").strip()
    text = re.sub(r"\s+", " ", text) or "Sem conteúdo."
    parts = [Paragraph(p.replace("&", "&amp;"), normal) for p in text.split("\n") if p.strip()]
    if not parts:
        parts = [Paragraph(text.replace("&", "&amp;"), normal)]

    # Página de certificado como flowables
    protocolo = f"SENTINEL-{doc_id[:8].upper()}"
    parts.append(Spacer(1, 20 * mm))
    parts.append(
        Paragraph(
            '<para align="center"><font size="14" color="#9b87f5"><b>Certificado de Assinatura Eletrônica</b></font></para>',
            normal,
        )
    )
    parts.append(Paragraph(f'<para align="center">Protocolo: {protocolo}</para>', normal))
    parts.append(Spacer(1, 8 * mm))
    if sig_img_bytes:
        try:
            img = Image(BytesIO(sig_img_bytes), width=70 * mm, height=30 * mm)
            img.hAlign = "CENTER"
            parts.append(img)
        except Exception:
            pass
    parts.append(Spacer(1, 6 * mm))
    parts.append(
        Paragraph(
            f'<para align="center">__________________________________________</para>',
            normal,
        )
    )
    parts.append(
        Paragraph(
            f'<para align="center">Assinado eletronicamente via SensoriAI por {body.nome or "Signatário"} em {body.data}</para>',
            normal,
        )
    )
    parts.append(Spacer(1, 10 * mm))
    audit = f"Documento assinado digitalmente | IP: {body.ip or '—'} | Timestamp: {body.data} | ID: {doc_id} | Hash: {doc_hash}"
    parts.append(Paragraph(f'<font size="7" color="#666666">{audit[:200]}</font>', normal))

    doc.build(parts)
    buffer.seek(0)
    return buffer.getvalue()


@app.post("/generate/signed-pdf")
async def generate_signed_pdf(body: SignedPdfRequest):
    """Gera PDF com certificado de auditoria e assinatura (imagem + rodapé com IP, timestamp, hash)."""
    try:
        pdf_bytes = _build_signed_pdf_bytes(body)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar PDF assinado: {str(e)}")
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="documento-assinado.pdf"'},
    )


@app.get("/health")
async def health():
    """Health check para load balancers e monitoramento."""
    return {"status": "ok", "service": "SensoriAI Document Engine"}


@app.on_event("shutdown")
def shutdown():
    """Limpa diretório temporário ao encerrar."""
    try:
        if TEMP_DIR.exists():
            shutil.rmtree(TEMP_DIR, ignore_errors=True)
    except Exception:
        pass
