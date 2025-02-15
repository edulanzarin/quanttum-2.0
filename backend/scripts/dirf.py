import sys
import pdfplumber
import re
import csv
import json
import unicodedata
import tkinter as tk
from tkinter import filedialog

# Função para normalizar o texto
def normalizar_texto(texto):
    if texto:
        texto = unicodedata.normalize("NFKC", texto)  # Normaliza caracteres Unicode
        texto = texto.encode("utf-8", "ignore").decode("utf-8")  # Garante UTF-8 válido
        return texto.strip()
    return ""

# Função para salvar arquivo com diálogo do Tkinter
def salvar_dados(nome_sugerido):
    try:
        root = tk.Tk()
        root.withdraw()
        root.attributes("-topmost", 1)
        root.after(100, lambda: root.attributes("-topmost", 0))

        caminho_arquivo = filedialog.asksaveasfilename(
            initialfile=nome_sugerido,
            defaultextension=".csv",
            filetypes=[("CSV files", "*.csv"), ("All files", "*.*")]
        )

        root.destroy()
        return caminho_arquivo if caminho_arquivo else None
    except Exception:
        return None

# Função específica para processar o modelo "cielo"
def processar_cielo(caminho_pdf):
    try:
        with pdfplumber.open(caminho_pdf) as pdf:
            dados = []

            # Itera sobre as páginas do PDF
            for page in pdf.pages:
                tabelas = page.extract_tables()  # Extrai todas as tabelas da página

                for tabela in tabelas:
                    # Exclui a primeira linha (título) e começa a processar a tabela
                    for linha in tabela[1:]:
                        # Assumindo que o CNPJ pode não estar sempre na mesma coluna
                        cnpj = linha[1]  # Ajuste conforme necessário
                        
                        # Verifica os valores de rendimento e IR para os meses
                        rendimentos = linha[2:14]  # Rendimento de Janeiro a Dezembro
                        ir = linha[14:26]  # IR de Janeiro a Dezembro

                        # Garante que a linha tem os 12 valores de rendimento e IR
                        if len(rendimentos) == 12 and len(ir) == 12:
                            dados.append({
                                "CNPJ": cnpj,
                                "JAN": rendimentos[0],
                                "FEV": rendimentos[1],
                                "MAR": rendimentos[2],
                                "ABR": rendimentos[3],
                                "MAI": rendimentos[4],
                                "JUN": rendimentos[5],
                                "JUL": rendimentos[6],
                                "AGO": rendimentos[7],
                                "SET": rendimentos[8],
                                "OUT": rendimentos[9],
                                "NOV": rendimentos[10],
                                "DEZ": rendimentos[11],
                                "IR_JAN": ir[0],
                                "IR_FEV": ir[1],
                                "IR_MAR": ir[2],
                                "IR_ABR": ir[3],
                                "IR_MAI": ir[4],
                                "IR_JUN": ir[5],
                                "IR_JUL": ir[6],
                                "IR_AGO": ir[7],
                                "IR_SET": ir[8],
                                "IR_OUT": ir[9],
                                "IR_NOV": ir[10],
                                "IR_DEZ": ir[11],
                            })

            if dados:
                nome_arquivo = "dirf_cielo.csv"
                caminho_saida = salvar_dados(nome_arquivo)

                if caminho_saida:
                    with open(caminho_saida, mode="w", newline="", encoding="utf-8") as arquivo_csv:
                        colunas = ["CNPJ", "JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ",
                                   "IR_JAN", "IR_FEV", "IR_MAR", "IR_ABR", "IR_MAI", "IR_JUN", "IR_JUL", "IR_AGO", "IR_SET", "IR_OUT", "IR_NOV", "IR_DEZ"]
                        escritor = csv.DictWriter(arquivo_csv, fieldnames=colunas)
                        escritor.writeheader()
                        escritor.writerows(dados)

                    return {"status": "success", "message": f"Arquivo salvo em: {caminho_saida}"}
                else:
                    return {"status": "fail", "message": "Operação cancelada pelo usuário."}
            else:
                return {"status": "fail", "message": "Nenhum dado encontrado."}
    except Exception as e:
        return {"status": "fail", "message": f"Erro ao processar o PDF: {e}"}

# Função principal que chama o modelo apropriado
def processar_dirf(caminho_pdf, modelo):
    if modelo == "cielo":
        return processar_cielo(caminho_pdf)
    else:
        return {"status": "fail", "message": "Modelo não reconhecido."}

# Função para rodar no terminal
def main():
    if len(sys.argv) > 2 and sys.argv[1] == 'processar_dirf':
        caminho_pdf = sys.argv[2]
        modelo = sys.argv[3]
        result = processar_dirf(caminho_pdf, modelo)
        print(json.dumps(result, ensure_ascii=False, indent=4))

if __name__ == '__main__':
    main()
