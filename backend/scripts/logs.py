import csv
import json
import os
import platform
import sys
import tkinter as tk
import uuid
from tkinter import filedialog

import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore import FieldFilter

# Caminho para o arquivo de credenciais do Firebase
CAMINHO_JSON = os.path.join(
    os.path.dirname(__file__), "..", "database", "serviceAccountKey.json"
)

# Configuração do Firebase
cred = credentials.Certificate(CAMINHO_JSON)
firebase_admin.initialize_app(cred)
db = firestore.client()


def adicionar_log(id_usuario, funcao):
    try:
        # Gera um ID único para o computador
        id_computador = str(uuid.uuid4())

        # Obtém o nome do computador
        nome_computador = platform.node()

        # Cria um novo log no Firestore com timestamp
        log = {
            "id_usuario": id_usuario,
            "datahora": firestore.SERVER_TIMESTAMP,
            "id_computador": id_computador,
            "nome_computador": nome_computador,
            "funcao": funcao,
        }

        # Adiciona o log à coleção "logs"
        db.collection("logs").add(log)

        return {"success": True, "message": "Log adicionado com sucesso."}

    except Exception as e:
        return {"success": False, "message": f"Erro ao adicionar log: {e}"}


def converter_data_para_string(log):
    """
    Converte campos de data no log para strings no formato ISO.
    """
    if "datahora" in log and hasattr(log["datahora"], "isoformat"):
        log["datahora"] = log["datahora"].isoformat()
    return log


def obter_logs_no(id_usuario=None, data_inicio=None, data_fim=None):
    try:
        # Referência à coleção de logs
        logs_ref = db.collection("logs")

        # Aplica filtros conforme os parâmetros fornecidos
        if id_usuario:
            logs_ref = logs_ref.where(
                filter=FieldFilter("id_usuario", "==", id_usuario)
            )

        # Obtém os logs
        logs = logs_ref.stream()

        # Converte os logs para uma lista de dicionários
        logs_list = []
        for log in logs:
            log_data = log.to_dict()
            log_data["id"] = log.id  # Adiciona o ID do documento ao log
            log_data = converter_data_para_string(
                log_data
            )  # Converte datas para strings
            logs_list.append(log_data)

        return {"success": True, "logs": logs_list}

    except Exception as e:
        return {"success": False, "message": f"Erro ao obter logs: {e}"}


def selecionar_caminho_salvamento():
    root = tk.Tk()
    root.withdraw()  # Oculta a janela principal do tkinter
    root.attributes("-topmost", 1)  # Mantém a janela de diálogo no topo
    root.after(
        100, lambda: root.attributes("-topmost", 0)
    )  # Remove o topo após 100ms para normalizar

    caminho = filedialog.asksaveasfilename(
        defaultextension=".csv",
        filetypes=[("CSV files", "*.csv")],
        title="Escolher onde salvar o arquivo",
    )

    return caminho


def gerar_csv(logs, caminho):
    try:
        campos = [
            "id",
            "id_usuario",
            "datahora",
            "id_computador",
            "nome_computador",
            "funcao",
        ]
        with open(caminho, mode="w", newline="", encoding="utf-8") as arquivo_csv:
            escritor = csv.DictWriter(
                arquivo_csv, fieldnames=campos, delimiter=";"
            )  # Delimitador é ";"
            escritor.writeheader()
            for log in logs:
                escritor.writerow(log)
        return {"success": True, "message": f"Arquivo CSV salvo em: {caminho}"}
    except Exception as e:
        return {"success": False, "message": f"Erro ao gerar CSV: {e}"}


def main():
    if len(sys.argv) > 1:
        acao = sys.argv[1]

        if acao == "adicionar_log":
            if len(sys.argv) < 4:
                print(
                    json.dumps(
                        {
                            "success": False,
                            "message": "Parâmetros insuficientes para adicionar log.",
                        }
                    )
                )
                return

            id_usuario = sys.argv[2]
            funcao = sys.argv[3]

            result = adicionar_log(id_usuario, funcao)
            print(json.dumps(result))

        elif acao == "obter_logs_no":
            id_usuario = sys.argv[2] if len(sys.argv) > 2 else None
            data_inicio = sys.argv[3] if len(sys.argv) > 3 else None
            data_fim = sys.argv[4] if len(sys.argv) > 4 else None

            # Obtém os logs sem salvar em CSV
            result = obter_logs_no(id_usuario, data_inicio, data_fim)
            print(json.dumps(result))

        else:
            print(
                json.dumps(
                    {
                        "success": False,
                        "message": "Ação inválida. Use 'adicionar_log' ou 'obter_logs_no'.",
                    }
                )
            )

    else:
        print(json.dumps({"success": False, "message": "Nenhum comando fornecido."}))


if __name__ == "__main__":
    main()
