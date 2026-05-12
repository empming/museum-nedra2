const form = document.getElementById('bond-calc');
if (form) {
  const $ = id => document.getElementById(id);
  const fmt = v => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(v) + ' ₽';

  const calc = () => {
    const qty    = Math.max(0, +$('b-qty').value || 0);
    const price  = Math.max(0, +$('b-price').value || 0);
    const days   = Math.max(0, +$('b-days').value || 0);
    const coupon = Math.max(0, +$('b-coupon').value || 0) / 100;
    const body   = qty * price;
    const cup    = body * coupon * days / 365;
    $('b-body').textContent  = fmt(body);
    $('b-cupon').textContent = fmt(cup);
    $('b-total').textContent = fmt(body + cup);
  };

  form.addEventListener('input', calc);
  calc();
}
