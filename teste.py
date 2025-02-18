import re
import tkinter as tk
from tkinter import filedialog

import pdfplumber
import spacy

# Carregar o modelo de língua portuguesa do spacy
nlp = spacy.load("pt_core_news_sm")


def selecionar_pdf():
    caminho_arquivo = filedialog.askopenfilename(filetypes=[("Arquivos PDF", "*.pdf")])
    if caminho_arquivo:
        processar_pdf(caminho_arquivo)


def separar_palavras(texto):
    # Primeiro, tenta separar usando uma expressão regular simples
    texto_separado = re.sub(
        r"([A-Za-z])(\d)", r"\1 \2", texto
    )  # separa letras de números

    # Depois, tenta uma segmentação com spacy para separar as palavras corretamente
    doc = nlp(texto_separado)
    return " ".join([token.text for token in doc])


def processar_pdf(caminho):
    with pdfplumber.open(caminho) as pdf:
        capturar = False
        data_atual = ""
        for pagina in pdf.pages:
            linhas = pagina.extract_text().split("\n")
            for linha in linhas:
                if "SALDOEM" in linha:
                    capturar = True
                if capturar:
                    partes = linha.split()
                    if len(partes) >= 3 and re.search(r"\d", partes[-1]):
                        if re.match(r"\d{2}/\d{2}", partes[0]):
                            data_atual = partes[0]
                            descricao = " ".join(partes[1:-1])
                        else:
                            descricao = " ".join(partes[:-1])

                        # Remover "-" da descrição
                        descricao = descricao.replace("-", "").strip()

                        # Separar as palavras corretamente
                        descricao = separar_palavras(descricao)

                        # Ajustar valores negativos
                        valor = partes[-1]
                        if valor.endswith("-"):
                            valor = "-" + valor[:-1]

                        print(f"{data_atual};{descricao};{valor}")


# Criar a interface gráfica
root = tk.Tk()
root.withdraw()  # Oculta a janela principal
selecionar_pdf()
