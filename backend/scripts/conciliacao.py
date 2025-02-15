import sys
import json
import os
import firebase_admin
from firebase_admin import credentials, firestore

CAMINHO_JSON = os.path.join(os.path.dirname(__file__), '..', 'database', 'serviceAccountKey.json')

# Configuração do Firebase
cred = credentials.Certificate(CAMINHO_JSON)
firebase_admin.initialize_app(cred)
db = firestore.client()

def adicionar_conciliacao(empresa, banco, descricao, debito=None, credito=None):
    try:
        # Verifica se o documento da empresa existe
        empresa_ref = db.collection('empresas').document(str(empresa))
        empresa_doc = empresa_ref.get()

        if not empresa_doc.exists:
            # Cria o documento da empresa e a coleção "conciliacoes"
            empresa_ref.set({})  # Cria o documento vazio
            conciliacoes_ref = empresa_ref.collection('conciliacoes')
        else:
            # Acessa a coleção "conciliacoes" existente
            conciliacoes_ref = empresa_ref.collection('conciliacoes')

        # Adiciona os dados da conciliação
        nova_conciliacao = {
            'banco': banco,
            'descricao': descricao,
            'debito': debito,
            'credito': credito
        }

        # Remove campos None (opcionais)
        nova_conciliacao = {k: v for k, v in nova_conciliacao.items() if v is not None}

        # Adiciona o documento com ID automático
        conciliacoes_ref.add(nova_conciliacao)

        return {"status": "success", "message": "Conciliação adicionada com sucesso!"}

    except Exception as e:
        return {"status": "fail", "message": f"Erro ao adicionar conciliação: {e}"}

def obter_conciliacao(empresa):
    try:
        # Referência ao documento da empresa
        empresa_ref = db.collection('empresas').document(str(empresa))
        empresa_doc = empresa_ref.get()

        if not empresa_doc.exists:
            return {"success": False, "message": "Empresa não encontrada."}

        # Referência à coleção "conciliacoes" da empresa
        conciliacoes_ref = empresa_ref.collection('conciliacoes')
        conciliacoes = conciliacoes_ref.stream()

        # Lista para armazenar as conciliações
        conciliacoes_lista = []

        # Itera sobre os documentos da coleção "conciliacoes"
        for conciliacao in conciliacoes:
            conciliacao_data = conciliacao.to_dict()
            conciliacao_data['id'] = conciliacao.id  # Adiciona o ID do documento
            conciliacoes_lista.append(conciliacao_data)

        if not conciliacoes_lista:
            return {"success": True, "message": "Nenhuma conciliação encontrada.", "conciliacoes": []}

        return {"success": True, "conciliacoes": conciliacoes_lista}

    except Exception as e:
        return {"success": False, "message": f"Erro ao obter conciliações: {e}"}

def excluir_conciliacao(empresa, documento_id):
    try:
        # Referência ao documento da empresa
        empresa_ref = db.collection('empresas').document(str(empresa))
        empresa_doc = empresa_ref.get()

        if not empresa_doc.exists:
            return {"success": False, "message": "Empresa não encontrada."}

        # Referência ao documento da conciliação
        conciliacao_ref = empresa_ref.collection('conciliacoes').document(documento_id)
        conciliacao_doc = conciliacao_ref.get()

        if not conciliacao_doc.exists:
            return {"success": False, "message": "Conciliação não encontrada."}

        # Exclui o documento
        conciliacao_ref.delete()

        return {"success": True, "message": "Conciliação excluída com sucesso!"}

    except Exception as e:
        return {"success": False, "message": f"Erro ao excluir conciliação: {e}"}

def gerenciar_conciliacao(operacao, dados):
    try:
        if operacao == "adicionar":
            # Verifica se os campos obrigatórios estão presentes
            if "empresa" not in dados or "banco" not in dados or "descricao" not in dados:
                return {"success": False, "message": "Campos obrigatórios faltando para a operação 'adicionar'."}

            empresa = dados["empresa"]
            banco = dados["banco"]
            descricao = dados["descricao"]
            debito = dados.get("debito", None)  # Campo opcional
            credito = dados.get("credito", None)  # Campo opcional

            # Chama a função adicionar_conciliacao
            return adicionar_conciliacao(empresa, banco, descricao, debito, credito)

        elif operacao == "obter":
            # Verifica se o campo obrigatório está presente
            if "empresa" not in dados:
                return {"success": False, "message": "Campo 'empresa' faltando para a operação 'obter'."}

            empresa = dados["empresa"]

            # Chama a função obter_conciliacao
            return obter_conciliacao(empresa)

        elif operacao == "excluir":
            # Verifica se os campos obrigatórios estão presentes
            if "empresa" not in dados or "documento_id" not in dados:
                return {"success": False, "message": "Campos obrigatórios faltando para a operação 'excluir'."}

            empresa = dados["empresa"]
            documento_id = dados["documento_id"]

            # Chama a função excluir_conciliacao
            return excluir_conciliacao(empresa, documento_id)

        else:
            return {"success": False, "message": "Operação inválida. Use 'adicionar', 'obter' ou 'excluir'."}

    except Exception as e:
        return {"success": False, "message": f"Erro ao executar a operação: {e}"}

def main():
    if len(sys.argv) > 3 and sys.argv[1] == 'gerenciar_conciliacao':
        operacao = sys.argv[2]
        try:
            dados = json.loads(sys.argv[3])  # Converte a string JSON para um dicionário
            result = gerenciar_conciliacao(operacao, dados)
            print(json.dumps(result))
        except json.JSONDecodeError as e:
            print(json.dumps({"success": False, "message": f"Erro ao decodificar JSON: {e}"}))
    else:
        print(json.dumps({"success": False, "message": "Argumentos insuficientes ou inválidos. Use: gerenciar_conciliacao <operacao> <dados_json>"}))

if __name__ == '__main__':
    main()