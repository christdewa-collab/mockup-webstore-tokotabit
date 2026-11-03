/* Tabyte prototype — core: state, helpers, router, events, domain logic. Semua data hanya di browser (localStorage). */
const KEY = 'tabyte-proto-v2';
const HOST = 'tabyte.id';
const H = 3600e3, D = 24 * H;
let S = null, modalHtml = '', drawerOpen = false, tmr = null;
const A = {}, V = {};           // A = aksi (klik), V = view per surface

/* ---------- helpers ---------- */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rp = n => 'Rp ' + Math.round(n).toLocaleString('id-ID');
const dt = ts => new Date(ts).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace('.', ':');
const dd = ts => new Date(ts).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
const now = () => Date.now();
const uid = () => Math.random().toString(36).slice(2, 8);
const getPath = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
function setPath(o, p, v) { const ks = p.split('.'); const l = ks.pop(); const t = ks.reduce((a, k) => (a[k] ??= {}), o); t[l] = v; }
const mask = n => { n = String(n || ''); return n.length > 4 ? '•'.repeat(n.length - 4) + n.slice(-4) : n; };
const cd = ts => `<span class="mono" data-cd="${ts}"></span>`;
function fmtCd(ts) { let ms = ts - now(); if (ms <= 0) return 'lewat batas'; const d = Math.floor(ms / D); if (d >= 2) return d + ' hari'; const h = Math.floor(ms / H), m = Math.floor(ms % H / 60e3), s = Math.floor(ms % 60e3 / 1e3); return [h, m, s].map(x => String(x).padStart(2, '0')).join(':'); }
const val = k => getPath(S, k);
function inp(k, o = {}) {
  const v = getPath(S, k) ?? '';
  const t = o.type || 'text';
  const attrs = `data-k="${k}" ${o.on ? `data-on="${o.on}"` : ''} ${o.ro ? 'readonly' : ''} ${o.ph ? `placeholder="${esc(o.ph)}"` : ''} id="f_${k}"`;
  const fld = t === 'textarea' ? `<textarea class="in ${o.err ? 'err' : ''}" rows="${o.rows || 3}" ${attrs}>${esc(v)}</textarea>`
    : t === 'select' ? `<select class="in" ${attrs}>${o.opts.map(x => { const [a, b] = Array.isArray(x) ? x : [x, x]; return `<option value="${esc(a)}" ${String(v) === String(a) ? 'selected' : ''}>${esc(b)}</option>`; }).join('')}</select>`
      : t === 'checkbox' ? `<input type="checkbox" data-k="${k}" ${v ? 'checked' : ''} ${o.on ? `data-on="${o.on}"` : ''}>`
        : `<input class="in ${o.mono ? 'mono' : ''} ${o.err ? 'err' : ''}" type="${t}" value="${esc(v)}" ${attrs}>`;
  if (t === 'checkbox') return fld;
  return `<div class="fld">${o.label ? `<label class="lbl" for="f_${k}">${o.label}</label>` : ''}${fld}${o.hint ? `<div class="hint">${o.hint}</div>` : ''}${o.err ? `<div class="errt">${o.err}</div>` : ''}</div>`;
}
const pill = (t, c = 'gray') => `<span class="pill ${c}">${esc(t)}</span>`;
const phc = (name, i = 0) => { const cols = ['#1c64c4', '#0d8073', '#9b5a12', '#7546bd', '#c0392b', '#2f6f4f']; return `background:${cols[i % cols.length]}`; };
const thumb = (p, size = 120) => `<div class="ph" style="${phc(p.name, p.id.charCodeAt(p.id.length - 1))};width:${size === 'full' ? '100%' : size + 'px'}">${esc(p.name.split(' ').map(w => w[0]).slice(0, 2).join(''))}</div>`;

