/* Webmaster (admin Tabyte) */
const pendVerif = () => S.store && S.store.business.status === 'PENDING' ? 1 : 0;
const pendWd = () => S.wds.filter(w => w.status === 'DIAJUKAN').length;
const pendBank = () => S.banks.filter(b => b.status === 'PENDING').length;
const pendDisp = () => S.orders.filter(o => o.ret && o.ret.state === 'DISPUTE').length;
const STS = { invited: ['Menunggu undangan diterima', 'warn'], setup: ['Belum aktif · setup', 'warn'], live: ['Aktif', 'ok'], suspended: ['Ditangguhkan', 'bad'] };

function adminShell(body, active) {
  const it = (k, t, h, c) => `<a class="nav ${active === k ? 'on' : ''}" href="${h}">${t}${c ? `<span class="c">${c}</span>` : ''}</a>`;
  return `<div class="shell admin"><aside class="side"><div class="brand">Webmaster</div><div class="sm" style="color:#8aa0c4;padding:0 10px 8px">admin@tabyte.id</div>
${it('dash', 'Dasbor', '#/admin')}<div class="grp">TOKO</div>${it('stores', 'Toko', '#/admin/stores')}${it('verif', 'Verifikasi usaha', '#/admin/verif', pendVerif())}<div class="grp">KEUANGAN</div>${it('wd', 'Penarikan', '#/admin/withdrawals', pendWd())}${it('bank', 'Rekening penjual', '#/admin/accounts', pendBank())}<div class="grp">PESANAN</div>${it('disp', 'Sengketa retur', '#/admin/disputes', pendDisp())}<div class="grp">SISTEM</div>${it('audit', 'Audit log', '#/admin/audit')}</aside><main class="main">${body}</main></div>`;
}
V.admin = p => {
  const [r, a] = p;
  if (!r) return adminShell(adminDash(), 'dash');
  if (r === 'stores') return adminShell(a === 'new' ? storeNew() : a === 'edit' ? storeEdit() : storesList(), 'stores');
  if (r === 'verif') return adminShell(a ? verifDetail() : verifList(), 'verif');
  if (r === 'withdrawals') return adminShell(wdList(), 'wd');
  if (r === 'accounts') return adminShell(bankList(), 'bank');
  if (r === 'disputes') return adminShell(a ? disputeDetail(a) : disputeList(), 'disp');
  if (r === 'audit') return adminShell(auditPage(), 'audit');
  return adminShell('<div class="empty">Halaman tidak ditemukan</div>', '');
};

function adminDash() {
  const gmv = S.orders.filter(o => ['COMPLETED', 'DELIVERED', 'SHIPPING', 'PROCESSING', 'PAID', 'READY_PICKUP'].includes(o.status)).reduce((a, o) => a + o.subtotal, 0), fee = S.orders.filter(o => o.status === 'COMPLETED').reduce((a, o) => a + o.fee, 0);
  const c = (t, n, h) => `<a class="card" href="${h}" style="color:inherit"><div class="sm muted">${t}</div><div class="mono b" style="font-size:28px">${n}</div></a>`;
  return `<div class="topline"><div><h1>Dasbor</h1><div class="muted">Total platform dan antrean yang perlu ditindak.</div></div></div>
<div class="g4">${c('Verifikasi usaha menunggu', pendVerif(), '#/admin/verif')}${c('Penarikan perlu diproses', pendWd(), '#/admin/withdrawals')}${c('Rekening menunggu', pendBank(), '#/admin/accounts')}${c('Sengketa retur', pendDisp(), '#/admin/disputes')}</div>
<div class="g3 mt2"><div class="card"><div class="sm muted">GMV (subtotal order aktif)</div><div class="mono b" style="font-size:24px">${rp(gmv)}</div></div><div class="card"><div class="sm muted">Fee platform (order selesai)</div><div class="mono b" style="font-size:24px">${rp(fee)}</div></div><div class="card"><div class="sm muted">Toko</div><div class="mono b" style="font-size:24px">${S.store ? 1 : 0}</div></div></div>
${!S.store ? '<div class="alert info mt2">Belum ada toko. <a href="#/admin/stores/new">Buat toko pertama</a> untuk memulai skenario onboarding.</div>' : ''}`;
}

