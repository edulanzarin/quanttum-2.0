import sys
import json
import pandas as pd
import tkinter as tk
import os
from tkinter import filedialog

# Caminho fixo do arquivo JSON
CAMINHO_JSON = os.path.join(os.path.dirname(__file__), '..', 'database', 'dcondor.json')

def carregar_json():
    with open(CAMINHO_JSON, "r", encoding="utf-8") as file:
        return json.load(file)

def verificar_contabilidade(nota, descricao, valor, contabilidade_df):
    # Converte a nota para string
    nota_str = str(nota)

    # Tenta encontrar a correspondência da nota fiscal com o padrão da contabilidade
    # Formatar a nota com zeros à esquerda para todos os comprimentos possíveis até 9 dígitos
    for i in range(6, 10):  # Tentando de 6 a 9 dígitos
        nota_formatada = nota_str.zfill(i)
        
        # Filtrando contabilidade_df de forma vetorizada para verificar se essa nota existe na contabilidade
        mask = contabilidade_df.iloc[:, 6].str.contains('|'.join(descricao)) & contabilidade_df.iloc[:, 6].str.contains(nota_formatada)
        
        matching_rows = contabilidade_df[mask]
        
        if not matching_rows.empty:
            # Retorna o índice da linha correspondente, não o valor total
            return matching_rows.index[0]
    
    # Se não encontrar correspondência
    return None

# Função para abrir a janela de diálogo e escolher onde salvar o arquivo CSV
def selecionar_caminho_salvamento():
    root = tk.Tk()
    root.withdraw()  # Oculta a janela principal do tkinter
    root.attributes("-topmost", 1)  # Mantém a janela de diálogo no topo
    root.after(100, lambda: root.attributes("-topmost", 0))  # Remove o topo após 100ms para normalizar

    caminho = filedialog.asksaveasfilename(
        defaultextension=".csv",
        filetypes=[("CSV files", "*.csv")],
        title="Escolher onde salvar o arquivo"
    )

    return caminho


def processar_planilhas(caminho_livros_fiscais, caminho_contabilidade_gerencial):
    cfops = carregar_json()
    
    # Carregar as planilhas
    livros_fiscais_df = pd.read_excel(caminho_livros_fiscais)
    contabilidade_df = pd.read_excel(caminho_contabilidade_gerencial)

    linhas_encontradas = []
    indices_remover_fiscais = []
    indices_remover_contabilidade = []

    for cfop, descricoes in cfops.items():
        for descricao in descricoes:
            # Buscar as linhas correspondentes diretamente
            linhas_livros_fiscais = livros_fiscais_df[livros_fiscais_df.iloc[:, 6] == int(cfop)]
            
            # Agrupar por número de nota para somar os valores
            grupo_notas = linhas_livros_fiscais.groupby(linhas_livros_fiscais.iloc[:, 2])  # Agrupa pelo número da nota fiscal
            
            for numero_nota, grupo in grupo_notas:
                valor_total_nota = grupo.iloc[:, 12].sum()  # Somando os valores das notas fiscais agrupadas
                linha_contabilidade_idx = verificar_contabilidade(numero_nota, descricao, valor_total_nota, contabilidade_df)

                if linha_contabilidade_idx is not None:
                    # Acessar a linha com o índice retornado
                    linhas_encontradas.append(contabilidade_df.iloc[linha_contabilidade_idx])
                    indices_remover_fiscais.extend(grupo.index)  # Marca todas as linhas do grupo para remover
                    indices_remover_contabilidade.append(linha_contabilidade_idx)
    
    livros_fiscais_df.drop(indices_remover_fiscais, inplace=True)
    contabilidade_df.drop(indices_remover_contabilidade, inplace=True)

    if linhas_encontradas:
        caminho_csv = selecionar_caminho_salvamento()
        if caminho_csv:
            resultado_df = pd.DataFrame(linhas_encontradas)
            resultado_df.to_csv(caminho_csv, index=False, sep=";")

            livros_fiscais_df.to_excel(caminho_csv.replace(".csv", "_livros_fiscais.xlsx"), index=False)
            contabilidade_df.to_excel(caminho_csv.replace(".csv", "_contabilidade.xlsx"), index=False)

            return {"status": "success", "caminho_csv": caminho_csv}
        else:
            return {"status": "erro", "mensagem": "Nenhum arquivo foi selecionado para salvar."}
    else:
        return {"status": "erro", "mensagem": "Nenhuma linha correspondente encontrada."}

    
