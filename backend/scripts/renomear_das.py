import sys
import pdfplumber
import os
import re
import json
import unicodedata


def sanitize_filename(name):
    """Remove caracteres inválidos e normaliza o nome do arquivo."""
    name = unicodedata.normalize('NFKD', name).encode(
        'ASCII', 'ignore').decode('ASCII')
    name = re.sub(r'[^a-zA-Z0-9\-_ ]', '', name)
    return name.strip()


def get_unique_filename(directory, base_name):
    """Garante que o nome do arquivo seja único."""
    filename = f"{base_name}.pdf"
    filepath = os.path.join(directory, filename)

    if not os.path.exists(filepath):
        return filename

    counter = 1
    while os.path.exists(filepath):
        filename = f"{base_name} ({counter}).pdf"
        filepath = os.path.join(directory, filename)
        counter += 1

    return filename


def renomear_das(caminho_pasta, adicionar_data, incluir_subpastas):
    try:

        for root, _, files in os.walk(caminho_pasta):
            for file in files:
                if file.lower().endswith(".pdf"):
                    pdf_path = os.path.join(root, file)

                    # Verifica se o arquivo existe antes de abrir
                    if not os.path.exists(pdf_path):
                        continue

                    # Abre o PDF e extrai o texto
                    with pdfplumber.open(pdf_path) as pdf:
                        if len(pdf.pages) == 0:
                            continue

                        primeira_pagina = pdf.pages[0]
                        texto_extraido = primeira_pagina.extract_text()

                        if not texto_extraido:
                            continue

                        linhas = texto_extraido.split("\n")

                    if len(linhas) < 6:
                        continue

                    partes_linha4 = linhas[3].split()
                    nome = " ".join(partes_linha4[1:]) if len(
                        partes_linha4) > 1 else "SemNome"
                    nome = sanitize_filename(nome)

                    if adicionar_data:
                        partes_linha6 = linhas[5].split()
                        if partes_linha6:
                            mes_ano = partes_linha6[0]
                            mes_ano = mes_ano.replace("Janeiro", "01").replace("Fevereiro", "02").replace("Março", "03").replace("Abril", "04").replace("Maio", "05") \
                                .replace("Junho", "06").replace("Julho", "07").replace("Agosto", "08").replace("Setembro", "09").replace("Outubro", "10") \
                                .replace("Novembro", "11").replace("Dezembro", "12").replace("/", "")

                            if len(partes_linha6) > 1:
                                nome += f" - {mes_ano}"

                    if not nome.strip():
                        continue

                    novo_nome = get_unique_filename(root, nome)
                    novo_caminho = os.path.join(root, novo_nome)

                    os.rename(pdf_path, novo_caminho)

            if not incluir_subpastas:
                break

        return {"status": "success", "message": "Arquivos renomeados com sucesso!"}
    except Exception as e:
        return {"status": "fail", "message": f"Erro ao processar os PDFs: {e}"}


def main():
    if sys.argv[1] == 'renomear_das':
        caminho_pasta = sys.argv[2]
        adicionar_data = sys.argv[3].lower() == 'true'
        incluir_subpastas = sys.argv[4].lower() == 'true'
        result = renomear_das(caminho_pasta, adicionar_data, incluir_subpastas)
        print(json.dumps(result))


if __name__ == '__main__':
    main()
