import sys
import json
import pandas as pd
import tkinter as tk
from tkinter import filedialog
import os


def selecionar_pasta_salvamento():
    """Abre o seletor de pastas para definir onde salvar os arquivos TXT."""
    root = tk.Tk()
    root.withdraw()  # Não exibe a janela principal do Tkinter

    # Tenta garantir que a janela de diálogo sempre abra em cima
    root.attributes('-topmost', 1)  # Força o foco na janela
    # Remove o foco após 100ms para normalizar
    root.after(100, lambda: root.attributes('-topmost', 0))

    pasta = filedialog.askdirectory(
        title="Selecione a pasta para salvar os arquivos")

    root.destroy()  # Fecha a janela Tkinter

    return pasta


def formatar_data(data):
    """Converte datas para o formato DDMMAAAA sem barras."""
    return pd.to_datetime(data, dayfirst=True, errors='coerce').dt.strftime('%d%m%Y')


def salvar_txt(df, pasta, nome_arquivo):
    if df is not None and pasta:
        caminho_txt = os.path.join(pasta, nome_arquivo)
        df["VALOR"] = df["VALOR"].apply(lambda x: f"{x:.2f}".replace(".", ","))
        df.to_csv(caminho_txt, index=False, sep=';', encoding='utf-8')
        return True
    return False


def processar_caixa_debito(df_debito):
    df_filtrado = df_debito[df_debito.iloc[:, 5] == 5]
    if df_filtrado.empty:
        return None
    return pd.DataFrame({
        "DATA": formatar_data(df_filtrado.iloc[:, 2]),
        "DEBITO": 1496,
        "CREDITO": 5,
        "VALOR": pd.to_numeric(df_filtrado.iloc[:, 6], errors='coerce'),
        "DESCRICAO": df_filtrado.iloc[:, 8]
    })


def processar_descontos_obtidos(df_debito):
    df_filtrado = df_debito[df_debito.iloc[:, 5] == 2858]
    if df_filtrado.empty:
        return None

    df_com_5 = df_filtrado[df_filtrado.iloc[:, 4] == 5]
    df_sem_5 = df_filtrado[df_filtrado.iloc[:, 4] != 5]

    dfs = []

    # Caso sem o valor 5 na coluna 4
    if not df_sem_5.empty:
        dfs.append(pd.DataFrame({
            "DATA": formatar_data(df_sem_5.iloc[:, 2]),
            "DEBITO": 1496,
            "CREDITO": 2858,
            "VALOR": pd.to_numeric(df_sem_5.iloc[:, 6], errors='coerce'),
            "DESCRICAO": df_sem_5.iloc[:, 8]
        }))

    # Caso com o valor 5 na coluna 4
    if not df_com_5.empty:
        dfs.append(pd.DataFrame({
            "DATA": formatar_data(df_com_5.iloc[:, 2]),
            "DEBITO": 5,
            "CREDITO": 2858,
            "VALOR": pd.to_numeric(df_com_5.iloc[:, 6], errors='coerce'),
            "DESCRICAO": df_com_5.iloc[:, 8]
        }))

    return pd.concat(dfs) if dfs else None


def processar_juros_pagos(df_debito):
    df_filtrado = df_debito[df_debito.iloc[:, 4] == 4701]
    if df_filtrado.empty:
        return None

    df_com_5 = df_filtrado[df_filtrado.iloc[:, 5] == 5]
    df_sem_5 = df_filtrado[df_filtrado.iloc[:, 5] != 5]

    dfs = []

    # Caso sem o valor 5 na coluna 5
    if not df_sem_5.empty:
        dfs.append(pd.DataFrame({
            "DATA": formatar_data(df_sem_5.iloc[:, 2]),
            "DEBITO": 4701,
            "CREDITO": 1496,
            "VALOR": pd.to_numeric(df_sem_5.iloc[:, 6], errors='coerce'),
            "DESCRICAO": df_sem_5.iloc[:, 8]
        }))

    # Caso com o valor 5 na coluna 5
    if not df_com_5.empty:
        dfs.append(pd.DataFrame({
            "DATA": formatar_data(df_com_5.iloc[:, 2]),
            "DEBITO": 4701,
            "CREDITO": 5,
            "VALOR": pd.to_numeric(df_com_5.iloc[:, 6], errors='coerce'),
            "DESCRICAO": df_com_5.iloc[:, 8]
        }))

    return pd.concat(dfs) if dfs else None