/* ---------- toko ---------- */
function storesList() {
  const s = S.store;
  return `<div class="topline"><div><h1>Toko</h1></div><a class="btn primary" href="#/admin/stores/new">+ Tambah toko</a></div>
<div class="card scroll"><table class="tbl"><thead><tr><th>Toko</th><th>Subdomain</th><th>Pemilik</th><th>Status</th><th>Verifikasi</th><th>Sub ID</th><th>GMV</th><th></th></tr></thead><tbody>${s ? `<tr><td><b>${esc(s.name)}</b></td><td class="mono sm">${esc(s.slug)}.${HOST}</td><td>${esc(s.ownerName)}<div class="sm muted">${esc(s.email)}</div></td><td>${pill(STS[s.status][0], STS[s.status][1])}</td><td>${s.business.status ? pill(BS[s.business.status][0], BS[s.business.status][1]) : pill('Belum diajukan', 'gray')}</td><td class="mono sm">${esc(s.subId || '—')}</td><td class="mono">${rp(S.orders.filter(o => o.status === 'COMPLETED').reduce((a, o) => a + o.subtotal, 0))}</td><td class="right"><a class="btn sm" href="#/admin/stores/edit">Ubah</a></td></tr>` : '<tr><td colspan="8" class="muted center">Belum ada toko.</td></tr>'}</tbody></table></div>`;
}
function storeNew() {
  if (S.store) return `<a class="sm" href="#/admin/stores">← Toko</a><div class="alert info mt">Prototipe mendukung satu toko. Gunakan <b>Reset demo → Mulai dari nol</b> untuk membuat ulang.</div>`;
  const f = S.ui.ns ||= { name: '', slug: '', ownerName: '', email: '', wa: '', err: {} }, e = f.err || {};
  return `<a class="sm" href="#/admin/stores">← Toko</a><div class="topline mt"><div><h1>Tambah toko</h1><div class="muted">Admin membuat toko dan mengundang pemilik. Toko berstatus Belum aktif dan belum publik sampai go-live.</div></div></div>
<div class="card" style="max-width:640px">${inp('ui.ns.name', { label: 'Nama toko', err: e.name })}${inp('ui.ns.slug', { label: 'Subdomain', err: e.slug, ph: 'teknikjaya', hint: `Hasil: ${esc(f.slug || '{subdomain}')}.${HOST} · tidak bisa diubah setelah dibuat · huruf kecil, angka, tanda minus` })}
<div class="g2">${inp('ui.ns.ownerName', { label: 'Nama pemilik', err: e.ownerName })}${inp('ui.ns.wa', { label: 'WhatsApp pemilik', mono: 1, err: e.wa })}</div>${inp('ui.ns.email', { label: 'Email pemilik (penerima undangan)', type: 'email', err: e.email })}<button class="btn primary" data-act="createStore">Buat toko &amp; kirim undangan</button></div>`;
}
A.createStore = () => {
  const f = S.ui.ns, e = {}; f.slug = (f.slug || '').trim().toLowerCase();
  if (!f.name.trim()) e.name = 'Nama toko wajib diisi.';
  if (!/^[a-z0-9][a-z0-9-]{2,29}$/.test(f.slug)) e.slug = 'Subdomain 3–30 karakter: huruf kecil, angka, tanda minus.'; else if (RESERVED.includes(f.slug)) e.slug = `“${f.slug}” adalah kata cadangan sistem. Pilih subdomain lain.`;
  if (!f.ownerName.trim()) e.ownerName = 'Nama pemilik wajib diisi.'; if (!/.+@.+\..+/.test(f.email)) e.email = 'Email tidak valid.'; if (!okWa(nWa(f.wa))) e.wa = 'Nomor WhatsApp tidak valid.';
  f.err = e; if (Object.keys(e).length) { toast('Periksa isian yang bertanda merah'); return; }
  S.store = { name: f.name.trim(), slug: f.slug, ownerName: f.ownerName.trim(), email: f.email.trim(), wa: nWa(f.wa), status: 'invited', pwSet: false, password: '', inviteExpired: false, pickup: false, subId: '',
    profile: { desc: '', wa: '', email: '', city: 'Surabaya', kec: 'Rungkut', zip: '60293', address: '', hours: 'Sen–Sab 09.00–17.00', returnDays: 3, done: false },
    business: { type: 'PERUSAHAAN', legalName: '', legalAddress: '', npwp: '', nitku: '', billingEmail: '', docs: {}, status: null, note: '', seen: {} } };
  sendInvite(); audit('admin@tabyte.id', `Membuat toko ${f.name} (${f.slug}.${HOST})`); S.ui.ns = null; toast('Toko dibuat dan undangan dikirim'); location.hash = '#/admin/stores/edit';
};
function sendInvite() { const s = S.store; s.inviteExpired = false; notify('seller', 'Email', `Undangan membuka toko ${s.name} di Tabyte`, `Halo ${s.ownerName}, tim Tabyte sudah menyiapkan toko ${s.name} untuk Anda. Buat kata sandi untuk mulai melengkapi toko. Link berlaku 3 hari dan hanya bisa dipakai sekali.`, '#/seller/invite/' + uid(), 'Terima undangan'); audit('admin@tabyte.id', 'Mengirim undangan ke ' + s.email); }
A.resendInvite = () => { sendInvite(); toast('Undangan dikirim ulang'); };
A.expireInvite = () => { S.store.inviteExpired = true; toast('Link undangan ditandai kedaluwarsa (simulasi 3 hari)'); };

