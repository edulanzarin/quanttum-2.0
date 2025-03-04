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

def gerar_valor_proporcional(valor_restante, dias_restantes):
    # Define o valor máximo como 30 mil reais
    valor_maximo = 30000

    # Gera um valor aleatório entre 1 e o valor máximo
    valor_dia = round(random.uniform(1, valor_maximo), 2)  # Arredonda para 2 casas decimais

    # Garante que o valor não ultrapasse o valor restante
    valor_dia = min(valor_dia, valor_restante)

    return valor_dia

def gerar_lancamentos(valor_total, data_inicio, data_fim, tipo):
    try:
        # Converte as strings de data para objetos datetime
        data_inicio = datetime.strptime(data_inicio, "%d/%m/%Y")
        data_fim = datetime.strptime(data_fim, "%d/%m/%Y")

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
            valor_dia = gerar_valor_proporcional(valor_restante, dias_restantes)

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

def main():
    if sys.argv[1] == 'gerar_lancamentos':
        valor_total = float(sys.argv[2])  # Valor total a ser diluído
        data_inicio = sys.argv[3]  # Data de início no formato "dd/mm/yyyy"
        data_fim = sys.argv[4]  # Data de fim no formato "dd/mm/yyyy"
        tipo = sys.argv[5]  # Tipo: "pagamento" ou "recebimento"
        result = gerar_lancamentos(valor_total, data_inicio, data_fim, tipo)
        print(json.dumps(result))

if __name__ == '__main__':
    main()