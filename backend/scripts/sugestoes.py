import sys
import os
from datetime import datetime
import json

# Caminho base para salvar as sugestões
CAMINHO_SUGESTOES = r"P:\PUBLICO 2025\CONTABIL\EDUARDO\Automatizações\Quanttum v2.0\sugest"

def criar_sugestao(id_usuario, texto_sugestao):
    """
    Cria um arquivo .txt com a sugestão do usuário.
    O nome do arquivo será a data e hora exata, e o conteúdo incluirá o id_usuario e a sugestão.
    """
    try:
        # Verifica se o diretório existe, se não, cria
        if not os.path.exists(CAMINHO_SUGESTOES):
            os.makedirs(CAMINHO_SUGESTOES)

        # Gera o nome do arquivo com a data e hora atual
        data_hora = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        nome_arquivo = f"{data_hora}.txt"
        caminho_arquivo = os.path.join(CAMINHO_SUGESTOES, nome_arquivo)

        # Conteúdo do arquivo
        conteudo = f"id_usuario: {id_usuario}\nsugestao: {texto_sugestao}"

        # Salva o arquivo
        with open(caminho_arquivo, "w", encoding="utf-8") as arquivo:
            arquivo.write(conteudo)

        return json.dumps({
            "status": "success",
            "message": f"Sugestão salva com sucesso em {caminho_arquivo}",
        })

    except Exception as e:
        return json.dumps({
            "status": "fail",
            "message": f"Erro ao salvar sugestão: {str(e)}",
        })

def obter_sugestoes():
    """
    Obtém todas as sugestões salvas no diretório e retorna como uma lista de dicionários.
    """
    try:
        sugestoes = []

        # Verifica se o diretório existe
        if not os.path.exists(CAMINHO_SUGESTOES):
            return json.dumps({
                "status": "success",
                "sugestoes": [],
                "message": "Nenhuma sugestão encontrada.",
            })

        # Itera sobre todos os arquivos no diretório
        for nome_arquivo in os.listdir(CAMINHO_SUGESTOES):
            caminho_arquivo = os.path.join(CAMINHO_SUGESTOES, nome_arquivo)

            # Lê o conteúdo do arquivo
            with open(caminho_arquivo, "r", encoding="utf-8") as arquivo:
                conteudo = arquivo.read()

            # Extrai o id_usuario e a sugestão
            id_usuario = conteudo.split("\n")[0].split(": ")[1]
            sugestao = conteudo.split("\n")[1].split(": ")[1]

            # Adiciona à lista de sugestões
            sugestoes.append({
                "id_usuario": id_usuario,
                "sugestao": sugestao,
                "data_hora": nome_arquivo.replace(".txt", ""),
            })

        return json.dumps({
            "status": "success",
            "sugestoes": sugestoes,
            "message": f"{len(sugestoes)} sugestões encontradas.",
        })

    except Exception as e:
        return json.dumps({
            "status": "fail",
            "message": f"Erro ao obter sugestões: {str(e)}",
        })

def main():
    if sys.argv[1] == 'obter_sugestoes':
        result = obter_sugestoes()
        print(result)
    
    elif sys.argv[1] == 'criar_sugestao':
        id_usuario = sys.argv[2]
        texto_sugestao = sys.argv[3]
        result = criar_sugestao(id_usuario, texto_sugestao)
        print(result)

if __name__ == "__main__":
    main()