function storeEdit() {
  const s = S.store; if (!s) return `<a class="sm" href="#/admin/stores">← Toko</a><div class="empty mt">Belum ada toko.</div>`;
  const b = s.business, g = golive(), can = b.status === 'APPROVED', e = S.ui.se || '';
  if (S.ui.sid === undefined || S.ui.sidFor !== s.slug) { S.ui.sid = s.subId; S.ui.sidFor = s.slug; }
  return `<a class="sm" href="#/admin/stores">← Toko</a><div class="topline mt"><div><h1>${esc(s.name)}</h1><div class="muted mono sm">${esc(s.slug)}.${HOST}</div></div>${pill(STS[s.status][0], STS[s.status][1])}</div>
<div class="g2" style="grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);align-items:start"><div class="col">
${s.status === 'invited' ? `<div class="alert warn"><b>Undangan belum diterima.</b> ${s.inviteExpired ? 'Link kedaluwarsa.' : 'Pemilik belum membuat kata sandi.'}<div class="row wrap mt"><button class="btn sm primary" data-act="resendInvite">Kirim ulang undangan</button><a class="btn sm" href="#" data-act="drawer">Buka kotak masuk simulasi</a><button class="btn sm" data-act="expireInvite">Simulasi: link kedaluwarsa</button></div></div>` : ''}
<div class="card"><h3>Data toko</h3><div class="g2 mt">${inp('store.name', { label: 'Nama toko', ro: 1 })}${inp('store.slug', { label: 'Subdomain', ro: 1, hint: 'Tidak bisa diubah' })}${inp('store.ownerName', { label: 'Pemilik', ro: 1 })}${inp('store.email', { label: 'Email', ro: 1 })}</div></div>
<div class="card"><h3>Midtrans Sub ID</h3><div class="fld mt"><label class="lbl" for="f_ui.sid">Sub ID</label><input id="f_ui.sid" class="in mono" data-k="ui.sid" value="${esc(S.ui.sid)}" ${can ? '' : 'disabled'} placeholder="mis. G123456789"><div class="hint">1 toko = 1 Sub ID dan harus unik. Wajib untuk go-live.${can ? '' : ' <b>Bisa diisi setelah verifikasi usaha disetujui.</b>'}</div>${e ? `<div class="errt">${e}</div>` : ''}</div><button class="btn primary" data-act="saveSub" ${can ? '' : 'disabled'}>Simpan Sub ID</button></div>
<div class="card"><h3>Status toko</h3><div class="sm muted mt">Toko tidak pernah dihapus dari sini; hanya ditangguhkan. Toko ditangguhkan menampilkan “Toko sedang tidak aktif” di storefront.</div><div class="row mt">${s.status === 'live' ? '<button class="btn danger" data-act="suspend">Tangguhkan toko…</button>' : s.status === 'suspended' ? '<button class="btn ok" data-act="unsuspend">Aktifkan kembali</button>' : '<span class="sm muted">Toko aktif otomatis saat checklist go-live terpenuhi.</span>'}${s.status === 'suspended' ? `<span class="sm">Alasan: ${esc(s.suspendReason)}</span>` : ''}</div></div></div>
<div class="col"><div class="card"><h3>Kesiapan go-live</h3><div class="mt">${g.map(x => `<div class="row" style="padding:7px 0;border-bottom:1px solid var(--line2)"><span style="width:20px;height:20px;border-radius:99px;display:grid;place-items:center;font-size:12px;font-weight:800;flex-shrink:0;${x.done ? 'background:var(--ok);color:#fff' : 'border:2px solid var(--warn);color:var(--warn)'}">${x.done ? '✓' : '!'}</span><div class="grow sm">${x.t}</div><span class="pill gray">${x.who}</span></div>`).join('')}</div></div>
<div class="card"><h3>Verifikasi usaha</h3><div class="mt">${b.status ? pill(BS[b.status][0], BS[b.status][1]) : pill('Belum diajukan', 'gray')}</div>${b.status === 'PENDING' ? '<a class="btn primary sm mt" href="#/admin/verif/store">Tinjau sekarang</a>' : ''}</div></div></div>`;
}
A.saveSub = () => {
  const v = (S.ui.sid || '').trim(); S.ui.se = '';
  if (!/^[A-Za-z0-9-]{6,64}$/.test(v)) { S.ui.se = 'Sub ID 6–64 karakter huruf/angka.'; return; }
  if (v === 'G000000001') { S.ui.se = 'Sub ID ini sudah dipakai toko lain.'; return; }
  S.store.subId = v; audit('admin@tabyte.id', `Mengisi Midtrans Sub ID ${v}`); toast('Sub ID tersimpan'); autoLive();
};
A.suspend = () => { S.ui.sp = { why: '', ok: false }; openModal(`<div class="modal"><h3>Tangguhkan toko</h3><div class="alert bad">Storefront akan menampilkan “Toko sedang tidak aktif”. Pesanan berjalan tidak otomatis dibatalkan.</div><div class="mt">${inp('ui.sp.why', { label: 'Alasan (wajib)', type: 'textarea' })}<label class="row"><input type="checkbox" data-k="ui.sp.ok"><span>Saya yakin menangguhkan toko ini.</span></label></div><div class="row mt"><button class="btn danger solid" data-act="suspendOk">Tangguhkan</button><button class="btn" data-act="closeM">Batal</button></div></div>`); return false; };
A.suspendOk = () => { const x = S.ui.sp; if (!x.why.trim() || !x.ok) { toast('Isi alasan dan centang konfirmasi'); return false; } S.store.status = 'suspended'; S.store.suspendReason = x.why.trim(); audit('admin@tabyte.id', 'Menangguhkan toko: ' + x.why.trim()); notify('seller', 'Email', 'Toko Anda ditangguhkan', x.why.trim(), '', ''); closeModal(); };
A.unsuspend = () => { S.store.status = 'live'; audit('admin@tabyte.id', 'Mengaktifkan kembali toko'); };

