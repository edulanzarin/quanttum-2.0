import sys
import json
import os
import pandas as pd
import firebase_admin
from firebase_admin import credentials, firestore

# Caminho para o arquivo de credenciais
CAMINHO_JSON = os.path.join(os.path.dirname(__file__), '..', 'database', 'serviceAccountKey.json')

# Verifica se o arquivo de credenciais existe
if not os.path.exists(CAMINHO_JSON):
    sys.exit(1)

# Configuração do Firebase
try:
    cred = credentials.Certificate(CAMINHO_JSON)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
except Exception as e:
    sys.exit(1)

def obter_conciliacao(empresa):
    try:
        # Verifica se o valor da empresa é um número inteiro
        if not isinstance(empresa, int):
            return {"success": False, "message": "O valor da empresa deve ser um número inteiro."}

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
    
def adicionar_conciliacao(empresa, banco, descricao, debito=None, credito=None):
    try:
        empresa_ref = db.collection('empresas').document(str(empresa))
        empresa_doc = empresa_ref.get()

        if not empresa_doc.exists:
            empresa_ref.set({})
            conciliacoes_ref = empresa_ref.collection('conciliacoes')
        else:
            conciliacoes_ref = empresa_ref.collection('conciliacoes')

        nova_conciliacao = {
            'banco': banco,
            'descricao': descricao,
            'debito': debito,
            'credito': credito
        }

        nova_conciliacao = {k: v for k, v in nova_conciliacao.items() if v is not None}
        conciliacoes_ref.add(nova_conciliacao)

        return {"status": "success", "message": "Conciliação adicionada com sucesso!"}
    except Exception as e:
        return {"status": "fail", "message": f"Erro ao adicionar conciliação: {e}"}

def cadastrar_conciliacao_em_massa(empresa, banco, caminho_planilha):
    try:
        if not os.path.exists(caminho_planilha):
            return {"success": False, "message": "Arquivo da planilha não encontrado."}

        planilha = pd.read_excel(caminho_planilha)

        for index, row in planilha.iterrows():
            try:
                descricao = str(row[0])  # Coluna 1: Descrição (sempre string)
                debito = row[1] if pd.notna(row[1]) else None  # Coluna 2: Débito (mantém o valor original)
                credito = row[2] if pd.notna(row[2]) else None  # Coluna 3: Crédito (mantém o valor original)

                # Remove vírgulas e converte para inteiro se possível
                if debito is not None and isinstance(debito, str):
                    debito = debito.replace(",", "")
                    try:
                        debito = int(float(debito))  # Converte para inteiro
                    except ValueError:
                        pass  # Mantém como string se não for possível converter

                if credito is not None and isinstance(credito, str):
                    credito = credito.replace(",", "")
                    try:
                        credito = int(float(credito))  # Converte para inteiro
                    except ValueError:
                        pass  # Mantém como string se não for possível converter

                resultado = adicionar_conciliacao(empresa, banco, descricao, debito, credito)
                print(json.dumps(resultado))

            except Exception as e:
                return {"success": False, "message": f"Erro ao processar a linha: {e}"}

        return {"success": True, "message": "Conciliações em massa adicionadas com sucesso!"}
    except Exception as e:
        return {"success": False, "message": f"Erro ao processar a planilha: {e}"}

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

        elif operacao == "cadastrar_em_massa":
            # Verifica se os campos obrigatórios estão presentes
            if "empresa" not in dados or "banco" not in dados or "caminho_planilha" not in dados:
                return {"success": False, "message": "Campos obrigatórios faltando para a operação 'cadastrar_em_massa'."}

            empresa = dados["empresa"]
            banco = dados["banco"]
            caminho_planilha = dados["caminho_planilha"]

            # Chama a função cadastrar_conciliacao_em_massa
            return cadastrar_conciliacao_em_massa(empresa, banco, caminho_planilha)

        else:
            return {"success": False, "message": "Operação inválida. Use 'adicionar', 'obter', 'excluir' ou 'cadastrar_em_massa'."}

    except Exception as e:
        return {"success": False, "message": f"Erro ao executar a operação: {e}"}

def main():
    if len(sys.argv) > 1 and sys.argv[1] == 'gerenciar_conciliacao':
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