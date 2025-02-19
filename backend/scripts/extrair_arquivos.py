import sys
import os
import shutil
import zipfile
import rarfile
import json

# Especifica o caminho do executável UnRAR (se necessário)
# rarfile.UNRAR_TOOL = "C:\\caminho\\para\\UnRAR.exe"

def verificar_renomeacao(caminho):
    """Garante que o arquivo não sobrescreva outro, adicionando um sufixo se necessário."""
    if not os.path.exists(caminho):
        return caminho

    base, ext = os.path.splitext(caminho)
    contador = 1

    while os.path.exists(f"{base} ({contador}){ext}"):
        contador += 1

    return f"{base} ({contador}){ext}"

def normalizar_caminho(caminho):
    return os.path.normpath(caminho)

def extrair_arquivo(item, destino, arquivos_processados):
    """Extrai um arquivo ZIP ou RAR e move os arquivos extraídos para o destino."""
    try:
        arquivos_extraidos_temp = []

        # Extração de arquivos ZIP
        if item.endswith('.zip'):
            with zipfile.ZipFile(item, 'r') as zip_ref:
                # Extraímos para a pasta de origem
                zip_ref.extractall(os.path.dirname(item))
                arquivos_extraidos_temp = zip_ref.namelist()

        # Extração de arquivos RAR
        elif item.endswith('.rar'):
            with rarfile.RarFile(item, 'r') as rar_ref:
                # Extraímos para a pasta de origem
                rar_ref.extractall(os.path.dirname(item))
                arquivos_extraidos_temp = rar_ref.namelist()

        # Agora, movemos para a pasta destino, garantindo nomes únicos
        for arquivo in arquivos_extraidos_temp:
            caminho_origem = os.path.join(os.path.dirname(item), arquivo)
            if os.path.isfile(caminho_origem):
                caminho_destino = os.path.join(destino, arquivo)
                caminho_destino = verificar_renomeacao(caminho_destino)
                shutil.move(caminho_origem, caminho_destino)
                arquivos_processados.append(caminho_origem)
                # Verifica se o arquivo extraído é um RAR ou ZIP e o processa recursivamente
                if arquivo.endswith('.zip') or arquivo.endswith('.rar'):
                    extrair_arquivo(caminho_destino, destino, arquivos_processados)

    except Exception as e:
        return json.dumps({"status": "fail", "message": f"Erro ao extrair: {item} {e}"})

def extrair_arquivos(origem, destino, incluir_subpastas):
    try:
        if not os.path.exists(destino):
            os.makedirs(destino)

        arquivos_processados = []

        # Filtra arquivos .zip e .rar
        arquivos_zip_rar = []

        if incluir_subpastas:
            # Percorre diretórios e subdiretórios
            for root, dirs, files in os.walk(origem):
                # Ignora a pasta destino
                if normalizar_caminho(root).startswith(normalizar_caminho(destino)):
                    continue
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
            extrair_arquivo(item, destino, arquivos_processados)

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