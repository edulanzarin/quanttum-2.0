import csv
import json
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


def processar_pagos_qualitplacas(caminho_pdf):
    try:
        with pdfplumber.open(caminho_pdf) as pdf:
            dados = []
            for pagina in pdf.pages:
                tabela = pagina.extract_table()
                if tabela:
                    for linha in tabela:
                        if linha and len(linha) >= 7:
                            (
                                data,
                                conta,
                                nome_conta,
                                hist,
                                nome_hist,
                                credito,
                                debito,
                                saldo,
                            ) = linha[:8]
                            credito = normalizar_texto(credito).replace(",", ".")
                            debito = normalizar_texto(debito).replace(",", ".")
                            if debito and debito != "0.00":
                                dados.append(
                                    [
                                        data,
                                        conta,
                                        nome_conta,
                                        hist,
                                        nome_hist,
                                        credito,
                                        debito,
                                        saldo,
                                    ]
                                )

        if not dados:
            return {"status": "fail", "message": "Nenhuma linha com débito encontrada."}

        caminho_csv = salvar_dados("dados_filtrados.csv")
        if not caminho_csv:
            return {"status": "fail", "message": "Usuário cancelou a operação."}

        with open(caminho_csv, "w", newline="", encoding="utf-8") as arquivo_csv:
            escritor = csv.writer(arquivo_csv, delimiter=";")
            escritor.writerow(
                [
                    "Data",
                    "Conta",
                    "Nome Conta",
                    "Histórico",
                    "Nome Histórico",
                    "Crédito",
                    "Débito",
                    "Saldo",
                ]
            )
            escritor.writerows(dados)

        return {"status": "success", "message": "Arquivo CSV gerado com sucesso!"}

    except Exception as e:
        return {"status": "fail", "message": f"Erro ao processar o PDF: {e}"}


def main():
    if len(sys.argv) > 2 and sys.argv[1] == "processar_pagos_qualitplacas":
        caminho_pdf = sys.argv[2]
        result = processar_pagos_qualitplacas(caminho_pdf)
        print(json.dumps(result))


if __name__ == "__main__":
    main()