def obter_cfop():
    try:
        if not os.path.exists(CAMINHO_JSON):
            return {"success": False, "message": "Arquivo JSON não encontrado."}

        with open(CAMINHO_JSON, "r", encoding="utf-8") as file:
            conteudo_bruto = file.read()
        
        cfops = json.loads(conteudo_bruto)

        if not cfops:
            return {"success": False, "message": "Arquivo JSON está vazio!"}

        cfop_lista = [{"cfop": k, "descricao": ", ".join(v)} for k, v in cfops.items()]
        
        return {"success": True, "cfops": cfop_lista}

    except FileNotFoundError:
        return {"success": False, "message": "Arquivo JSON não encontrado."}
    except json.JSONDecodeError as e:
        return {"success": False, "message": "Erro ao decodificar o arquivo JSON."}

def adicionar_cfop(cfop, referencia):
    try:
        # Verifica se o arquivo JSON existe
        if not os.path.exists(CAMINHO_JSON):
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
            # Se a CFOP já existe, adiciona a nova descrição à lista existente
            if referencia not in cfops[cfop]:
                cfops[cfop].append(referencia)
        else:
            # Se a CFOP não existe, cria uma nova entrada com a descrição
            cfops[cfop] = [referencia]

        # Salva o arquivo com o novo CFOP adicionado
        with open(CAMINHO_JSON, "w", encoding="utf-8") as file:
            json.dump(cfops, file, ensure_ascii=False, indent=2)

        return {"success": True, "message": "CFOP adicionado com sucesso."}

    except FileNotFoundError:
        return {"success": False, "message": "Arquivo JSON não encontrado."}
    except json.JSONDecodeError as e:
        return {"success": False, "message": "Erro ao decodificar o arquivo JSON."}
    except Exception as e:
        return {"success": False, "message": str(e)}
    
def apagar_cfop(cfop):
    try:
        # Verifica se o arquivo JSON existe
        if not os.path.exists(CAMINHO_JSON):
            return {"success": False, "message": "Arquivo JSON não encontrado."}

        # Abre o arquivo JSON e carrega os dados
        with open(CAMINHO_JSON, "r", encoding="utf-8") as file:
            conteudo_bruto = file.read()

        # Se o arquivo estiver vazio, inicializa o dicionário vazio
        if conteudo_bruto.strip() == "":
            return {"success": False, "message": "Arquivo JSON está vazio."}

        cfops = json.loads(conteudo_bruto)

        # Verifica se a CFOP existe para remover
        if cfop not in cfops:
            return {"success": False, "message": "CFOP não encontrada."}

        # Remove a CFOP
        del cfops[cfop]

        # Salva o arquivo com a CFOP removida
        with open(CAMINHO_JSON, "w", encoding="utf-8") as file:
            json.dump(cfops, file, ensure_ascii=False, indent=2)

        return {"success": True, "message": "CFOP removida com sucesso."}

    except FileNotFoundError:
        return {"success": False, "message": "Arquivo JSON não encontrado."}
    except json.JSONDecodeError as e:
        return {"success": False, "message": "Erro ao decodificar o arquivo JSON."}
    except Exception as e:
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

    elif sys.argv[1] == 'adicionar_cfop':
        cfop = sys.argv[2]
        referencia = sys.argv[3]
        result = adicionar_cfop(cfop, referencia)
        print(json.dumps(result)) 
        
    elif sys.argv[1] == 'apagar_cfop':
        cfop = sys.argv[2]
        result = apagar_cfop(cfop)
        print(json.dumps(result))

if __name__ == '__main__':
    main()