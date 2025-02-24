// Alternar a visibilidade da sidebar em telas pequenas
const sidebar = document.querySelector(".sidebar");
const sidebarMenuButton = document.querySelector(".sidebar-menu-button");

sidebarMenuButton.addEventListener("click", () => {
    sidebar.classList.toggle("active");
});