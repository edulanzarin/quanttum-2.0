import tkinter as tk
from tkinter import filedialog, messagebox
import pandas as pd

def format_value(value):
    """
    Converte um valor no formato 0000000031459 para 314,59.
    Aplica a formatação apenas se o valor for numérico e tiver 13 dígitos.
    """
    if value.isdigit() and len(value) == 13:  # Verifica se o valor é numérico e tem 13 dígitos
        parte_inteira = int(value[:-2])  # Remove os dois últimos dígitos
        centavos = value[-2:]  # Pega os dois últimos dígitos
        return f"{parte_inteira},{centavos}"  # Formata como "parte_inteira,centavos"
    return value  # Retorna o valor original se não for numérico ou não tiver 13 dígitos

def process_file(file_path, stop_line=None):
    """
    Processa um arquivo e retorna um dicionário com os dados dos funcionários.
    """
    try:
        with open(file_path, 'r', encoding='ISO-8859-1') as file:
            lines = file.readlines()

        data = {}
        current_employee = None
        stop_processing = False

        for line in lines:
            if stop_line and stop_line in line:
                stop_processing = True
                break

            parts = line.strip().split('|')

            if line.startswith("BPFDEC"):  # Nova entrada de funcionário
                employee_name = parts[2]
                current_employee = {"Nome funcionario": employee_name, "Dados": []}
                data[employee_name] = current_employee
            
            elif len(parts) > 1 and current_employee is not None:  
                # Captura dinamicamente qualquer tipo que apareça (RTRT, RTPO, RTDS, RTIR, etc.)
                code = parts[0]  
                values = [format_value(v) for v in parts[1:]]  # Formata os valores
                current_employee["Dados"].append([code] + values)  

        return data
    except Exception as e:
        messagebox.showerror("Erro", f"Ocorreu um erro ao processar o arquivo: {e}")
        return {}

def combine_data(data1, data2):
    """
    Combina os dados dos dois arquivos.
    Valores de 1 a 7 vêm do primeiro arquivo, e de 8 a 13 vêm do segundo.
    """
    combined_data = []

    for employee_name, employee_data in data1.items():
        if employee_name in data2:  # Verifica se o funcionário existe no segundo arquivo
            dados_arquivo1 = employee_data["Dados"]
            dados_arquivo2 = data2[employee_name]["Dados"]

            # Combina os dados: 1-7 do arquivo 1 e 8-13 do arquivo 2
            for row1, row2 in zip(dados_arquivo1, dados_arquivo2):
                combined_row = [employee_name, row1[0]]  # Nome e código
                combined_row.extend(row1[1:8])  # Valores 1-7 do arquivo 1
                combined_row.extend(row2[8:14])  # Valores 8-13 do arquivo 2
                combined_data.append(combined_row)

    return combined_data

def process_files():
    file_path1 = file_entry1.get()
    file_path2 = file_entry2.get()
    save_path = save_entry.get()

    if not file_path1 or not file_path2 or not save_path:
        messagebox.showerror("Erro", "Por favor, selecione os dois arquivos e o local para salvar.")
        return

    try:
        # Processa os dois arquivos
        data1 = process_file(file_path1)
        data2 = process_file(file_path2)

        # Combina os dados
        combined_data = combine_data(data1, data2)

        # Cria o DataFrame
        columns = ["Nome funcionario", "Tipo"] + [f"Valor {i}" for i in range(1, 14)]
        df = pd.DataFrame(combined_data, columns=columns)

        # Salva o arquivo Excel
        df.to_excel(save_path, index=False)

        messagebox.showinfo("Sucesso", "Arquivos processados e salvos com sucesso!")
    except Exception as e:
        messagebox.showerror("Erro", f"Ocorreu um erro ao processar os arquivos: {e}")

def browse_file1():
    filename = filedialog.askopenfilename(filetypes=[("Text files", "*.txt")])
    file_entry1.delete(0, tk.END)
    file_entry1.insert(0, filename)

def browse_file2():
    filename = filedialog.askopenfilename(filetypes=[("Text files", "*.txt")])
    file_entry2.delete(0, tk.END)
    file_entry2.insert(0, filename)

def browse_save():
    filename = filedialog.asksaveasfilename(defaultextension=".xlsx", filetypes=[("Excel files", "*.xlsx")])
    save_entry.delete(0, tk.END)
    save_entry.insert(0, filename)

# Interface gráfica
root = tk.Tk()
root.title("Processador de Arquivos DIRF")

tk.Label(root, text="Arquivo TXT 1:").grid(row=0, column=0, padx=10, pady=10)
file_entry1 = tk.Entry(root, width=50)
file_entry1.grid(row=0, column=1, padx=10, pady=10)
tk.Button(root, text="Procurar", command=browse_file1).grid(row=0, column=2, padx=10, pady=10)

tk.Label(root, text="Arquivo TXT 2:").grid(row=1, column=0, padx=10, pady=10)
file_entry2 = tk.Entry(root, width=50)
file_entry2.grid(row=1, column=1, padx=10, pady=10)
tk.Button(root, text="Procurar", command=browse_file2).grid(row=1, column=2, padx=10, pady=10)

tk.Label(root, text="Salvar como:").grid(row=2, column=0, padx=10, pady=10)
save_entry = tk.Entry(root, width=50)
save_entry.grid(row=2, column=1, padx=10, pady=10)
tk.Button(root, text="Procurar", command=browse_save).grid(row=2, column=2, padx=10, pady=10)

tk.Button(root, text="Processar", command=process_files).grid(row=3, column=1, padx=10, pady=20)

root.mainloop()