/* ---------- wilayah & ongkir ---------- */
const WIL = [
  { city: 'Surabaya', prov: 'Jawa Timur', kec: { 'Rungkut': '60293', 'Dukuh Pakis': '60225', 'Gubeng': '60281' } },
  { city: 'Malang', prov: 'Jawa Timur', kec: { 'Lowokwaru': '65141', 'Klojen': '65111' } },
  { city: 'Jakarta Selatan', prov: 'DKI Jakarta', kec: { 'Kebayoran Baru': '12110', 'Tebet': '12810' } },
  { city: 'Bandung', prov: 'Jawa Barat', kec: { 'Coblong': '40132', 'Sukajadi': '40162' } },
];
const RESERVED = ['admin', 'seller', 'www', 'api', 'app', 'mail', 'tabyte', 'webmaster', 'dashboard'];
const wil = c => WIL.find(w => w.city === c);
function shipOptions(addr, kg) {
  const o = S.store.profile; const oc = wil(o.city), dc = wil(addr.city); const w = Math.max(1, Math.ceil(kg));
  const same = addr.city === o.city, prov = oc && dc && oc.prov === dc.prov;
  const z = same ? 0 : prov ? 1 : 2;
  const r = [
    { c: 'JNE', s: 'Reguler', cost: [9000, 14000, 24000][z] * w, eta: ['1–2 hari', '2–3 hari', '3–5 hari'][z] },
    { c: 'SiCepat', s: 'BEST', cost: [10000, 13000, 22000][z] * w, eta: ['1 hari', '2 hari', '2–4 hari'][z] },
    { c: 'J&T', s: 'Express', cost: [10000, 15000, 21000][z] * w, eta: ['1–2 hari', '2–3 hari', '3–5 hari'][z] },
  ];
  if (same) { r.unshift({ c: 'GoSend', s: 'Instan', cost: 15000 + 3000 * (w - 1), eta: 'Hari ini' }); r.splice(1, 0, { c: 'Grab', s: 'Same Day', cost: 13000 + 3000 * (w - 1), eta: 'Hari ini' }); }
  return r.map((x, i) => ({ ...x, id: i }));
}

/* ---------- state ---------- */
function persist() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
function load() { try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { } if (!S || S.v !== 2) S = seed('start'); }
function notify(to, ch, subj, body, link, linkLabel) {
  S.inbox.unshift({ id: uid(), t: now(), to, ch, subj, body, link: link || '', linkLabel: linkLabel || 'Buka', read: false });
  S.inbox = S.inbox.slice(0, 80);
}
function audit(who, text) { S.audit.unshift({ t: now(), who, text }); }
function log(o, text) { (o.history ||= []).push({ t: now(), text }); }

