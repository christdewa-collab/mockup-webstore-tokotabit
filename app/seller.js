/* Seller Center */
const BANKS = ['BCA', 'Mandiri', 'BNI', 'BRI', 'CIMB Niaga', 'Permata'];
const DOCS = { AKTA: 'Akta Pendirian Perusahaan', NIB: 'NIB / SIUP', NPWP: 'NPWP', NITKU: 'NITKU', MEREK_HAKI: 'Merek Dagang / HAKI', SURAT_DISTRIBUTOR: 'Surat Penunjukan Distributor' };
const reqDocs = t => t === 'PERUSAHAAN' ? ['AKTA', 'NIB', 'NPWP'] : ['NPWP'];
const BS = { PENDING: ['Menunggu review', 'warn'], APPROVED: ['Terverifikasi', 'ok'], REJECTED: ['Ditolak', 'bad'] };
const sellerNew = () => S.orders.filter(o => o.status === 'PAID' || o.cancelReq && o.status === 'PROCESSING' || (o.ret && o.ret.state === 'REQUESTED')).length;
const wdInflight = () => S.wds.find(w => ['DIAJUKAN', 'DIPROSES'].includes(w.status));

function golive() {
  const s = S.store, b = s.business;
  return [
    { t: 'Kata sandi dibuat', sub: 'Undangan diterima', done: s.pwSet, who: 'Penjual', link: '' },
    { t: 'Profil toko lengkap', sub: 'Deskripsi, kontak, alamat asal kirim', done: s.profile.done, who: 'Penjual', link: '#/seller/profile' },
    { t: 'Verifikasi usaha disetujui', sub: b.status === 'PENDING' ? 'Sedang ditinjau admin' : b.status === 'REJECTED' ? 'Ditolak, perbaiki dokumen' : 'Isi info usaha & dokumen', done: b.status === 'APPROVED', who: b.status === 'PENDING' ? 'Admin' : 'Penjual', link: '#/seller/business' },
    { t: 'Pembayaran Midtrans siap', sub: 'Sub ID didaftarkan admin', done: !!s.subId, who: 'Admin', link: '' },
    { t: 'Rekening penarikan terverifikasi', sub: S.banks.some(x => x.status === 'PENDING') ? 'Menunggu verifikasi admin' : 'Tambah rekening', done: S.banks.some(x => x.status === 'VERIFIED'), who: S.banks.some(x => x.status === 'PENDING') ? 'Admin' : 'Penjual', link: '#/seller/finance/accounts' },
    { t: 'Minimal 1 produk Live berfoto', sub: 'Produk Draft tidak dihitung', done: S.products.some(p => p.status === 'LIVE' && p.photo), who: 'Penjual', link: '#/seller/products' },
  ];
}
function autoLive() {
  const s = S.store; if (!s || s.status === 'live') return;
  if (s.pwSet && s.status !== 'invited' && golive().every(x => x.done)) {
    s.status = 'live'; audit('sistem', `Toko ${s.name} aktif (checklist go-live terpenuhi)`);
    notify('seller', 'Email', 'Toko Anda sudah aktif!', 'Semua checklist go-live terpenuhi. Toko tampil publik dengan badge Terverifikasi.', '#/store', 'Lihat toko'); toast('🎉 Toko aktif');
  }
}

/* ---------- shell ---------- */
function sellerShell(body, active) {
  const s = S.store, live = s.status === 'live', n = sellerNew();
  const it = (k, t, h, c, soon) => soon ? `<a class="nav soon">${t}<i>SOON</i></a>` : `<a class="nav ${active === k ? 'on' : ''}" href="${h}">${t}${c ? `<span class="c">${c}</span>` : ''}</a>`;
  return `<div class="shell"><aside class="side"><div class="brand">tabyte<span style="color:var(--brand)">.</span></div><div class="sm muted" style="padding:0 10px 12px"><b style="color:var(--ink)">${esc(s.name)}</b><br>${live ? '<span class="ver">✓ Aktif</span>' : pill('Belum aktif', 'warn')}</div>
${it('dash', 'Dashboard', '#/seller')}${it('products', 'Produk', '#/seller/products')}${it('orders', 'Pesanan', '#/seller/orders', n)}${it('chat', 'Chat', '', 0, 1)}${it('profile', 'Profil toko', '#/seller/profile')}${it('business', 'Info usaha', '#/seller/business')}${it('finance', 'Saldo', '#/seller/finance')}${it('domain', 'Domain', '', 0, 1)}
<div class="sep"></div>${live ? `<a class="nav" href="#/store">Lihat toko ↗</a>` : ''}<a class="nav" href="#" data-act="sellerOut">Keluar</a></aside><main class="main">${body}</main></div>`;
}
A.sellerOut = () => { S.session.seller = false; location.hash = '#/seller'; };
function stepper(cur) {
  const s = S.store, b = s.business, steps = [['Akun', s.pwSet], ['Profil toko', s.profile.done], ['Info usaha', b.status && b.status !== 'REJECTED'], ['Verifikasi', b.status === 'APPROVED'], ['Go-live', s.status === 'live']];
  return `<div class="steps" style="margin-bottom:18px">${steps.map(([t, d], i) => `${i ? '<span class="ln"></span>' : ''}<span class="s ${d ? 'done' : i === cur ? 'on' : ''}"><span class="d">${d ? '✓' : i + 1}</span>${t}</span>`).join('')}</div>`;
}

V.seller = p => {
  if (!S.store) return `<div class="wrap sf-main"><div class="empty"><h2>Belum ada toko</h2><p>Toko dibuat oleh admin Tabyte lewat Webmaster. <a href="#/admin/stores/new">Buat toko baru</a> atau reset ke toko demo aktif.</p></div></div>`;
  const [r, a, b] = p;
  if (r === 'invite') return invitePage();
  if (!S.session.seller) return loginPage();
  if (!r) return sellerShell(sellerDash(), 'dash');
  if (r === 'profile') return sellerShell(profilePageS(), 'profile');
  if (r === 'business') return sellerShell(businessPage(), 'business');
  if (r === 'products') return sellerShell(a ? productForm(a) : productsList(), 'products');
  if (r === 'orders') return sellerShell(a ? sOrder(a) : ordersList(), 'orders');
  if (r === 'finance') return sellerShell(a === 'accounts' ? accountsPage() : a === 'withdraw' ? withdrawPage() : financePage(), 'finance');
  return sellerShell('<div class="empty">Halaman tidak ditemukan</div>', '');
};

/* ---------- login & undangan ---------- */
function loginPage() {
  const s = S.store, l = S.ui.sl ||= { email: s.email, pw: 'password', err: '' };
  return `<div class="wrap" style="max-width:440px;padding-top:60px"><div class="card"><div class="logo" style="font-size:22px">tabyte<span style="color:var(--brand)">.</span></div><h2 class="mt">Masuk Seller Center</h2><div class="sm muted" style="font-family:'JetBrains Mono',monospace">seller.${HOST}/login</div>
${!s.pwSet ? `<div class="alert warn mt">Akun belum aktif. Terima undangan lewat email di <b>Kotak masuk simulasi</b> untuk membuat kata sandi.</div>` : ''}
<div class="mt">${inp('ui.sl.email', { label: 'Email', type: 'email' })}${inp('ui.sl.pw', { label: 'Kata sandi', type: 'password', err: l.err })}<button class="btn primary block" data-act="sellerLogin">Masuk</button></div></div></div>`;
}
A.sellerLogin = () => { const s = S.store, l = S.ui.sl; if (!s.pwSet) { l.err = 'Akun belum diaktifkan. Buka email undangan.'; return; } if (l.email.trim().toLowerCase() !== s.email.toLowerCase() || l.pw !== s.password) { l.err = 'Email atau kata sandi salah.'; return; } S.session.seller = true; l.err = ''; };
function invitePage() {
  const s = S.store, f = S.ui.inv ||= { pw: '', pw2: '', err: '' };
  if (s.pwSet) return `<div class="wrap" style="max-width:460px;padding-top:60px"><div class="card"><h2>Undangan sudah dipakai</h2><p class="muted">Link undangan berlaku sekali pakai. Silakan masuk dengan kata sandi Anda, atau minta tim Tabyte mengirim ulang undangan.</p><a class="btn primary" href="#/seller">Ke halaman masuk</a></div></div>`;
  if (s.inviteExpired) return `<div class="wrap" style="max-width:460px;padding-top:60px"><div class="card"><h2>Link undangan kedaluwarsa</h2><p class="muted">Link berlaku 3 hari. Minta tim Tabyte mengirim ulang undangan.</p></div></div>`;
  return `<div class="wrap" style="max-width:460px;padding-top:60px"><div class="card"><div class="sm muted mono">seller.${HOST}/invite/{token}</div><h2 class="mt">Buat kata sandi</h2><p class="muted">Satu langkah lagi sebelum masuk ke Seller Center toko <b>${esc(s.name)}</b>.</p>
${inp('store.email', { label: 'Email', ro: 1, hint: 'Email undangan, tidak bisa diubah.' })}${inp('ui.inv.pw', { label: 'Kata sandi', type: 'password', hint: 'Minimal 8 karakter.' })}${inp('ui.inv.pw2', { label: 'Ulangi kata sandi', type: 'password', err: f.err })}<button class="btn primary block" data-act="acceptInvite">Simpan &amp; masuk</button></div></div>`;
}
A.acceptInvite = () => {
  const s = S.store, f = S.ui.inv;
  if (f.pw.length < 8) { f.err = 'Kata sandi minimal 8 karakter.'; return; } if (f.pw !== f.pw2) { f.err = 'Konfirmasi kata sandi tidak sama.'; return; }
  s.password = f.pw; s.pwSet = true; s.status = 'setup'; S.session.seller = true; S.ui.inv = null; audit(s.ownerName, 'Menerima undangan & membuat kata sandi');
  toast('Selamat datang! Lengkapi profil toko'); location.hash = '#/seller/profile';
};

