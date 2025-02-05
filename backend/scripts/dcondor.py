import sys
import json
import pandas as pd
import tkinter as tk
import os
from tkinter import filedialog

# Caminho fixo do arquivo JSON
CAMINHO_JSON = "backend/database/dcondor.json"

# Função para carregar o arquivo JSON
def carregar_json():
    with open(CAMINHO_JSON, "r", encoding="utf-8") as file:
        return json.load(file)

# Função para verificar se o número da nota e o valor são encontrados na Contabilidade Gerencial
def verificar_contabilidade(nota, descricao, valor, contabilidade_df):
    nota_formatada = str(nota).zfill(9)  # Formatar o número da nota para 9 dígitos
    for idx, row in contabilidade_df.iterrows():
        # Verificar se o CFOP (descrição), número da nota e o valor são correspondentes
        if descricao in str(row.iloc[6]) and nota_formatada in str(row.iloc[6]) and float(valor) == float(row.iloc[5]):  # Acessa a coluna 6 (índice 5) para o valor
            return idx  # Retorna o índice da linha correspondente
    return None

# Função para abrir a janela de diálogo e escolher onde salvar o arquivo CSV
def selecionar_caminho_salvamento():
    root = tk.Tk()
    root.withdraw()  # Oculta a janela principal do tkinter
    caminho = filedialog.asksaveasfilename(
        defaultextension=".csv",
        filetypes=[("CSV files", "*.csv")],
        title="Escolher onde salvar o arquivo"
    )
    return caminho

def processar_planilhas(caminho_livros_fiscais, caminho_contabilidade_gerencial):
    # Carregar o arquivo JSON
    cfops = carregar_json()
    
    # Carregar as planilhas
    livros_fiscais_df = pd.read_excel(caminho_livros_fiscais)
    contabilidade_df = pd.read_excel(caminho_contabilidade_gerencial)

    linhas_encontradas = []
    indices_remover_fiscais = []
    indices_remover_contabilidade = []

    # Processar cada CFOP no JSON
    for cfop, descricao in cfops.items():
        # Buscar o CFOP na coluna 7 (índice 6) de Livros Fiscais
        linhas_livros_fiscais = livros_fiscais_df[livros_fiscais_df.iloc[:, 6] == int(cfop)]
        
        for idx, linha in linhas_livros_fiscais.iterrows():
            numero_nota = linha.iloc[2]  # Número da nota fiscal na coluna 3 (índice 2)
            valor_nota = linha.iloc[12]  # Valor da nota fiscal na coluna M (índice 12)

            # Buscar a linha correspondente na Contabilidade Gerencial, com verificação de valor
            linha_contabilidade_idx = verificar_contabilidade(numero_nota, descricao, valor_nota, contabilidade_df)

            if linha_contabilidade_idx is not None:
                # Adicionar a linha de Contabilidade Gerencial ao resultado
                linhas_encontradas.append(contabilidade_df.iloc[linha_contabilidade_idx])

                # Adicionar os índices das linhas a serem removidas
                indices_remover_fiscais.append(idx)
                indices_remover_contabilidade.append(linha_contabilidade_idx)

    # Remover as linhas encontradas
    livros_fiscais_df = livros_fiscais_df.drop(indices_remover_fiscais)
    contabilidade_df = contabilidade_df.drop(indices_remover_contabilidade)

    # Salvar o CSV com as linhas encontradas
    if linhas_encontradas:
        caminho_csv = selecionar_caminho_salvamento()  # Solicita ao usuário onde salvar o arquivo CSV
        if caminho_csv:
            resultado_df = pd.DataFrame(linhas_encontradas)
            resultado_df.to_csv(caminho_csv, index=False, sep=";")  # Definir o delimitador como ponto e vírgula

            # Salvar as planilhas "Livros Fiscais" e "Contabilidade Gerencial" sem as linhas encontradas
            caminho_livros_fiscais_novo = caminho_csv.replace(".csv", "_livros_fiscais.xlsx")
            caminho_contabilidade_novo = caminho_csv.replace(".csv", "_contabilidade.xlsx")

            livros_fiscais_df.to_excel(caminho_livros_fiscais_novo, index=False)
            contabilidade_df.to_excel(caminho_contabilidade_novo, index=False)

            return {"status": "sucesso", "caminho_csv": caminho_csv, "livros_fiscais_novo": caminho_livros_fiscais_novo, "contabilidade_novo": caminho_contabilidade_novo}
        else:
            return {"status": "erro", "mensagem": "Nenhum arquivo foi selecionado para salvar."}
    else:
        return {"status": "erro", "mensagem": "Nenhuma linha correspondente encontrada."}
    
