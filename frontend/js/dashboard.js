document.addEventListener("DOMContentLoaded", function () {
    // Recupera o usuário do localStorage
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    // Verifica se o usuário está logado
    if (!usuario || !usuario.id) {
        return;
    }

    // Preenche o nome do usuário no card de boas-vindas
    const nomeUsuarioElement = document.querySelector(".welcome-card h1");
    if (nomeUsuarioElement) {
        nomeUsuarioElement.textContent = `Bem-vindo, ${usuario.nome}!`;
    }

    async function obterNomeUsuario(idUsuario) {
        try {
            const usuarioCompleto = await window.electronAPI.gerenciarUsuario("obter", idUsuario);

            if (usuarioCompleto && usuarioCompleto.usuario.usuario) {
                return usuarioCompleto.usuario.usuario; // Certificando-se de pegar o nome corretamente
            }

            return "Desconhecido";
        } catch (error) {
            console.error("Erro ao buscar nome do usuário:", error);
            return "Desconhecido"; // Retorna "Desconhecido" em caso de erro
        }
    }

    async function contarLogs(filtro) {
        try {
            const resultado = await window.electronAPI.obterLogsNo(
                filtro.idUsuario || null,
                null,
                null
            );

            if (resultado.success) {
                return resultado.logs;
            } else {
                return [];
            }
        } catch (error) {
            return [];
        }
    }

    function formatarData(dataISO) {
        if (!dataISO) return "Data inválida";
        const data = new Date(dataISO);
        const dia = String(data.getDate()).padStart(2, "0");
        const mes = String(data.getMonth() + 1).padStart(2, "0");
        const ano = data.getFullYear();
        const horas = String(data.getHours()).padStart(2, "0");
        const minutos = String(data.getMinutes()).padStart(2, "0");

        return `${dia}/${mes}/${ano} - ${horas}:${minutos}`;
    }

    async function preencherTabela(logs) {
        const tbody = document.querySelector("#logs-table tbody");
        tbody.innerHTML = ""; // Limpa a tabela antes de preencher

        // Extrai todos os IDs de usuário únicos dos logs
        const idsUsuarios = [...new Set(logs.map(log => log.id_usuario))];

        // Busca todos os usuários de uma vez
        const usuarios = await Promise.all(
            idsUsuarios.map(id => window.electronAPI.gerenciarUsuario("obter", id))
        );

        // Cria um mapa de id_usuario para nome
        const mapaUsuarios = new Map();
        usuarios.forEach(usuario => {
            if (usuario && usuario.usuario && usuario.usuario.usuario) {
                mapaUsuarios.set(usuario.usuario.id, usuario.usuario.usuario);
            }
        });

        // Preenche a tabela
        logs.forEach(log => {
            const row = document.createElement("tr");

            // Obtém o nome do usuário do mapa
            const nomeUsuario = mapaUsuarios.get(log.id_usuario) || "Desconhecido";

            const usuarioCell = document.createElement("td");
            usuarioCell.textContent = nomeUsuario;
            row.appendChild(usuarioCell);

            const dataCell = document.createElement("td");
            dataCell.textContent = formatarData(log.datahora);
            row.appendChild(dataCell);

            const funcaoCell = document.createElement("td");
            funcaoCell.textContent = log.funcao;
            row.appendChild(funcaoCell);

            tbody.appendChild(row);
        });
    }

    async function preencherCards() {
        const logsUsuario = await contarLogs({idUsuario: usuario.id});
        const logsTodosUsuarios = await contarLogs({idUsuario: null});

        atualizarElemento("user-logins", logsUsuario.filter(log => log.funcao === "login").length);
        atualizarElemento("user-functions", logsUsuario.filter(log => log.funcao !== "login").length);
        atualizarElemento("total-logins", logsTodosUsuarios.filter(log => log.funcao === "login").length);
        atualizarElemento("total-functions", logsTodosUsuarios.filter(log => log.funcao !== "login").length);
        atualizarElemento("total-functions-available", 50); // Número manual de funções disponíveis

        await preencherTabela(logsTodosUsuarios);
    }

    function atualizarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
        }
    }

    preencherCards();
});