/* ---------- dashboard / go-live ---------- */
function sellerDash() {
  const s = S.store, live = s.status === 'live';
  if (!live) {
    const g = golive(), done = g.filter(x => x.done).length;
    return `<div class="topline"><div><h1>Selamat datang, ${esc(s.ownerName.split(' ')[0])}</h1><div class="muted">Selesaikan checklist agar toko bisa dibuka untuk pembeli.</div></div></div>${stepper(g[1].done ? (g[2].done ? 3 : 2) : 1)}
<div class="card"><div class="row between"><div><h3>${done === g.length ? 'Siap dibuka' : 'Hampir siap dibuka'}</h3><div class="sm muted">Checklist go-live dihitung otomatis dari data toko. Saat semua terpenuhi, toko langsung aktif.</div></div><div class="mono b" style="font-size:22px;color:var(--brand)">${done}/${g.length}</div></div>
<div style="height:8px;border-radius:99px;background:var(--brand-soft);margin:12px 0"><div style="height:8px;border-radius:99px;background:var(--brand);width:${done / g.length * 100}%"></div></div>
${g.map(x => `<div class="row" style="padding:12px 2px;border-bottom:1px solid var(--line2)"><span style="width:26px;height:26px;border-radius:99px;display:grid;place-items:center;font-weight:800;flex-shrink:0;${x.done ? 'background:var(--ok);color:#fff' : 'border:2px solid var(--warn);color:var(--warn)'}">${x.done ? '✓' : '!'}</span><div class="grow"><div class="b">${x.t}</div><div class="sm muted">${x.sub}</div></div><span class="pill gray">${x.who}</span>${!x.done && x.link && x.who === 'Penjual' ? `<a class="btn sm" href="${x.link}">Kerjakan</a>` : ''}</div>`).join('')}</div>
<div class="alert info mt">Pratinjau draf toko: <a href="#/store">buka storefront</a> (hanya terlihat oleh Anda; publik melihat “Toko sedang tidak aktif”).</div>`;
  }
  const bal = S.bal, todo = S.orders.filter(o => o.status === 'PAID').length, proc = S.orders.filter(o => o.status === 'PROCESSING').length;
  return `<div class="topline"><div><h1>Dashboard</h1><div class="muted">${esc(s.name)} <span class="ver">✓ Terverifikasi</span></div></div></div>
<div class="g4"><a class="card" href="#/seller/orders" style="color:inherit"><div class="sm muted">Perlu diterima</div><div class="mono b" style="font-size:26px">${todo}</div></a><a class="card" href="#/seller/orders" style="color:inherit"><div class="sm muted">Perlu dikirim</div><div class="mono b" style="font-size:26px">${proc}</div></a><a class="card" href="#/seller/finance" style="color:inherit"><div class="sm muted">Saldo tersedia</div><div class="mono b" style="font-size:22px">${rp(bal.available)}</div></a><a class="card" href="#/seller/finance" style="color:inherit"><div class="sm muted">Saldo tertunda</div><div class="mono b" style="font-size:22px">${rp(bal.pending)}</div></a></div>
<div class="card mt2"><h3>Pesanan terbaru</h3><div class="mt">${S.orders.slice(0, 5).map(o => `<a class="row" href="#/seller/orders/${o.id}" style="padding:9px 0;border-bottom:1px solid var(--line2);color:inherit"><b>${esc(o.no)}</b><span class="grow sm muted">${esc(o.buyerName)} · ${o.items.map(i => esc(i.name)).join(', ')}</span><span class="mono">${rp(o.total)}</span>${stPill(o)}</a>`).join('') || '<div class="muted">Belum ada pesanan</div>'}</div></div>`;
}

/* ---------- profil toko ---------- */
function profilePageS() {
  const s = S.store, p = s.profile, e = S.ui.pe_err || {};
  return `<div class="topline"><div><h1>Profil toko</h1><div class="muted">Informasi yang dilihat pembeli dan dipakai untuk pengiriman.</div></div></div>${s.status !== 'live' ? stepper(1) : ''}
<div class="card" style="max-width:760px"><div class="row"><div class="ph" style="${phc('', 0)};width:72px;border-radius:14px">${esc(s.name.split(' ').map(w => w[0]).join('').slice(0, 2))}</div><div><button class="btn sm" data-act="logoUp">Unggah logo</button><div class="hint">JPG/PNG, maks 2 MB, rasio 1:1.${p.logo ? ' <b>logo.png terunggah</b>' : ''}</div></div></div><div class="sep"></div>
<div class="g2">${inp('store.name', { label: 'Nama toko', ro: 1, hint: 'Dibuat admin; hubungi Tabyte untuk mengubah.' })}${inp('store.slug', { label: 'Alamat toko', ro: 1, hint: `${esc(s.slug)}.${HOST} (subdomain tidak bisa diubah)` })}</div>
${inp('store.profile.desc', { label: 'Deskripsi toko', type: 'textarea', err: e.desc })}
<div class="g2">${inp('store.profile.wa', { label: 'WhatsApp toko', mono: 1, err: e.wa })}${inp('store.profile.email', { label: 'Email toko', type: 'email', err: e.email })}</div>
<h3 class="mt">Alamat asal pengiriman (gudang / pickup)</h3><div class="sm muted" style="margin-bottom:10px">Dipakai sebagai asal perhitungan ongkir kurir.</div>
${inp('store.profile.address', { label: 'Alamat', err: e.address })}<div class="g3">${inp('store.profile.city', { label: 'Kota', type: 'select', opts: WIL.map(x => x.city), on: 'afCity:store.profile' })}${inp('store.profile.kec', { label: 'Kecamatan', type: 'select', opts: Object.keys(wil(p.city).kec), on: 'afKec:store.profile' })}${inp('store.profile.zip', { label: 'Kode pos', ro: 1, mono: 1 })}</div>
<div class="g2">${inp('store.profile.hours', { label: 'Jam buka' })}${inp('store.profile.returnDays', { label: 'Batas retur (hari)', type: 'select', opts: [1, 3, 7] })}</div>
<label class="row mt"><input type="checkbox" ${s.pickup ? 'checked' : ''} data-k="store.pickup"><span><b>Aktifkan Ambil di toko (in-store pickup)</b><div class="sm muted">Pembeli bisa bayar online lalu ambil sendiri tanpa ongkir dan tanpa fee platform.</div></span></label>
<div class="row mt2"><button class="btn primary" data-act="saveProfile">${s.status === 'live' ? 'Simpan perubahan' : 'Simpan &amp; lanjut ke info usaha'}</button></div></div>`;
}
A.logoUp = () => { S.store.profile.logo = true; toast('logo.png terunggah'); };
A.saveProfile = () => {
  const p = S.store.profile, e = {};
  if (!p.desc.trim()) e.desc = 'Deskripsi wajib diisi.'; if (!okWa(nWa(p.wa))) e.wa = 'Nomor WhatsApp tidak valid.'; if (!/.+@.+\..+/.test(p.email)) e.email = 'Email tidak valid.'; if (!p.address.trim()) e.address = 'Alamat wajib diisi.';
  S.ui.pe_err = e; if (Object.keys(e).length) { toast('Periksa isian yang bertanda merah'); return; }
  p.done = true; audit(S.store.ownerName, 'Melengkapi profil toko'); toast('Profil tersimpan'); autoLive(); if (S.store.status !== 'live') location.hash = '#/seller/business';
};

