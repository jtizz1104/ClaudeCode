// Dígito verificador módulo 11 de la SET, usado para el RUC y para el CDC.
// Los caracteres no numéricos se reemplazan por su código ASCII.
export function calcularDV(numero, baseMax = 11) {
  const limpio = String(numero)
    .toUpperCase()
    .split('')
    .map((c) => (c >= '0' && c <= '9' ? c : String(c.charCodeAt(0))))
    .join('');

  let k = 2;
  let total = 0;
  for (let i = limpio.length - 1; i >= 0; i--) {
    if (k > baseMax) k = 2;
    total += Number(limpio[i]) * k;
    k++;
  }
  const resto = total % 11;
  return resto > 1 ? 11 - resto : 0;
}

// Acepta "80012345-6" o "80012345" + dv por separado.
export function separarRuc(ruc) {
  const [numero, dv] = String(ruc).trim().split('-');
  return { numero: numero.replace(/\D/g, ''), dv: dv === undefined ? null : Number(dv) };
}

export function rucValido(ruc) {
  const { numero, dv } = separarRuc(ruc);
  if (!numero || numero.length > 8 || dv === null || Number.isNaN(dv)) return false;
  return calcularDV(numero) === dv;
}
