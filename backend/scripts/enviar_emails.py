import win32com.client
import sys
import json
import pandas as pd

def ler_conteudo_email(caminho_arquivo):
    """Lê o conteúdo de um arquivo .txt."""
    if caminho_arquivo.endswith('.txt'):
        with open(caminho_arquivo, 'r', encoding='utf-8') as f:
            return f.read()
    else:
        raise ValueError("Formato de arquivo não suportado. Use .txt.")

def enviar_emails(email_autorizado, caminho_planilha, caminho_arquivo_email):
    try:
        # Conectar ao Outlook
        outlook = win32com.client.Dispatch("Outlook.Application")
        conta_logada = outlook.Session.Accounts.Item(1).SmtpAddress

        # Verificar se o e-mail logado é o autorizado
        if conta_logada.lower() != email_autorizado.lower():
            raise ValueError(f"E-mail logado ({conta_logada}) diferente do informado.")

        # Ler a planilha
        df = pd.read_excel(caminho_planilha)

        # A primeira coluna será o e-mail de destino
        coluna_email = df.columns[0]
        
        # A segunda coluna será o título do e-mail
        coluna_titulo = df.columns[1]
        
        # A terceira coluna será o(s) e-mail(s) em CC
        coluna_cc = df.columns[2]
        
        # A quarta coluna será o(s) e-mail(s) para respostas
        coluna_respostas = df.columns[3]

        # Ler o conteúdo do arquivo de e-mail
        corpo_email_template = ler_conteudo_email(caminho_arquivo_email)

        # Enviar e-mails
        for _, linha in df.iterrows():
            email_destino = linha[coluna_email]
            titulo_email = linha[coluna_titulo]
            emails_cc = linha[coluna_cc] if len(df.columns) > 2 else ""
            emails_resposta = linha[coluna_respostas] if len(df.columns) > 3 else ""

            # Substituir placeholders pelos valores da planilha
            corpo_email = corpo_email_template
            for coluna in df.columns[4:]:  # As colunas a partir da quinta para os placeholders
                corpo_email = corpo_email.replace(f"${{{coluna}}}", str(linha[coluna]))

            # Criar e enviar e-mail
            mail = outlook.CreateItem(0)
            mail.To = email_destino
            mail.Subject = titulo_email  # Usar a segunda coluna como assunto
            mail.Body = corpo_email

            # Adicionar os e-mails em CC (se houver)
            if emails_cc and pd.notna(emails_cc):  # Verificar se não está vazio ou NaN
                mail.CC = emails_cc  # E-mails separados por ;

            # Adicionar os e-mails de resposta (se houver)
            if emails_resposta and pd.notna(emails_resposta):  # Verificar se não está vazio ou NaN
                resposta_recipients = mail.ReplyRecipients  # Corrigido para 'ReplyRecipients'
                for email in emails_resposta.split(';'):
                    recipient = resposta_recipients.Add(email.strip())  # Adiciona cada email de resposta

            mail.Send()

        return json.dumps({
            "status": "success",
            "message": f"Emails enviados com sucesso!"
        })

    except Exception as e:
        return json.dumps({"status": "fail", "message": f"Erro ao enviar emails: {e}"})

def main():
    if len(sys.argv) < 5:
        print("Por favor, forneça todos os parâmetros necessários.")
        return

    if sys.argv[1] == 'enviar_emails':
        email_autorizado = sys.argv[2]
        caminho_planilha = sys.argv[3]
        caminho_arquivo_email = sys.argv[4]
        result = enviar_emails(email_autorizado, caminho_planilha, caminho_arquivo_email)
        print(result)

if __name__ == '__main__':
    main()
