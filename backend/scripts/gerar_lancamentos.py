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
    if dias_restantes <= 0:
        return valor_restante  # Retorna o valor restante se não houver mais dias

    # Calcula o valor médio por dia
    valor_medio = valor_restante / dias_restantes

    # Define um intervalo aceitável para o valor do dia
    intervalo = valor_medio * 0.2  # 20% do valor médio como margem

    # Gera um valor aleatório dentro do intervalo aceitável
    valor_dia = round(random.uniform(valor_medio - intervalo, valor_medio + intervalo), 2)

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

        while valor_restante > 0:
            # Escolhe um dia aleatório da lista de dias úteis
            dia_aleatorio = random.choice(dias_uteis)

            # Gera um valor proporcional, respeitando o valor máximo
            valor_dia = round(random.uniform(1, min(valor_maximo, valor_restante)), 2)

            # Adiciona o lançamento
            lancamentos.append({
                "data": dia_aleatorio.strftime("%d%m%Y"),
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
        # Converte as strings de data para objetos datetime
        data_inicio = datetime.strptime(data_inicio, "%Y-%m-%d")
        data_fim = datetime.strptime(data_fim, "%Y-%m-%d")
        
        # Lista para armazenar os dias úteis
        dias_uteis = []
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
        
        # Calcula o número de dias úteis
        num_dias_uteis = len(dias_uteis)
        
        # Valor médio diário aproximado
        valor_medio_diario = valor_total / num_dias_uteis
        
        # Ajusta o valor máximo se necessário
        valor_maximo = min(valor_maximo, valor_medio_diario * 5)  # Limita a 5x o valor médio
        
        # Divide o valor total pelas contas
        valor_por_conta = valor_total / len(contas)
        
        # Para cada conta, gera lançamentos proporcionalmente
        for conta in contas:
            valor_restante = valor_por_conta
            
            # Enquanto ainda houver valor para distribuir
            while valor_restante > 0.01:  # Considera centavos
                # Escolhe um dia aleatório
                dia_aleatorio = random.choice(dias_uteis)
                
                # Filtra dias restantes
                dias_restantes = len([d for d in dias_uteis if d >= dia_aleatorio])
                
                # Calcula valor sugerido
                valor_sugerido = min(
                    valor_maximo,
                    max(1, valor_restante / max(1, dias_restantes * random.uniform(0.8, 1.2)))
                )
                
                # Ajusta para não ultrapassar o valor restante
                valor_lancamento = round(min(valor_sugerido, valor_restante), 2)
                
                # Garante valor mínimo de 1 real
                valor_lancamento = max(valor_lancamento, 1.00)
                
                # Adiciona o lançamento
                lancamentos.append({
                    "data": dia_aleatorio.strftime("%d%m%Y"),
                    "debito": conta,
                    "credito": 1496,
                    "valor": valor_lancamento,
                    "descricao": f"Valor NF {random.randint(10000, 99999)}"
                })

                # Atualiza o valor restante
                valor_restante -= valor_lancamento

        # Ordena os lançamentos por data
        lancamentos.sort(key=lambda x: datetime.strptime(x['data'], '%d%m%Y'))
        
        # Gera o nome sugerido para o arquivo TXT
        nome_sugerido = "lancamentos_despesas.txt"

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

        return {"status": "success", "message": "Arquivo TXT gerado com sucesso!"}
    
    except Exception as e:
        return {"status": "fail", "message": f"Erro ao gerar despesas: {e}"}

def main():
    if sys.argv[1] == 'gerar_lancamentos':
        valor_total = float(sys.argv[2]) 
        valor_maximo = float(sys.argv[3]) 
        data_inicio = sys.argv[4]  
        data_fim = sys.argv[5] 
        tipo = sys.argv[6]  
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