/* ---------- verifikasi usaha ---------- */
function verifList() {
  const s = S.store, b = s && s.business, t = S.ui.adm.vt || 'PENDING';
  const rows = s && b.status === t ? [s] : [];
  const cnt = k => s && b.status === k ? 1 : 0;
  return `<div class="topline"><div><h1>Verifikasi usaha</h1></div></div><div class="tabs">${[['PENDING', 'Menunggu'], ['APPROVED', 'Disetujui'], ['REJECTED', 'Ditolak']].map(([k, l]) => `<button class="tab ${t === k ? 'on' : ''}" data-act="vtab" data-arg="${k}">${l}<span class="n">${cnt(k)}</span></button>`).join('')}</div>
<div class="card scroll"><table class="tbl"><thead><tr><th>Toko</th><th>Jenis</th><th>Nama usaha</th><th>NPWP</th><th>Dokumen</th><th>Dikirim</th><th></th></tr></thead><tbody>${rows.map(s => `<tr class="click" onclick="location.hash='#/admin/verif/store'"><td><b>${esc(s.name)}</b></td><td>${s.business.type === 'PERUSAHAAN' ? 'Perusahaan' : 'Perorangan'}</td><td>${esc(s.business.legalName)}</td><td class="mono">${mask(s.business.npwp)}</td><td>${Object.keys(s.business.docs).length} berkas</td><td class="sm">${s.business.submittedAt ? dt(s.business.submittedAt) : '—'}</td><td class="right"><span class="btn sm">Tinjau</span></td></tr>`).join('') || '<tr><td colspan="7" class="muted center">Tidak ada data.</td></tr>'}</tbody></table></div>`;
}
A.vtab = k => { S.ui.adm.vt = k; };
function verifDetail() {
  const s = S.store; if (!s || !s.business.status) return `<a class="sm" href="#/admin/verif">← Verifikasi usaha</a><div class="empty mt">Belum ada pengajuan.</div>`;
  const b = s.business, kinds = Object.keys(b.docs), cur = S.ui.adm.doc && b.docs[S.ui.adm.doc] ? S.ui.adm.doc : kinds[0], req = reqDocs(b.type);
  b.seen ||= {}; const allSeen = req.every(k => b.seen[k]), pend = b.status === 'PENDING';
  return `<a class="sm" href="#/admin/verif">← Verifikasi usaha</a><div class="topline mt"><div><h1>${esc(s.name)}</h1><div class="muted">Dikirim ${b.submittedAt ? dt(b.submittedAt) : '—'}</div></div>${pill(BS[b.status][0], BS[b.status][1])}</div>
<div class="g2" style="grid-template-columns:260px minmax(0,1fr);align-items:start"><div class="card"><h3>Data usaha</h3><div class="col mt" style="gap:10px">${[['Jenis', b.type === 'PERUSAHAAN' ? 'Perusahaan' : 'Perorangan'], ['Nama usaha', b.legalName], ['NPWP', `<span class="mono">${esc(b.npwp)}</span>`, 1], ['NITKU', `<span class="mono">${esc(b.nitku || '—')}</span>`, 1], ['Alamat', b.legalAddress], ['Email penagihan', b.billingEmail]].map(([l, v, raw]) => `<div><div class="sm muted">${l}</div><div class="b">${raw ? v : esc(v)}</div></div>`).join('')}</div></div>
<div class="card"><div class="tabs">${kinds.map(k => `<button class="tab ${k === cur ? 'on' : ''}" data-act="docTab" data-arg="${k}">${b.seen[k] ? '✓ ' : ''}${DOCS[k]}${req.includes(k) ? '' : ' (opsional)'}</button>`).join('')}</div>
${cur ? `<div class="row between"><div class="sm"><b>${DOCS[cur]}</b> · ${esc(b.docs[cur])}</div><label class="row sm" style="gap:6px"><input type="checkbox" ${b.seen[cur] ? 'checked' : ''} data-act="seen" data-arg="${cur}" ${pend ? '' : 'disabled'}> Sudah diperiksa</label></div><div class="docprev mt"><div class="pg"><div class="center sm muted b" style="margin-bottom:14px">${DOCS[cur].toUpperCase()} · pratinjau</div>${[90, 100, 80, 95, 60, 100, 85, 92, 70, 100, 88].map(w => `<div class="ln" style="width:${w}%"></div>`).join('')}</div></div>` : '<div class="empty">Tidak ada dokumen.</div>'}</div></div>
${pend ? `<div class="card mt2"><div class="row wrap" style="align-items:flex-end"><div class="grow"><label class="lbl" for="f_ui.adm.vnote">Catatan untuk penjual <span class="muted" style="font-weight:400">(wajib bila ditolak)</span></label><input id="f_ui.adm.vnote" class="in" data-k="ui.adm.vnote" value="${esc(S.ui.adm.vnote || '')}" placeholder="Contoh: NPWP tidak terbaca, unggah ulang"></div><button class="btn danger" data-act="vReject">Tolak</button><button class="btn ok" data-act="vApprove" ${allSeen ? '' : 'disabled'}>Setujui verifikasi</button></div>${!allSeen ? `<div class="hint">Periksa semua dokumen wajib (${req.map(k => DOCS[k]).join(', ')}) sebelum menyetujui.</div>` : ''}</div>`
      : b.status === 'APPROVED' ? `<div class="card mt2 row"><div class="grow sm">Disetujui oleh <b>${esc(b.verifiedBy)}</b> pada ${dt(b.verifiedAt)}.</div><button class="btn danger" data-act="vRevoke">Cabut verifikasi…</button></div>` : `<div class="alert bad mt2">Ditolak: “${esc(b.note)}”. Menunggu penjual mengirim ulang.</div>`}`;
}
A.docTab = k => { S.ui.adm.doc = k; };
A.seen = k => { const b = S.store.business; b.seen[k] = !b.seen[k]; };
A.vApprove = () => { const b = S.store.business; b.status = 'APPROVED'; b.verifiedAt = now(); b.verifiedBy = 'admin@tabyte.id'; b.note = ''; S.ui.adm.vnote = ''; audit('admin@tabyte.id', 'Menyetujui verifikasi usaha ' + S.store.name); notify('seller', 'Email', 'Verifikasi usaha disetujui', 'Toko Anda mendapat badge Terverifikasi. Tabyte akan mendaftarkan akun pembayaran (Midtrans).', '#/seller', 'Buka dashboard'); toast('Verifikasi disetujui'); autoLive(); };
A.vReject = () => { const n = (S.ui.adm.vnote || '').trim(); if (!n) { toast('Catatan wajib diisi saat menolak'); return false; } const b = S.store.business; b.status = 'REJECTED'; b.note = n; b.verifiedAt = null; audit('admin@tabyte.id', 'Menolak verifikasi usaha: ' + n); notify('seller', 'Email', 'Verifikasi usaha ditolak', n + ' Perbaiki dan kirim ulang.', '#/seller/business', 'Perbaiki'); S.ui.adm.vnote = ''; toast('Verifikasi ditolak, penjual dinotifikasi'); };
A.vRevoke = () => { S.ui.rv2 = { why: '' }; openModal(`<div class="modal"><h3>Cabut verifikasi</h3><div class="alert bad">Badge Terverifikasi dihapus dari storefront.</div><div class="mt">${inp('ui.rv2.why', { label: 'Alasan (wajib)', type: 'textarea' })}</div><div class="row"><button class="btn danger solid" data-act="vRevokeOk">Cabut</button><button class="btn" data-act="closeM">Batal</button></div></div>`); return false; };
A.vRevokeOk = () => { const w = S.ui.rv2.why.trim(); if (!w) { toast('Alasan wajib diisi'); return false; } const b = S.store.business; b.status = 'REJECTED'; b.note = 'Verifikasi dicabut: ' + w; audit('admin@tabyte.id', 'Mencabut verifikasi: ' + w); closeModal(); };

