import sys
import pdfplumber
import re
import csv
import json
import unicodedata
import tkinter as tk
from tkinter import filedialog

# Função para normalizar o texto e remover caracteres problemáticos
def normalizar_texto(texto):
    if texto:
        texto = unicodedata.normalize("NFKC", texto)  # Normaliza caracteres Unicode
        texto = texto.encode("utf-8", "ignore").decode("utf-8")  # Garante que está em UTF-8 válido
        return texto.strip()
    return ""

# Função para abrir o diálogo de "Salvar Como"
def salvar_dados(nome_sugerido):
    try:
        root = tk.Tk()
        root.withdraw()  # Não exibe a janela principal do Tkinter
        root.attributes("-topmost", 1)  # Mantém a janela de diálogo no topo
        root.after(100, lambda: root.attributes("-topmost", 0))  # Remove o topo após 100ms para normalizar

        caminho_arquivo = filedialog.asksaveasfilename(
            initialfile=nome_sugerido,
            defaultextension=".csv",
            filetypes=[("CSV files", "*.csv"), ("All files", "*.*")]
        )

        root.destroy()  # Fecha a janela do Tkinter corretamente
        return caminho_arquivo if caminho_arquivo else None
    except Exception:
        return None

def processar_pagos_chocoleite(caminho_pdf):
    try:
        with pdfplumber.open(caminho_pdf) as pdf:
            dados = []
            fornecedores_unicos = set()

            cnpj_pattern = r'\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}'
            cpf_pattern = r'\d{3}\.\d{3}\.\d{3}-\d{2}'
            numero_pattern = r'\b\d{3,}\b'
            valor_pattern = r'\d{1,3}(?:\.\d{3})*,\d{2}'
            data_pattern = r'\d{2}/\d{2}/\d{4}'

            for pagina in pdf.pages:
                texto = normalizar_texto(pagina.extract_text())
                if not texto:
                    continue

                linhas = texto.split('\n')
                for linha in linhas:
                    linha = normalizar_texto(linha)
                    match_cnpj = re.search(cnpj_pattern, linha)
                    match_cpf = re.search(cpf_pattern, linha)

                    if match_cnpj or match_cpf:
                        documento_encontrado = match_cnpj.group() if match_cnpj else match_cpf.group()
                        texto_depois_documento = linha[max(match_cnpj.end() if match_cnpj else 0, match_cpf.end() if match_cpf else 0):].strip()

                        match_numero = re.search(numero_pattern, texto_depois_documento)
                        if match_numero:
                            fornecedor = normalizar_texto(texto_depois_documento[:match_numero.start()])
                            numero = match_numero.group()
                            
                            datas_encontradas = list(re.finditer(data_pattern, linha))
                            if datas_encontradas:
                                ultima_data = datas_encontradas[-1]
                                pos_apos_ultima_data = ultima_data.end()

                                valores = list(re.finditer(valor_pattern, linha))
                                valor_aberto = None
                                for match_valor in valores:
                                    if match_valor.start() > pos_apos_ultima_data:
                                        valor_aberto = match_valor.group()
                                        break

                                if valor_aberto:
                                    dados.append([fornecedor, documento_encontrado, numero, valor_aberto])
                                    fornecedores_unicos.add(fornecedor)

            if dados:
                caminho_arquivo = salvar_dados("pagos.csv")
                if caminho_arquivo:
                    with open(caminho_arquivo, mode='w', newline='', encoding='utf-8-sig') as file:
                        writer = csv.writer(file, delimiter=';', quoting=csv.QUOTE_MINIMAL)
                        writer.writerow(['Fornecedor', 'Documento', 'Número', 'Valor'])
                        writer.writerows(dados)

                caminho_arquivo_fornecedores = salvar_dados("fornecedores.csv")
                if caminho_arquivo_fornecedores:
                    with open(caminho_arquivo_fornecedores, mode='w', newline='', encoding='utf-8-sig') as file:
                        writer = csv.writer(file, delimiter=';', quoting=csv.QUOTE_MINIMAL)
                        writer.writerow(['Fornecedor'])
                        for fornecedor in fornecedores_unicos:
                            writer.writerow([fornecedor])

                return {"status": "success", "message": "Arquivos CSV gerados com sucesso!"}
            else:
                return {"status": "fail", "message": "Nenhum dado encontrado."}
    except Exception as e:
        return {"status": "fail", "message": f"Erro ao processar o PDF: {e}"}

def processar_recebidos_chocoleite(caminho_pdf):
    try:
        with pdfplumber.open(caminho_pdf) as pdf:
            dados = []
            clientes_unicos = set()
            cliente_atual = None  

            cnpj_pattern = r'\d{2,3}\.\d{3}\.\d{3}/\d{4}-\d{2}'
            cpf_pattern = r'\d{3,4}\.\d{3}\.\d{3}-\d{2}'

            for pagina in pdf.pages:
                texto = normalizar_texto(pagina.extract_text())
                if not texto:
                    continue
                linhas = texto.split('\n')

                for linha in linhas:
                    linha = normalizar_texto(linha)
                    if "Totais" in linha and cliente_atual:
                        partes = linha.split()
                        if len(partes) > 1:
                            valor_cliente = normalizar_texto(partes[-4])
                            dados.append([cliente_atual, valor_cliente])
                        cliente_atual = None
                        continue

                    partes = linha.split()
                    if len(partes) < 10:
                        continue

                    match_cnpj = re.match(cnpj_pattern, partes[0]) or (re.match(cnpj_pattern, partes[1]) if len(partes) > 1 else None)
                    match_cpf = re.match(cpf_pattern, partes[0]) or (re.match(cpf_pattern, partes[1]) if len(partes) > 1 else None)

                    if match_cnpj or match_cpf:
                        if len(partes[2]) > 10:
                            cliente = " ".join(partes[2:4])
                        else:
                            cliente = " ".join(partes[2:5])

                        cliente = re.sub(r'\d+', '', cliente)
                        cliente = re.sub(r'[()\-]+', '', cliente)
                        cliente = normalizar_texto(cliente)

                        cliente_atual = cliente
                        clientes_unicos.add(cliente)

            caminho_arquivo = salvar_dados("recebidos.csv")
            if caminho_arquivo and dados:
                with open(caminho_arquivo, mode='w', newline='', encoding='utf-8-sig') as file:
                    writer = csv.writer(file, delimiter=';', quoting=csv.QUOTE_MINIMAL)
                    writer.writerow(['Cliente', 'Valor'])
                    writer.writerows(dados)

            caminho_arquivo_clientes = salvar_dados("recebidos_clientes.csv")
            if caminho_arquivo_clientes and clientes_unicos:
                with open(caminho_arquivo_clientes, mode='w', newline='', encoding='utf-8-sig') as file:
                    writer = csv.writer(file, delimiter=';', quoting=csv.QUOTE_MINIMAL)
                    writer.writerow(['Cliente'])
                    for cliente in clientes_unicos:
                        writer.writerow([cliente])

            return {"status": "success", "message": "Arquivos CSV gerados com sucesso!"}

    except Exception as e:
        return {"status": "fail", "message": f"Erro ao processar o PDF: {e}"}

def main():
    if sys.argv[1] == 'processar_pagos_chocoleite':
        caminho_pdf = sys.argv[2]
        result = processar_pagos_chocoleite(caminho_pdf)
        print(json.dumps(result))
    if sys.argv[1] == 'processar_recebidos_chocoleite':
        caminho_pdf = sys.argv[2]
        result = processar_recebidos_chocoleite(caminho_pdf)
        print(json.dumps(result))

if __name__ == '__main__':
    main()
