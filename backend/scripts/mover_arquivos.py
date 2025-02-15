import sys
import os
import shutil
import json

def verificar_renomeacao(caminho):
    """Garante que o arquivo não sobrescreva outro, adicionando um sufixo se necessário."""
    if not os.path.exists(caminho):
        return caminho

    base, ext = os.path.splitext(caminho)
    contador = 1

    while os.path.exists(f"{base} ({contador}){ext}"):
        contador += 1

    return f"{base} ({contador}){ext}"

# Função para normalizar o caminho
def normalizar_caminho(caminho):
    return os.path.normpath(caminho)

# Função para mover arquivos
def mover_arquivos(origem, destino, incluir_subpastas):
    try:
        if not os.path.exists(destino):
            os.makedirs(destino)

        arquivos_processados = []

        if incluir_subpastas:
            # Percorre diretórios e subdiretórios
            for root, dirs, files in os.walk(origem):
                for file in files:
                    caminho_origem = os.path.join(root, file)
                    caminho_destino = os.path.join(destino, os.path.relpath(caminho_origem, origem))
                    caminho_destino = verificar_renomeacao(caminho_destino)
                    os.makedirs(os.path.dirname(caminho_destino), exist_ok=True)
                    shutil.move(caminho_origem, caminho_destino)
                    arquivos_processados.append(caminho_origem)
        else:
            # Somente o diretório origem
            for item in os.listdir(origem):
                caminho_origem = os.path.join(origem, item)
                if os.path.isfile(caminho_origem):
                    caminho_destino = os.path.join(destino, item)
                    caminho_destino = verificar_renomeacao(caminho_destino)
                    shutil.move(caminho_origem, caminho_destino)
                    arquivos_processados.append(caminho_origem)

        return json.dumps({
            "status": "success",
            "message": f"Arquivos movidos: {', '.join(arquivos_processados)}"
        })

    except Exception as e:
        return json.dumps({"status": "fail", "message": f"Erro ao mover os arquivos: {e}"})

def main():
    if sys.argv[1] == 'mover_arquivos':
        origem = sys.argv[2]
        destino = sys.argv[3]
        incluir_subpastas = sys.argv[4].lower() == 'true'
        result = mover_arquivos(origem, destino, incluir_subpastas)
        print(result)

if __name__ == '__main__':
    main()