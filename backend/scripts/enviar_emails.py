import sys
import json
import pandas as pd
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from email.utils import formataddr


def ler_conteudo_email(caminho_arquivo):
    """Lê o conteúdo de um arquivo .txt."""
    if caminho_arquivo.endswith('.txt'):
        with open(caminho_arquivo, 'r', encoding='utf-8') as f:
            return f.read()
    else:
        raise ValueError("Formato de arquivo não suportado. Use .txt.")


def enviar_emails(email_autorizado, senha_email, smtp_server, smtp_port, caminho_planilha, caminho_arquivo_email):
    try:
        # Ler a planilha
        df = pd.read_excel(caminho_planilha)

        # Definir colunas
        coluna_email = df.columns[0]
        coluna_titulo = df.columns[1]
        coluna_cc = df.columns[2] if len(df.columns) > 2 else None
        coluna_respostas = df.columns[3] if len(df.columns) > 3 else None

        # Ler o conteúdo do arquivo de e-mail
        corpo_email_template = ler_conteudo_email(caminho_arquivo_email)

        # Configurar servidor SMTP
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(email_autorizado, senha_email)

        # Enviar e-mails
        for _, linha in df.iterrows():
            msg = MIMEMultipart()
            msg['From'] = formataddr(('', email_autorizado))
            msg['To'] = linha[coluna_email]
            msg['Subject'] = linha[coluna_titulo]

            # Adicionar CC se existir
            if coluna_cc and pd.notna(linha[coluna_cc]):
                msg['Cc'] = linha[coluna_cc]

            # Adicionar Reply-To se existir
            if coluna_respostas and pd.notna(linha[coluna_respostas]):
                msg.add_header('Reply-To', linha[coluna_respostas])

            # Processar corpo do email e anexos
            corpo_email = corpo_email_template
            anexos = []

            for coluna in df.columns[4:]:  # Colunas adicionais para placeholders
                valor = str(linha[coluna])
                placeholder = f"${{{coluna}}}"

                if os.path.isfile(valor):
                    anexos.append(valor)

                corpo_email = corpo_email.replace(
                    placeholder, "" if os.path.isfile(valor) else valor)

            msg.attach(MIMEText(corpo_email, 'plain'))

            # Adicionar anexos
            for anexo in anexos:
                with open(anexo, 'rb') as f:
                    part = MIMEBase('application', 'octet-stream')
                    part.set_payload(f.read())
                    encoders.encode_base64(part)
                    part.add_header(
                        'Content-Disposition', f'attachment; filename="{os.path.basename(anexo)}"')
                    msg.attach(part)

            # Enviar email
            recipients = [linha[coluna_email]]
            if coluna_cc and pd.notna(linha[coluna_cc]):
                recipients.extend([email.strip()
                                  for email in linha[coluna_cc].split(';')])

            server.sendmail(email_autorizado, recipients, msg.as_string())

        server.quit()
        return json.dumps({
            "status": "success",
            "message": "Emails enviados com sucesso!"
        })

    except Exception as e:
        return json.dumps({"status": "fail", "message": f"Erro ao enviar emails: {str(e)}"})


def main():
    if len(sys.argv) < 8:
        print("Uso: python script.py enviar_emails email_autorizado senha_email smtp_server smtp_port caminho_planilha caminho_arquivo_email")
        return

    if sys.argv[1] == 'enviar_emails':
        email_autorizado = sys.argv[2]
        senha_email = sys.argv[3]
        smtp_server = sys.argv[4]
        smtp_port = int(sys.argv[5])
        caminho_planilha = sys.argv[6]
        caminho_arquivo_email = sys.argv[7]

        result = enviar_emails(
            email_autorizado,
            senha_email,
            smtp_server,
            smtp_port,
            caminho_planilha,
            caminho_arquivo_email
        )
        print(result)


if __name__ == '__main__':
    main()
