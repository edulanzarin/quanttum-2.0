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

def gerar_import():
    try:
        

            return {"status": "success", "message": "Arquivos CSV gerados com sucesso!"}

    except Exception as e:
        return {"status": "fail", "message": f"Erro ao processar o PDF: {e}"}

def main():
    if sys.argv[1] == 'gerar_import':
        result = gerar_import()
        print(json.dumps(result))


if __name__ == '__main__':
    main()
