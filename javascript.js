// CPF
document.getElementById("cpf").addEventListener("input", function (e) {
  let valor = e.target.value.replace(/\D/g, "");

  if (valor.length > 11) valor = valor.slice(0, 11);

  valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
  valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
  valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

  e.target.value = valor;
});

// Telefone
document.getElementById("telefone").addEventListener("input", function (e) {
  let valor = e.target.value.replace(/\D/g, "");

  if (valor.length > 11) valor = valor.slice(0, 11);

  valor = valor.replace(/^(\d{2})(\d)/g, "($1) $2");
  valor = valor.replace(/(\d{5})(\d)/, "$1-$2");

  e.target.value = valor;
});
