/* Storefront (pembeli) + halaman awal demo */
const buyer = () => S.session.buyer ? cust(S.session.buyer) : null;
const avail = (p, v) => p.po.on ? (p.po.quota ? Math.max(0, p.po.quota - p.po.sold) : 999) : v.stock;
const minPrice = p => Math.min(...p.variants.map(v => v.price));
const cartRows = () => S.cart.map(c => { const p = prod(c.pid), v = p && p.variants.find(x => x.id === c.vid); return p && v ? { c, p, v } : null; }).filter(Boolean);
const cartCount = () => S.cart.reduce((a, c) => a + c.qty, 0);
const isLive = () => S.store && S.store.status === 'live';

/* ---------- halaman awal demo ---------- */
V.home = () => `<div class="wrap hero"><div class="big">Prototipe Tabyte</div>
<p class="muted" style="max-width:62ch;font-size:15px">Website lengkap yang bisa diklik: storefront pembeli, Seller Center, dan Webmaster (admin). Alurnya mengikuti repo marketplace dan sudah disesuaikan dengan hasil QA di Workflow Tabyte. Data hanya tersimpan di browser ini; tombol <b>Reset demo</b> di atas mengembalikan kondisi awal.</p>
<div class="g3 mt2">
<a class="scn" href="#/admin" data-act="startOnboarding"><div class="pill info">Skenario 1</div><h3 style="margin:8px 0 4px">Onboarding toko</h3><div class="muted sm">Dari nol: admin buat toko → undangan → profil → dokumen usaha → review → Sub ID → checklist go-live → toko aktif + badge.</div></a>
<a class="scn" href="#/store" data-act="startLive"><div class="pill info">Skenario 2</div><h3 style="margin:8px 0 4px">Belanja &amp; order</h3><div class="muted sm">Toko Teknik Jaya sudah aktif. Daftar OTP/tamu, checkout kurir, pickup, pre-order, bayar, seller memproses, selesai, retur.</div></a>
<a class="scn" href="#/seller/finance" data-act="startLiveSeller"><div class="pill info">Skenario 3</div><h3 style="margin:8px 0 4px">Saldo, rekening &amp; penarikan</h3><div class="muted sm">Tambah rekening, admin verifikasi, tarik saldo dengan validasi, admin proses transfer, lihat mutasi.</div></a>
</div>
<div class="card mt2"><h3>Akun demo</h3><div class="g3 mt"><div><div class="b">Seller</div><div class="mono sm">rizal@teknikjaya.example<br>password</div></div><div><div class="b">Pembeli</div><div class="mono sm">rizal-pratama@example.com<br>password · atau OTP WA 081234567890</div></div><div><div class="b">Admin Tabyte</div><div class="muted sm">Selalu masuk di Webmaster</div></div></div>
<div class="sep"></div><div class="sm muted">Email dan WhatsApp yang seharusnya dikirim sistem (undangan, kode OTP, kode ambil, notifikasi order) muncul di <b>Kotak masuk simulasi</b> di bilah atas. Panel berbingkai putus-putus kuning adalah <b>alat simulasi prototipe</b> (mis. pembayaran Midtrans, kurir menandai sampai) yang tidak ada di produksi.</div></div></div>`;
A.startOnboarding = () => { S = seed('start'); return true; };
A.startLive = () => { S = seed('live'); return true; };
A.startLiveSeller = () => { S = seed('live'); S.session.seller = true; return true; };

/* ---------- shell ---------- */
function sfShell(body, active = '') {
  const b = buyer(), g = S.session.guest;
  const st = S.store;
  const preview = st.status !== 'live';
  return `${preview ? `<div class="alert warn center" style="border-radius:0">Pratinjau draf, hanya terlihat oleh seller. Publik melihat “Toko sedang tidak aktif”.</div>` : ''}
<header class="sf-head"><div class="wrap"><a class="logo" href="#/store">${esc(st.name)}</a>
<input class="in" style="max-width:480px" type="search" placeholder="Cari di ${esc(st.name)}…" data-act-input="search" oninput="A.search(this.value)">
<span class="grow"></span><a href="#/store/cart" class="btn" aria-label="Keranjang">Keranjang${cartCount() ? ` <span class="pill bad">${cartCount()}</span>` : ''}</a>
${b ? `<a class="btn" href="#/store/account">${esc(b.name.split(' ')[0])}</a>` : g ? `<span class="pill gray">Tamu: ${esc(g.name.split(' ')[0])}</span>` : `<button class="btn primary" data-act="openLogin" data-arg="">Masuk / Daftar</button>`}</div></header>
<div class="wrap sf-main">${body}</div>
<footer class="wrap sm muted" style="padding:20px 18px 40px;border-top:1px solid var(--line)">${esc(st.name)} · berjualan di Tabyte · Pembayaran aman via Midtrans</footer>`;
}
A.search = q => { q = q.toLowerCase(); document.querySelectorAll('.pcard').forEach(c => c.style.display = c.dataset.name.includes(q) ? '' : 'none'); return false; };
window.A = A;

V.store = p => {
  if (!S.store) return `<div class="wrap sf-main"><div class="empty"><h2>Belum ada toko</h2><p>Toko dibuat oleh admin lewat Webmaster. Mulai dari <a href="#/admin">Skenario 1</a> atau reset ke toko demo aktif.</p></div></div>`;
  if (S.store.status !== 'live' && !S.session.seller) return `<div class="wrap sf-main center" style="padding-top:80px"><h2>Toko sedang tidak aktif</h2><p class="muted">${esc(S.store.name)} belum dibuka. Silakan kembali lagi nanti.</p></div>`;
  const [r, a, b] = p;
  if (!r) return sfShell(storeHome());
  if (r === 'p') return sfShell(productPage(a));
  if (r === 'cart') return sfShell(cartPage());
  if (r === 'checkout') return sfShell(checkoutPage());
  if (r === 'pay') return sfShell(payPage(a));
  if (r === 'order') { location.hash = '#/store/account/orders/' + a; return ''; }
  if (r === 'return') return sfShell(returnPage(a));
  if (r === 'account') return sfShell(accountPage(a, b));
  return sfShell('<div class="empty">Halaman tidak ditemukan</div>');
};

function storeHome() {
  const st = S.store, ver = st.business.status === 'APPROVED';
  const ps = S.products.filter(x => x.status === 'LIVE');
  return `<div class="card row" style="gap:18px;margin-bottom:22px"><div class="ph" style="${phc('', 0)};width:72px;height:72px;border-radius:14px">${esc(st.name.split(' ').map(w => w[0]).join('').slice(0, 2))}</div>
<div class="grow"><div class="row wrap" style="gap:10px"><h1 style="font-size:24px">${esc(st.name)}</h1>${ver ? '<span class="ver">✓ Terverifikasi</span>' : ''}</div><div class="muted">${esc(st.profile.desc)}</div><div class="sm muted mt">📍 ${esc(st.profile.city)} · ${esc(st.profile.hours)}${st.pickup ? ' · Bisa ambil di toko' : ''}</div></div></div>
${ps.length ? `<div class="pgrid">${ps.map(p => { const soldout = p.variants.every(v => avail(p, v) <= 0); return `<a class="pcard" href="#/store/p/${p.slug}" data-name="${esc(p.name.toLowerCase())}">${thumb(p, 'full')}<div class="b2"><div class="b">${esc(p.name)}</div><div class="mono b" style="color:var(--ink)">${p.variants.length > 1 ? 'mulai ' : ''}${rp(minPrice(p))}</div>${p.po.on ? `<span class="po">Pre-Order · ±${p.po.days} hari</span>` : ''}${soldout && !p.po.on ? '<div class="sm" style="color:var(--bad-ink);font-weight:700">Stok habis</div>' : ''}</div></a>`; }).join('')}</div>` : '<div class="empty">Belum ada produk.</div>'}`;
}

