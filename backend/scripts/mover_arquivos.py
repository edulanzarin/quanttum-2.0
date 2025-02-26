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

def mover_arquivos(origem, destino, incluir_subpastas):
    try:
        # Verifica se o destino está dentro da origem para evitar loops
        destino = os.path.abspath(destino)
        origem_abs = os.path.abspath(origem)

        if destino.startswith(origem_abs):
            return json.dumps({
                "status": "fail",
                "message": "A pasta de destino não pode estar dentro da pasta de origem."
            })

        if not os.path.exists(destino):
            os.makedirs(destino)

        arquivos_processados = []
        pastas_processadas = set()

        def processar_pasta(pasta):
            """Função recursiva para processar uma pasta."""
            if pasta in pastas_processadas:
                return

            pastas_processadas.add(pasta)

            for item in os.listdir(pasta):
                caminho_origem = os.path.join(pasta, item)

                # Ignora a pasta de destino
                if os.path.abspath(caminho_origem) == destino:
                    continue

                if os.path.isfile(caminho_origem):
                    caminho_destino = os.path.join(destino, item)
                    caminho_destino = verificar_renomeacao(caminho_destino)
                    shutil.copy2(caminho_origem, caminho_destino)
                    arquivos_processados.append(caminho_origem)
                elif incluir_subpastas and os.path.isdir(caminho_origem):
                    processar_pasta(caminho_origem)

        processar_pasta(origem_abs)

        return json.dumps({
            "status": "success",
            "message": f"Arquivos copiados: {', '.join(arquivos_processados)}"
        })

    except Exception as e:
        return json.dumps({"status": "fail", "message": f"Erro ao copiar os arquivos: {e}"})

def main():
    if sys.argv[1] == 'mover_arquivos':
        origem = sys.argv[2]
        destino = sys.argv[3]
        incluir_subpastas = sys.argv[4].lower() == 'true'
        result = mover_arquivos(origem, destino, incluir_subpastas)
        print(result)

if __name__ == '__main__':
    main()