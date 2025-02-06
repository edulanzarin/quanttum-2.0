const razaoSocialData = {
    '001': 'Chocoleite Ltda',
    '002': 'DCondor S/A',
    '003': 'Doce & Companhia'
  };
  
  const bancosData = {
    '001': 'Banco do Brasil',
    '002': 'Itaú Unibanco',
    '003': 'Bradesco'
  };
  
  // Função para preencher o select de Razão Social com todas as opções
  function populateRazaoSocial() {
    const razaoSocialSelect = document.getElementById('razaoSocial');
    razaoSocialSelect.innerHTML = '<option value="" disabled selected>Selecione a Razão Social</option>';
    
    for (const [nmr, nome] of Object.entries(razaoSocialData)) {
      const option = document.createElement('option');
      option.value = nmr;
      option.textContent = nome;
      razaoSocialSelect.appendChild(option);
    }
  }
  
  // Função para preencher o select de Nome Banco com todas as opções
  function populateNomeBanco() {
    const nomeBancoSelect = document.getElementById('nomeBanco');
    nomeBancoSelect.innerHTML = '<option value="" disabled selected>Selecione o Nome Banco</option>';
    
    for (const [nmr, nome] of Object.entries(bancosData)) {
      const option = document.createElement('option');
      option.value = nmr;
      option.textContent = nome;
      nomeBancoSelect.appendChild(option);
    }
  }
  
  // Função para sincronizar a Razão Social com o número da empresa
  function updateRazaoSocial() {
    const nmrEmpresa = document.getElementById('nmrEmpresa').value;
    const razaoSocialSelect = document.getElementById('razaoSocial');
    
    // Se o número da empresa existir nos dados, seleciona automaticamente no select
    if (nmrEmpresa && razaoSocialData[nmrEmpresa]) {
      razaoSocialSelect.value = nmrEmpresa;
    }
  }
  
  // Função para sincronizar o campo de número com a seleção da Razão Social
  function syncRazaoSocial() {
    const razaoSocialSelect = document.getElementById('razaoSocial');
    const nmrEmpresaInput = document.getElementById('nmrEmpresa');
    
    // Se o select mudar, preenche o campo de número com o número correspondente
    const selectedValue = razaoSocialSelect.value;
    nmrEmpresaInput.value = selectedValue;
  }
  
  // Função para sincronizar o Nome Banco com o número do banco
  function updateNomeBanco() {
    const nmrBanco = document.getElementById('nmrBanco').value;
    const nomeBancoSelect = document.getElementById('nomeBanco');
    
    // Se o número do banco existir nos dados, seleciona automaticamente no select
    if (nmrBanco && bancosData[nmrBanco]) {
      nomeBancoSelect.value = nmrBanco;
    }
  }
  
  // Função para sincronizar o campo de número com a seleção do Nome Banco
  function syncNomeBanco() {
    const nomeBancoSelect = document.getElementById('nomeBanco');
    const nmrBancoInput = document.getElementById('nmrBanco');
    
    // Se o select mudar, preenche o campo de número com o número correspondente
    const selectedValue = nomeBancoSelect.value;
    nmrBancoInput.value = selectedValue;
  }
  
  // Popula os selects quando a página carregar
  window.onload = function() {
    populateRazaoSocial();
    populateNomeBanco();
  };
  