function productPage(slug) {
  const p = S.products.find(x => x.slug === slug);
  if (!p || (p.status !== 'LIVE' && !S.session.seller)) return `<div class="empty"><h2>Produk tidak tersedia</h2><a href="#/store">← Kembali ke toko</a></div>`;
  const sel = S.ui.sel[p.id] ||= { vid: p.variants[0].id, qty: p.minBuy };
  const v = p.variants.find(x => x.id === sel.vid) || p.variants[0], av = avail(p, v), max = Math.min(p.maxBuy, av);
  const ver = S.store.business.status === 'APPROVED';
  return `<a href="#/store" class="sm">← ${esc(S.store.name)}</a>${p.status !== 'LIVE' ? '<div class="alert warn mt">Produk Draft, hanya seller yang bisa melihat. Pembeli akan melihat “Produk tidak tersedia”.</div>' : ''}
<div class="g2 mt" style="grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:28px"><div>${thumb(p, 'full')}</div><div class="col">
<h1 style="font-size:24px">${esc(p.name)}</h1>${p.po.on ? `<div><span class="po">Pre-Order · dikirim ±${p.po.days} hari setelah pembayaran</span></div>` : ''}
<div class="mono" style="font-size:26px;font-weight:800;color:var(--ink)">${rp(v.price)}</div>
<div><div class="lbl">Varian</div><div class="row wrap" style="gap:8px">${p.variants.map(x => `<button class="chip ${x.id === v.id ? 'on' : ''}" data-act="pickVar" data-arg="${p.id}|${x.id}" ${avail(p, x) <= 0 && !p.po.on ? 'disabled' : ''}>${esc(x.name)} · ${rp(x.price)}</button>`).join('')}</div></div>
<div><div class="lbl">Jumlah</div><div class="row"><div class="qty"><button data-act="qty" data-arg="${p.id}|-1" aria-label="Kurangi">−</button><span>${sel.qty}</span><button data-act="qty" data-arg="${p.id}|1" aria-label="Tambah">+</button></div><span class="sm muted">${p.po.on ? (p.po.quota ? `Sisa kuota ${av}` : '') : `Stok ${av}`} · min ${p.minBuy}, maks ${p.maxBuy}</span></div></div>
${max <= 0 ? '<div class="alert bad">Stok habis</div>' : ''}
<div class="row wrap"><button class="btn" data-act="addCart" data-arg="${p.id}" ${max <= 0 ? 'disabled' : ''}>+ Keranjang</button><button class="btn primary" data-act="buyNow" data-arg="${p.id}" ${max <= 0 ? 'disabled' : ''}>Beli sekarang</button></div>
<div class="sep"></div><div class="sm muted">${esc(p.desc)}</div>
<div class="card tight row"><div class="ph" style="${phc('', 0)};width:42px;border-radius:10px;font-size:15px">${esc(S.store.name.split(' ').map(w => w[0]).join('').slice(0, 2))}</div><div class="grow"><b>${esc(S.store.name)}</b> ${ver ? '<span class="ver">✓ Terverifikasi</span>' : ''}<div class="sm muted">${esc(S.store.profile.city)}</div></div></div>
${S.reviews.filter(r => r.pid === p.id).length ? `<div class="sep"></div><h3>Ulasan</h3>${S.reviews.filter(r => r.pid === p.id).map(r => `<div class="mt"><span class="star">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</span> <b class="sm">${esc(r.name)}</b><div class="sm">${esc(r.text)}</div></div>`).join('')}` : ''}
</div></div>`;
}
A.pickVar = a => { const [pid, vid] = a.split('|'); const s = S.ui.sel[pid] ||= {}; s.vid = vid; s.qty = prod(pid).minBuy; };
A.qty = a => { const [pid, d] = a.split('|'); const p = prod(pid), s = S.ui.sel[pid], v = p.variants.find(x => x.id === s.vid); const max = Math.min(p.maxBuy, avail(p, v)); s.qty = Math.max(p.minBuy, Math.min(max || p.minBuy, s.qty + +d)); };
function addToCart(pid) {
  const p = prod(pid), s = S.ui.sel[pid] ||= { vid: p.variants[0].id, qty: p.minBuy }, v = p.variants.find(x => x.id === s.vid);
  const ex = S.cart.find(c => c.pid === pid && c.vid === v.id), q = (ex ? ex.qty : 0) + s.qty;
  if (q > Math.min(p.maxBuy, avail(p, v))) { toast('Jumlah melebihi stok atau batas beli'); return false; }
  if (ex) ex.qty = q; else S.cart.push({ pid, vid: v.id, qty: s.qty }); return true;
}
A.addCart = pid => { if (addToCart(pid)) toast('Ditambahkan ke keranjang'); };
A.buyNow = pid => { if (addToCart(pid)) location.hash = '#/store/checkout'; };

function cartPage() {
  const rows = cartRows();
  if (!rows.length) return `<div class="empty"><h2>Keranjang kosong</h2><a class="btn primary mt" href="#/store">Mulai belanja</a></div>`;
  const sub = rows.reduce((a, r) => a + r.v.price * r.c.qty, 0);
  return `<h1>Keranjang</h1><div class="g2 mt" style="grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);align-items:start"><div class="col">${rows.map(({ c, p, v }) => `<div class="card row">${thumb(p, 64)}<div class="grow"><a class="b" href="#/store/p/${p.slug}">${esc(p.name)}</a><div class="sm muted">${esc(v.name)}${p.po.on ? ' · <span class="po">Pre-Order</span>' : ''}</div><div class="mono b">${rp(v.price)}</div></div>
<div class="qty"><button data-act="cartQty" data-arg="${p.id}|${v.id}|-1">−</button><span>${c.qty}</span><button data-act="cartQty" data-arg="${p.id}|${v.id}|1">+</button></div><button class="btn sm danger" data-act="cartDel" data-arg="${p.id}|${v.id}">Hapus</button></div>`).join('')}</div>
<div class="card"><h3>Ringkasan</h3><div class="kv mt"><span>Subtotal</span><span class="mono">${rp(sub)}</span></div><div class="sm muted">Ongkir dihitung di checkout</div><a class="btn primary block mt" href="#/store/checkout">Checkout</a></div></div>`;
}
A.cartQty = a => { const [pid, vid, d] = a.split('|'); const c = S.cart.find(x => x.pid === pid && x.vid === vid), p = prod(pid), v = p.variants.find(x => x.id === vid); const q = c.qty + +d; if (q < p.minBuy) { S.cart = S.cart.filter(x => x !== c); return; } if (q > Math.min(p.maxBuy, avail(p, v))) { toast('Melebihi stok atau batas beli'); return; } c.qty = q; };
A.cartDel = a => { const [pid, vid] = a.split('|'); S.cart = S.cart.filter(x => !(x.pid === pid && x.vid === vid)); };