/* ---------- info usaha & dokumen ---------- */
function businessPage() {
  const s = S.store, b = s.business, e = S.ui.be || {}, locked = b.status === 'PENDING' || b.status === 'APPROVED';
  if (!b.type) b.type = 'PERUSAHAAN';
  const req = reqDocs(b.type), missing = req.filter(k => !b.docs[k]);
  const fieldsOk = b.legalName?.trim() && b.legalAddress?.trim() && b.npwp?.trim() && /.+@.+\..+/.test(b.billingEmail || '');
  const can = !locked && !missing.length && fieldsOk;
  const dis = locked ? 'readonly' : '';
  const f = (k, o) => inp('store.business.' + k, { ...o, ro: locked || o.ro });
  return `<div class="topline"><div><h1>Info usaha &amp; verifikasi</h1><div class="muted">Data usaha dan dokumen dipakai untuk verifikasi (KYC) dan faktur fee.</div></div>${b.status ? `<span class="pill ${BS[b.status][1]}">${BS[b.status][0]}</span>` : ''}</div>${s.status !== 'live' ? stepper(b.status === 'APPROVED' ? 3 : 2) : ''}
${b.status === 'REJECTED' ? `<div class="alert bad" style="margin-bottom:14px"><b>Verifikasi ditolak.</b> “${esc(b.note)}”. Perbaiki dokumen/data lalu kirim ulang.</div>` : ''}
${b.status === 'PENDING' ? `<div class="alert info" style="margin-bottom:14px">Sedang ditinjau admin Tabyte (diproses maks. 1×24 jam kerja). Form dikunci sampai ada hasil.</div>` : ''}
${b.status === 'APPROVED' ? `<div class="alert ok" style="margin-bottom:14px">Usaha terverifikasi pada ${dd(b.verifiedAt)}. Badge Terverifikasi tampil di toko Anda.</div>` : ''}
<div class="card" style="max-width:820px"><div class="lbl">Jenis usaha</div><div class="row" style="gap:8px;margin-bottom:14px">${['PERORANGAN', 'PERUSAHAAN'].map(t => `<button class="chip ${b.type === t ? 'on' : ''}" data-act="bizType" data-arg="${t}" ${locked ? 'disabled' : ''}>${t === 'PERORANGAN' ? 'Perorangan' : 'Perusahaan'}</button>`).join('')}</div>
<div class="g2">${f('legalName', { label: 'Nama usaha / nama sesuai KTP', err: e.legalName })}${f('billingEmail', { label: 'Email penagihan', type: 'email', err: e.billingEmail })}</div>${f('legalAddress', { label: 'Alamat usaha', type: 'textarea', rows: 2, err: e.legalAddress })}
<div class="g2">${f('npwp', { label: 'NPWP', mono: 1, err: e.npwp, hint: 'Ditampilkan dimasking di daftar admin.' })}${f('nitku', { label: 'NITKU (opsional)', mono: 1 })}</div></div>
<div class="card mt2" style="max-width:820px"><div class="row between"><h3>Dokumen</h3><span class="sm muted">PDF/JPG/PNG, maks 5 MB</span></div><div class="col mt" style="gap:8px">
${Object.entries(DOCS).map(([k, t]) => { const isReq = req.includes(k), has = b.docs[k]; return `<div class="doc ${isReq && !has ? 'miss' : ''}"><span class="fi">${has ? 'PDF' : '—'}</span><div class="grow"><div class="b">${t}</div><div class="sm ${has ? 'muted' : ''}" style="${isReq && !has ? 'color:var(--warn-ink)' : ''}">${has ? esc(has) : 'Belum diunggah'}</div></div>${pill(isReq ? (has ? 'Wajib · terunggah' : 'Wajib · kurang') : 'Opsional', isReq ? (has ? 'ok' : 'warn') : 'gray')}${locked ? '' : has ? `<button class="btn sm" data-act="docUp" data-arg="${k}">Ganti</button><button class="btn sm danger" data-act="docDel" data-arg="${k}">Hapus</button>` : `<button class="btn sm" data-act="docUp" data-arg="${k}">Unggah</button>`}</div>`; }).join('')}</div></div>
${locked ? '' : `<div class="row between mt2" style="max-width:820px"><span class="sm" style="color:var(--warn-ink);font-weight:600">${missing.length ? `${missing.length} dokumen wajib belum lengkap: ${missing.map(k => DOCS[k]).join(', ')}` : !fieldsOk ? 'Lengkapi data usaha di atas' : ''}</span><button class="btn primary" data-act="submitBiz" ${can ? '' : 'disabled'}>Kirim untuk verifikasi</button></div>`}`;
}
A.bizType = t => { S.store.business.type = t; };
A.docUp = k => { S.store.business.docs[k] = `${k.toLowerCase().replace('_', '-')}-${S.store.slug}.pdf`; toast(DOCS[k] + ' terunggah'); };
A.docDel = k => { delete S.store.business.docs[k]; };
A.submitBiz = () => {
  const b = S.store.business, e = {};
  if (!b.legalName.trim()) e.legalName = 'Wajib diisi'; if (!b.legalAddress.trim()) e.legalAddress = 'Wajib diisi'; if (!b.npwp.trim()) e.npwp = 'Wajib diisi'; if (!/.+@.+\..+/.test(b.billingEmail || '')) e.billingEmail = 'Email tidak valid';
  S.ui.be = e; if (Object.keys(e).length) return;
  b.status = 'PENDING'; b.note = ''; b.submittedAt = now(); b.seen = {}; audit(S.store.ownerName, 'Mengajukan verifikasi usaha');
  notify('admin', 'Email', `Verifikasi usaha baru: ${S.store.name}`, `${b.legalName} mengirim dokumen untuk ditinjau.`, '#/admin/verif/' + 'store', 'Tinjau');
  toast('Dikirim untuk verifikasi'); location.hash = '#/seller';
};

