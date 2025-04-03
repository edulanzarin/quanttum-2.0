import json
import re
import sys
import tkinter as tk
from tkinter import filedialog

import pdfplumber
import unicodedata
from xml.etree import ElementTree as ET
import pandas as pd  # Adicionado para salvar em Excel


def normalizar_texto(texto):
    if texto:
        texto = unicodedata.normalize("NFKC", texto)
        texto = texto.encode("utf-8", "ignore").decode("utf-8")
        return texto.strip()
    return ""


def salvar_dados(nome_sugerido):
    try:
        root = tk.Tk()
        root.withdraw()  # Não exibe a janela principal do Tkinter
        root.attributes("-topmost", 1)  # Mantém a janela de diálogo no topo
        root.after(100, lambda: root.attributes("-topmost", 0))

        caminho_arquivo = filedialog.asksaveasfilename(
            initialfile=nome_sugerido,
            defaultextension=".xlsx",  # Alterado para .xlsx
            filetypes=[("Excel files", "*.xlsx"), ("All files", "*.*")]  # Atualizado para Excel
        )

        root.destroy()  # Fecha a janela do Tkinter corretamente
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


def processar_ofx(caminho, numero_banco):
    try:
        with open(caminho, 'r', encoding='utf-8') as file:
            ofx_content = file.read()

        # Remove o cabeçalho do OFX para processar apenas o XML
        ofx_xml_start = ofx_content.find("<OFX>")
        if ofx_xml_start == -1:
            return {"status": "fail", "message": "Formato OFX inválido: seção XML não encontrada."}

        ofx_xml = ofx_content[ofx_xml_start:]

        # Parse o XML
        root = ET.fromstring(ofx_xml)

        dados = []

        for stmttrn in root.findall(".//STMTTRN"):
            dtposted = stmttrn.find("DTPOSTED").text[:8]  # Extrai YYYYMMDD
            data = f"{dtposted[:4]}-{dtposted[4:6]}-{dtposted[6:8]}"
            trnamt = stmttrn.find("TRNAMT").text.replace(",", ".")
            memo = stmttrn.find("MEMO").text if stmttrn.find("MEMO") is not None else ""
            
            # Verifica se é débito ou crédito com base no valor
            debito = numero_banco if float(trnamt) > 0 else ""
            credito = numero_banco if float(trnamt) < 0 else ""

            dados.append([data, debito, credito, trnamt, memo])

        return salvar_arquivo_ofx(dados)

    except Exception as e:
        return {"status": "fail", "message": f"Erro ao processar o OFX: {e}"}


def salvar_arquivo(dados):
    if dados:
        caminho_arquivo = salvar_dados("santander_dois.xlsx")
        if caminho_arquivo:
            # Cria um DataFrame com os dados
            df = pd.DataFrame(dados, columns=["Data", "Descrição", "Valor"])
            # Salva o DataFrame em um arquivo Excel
            df.to_excel(caminho_arquivo, index=False)
            return {"status": "success", "message": "Arquivo Excel gerado com sucesso!"}
    else:
        return {"status": "fail", "message": "Nenhum dado encontrado."}


def salvar_arquivo_ofx(dados):
    if dados:
        caminho_arquivo = salvar_dados("extrato.xlsx")
        if caminho_arquivo:
            # Cria um DataFrame com os dados
            df = pd.DataFrame(dados, columns=["Data", "Débito", "Crédito", "Valor", "Descrição"])
            # Salva o DataFrame em um arquivo Excel
            df.to_excel(caminho_arquivo, index=False)
            return {"status": "success", "message": "Arquivo Excel gerado com sucesso!"}
    else:
        return {"status": "fail", "message": "Nenhum dado encontrado."}


def gerenciar_bancos(banco, numero_banco, caminho_pdf):
    if banco == "santander_dois":
        return processar_santander_dois(caminho_pdf)
    elif banco == "ofx":
        return processar_ofx(caminho_pdf, numero_banco)
    else:
        return {"status": "fail", "message": "Banco não suportado."}


def main():
    banco = sys.argv[1]
    numero_banco = sys.argv[2]
    caminho_pdf = sys.argv[3]
    result = gerenciar_bancos(banco, numero_banco, caminho_pdf)
    print(json.dumps(result))


if __name__ == "__main__":
    main()