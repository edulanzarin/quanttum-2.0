import sys
import pdfplumber
import re
import csv
import json
import tkinter as tk
from tkinter import filedialog

# Função para abrir o diálogo de "Salvar Como" e escolher o local para salvar o arquivo
def salvar_dados():
    try:
        root = tk.Tk()
        root.withdraw()  # Oculta a janela principal
        root.attributes("-topmost", 1)  # Mantém a janela no topo
        root.after(100, lambda: root.attributes("-topmost", 0))  # Remove o topo após 100ms para normalizar

        caminho_arquivo = filedialog.asksaveasfilename(
            defaultextension=".csv",
            filetypes=[("CSV files", "*.csv"), ("All files", "*.*")]
        )

        return caminho_arquivo if caminho_arquivo else None
    except Exception as e:
        return {"status": "fail", "message": f"Erro ao abrir o diálogo para salvar o arquivo: {e}"}

def processar_pagos_chocoleite(caminho_pdf):
    try:
        with pdfplumber.open(caminho_pdf) as pdf:
            dados = []
            for pagina in pdf.pages:
                texto = pagina.extract_text()

                # Regex para identificar padrões
                cnpj_pattern = r'\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}'
                cpf_pattern = r'\d{3}\.\d{3}\.\d{3}-\d{2}'
                numero_pattern = r'\b\d{3,}\b'
                valor_pattern = r'\d{1,3}(?:\.\d{3})*,\d{2}'
                data_pattern = r'\d{2}/\d{2}/\d{4}'

                linhas = texto.split('\n')
                for linha in linhas:
                    match_cnpj = re.search(cnpj_pattern, linha)
                    match_cpf = re.search(cpf_pattern, linha)

                    if match_cnpj or match_cpf:
                        documento_encontrado = match_cnpj.group() if match_cnpj else match_cpf.group()
                        texto_depois_documento = linha[max(match_cnpj.end() if match_cnpj else 0, match_cpf.end() if match_cpf else 0):].strip()

                        match_numero = re.search(numero_pattern, texto_depois_documento)
                        if match_numero:
                            fornecedor = texto_depois_documento[:match_numero.start()].strip()
                            numero = match_numero.group()

                            # Encontrar todas as datas na linha
                            datas_encontradas = list(re.finditer(data_pattern, linha))
                            if datas_encontradas:
                                # Pegar a posição da última data na linha
                                ultima_data = datas_encontradas[-1]
                                pos_apos_ultima_data = ultima_data.end()

                                # Procurar o primeiro valor depois da última data
                                valores = list(re.finditer(valor_pattern, linha))
                                valor_aberto = None
                                for match_valor in valores:
                                    if match_valor.start() > pos_apos_ultima_data:
                                        valor_aberto = match_valor.group()
                                        break  # Pega apenas o primeiro valor após a última data

                                if valor_aberto:
                                    dados.append([fornecedor, numero, valor_aberto])

            if dados:
                caminho_arquivo = salvar_dados()
                
                if caminho_arquivo:
                    with open(caminho_arquivo, mode='w', newline='', encoding='utf-8') as file:
                        writer = csv.writer(file, delimiter=';', quoting=csv.QUOTE_MINIMAL)
                        writer.writerow(['Fornecedor', 'Número', 'Valor'])
                        for dado in dados:
                            writer.writerow(dado)
                    return {"status": "success", "message": f"Dados salvos em {caminho_arquivo}"}
                else:
                    return {"status": "fail", "message": "Salvar arquivo cancelado pelo usuário."}
            else:
                return {"status": "fail", "message": "Nenhum dado encontrado."}
    except Exception as e:
        return {"status": "fail", "message": f"Erro ao processar o PDF: {e}"}

def main():
    if sys.argv[1] == 'processar_pagos_chocoleite':
        caminho_pdf = sys.argv[2]
        result = processar_pagos_chocoleite(caminho_pdf)
        print(json.dumps(result))

if __name__ == '__main__':
    main()