/* ---------- produk ---------- */
function productsList() {
  return `<div class="topline"><div><h1>Produk</h1></div><a class="btn primary" href="#/seller/products/new">+ Tambah produk</a></div>
<div class="card scroll"><table class="tbl"><thead><tr><th>Produk</th><th>Harga</th><th>Stok</th><th>Status</th><th></th></tr></thead><tbody>${S.products.map(p => `<tr class="click" onclick="location.hash='#/seller/products/${p.id}'"><td><b>${esc(p.name)}</b>${p.po.on ? ` <span class="po">PO ${p.po.days} hari</span>` : ''}${!p.photo ? ' <span class="pill warn">tanpa foto</span>' : ''}</td><td class="mono">${p.variants.length > 1 ? 'mulai ' : ''}${rp(minPrice(p))}</td><td class="mono">${p.po.on ? (p.po.quota ? p.po.quota - p.po.sold + ' kuota' : '∞') : p.variants.reduce((a, v) => a + v.stock, 0)}</td><td>${pill(p.status === 'LIVE' ? 'Live' : 'Draft', p.status === 'LIVE' ? 'ok' : 'gray')}</td><td class="right"><span class="btn sm">Ubah</span></td></tr>`).join('') || '<tr><td colspan="5" class="muted center">Belum ada produk. Tambah produk pertama Anda.</td></tr>'}</tbody></table></div>`;
}
function productForm(id) {
  if (!S.ui.pe || S.ui.pe._for !== id) { const p = id === 'new' ? { id: 'p' + uid(), name: '', desc: '', status: 'DRAFT', photo: false, minBuy: 1, maxBuy: 10, weight: 1, po: { on: false, days: 14, quota: 0, sold: 0 }, variants: [{ id: 'v1', name: 'Standar', price: 0, stock: 0 }] } : JSON.parse(JSON.stringify(prod(id))); p._for = id; S.ui.pe = p; S.ui.pee = {}; }
  const p = S.ui.pe, e = S.ui.pee || {};
  return `<div class="topline"><div><a class="sm" href="#/seller/products">← Produk</a><h1>${id === 'new' ? 'Produk baru' : 'Ubah produk'}</h1></div></div>
<div class="card" style="max-width:820px">${inp('ui.pe.name', { label: 'Nama produk', err: e.name })}${inp('ui.pe.desc', { label: 'Deskripsi', type: 'textarea' })}
<div class="row"><div class="ph" style="${p.photo ? phc('', 1) : 'background:#e8ebf0;color:#586578'};width:80px;font-size:12px;border-radius:10px">${p.photo ? 'foto' : 'kosong'}</div><div><button class="btn sm" data-act="peFoto">${p.photo ? 'Ganti foto' : 'Unggah foto'}</button><div class="hint">Produk Live wajib punya foto.</div>${e.photo ? `<div class="errt">${e.photo}</div>` : ''}</div></div>
<h3 class="mt2">Varian &amp; stok</h3>${e.variants ? `<div class="errt">${e.variants}</div>` : ''}<div class="col mt" style="gap:8px">${p.variants.map((v, i) => `<div class="row"><div style="flex:2">${inp(`ui.pe.variants.${i}.name`, { ph: 'Nama varian' })}</div><div style="flex:2">${inp(`ui.pe.variants.${i}.price`, { ph: 'Harga (Rp)', type: 'number' })}</div><div style="flex:1">${inp(`ui.pe.variants.${i}.stock`, { ph: 'Stok', type: 'number' })}</div><button class="btn sm danger" style="margin-bottom:14px" data-act="peVarDel" data-arg="${i}" ${p.variants.length < 2 ? 'disabled' : ''}>×</button></div>`).join('')}</div><button class="btn sm" data-act="peVarAdd" ${p.variants.length >= 4 ? 'disabled' : ''}>+ Varian</button>
<div class="g3 mt2">${inp('ui.pe.weight', { label: 'Berat (kg)', type: 'number' })}${inp('ui.pe.minBuy', { label: 'Min beli', type: 'number' })}${inp('ui.pe.maxBuy', { label: 'Maks beli', type: 'number' })}</div>
<div class="sep"></div><label class="row"><input type="checkbox" ${p.po.on ? 'checked' : ''} data-k="ui.pe.po.on" data-on="rerender"><span><b>Pre-Order</b><div class="sm muted">Barang dibuat/dipesan setelah pembeli membayar.</div></span></label>
${p.po.on ? `<div class="g2 mt">${inp('ui.pe.po.days', { label: 'Lama proses (hari)', type: 'number', err: e.po, hint: 'Dihitung dari tanggal pembayaran. Wajib diisi.' })}${inp('ui.pe.po.quota', { label: 'Kuota Pre-Order (opsional)', type: 'number', hint: '0 = tanpa batas' })}</div>` : ''}
<div class="sep"></div>${inp('ui.pe.status', { label: 'Status', type: 'select', opts: [['DRAFT', 'Draft (tidak tampil)'], ['LIVE', 'Live (tampil di toko)']] })}
<div class="row"><button class="btn primary" data-act="saveProduct" data-arg="${id}">Simpan produk</button><a class="btn" href="#/seller/products">Batal</a></div></div>`;
}
A.peFoto = () => { S.ui.pe.photo = true; };
A.peVarAdd = () => { const p = S.ui.pe; p.variants.push({ id: 'v' + uid(), name: '', price: 0, stock: 0 }); };
A.peVarDel = i => { S.ui.pe.variants.splice(+i, 1); };
A.saveProduct = id => {
  const p = S.ui.pe, e = {};
  if (!p.name.trim()) e.name = 'Nama produk wajib diisi.';
  if (p.variants.some(v => !v.name.trim() || !(+v.price > 0))) e.variants = 'Tiap varian butuh nama dan harga lebih dari 0.';
  if (p.status === 'LIVE' && !p.photo) e.photo = 'Produk Live wajib punya foto.';
  if (p.po.on && !(+p.po.days > 0)) e.po = 'Lama proses wajib diisi untuk Pre-Order.';
  S.ui.pee = e; if (Object.keys(e).length) { toast('Periksa isian yang bertanda merah'); return; }
  const out = JSON.parse(JSON.stringify(p)); delete out._for; out.slug = out.slug || (out.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || out.id);
  out.variants.forEach(v => { v.price = +v.price; v.stock = +v.stock; }); out.weight = +out.weight; out.minBuy = +out.minBuy; out.maxBuy = +out.maxBuy; out.po.days = +out.po.days; out.po.quota = +out.po.quota;
  const i = S.products.findIndex(x => x.id === out.id); if (i >= 0) S.products[i] = out; else S.products.push(out);
  S.ui.pe = null; toast('Produk disimpan'); autoLive(); location.hash = '#/seller/products';
};

/* ---------- pesanan ---------- */
const sTabs = [['all', 'Semua', null], ['accept', 'Perlu diterima', o => o.status === 'PAID'], ['ship', 'Perlu dikirim', o => o.status === 'PROCESSING'], ['sent', 'Dikirim / siap diambil', o => ['SHIPPING', 'READY_PICKUP'].includes(o.status)], ['arrived', 'Sampai', o => o.status === 'DELIVERED' && !o.ret], ['ret', 'Retur', o => o.ret && !['CLOSED', 'REFUNDED'].includes(o.ret.state)], ['fin', 'Selesai', o => o.status === 'COMPLETED'], ['can', 'Dibatalkan', o => o.status === 'CANCELLED']];
function ordersList() {
  const t = S.ui.st || 'all', def = sTabs.find(x => x[0] === t), list = S.orders.filter(o => !def[2] || def[2](o)), sel = S.ui.so ||= [];
  const bulk = S.orders.filter(o => sel.includes(o.id) && o.status === 'PROCESSING' && o.type === 'kurir');
  return `<div class="topline"><div><h1>Pesanan</h1></div></div><div class="tabs">${sTabs.map(([k, l, f]) => `<button class="tab ${t === k ? 'on' : ''}" data-act="stab" data-arg="${k}">${l}<span class="n">${S.orders.filter(o => !f || f(o)).length}</span></button>`).join('')}</div>
${sel.length ? `<div class="card tight row" style="margin-bottom:12px"><b>${sel.length} order dipilih</b><span class="grow"></span><button class="btn sm" data-act="bulkAwb" ${bulk.length ? '' : 'disabled'}>Generate AWB massal (${bulk.length})</button><button class="btn sm" data-act="bulkLabel" ${S.orders.some(o => sel.includes(o.id) && o.awb) ? '' : 'disabled'}>Cetak label massal</button><button class="btn sm" data-act="selClear">Batal pilih</button></div>` : ''}
<div class="card scroll"><table class="tbl"><thead><tr><th></th><th>Order</th><th>Pembeli</th><th>Produk</th><th>Total</th><th>Status</th><th>Batas</th></tr></thead><tbody>${list.map(o => `<tr><td><input type="checkbox" aria-label="Pilih ${esc(o.no)}" ${sel.includes(o.id) ? 'checked' : ''} data-act="selOne" data-arg="${o.id}"></td><td class="click"><a href="#/seller/orders/${o.id}"><b>${esc(o.no)}</b></a><div class="sm muted">${dt(o.created)}</div></td><td>${esc(o.buyerName)}<div class="sm muted">${o.type === 'pickup' ? 'Ambil di toko' : esc(o.ship.c + ' ' + o.ship.s)}</div></td><td class="sm">${o.items.map(i => esc(i.name) + ' ×' + i.qty).join('<br>')}${o.items.some(i => i.po) ? ' <span class="po">PO</span>' : ''}</td><td class="mono">${rp(o.total)}</td><td>${stPill(o)}</td><td class="sm">${o.status === 'PAID' ? `terima ${cd(o.acceptBy)}` : o.status === 'PROCESSING' && o.poDeadline ? `kirim ${cd(o.poDeadline)}` : o.status === 'READY_PICKUP' ? `ambil ${cd(o.pickupBy)}` : ''}</td></tr>`).join('') || '<tr><td colspan="7" class="muted center">Tidak ada pesanan.</td></tr>'}</tbody></table></div>`;
}
A.stab = k => { S.ui.st = k; };
A.selOne = id => { const s = S.ui.so ||= []; const i = s.indexOf(id); if (i >= 0) s.splice(i, 1); else s.push(id); };
A.selClear = () => { S.ui.so = []; };
A.bulkAwb = () => { let n = 0; S.orders.filter(o => S.ui.so.includes(o.id) && o.status === 'PROCESSING' && o.type === 'kurir' && !o.awb).forEach(o => { genAwb(o); n++; }); toast(`${n} AWB dibuat`); };
function labelHtml(o) { return `<div style="border:2px solid var(--ink);border-radius:8px;padding:14px;margin-bottom:12px"><div class="row between"><b>${esc(o.ship.c)} ${esc(o.ship.s)}</b><span class="mono b">${esc(o.awb)}</span></div><div style="height:34px;margin:10px 0;background:repeating-linear-gradient(90deg,#14294a 0 2px,#fff 2px 5px,#14294a 5px 6px,#fff 6px 10px)"></div><div class="g2 sm"><div><b>Pengirim</b><br>${esc(S.store.name)}<br>${esc(S.store.profile.address)}, ${esc(S.store.profile.city)}</div><div><b>Penerima</b><br>${esc(o.addr.name)} · ${esc(o.addr.wa)}<br>${esc(addrStr(o.addr))}</div></div><div class="sm muted mt">Order ${esc(o.no)} · ${o.items.map(i => esc(i.name) + ' ×' + i.qty).join(', ')}</div></div>`; }
A.bulkLabel = () => { const l = S.orders.filter(o => S.ui.so.includes(o.id) && o.awb); openModal(`<div class="modal wide"><div class="row between"><h3>Label (${l.length})</h3><button class="btn sm" data-act="closeM">✕</button></div><div class="mt">${l.map(labelHtml).join('')}</div><button class="btn primary" data-act="closeM">Cetak</button></div>`); return false; };
A.label = id => { openModal(`<div class="modal wide"><div class="row between"><h3>Label pengiriman</h3><button class="btn sm" data-act="closeM">✕</button></div><div class="mt">${labelHtml(order(id))}</div><button class="btn primary" data-act="closeM">Cetak</button></div>`); return false; };

