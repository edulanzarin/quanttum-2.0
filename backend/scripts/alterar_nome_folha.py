import sys
import os
import json
import PyPDF2
import re

def sanitizar_nome_arquivo(nome):
    """Substitui caracteres inválidos no nome do arquivo."""
    # Remove caracteres inválidos e substitui por "_"
    nome = re.sub(r'[<>:"/\\|?*]', '_', nome)
    # Remove espaços no início e no fim
    nome = nome.strip()
    # Limita o tamanho do nome do arquivo (evita problemas com caminhos longos)
    nome = nome[:200]  # Limite arbitrário para evitar problemas
    return nome

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

def extrair_info_pdf(caminho_pdf):
    """Extrai informações do PDF com base no modelo."""
    try:
        with open(caminho_pdf, "rb") as arquivo_pdf:
            leitor = PyPDF2.PdfReader(arquivo_pdf)
            primeira_pagina = leitor.pages[0]
            texto = primeira_pagina.extract_text()
            linhas = texto.split("\n")

            # Verifica se é o modelo "RELAÇÃO DE LÍQUIDOS"
            if len(linhas) > 0 and "RELAÇÃO DE LÍQUIDOS" in linhas[0]:
                # Extrai o nome e número da empresa da linha 4
                if len(linhas) > 3:
                    return linhas[3].strip(), "relacao_liquidos"
                else:
                    raise ValueError("Formato do PDF inválido: linha 4 não encontrada.")
            elif len(linhas) > 0 and "Demonstrativo de Pagamento" in linhas[0]:
                # Mantém a lógica original para outros modelos
                return linhas[0].strip(), "demonstrativo_pagamento"
            else:
                # Ignora arquivos que não seguem nenhum dos modelos
                return None, None
    except Exception as e:
        raise Exception(f"Erro ao ler o PDF {caminho_pdf}: {e}")

def formatar_nome_arquivo(info_pdf, modelo, incluir_numero):
    """Formata o nome do arquivo com base nas informações extraídas do PDF."""
    if modelo == "relacao_liquidos":
        # Remove o CNPJ (tudo após o último espaço)
        info_pdf = re.sub(r'\s+\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$', '', info_pdf)
        # Extrai o número e o nome da empresa
        partes = info_pdf.split(" ")
        numero = partes[0]
        nome = " ".join(partes[1:])
        if incluir_numero:
            return f"{numero}-{nome} - Relação de Líquidos"
        else:
            return f"{nome} - Relação de Líquidos"
    elif modelo == "demonstrativo_pagamento":
        # Remove "Demonstrativo de Pagamento" do nome do arquivo
        info_pdf = info_pdf.replace("Demonstrativo de Pagamento", "")
        # Remove espaços extras
        info_pdf = info_pdf.strip()
        # Formata o nome do arquivo
        if incluir_numero:
            # Inclui o número e substitui "-" por "_"
            info_pdf = info_pdf.replace("-", "_")
            return f"{info_pdf} - Demonstrativo de Pagamento"
        else:
            # Remove o número e mantém apenas o nome
            info_pdf = info_pdf.split("-", 1)[-1].strip()
            return f"{info_pdf} - Demonstrativo de Pagamento"
    else:
        raise ValueError("Modelo de PDF não reconhecido.")

def alterar_nome_folha(caminho, incluir_numero):
    """Altera o nome dos arquivos PDF com base nas informações extraídas."""
    try:
        if not os.path.exists(caminho):
            return json.dumps({"status": "fail", "message": f"Caminho não encontrado: {caminho}"})

        arquivos_processados = []

        for item in os.listdir(caminho):
            caminho_item = os.path.join(caminho, item)
            if os.path.isfile(caminho_item) and item.lower().endswith(".pdf"):
                try:
                    # Extrai as informações do PDF
                    info_pdf, modelo = extrair_info_pdf(caminho_item)
                    if info_pdf is None:
                        continue

                    # Formata o nome do arquivo
                    novo_nome = formatar_nome_arquivo(info_pdf, modelo, incluir_numero)
                    # Sanitiza o nome do arquivo
                    novo_nome = sanitizar_nome_arquivo(novo_nome)
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