/* ---------- login / daftar (OTP WA, email, tamu) ---------- */
const LG = () => S.ui.login ||= { tab: 'otp', step: 'form', wa: '', name: '', email: '', pw: '', code: '', priv: true, err: '' };
A.openLogin = after => { S.ui.after = after || ''; S.ui.login = { tab: 'otp', step: 'form', wa: '', name: '', email: '', pw: '', code: '', priv: true, err: '' }; openModal(loginModal()); return false; };
function loginModal() {
  const l = LG(), tab = (k, t) => `<button class="tab ${l.tab === k ? 'on' : ''}" data-act="lgTab" data-arg="${k}">${t}</button>`;
  let body;
  if (l.tab === 'otp' && l.step === 'verify') {
    const left = Math.max(0, Math.ceil((S.otp.resendAt - now()) / 1000));
    body = `<p class="muted">Kode 6 digit dikirim ke WhatsApp <b class="mono">${esc(S.otp.wa)}</b>. Cek <b>Kotak masuk simulasi</b> di bilah atas.</p>
    ${inp('ui.login.code', { label: 'Kode OTP', mono: 1, ph: '6 digit', err: l.err })}
    <button class="btn primary block" data-act="lgVerify">Verifikasi</button><div class="sm center mt muted">Berlaku 5 menit · ${left > 0 ? `kirim ulang dalam ${left} dtk (klik Segarkan)` : '<a href="#" data-act="lgResend">Kirim ulang kode</a>'} · <a href="#" data-act="lgTab" data-arg="otp">Ganti nomor</a></div>${left > 0 ? '<div class="center mt"><button class="btn sm" data-act="lgRefresh">Segarkan</button></div>' : ''}`;
  } else if (l.tab === 'otp') {
    body = `${inp('ui.login.wa', { label: 'Nomor WhatsApp', ph: '0812…', mono: 1, hint: 'Akun lama langsung masuk; nomor baru otomatis didaftarkan.' })}${inp('ui.login.name', { label: 'Nama (untuk akun baru)' })}
    <label class="row sm" style="align-items:flex-start;margin-bottom:12px">${inp('ui.login.priv', { type: 'checkbox' })}<span>Saya setuju dengan Kebijakan Privasi Tabyte. Satu akun berlaku untuk semua toko Tabyte.</span></label>${l.err ? `<div class="errt" style="margin:-6px 0 10px">${l.err}</div>` : ''}
    <button class="btn primary block" data-act="lgSend">Kirim kode OTP</button>`;
  } else if (l.tab === 'email') {
    body = `${inp('ui.login.email', { label: 'Email', type: 'email' })}${inp('ui.login.pw', { label: 'Kata sandi', type: 'password' })}${l.err ? `<div class="errt" style="margin:-6px 0 10px">${l.err}</div>` : ''}<button class="btn primary block" data-act="lgEmail">Masuk</button><div class="sm muted center mt">Belum punya akun? Pakai tab <b>OTP WhatsApp</b>, daftar tanpa kata sandi.</div>`;
  } else {
    body = `<p class="muted">Belanja tanpa membuat akun. Pesanan tertaut otomatis bila nanti Anda mendaftar dengan WA/email yang sama.</p>${inp('ui.login.name', { label: 'Nama' })}${inp('ui.login.wa', { label: 'Nomor WhatsApp', mono: 1 })}${l.err ? `<div class="errt" style="margin:-6px 0 10px">${l.err}</div>` : ''}<button class="btn primary block" data-act="lgGuest">Lanjut sebagai tamu</button>`;
  }
  return `<div class="modal"><div class="row between"><h3>Masuk ke ${esc(S.store ? S.store.name : 'Tabyte')}</h3><button class="btn sm" data-act="closeM">✕</button></div><div class="tabs mt">${tab('otp', 'OTP WhatsApp')}${tab('email', 'Email &amp; sandi')}${tab('guest', 'Tamu')}</div>${body}</div>`;
}
const relogin = () => { openModal(loginModal()); return false; };
A.lgTab = t => { const l = LG(); l.tab = t; l.step = 'form'; l.err = ''; return relogin(); };
A.lgRefresh = relogin;
const okWa = w => /^0\d{8,13}$/.test(String(w).replace(/[\s-]/g, ''));
const nWa = w => String(w).replace(/[\s-]/g, '');
function sendOtp() {
  const l = LG(), wa = nWa(l.wa), ex = S.customers.find(c => c.wa === wa);
  if (!okWa(wa)) { l.err = 'Nomor WhatsApp tidak valid.'; return; }
  if (!ex && !l.name.trim()) { l.err = 'Isi nama untuk akun baru.'; return; }
  if (!ex && !l.priv) { l.err = 'Setujui Kebijakan Privasi untuk mendaftar.'; return; }
  const code = String(Math.floor(100000 + Math.random() * 900000));
  S.otp = { wa, name: l.name.trim(), code, exp: now() + 5 * 60e3, tries: 3, resendAt: now() + 45e3, isNew: !ex };
  notify('buyer', 'WA', 'Kode OTP Tabyte', `Kode OTP Anda ${code}. Berlaku 5 menit. Jangan bagikan ke siapa pun.`, '', ''); l.step = 'verify'; l.err = ''; l.code = '';
}
A.lgSend = () => { sendOtp(); return relogin(); };
A.lgResend = () => { const l = LG(); l.err = ''; sendOtp(); toast('Kode baru dikirim'); return relogin(); };
function afterLogin() { closeModal(); toast('Berhasil masuk. Keranjang tamu digabung ke akun'); if (S.ui.after) location.hash = S.ui.after; S.ui.after = ''; }
A.lgVerify = () => {
  const l = LG(), o = S.otp; if (!o) return;
  if (now() > o.exp) { l.err = 'Kode kedaluwarsa. Kirim ulang kode.'; return relogin(); }
  if (o.tries <= 0) { l.err = 'Terlalu banyak percobaan. Kirim ulang kode.'; return relogin(); }
  if (String(l.code).trim() !== o.code) { o.tries--; l.err = `Kode salah. Sisa percobaan ${o.tries}.`; return relogin(); }
  let c = S.customers.find(x => x.wa === o.wa);
  if (!c) { c = { id: 'c' + uid(), name: o.name, wa: o.wa, email: '', password: '', addresses: [] }; S.customers.push(c); }
  S.session.buyer = c.id; S.session.guest = null; S.otp = null; afterLogin(); return false;
};
A.lgEmail = () => {
  const l = LG(), c = S.customers.find(x => x.email.toLowerCase() === l.email.trim().toLowerCase() && x.password && x.password === l.pw);
  if (!c) { l.err = 'Email atau kata sandi salah.'; return relogin(); }
  S.session.buyer = c.id; S.session.guest = null; afterLogin(); return false;
};
A.lgGuest = () => { const l = LG(); if (!l.name.trim() || !okWa(nWa(l.wa))) { l.err = 'Isi nama dan nomor WhatsApp yang valid.'; return relogin(); } S.session.guest = { name: l.name.trim(), wa: nWa(l.wa) }; afterLogin(); return false; };
A.logout = () => { S.session.buyer = null; S.session.guest = null; location.hash = '#/store'; };

/* ---------- alamat (dipakai checkout & akun) ---------- */
const AF = () => S.ui.af ||= { label: 'Rumah', name: '', wa: '', addr: '', city: 'Surabaya', kec: 'Rungkut', zip: '60293', id: '' };
function addrForm(pfx = 'ui.af') {
  const f = getPath(S, pfx), w = wil(f.city);
  return `<div class="g2">${inp(pfx + '.name', { label: 'Nama penerima' })}${inp(pfx + '.wa', { label: 'Nomor WhatsApp', mono: 1 })}</div>${inp(pfx + '.addr', { label: 'Alamat lengkap', type: 'textarea', rows: 2 })}
  <div class="g3">${inp(pfx + '.city', { label: 'Kota', type: 'select', opts: WIL.map(x => x.city), on: 'afCity:' + pfx })}${inp(pfx + '.kec', { label: 'Kecamatan', type: 'select', opts: Object.keys(w.kec), on: 'afKec:' + pfx })}${inp(pfx + '.zip', { label: 'Kode pos', ro: 1, mono: 1, hint: 'Terisi otomatis dari kecamatan' })}</div>`;
}
// handler data-on bernama dinamis "afCity:path"
const origOnInput = onInput;
document.removeEventListener('input', onInput);
document.addEventListener('input', e => {
  const on = e.target.dataset.on || '';
  if (on.startsWith('afCity:') || on.startsWith('afKec:')) {
    const k = e.target.dataset.k; setPath(S, k, e.target.value);
    const pfx = on.split(':')[1], f = getPath(S, pfx);
    if (on.startsWith('afCity:')) f.kec = Object.keys(wil(f.city).kec)[0];
    f.zip = wil(f.city).kec[f.kec]; persist(); render(); return;
  }
  origOnInput(e);
});
const addrOk = f => f.name.trim() && okWa(nWa(f.wa)) && f.addr.trim().length > 4;
const addrStr = a => `${a.addr}, ${a.kec}, ${a.city} ${a.zip}`;