/* ---------- penarikan ---------- */
function wdList() {
  const t = S.ui.adm.wt || 'DIAJUKAN', f = { DIAJUKAN: ['DIAJUKAN'], DIPROSES: ['DIPROSES'], DIBAYAR: ['DIBAYAR'], DITOLAK: ['DITOLAK'] }[t];
  const rows = S.wds.filter(w => f.includes(w.status));
  return `<div class="topline"><div><h1>Penarikan</h1><div class="muted">Diproses manual: transfer dari rekening Tabyte lalu catat ref. transfer.</div></div></div><div class="tabs">${[['DIAJUKAN', 'Perlu diproses'], ['DIPROSES', 'Diproses'], ['DIBAYAR', 'Dibayar'], ['DITOLAK', 'Ditolak']].map(([k, l]) => `<button class="tab ${t === k ? 'on' : ''}" data-act="wtab" data-arg="${k}">${l}<span class="n">${S.wds.filter(w => w.status === k).length}</span></button>`).join('')}</div>
<div class="card scroll"><table class="tbl"><thead><tr><th>No.</th><th>Toko</th><th>Diajukan</th><th>Rekening tujuan</th><th class="right">Jumlah</th><th>Verif. rekening</th><th></th></tr></thead><tbody>${rows.map(w => { const bk = S.banks.find(b => b.no === w.bank.no); return `<tr><td class="mono">${w.no}</td><td>${esc(S.store.name)}</td><td class="sm">${dt(w.t)}</td><td>${esc(w.bank.bank)} <span class="mono">${esc(w.bank.no)}</span><div class="sm muted">${esc(w.bank.holder)}</div></td><td class="right mono b">${rp(w.amt)}</td><td>${bk ? pill(bk.status === 'VERIFIED' ? 'Terverifikasi' : 'Belum', bk.status === 'VERIFIED' ? 'ok' : 'warn') : '—'}</td><td class="right"><div class="row wrap" style="justify-content:flex-end">${w.status === 'DIAJUKAN' ? `<button class="btn sm primary" data-act="wdProc" data-arg="${w.id}">Proses</button>` : ''}${['DIAJUKAN', 'DIPROSES'].includes(w.status) ? `<button class="btn sm ok" data-act="wdPay" data-arg="${w.id}">Tandai dibayar</button><button class="btn sm danger" data-act="wdRej" data-arg="${w.id}">Tolak</button>` : w.ref ? `<span class="mono sm">${esc(w.ref)}</span>` : esc(w.reason || '')}</div></td></tr>`; }).join('') || '<tr><td colspan="7" class="muted center">Tidak ada penarikan.</td></tr>'}</tbody></table></div>`;
}
A.wtab = k => { S.ui.adm.wt = k; };
A.wdProc = id => { const w = S.wds.find(x => x.id === id); w.status = 'DIPROSES'; audit('admin@tabyte.id', `Memproses penarikan ${w.no}`); };
A.wdPay = id => { S.ui.wp = { id, ref: '' }; const w = S.wds.find(x => x.id === id); openModal(`<div class="modal"><h3>Tandai dibayar · ${w.no}</h3><div class="sm muted">Transfer ${rp(w.amt)} ke ${esc(w.bank.bank)} ${esc(w.bank.no)} a.n. ${esc(w.bank.holder)}.</div><div class="mt">${inp('ui.wp.ref', { label: 'Ref. transfer (wajib)', mono: 1 })}</div><div class="row"><button class="btn ok" data-act="wdPayOk">Tandai dibayar</button><button class="btn" data-act="closeM">Batal</button></div></div>`); return false; };
A.wdPayOk = () => { const x = S.ui.wp; if (!x.ref.trim()) { toast('Ref. transfer wajib diisi'); return false; } const w = S.wds.find(y => y.id === x.id); w.status = 'DIBAYAR'; w.ref = x.ref.trim(); w.paidAt = now(); S.bal.withdrawing -= w.amt; audit('admin@tabyte.id', `Penarikan ${w.no} dibayar (${w.ref})`); notify('seller', 'Email', `Penarikan ${w.no} dibayar`, `${rp(w.amt)} sudah ditransfer ke ${w.bank.bank}. Ref. ${w.ref}.`, '#/seller/finance', 'Lihat saldo'); closeModal(); toast('Penarikan ditandai dibayar'); };
A.wdRej = id => { S.ui.wr = { id, why: '' }; openModal(`<div class="modal"><h3>Tolak penarikan</h3><div class="sm muted">Dana dikembalikan ke saldo tersedia seller.</div><div class="mt">${inp('ui.wr.why', { label: 'Alasan (wajib)', type: 'textarea' })}</div><div class="row"><button class="btn danger solid" data-act="wdRejOk">Tolak</button><button class="btn" data-act="closeM">Batal</button></div></div>`); return false; };
A.wdRejOk = () => { const x = S.ui.wr; if (!x.why.trim()) { toast('Alasan wajib diisi'); return false; } const w = S.wds.find(y => y.id === x.id); w.status = 'DITOLAK'; w.reason = x.why.trim(); S.bal.withdrawing -= w.amt; S.bal.available += w.amt; mut('Penarikan', `${w.no} ditolak · dana dikembalikan`, w.amt, 'available'); audit('admin@tabyte.id', `Menolak penarikan ${w.no}: ${w.reason}`); notify('seller', 'Email', `Penarikan ${w.no} ditolak`, w.reason + ' Dana kembali ke saldo tersedia.', '#/seller/finance', 'Lihat saldo'); closeModal(); };