def processar_debito_2r(caminho_debito):
    try:
        df_debito = pd.read_excel(caminho_debito)

        pasta_salvar = selecionar_pasta_salvamento()
        if not pasta_salvar:
            return {"status": "erro", "message": "Nenhuma pasta selecionada."}

        sucesso = False

        if salvar_txt(processar_caixa_debito(df_debito), pasta_salvar, "caixa_pagos.txt"):
            sucesso = True
        if salvar_txt(processar_descontos_obtidos(df_debito), pasta_salvar, "descontos_obtidos.txt"):
            sucesso = True
        if salvar_txt(processar_juros_pagos(df_debito), pasta_salvar, "juros_pagos.txt"):
            sucesso = True

        return {"status": "success", "message": "Arquivos TXT gerados com sucesso!"} if sucesso else {"status": "erro", "message": "Nenhum dado foi processado."}
    except Exception as e:
        return {"status": "erro", "message": str(e)}


def processar_caixa_credito(df_credito):
    df_filtrado = df_credito[df_credito.iloc[:, 4] == 5]
    if df_filtrado.empty:
        return None

    return pd.DataFrame({
        "DATA": formatar_data(df_filtrado.iloc[:, 2]),
        "DEBITO": 5,
        "CREDITO": 142,
        "VALOR": pd.to_numeric(df_filtrado.iloc[:, 6], errors='coerce'),
        "DESCRICAO": df_filtrado.iloc[:, 8]
    })


def processar_descontos_concedidos(df_credito):
    df_filtrado = df_credito[df_credito.iloc[:, 4] == 4697]
    if df_filtrado.empty:
        return None

    df_com_5 = df_filtrado[df_filtrado.iloc[:, 5] == 5]
    df_sem_5 = df_filtrado[df_filtrado.iloc[:, 5] != 5]

    dfs = []

    if not df_sem_5.empty:
        dfs.append(pd.DataFrame({
            "DATA": formatar_data(df_sem_5.iloc[:, 2]),
            "DEBITO": 4697,
            "CREDITO": 142,
            "VALOR": pd.to_numeric(df_sem_5.iloc[:, 6], errors='coerce'),
            "DESCRICAO": df_sem_5.iloc[:, 8]
        }))

    if not df_com_5.empty:
        dfs.append(pd.DataFrame({
            "DATA": formatar_data(df_com_5.iloc[:, 2]),
            "DEBITO": 4697,
            "CREDITO": 5,
            "VALOR": pd.to_numeric(df_com_5.iloc[:, 6], errors='coerce'),
            "DESCRICAO": df_com_5.iloc[:, 8]
        }))

    return pd.concat(dfs) if dfs else None


def processar_juros_recebidos(df_credito):
    df_filtrado = df_credito[df_credito.iloc[:, 5] == 2860]
    if df_filtrado.empty:
        return None

    df_com_5 = df_filtrado[df_filtrado.iloc[:, 4] == 5]
    df_sem_5 = df_filtrado[df_filtrado.iloc[:, 4] != 5]

    dfs = []

    if not df_sem_5.empty:
        dfs.append(pd.DataFrame({
            "DATA": formatar_data(df_sem_5.iloc[:, 2]),
            "DEBITO": 142,
            "CREDITO": 2860,
            "VALOR": pd.to_numeric(df_sem_5.iloc[:, 6], errors='coerce'),
            "DESCRICAO": df_sem_5.iloc[:, 8]
        }))

    if not df_com_5.empty:
        dfs.append(pd.DataFrame({
            "DATA": formatar_data(df_com_5.iloc[:, 2]),
            "DEBITO": 5,
            "CREDITO": 2860,
            "VALOR": pd.to_numeric(df_com_5.iloc[:, 6], errors='coerce'),
            "DESCRICAO": df_com_5.iloc[:, 8]
        }))

    return pd.concat(dfs) if dfs else None


def processar_credito_2r(caminho_credito):
    try:
        df_credito = pd.read_excel(caminho_credito)

        pasta_salvar = selecionar_pasta_salvamento()
        if not pasta_salvar:
            return {"status": "erro", "message": "Nenhuma pasta selecionada."}

        sucesso = False

        if salvar_txt(processar_caixa_credito(df_credito), pasta_salvar, "caixa_recebidos.txt"):
            sucesso = True
        if salvar_txt(processar_descontos_concedidos(df_credito), pasta_salvar, "descontos_concedidos.txt"):
            sucesso = True
        if salvar_txt(processar_juros_recebidos(df_credito), pasta_salvar, "juros_recebidos.txt"):
            sucesso = True

        return {"status": "success", "message": "Arquivos TXT gerados com sucesso!"} if sucesso else {"status": "erro", "message": "Nenhum dado foi processado."}
    except Exception as e:
        return {"status": "erro", "message": str(e)}


def main():
    if sys.argv[1] == 'processar_debito_2r':
        caminho_debito = sys.argv[2]
        result = processar_debito_2r(caminho_debito)
        print(json.dumps(result))
    elif sys.argv[1] == 'processar_credito_2r':
        caminho_credito = sys.argv[2]
        result = processar_credito_2r(caminho_credito)
        print(json.dumps(result))


if __name__ == '__main__':
    main()
