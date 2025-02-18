import ofxparse
import pandas as pd
import tkinter as tk
from tkinter import filedialog, messagebox


def process_ofx(ofx_path, csv_path):
    try:
        with open(ofx_path, "rb") as file:
            ofx = ofxparse.OfxParser.parse(file)

        data = [
            [t.date.strftime("%Y-%m-%d"),
             (t.memo if t.memo else t.payee), t.amount]
            for t in ofx.account.statement.transactions
        ]

        df = pd.DataFrame(data, columns=["DATA", "DESCRICAO", "VALOR"])
        df.to_csv(csv_path, index=False, sep=';', encoding="utf-8-sig")

        messagebox.showinfo("Sucesso", "CSV salvo com sucesso!")
    except Exception as e:
        messagebox.showerror("Erro", f"Erro ao processar OFX: {e}")


def select_files():
    ofx_path = filedialog.askopenfilename(
        filetypes=[("Arquivos OFX", "*.ofx")])
    if not ofx_path:
        return
    csv_path = filedialog.asksaveasfilename(
        defaultextension=".csv", filetypes=[("Arquivo CSV", "*.csv")])
    if not csv_path:
        return
    process_ofx(ofx_path, csv_path)


# Criar interface
root = tk.Tk()
root.withdraw()
select_files()