function seed(kind) {
  const base = {
    v: 2, scenario: kind, session: { seller: false, buyer: null, guest: null }, store: null,
    products: [], customers: [], cart: [], orders: [], nextOrder: 1045, banks: [], wds: [], mut: [], bal: { pending: 0, available: 0, withdrawing: 0 },
    inbox: [], audit: [], reviews: [], otp: null, ui: { adm: {}, sel: {}, f: {} }, nextWd: 125,
  };
  if (kind === 'start') return base;
  // kind === 'live': toko demo aktif + data contoh
  const t = now();
  base.store = {
    name: 'Teknik Jaya', slug: 'teknikjaya', ownerName: 'Rizal Pratama', email: 'rizal@teknikjaya.example', wa: '081234567890', status: 'live', pwSet: true, password: 'password',
    profile: { desc: 'Perkakas dan suku cadang teknik, dikirim dari Surabaya.', wa: '081234567890', email: 'halo@teknikjaya.example', city: 'Surabaya', kec: 'Rungkut', zip: '60293', address: 'Jl. Rungkut Industri III No. 12', hours: 'Sen–Sab 09.00–17.00', returnDays: 3, done: true },
    pickup: true, subId: 'G123456789',
    business: { type: 'PERUSAHAAN', legalName: 'CV Teknik Jaya Abadi', legalAddress: 'Jl. Rungkut Industri III No. 12, Surabaya 60293', npwp: '012345678901000', nitku: '0123456789012300000000', billingEmail: 'finance@teknikjaya.example', docs: { AKTA: 'akta-teknik-jaya.pdf', NIB: 'nib.pdf', NPWP: 'npwp.pdf' }, status: 'APPROVED', note: '', submittedAt: t - 20 * D, verifiedAt: t - 18 * D, verifiedBy: 'admin@tabyte.id', seen: {} },
  };
  const P = (id, name, price, stock, o = {}) => ({ id, slug: id, name, status: 'LIVE', photo: true, minBuy: 1, maxBuy: 10, weight: 1, po: { on: false, days: 14, quota: 0, sold: 0 }, variants: [{ id: 'v1', name: 'Standar', price, stock }], desc: 'Deskripsi singkat produk. [isi dari katalog toko]', ...o });
  base.products = [
    P('bor-listrik', 'Bor Listrik 13mm', 485000, 12, { variants: [{ id: 'v1', name: '500W', price: 485000, stock: 12 }, { id: 'v2', name: '710W', price: 565000, stock: 5 }], weight: 2 }),
    P('kunci-pas', 'Set Kunci Pas 8–24mm', 285000, 30, { weight: 1.5 }),
    P('gerinda-tangan', 'Gerinda Tangan 4 inci', 620000, 8, { weight: 2.5, maxBuy: 3 }),
    P('mesin-las', 'Mesin Las Inverter', 1850000, 0, { weight: 6, po: { on: true, days: 14, quota: 50, sold: 12 }, variants: [{ id: 'v1', name: '200A', price: 1850000, stock: 0 }], maxBuy: 2 }),
    P('obeng-set', 'Obeng Set Presisi', 95000, 20, { status: 'DRAFT' }),
  ];
  base.customers = [{ id: 'c1', name: 'Rizal Pratama', wa: '081234567890', email: 'rizal-pratama@example.com', password: 'password', addresses: [
    { id: 'a1', label: 'Rumah', name: 'Rizal Pratama', wa: '081234567890', addr: 'Jl. Dukuh Kupang 8', city: 'Surabaya', kec: 'Dukuh Pakis', zip: '60225', primary: true },
    { id: 'a2', label: 'Kantor', name: 'Rizal Pratama', wa: '081234567890', addr: 'Jl. Gatot Subroto 20', city: 'Bandung', kec: 'Coblong', zip: '40132', primary: false }] }];
  base.banks = [{ id: 'b1', bank: 'BCA', no: '1234567890', holder: 'CV Teknik Jaya Abadi', status: 'VERIFIED', primary: true, proof: 'buku-tabungan.jpg', mismatch: false, created: t - 18 * D }];
  const it = (pid, vid, qty) => { const p = base.products.find(x => x.id === pid), v = p.variants.find(x => x.id === vid); return { pid, vid, name: p.name, vname: v.name, price: v.price, qty, po: p.po.on }; };
  const ord = (no, status, items, o = {}) => {
    const sub = items.reduce((a, i) => a + i.price * i.qty, 0), ship = o.type === 'pickup' ? 0 : 18000, sf = 1000, fee = o.type === 'pickup' ? 0 : Math.round(sub * .05);
    return { id: 'o' + no, no: '#' + no, cid: 'c1', buyerName: 'Rizal Pratama', buyerWa: '081234567890', type: 'kurir', items, subtotal: sub, ship: o.type === 'pickup' ? null : { c: 'GoSend', s: 'Instan', cost: ship, eta: 'Hari ini' }, serviceFee: sf, total: sub + ship + sf, fee, net: sub - fee,
      addr: { name: 'Rizal Pratama', wa: '081234567890', addr: 'Jl. Dukuh Kupang 8', city: 'Surabaya', kec: 'Dukuh Pakis', zip: '60225' }, status, created: t - 3 * D, payBy: t - 2 * D, history: [{ t: t - 3 * D, text: 'Pesanan dibuat' }], ...o };
  };
  const o1043 = ord(1043, 'PAID', [it('kunci-pas', 'v1', 1)], { paidAt: t - 2 * H, acceptBy: t + 2 * D - 2 * H });
  const o1040 = ord(1040, 'DELIVERED', [it('gerinda-tangan', 'v1', 1)], { paidAt: t - 6 * D, accepted: true, awb: 'GK-88213344', shippedAt: t - 5 * D, deliveredAt: t - 1 * D, autoCompleteAt: t + 2 * D });
  const o1042 = ord(1042, 'COMPLETED', [it('bor-listrik', 'v1', 1)], { paidAt: t - 9 * D, accepted: true, awb: 'GK-77100221', deliveredAt: t - 6 * D, completedAt: t - 5 * D });
  base.orders = [o1043, o1040, o1042];
  base.bal = { pending: o1043.subtotal + o1040.subtotal, available: 1250000, withdrawing: 0 };
  base.mut = [
    { id: uid(), t: t - 5 * D, type: 'Penjualan', desc: 'Order #1042 selesai · subtotal − fee 5%', amt: o1042.net, acct: 'available' },
    { id: uid(), t: t - 6 * D, type: 'Penjualan', desc: 'Order #1038 selesai', amt: 1250000 - o1042.net, acct: 'available' },
    { id: uid(), t: t - 6 * H, type: 'Penjualan', desc: 'Order #1043 dibayar (tertunda)', amt: o1043.subtotal, acct: 'pending' },
    { id: uid(), t: t - 5 * D, type: 'Penjualan', desc: 'Order #1040 dibayar (tertunda)', amt: o1040.subtotal, acct: 'pending' },
  ];
  base.nextOrder = 1044;
  notify('seller', 'Email', 'Order baru #1043 sudah dibayar', 'Kunci Pas ×1 · Ambil/kirim. Terima pesanan sebelum batas.', '#/seller/orders/o1043', 'Buka order');
  return base;
}
function reset(kind) { S = seed(kind); persist(); drawerOpen = false; modalHtml = ''; location.hash = kind === 'start' ? '#/' : '#/'; render(); toast(kind === 'start' ? 'Demo direset: belum ada toko' : 'Demo direset: toko Teknik Jaya aktif'); }