/* ---------- rekening penjual ---------- */
function bankList() {
  const t = S.ui.adm.bt || 'PENDING', rows = S.banks.filter(b => b.status === t);
  return `<div class="topline"><div><h1>Rekening penjual</h1></div></div><div class="tabs">${[['PENDING', 'Menunggu'], ['VERIFIED', 'Terverifikasi'], ['REJECTED', 'Ditolak']].map(([k, l]) => `<button class="tab ${t === k ? 'on' : ''}" data-act="btab2" data-arg="${k}">${l}<span class="n">${S.banks.filter(b => b.status === k).length}</span></button>`).join('')}</div>
<div class="card scroll"><table class="tbl"><thead><tr><th>Toko</th><th>Bank</th><th>No. rekening</th><th>Nama pemilik</th><th>Nama beda</th><th>Bukti</th><th></th></tr></thead><tbody>${rows.map(b => `<tr><td>${esc(S.store.name)}</td><td>${esc(b.bank)}</td><td class="mono">${esc(b.no)}</td><td>${esc(b.holder)}<div class="sm muted">Nama legal: ${esc(S.store.business.legalName || '—')}</div></td><td>${b.mismatch ? pill('Ya', 'warn') : pill('Tidak', 'ok')}</td><td><button class="btn sm" data-act="bkProof" data-arg="${b.id}">Lihat bukti</button></td><td class="right"><div class="row wrap" style="justify-content:flex-end">${b.status === 'PENDING' ? `<button class="btn sm ok" data-act="bkOk" data-arg="${b.id}">Verifikasi</button><button class="btn sm danger" data-act="bkNo" data-arg="${b.id}">Tolak</button>` : b.status === 'VERIFIED' ? `<button class="btn sm danger" data-act="bkRevoke" data-arg="${b.id}">Cabut</button>` : `<span class="sm muted">${esc(b.reason || '')}</span>`}</div></td></tr>`).join('') || '<tr><td colspan="7" class="muted center">Tidak ada rekening.</td></tr>'}</tbody></table></div>`;
}
A.btab2 = k => { S.ui.adm.bt = k; };
A.bkProof = id => { const b = S.banks.find(x => x.id === id); openModal(`<div class="modal wide"><div class="row between"><h3>Bukti rekening · ${esc(b.proof)}</h3><button class="btn sm" data-act="closeM">✕</button></div><div class="docprev mt"><div class="pg"><div class="center sm muted b" style="margin-bottom:12px">BUKU TABUNGAN ${esc(b.bank.toUpperCase())}</div><div class="mono sm">${esc(b.no)}</div><div class="b" style="margin:6px 0 14px">${esc(b.holder)}</div>${[80, 100, 60, 90].map(w => `<div class="ln" style="width:${w}%"></div>`).join('')}</div></div><div class="grid g3 sm mt"><div>Bank<br><b>${esc(b.bank)}</b></div><div>Nomor<br><b class="mono">${esc(b.no)}</b></div><div>Nama<br><b>${esc(b.holder)}</b></div></div></div>`); return false; };
A.bkOk = id => { const b = S.banks.find(x => x.id === id); b.status = 'VERIFIED'; if (!S.banks.some(x => x.primary && x.status === 'VERIFIED')) b.primary = true; audit('admin@tabyte.id', `Memverifikasi rekening ${b.bank} ${mask(b.no)}`); notify('seller', 'Email', 'Rekening terverifikasi', `${b.bank} ${mask(b.no)} kini bisa dipakai menarik saldo.`, '#/seller/finance/accounts', 'Buka'); toast('Rekening diverifikasi'); autoLive(); };
A.bkNo = id => { S.ui.bn = { id, why: '' }; openModal(`<div class="modal"><h3>Tolak rekening</h3><div class="mt">${inp('ui.bn.why', { label: 'Alasan (wajib)', type: 'textarea' })}</div><div class="row"><button class="btn danger solid" data-act="bkNoOk">Tolak</button><button class="btn" data-act="closeM">Batal</button></div></div>`); return false; };
A.bkNoOk = () => { const x = S.ui.bn; if (!x.why.trim()) { toast('Alasan wajib diisi'); return false; } const b = S.banks.find(y => y.id === x.id); b.status = 'REJECTED'; b.reason = x.why.trim(); audit('admin@tabyte.id', `Menolak rekening ${b.bank} ${mask(b.no)}: ${b.reason}`); notify('seller', 'Email', 'Rekening ditolak', b.reason, '#/seller/finance/accounts', 'Buka'); closeModal(); };
A.bkRevoke = id => { const b = S.banks.find(x => x.id === id); b.status = 'REJECTED'; b.primary = false; b.reason = 'Verifikasi dicabut admin'; audit('admin@tabyte.id', `Mencabut verifikasi rekening ${b.bank} ${mask(b.no)}`); };

