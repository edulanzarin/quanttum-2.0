import sys
import fitz  # PyMuPDF
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QVBoxLayout, QHBoxLayout, QPushButton, QFileDialog,
    QLabel, QWidget, QTextEdit, QLineEdit, QScrollArea, QToolBar, QStatusBar,
    QListWidget, QListWidgetItem, QMessageBox, QComboBox
)
from PyQt6.QtGui import QPixmap, QImage, QIcon, QColor, QPainter
from PyQt6.QtCore import Qt, QRect


class PDFViewer(QMainWindow):
    def __init__(self):
        super().__init__()
        self.initUI()

    def initUI(self):
        self.setWindowTitle('Leitor de PDF Moderno')
        self.setGeometry(100, 100, 1280, 800)

        # Variáveis para o PDF
        self.doc = None
        self.current_page = 0
        self.zoom_factor = 1.0
        self.search_results = []
        self.search_index = 0

        # Layout principal
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        main_layout = QHBoxLayout(main_widget)

        # Barra lateral para miniaturas
        self.thumbnail_list = QListWidget()
        self.thumbnail_list.setMaximumWidth(200)
        self.thumbnail_list.itemClicked.connect(self.on_thumbnail_click)
        main_layout.addWidget(self.thumbnail_list)

        # Área de visualização do PDF
        self.scroll_area = QScrollArea()
        self.scroll_area.setWidgetResizable(True)
        self.pdf_label = QLabel()
        self.pdf_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.scroll_area.setWidget(self.pdf_label)
        main_layout.addWidget(self.scroll_area)

        # Barra de ferramentas
        toolbar = QToolBar()
        self.addToolBar(toolbar)

        # Botão para abrir PDF
        open_action = toolbar.addAction(QIcon("open_icon.png"), "Abrir PDF")
        open_action.triggered.connect(self.open_pdf)

        # Botões de navegação
        self.prev_page_action = toolbar.addAction(QIcon("prev_icon.png"), "Página Anterior")
        self.prev_page_action.triggered.connect(self.prev_page)
        self.prev_page_action.setEnabled(False)

        self.next_page_action = toolbar.addAction(QIcon("next_icon.png"), "Próxima Página")
        self.next_page_action.triggered.connect(self.next_page)
        self.next_page_action.setEnabled(False)

        # Campo para pular para uma página específica
        self.page_input = QLineEdit()
        self.page_input.setPlaceholderText("Ir para página...")
        self.page_input.setMaximumWidth(100)
        self.page_input.returnPressed.connect(self.go_to_page)
        toolbar.addWidget(self.page_input)

        # Botões de zoom
        self.zoom_combo = QComboBox()
        self.zoom_combo.addItems(["50%", "75%", "100%", "125%", "150%", "200%"])
        self.zoom_combo.setCurrentText("100%")
        self.zoom_combo.currentTextChanged.connect(self.set_zoom)
        toolbar.addWidget(self.zoom_combo)

        # Barra de busca
        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("Buscar texto...")
        self.search_input.setMaximumWidth(200)
        self.search_input.returnPressed.connect(self.search_text)
        toolbar.addWidget(self.search_input)

        self.search_prev_action = toolbar.addAction(QIcon("prev_icon.png"), "Anterior")
        self.search_prev_action.triggered.connect(self.search_prev)
        self.search_prev_action.setEnabled(False)

        self.search_next_action = toolbar.addAction(QIcon("next_icon.png"), "Próximo")
        self.search_next_action.triggered.connect(self.search_next)
        self.search_next_action.setEnabled(False)

        # Barra de status
        self.status_bar = QStatusBar()
        self.setStatusBar(self.status_bar)

        # Aplicar estilo CSS
        self.setStyleSheet("""
            QMainWindow {
                background-color: #f5f5f5;
            }
            QToolBar {
                background-color: #ffffff;
                padding: 5px;
                border-bottom: 1px solid #ddd;
            }
            QPushButton, QToolButton {
                background-color: #0078d7;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 4px;
            }
            QPushButton:hover, QToolButton:hover {
                background-color: #005bb5;
            }
            QLineEdit {
                padding: 5px;
                border: 1px solid #ccc;
                border-radius: 4px;
            }
            QListWidget {
                background-color: white;
                border: 1px solid #ccc;
            }
            QScrollArea {
                border: none;
            }
        """)

    def open_pdf(self):
        # Abrir diálogo para selecionar o arquivo PDF
        file_path, _ = QFileDialog.getOpenFileName(self, "Abrir PDF", "", "PDF Files (*.pdf)")

        if file_path:
            # Carregar o documento PDF
            self.doc = fitz.open(file_path)
            self.current_page = 0
            self.load_thumbnails()
            self.update_ui()
            self.show_page()

    def load_thumbnails(self):
        self.thumbnail_list.clear()
        for i in range(len(self.doc)):
            page = self.doc.load_page(i)
            pix = page.get_pixmap(matrix=fitz.Matrix(0.2, 0.2))
            img = QImage(pix.samples, pix.width, pix.height, pix.stride, QImage.Format.Format_RGB888)
            item = QListWidgetItem(QIcon(QPixmap.fromImage(img)), f"Página {i + 1}")
            self.thumbnail_list.addItem(item)

    def show_page(self):
        if self.doc:
            # Obter a página atual
            page = self.doc.load_page(self.current_page)
            zoom_matrix = fitz.Matrix(self.zoom_factor, self.zoom_factor)
            pix = page.get_pixmap(matrix=zoom_matrix)

            # Converter a imagem para QImage
            img = QImage(pix.samples, pix.width, pix.height, pix.stride, QImage.Format.Format_RGB888)
            qpixmap = QPixmap.fromImage(img)

            # Desenhar um retângulo ao redor do texto encontrado (se houver busca)
            if self.search_results:
                painter = QPainter(qpixmap)
                painter.setPen(QColor(255, 0, 0))
                for result in self.search_results:
                    if result[0] == self.current_page:
                        rect = result[1]
                        painter.drawRect(int(rect.x0 * self.zoom_factor), int(rect.y0 * self.zoom_factor),
                                        int((rect.x1 - rect.x0) * self.zoom_factor), int((rect.y1 - rect.y0) * self.zoom_factor))
                painter.end()

            self.pdf_label.setPixmap(qpixmap)

            # Atualizar barra de status
            self.status_bar.showMessage(f"Página {self.current_page + 1} de {len(self.doc)}")

    def update_ui(self):
        # Habilitar/desabilitar botões de navegação
        self.prev_page_action.setEnabled(self.current_page > 0)
        self.next_page_action.setEnabled(self.current_page < len(self.doc) - 1)

    def prev_page(self):
        if self.current_page > 0:
            self.current_page -= 1
            self.show_page()
            self.update_ui()

    def next_page(self):
        if self.current_page < len(self.doc) - 1:
            self.current_page += 1
            self.show_page()
            self.update_ui()

    def go_to_page(self):
        try:
            page_num = int(self.page_input.text()) - 1
            if 0 <= page_num < len(self.doc):
                self.current_page = page_num
                self.show_page()
                self.update_ui()
        except ValueError:
            pass

    def set_zoom(self, text):
        self.zoom_factor = float(text.strip("%")) / 100
        self.show_page()

    def search_text(self):
        if self.doc:
            search_term = self.search_input.text()
            if search_term:
                self.search_results = []
                for i in range(len(self.doc)):
                    page = self.doc.load_page(i)
                    text_instances = page.search_for(search_term)
                    for inst in text_instances:
                        self.search_results.append((i, inst))
                if self.search_results:
                    self.search_index = 0
                    self.highlight_search_result()
                    self.search_prev_action.setEnabled(True)
                    self.search_next_action.setEnabled(True)
                else:
                    QMessageBox.information(self, "Busca", "Nenhum resultado encontrado.")

    def highlight_search_result(self):
        if self.search_results:
            page_num, rect = self.search_results[self.search_index]
            self.current_page = page_num
            self.show_page()

    def search_prev(self):
        if self.search_results:
            self.search_index = (self.search_index - 1) % len(self.search_results)
            self.highlight_search_result()

    def search_next(self):
        if self.search_results:
            self.search_index = (self.search_index + 1) % len(self.search_results)
            self.highlight_search_result()

    def on_thumbnail_click(self, item):
        page_num = self.thumbnail_list.row(item)
        self.current_page = page_num
        self.show_page()
        self.update_ui()


if __name__ == '__main__':
    app = QApplication(sys.argv)
    viewer = PDFViewer()
    viewer.show()
    sys.exit(app.exec())  # Corrigido: exec() em vez de exec_()