/* ---------- finance ledger ---------- */
function mut(type, desc, amt, acct) { S.mut.unshift({ id: uid(), t: now(), type, desc, amt, acct }); }
function balPost(o) { // sale paid → pending
  S.bal.pending += o.subtotal; mut('Penjualan', `Order ${o.no} dibayar (tertunda)`, o.subtotal, 'pending');
}
function balComplete(o) {
  S.bal.pending -= o.subtotal; S.bal.available += o.net;
  mut('Penjualan', `Order ${o.no} selesai · subtotal − fee ${o.type === 'pickup' ? '0% (pickup)' : '5%'}`, o.net, 'available');
}
function balRefund(o, amt, why) { // refund sebelum selesai: lepas dari pending
  const rel = Math.min(o.subtotal, amt); S.bal.pending -= rel; mut('Refund', `Order ${o.no} · ${why} · fee Tabyte dibebaskan`, -rel, 'pending');
}

/* ---------- order domain ---------- */
const ST = {
  UNPAID: ['Belum bayar', 'warn'], PAID: ['Dibayar · menunggu diterima', 'warn'], PROCESSING: ['Diproses', 'info'], READY_PICKUP: ['Siap diambil', 'info'], SHIPPING: ['Dikirim', 'info'],
  DELIVERED: ['Sampai', 'ok'], COMPLETED: ['Selesai', 'ok'], CANCELLED: ['Dibatalkan', 'bad'],
};
const RT = { REQUESTED: ['Retur diajukan', 'warn'], APPROVED: ['Retur disetujui', 'info'], SHIPPED_BACK: ['Barang dikirim balik', 'info'], REFUNDED: ['Direfund', 'ok'], REJECTED: ['Retur ditolak seller', 'bad'], DISPUTE: ['Sengketa · admin', 'warn'], CLOSED: ['Retur ditutup', 'gray'] };
const stPill = o => o.ret && !['CLOSED', 'REFUNDED'].includes(o.ret.state) ? pill(RT[o.ret.state][0], RT[o.ret.state][1]) : pill(ST[o.status][0], ST[o.status][1]);
const prod = id => S.products.find(p => p.id === id);
const cust = id => S.customers.find(c => c.id === id);
const order = id => S.orders.find(o => o.id === id);
const poDays = o => Math.max(0, ...o.items.filter(i => i.po).map(i => prod(i.pid)?.po.days || 0));

