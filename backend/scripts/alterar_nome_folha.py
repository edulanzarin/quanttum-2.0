import sys
import os
import json
import PyPDF2

def verificar_renomeacao(caminho):
    """Garante que o arquivo não sobrescreva outro, adicionando um sufixo se necessário."""
    if not os.path.exists(caminho):
        return caminho

    base, ext = os.path.splitext(caminho)
    contador = 1

    while os.path.exists(f"{base} ({contador}){ext}"):
        contador += 1

    return f"{base} ({contador}){ext}"

def normalizar_caminho(caminho):
    """Normaliza o caminho do arquivo."""
    return os.path.normpath(caminho)

def extrair_info_primeira_linha(caminho_pdf):
    """Extrai a primeira linha de um arquivo PDF."""
    try:
        with open(caminho_pdf, "rb") as arquivo_pdf:
            leitor = PyPDF2.PdfReader(arquivo_pdf)
            primeira_pagina = leitor.pages[0]
            texto = primeira_pagina.extract_text()
            primeira_linha = texto.split("\n")[0]
            return primeira_linha.strip()
    except Exception as e:
        raise Exception(f"Erro ao ler o PDF {caminho_pdf}: {e}")

def formatar_nome_arquivo(primeira_linha, incluir_numero):
    """Formata o nome do arquivo com base na primeira linha do PDF."""
    partes = primeira_linha.split(" Demonstrativo de Pagamento")
    if len(partes) < 1:
        raise ValueError("Formato da primeira linha inválido.")

    numero_nome = partes[0]
    if incluir_numero:
        # Inclui o número e substitui "-" por "_"
        numero_nome = numero_nome.replace("-", "_")
    else:
        # Remove o número e mantém apenas o nome
        numero_nome = numero_nome.split("-", 1)[-1].strip()

    return numero_nome

def alterar_nome_folha(caminho, incluir_numero):
    """Altera o nome dos arquivos PDF com base na primeira linha."""
    try:
        if not os.path.exists(caminho):
            return json.dumps({"status": "fail", "message": f"Caminho não encontrado: {caminho}"})

        arquivos_processados = []

        for item in os.listdir(caminho):
            caminho_item = os.path.join(caminho, item)
            if os.path.isfile(caminho_item) and item.lower().endswith(".pdf"):
                try:
                    # Extrai a primeira linha do PDF
                    primeira_linha = extrair_info_primeira_linha(caminho_item)
                    # Formata o nome do arquivo
                    novo_nome = formatar_nome_arquivo(primeira_linha, incluir_numero)
                    novo_caminho = os.path.join(caminho, f"{novo_nome}.pdf")
                    # Verifica se o nome já existe e renomeia se necessário
                    novo_caminho = verificar_renomeacao(novo_caminho)
                    # Renomeia o arquivo
                    os.rename(caminho_item, novo_caminho)
                    arquivos_processados.append(novo_caminho)
                except Exception as e:
                    print(f"Erro ao processar o arquivo {item}: {e}")

        return json.dumps({
            "status": "success",
            "message": f"Arquivos renomeados: {', '.join(arquivos_processados)}"
        })

    except Exception as e:
        return json.dumps({"status": "fail", "message": f"Erro ao processar os arquivos: {e}"})

def main():
    if sys.argv[1] == 'alterar_nome_folha':
        caminho = sys.argv[2]
        incluir_numeros = sys.argv[3].lower() == 'true'
        result = alterar_nome_folha(caminho, incluir_numeros)
        print(result)

if __name__ == '__main__':
    main()