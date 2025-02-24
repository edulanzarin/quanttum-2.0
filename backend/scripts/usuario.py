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

def login(usuario, senha):
    try:
        if not usuario or not senha:
            return {"success": False, "message": "Usuário e senha são obrigatórios para login."}

        # Busca o usuário no Firestore usando a sintaxe recomendada
        usuarios_ref = db.collection('usuarios').where(filter=firestore.FieldFilter('usuario', '==', usuario)).stream()
        usuario_encontrado = None

        for doc in usuarios_ref:
            usuario_encontrado = doc.to_dict()
            usuario_encontrado['id'] = doc.id 

        if not usuario_encontrado:
            return {"success": False, "message": "Usuário não encontrado."}

        if usuario_encontrado['senha'] != senha:
            return {"success": False, "message": "Senha incorreta."}

        if usuario_encontrado.get('status') != 'on':
            return {"success": False, "message": "Usuário inativo."}

        return {"success": True, "message": "Login bem-sucedido.", "usuario": usuario_encontrado}

    except Exception as e:
        return {"success": False, "message": f"Erro ao fazer login: {e}"}

def register(usuario, senha, nome):
    try:
        if not usuario or not senha or not nome:
            return {"success": False, "message": "Usuário, senha e nome são obrigatórios para registro."}

        # Verifica se o usuário já existe usando a sintaxe recomendada
        usuarios_ref = db.collection('usuarios').where(filter=firestore.FieldFilter('usuario', '==', usuario)).stream()
        if any(usuarios_ref):
            return {"success": False, "message": "Usuário já existe."}

        novo_usuario = {
            'usuario': usuario,
            'senha': senha,
            'nome': nome,
            'status': 'on'  # Define o status como 'on' por padrão
        }

        db.collection('usuarios').add(novo_usuario)
        return {"success": True, "message": "Usuário registrado com sucesso."}

    except Exception as e:
        return {"success": False, "message": f"Erro ao registrar usuário: {e}"}

def obter_usuario(id_usuario):
    try:
        # Busca o usuário no Firestore pelo ID
        usuario_ref = db.collection('usuarios').document(id_usuario).get()

        if not usuario_ref.exists:
            return {"success": False, "message": "Usuário não encontrado."}

        # Obtém os dados do usuário
        usuario_data = usuario_ref.to_dict()
        usuario_data['id'] = usuario_ref.id  

        return {"success": True, "usuario": usuario_data}

    except Exception as e:
        return {"success": False, "message": f"Erro ao obter usuário: {e}"}
    
def gerenciar_favorito(id_usuario, id_funcao):
    try:
        usuario_ref = db.collection('usuarios').document(id_usuario)
        usuario_doc = usuario_ref.get()

        if not usuario_doc.exists:
            return {"success": False, "message": "Usuário não encontrado."}

        usuario_data = usuario_doc.to_dict()

        if 'favoritos' not in usuario_data:
            usuario_data['favoritos'] = []  

        if id_funcao in usuario_data['favoritos']:
            usuario_data['favoritos'].remove(id_funcao)
            acao = "removida"
        else:
            usuario_data['favoritos'].append(id_funcao)
            acao = "adicionada"

        usuario_ref.update({'favoritos': usuario_data['favoritos']})

        return {"success": True, "message": f"Função {acao} aos/dos favoritos com sucesso.", "favoritos": usuario_data['favoritos']}

    except Exception as e:
        return {"success": False, "message": f"Erro ao gerenciar favorito: {e}"}
    
def obter_favoritos(id_usuario):
    try:
        # Busca o documento do usuário no Firestore
        usuario_ref = db.collection('usuarios').document(id_usuario)
        usuario_doc = usuario_ref.get()

        if not usuario_doc.exists:
            return {"success": False, "message": "Usuário não encontrado."}

        # Obtém os dados do usuário
        usuario_data = usuario_doc.to_dict()

        # Verifica se o campo 'favoritos' existe no documento do usuário
        if 'favoritos' not in usuario_data:
            return {"success": True, "favoritos": []}  

        # Retorna os favoritos do usuário
        return {"success": True, "favoritos": usuario_data['favoritos']}

    except Exception as e:
        return {"success": False, "message": f"Erro ao obter favoritos: {e}"}

def gerenciar_usuario(acao, id_usuario=None, usuario=None, senha=None, nome=None, id_funcao=None):
    if acao == "login":
        if not usuario or not senha:
            return {"success": False, "message": "Usuário e senha são obrigatórios para login."}
        return login(usuario, senha)

    elif acao == "register":
        if not usuario or not senha or not nome:
            return {"success": False, "message": "Usuário, senha e nome são obrigatórios para registro."}
        return register(usuario, senha, nome)
    
    elif acao == "obter":
        return obter_usuario(id_usuario)

    elif acao == "favorito":
        if not id_usuario or not id_funcao:
            return {"success": False, "message": "ID do usuário e ID da função são obrigatórios para gerenciar favoritos."}
        return gerenciar_favorito(id_usuario, id_funcao)

    elif acao == "obter_favoritos":
        if not id_usuario:
            return {"success": False, "message": "ID do usuário é obrigatório para obter favoritos."}
        return obter_favoritos(id_usuario)

    else:
        return {"success": False, "message": "Ação inválida. Use 'login', 'register', 'obter', 'favorito' ou 'obter_favoritos'."}

def main():
    if len(sys.argv) > 1:
        acao = sys.argv[1]
        id_usuario = sys.argv[2] if len(sys.argv) > 2 else None
        usuario = sys.argv[3] if len(sys.argv) > 3 else None
        senha = sys.argv[4] if len(sys.argv) > 4 else None
        nome = sys.argv[5] if len(sys.argv) > 5 else None
        id_funcao = sys.argv[6] if len(sys.argv) > 6 else None

        result = gerenciar_usuario(acao, id_usuario, usuario, senha, nome, id_funcao)
        print(json.dumps(result))
    else:
        print(json.dumps({"success": False, "message": "Nenhum comando fornecido."}))

if __name__ == '__main__':
    main()