function placeOrder({ type, addr, ship, items, buyerName, buyerWa, cid }) {
  const sub = items.reduce((a, i) => a + i.price * i.qty, 0), shipCost = type === 'pickup' ? 0 : ship.cost, sf = 1000;
  const fee = type === 'pickup' ? 0 : Math.round(sub * .05);
  const o = { id: 'o' + S.nextOrder, no: '#' + S.nextOrder, cid, buyerName, buyerWa, type, items, subtotal: sub, ship: type === 'pickup' ? null : ship, serviceFee: sf, total: sub + shipCost + sf, fee, net: sub - fee,
    addr, status: 'UNPAID', created: now(), payBy: now() + D, history: [] };
  S.nextOrder++;
  items.forEach(i => { const v = prod(i.pid).variants.find(x => x.id === i.vid); if (!prod(i.pid).po.on) v.stock -= i.qty; else prod(i.pid).po.sold += i.qty; }); // stok direservasi
  log(o, 'Pesanan dibuat. Stok direservasi, bayar sebelum ' + dt(o.payBy));
  S.orders.unshift(o); return o;
}
function releaseStock(o) { o.items.forEach(i => { const p = prod(i.pid), v = p.variants.find(x => x.id === i.vid); if (!p.po.on) v.stock += i.qty; else p.po.sold = Math.max(0, p.po.sold - i.qty); }); }
function markPaid(o) {
  o.status = 'PAID'; o.paidAt = now(); o.acceptBy = now() + 2 * D; log(o, 'Pembayaran diterima (Midtrans)');
  balPost(o);
  notify('seller', 'WA', `Order baru ${o.no} sudah dibayar`, `${o.items.map(i => i.name + ' ×' + i.qty).join(', ')} · ${rp(o.total)} · ${o.type === 'pickup' ? 'Ambil di toko' : 'Kirim ' + o.ship.c}. Terima sebelum ${dt(o.acceptBy)}.`, '#/seller/orders/' + o.id, 'Buka order');
  notify('buyer', 'Email', `Pembayaran ${o.no} berhasil`, 'Pesanan Anda diteruskan ke penjual.', '#/store/account/orders/' + o.id, 'Lihat pesanan');
}
function cancelOrder(o, why, by, refund = true) {
  const paid = !!o.paidAt && !['UNPAID'].includes(o.status);
  releaseStock(o);
  if (o.paidAt && refund) { balRefund(o, o.subtotal, 'pembatalan'); log(o, 'Refund penuh ke metode bayar asal'); }
  o.status = 'CANCELLED'; o.cancelReason = why; log(o, `Dibatalkan (${by}): ${why}`);
  notify('buyer', 'Email', `Pesanan ${o.no} dibatalkan`, why + (o.paidAt ? ' Dana dikembalikan penuh.' : ''), '#/store/account/orders/' + o.id, 'Lihat pesanan');
  if (by !== 'seller') notify('seller', 'Email', `Order ${o.no} dibatalkan`, why, '#/seller/orders/' + o.id, 'Buka order');
}
function acceptOrder(o) {
  o.accepted = true; o.status = 'PROCESSING'; log(o, 'Seller menerima pesanan');
  const po = poDays(o); if (po) { o.poDeadline = now() + po * D; log(o, `Pre-Order: tenggat kirim ${dd(o.poDeadline)}`); }
  notify('buyer', 'WA', `Pesanan ${o.no} diterima penjual`, po ? `Pre-Order, dikirim paling lambat ${dd(o.poDeadline)}.` : 'Penjual sedang menyiapkan barang.', '#/store/account/orders/' + o.id, 'Lihat pesanan');
}
function readyPickup(o) {
  o.status = 'READY_PICKUP'; o.pickupCode = String(Math.floor(100000 + Math.random() * 900000)); o.pickupBy = now() + 3 * D; log(o, 'Siap diambil. Kode ambil dibuat');
  notify('buyer', 'WA', `Pesanan ${o.no} siap diambil`, `Kode ambil: ${o.pickupCode}. Ambil sebelum ${dt(o.pickupBy)}. Alamat: ${S.store.profile.address}, ${S.store.profile.city}.`, '#/store/account/orders/' + o.id, 'Lihat kode');
}
function genAwb(o) { o.awb = (o.ship.c.slice(0, 2).toUpperCase()) + '-' + Math.floor(10000000 + Math.random() * 89999999); log(o, 'AWB dibuat: ' + o.awb); }
function shipOrder(o) {
  if (!o.awb) genAwb(o); o.status = 'SHIPPING'; o.shippedAt = now(); log(o, 'Kurir mengambil paket. Dalam pengiriman');
  notify('buyer', 'WA', `Pesanan ${o.no} dikirim`, `Resi ${o.awb} (${o.ship.c}). Lacak di halaman pesanan.`, '#/store/account/orders/' + o.id, 'Lacak');
}
function deliverOrder(o, by) {
  o.status = 'DELIVERED'; o.deliveredAt = now(); o.autoCompleteAt = now() + 3 * D; log(o, `Barang sampai (${by})`);
  notify('buyer', 'WA', `Pesanan ${o.no} sudah sampai`, 'Konfirmasi Pesanan Selesai, atau ajukan retur dalam 3 hari. Otomatis selesai dalam 3 hari.', '#/store/account/orders/' + o.id, 'Buka pesanan');
}
function completeOrder(o, by) {
  o.status = 'COMPLETED'; o.completedAt = now(); log(o, `Pesanan selesai (${by})`); balComplete(o);
  notify('seller', 'Email', `Order ${o.no} selesai`, `${rp(o.net)} masuk Saldo tersedia.`, '#/seller/finance', 'Lihat saldo');
}
function refundOrder(o, amt, why) {
  balRefund(o, amt, why); log(o, `Refund ${rp(amt)} via Midtrans (${why})`);
  if (amt >= o.subtotal) { o.refundDone = true; releaseStock(o); }
  else { o.subtotal -= amt; o.fee = o.type === 'pickup' ? 0 : Math.round(o.subtotal * .05); o.net = o.subtotal - o.fee; completeOrder(o, 'refund sebagian'); }
  notify('buyer', 'Email', `Refund ${o.no} diproses`, `${rp(amt)} dikembalikan ke metode bayar asal.`, '#/store/account/orders/' + o.id, 'Lihat pesanan');
}

