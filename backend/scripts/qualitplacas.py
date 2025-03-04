import csv
import json
import sys
import tkinter as tk
from tkinter import filedialog
import pdfplumber
import unicodedata
import re

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

def processar_safra_qualitplacas(caminho_pdf):
    try:
        dados = []
        with pdfplumber.open(caminho_pdf) as pdf:
            for i, page in enumerate(pdf.pages):
                lines = page.extract_text().split('\n')
                start_line = 6 if i == 0 else 3  # Começa na linha 6 na primeira página, depois na linha 3
                
                j = start_line
                while j < len(lines):
                    line = lines[j]
                    parts = line.split()
                    
                    # Verifica se a linha tem mais de 7 partes e se a primeira parte é uma data
                    if len(parts) > 7 and re.match(r'\d{2}/\d{2}/\d{4}', parts[0]):
                        data = parts[0]
                        valor = parts[-2]
                        
                        # Verifica se o valor não é zero
                        if valor.replace(',', '.') not in ['0.00', '0.0', '0']:
                            # Extrai a descrição da próxima linha (ou linhas)
                            descricao_completa = ""
                            nota = "0"  # Valor padrão para a nota fiscal
                            k = j + 1
                            while k < len(lines):
                                descricao_line = lines[k]
                                nota_match = re.search(r'DOC\.:(\d+)-', descricao_line)
                                cedente_match = re.search(r'CEDENTE:\s*(\d+-)?(.+)', descricao_line)
                                
                                if cedente_match:
                                    descricao = cedente_match.group(2).strip()
                                    descricao = re.sub(r'\d+', '', descricao).strip()
                                    if nota_match:
                                        nota = nota_match.group(1)  # Atualiza a nota se encontrada
                                    descricao_completa = f"{descricao} - NF {nota}"
                                    break  # Sai do loop após encontrar a descrição
                                k += 1
                            
                            if descricao_completa:
                                dados.append([data, valor, descricao_completa])
                    j += 1

        # Salvar os dados em um arquivo CSV
        nome_sugerido = "dados_extraidos.csv"
        caminho_arquivo = salvar_dados(nome_sugerido)
        
        if caminho_arquivo:
            with open(caminho_arquivo, mode='w', newline='', encoding='utf-8-sig') as file:
                writer = csv.writer(file, delimiter=';', quoting=csv.QUOTE_MINIMAL)
                writer.writerow(["Data", "Valor", "Descrição"])
                writer.writerows(dados)
            
            return {"status": "success", "message": "Arquivo CSV gerado com sucesso!"}
        else:
            return {"status": "fail", "message": "Nenhum arquivo selecionado para salvar."}

    except Exception as e:
        return {"status": "fail", "message": f"Erro ao processar o PDF: {e}"}

def main():
    if len(sys.argv) > 2 and sys.argv[1] == "processar_safra_qualitplacas":
        caminho_pdf = sys.argv[2]
        result = processar_safra_qualitplacas(caminho_pdf)
        print(json.dumps(result))

if __name__ == "__main__":
    main()