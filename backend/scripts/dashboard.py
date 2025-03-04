import sys
import pandas as pd
import json
from datetime import datetime

def processar_relatorio_empresas():
    try:
        # Caminho fixo da planilha
        caminho_planilha = r"S:\CONTABIL\CONTABILIDADE 2025\RELAÇÃO DE EMPRESAS\PERÍODO CONTÁBIL 2025.xlsx"

        # Lê a planilha em modo de leitura
        df = pd.read_excel(caminho_planilha, engine="openpyxl")

        # Define as colunas relevantes
        meses = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"]
        colunas_relevantes = ["SEGMENTO"] + meses

        # Filtra as colunas relevantes
        df_filtrado = df[colunas_relevantes]

        # Identifica o mês atual e o mês anterior
        mes_atual = datetime.now().month  # 1 = JAN, 2 = FEV, ..., 12 = DEZ
        mes_anterior = meses[mes_atual - 2] if mes_atual > 1 else meses[11]  # FEV se MAR, DEZ se JAN

        # Lista de siglas possíveis
        siglas = ["DG", "L", "MP", "SM", "N", "PI", "PC"]

        # Dicionário para armazenar as contagens
        contagens = {
            "INDÚSTRIAS": {sigla: 0 for sigla in siglas},
            "COMÉRCIOS": {sigla: 0 for sigla in siglas},
            "SUPERMERCADOS": {sigla: 0 for sigla in siglas},
            "EXPRESS": {sigla: 0 for sigla in siglas},
        }

        # Contagem total de empresas
        total_empresas = 0

        # Itera sobre as linhas da planilha
        for _, row in df_filtrado.iterrows():
            segmento = row["SEGMENTO"]
            sigla = row[mes_anterior]  # Pega a sigla do mês anterior
            if segmento in contagens and sigla in siglas:
                contagens[segmento][sigla] += 1
            total_empresas += 1

        # Retorna as contagens em formato JSON
        return {"status": "success", "data": contagens, "total_empresas": total_empresas}

    except Exception as e:
        return {"status": "fail", "message": f"Erro ao processar a planilha: {e}"}

def main():
    if len(sys.argv) > 1 and sys.argv[1] == "processar_relatorio_empresas":
        result = processar_relatorio_empresas()
        print(json.dumps(result))

if __name__ == "__main__":
    main()