/* waktu berjalan: kedaluwarsa otomatis */
function tick() {
  let ch = false; const t = now();
  S.orders.forEach(o => {
    if (o.status === 'UNPAID' && t > o.payBy) { cancelOrder(o, 'Melewati batas waktu pembayaran', 'sistem'); ch = true; }
    else if (o.status === 'PAID' && t > o.acceptBy) { cancelOrder(o, 'Penjual tidak merespons dalam 2 hari kerja', 'sistem'); ch = true; }
    else if (o.status === 'READY_PICKUP' && t > o.pickupBy) { cancelOrder(o, 'Melewati batas waktu pengambilan', 'sistem'); ch = true; }
    else if (o.status === 'DELIVERED' && t > o.autoCompleteAt && !(o.ret && !['CLOSED', 'REJECTED'].includes(o.ret.state))) { completeOrder(o, 'otomatis 3 hari'); ch = true; }
    if (o.ret && o.ret.state === 'REQUESTED' && t > o.ret.respondBy) { o.ret.state = 'DISPUTE'; log(o, 'Seller tidak merespons, kasus naik ke admin'); notify('admin', 'Email', `Sengketa retur ${o.no}`, 'Seller tidak merespons dalam 2 hari.', '#/admin/disputes', 'Buka'); ch = true; }
  });
  return ch;
}