/* ---------- checkout ---------- */
const CO = () => S.ui.co ||= { type: 'kurir', addrId: '', ship: -1, poOk: false, g: { label: '', name: '', wa: '', addr: '', city: 'Surabaya', kec: 'Dukuh Pakis', zip: '60225' }, newAddr: false, pay: 'qris' };
function checkoutPage() {
  const rows = cartRows(); if (!rows.length) return `<div class="empty"><h2>Keranjang kosong</h2><a class="btn primary mt" href="#/store">Belanja dulu</a></div>`;
  const b = buyer(), g = S.session.guest;
  if (!b && !g) return `<div class="card center" style="max-width:520px;margin:30px auto"><h2>Masuk untuk checkout</h2><p class="muted">Masuk dengan OTP WhatsApp atau lanjut sebagai tamu, tanpa harus daftar dengan email dan kata sandi.</p><button class="btn primary" data-act="openLogin" data-arg="#/store/checkout">Masuk / lanjut sebagai tamu</button></div>`;
  const co = CO(), kg = rows.reduce((a, r) => a + r.p.weight * r.c.qty, 0), sub = rows.reduce((a, r) => a + r.v.price * r.c.qty, 0), hasPo = rows.some(r => r.p.po.on);
  let addr;
  if (b) { if (!co.addrId || !b.addresses.find(a => a.id === co.addrId)) co.addrId = (b.addresses.find(a => a.primary) || b.addresses[0] || {}).id || ''; addr = b.addresses.find(a => a.id === co.addrId); } else addr = co.g.addr ? co.g : null;
  const needAddr = co.type === 'kurir';
  const opts = addr && needAddr ? shipOptions(addr, kg) : [];
  if (co.ship >= opts.length) co.ship = -1;
  const ship = needAddr ? opts[co.ship] : null, shipCost = ship ? ship.cost : 0, total = sub + shipCost + 1000;
  const oc = S.store.profile.city;
  const ready = (co.type === 'pickup' || (addr && ship)) && (!hasPo || co.poOk);
  return `<h1>Checkout</h1><div class="g2 mt" style="grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);align-items:start"><div class="col">
<div class="card"><h3>Pengiriman</h3><div class="row mt wrap"><label class="opt ${co.type === 'kurir' ? 'sel' : ''}" style="flex:1"><input type="radio" name="dt" ${co.type === 'kurir' ? 'checked' : ''} data-act="coType" data-arg="kurir"> Kirim ke alamat</label>${S.store.pickup ? `<label class="opt ${co.type === 'pickup' ? 'sel' : ''}" style="flex:1"><input type="radio" name="dt" ${co.type === 'pickup' ? 'checked' : ''} data-act="coType" data-arg="pickup"> Ambil di toko · Gratis ongkir</label>` : ''}</div></div>
${co.type === 'pickup' ? `<div class="card"><h3>Ambil di toko</h3><div class="sm muted mt">${esc(S.store.profile.address)}, ${esc(S.store.profile.city)}<br>${esc(S.store.profile.hours)}</div><div class="alert info mt">Setelah pesanan siap, Anda menerima <b>kode ambil</b> dan batas waktu pengambilan 3 hari.</div></div>` : `
<div class="card"><div class="row between"><h3>Alamat pengiriman</h3>${b ? `<button class="btn sm" data-act="coNewAddr">${co.newAddr ? 'Batal' : '+ Alamat baru'}</button>` : ''}</div><div class="col mt">
${b && !co.newAddr ? (b.addresses.length ? b.addresses.map(a => `<label class="opt ${a.id === co.addrId ? 'sel' : ''}"><input type="radio" name="ad" ${a.id === co.addrId ? 'checked' : ''} data-act="coAddr" data-arg="${a.id}"><div class="grow"><b>${esc(a.label || 'Alamat')}</b> ${a.primary ? pill('Utama', 'info') : ''}<div class="sm muted">${esc(a.name)} · ${esc(a.wa)}<br>${esc(addrStr(a))}</div></div></label>`).join('') : '<div class="alert warn">Belum ada alamat. Tambah alamat baru.</div>') : `${b ? '' : '<div class="sm muted">Isi alamat tujuan pengiriman.</div>'}${addrForm(b ? 'ui.af' : 'ui.co.g')}<button class="btn primary" data-act="${b ? 'coSaveAddr' : 'coGuestAddr'}">Gunakan alamat ini</button>`}
</div></div>
<div class="card"><h3>Kurir <span class="sm muted" style="font-weight:500">· asal ${esc(oc)} (${esc(S.store.profile.kec)})${addr ? ' → ' + esc(addr.city) + ' (' + esc(addr.kec) + ')' : ''}</span></h3><div class="col mt">
${!addr ? '<div class="muted">Pilih alamat untuk melihat ongkir dari kurir.</div>' : opts.map(o => `<label class="opt ${co.ship === o.id ? 'sel' : ''}"><input type="radio" name="sh" ${co.ship === o.id ? 'checked' : ''} data-act="coShip" data-arg="${o.id}"><div class="grow"><b>${o.c} ${o.s}</b> <span class="sm muted">· ${o.eta}</span></div><span class="mono b">${rp(o.cost)}</span></label>`).join('') + (addr.city !== oc ? `<div class="sm muted">GoSend/Grab instan hanya tersedia bila alamat tujuan satu kota dengan toko (${esc(oc)}).</div>` : '')}</div></div>`}
${hasPo ? `<div class="card"><div class="alert info"><b>Ada produk Pre-Order.</b> Barang dikirim ±${Math.max(...rows.filter(r => r.p.po.on).map(r => r.p.po.days))} hari setelah pembayaran, dibayar penuh sekarang.</div><label class="row mt" style="align-items:flex-start"><input type="checkbox" ${co.poOk ? 'checked' : ''} data-k="ui.co.poOk" data-on="rerender"><span>Saya mengerti ini pesanan Pre-Order dan menyetujui estimasi kirim.</span></label></div>` : ''}
</div>
<div class="card"><h3>Ringkasan</h3><div class="col mt" style="gap:8px">${rows.map(({ c, p, v }) => `<div class="row"><div class="grow sm">${esc(p.name)} · ${esc(v.name)} ×${c.qty}${p.po.on ? ' <span class="po">PO</span>' : ''}</div><span class="mono sm">${rp(v.price * c.qty)}</span></div>`).join('')}</div><div class="sep"></div>
<div class="kv"><span>Subtotal</span><span class="mono">${rp(sub)}</span></div><div class="kv"><span>Ongkir</span><span class="mono">${co.type === 'pickup' ? 'Gratis' : ship ? rp(ship.cost) : '—'}</span></div><div class="kv"><span>Biaya layanan</span><span class="mono">${rp(1000)}</span></div>
<div class="kv b" style="font-size:16px"><span>Total</span><span class="mono">${rp(total)}</span></div><div class="sm muted">Bayar paling lambat 24 jam setelah pesanan dibuat.</div>
<button class="btn primary block mt" data-act="placeOrder" ${ready ? '' : 'disabled'}>Buat pesanan</button>${!ready ? `<div class="hint">${co.type === 'kurir' && !addr ? 'Pilih/isi alamat' : co.type === 'kurir' && !ship ? 'Pilih kurir' : 'Setujui estimasi Pre-Order'} untuk melanjutkan.</div>` : ''}</div></div>`;
}
A.coType = t => { CO().type = t; CO().ship = -1; };
A.coAddr = id => { CO().addrId = id; CO().ship = -1; };
A.coShip = id => { CO().ship = +id; };
A.coNewAddr = () => { CO().newAddr = !CO().newAddr; const b = buyer(); S.ui.af = { label: 'Alamat baru', name: b.name, wa: b.wa, addr: '', city: 'Surabaya', kec: 'Rungkut', zip: '60293', id: '' }; };
A.coSaveAddr = () => { const f = AF(), b = buyer(); if (!addrOk(f)) { toast('Lengkapi nama, WA, dan alamat'); return false; } const a = { ...f, id: 'a' + uid(), primary: !b.addresses.length }; b.addresses.push(a); CO().addrId = a.id; CO().newAddr = false; CO().ship = -1; };
A.coGuestAddr = () => { const g = CO().g; if (!addrOk(g)) { toast('Lengkapi nama, WA, dan alamat'); return false; } g.label = 'Tamu'; CO().ship = -1; toast('Alamat dipakai'); };
A.placeOrder = () => {
  const rows = cartRows(), co = CO(), b = buyer(), g = S.session.guest; if (!rows.length) return;
  const kg = rows.reduce((a, r) => a + r.p.weight * r.c.qty, 0);
  for (const { c, p, v } of rows) if (c.qty > avail(p, v)) { toast(`Stok ${p.name} tidak cukup`); return false; }
  let addr = co.type === 'kurir' ? (b ? b.addresses.find(a => a.id === co.addrId) : co.g) : { name: b ? b.name : g.name, wa: b ? b.wa : g.wa };
  const ship = co.type === 'kurir' ? shipOptions(addr, kg)[co.ship] : null;
  const o = placeOrder({ type: co.type, addr, ship, items: rows.map(({ c, p, v }) => ({ pid: p.id, vid: v.id, name: p.name, vname: v.name, price: v.price, qty: c.qty, po: p.po.on })), buyerName: b ? b.name : g.name, buyerWa: b ? b.wa : g.wa, cid: b ? b.id : null });
  S.cart = []; S.ui.co = null; S.ui.lastGuestOrder = g ? o.id : null;
  notify('buyer', 'Email', `Pesanan ${o.no} dibuat`, `Selesaikan pembayaran ${rp(o.total)} sebelum ${dt(o.payBy)}.`, '#/store/pay/' + o.id, 'Bayar sekarang');
  location.hash = '#/store/pay/' + o.id;
};