/* ---------- sengketa retur ---------- */
function disputeList() {
  const t = S.ui.adm.dt || 'open', rows = S.orders.filter(o => o.ret && (t === 'open' ? o.ret.state === 'DISPUTE' : ['REFUNDED', 'CLOSED'].includes(o.ret.state) && o.ret.fromDispute));
  return `<div class="topline"><div><h1>Sengketa retur</h1><div class="muted">Kasus naik ke sini bila seller menolak lalu pembeli banding, atau seller tidak merespons 2 hari.</div></div></div><div class="tabs">${[['open', 'Perlu mediasi'], ['done', 'Selesai']].map(([k, l]) => `<button class="tab ${t === k ? 'on' : ''}" data-act="dtab" data-arg="${k}">${l}<span class="n">${S.orders.filter(o => o.ret && (k === 'open' ? o.ret.state === 'DISPUTE' : ['REFUNDED', 'CLOSED'].includes(o.ret.state) && o.ret.fromDispute)).length}</span></button>`).join('')}</div>
<div class="card scroll"><table class="tbl"><thead><tr><th>Order</th><th>Pembeli</th><th>Alasan</th><th>Subtotal</th><th>Status</th><th></th></tr></thead><tbody>${rows.map(o => `<tr class="click" onclick="location.hash='#/admin/disputes/${o.id}'"><td><b>${esc(o.no)}</b></td><td>${esc(o.buyerName)}</td><td>${esc(o.ret.reason)}</td><td class="mono">${rp(o.subtotal)}</td><td>${pill(RT[o.ret.state][0], RT[o.ret.state][1])}</td><td class="right"><span class="btn sm">Buka</span></td></tr>`).join('') || '<tr><td colspan="6" class="muted center">Tidak ada kasus.</td></tr>'}</tbody></table></div>`;
}
A.dtab = k => { S.ui.adm.dt = k; };
function disputeDetail(id) {
  const o = order(id); if (!o || !o.ret) return '<div class="empty">Kasus tidak ditemukan</div>'; const r = o.ret, f = S.ui.dc ||= { id: o.id, kind: 'full', amt: '', why: '' }; if (f.id !== o.id) Object.assign(f, { id: o.id, kind: 'full', amt: '', why: '' });
  return `<a class="sm" href="#/admin/disputes">← Sengketa retur</a><div class="topline mt"><div><h1>Order ${esc(o.no)}</h1><div class="muted">${esc(S.store.name)} · ${esc(o.buyerName)} · subtotal ${rp(o.subtotal)}</div></div>${pill(RT[r.state][0], RT[r.state][1])}</div>
<div class="g2"><div class="card"><h3>Bukti pembeli</h3><div class="row wrap mt">${Array.from({ length: r.proofs }, (_, i) => `<div class="ph" style="${phc('', i)};width:64px;font-size:11px;border-radius:8px">${i % 3 === 2 ? 'video' : 'foto ' + (i + 1)}</div>`).join('')}</div><div class="sm mt"><b>${esc(r.reason)}</b>${r.note ? `<br>“${esc(r.note)}”` : ''}</div></div>
<div class="card"><h3>Tanggapan seller</h3><div class="sm mt">${r.sellerNote ? `“${esc(r.sellerNote)}”` : '<span class="muted">Seller tidak merespons dalam batas 2 hari.</span>'}</div></div></div>
<div class="card mt"><h3>Riwayat chat</h3><div class="col mt" style="gap:8px"><div class="alert info" style="max-width:80%">Pembeli: ${esc(r.note || 'Barang bermasalah, mohon dikembalikan.')}</div>${r.sellerNote ? `<div class="alert warn" style="max-width:80%;align-self:flex-end">Seller: ${esc(r.sellerNote)}</div>` : ''}</div></div>
${r.state === 'DISPUTE' ? `<div class="card mt"><h3>Keputusan admin</h3><div class="g3 mt" style="gap:8px">${[['full', 'Refund penuh'], ['part', 'Refund sebagian'], ['no', 'Tolak retur']].map(([k, l]) => `<label class="opt ${f.kind === k ? 'sel' : ''}"><input type="radio" name="dk" ${f.kind === k ? 'checked' : ''} data-act="dk" data-arg="${k}">${l}</label>`).join('')}</div>
${f.kind === 'part' ? `<div class="mt">${inp('ui.dc.amt', { label: 'Jumlah refund (Rp)', type: 'number', hint: 'Kurang dari ' + rp(o.subtotal) })}</div>` : ''}<div class="mt">${inp('ui.dc.why', { label: 'Alasan keputusan (dikirim ke kedua pihak, wajib)', type: 'textarea' })}</div><button class="btn primary" data-act="dcSubmit" data-arg="${o.id}">Putuskan${f.kind === 'no' ? '' : ' &amp; refund via Midtrans'}</button></div>` : `<div class="alert ok mt">Kasus selesai. ${esc(r.decisionNote || '')}</div>`}`;
}
A.dk = k => { S.ui.dc.kind = k; };
A.dcSubmit = id => {
  const f = S.ui.dc, o = order(id); if (!f.why.trim()) { toast('Alasan keputusan wajib diisi'); return false; }
  o.ret.fromDispute = true; o.ret.decisionNote = f.why.trim();
  if (f.kind === 'no') { o.ret.state = 'CLOSED'; log(o, 'Admin menolak retur: ' + f.why.trim()); o.autoCompleteAt = now() + D; notify('buyer', 'Email', `Retur ${o.no} ditolak admin`, f.why.trim(), '#/store/account/orders/' + o.id, 'Buka'); notify('seller', 'Email', `Sengketa ${o.no} dimenangkan`, f.why.trim(), '#/seller/orders/' + o.id, 'Buka'); }
  else { let amt = o.subtotal; if (f.kind === 'part') { amt = Math.round(+f.amt); if (!(amt > 0 && amt < o.subtotal)) { toast('Jumlah refund harus kurang dari subtotal'); return false; } } o.ret.state = 'REFUNDED'; o.ret.refundAmt = amt; refundOrder(o, amt, 'keputusan admin'); notify('seller', 'Email', `Sengketa ${o.no} diputuskan refund`, f.why.trim(), '#/seller/orders/' + o.id, 'Buka'); }
  audit('admin@tabyte.id', `Memutuskan sengketa ${o.no}: ${f.kind}`); S.ui.dc = null; toast('Keputusan tercatat'); location.hash = '#/admin/disputes';
};

function auditPage() {
  return `<div class="topline"><div><h1>Audit log</h1><div class="muted">Setiap keputusan admin dan perubahan penting tercatat.</div></div></div><div class="card scroll"><table class="tbl"><thead><tr><th>Waktu</th><th>Pelaku</th><th>Aksi</th></tr></thead><tbody>${S.audit.map(a => `<tr><td class="mono sm">${dt(a.t)}</td><td>${esc(a.who)}</td><td>${esc(a.text)}</td></tr>`).join('') || '<tr><td colspan="3" class="muted center">Belum ada catatan.</td></tr>'}</tbody></table></div>`;
}