function sOrder(id) {
  const o = order(id); if (!o) return '<div class="empty">Order tidak ditemukan</div>';
  const ret = o.ret, bx = [];
  if (o.status === 'PAID') bx.push(`<div class="alert warn"><div class="row wrap"><div class="grow"><b>Terima pesanan sebelum ${dt(o.acceptBy)}</b> (sisa ${cd(o.acceptBy)}). Lewat batas, order batal otomatis dan dana kembali ke pembeli.</div><button class="btn danger" data-act="rejectOrder" data-arg="${o.id}">Tolak</button><button class="btn primary" data-act="acceptOrder" data-arg="${o.id}">Terima</button></div></div>`);
  if (o.cancelReq && o.status === 'PROCESSING') bx.push(`<div class="alert warn"><div class="row wrap"><div class="grow"><b>Pembeli meminta pembatalan.</b></div><button class="btn danger" data-act="cxNo" data-arg="${o.id}">Tolak</button><button class="btn primary" data-act="cxYes" data-arg="${o.id}">Setujui &amp; refund</button></div></div>`);
  if (o.status === 'PROCESSING') {
    if (o.poDeadline) bx.push(`<div class="card"><div class="row between"><div><div class="sm muted">Pre-Order · tenggat kirim</div><div class="mono b" style="font-size:18px">${dd(o.poDeadline)}</div></div><div class="right"><div class="sm muted">Sisa</div><div class="mono b">${now() > o.poDeadline ? '<span style="color:var(--bad-ink)">Terlambat</span>' : cd(o.poDeadline)}</div></div></div><div class="sm muted mt">Pengingat ke seller dikirim 3 hari sebelum tenggat. ${o.poExtended ? 'Perpanjangan sudah dipakai.' : ''}</div>${!o.poExtended && !o.extReq ? `<button class="btn sm mt" data-act="extOpen" data-arg="${o.id}">Minta perpanjangan (sekali)</button>` : o.extReq ? '<div class="sm mt">Menunggu persetujuan pembeli.</div>' : ''}</div>`);
    if (o.type === 'pickup') bx.push(`<div class="card"><h3>Siapkan pesanan</h3><div class="sm muted">Setelah barang siap, tandai Siap diambil. Pembeli menerima kode ambil.</div><button class="btn primary mt" data-act="ready" data-arg="${o.id}">Siap diambil</button></div>`);
    else bx.push(`<div class="card"><h3>Pengiriman</h3><div class="sm muted">${o.awb ? `AWB <b class="mono">${esc(o.awb)}</b>` : 'AWB belum dibuat'} · ${esc(o.ship.c)} ${esc(o.ship.s)}</div><div class="row wrap mt"><button class="btn" data-act="awb" data-arg="${o.id}" ${o.awb ? 'disabled' : ''}>Generate AWB</button><button class="btn" data-act="label" data-arg="${o.id}" ${o.awb ? '' : 'disabled'}>Cetak label</button><button class="btn primary" data-act="shipIt" data-arg="${o.id}" ${o.awb ? '' : 'disabled'}>Serahkan ke kurir (Dikirim)</button></div></div>`);
  }
  if (o.status === 'READY_PICKUP') { const f = S.ui.pk ||= { id: o.id, code: '' }; if (f.id !== o.id) Object.assign(f, { id: o.id, code: '' }); const ok = f.code === o.pickupCode;
    bx.push(`<div class="card"><h3>Serah terima barang</h3><div class="sm muted">Minta pembeli menunjukkan kode ambil, lalu masukkan kodenya. Batas ambil ${dt(o.pickupBy)} (sisa ${cd(o.pickupBy)}).</div><div class="row mt wrap"><input class="in mono" style="max-width:180px;letter-spacing:.2em" id="f_ui.pk.code" data-k="ui.pk.code" data-on="pkInput" placeholder="6 digit" value="${esc(f.code)}"><button class="btn" data-act="pkScan">Pindai QR</button><span id="pkMsg" class="sm b" style="color:${ok ? 'var(--ok-ink)' : 'var(--muted)'}">${ok ? 'Kode cocok' : f.code.length === 6 ? 'Kode tidak cocok' : ''}</span></div><button id="pkBtn" class="btn primary mt" data-act="handover" data-arg="${o.id}" ${ok ? '' : 'disabled'}>Sudah diambil</button></div>`); }
  if (o.status === 'SHIPPING') bx.push(`<div class="card"><h3>Dalam pengiriman</h3><div class="row between mt"><div class="sm muted">Resi <a class="mono b" href="#" data-act="track" data-arg="${o.id}">${esc(o.awb)} ↗</a> · ${esc(o.ship.c)}</div><button class="btn primary" data-act="sellerDeliver" data-arg="${o.id}">Tandai sudah sampai</button></div><div class="sm muted mt">Status biasanya berubah otomatis dari webhook kurir; tombol ini cadangan bila kurir tidak mengirim update.</div></div>`);
  if (ret) bx.push(sRetCard(o));
  const sim = [];
  if (o.status === 'SHIPPING') sim.push(`<button class="btn sm" data-act="simCourier" data-arg="${o.id}">Webhook kurir: paket sampai</button>`);
  if (o.status === 'PAID') sim.push(`<button class="btn sm" data-act="simSellerLate" data-arg="${o.id}">Lewati batas 2 hari tanpa respon</button>`);
  if (o.status === 'PROCESSING' && o.poDeadline) sim.push(`<button class="btn sm" data-act="simPoLate" data-arg="${o.id}">Lewati tenggat Pre-Order</button>`);
  if (o.status === 'READY_PICKUP') sim.push(`<button class="btn sm" data-act="simPickupLate" data-arg="${o.id}">Lewati batas ambil</button>`);
  if (o.status === 'DELIVERED') sim.push(`<button class="btn sm" data-act="simAuto" data-arg="${o.id}">Maju 3 hari (selesai otomatis)</button>`);
  if (ret && ret.state === 'REQUESTED') sim.push(`<button class="btn sm" data-act="simNoResp" data-arg="${o.id}">Lewati batas respon retur</button>`);
  return `<a class="sm" href="#/seller/orders">← Pesanan</a><div class="topline mt"><div><h1>Order ${esc(o.no)}</h1><div class="muted">${dt(o.created)} · ${esc(o.buyerName)} · ${esc(o.buyerWa)}</div></div>${stPill(o)}</div>
<div class="g2" style="grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);align-items:start"><div class="col">${bx.join('')}
<div class="card"><h3>Produk</h3>${o.items.map(i => `<div class="row mt"><div class="grow"><b>${esc(i.name)}</b> <span class="sm muted">${esc(i.vname)} ×${i.qty}</span>${i.po ? ' <span class="po">PO</span>' : ''}</div><span class="mono">${rp(i.price * i.qty)}</span></div>`).join('')}</div>
<div class="card"><h3>Pendapatan</h3><div class="kv mt"><span>Subtotal produk</span><span class="mono">${rp(o.subtotal)}</span></div><div class="kv"><span>Fee platform ${o.type === 'pickup' ? '(pickup: 0%)' : '5%'}</span><span class="mono">− ${rp(o.fee)}</span></div><div class="kv b"><span>Diterima seller</span><span class="mono">${rp(o.net)}</span></div><div class="sm muted mt">Ongkir dan biaya layanan diteruskan ke kurir/platform. ${o.status === 'COMPLETED' ? 'Sudah masuk Saldo tersedia.' : o.status === 'CANCELLED' ? 'Dibatalkan.' : 'Cair ke Saldo tersedia saat order Selesai.'}</div></div>
${sim.length ? `<div class="simbox"><div class="t">Simulasi · hanya prototipe</div><div class="row wrap">${sim.join('')}</div></div>` : ''}</div>
<div class="col"><div class="card"><h3>Pengiriman</h3><div class="sm mt">${o.type === 'pickup' ? 'Ambil di toko' : `${esc(o.addr.name)} · ${esc(o.addr.wa)}<br>${esc(addrStr(o.addr))}<br><span class="muted">${esc(o.ship.c)} ${esc(o.ship.s)} · ${rp(o.ship.cost)}</span>`}</div></div>
<div class="card"><h3>Riwayat</h3><div class="tl mt">${[...(o.history || [])].reverse().map(h => `<div class="i"><span class="dot"></span><div><div class="sm b">${esc(h.text)}</div><div class="sm muted">${dt(h.t)}</div></div></div>`).join('')}</div></div></div></div>`;
}
A.acceptOrder = id => { acceptOrder(order(id)); toast('Pesanan diterima'); };
A.rejectOrder = id => { S.ui.rj = { id, why: '' }; openModal(`<div class="modal"><h3>Tolak pesanan</h3><p class="muted sm">Pesanan dibatalkan dan dana dikembalikan penuh ke pembeli.</p>${inp('ui.rj.why', { label: 'Alasan (wajib)', type: 'textarea' })}<div class="row"><button class="btn danger solid" data-act="rejectOk">Tolak &amp; refund</button><button class="btn" data-act="closeM">Batal</button></div></div>`); return false; };
A.rejectOk = () => { const r = S.ui.rj; if (!r.why.trim()) { toast('Alasan wajib diisi'); return false; } cancelOrder(order(r.id), r.why.trim(), 'seller'); closeModal(); toast('Pesanan ditolak, refund penuh'); };
A.cxYes = id => { cancelOrder(order(id), 'Pembatalan disetujui penjual', 'seller'); };
A.cxNo = id => { const o = order(id); o.cancelReq = null; log(o, 'Penjual menolak permintaan batal'); };
A.awb = id => { genAwb(order(id)); toast('AWB dibuat'); };
A.shipIt = id => { shipOrder(order(id)); toast('Status Dikirim, resi dikirim ke pembeli'); };
A.ready = id => { readyPickup(order(id)); toast('Kode ambil dikirim ke pembeli'); };
A.pkInput = (v, el) => { const o = order(S.ui.pk.id), ok = v === o.pickupCode; const m = document.getElementById('pkMsg'), b = document.getElementById('pkBtn'); if (m) { m.textContent = ok ? 'Kode cocok' : v.length === 6 ? 'Kode tidak cocok' : ''; m.style.color = ok ? 'var(--ok-ink)' : 'var(--muted)'; } if (b) b.disabled = !ok; return false; };
A.pkScan = () => { S.ui.pk.code = order(S.ui.pk.id).pickupCode; toast('QR terbaca'); };
A.handover = id => { const o = order(id); log(o, 'Barang diambil pembeli (kode terverifikasi)'); completeOrder(o, 'serah terima pickup'); toast('Selesai. Saldo masuk tanpa fee platform'); };
A.sellerDeliver = id => { deliverOrder(order(id), 'ditandai seller'); };
A.simCourier = id => { deliverOrder(order(id), 'webhook kurir'); toast('Webhook kurir diterima'); };
A.simSellerLate = id => { order(id).acceptBy = now() - 1; };
A.extOpen = id => { S.ui.ex = { id, days: 7, why: '' }; openModal(`<div class="modal"><h3>Minta perpanjangan</h3><p class="muted sm">Hanya sekali. Pembeli harus menyetujui; bila menolak, ia bisa membatalkan bila terlambat.</p>${inp('ui.ex.days', { label: 'Tambahan hari', type: 'select', opts: [3, 7, 14] })}${inp('ui.ex.why', { label: 'Alasan', type: 'textarea' })}<div class="row"><button class="btn primary" data-act="extOk">Kirim permintaan</button><button class="btn" data-act="closeM">Batal</button></div></div>`); return false; };
A.extOk = () => { const x = S.ui.ex; if (!x.why.trim()) { toast('Isi alasan'); return false; } const o = order(x.id); o.extReq = { days: +x.days, why: x.why.trim() }; log(o, `Seller meminta perpanjangan ${x.days} hari`); notify('buyer', 'WA', `Perpanjangan Pre-Order ${o.no}`, `Penjual meminta tambahan ${x.days} hari: ${x.why}`, '#/store/account/orders/' + o.id, 'Tanggapi'); closeModal(); toast('Permintaan dikirim ke pembeli'); };