/* ---------- pembayaran ---------- */
function payPage(id) {
  const o = order(id); if (!o) return '<div class="empty">Pesanan tidak ditemukan</div>';
  if (o.status !== 'UNPAID') return `<div class="card center" style="max-width:520px;margin:20px auto"><h2>${o.status === 'CANCELLED' ? 'Pesanan dibatalkan' : 'Pembayaran diterima'}</h2><p class="muted">${esc(o.no)} · ${o.status === 'CANCELLED' ? esc(o.cancelReason) : 'Pesanan diteruskan ke penjual.'}</p><a class="btn primary" href="#/store/account/orders/${o.id}">Lihat pesanan</a></div>`;
  const m = S.ui.payM ||= 'qris';
  return `<div style="max-width:640px;margin:0 auto" class="col"><div class="card"><div class="row between"><h2>Selesaikan pembayaran</h2><span class="pill warn">Sisa ${cd(o.payBy)}</span></div><div class="sm muted">Order ${esc(o.no)} · bayar sebelum ${dt(o.payBy)}. Lewat batas, pesanan batal otomatis dan stok kembali.</div>
<div class="kv b mt" style="font-size:18px"><span>Total</span><span class="mono">${rp(o.total)}</span></div>
<div class="col mt" style="gap:8px">${[['qris', 'QRIS'], ['va', 'Virtual Account BCA'], ['gopay', 'GoPay / e-wallet']].map(([k, t]) => `<label class="opt ${m === k ? 'sel' : ''}"><input type="radio" ${m === k ? 'checked' : ''} data-act="payM" data-arg="${k}"> ${t}</label>`).join('')}</div>
<div class="row mt" style="gap:18px;align-items:flex-start">${m === 'qris' ? '<div class="qr" role="img" aria-label="QRIS"></div>' : ''}<div class="sm muted">${m === 'qris' ? 'Pindai kode QRIS dengan aplikasi bank atau e-wallet.' : m === 'va' ? 'Nomor VA: <b class="mono">8077 0812 3456 7890</b>' : 'Anda akan diarahkan ke aplikasi e-wallet.'}</div></div></div>
<div class="simbox"><div class="t">Simulasi prototipe · tidak ada di produksi</div><div class="sm muted" style="margin-bottom:8px">Di produksi status berubah otomatis lewat webhook Midtrans. Pakai tombol ini untuk mensimulasikannya.</div><div class="row wrap"><button class="btn ok sm" data-act="simPay" data-arg="${o.id}">Pembayaran berhasil</button><button class="btn sm" data-act="simExpire" data-arg="${o.id}">Lewat batas waktu bayar</button></div></div></div>`;
}
A.payM = k => { S.ui.payM = k; };
A.simPay = id => { markPaid(order(id)); toast('Pembayaran berhasil. Seller dinotifikasi'); location.hash = '#/store/account/orders/' + id; };
A.simExpire = id => { order(id).payBy = now() - 1; };

/* ---------- akun pembeli ---------- */
function accountPage(a, id) {
  const b = buyer(), g = S.session.guest;
  if (!b && g && a === 'orders' && id) return `<div class="alert info" style="margin-bottom:14px">Anda berbelanja sebagai tamu. Daftar dengan OTP WhatsApp (nomor yang sama) agar pesanan tertaut ke akun.</div>` + buyerOrder(id);
  if (!b) return `<div class="card center" style="max-width:520px;margin:30px auto"><h2>Masuk untuk melihat akun</h2>${g ? '<p class="muted">Anda berbelanja sebagai tamu. Daftar dengan OTP WhatsApp (nomor yang sama) agar pesanan tamu tertaut otomatis.</p>' : ''}<button class="btn primary" data-act="openLogin" data-arg="#/store/account">Masuk / Daftar</button></div>`;
  const nav = (k, t, h) => `<a class="tab ${(a || 'orders') === k || (!a && k === 'orders') ? 'on' : ''}" href="${h}">${t}</a>`;
  const head = `<div class="row between wrap"><h1>Akun saya</h1><button class="btn sm" data-act="logout">Keluar</button></div><div class="tabs mt">${nav('orders', 'Pesanan', '#/store/account')}${nav('profile', 'Profil', '#/store/account/profile')}${nav('addresses', 'Alamat', '#/store/account/addresses')}</div>`;
  if (a === 'orders' && id) return head + buyerOrder(id);
  if (a === 'profile') return head + profilePage(b);
  if (a === 'addresses') return head + addressesPage(b);
  return head + ordersList(b);
}
const tabsDef = [['all', 'Semua', null], ['unpaid', 'Belum bayar', ['UNPAID']], ['proc', 'Diproses', ['PAID', 'PROCESSING', 'READY_PICKUP']], ['ship', 'Dikirim', ['SHIPPING']], ['done', 'Sampai', ['DELIVERED']], ['fin', 'Selesai', ['COMPLETED']], ['can', 'Dibatalkan', ['CANCELLED']]];
function ordersList(b) {
  const t = S.ui.bt || 'all', list = S.orders.filter(o => o.cid === b.id && (!tabsDef.find(x => x[0] === t)[2] || tabsDef.find(x => x[0] === t)[2].includes(o.status)));
  return `<div class="tabs">${tabsDef.map(([k, l, st]) => `<button class="tab ${t === k ? 'on' : ''}" data-act="btab" data-arg="${k}">${l}<span class="n">${S.orders.filter(o => o.cid === b.id && (!st || st.includes(o.status))).length}</span></button>`).join('')}</div>
  ${list.length ? `<div class="col">${list.map(o => `<a class="card row" href="#/store/account/orders/${o.id}" style="color:inherit;text-decoration:none"><div class="grow"><b>${esc(o.no)}</b> <span class="muted sm">· ${dt(o.created)} · ${o.type === 'pickup' ? 'Ambil di toko' : 'Kirim'}</span><div class="sm">${o.items.map(i => esc(i.name) + ' ×' + i.qty).join(', ')}</div></div><div class="right"><div class="mono b">${rp(o.total)}</div>${stPill(o)}</div></a>`).join('')}</div>` : '<div class="empty">Belum ada pesanan.</div>'}`;
}
A.btab = k => { S.ui.bt = k; };

function trackModalHtml(o) {
  const ev = [[o.deliveredAt, 'Paket diterima'], [o.shippedAt + 3 * H, 'Paket tiba di hub tujuan'], [o.shippedAt + H, 'Kurir mengambil paket'], [o.shippedAt, 'Pengiriman dibuat']].filter(x => x[0]);
  return `<div class="modal"><div class="row between"><h3>Lacak ${esc(o.awb)}</h3><button class="btn sm" data-act="closeM">✕</button></div><div class="sm muted">${esc(o.ship.c)} ${esc(o.ship.s)}</div><div class="tl mt">${ev.map(e => `<div class="i"><span class="dot"></span><div><b class="sm">${e[1]}</b><div class="sm muted">${dt(e[0])}</div></div></div>`).join('')}</div></div>`;
}
A.track = id => { openModal(trackModalHtml(order(id))); return false; };

