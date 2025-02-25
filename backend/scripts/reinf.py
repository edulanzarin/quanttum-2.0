import pandas as pd
import os
import re
import json
from fpdf import FPDF
import sys
import tkinter as tk
from tkinter import filedialog

def normalizar_texto(texto):
    """Normaliza o texto removendo caracteres especiais e espaços extras."""
    if texto:
        texto = str(texto)  # Converte para string
        texto = re.sub(r'[\\/:"*?<>|]', '', texto)
        return texto.strip()
    return ""

def salvar_dados(nome_sugerido):
    """Abre uma janela de diálogo para o usuário escolher onde salvar o arquivo."""
    try:
        root = tk.Tk()
        root.withdraw()  # Não exibe a janela principal do Tkinter
        root.attributes("-topmost", 1)  # Mantém a janela de diálogo no topo
        root.after(100, lambda: root.attributes("-topmost", 0))  # Remove o topo após 100ms

        caminho_arquivo = filedialog.askdirectory(
            title="Escolha a pasta para salvar os PDFs"
        )

        root.destroy()  # Fecha a janela do Tkinter corretamente
        return caminho_arquivo if caminho_arquivo else None
    except Exception as e:
        return None

def gerar_pdfs_reinf(caminho_arquivo):
    try:
        if not os.path.exists(caminho_arquivo):
            return {"status": "fail", "message": "Arquivo não encontrado."}

        # Abre a janela de diálogo para escolher a pasta de saída
        pasta_saida = salvar_dados("PDFs_Gerados")
        if not pasta_saida:
            return {"status": "fail", "message": "Nenhuma pasta selecionada."}

        # Verifica se o arquivo Excel pode ser lido
        try:
            df = pd.read_excel(caminho_arquivo)
        except Exception as e:
            return {"status": "fail", "message": f"Erro ao ler o arquivo Excel: {e}"}

        # Verifica se as colunas necessárias existem
        if df.shape[1] < 3:
            return {"status": "fail", "message": "O arquivo Excel não tem colunas suficientes."}

        cnpjs = df.iloc[:, 1].tolist()
        nmr_empresas = df.iloc[:, 2].tolist()
        headers = df.columns[3:].tolist()

        if not os.path.exists(pasta_saida):
            os.makedirs(pasta_saida)

        # Obtém o diretório do script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        # Constrói o caminho da logo
        logo_path = os.path.join(script_dir, "../../frontend/assets/images/icon.png")

        for index, row in df.iterrows():
            company = row[0]
            cnpj = cnpjs[index]
            nmr_empresa = nmr_empresas[index]

            for header in headers:
                value = row[header]
                if pd.isnull(value):
                    continue
                if "Aluguel" in header and value == "Possui":
                    continue

                pdf = FPDF()
                pdf.add_page()
                pdf.set_auto_page_break(auto=True, margin=15)

                # Configurações de fonte e cores
                pdf.set_font("Helvetica", size=12)
                pdf.set_text_color(0, 0, 0)  # Cor do texto: preto

                # Adicionar logo (com tratamento de erro)
                try:
                    pdf.image(logo_path, x=10, y=10, w=20)  # Logo no canto superior esquerdo, pequena
                except FileNotFoundError:
                    pass  # Continua sem a logo

                # Adicionar título
                pdf.set_font("Helvetica", 'B', 18)
                pdf.set_text_color(0, 51, 102)  # Cor azul escuro
                pdf.cell(0, 30, txt="Relatório de Dados", ln=True, align="C")

                # Adicionar informações da empresa em uma tabela
                pdf.set_font("Helvetica", size=12)
                pdf.set_text_color(0, 0, 0)  # Cor do texto: preto

                # Cabeçalho da tabela
                pdf.set_fill_color(230, 230, 230)  # Cor de fundo cinza claro
                pdf.set_font("Helvetica", 'B', 12)
                pdf.cell(95, 10, txt="Informações", border=1, fill=True)
                pdf.cell(95, 10, txt="Valores", border=1, fill=True, ln=True)

                # Dados da tabela
                pdf.set_font("Helvetica", size=12)
                pdf.cell(95, 10, txt="Empresa", border=1)
                pdf.cell(95, 10, txt=str(company), border=1, ln=True)  # Converte para string
                pdf.cell(95, 10, txt="CNPJ", border=1)
                pdf.cell(95, 10, txt=str(cnpj), border=1, ln=True)  # Converte para string
                pdf.cell(95, 10, txt="Número", border=1)
                pdf.cell(95, 10, txt=str(nmr_empresa), border=1, ln=True)  # Converte para string
                pdf.cell(95, 10, txt=str(header), border=1)  # Converte para string
                pdf.cell(95, 10, txt=str(value), border=1, ln=True)  # Converte para string

                # Rodapé
                pdf.set_y(-15)
                pdf.set_font("Helvetica", 'I', 8)
                pdf.set_text_color(128, 128, 128)  # Cor cinza
                pdf.cell(0, 10, txt="Gerado automaticamente pelo sistema", align="C")

                clean_company_name = normalizar_texto(company)
                clean_header_name = normalizar_texto(header)

                pdf_file_name = f"{clean_company_name} - {clean_header_name}.pdf"
                pdf_path = os.path.join(pasta_saida, pdf_file_name)
                pdf.output(pdf_path)

        return {"status": "success", "message": "PDFs gerados com sucesso!"}

    except Exception as e:
        return {"status": "fail", "message": f"Erro ao gerar PDFs: {e}"}

def main():
    """
    Função principal que recebe os argumentos da linha de comando.
    """
    try:
        if len(sys.argv) != 2:
            print(json.dumps({"status": "fail", "message": "Argumentos inválidos."}))
            return

        caminho_arquivo = sys.argv[1]
        resultado = gerar_pdfs_reinf(caminho_arquivo)
        print(json.dumps(resultado))
    except Exception as e:
        print(json.dumps({"status": "fail", "message": f"Erro inesperado: {str(e)}"}))

if __name__ == "__main__":
    main()