import csv
import json
import re
import sys
import tkinter as tk
from tkinter import filedialog

import pdfplumber
import unicodedata


def normalizar_texto(texto):
    if texto:
        texto = unicodedata.normalize("NFKC", texto)
        texto = texto.encode("utf-8", "ignore").decode("utf-8")
        return texto.strip()
    return ""


def salvar_dados(nome_sugerido):
    try:
        root = tk.Tk()
        root.withdraw()
        root.attributes("-topmost", 1)
        root.after(100, lambda: root.attributes("-topmost", 0))

        caminho_arquivo = filedialog.asksaveasfilename(
            initialfile=nome_sugerido,
            defaultextension=".csv",
            filetypes=[("CSV files", "*.csv"), ("All files", "*.*")],
        )

        root.destroy()
        return caminho_arquivo if caminho_arquivo else None
    except Exception:
        return None


def processar_santander_dois(caminho):
    try:
        with pdfplumber.open(caminho) as pdf:
            dados = []
            capturar = False
            contador_saldoem = 0  # Contador para "SALDOEM"
            data_atual = ""

            for pagina in pdf.pages:
                texto = normalizar_texto(pagina.extract_text())
                if not texto:
                    continue

                linhas = texto.split("\n")
                for linha in linhas:
                    if "SALDOEM" in linha:
                        contador_saldoem += 1
                        if (
                            contador_saldoem == 2
                        ):  # Se for o segundo "SALDOEM", para tudo
                            return salvar_arquivo(dados)

                        capturar = True  # Começa a capturar após o primeiro "SALDOEM"

                    if capturar:
                        partes = linha.split()
                        if len(partes) >= 3 and re.search(r"\d", partes[-1]):
                            if re.match(r"\d{2}/\d{2}", partes[0]):
                                data_atual = partes[0]
                                descricao = " ".join(partes[1:-1])
                            else:
                                descricao = " ".join(partes[:-1])

                            descricao = descricao.replace("-", "").strip()
                            valor = partes[-1]
                            if valor.endswith("-"):
                                valor = "-" + valor[:-1]

                            dados.append([data_atual, descricao, valor])

            return salvar_arquivo(dados)

    except Exception as e:
        return {"status": "fail", "message": f"Erro ao processar o PDF: {e}"}


def salvar_arquivo(dados):
    if dados:
        caminho_arquivo = salvar_dados("santander_dois.csv")
        if caminho_arquivo:
            with open(
                caminho_arquivo, mode="w", newline="", encoding="utf-8-sig"
            ) as file:
                writer = csv.writer(file, delimiter=";", quoting=csv.QUOTE_MINIMAL)
                writer.writerow(["Data", "Descrição", "Valor"])
                writer.writerows(dados)
        return {"status": "success", "message": "Arquivo CSV gerado com sucesso!"}
    else:
        return {"status": "fail", "message": "Nenhum dado encontrado."}


def gerenciar_bancos(banco, caminho_pdf):
    if banco == "santander_dois":
        return processar_santander_dois(caminho_pdf)
    else:
        return {"status": "fail", "message": "Banco não suportado."}


def main():
    banco = sys.argv[1]
    caminho_pdf = sys.argv[2]
    result = gerenciar_bancos(banco, caminho_pdf)
    print(json.dumps(result))


if __name__ == "__main__":
    main()