function sRetCard(o) {
  const r = o.ret, [t, c] = RT[r.state]; let body = '';
  if (r.state === 'REQUESTED') body = `<div class="sm">${esc(r.reason)} · ${r.proofs} bukti dari pembeli${r.note ? `<br>“${esc(r.note)}”` : ''}</div><div class="alert warn mt">Respon sebelum ${dt(r.respondBy)} (sisa ${cd(r.respondBy)}); tanpa respon kasus naik ke admin. Dana order ditahan.</div><div class="row mt"><button class="btn primary" data-act="retYes" data-arg="${o.id}">Setujui retur</button><button class="btn danger" data-act="retNo" data-arg="${o.id}">Tolak + alasan</button></div>`;
  if (r.state === 'APPROVED') body = '<div class="sm">Menunggu pembeli mengirim balik barang.</div>';
  if (r.state === 'SHIPPED_BACK') body = `<div class="sm">Barang dikirim balik, resi <span class="mono">${esc(r.backAwb)}</span>.</div><button class="btn primary mt" data-act="retRecv" data-arg="${o.id}">Terima barang &amp; refund</button>`;
  if (r.state === 'REJECTED') body = `<div class="sm">Anda menolak: “${esc(r.sellerNote)}”. Pembeli dapat menaikkan ke admin.</div>`;
  if (r.state === 'DISPUTE') body = '<div class="sm">Admin Tabyte memediasi kasus ini.</div>';
  if (r.state === 'REFUNDED') body = `<div class="sm">Refund ${rp(r.refundAmt)}. Fee Tabyte dibebaskan.</div>`;
  if (r.state === 'CLOSED') body = `<div class="sm">Ditutup oleh admin: ${esc(r.decisionNote)}</div>`;
  return `<div class="card"><div class="row between"><h3>Pengembalian</h3>${pill(t, c)}</div><div class="mt">${body}</div></div>`;
}
A.retYes = id => { const o = order(id); o.ret.state = 'APPROVED'; log(o, 'Seller menyetujui retur'); notify('buyer', 'WA', `Retur ${o.no} disetujui`, 'Kirim balik barang lalu isi nomor resi.', '#/store/account/orders/' + o.id, 'Buka'); };
A.retNo = id => { S.ui.rn = { id, why: '' }; openModal(`<div class="modal"><h3>Tolak retur</h3>${inp('ui.rn.why', { label: 'Alasan (wajib)', type: 'textarea' })}<div class="row"><button class="btn danger solid" data-act="retNoOk">Tolak retur</button><button class="btn" data-act="closeM">Batal</button></div></div>`); return false; };
A.retNoOk = () => { const x = S.ui.rn; if (!x.why.trim()) { toast('Alasan wajib diisi'); return false; } const o = order(x.id); o.ret.state = 'REJECTED'; o.ret.sellerNote = x.why.trim(); log(o, 'Seller menolak retur'); notify('buyer', 'WA', `Retur ${o.no} ditolak penjual`, x.why.trim() + ' Anda bisa menaikkan ke admin.', '#/store/account/orders/' + o.id, 'Buka'); closeModal(); };
A.retRecv = id => { S.ui.rf = { id, kind: 'full', amt: '', why: '' }; const o = order(id); openModal(`<div class="modal"><h3>Terima barang &amp; refund</h3><div class="col">${inp('ui.rf.kind', { label: 'Jenis refund', type: 'select', opts: [['full', 'Refund penuh ' + rp(o.subtotal)], ['part', 'Refund sebagian']], on: 'rerender2' })}<div id="rfAmt" style="display:none">${inp('ui.rf.amt', { label: 'Jumlah refund (Rp)', type: 'number', hint: 'Maksimal ' + rp(o.subtotal) })}</div>${inp('ui.rf.why', { label: 'Alasan / kondisi barang (wajib untuk refund sebagian)', type: 'textarea' })}</div><div class="row"><button class="btn primary" data-act="retRefundOk">Proses refund</button><button class="btn" data-act="closeM">Batal</button></div></div>`); return false; };
A.rerender2 = v => { const e = document.getElementById('rfAmt'); if (e) e.style.display = v === 'part' ? 'block' : 'none'; return false; };
A.retRefundOk = () => { const x = S.ui.rf, o = order(x.id); let amt = o.subtotal; if (x.kind === 'part') { amt = Math.round(+x.amt); if (!(amt > 0 && amt < o.subtotal) || !x.why.trim()) { toast('Isi jumlah (kurang dari subtotal) dan alasan'); return false; } } o.ret.state = 'REFUNDED'; o.ret.refundAmt = amt; o.ret.decisionNote = x.why; refundOrder(o, amt, 'retur'); closeModal(); toast('Refund diproses'); };

