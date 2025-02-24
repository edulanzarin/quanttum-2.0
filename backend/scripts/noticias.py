import pandas as pd
import tkinter as tk
import json
import os
import sys
import firebase_admin
from firebase_admin import credentials, firestore

# Caminho para o arquivo de credenciais do Firebase
CAMINHO_JSON = os.path.join(os.path.dirname(__file__), '..', 'database', 'serviceAccountKey.json')

# Configuração do Firebase
cred = credentials.Certificate(CAMINHO_JSON)
firebase_admin.initialize_app(cred)
db = firestore.client()

def obter_noticias():
    try:
        noticias_lista = []
        
        # Acessando a coleção "noticias"
        noticias_ref = db.collection('noticias').stream()
        
        for doc in noticias_ref:
            dados = doc.to_dict()
            dados['id'] = doc.id  # Adiciona o ID do documento
            # Converter timestamp para formato legível, se necessário
            if 'data' in dados:
                dados['data'] = dados['data'].isoformat()  # Converte para string ISO 8601
            noticias_lista.append(dados)

        if not noticias_lista:
            return {"success": True, "message": "Nenhuma notícia encontrada.", "noticias": []}

        return {"success": True, "noticias": noticias_lista}

    except Exception as e:
        return {"success": False, "message": f"Erro ao obter notícias: {e}"}

def main():
    if len(sys.argv) > 1 and sys.argv[1] == 'obter_noticias':
        result = obter_noticias()
        print(json.dumps(result))

if __name__ == '__main__':
    main()