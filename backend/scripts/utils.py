import tkinter as tk
from tkinter import filedialog

def selecionar_arquivo():
    # Cria uma instância da janela raiz (não será exibida)
    root = tk.Tk()
    root.withdraw()  

    # Abre o file dialog e retorna o caminho do arquivo selecionado
    caminho_arquivo = filedialog.askopenfilename(
        title="Escolha um arquivo",
        filetypes=[("Todos os arquivos", "*.*"), ("Arquivos PDF", "*.pdf")]
    )

    return caminho_arquivo