function buyerOrder(id) {
  const o = order(id), b = buyer(), g = S.session.guest; if (!o || (b ? o.cid !== b.id : !(g && o.cid === null && o.buyerWa === g.wa))) return '<div class="empty">Pesanan tidak ditemukan</div>';
  const ret = o.ret, retWin = o.deliveredAt && now() < o.deliveredAt + S.store.profile.returnDays * D;
  const act = [];
  if (o.status === 'UNPAID') act.push(`<a class="btn primary" href="#/store/pay/${o.id}">Bayar sekarang</a><button class="btn danger" data-act="buyerCancel" data-arg="${o.id}">Batalkan pesanan</button>`);
  if (o.status === 'PAID') act.push(`<button class="btn danger" data-act="buyerCancel" data-arg="${o.id}">Batalkan &amp; refund penuh</button>`);
  if (o.status === 'PROCESSING' && !o.cancelReq && !(o.poDeadline && now() > o.poDeadline)) act.push(`<button class="btn danger" data-act="reqCancel" data-arg="${o.id}">Ajukan pembatalan</button>`);
  if (o.status === 'PROCESSING' && o.poDeadline && now() > o.poDeadline) act.push(`<button class="btn danger solid" data-act="poCancel" data-arg="${o.id}">Batalkan &amp; refund (terlambat)</button>`);
  if (o.status === 'DELIVERED' && !ret) act.push(`<button class="btn primary" data-act="buyerComplete" data-arg="${o.id}">Pesanan selesai</button>${retWin ? `<a class="btn" href="#/store/return/${o.id}">Ajukan pengembalian</a>` : '<span class="sm muted">Batas retur terlewat</span>'}`);
  if (o.status === 'COMPLETED') act.push(`<button class="btn" data-act="reorder" data-arg="${o.id}">Beli lagi</button>`);
  const reviewable = o.status === 'COMPLETED' ? o.items.filter(i => !S.reviews.find(r => r.oid === o.id && r.pid === i.pid)) : [];
  return `<div class="row between wrap"><div><h2>Order ${esc(o.no)}</h2><div class="sm muted">${dt(o.created)} · ${o.type === 'pickup' ? 'Ambil di toko' : 'Kirim ' + esc(o.ship.c + ' ' + o.ship.s)}</div></div>${stPill(o)}</div>
<div class="g2 mt" style="grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);align-items:start"><div class="col">
${o.status === 'UNPAID' ? `<div class="alert warn">Bayar dalam ${cd(o.payBy)} atau pesanan batal otomatis.</div>` : ''}
${o.status === 'PAID' && !o.accepted ? `<div class="alert info">Menunggu penjual menerima pesanan (maks. 2 hari kerja). Bila tidak direspons, pesanan batal dan dana kembali penuh.</div>` : ''}
${o.cancelReq && o.status === 'PROCESSING' ? `<div class="alert warn">Permintaan pembatalan menunggu persetujuan penjual.</div>` : ''}
${o.status === 'PROCESSING' && o.poDeadline ? `<div class="card"><div class="row between"><div><div class="sm muted">Pre-Order · tenggat kirim</div><div class="mono b" style="font-size:18px">${dd(o.poDeadline)}</div></div><div class="right"><div class="sm muted">Sisa waktu</div><div class="mono b">${now() > o.poDeadline ? '<span style="color:var(--bad-ink)">Terlambat</span>' : cd(o.poDeadline)}</div></div></div>${o.poExtended ? `<div class="sm muted mt">Diperpanjang sekali dengan persetujuan Anda.</div>` : ''}${o.extReq ? `<div class="alert info mt">Penjual meminta perpanjangan ${o.extReq.days} hari (${esc(o.extReq.why)}). <div class="row mt"><button class="btn sm primary" data-act="extYes" data-arg="${o.id}">Setujui</button><button class="btn sm danger" data-act="extNo" data-arg="${o.id}">Tolak</button></div></div>` : ''}${now() > o.poDeadline ? '<div class="alert bad mt">Pengiriman terlambat dari tenggat. Anda bisa membatalkan dan menerima refund penuh.</div>' : ''}</div>` : ''}
${o.status === 'READY_PICKUP' ? `<div class="card"><h3>Pesanan siap diambil</h3><div class="row mt" style="gap:18px"><div class="qr" role="img" aria-label="QR kode ambil"></div><div><div class="sm muted">Kode ambil</div><div class="mono" style="font-size:34px;font-weight:700;letter-spacing:.15em;color:var(--ink)">${o.pickupCode.slice(0, 3)} ${o.pickupCode.slice(3)}</div><div class="sm muted">Tunjukkan ke penjual saat mengambil.</div></div></div><div class="alert warn mt">Ambil sebelum ${dt(o.pickupBy)} (sisa ${cd(o.pickupBy)}). Lewat batas, pesanan batal dan dana dikembalikan.</div><div class="sm muted mt">${esc(S.store.profile.address)}, ${esc(S.store.profile.city)} · ${esc(S.store.profile.hours)}</div></div>` : ''}
${o.awb && o.ship ? `<div class="card row between"><div><div class="sm muted">Nomor resi · ${esc(o.ship.c)}</div><a class="mono b" href="#" data-act="track" data-arg="${o.id}">${esc(o.awb)} ↗</a></div>${o.status === 'SHIPPING' || o.status === 'DELIVERED' ? `<button class="btn sm" data-act="track" data-arg="${o.id}">Lacak paket</button>` : '<span class="sm muted">Menunggu kurir</span>'}</div>` : ''}
${ret ? retCard(o) : ''}
<div class="card"><h3>Produk</h3>${o.items.map(i => `<div class="row mt"><div class="grow"><a class="b" href="#/store/p/${i.pid}">${esc(i.name)}</a> <span class="sm muted">${esc(i.vname)} ×${i.qty}</span>${i.po ? ' <span class="po">PO</span>' : ''}</div><span class="mono">${rp(i.price * i.qty)}</span></div>`).join('')}
<div class="sep"></div><div class="kv"><span>Subtotal</span><span class="mono">${rp(o.items.reduce((a, i) => a + i.price * i.qty, 0))}</span></div><div class="kv"><span>Ongkir</span><span class="mono">${o.ship ? rp(o.ship.cost) : 'Gratis'}</span></div><div class="kv"><span>Biaya layanan</span><span class="mono">${rp(o.serviceFee)}</span></div><div class="kv b"><span>Total</span><span class="mono">${rp(o.total)}</span></div>${o.refundDone || (o.status === 'CANCELLED' && o.paidAt) ? '<div class="alert ok mt">Dana dikembalikan ke metode pembayaran asal.</div>' : ''}</div>
${reviewable.length ? `<div class="card"><h3>Beri ulasan</h3>${reviewable.map(i => `<div class="row mt"><div class="grow">${esc(i.name)}</div><button class="btn sm" data-act="review" data-arg="${o.id}|${i.pid}">Tulis ulasan</button></div>`).join('')}</div>` : ''}
${act.length ? `<div class="row wrap">${act.join('')}</div>` : ''}
${simBuyer(o)}</div>
<div class="col"><div class="card"><h3>Riwayat</h3><div class="tl mt">${[...(o.history || [])].reverse().map(h => `<div class="i"><span class="dot"></span><div><div class="sm b">${esc(h.text)}</div><div class="sm muted">${dt(h.t)}</div></div></div>`).join('')}</div></div>
${o.addr && o.type === 'kurir' ? `<div class="card"><h3>Alamat</h3><div class="sm mt">${esc(o.addr.name)} · ${esc(o.addr.wa)}<br>${esc(addrStr(o.addr))}</div></div>` : ''}</div></div>`;
}
function simBuyer(o) {
  const b = [];
  if (o.status === 'DELIVERED') b.push(`<button class="btn sm" data-act="simAuto" data-arg="${o.id}">Maju 3 hari (selesai otomatis)</button>`);
  if (o.status === 'PROCESSING' && o.poDeadline) b.push(`<button class="btn sm" data-act="simPoLate" data-arg="${o.id}">Lewati tenggat Pre-Order</button>`);
  if (o.status === 'READY_PICKUP') b.push(`<button class="btn sm" data-act="simPickupLate" data-arg="${o.id}">Lewati batas ambil</button>`);
  if (o.ret && o.ret.state === 'REQUESTED') b.push(`<button class="btn sm" data-act="simNoResp" data-arg="${o.id}">Seller tidak merespons 2 hari</button>`);
  return b.length ? `<div class="simbox"><div class="t">Simulasi waktu · hanya prototipe</div><div class="row wrap">${b.join('')}</div></div>` : '';
}
A.simAuto = id => { order(id).autoCompleteAt = now() - 1; };
A.simPoLate = id => { order(id).poDeadline = now() - 1; };
A.simPickupLate = id => { order(id).pickupBy = now() - 1; };
A.simNoResp = id => { order(id).ret.respondBy = now() - 1; };
A.buyerCancel = id => { const o = order(id); cancelOrder(o, 'Dibatalkan oleh pembeli', 'pembeli'); toast('Pesanan dibatalkan' + (o.paidAt ? ', refund penuh diproses' : '')); };
A.reqCancel = id => { const o = order(id); o.cancelReq = { t: now() }; log(o, 'Pembeli meminta pembatalan'); notify('seller', 'WA', `Permintaan batal ${o.no}`, 'Pembeli meminta pembatalan. Setujui atau tolak.', '#/seller/orders/' + o.id, 'Buka order'); toast('Permintaan dikirim ke penjual'); };
A.poCancel = id => { cancelOrder(order(id), 'Pengiriman Pre-Order melewati tenggat', 'pembeli'); toast('Dibatalkan, refund penuh'); };
A.extYes = id => { const o = order(id); o.poDeadline += o.extReq.days * D; o.poExtended = true; log(o, `Pembeli menyetujui perpanjangan ${o.extReq.days} hari`); o.extReq = null; };
A.extNo = id => { const o = order(id); o.extReq = null; log(o, 'Pembeli menolak perpanjangan'); toast('Anda menolak. Bila terlambat, Anda bisa membatalkan.'); };
A.buyerComplete = id => { completeOrder(order(id), 'pembeli'); toast('Pesanan selesai'); };
A.reorder = id => { order(id).items.forEach(i => { const p = prod(i.pid); if (p && p.status === 'LIVE') { const ex = S.cart.find(c => c.pid === i.pid && c.vid === i.vid); if (ex) ex.qty += i.qty; else S.cart.push({ pid: i.pid, vid: i.vid, qty: i.qty }); } }); location.hash = '#/store/cart'; };
A.review = a => { const [oid, pid] = a.split('|'); S.ui.rv = { oid, pid, stars: 5, text: '' }; openModal(`<div class="modal"><h3>Ulasan ${esc(prod(pid).name)}</h3><div class="fld mt"><label class="lbl">Rating</label>${inp('ui.rv.stars', { type: 'select', opts: [[5, '★★★★★ Sangat baik'], [4, '★★★★☆ Baik'], [3, '★★★☆☆ Cukup'], [2, '★★☆☆☆ Kurang'], [1, '★☆☆☆☆ Buruk']] })}</div>${inp('ui.rv.text', { label: 'Ulasan', type: 'textarea' })}<div class="row"><button class="btn primary" data-act="saveReview">Kirim ulasan</button><button class="btn" data-act="closeM">Batal</button></div></div>`); return false; };
A.saveReview = () => { const r = S.ui.rv; S.reviews.push({ oid: r.oid, pid: r.pid, stars: +r.stars, text: r.text || '(tanpa teks)', name: buyer().name }); closeModal(); toast('Terima kasih atas ulasan Anda'); };

