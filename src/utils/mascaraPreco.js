/**
 * Máscara de preço: os dígitos entram pela direita, como em apps de banco.
 * Digitar 3, 4, 9 resulta em "3,49" — sem precisar tocar na vírgula.
 */
export function formatarDigitosComoPreco(texto) {
  const digitos = String(texto).replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  if (digitos === '') return '';
  return (Number(digitos) / 100).toFixed(2).replace('.', ',');
}

export function aplicarMascaraPreco(campo) {
  campo.setAttribute('inputmode', 'numeric');

  // Ao tocar no campo, seleciona tudo: o primeiro dígito digitado substitui o valor antigo.
  let acabouDeFocar = false;
  campo.addEventListener('focus', () => {
    acabouDeFocar = true;
    setTimeout(() => campo.select(), 0);
  });
  campo.addEventListener('mouseup', (evento) => {
    if (!acabouDeFocar) return;
    evento.preventDefault(); // evita que o toque desfaça a seleção
    acabouDeFocar = false;
  });
  campo.addEventListener('blur', () => {
    acabouDeFocar = false;
  });

  campo.addEventListener('input', () => {
    campo.value = formatarDigitosComoPreco(campo.value);
  });
}