/* ---------- saldo ---------- */
function financePage() {
  const b = S.bal, t = S.ui.ft || 'mut', inf = wdInflight(), ty = S.ui.fty || 'all';
  let run = 0; const av = [...S.mut].reverse().map(m => m.acct === 'available' ? (run += m.amt, { ...m, run }) : { ...m, run: null }).reverse();
  const rows = av.filter(m => ty === 'all' || m.type === ty);
  return `<div class="topline"><div><h1>Saldo</h1><div class="muted">Pencairan manual oleh admin Tabyte, gratis, maks. 1×24 jam kerja.</div></div><div class="row"><a class="btn" href="#/seller/finance/accounts">Kelola rekening</a>${inf ? '' : '<a class="btn primary" href="#/seller/finance/withdraw">Tarik saldo</a>'}</div></div>
<div class="g3"><div class="card"><div class="sm muted">Saldo tersedia</div><div class="mono b" style="font-size:26px">${rp(b.available)}</div></div><div class="card"><div class="sm muted">Saldo tertunda <span title="Cair saat order Selesai">ⓘ</span></div><div class="mono b" style="font-size:26px">${rp(b.pending)}</div><div class="sm muted">Cair saat order Selesai</div></div><div class="card"><div class="sm muted">Dalam proses penarikan</div><div class="mono b" style="font-size:26px">${rp(b.withdrawing)}</div></div></div>
${inf ? `<div class="card mt2 row"><span class="pill warn">${inf.status === 'DIAJUKAN' ? 'Diajukan' : 'Diproses'}</span><div class="grow"><b>${inf.no}</b> · ${rp(inf.amt)} ke ${esc(inf.bank.bank)} ${mask(inf.bank.no)}<div class="sm muted">Dana ditahan di “Dalam proses penarikan”. Satu penarikan berjalan per toko.</div></div></div>` : ''}
<div class="tabs mt2"><button class="tab ${t === 'mut' ? 'on' : ''}" data-act="ftab" data-arg="mut">Mutasi saldo</button><button class="tab ${t === 'wd' ? 'on' : ''}" data-act="ftab" data-arg="wd">Penarikan<span class="n">${S.wds.length}</span></button></div>
${t === 'mut' ? `<div class="row wrap" style="margin-bottom:10px;gap:6px">${['all', 'Penjualan', 'Penarikan', 'Refund'].map(k => `<button class="chip ${ty === k ? 'on' : ''}" data-act="fty" data-arg="${k}">${k === 'all' ? 'Semua tipe' : k}</button>`).join('')}<span class="grow"></span><button class="btn sm" data-act="csv">Unduh CSV</button></div><div class="card scroll"><table class="tbl"><thead><tr><th>Waktu</th><th>Tipe</th><th>Keterangan</th><th class="right">Jumlah</th><th class="right">Saldo tersedia</th></tr></thead><tbody>${rows.map(m => `<tr><td class="mono sm">${dt(m.t)}</td><td>${pill(m.type, m.type === 'Penarikan' ? 'warn' : m.type === 'Refund' ? 'bad' : 'ok')}${m.acct === 'pending' ? ' <span class="sm muted">tertunda</span>' : ''}</td><td>${esc(m.desc)}</td><td class="right mono" style="color:${m.amt < 0 ? 'var(--bad-ink)' : 'var(--ok-ink)'}">${m.amt < 0 ? '−' : '+'} ${rp(Math.abs(m.amt))}</td><td class="right mono">${m.run == null ? '—' : rp(m.run)}</td></tr>`).join('') || '<tr><td colspan="5" class="muted center">Belum ada mutasi.</td></tr>'}</tbody></table></div>`
      : `<div class="card scroll"><table class="tbl"><thead><tr><th>No.</th><th>Diajukan</th><th>Rekening</th><th class="right">Jumlah</th><th>Status</th><th>Ref. transfer</th></tr></thead><tbody>${S.wds.map(w => `<tr><td class="mono">${w.no}</td><td class="sm">${dt(w.t)}</td><td>${esc(w.bank.bank)} ${mask(w.bank.no)}</td><td class="right mono">${rp(w.amt)}</td><td>${pill(WS[w.status][0], WS[w.status][1])}${w.reason ? `<div class="sm muted">${esc(w.reason)}</div>` : ''}</td><td class="mono sm">${esc(w.ref || '—')}</td></tr>`).join('') || '<tr><td colspan="6" class="muted center">Belum ada penarikan.</td></tr>'}</tbody></table></div>`}`;
}
const WS = { DIAJUKAN: ['Diajukan', 'warn'], DIPROSES: ['Diproses', 'info'], DIBAYAR: ['Dibayar', 'ok'], DITOLAK: ['Ditolak', 'bad'] };
A.ftab = k => { S.ui.ft = k; }; A.fty = k => { S.ui.fty = k; }; A.csv = () => { toast('mutasi-saldo.csv diunduh (simulasi)'); return false; };