function retCard(o) {
  const r = o.ret, [t, c] = RT[r.state];
  let body = '';
  if (r.state === 'REQUESTED') body = `<div class="sm">Menunggu respon penjual (batas ${cd(r.respondBy)}). Dana order ditahan.</div>`;
  if (r.state === 'APPROVED') body = `<div class="sm">Retur disetujui. Kirim balik barang lalu isi nomor resi. Ongkir retur ${r.shipBy === 'seller' ? 'ditanggung penjual' : 'ditanggung pembeli'} sesuai kebijakan toko.</div><button class="btn primary mt" data-act="backShip" data-arg="${o.id}">Isi resi pengiriman balik</button>`;
  if (r.state === 'SHIPPED_BACK') body = `<div class="sm">Barang dikirim balik (resi <span class="mono">${esc(r.backAwb)}</span>). Menunggu penjual memeriksa.</div>`;
  if (r.state === 'REJECTED') body = `<div class="alert bad">Ditolak penjual: “${esc(r.sellerNote)}”</div><button class="btn primary mt" data-act="escalate" data-arg="${o.id}">Naikkan ke admin Tabyte</button>`;
  if (r.state === 'DISPUTE') body = `<div class="sm">Admin Tabyte sedang memediasi. Anda akan dikabari setelah ada keputusan.</div>`;
  if (r.state === 'REFUNDED') body = `<div class="alert ok">Refund ${rp(r.refundAmt)} sudah diproses.${r.decisionNote ? ' ' + esc(r.decisionNote) : ''}</div>`;
  if (r.state === 'CLOSED') body = `<div class="alert bad">Retur ditolak: “${esc(r.decisionNote)}”. Pesanan dapat diselesaikan.</div>`;
  return `<div class="card"><div class="row between"><h3>Pengembalian</h3>${pill(t, c)}</div><div class="sm muted mt">Alasan: ${esc(r.reason)} · ${r.proofs} bukti</div><div class="mt">${body}</div></div>`;
}
A.backShip = id => { S.ui.bs = { id, awb: '' }; openModal(`<div class="modal"><h3>Resi pengiriman balik</h3>${inp('ui.bs.awb', { label: 'Nomor resi', mono: 1, ph: 'mis. JNE-12345678' })}<div class="row"><button class="btn primary" data-act="saveBack">Simpan</button><button class="btn" data-act="closeM">Batal</button></div></div>`); return false; };
A.saveBack = () => { const b = S.ui.bs; if (!b.awb.trim()) { toast('Isi nomor resi'); return false; } const o = order(b.id); o.ret.state = 'SHIPPED_BACK'; o.ret.backAwb = b.awb.trim(); log(o, 'Barang retur dikirim balik: ' + b.awb); notify('seller', 'WA', `Barang retur ${o.no} dikirim balik`, 'Periksa barang setelah tiba lalu putuskan refund.', '#/seller/orders/' + o.id, 'Buka order'); closeModal(); };
A.escalate = id => { const o = order(id); o.ret.state = 'DISPUTE'; log(o, 'Pembeli menaikkan kasus ke admin'); notify('admin', 'Email', `Sengketa retur ${o.no}`, 'Pembeli menaikkan kasus penolakan retur.', '#/admin/disputes', 'Buka'); };