/* ---------- UI plumbing ---------- */
function toast(m) { const t = document.getElementById('toast'); t.textContent = m; t.className = 'on'; clearTimeout(toast.x); toast.x = setTimeout(() => t.className = '', 2400); }
function openModal(h) { modalHtml = h; renderModal(); }
function closeModal() { modalHtml = ''; renderModal(); }
function renderModal() { const m = document.getElementById('modal'); m.innerHTML = modalHtml ? `<div class="modalbg" data-act="modalbg">${modalHtml}</div>` : ''; }
function go(h) { if (location.hash === h) render(); else location.hash = h; }
function parts() { return (location.hash.replace(/^#\/?/, '') || '').split('/').filter(Boolean); }
const unread = () => S.inbox.filter(m => !m.read).length;

function demoBar(surface) {
  const host = surface === 'store' ? (S.store ? `${S.store.slug}.${HOST}` : `{toko}.${HOST}`) : surface === 'seller' ? `seller.${HOST}` : surface === 'admin' ? `admin.${HOST}/webmaster` : HOST;
  const l = (k, t, h) => `<a href="${h}" class="${surface === k ? 'on' : ''}">${t}</a>`;
  return `<a href="#/" style="font-weight:800">◧ Tabyte demo</a>${l('store', 'Storefront', '#/store')}${l('seller', 'Seller Center', '#/seller')}${l('admin', 'Webmaster', '#/admin')}<span class="host">${esc(host)}</span><span class="sp"></span>
    <button data-act="drawer">Kotak masuk simulasi${unread() ? `<span class="badge">${unread()}</span>` : ''}</button><button data-act="resetMenu">Reset demo</button>`;
}
function drawer() {
  if (!drawerOpen) return '';
  const roleL = { buyer: 'Pembeli', seller: 'Seller', admin: 'Admin Tabyte' };
  return `<div id="drawer"><div class="row between"><h3>Kotak masuk simulasi</h3><button class="btn sm" data-act="drawer">Tutup</button></div>
  <p class="muted sm">Semua email/WhatsApp yang akan dikirim sistem muncul di sini (termasuk kode OTP dan link undangan).</p>
  ${S.inbox.length ? S.inbox.map(m => `<div class="msg ${m.read ? '' : 'new'}"><div class="row between sm muted"><span><b>${m.ch}</b> → ${roleL[m.to]}</span><span>${dt(m.t)}</span></div><div class="b" style="margin-top:3px">${esc(m.subj)}</div><div class="sm" style="margin:3px 0 8px">${esc(m.body)}</div>${m.link ? `<a class="btn sm primary" href="${m.link}" data-act="readMsg" data-arg="${m.id}">${esc(m.linkLabel)}</a>` : `<button class="btn sm" data-act="readMsg" data-arg="${m.id}">Tandai dibaca</button>`}</div>`).join('') : '<div class="empty">Belum ada pesan.</div>'}</div>`;
}
let lastRoute = '';
function render() {
  if (tick()) persist();
  const p = parts(); const surface = ['store', 'seller', 'admin'].includes(p[0]) ? p[0] : 'home';
  let html;
  try { html = (V[surface] || V.home)(p.slice(1)); } catch (e) { console.error(e); html = `<div class="wrap sf-main"><div class="alert bad">Terjadi galat render: ${esc(e.message)}</div></div>`; }
  const y = lastRoute === location.hash ? window.scrollY : 0; lastRoute = location.hash;
  document.getElementById('demo').innerHTML = demoBar(surface);
  document.getElementById('app').innerHTML = html;
  document.getElementById('draw').innerHTML = drawer();
  renderModal(); updateCd(); window.scrollTo(0, y);
}
function updateCd() { document.querySelectorAll('[data-cd]').forEach(e => e.textContent = fmtCd(+e.dataset.cd)); }

document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]'); if (!t) return;
  if (t.hasAttribute('disabled')) return;
  const a = t.dataset.act;
  if (a === 'modalbg') { if (e.target === t) closeModal(); return; }
  const fn = A[a]; if (!fn) return;
  if (t.tagName === 'A' && !t.getAttribute('href')?.startsWith('#/')) e.preventDefault();
  const r = fn(t.dataset.arg, t, e);
  persist(); if (r !== false) render();
});
function onInput(e) {
  const k = e.target.dataset.k; if (!k) return;
  const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
  setPath(S, k, v); persist();
  const h = e.target.dataset.on; if (h && A[h]) { const r = A[h](v, e.target, e); if (r === 'render') { render(); } }
}
document.addEventListener('input', onInput);
document.addEventListener('change', e => { if (e.target.type === 'checkbox' || e.target.type === 'radio' || e.target.tagName === 'SELECT') onInput(e); });
window.addEventListener('hashchange', () => { closeModal(); render(); });
A.rerender = () => 'render';
A.drawer = () => { drawerOpen = !drawerOpen; };
A.readMsg = id => { const m = S.inbox.find(x => x.id === id); if (m) m.read = true; drawerOpen = false; };
A.resetMenu = () => { openModal(`<div class="modal"><h3>Reset demo</h3><p class="muted">Pilih kondisi awal. Semua data demo saat ini akan dihapus.</p><div class="col"><button class="btn primary block" data-act="doReset" data-arg="start">Mulai dari nol · belum ada toko (tes onboarding)</button><button class="btn block" data-act="doReset" data-arg="live">Toko Teknik Jaya sudah aktif + data contoh (tes order, saldo, retur)</button><button class="btn block" data-act="closeM">Batal</button></div></div>`); return false; };
A.doReset = k => { reset(k); return false; };
A.closeM = () => { closeModal(); return false; };

function boot() {
  load();
  document.body.insertAdjacentHTML('afterbegin', '<div id="demo"></div>');
  document.body.insertAdjacentHTML('beforeend', '<div id="app"></div><div id="draw"></div><div id="modal"></div><div id="toast" role="status"></div>');
  render();
  setInterval(() => { updateCd(); if (!(document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) && !modalHtml && tick()) { persist(); render(); } }, 1000);
}
