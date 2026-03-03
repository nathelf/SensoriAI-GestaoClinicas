# SensoriAI Document Engine (Python)

Microserviço FastAPI para conversão de documentos (PDF ↔ Word) com alta fidelidade.

## Requisitos

- Python 3.10+
- **PDF → Word:** biblioteca `pdf2docx` (incluída).
- **Word → PDF:** `docx2pdf` usa **LibreOffice** no Linux/Mac ou **Microsoft Word** no Windows. Instale o LibreOffice se estiver em Linux/Mac:
  - Ubuntu/Debian: `sudo apt install libreoffice`
  - macOS: `brew install libreoffice`

## Ambiente virtual (recomendado)

```bash
# Na pasta backend
cd backend

# Criar venv
python -m venv venv

# Ativar
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

## Executar

```bash
# Com o venv ativado
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

O serviço ficará em **http://localhost:8000**. Documentação interativa: **http://localhost:8000/docs**.

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/convert/pdf-to-word` | Envia um PDF; retorna arquivo .docx para download. |
| POST | `/convert/word-to-pdf` | Envia um .docx; retorna arquivo PDF para download. |
| GET | `/health` | Health check. |

## Integração com o frontend

No projeto React (SensoriAI), configure a variável de ambiente para apontar para este serviço:

- **.env** ou **.env.local**: `VITE_DOCUMENT_API_URL=http://localhost:8000`

Se não estiver definida, o frontend usa a conversão no navegador (mammoth para .docx; PDF→Word só via Python).

## Segurança

- Arquivos são gravados em `temp_files/` com UUID e removidos após o envio da resposta.
- Em produção, use um proxy (nginx) e limite tamanho de upload e CORS às origens permitidas.