def obter_cfop():
    try:
        if not os.path.exists(CAMINHO_JSON):
            print(f"Arquivo JSON não encontrado: {CAMINHO_JSON}", file=sys.stderr)
            return {"success": False, "message": "Arquivo JSON não encontrado."}

        with open(CAMINHO_JSON, "r", encoding="utf-8") as file:
            conteudo_bruto = file.read()
        
        cfops = json.loads(conteudo_bruto)

        if not cfops:
            print("Arquivo JSON está vazio!", file=sys.stderr)
            return {"success": False, "message": "Arquivo JSON está vazio!"}

        cfop_lista = [{"cfop": k, "descricao": v} for k, v in cfops.items()]
        
        return {"success": True, "cfops": cfop_lista}

    except FileNotFoundError:
        return {"success": False, "message": "Arquivo JSON não encontrado."}
    except json.JSONDecodeError as e:
        print(f"Erro ao decodificar JSON: {e}", file=sys.stderr)
        return {"success": False, "message": "Erro ao decodificar o arquivo JSON."}

def adicionar_cfop(cfop, referencia):
    try:
        # Verifica se o arquivo JSON existe
        if not os.path.exists(CAMINHO_JSON):
            print(f"Arquivo JSON não encontrado: {CAMINHO_JSON}", file=sys.stderr)
            return {"success": False, "message": "Arquivo JSON não encontrado."}

        # Abre o arquivo JSON e carrega os dados
        with open(CAMINHO_JSON, "r", encoding="utf-8") as file:
            conteudo_bruto = file.read()

        # Se o arquivo estiver vazio, inicializa o dicionário vazio
        if conteudo_bruto.strip() == "":
            cfops = {}
        else:
            cfops = json.loads(conteudo_bruto)

        # Adiciona a nova CFOP
        if cfop in cfops:
            return {"success": False, "message": "CFOP já existe no arquivo."}
        
        cfops[cfop] = referencia

        # Salva o arquivo com o novo CFOP adicionado
        with open(CAMINHO_JSON, "w", encoding="utf-8") as file:
            json.dump(cfops, file, ensure_ascii=False, indent=2)

        return {"success": True, "message": "CFOP adicionado com sucesso."}

    except FileNotFoundError:
        return {"success": False, "message": "Arquivo JSON não encontrado."}
    except json.JSONDecodeError as e:
        print(f"Erro ao decodificar JSON: {e}", file=sys.stderr)
        return {"success": False, "message": "Erro ao decodificar o arquivo JSON."}
    except Exception as e:
        print(f"Erro inesperado: {e}", file=sys.stderr)
        return {"success": False, "message": str(e)}

def main():
    if sys.argv[1] == 'processar_planilhas':
        caminho_livros_fiscais = sys.argv[2]
        caminho_contabilidade_gerencial = sys.argv[3]
        result = processar_planilhas(caminho_livros_fiscais, caminho_contabilidade_gerencial)
        print(json.dumps(result))
    
    elif sys.argv[1] == 'obter_cfop':
        result = obter_cfop()
        print(json.dumps(result))  
        sys.stderr.flush()
        sys.stdout.flush()

    elif sys.argv[1] == 'adicionar_cfop':
        cfop = sys.argv[2]
        referencia = sys.argv[3]
        result = adicionar_cfop(cfop, referencia)
        print(json.dumps(result)) 
        sys.stderr.flush()
        sys.stdout.flush()

if __name__ == '__main__':
    main()