function returnPage(id) {
  const o = order(id), b = buyer(); if (!o || !b || o.cid !== b.id) return '<div class="empty">Pesanan tidak ditemukan</div>';
  if (o.status !== 'DELIVERED' || o.ret) return `<div class="card" style="max-width:560px;margin:20px auto"><h2>Retur belum bisa diajukan</h2><p class="muted">Pengembalian hanya bisa diajukan setelah barang <b>Sampai</b> dan dalam ${S.store.profile.returnDays} hari. Status order saat ini: ${esc(ST[o.status][0])}.</p><a class="btn" href="#/store/account/orders/${o.id}">Kembali</a></div>`;
  const f = S.ui.rt ||= { oid: o.id, reason: 'Barang rusak / cacat', note: '', proofs: 0 }; if (f.oid !== o.id) Object.assign(f, { oid: o.id, reason: 'Barang rusak / cacat', note: '', proofs: 0, err: '' });
  return `<div style="max-width:620px;margin:0 auto" class="card"><h2>Ajukan pengembalian · ${esc(o.no)}</h2><div class="sm muted">Batas pengajuan: ${dt(o.deliveredAt + S.store.profile.returnDays * D)} (sisa ${cd(o.deliveredAt + S.store.profile.returnDays * D)}). Dana order ditahan selama proses.</div>
<div class="fld mt2"><label class="lbl">Alasan</label><div class="col" style="gap:6px">${['Barang rusak / cacat', 'Tidak sesuai deskripsi', 'Salah kirim', 'Berubah pikiran (bila toko mengizinkan)'].map(r => `<label class="opt ${f.reason === r ? 'sel' : ''}"><input type="radio" name="rr" ${f.reason === r ? 'checked' : ''} data-act="rtReason" data-arg="${esc(r)}">${r}</label>`).join('')}</div></div>
${inp('ui.rt.note', { label: 'Penjelasan', type: 'textarea' })}
<div class="fld"><label class="lbl">Bukti foto / video <span class="muted" style="font-weight:400">(wajib, minimal 1)</span></label><div class="row wrap">${Array.from({ length: f.proofs }, (_, i) => `<div class="ph" style="${phc('', i)};width:64px;font-size:11px;border-radius:8px">${i % 3 === 2 ? 'video' : 'foto ' + (i + 1)}</div>`).join('')}<button class="btn" data-act="rtProof" ${f.proofs >= 5 ? 'disabled' : ''}>+ Tambah bukti</button></div>${f.err ? `<div class="errt">${f.err}</div>` : ''}</div>
<div class="row"><button class="btn primary" data-act="rtSubmit" data-arg="${o.id}">Kirim pengajuan</button><a class="btn" href="#/store/account/orders/${o.id}">Batal</a></div></div>`;
}
A.rtReason = r => { S.ui.rt.reason = r; };
A.rtProof = () => { S.ui.rt.proofs++; S.ui.rt.err = ''; };
A.rtSubmit = id => { const f = S.ui.rt; if (f.proofs < 1) { f.err = 'Unggah minimal 1 foto atau video bukti.'; return; } const o = order(id); o.ret = { state: 'REQUESTED', reason: f.reason, note: f.note, proofs: f.proofs, respondBy: now() + 2 * D, shipBy: f.reason.startsWith('Berubah') ? 'buyer' : 'seller' }; log(o, 'Pembeli mengajukan pengembalian: ' + f.reason); S.ui.rt = null;
  notify('seller', 'WA', `Pengajuan retur ${o.no}`, `${f.reason} · ${f.proofs} bukti. Respon dalam 2 hari.`, '#/seller/orders/' + o.id, 'Buka order'); toast('Pengajuan retur terkirim'); location.hash = '#/store/account/orders/' + id; };

function profilePage(b) {
  S.ui.pf ||= { name: b.name, id: b.id }; if (S.ui.pf.id !== b.id) S.ui.pf = { name: b.name, id: b.id };
  return `<div style="max-width:560px" class="card"><h3>Profil</h3><div class="alert info mt">Satu akun berlaku untuk semua toko Tabyte.</div><div class="mt">${inp('ui.pf.name', { label: 'Nama' })}<button class="btn primary sm" data-act="saveName">Simpan nama</button></div><div class="sep"></div>
<div class="lbl">Nomor WhatsApp</div><div class="row"><input class="in mono" readonly value="${esc(b.wa)}"><button class="btn" data-act="chgWa">Ubah (OTP)</button></div>
<div class="fld mt"><label class="lbl">Email</label><input class="in" readonly value="${esc(b.email || '—')}"></div></div>`;
}
A.saveName = () => { if (!S.ui.pf.name.trim()) { toast('Nama tidak boleh kosong'); return false; } buyer().name = S.ui.pf.name.trim(); toast('Nama disimpan'); };
A.chgWa = () => { S.ui.cw = { wa: '', code: '', step: 'new', err: '' }; openModal(cwModal()); return false; };
function cwModal() { const c = S.ui.cw; return `<div class="modal"><h3>Ubah nomor WhatsApp</h3>${c.step === 'new' ? `${inp('ui.cw.wa', { label: 'Nomor baru', mono: 1 })}${c.err ? `<div class="errt">${c.err}</div>` : ''}<button class="btn primary" data-act="cwSend">Kirim OTP</button>` : `<p class="muted sm">Kode dikirim ke ${esc(nWa(c.wa))} (cek Kotak masuk simulasi).</p>${inp('ui.cw.code', { label: 'Kode OTP', mono: 1, err: c.err })}<button class="btn primary" data-act="cwOk">Verifikasi &amp; simpan</button>`}</div>`; }
A.cwSend = () => { const c = S.ui.cw; if (!okWa(nWa(c.wa))) { c.err = 'Nomor tidak valid'; openModal(cwModal()); return false; } if (S.customers.find(x => x.wa === nWa(c.wa))) { c.err = 'Nomor sudah dipakai akun lain'; openModal(cwModal()); return false; } c.code = ''; S.otp = { wa: nWa(c.wa), code: String(Math.floor(100000 + Math.random() * 900000)) }; notify('buyer', 'WA', 'Kode OTP Tabyte', `Kode OTP Anda ${S.otp.code}. Berlaku 5 menit.`, '', ''); c.step = 'verify'; c.err = ''; openModal(cwModal()); return false; };
A.cwOk = () => { const c = S.ui.cw; if (c.code !== S.otp.code) { c.err = 'Kode salah'; openModal(cwModal()); return false; } buyer().wa = S.otp.wa; S.otp = null; closeModal(); toast('Nomor WhatsApp diperbarui'); };

function addressesPage(b) {
  const f = S.ui.af && S.ui.afEdit !== undefined ? S.ui.af : null;
  return `<div class="row between"><h3>Alamat</h3><button class="btn primary sm" data-act="adNew">+ Alamat baru</button></div><div class="col mt">${b.addresses.length ? b.addresses.map(a => `<div class="card row"><div class="grow"><b>${esc(a.label)}</b> ${a.primary ? pill('Utama', 'info') : ''}<div class="sm muted">${esc(a.name)} · ${esc(a.wa)}<br>${esc(addrStr(a))}</div></div><div class="row wrap">${!a.primary ? `<button class="btn sm" data-act="adPrimary" data-arg="${a.id}">Jadikan utama</button>` : ''}<button class="btn sm" data-act="adEdit" data-arg="${a.id}">Ubah</button><button class="btn sm danger" data-act="adDel" data-arg="${a.id}">Hapus</button></div></div>`).join('') : '<div class="empty">Belum ada alamat.</div>'}</div>`;
}
function adModal() { return `<div class="modal wide"><h3>${S.ui.af.id ? 'Ubah alamat' : 'Alamat baru'}</h3>${inp('ui.af.label', { label: 'Label (Rumah, Kantor…)' })}${addrForm('ui.af')}<div class="row"><button class="btn primary" data-act="adSave">Simpan</button><button class="btn" data-act="closeM">Batal</button></div></div>`; }
A.adNew = () => { const b = buyer(); S.ui.af = { label: '', name: b.name, wa: b.wa, addr: '', city: 'Surabaya', kec: 'Rungkut', zip: '60293', id: '' }; openModal(adModal()); return false; };
A.adEdit = id => { S.ui.af = { ...buyer().addresses.find(a => a.id === id) }; openModal(adModal()); return false; };
A.adSave = () => { const f = S.ui.af, b = buyer(); if (!addrOk(f)) { toast('Lengkapi nama, WA, dan alamat'); return false; } if (f.id) Object.assign(b.addresses.find(a => a.id === f.id), f); else b.addresses.push({ ...f, id: 'a' + uid(), primary: !b.addresses.length }); closeModal(); toast('Alamat disimpan'); };
A.adDel = id => { const b = buyer(); b.addresses = b.addresses.filter(a => a.id !== id); if (b.addresses.length && !b.addresses.some(a => a.primary)) b.addresses[0].primary = true; };
A.adPrimary = id => { buyer().addresses.forEach(a => a.primary = a.id === id); };