function wdState() {
  const w = S.ui.wd ||= { amt: '', bank: '', pw: '', err: '' }, banks = S.banks.filter(b => b.status === 'VERIFIED');
  if (!w.bank || !banks.find(b => b.id === w.bank)) w.bank = (banks.find(b => b.primary) || banks[0] || {}).id || '';
  const amt = parseInt(String(w.amt).replace(/\D/g, '') || '0', 10); let msg = '';
  if (!banks.length) msg = 'Belum ada rekening terverifikasi.'; else if (wdInflight()) msg = 'Masih ada penarikan yang berjalan.'; else if (!amt) msg = ''; else if (amt < 50000) msg = 'Minimal penarikan Rp 50.000'; else if (amt > S.bal.available) msg = 'Melebihi saldo tersedia ' + rp(S.bal.available);
  return { w, banks, amt, msg, ok: !msg && amt >= 50000 && w.bank && w.pw.length > 0 };
}
function withdrawPage() {
  const { w, banks, amt, msg } = wdState(), inf = wdInflight();
  if (inf) return `<a class="sm" href="#/seller/finance">← Saldo</a><div class="alert warn mt">Anda masih punya penarikan berjalan (${inf.no}). Hanya satu penarikan berjalan per toko.</div>`;
  return `<a class="sm" href="#/seller/finance">← Saldo</a><div class="card mt" style="max-width:560px"><div class="row between"><h2>Tarik saldo</h2><span class="sm muted">Tersedia <b class="mono">${rp(S.bal.available)}</b></span></div>
<div class="fld mt"><label class="lbl" for="wdAmt">Jumlah penarikan (Rp)</label><div class="row"><input id="wdAmt" class="in mono ${msg ? 'err' : ''}" inputmode="numeric" value="${esc(w.amt)}" data-k="ui.wd.amt" data-on="wdInput" placeholder="mis. 500000"><button class="btn" data-act="wdAll">Tarik semua</button></div><div id="wdErr" class="errt">${esc(msg)}</div></div>
${inp('ui.wd.bank', { label: 'Rekening tujuan (terverifikasi)', type: 'select', opts: banks.length ? banks.map(b => [b.id, `${b.bank} · ${mask(b.no)} · ${b.holder}${b.primary ? ' (Utama)' : ''}`]) : [['', 'Belum ada rekening terverifikasi']], on: 'wdInput' })}
<div style="background:var(--canvas);border-radius:10px;padding:12px 14px" class="sm"><div class="kv"><span>Jumlah penarikan</span><span class="mono" id="wdAmt2">${rp(amt)}</span></div><div class="kv"><span>Biaya penarikan</span><b style="color:var(--ok-ink)">Gratis</b></div><div class="kv b" style="border-top:1px solid var(--line);margin-top:6px;padding-top:8px"><span>Diterima di rekening</span><span class="mono" id="wdRecv">${rp(amt)}</span></div></div>
<div class="mt">${inp('ui.wd.pw', { label: 'Konfirmasi kata sandi', type: 'password', on: 'wdInput', hint: 'Demo: password' })}</div><div id="wdPwErr" class="errt" style="margin-top:-8px">${esc(w.err)}</div>
<div class="row between mt"><span class="sm muted">Diproses maks. 1×24 jam kerja</span><button id="wdBtn" class="btn primary" data-act="wdSubmit" ${wdState().ok ? '' : 'disabled'}>Ajukan penarikan</button></div>
${!banks.length ? '<div class="alert warn mt">Tambah dan verifikasi rekening dulu di <a href="#/seller/finance/accounts">Kelola rekening</a>.</div>' : ''}</div>`;
}
A.wdInput = () => { const s = wdState(); const g = id => document.getElementById(id); if (g('wdErr')) g('wdErr').textContent = s.msg; if (g('wdAmt')) g('wdAmt').classList.toggle('err', !!s.msg); if (g('wdAmt2')) g('wdAmt2').textContent = rp(s.amt); if (g('wdRecv')) g('wdRecv').textContent = rp(s.amt); if (g('wdBtn')) g('wdBtn').disabled = !s.ok; return false; };
A.wdAll = () => { S.ui.wd.amt = String(S.bal.available); };
A.wdSubmit = () => {
  const s = wdState(); if (!s.ok) return; if (s.w.pw !== S.store.password) { s.w.err = 'Kata sandi salah.'; return; }
  const bank = S.banks.find(b => b.id === s.w.bank), no = 'WD-' + String(S.nextWd++).padStart(6, '0');
  S.wds.unshift({ id: uid(), no, t: now(), amt: s.amt, bank: { bank: bank.bank, no: bank.no, holder: bank.holder }, status: 'DIAJUKAN' });
  S.bal.available -= s.amt; S.bal.withdrawing += s.amt; mut('Penarikan', `${no} · ${bank.bank} ${mask(bank.no)} · diajukan`, -s.amt, 'available');
  notify('admin', 'Email', `Penarikan baru ${no}`, `${S.store.name} · ${rp(s.amt)} ke ${bank.bank}.`, '#/admin/withdrawals', 'Proses'); audit(S.store.ownerName, `Mengajukan penarikan ${no} ${rp(s.amt)}`);
  S.ui.wd = null; toast('Penarikan diajukan'); location.hash = '#/seller/finance';
};

/* ---------- rekening ---------- */
function accountsPage() {
  const f = S.ui.nb ||= { bank: 'BCA', no: '', holder: '', proof: false, err: '' }, inf = wdInflight(), ver = S.banks.filter(b => b.status === 'VERIFIED');
  const BSx = { VERIFIED: ['Terverifikasi', 'ok'], PENDING: ['Menunggu verifikasi', 'warn'], REJECTED: ['Ditolak', 'bad'] };
  return `<a class="sm" href="#/seller/finance">← Saldo</a><div class="topline mt"><div><h1>Rekening penarikan</h1><div class="muted">Setiap rekening diverifikasi admin Tabyte sebelum bisa dipakai. Maksimal 3 rekening.</div></div></div>
<div class="col" style="max-width:760px">${S.banks.map(b => { const lastVer = b.status === 'VERIFIED' && ver.length < 2 && b.primary, canDel = !lastVer && !(inf && b.status === 'VERIFIED' && b.primary); return `<div class="card"><div class="row wrap"><div class="grow"><b>${esc(b.bank)} · ${mask(b.no)}</b> ${b.primary ? pill('Utama', 'info') : ''}<div class="sm muted">${esc(b.holder)}</div>${b.mismatch ? '<div class="sm" style="color:var(--warn-ink);font-weight:600">Nama pemilik berbeda dengan nama legal usaha (ditinjau ekstra oleh admin)</div>' : ''}${b.status === 'REJECTED' ? `<div class="sm" style="color:var(--bad-ink)">Alasan: ${esc(b.reason)}</div>` : ''}</div>${pill(BSx[b.status][0], BSx[b.status][1])}${b.status === 'VERIFIED' && !b.primary ? `<button class="btn sm" data-act="bkPrimary" data-arg="${b.id}">Jadikan utama</button>` : ''}<button class="btn sm danger" data-act="bkDel" data-arg="${b.id}" ${canDel ? '' : 'disabled'}>Hapus</button></div>${!canDel ? `<div class="sm mt" style="color:var(--warn-ink);font-weight:600">${lastVer ? 'Tidak bisa dihapus: ini satu-satunya rekening terverifikasi. Tambah dan verifikasi rekening lain dulu.' : 'Tidak bisa dihapus saat ada penarikan berjalan.'}</div>` : ''}</div>`; }).join('') || '<div class="empty">Belum ada rekening.</div>'}
${S.banks.length < 3 ? `<div class="card"><h3>Tambah rekening</h3><div class="g2 mt">${inp('ui.nb.bank', { label: 'Bank', type: 'select', opts: BANKS })}${inp('ui.nb.no', { label: 'Nomor rekening', mono: 1 })}</div>${inp('ui.nb.holder', { label: 'Nama pemilik rekening', hint: 'Sebaiknya sama dengan nama legal usaha: ' + esc(S.store.business.legalName || '—') })}
<div class="doc ${f.proof ? '' : 'miss'}" style="margin-bottom:14px"><span class="fi">${f.proof ? 'JPG' : '—'}</span><div class="grow"><div class="b">Bukti rekening</div><div class="sm muted">${f.proof ? 'buku-tabungan.jpg' : 'Foto halaman depan buku tabungan / screenshot m-banking (JPG/PNG/PDF, maks 4 MB)'}</div></div><button class="btn sm" data-act="nbProof">${f.proof ? 'Ganti' : 'Unggah'}</button></div>${f.err ? `<div class="errt" style="margin:-6px 0 10px">${f.err}</div>` : ''}<button class="btn primary" data-act="nbAdd">Ajukan verifikasi rekening</button></div>` : '<div class="alert info">Batas 3 rekening tercapai.</div>'}</div>`;
}
A.nbProof = () => { S.ui.nb.proof = true; };
A.nbAdd = () => {
  const f = S.ui.nb; if (!/^\d{6,20}$/.test(f.no.replace(/\s/g, ''))) { f.err = 'Nomor rekening tidak valid (6–20 digit).'; return; } if (!f.holder.trim()) { f.err = 'Isi nama pemilik rekening.'; return; } if (!f.proof) { f.err = 'Unggah bukti rekening.'; return; }
  const mismatch = f.holder.trim().toLowerCase() !== (S.store.business.legalName || '').trim().toLowerCase();
  S.banks.push({ id: 'b' + uid(), bank: f.bank, no: f.no.replace(/\s/g, ''), holder: f.holder.trim(), status: 'PENDING', primary: false, proof: 'buku-tabungan.jpg', mismatch, created: now() });
  audit(S.store.ownerName, `Menambah rekening ${f.bank} ${mask(f.no)}`); notify('seller', 'Email', 'Rekening baru ditambahkan', `Rekening ${f.bank} ${mask(f.no)} menunggu verifikasi. Jika bukan Anda, hubungi Tabyte.`, '', '');
  notify('admin', 'Email', 'Rekening penjual baru', `${S.store.name} · ${f.bank} ${mask(f.no)}${mismatch ? ' · NAMA BEDA' : ''}`, '#/admin/accounts', 'Tinjau'); S.ui.nb = null; toast('Diajukan. Admin memverifikasi maks. 1×24 jam kerja');
};
A.bkPrimary = id => { S.banks.forEach(b => b.primary = b.id === id); audit(S.store.ownerName, 'Mengganti rekening utama'); };
A.bkDel = id => { const b = S.banks.find(x => x.id === id); S.banks = S.banks.filter(x => x.id !== id); if (b.primary && S.banks.find(x => x.status === 'VERIFIED')) S.banks.find(x => x.status === 'VERIFIED').primary = true; audit(S.store.ownerName, `Menghapus rekening ${b.bank} ${mask(b.no)}`); };
