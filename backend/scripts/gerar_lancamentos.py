import sys
import json
from datetime import datetime, timedelta
import random
import tkinter as tk
from tkinter import filedialog

def salvar_dados(nome_sugerido, extensao=".txt"):
    try:
        root = tk.Tk()
        root.withdraw()
        root.attributes("-topmost", 1)
        root.after(100, lambda: root.attributes("-topmost", 0))

        caminho_arquivo = filedialog.asksaveasfilename(
            initialfile=nome_sugerido,
            defaultextension=extensao,
            filetypes=[("TXT files", "*.txt"), ("All files", "*.*")]
        )

        root.destroy()  # Fecha a janela do Tkinter corretamente
        return caminho_arquivo if caminho_arquivo else None
    except Exception:
        return None

def gerar_valor_proporcional(valor_restante, dias_restantes, valor_maximo):
    # Gera um valor aleatório entre 1 e o valor máximo
    valor_dia = round(random.uniform(1, valor_maximo), 2)  # Arredonda para 2 casas decimais

    # Garante que o valor não ultrapasse o valor restante
    valor_dia = min(valor_dia, valor_restante)

    return valor_dia

def gerar_lancamentos(valor_total, valor_maximo, data_inicio, data_fim, tipo):
    try:
        # Converte as strings de data para objetos datetime
        data_inicio = datetime.strptime(data_inicio, "%Y-%m-%d")
        data_fim = datetime.strptime(data_fim, "%Y-%m-%d")

        # Lista para armazenar os dias úteis
        dias_uteis = []

        # Gera a lista de dias úteis no intervalo
        data_atual = data_inicio
        while data_atual <= data_fim:
            if data_atual.weekday() < 5:  # 0 = segunda, 4 = sexta
                dias_uteis.append(data_atual)
            data_atual += timedelta(days=1)

        # Verifica se há dias úteis no intervalo
        if not dias_uteis:
            return {"status": "fail", "message": "Nenhum dia útil no intervalo informado."}

        # Dicionário para armazenar os lançamentos
        lancamentos = []

        # Define a descrição com base no tipo
        descricao = "PAGAMENTO" if tipo.lower() == "pagamento" else "RECEBIMENTO"

        # Define DEBITO e CREDITO com base no tipo
        if tipo.lower() == "pagamento":
            debito = 1496
            credito = 5
        else:
            debito = 5
            credito = 142

        # Distribui o valor total em dias úteis
        valor_restante = valor_total
        dias_restantes = len(dias_uteis)

        while valor_restante > 0:
            # Gera um valor proporcional
            valor_dia = gerar_valor_proporcional(valor_restante, dias_restantes, valor_maximo)

            # Adiciona o lançamento
            lancamentos.append({
                "data": dias_uteis[len(lancamentos) % len(dias_uteis)].strftime("%d%m%Y"),  # Repete os dias se necessário
                "debito": debito,
                "credito": credito,
                "valor": valor_dia,
                "descricao": descricao
            })

            # Atualiza o valor restante
            valor_restante -= valor_dia

        # Gera o nome sugerido para o arquivo TXT
        nome_sugerido = f"lancamentos_{tipo.lower()}.txt"

        # Abre o diálogo para salvar o arquivo
        caminho_arquivo = salvar_dados(nome_sugerido, ".txt")
        if not caminho_arquivo:
            return {"status": "fail", "message": "Operação de salvar arquivo cancelada pelo usuário."}

        # Gera o arquivo TXT
        with open(caminho_arquivo, mode="w", encoding="utf-8") as arquivo_txt:
            for lancamento in lancamentos:
                linha = (
                    f"{lancamento['data']};{lancamento['debito']};{lancamento['credito']};"
                    f"{lancamento['valor']:.2f}".replace(".", ",") + f";{lancamento['descricao']}\n"
                )
                arquivo_txt.write(linha)

        return {"status": "success", "message": f"Arquivo TXT gerado com sucesso!"}

    except Exception as e:
        return {"status": "fail", "message": f"Erro ao gerar lançamentos: {e}"}
    
def gerar_despesas(valor_total, valor_maximo, data_inicio, data_fim, contas):
    try:
        data_inicio = datetime.strptime(data_inicio, "%Y-%m-%d")
        data_fim = datetime.strptime(data_fim, "%Y-%m-%d")
        
        dias_uteis = []
        data_atual = data_inicio
        while data_atual <= data_fim:
            if data_atual.weekday() < 5:
                dias_uteis.append(data_atual)
            data_atual += timedelta(days=1)
        
        if not dias_uteis:
            return {"status": "fail", "message": "Nenhum dia útil no intervalo informado."}

        lancamentos = []
        valor_restante = valor_total
        dias_restantes = len(dias_uteis)
        
        while valor_restante > 0:
            valor_dia = gerar_valor_proporcional(valor_restante, dias_restantes, valor_maximo)
            conta_debito = random.choice(contas)

            lancamentos.append({
                "data": dias_uteis[len(lancamentos) % len(dias_uteis)].strftime("%d%m%Y"),
                "debito": conta_debito,
                "credito": 1496,
                "valor": valor_dia,
                "descricao": f"Valor NF {random.randint(10000, 99999)}"
            })

            valor_restante -= valor_dia

        nome_sugerido = "lancamentos_despesas.txt"
        caminho_arquivo = salvar_dados(nome_sugerido, ".txt")
        if not caminho_arquivo:
            return {"status": "fail", "message": "Operação de salvar arquivo cancelada pelo usuário."}

        with open(caminho_arquivo, mode="w", encoding="utf-8") as arquivo_txt:
            for lancamento in lancamentos:
                linha = (
                    f"{lancamento['data']};{lancamento['debito']};{lancamento['credito']};"
                    f"{lancamento['valor']:.2f}".replace(".", ",") + f";{lancamento['descricao']}\n"
                )
                arquivo_txt.write(linha)

        return {"status": "success", "message": "Arquivo TXT gerado com sucesso!"}
    
    except Exception as e:
        return {"status": "fail", "message": f"Erro ao gerar despesas: {e}"}

def main():
    if sys.argv[1] == 'gerar_lancamentos':
        valor_total = float(sys.argv[2])  # Valor total a ser diluído
        valor_maximo = float(sys.argv[3])  # Valor máximo por lançamento
        data_inicio = sys.argv[4]  # Data de início no formato "yyyy-mm-dd"
        data_fim = sys.argv[5]  # Data de fim no formato "yyyy-mm-dd"
        tipo = sys.argv[6]  # Tipo: "pagamento" ou "recebimento"
        result = gerar_lancamentos(valor_total, valor_maximo, data_inicio, data_fim, tipo)
        print(json.dumps(result))
        
    elif sys.argv[1] == 'gerar_despesas':
        valor_total = float(sys.argv[2])
        valor_maximo = float(sys.argv[3])
        data_inicio = sys.argv[4]
        data_fim = sys.argv[5]
        contas = list(map(int, sys.argv[6].split(',')))
        result = gerar_despesas(valor_total, valor_maximo, data_inicio, data_fim, contas)
        print(json.dumps(result))

if __name__ == '__main__':
    main()