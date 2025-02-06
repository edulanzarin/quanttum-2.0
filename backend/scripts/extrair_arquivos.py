import sys
import os
import shutil
import zipfile
import rarfile
import json
import os

# Função para normalizar o caminho
def normalizar_caminho(caminho):
    return os.path.normpath(caminho)

# Função para mover e extrair arquivos
def extrair_arquivos(origem, destino, incluir_subpastas):
    try:
        if not os.path.exists(destino):
            os.makedirs(destino)

        arquivos_processados = []
        arquivos_extraidos = []

        # Filtra arquivos .zip e .rar
        arquivos_zip_rar = []

        if incluir_subpastas:
            # Percorre diretórios e subdiretórios
            for root, dirs, files in os.walk(origem):
                for file in files:
                    if file.endswith('.zip') or file.endswith('.rar'):
                        arquivos_zip_rar.append(os.path.join(root, file))
        else:
            # Somente o diretório origem
            arquivos_zip_rar = [os.path.join(origem, item) for item in os.listdir(origem) if item.endswith('.zip') or item.endswith('.rar')]

        if not arquivos_zip_rar:
            return json.dumps({"status": "fail", "message": "Nenhum arquivo ZIP ou RAR encontrado"})

        for item in arquivos_zip_rar:
            item = normalizar_caminho(item)  # Normaliza o caminho do arquivo
            try:
                arquivos_extraidos_temp = []

                # Extração de arquivos ZIP
                if item.endswith('.zip'):
                    print(f"Extraindo arquivo ZIP: {item}")  # Debugging
                    with zipfile.ZipFile(item, 'r') as zip_ref:
                        # Extraímos para a pasta de origem
                        zip_ref.extractall(origem)
                        arquivos_extraidos_temp = zip_ref.namelist()

                # Extração de arquivos RAR
                elif item.endswith('.rar'):
                    print(f"Extraindo arquivo RAR: {item}")  # Debugging
                    with rarfile.RarFile(item, 'r') as rar_ref:
                        # Extraímos para a pasta de origem
                        rar_ref.extractall(origem)
                        arquivos_extraidos_temp = rar_ref.namelist()

                # Agora, movemos para a pasta destino, garantindo nomes únicos
                for arquivo in arquivos_extraidos_temp:
                    caminho_origem = os.path.join(origem, arquivo)
                    if os.path.isfile(caminho_origem):
                        caminho_destino = os.path.join(destino, arquivo)
                        caminho_destino = verificar_renomeacao(caminho_destino)
                        shutil.move(caminho_origem, caminho_destino)
                        arquivos_processados.append(caminho_origem)

                os.remove(item)  # Remove o arquivo original após extrair
            except Exception as e:
                return json.dumps({"status": "fail", "message": f"Erro ao extrair {item}: {e}"})

        # Processa os outros arquivos (não ZIP ou RAR) se existirem
        for item in os.listdir(origem):
            caminho_item = os.path.join(origem, item)
            if os.path.isfile(caminho_item) and not (item.endswith('.zip') or item.endswith('.rar')):
                # Se o arquivo já existir no destino, renomeia com (1), (2), etc.
                caminho_destino = os.path.join(destino, item)
                caminho_destino = verificar_renomeacao(caminho_destino)
                shutil.move(caminho_item, caminho_destino)
                arquivos_processados.append(caminho_item)

        return json.dumps({
            "status": "success",
            "message": f"Arquivos extraídos e movidos: {', '.join(arquivos_processados)}"
        })

    except Exception as e:
        return json.dumps({"status": "fail", "message": f"Erro ao processar os arquivos: {e}"})
def main():
    if sys.argv[1] == 'extrair_arquivos':
        origem = sys.argv[2]
        destino = sys.argv[3]
        incluir_subpastas = sys.argv[4].lower() == 'true'
        result = extrair_arquivos(origem, destino, incluir_subpastas)
        print(result)

if __name__ == '__main__':
    main()
