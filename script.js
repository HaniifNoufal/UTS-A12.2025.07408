const NOMOR_TOKO = '6281229927485';
const JAM_BUKA = 7;
const JAM_TUTUP = 21;
const NAMA_KATEGORI = { sembako: 'Sembako', minuman: 'Minuman', rumah: 'Rumah tangga' };

const PRODUK = [
  { nama: 'Beras 5 kg',         kategori: 'sembako', harga: 68000, stok: 24,  ikon: '🍚' },
  { nama: 'Minyak goreng 1 L',  kategori: 'sembako', harga: 18500, stok: 30,  ikon: '🛢️' },
  { nama: 'Gula pasir 1 kg',    kategori: 'sembako', harga: 17500, stok: 6,   ikon: '🍬' },
  { nama: 'Telur ayam 1 kg',    kategori: 'sembako', harga: 29000, stok: 15,  ikon: '🥚' },
  { nama: 'Mi instan',          kategori: 'sembako', harga: 3200,  stok: 80,  ikon: '🍜' },
  { nama: 'Garam halus',        kategori: 'sembako', harga: 4000,  stok: 25,  ikon: '🧂' },
  { nama: 'Kopi sachet',        kategori: 'minuman', harga: 1500,  stok: 100, ikon: '☕' },
  { nama: 'Teh celup',          kategori: 'minuman', harga: 7500,  stok: 0,   ikon: '🍵' },
  { nama: 'Susu kental manis',  kategori: 'minuman', harga: 12500, stok: 3,   ikon: '🥛' },
  { nama: 'Air mineral 600 ml', kategori: 'minuman', harga: 3500,  stok: 48,  ikon: '💧' },
  { nama: 'Sabun cuci piring',  kategori: 'rumah',   harga: 14000, stok: 12,  ikon: '🧼' }
];

const $ = (id) => document.getElementById(id);
const rupiah = (angka) => 'Rp' + angka.toLocaleString('id-ID');
const pad = (n) => String(n).padStart(2, '0');
function esc(teks) {
  return String(teks).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

let waktuToast;
function toast(pesan) {
  const el = $('toast');
  el.textContent = pesan;
  el.classList.add('tampil');
  clearTimeout(waktuToast);
  waktuToast = setTimeout(() => el.classList.remove('tampil'), 2200);
}

const navbar = $('navbar');
const menu = $('menu');
const tombolMenu = $('menu-btn');

window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 10));

tombolMenu.addEventListener('click', () => {
  const terbuka = menu.classList.toggle('buka');
  tombolMenu.setAttribute('aria-expanded', terbuka);
});
menu.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    menu.classList.remove('buka');
    tombolMenu.setAttribute('aria-expanded', 'false');
  }
});

function setTema(tema, simpanPilihan) {
  document.documentElement.dataset.tema = tema;
  $('tema').textContent = tema === 'dark' ? '☀️' : '🌙';
  if (simpanPilihan) {
    try { localStorage.setItem('tema', tema); } catch (e) {}
  }
}
let temaAwal = null;
try { temaAwal = localStorage.getItem('tema'); } catch (e) {}
setTema(temaAwal || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'), false);
$('tema').addEventListener('click', () => {
  setTema(document.documentElement.dataset.tema === 'dark' ? 'light' : 'dark', true);
});

const pengamat = new IntersectionObserver((daftar) => {
  daftar.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('tampil');
      pengamat.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => pengamat.observe(el));

function hitung(el) {
  const target = Number(el.dataset.target);
  const mulai = performance.now();
  const durasi = 1200;
  function langkah(sekarang) {
    const p = Math.min((sekarang - mulai) / durasi, 1);
    el.textContent = Math.round(target * p);
    if (p < 1) requestAnimationFrame(langkah);
  }
  requestAnimationFrame(langkah);
}
$('hitung-produk').dataset.target = PRODUK.length;
document.querySelectorAll('[data-target]').forEach(hitung);

let kategoriAktif = 'semua';
let urutan = 'bawaan';

function urutkan(daftar) {
  const salinan = [...daftar];
  if (urutan === 'murah') salinan.sort((a, b) => a.harga - b.harga);
  else if (urutan === 'mahal') salinan.sort((a, b) => b.harga - a.harga);
  else if (urutan === 'nama') salinan.sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
  return salinan;
}

function kartuProduk(p) {
  const habis = p.stok === 0;
  const lencana = habis
    ? '<span class="lencana merah">Stok habis</span>'
    : p.stok <= 5 ? `<span class="lencana kuning">Sisa ${p.stok}</span>` : '';
  return `
    <article class="kartu-produk">
      <div class="ikon-produk" aria-hidden="true">${p.ikon}</div>
      <span class="kategori">${NAMA_KATEGORI[p.kategori]}</span>
      <h3>${esc(p.nama)}</h3>
      <p class="harga">${rupiah(p.harga)}</p>
      <div class="baris-lencana">${lencana}</div>
      <button class="btn tambah" data-nama="${esc(p.nama)}" ${habis ? 'disabled' : ''}>
        ${habis ? 'Stok habis' : 'Tambah ke keranjang'}
      </button>
    </article>`;
}

function tampilkanProduk() {
  const kata = $('cari').value.trim().toLowerCase();
  const hasil = urutkan(PRODUK.filter((p) =>
    (kategoriAktif === 'semua' || p.kategori === kategoriAktif) &&
    p.nama.toLowerCase().includes(kata)
  ));
  $('grid').innerHTML = hasil.map(kartuProduk).join('');
  $('tidak-ada').hidden = hasil.length > 0;
}

$('filter').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  kategoriAktif = b.dataset.kategori;
  document.querySelectorAll('#filter button').forEach((x) => x.classList.toggle('aktif', x === b));
  tampilkanProduk();
});
$('cari').addEventListener('input', tampilkanProduk);
$('urutan').addEventListener('change', (e) => { urutan = e.target.value; tampilkanProduk(); });
$('grid').addEventListener('click', (e) => {
  const b = e.target.closest('.tambah');
  if (b) tambahKeKeranjang(b.dataset.nama);
});

let keranjang = {};
try { keranjang = JSON.parse(localStorage.getItem('keranjang')) || {}; } catch (e) { keranjang = {}; }

Object.keys(keranjang).forEach((nama) => {
  const p = PRODUK.find((x) => x.nama === nama);
  if (!p || p.stok === 0) { delete keranjang[nama]; return; }
  const jumlah = Math.floor(Number(keranjang[nama].jumlah)) || 1;
  keranjang[nama] = { harga: p.harga, jumlah: Math.min(Math.max(jumlah, 1), p.stok) };
});

function simpan() {
  try { localStorage.setItem('keranjang', JSON.stringify(keranjang)); } catch (e) {}
}

function tambahKeKeranjang(nama) {
  const p = PRODUK.find((x) => x.nama === nama);
  if (!p) return;
  const ada = keranjang[nama] ? keranjang[nama].jumlah : 0;
  if (ada >= p.stok) { toast('Stok ' + p.nama + ' hanya ' + p.stok); return; }
  keranjang[nama] = { harga: p.harga, jumlah: ada + 1 };
  gambarKeranjang();
  toast(p.nama + ' masuk keranjang ✓');
}

function gambarKeranjang() {
  const semuaNama = Object.keys(keranjang);
  let total = 0;
  let banyak = 0;

  $('isi-keranjang').innerHTML = semuaNama.map((nama) => {
    const item = keranjang[nama];
    const subtotal = item.harga * item.jumlah;
    total += subtotal;
    banyak += item.jumlah;
    return `
      <li>
        <span>${esc(nama)}<br><small>${rupiah(item.harga)}</small></span>
        <span class="qty">
          <button data-aksi="kurang" data-nama="${esc(nama)}" aria-label="Kurangi">−</button>
          ${item.jumlah}
          <button data-aksi="tambah" data-nama="${esc(nama)}" aria-label="Tambah">+</button>
        </span>
        <strong>${rupiah(subtotal)}</strong>
      </li>`;
  }).join('');

  $('kosong').hidden = semuaNama.length > 0;
  $('total').textContent = rupiah(total);
  $('jumlah').textContent = banyak;
  simpan();
}

$('isi-keranjang').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  const nama = b.dataset.nama;
  if (b.dataset.aksi === 'tambah') {
    tambahKeKeranjang(nama);
  } else {
    keranjang[nama].jumlah--;
    if (keranjang[nama].jumlah <= 0) delete keranjang[nama];
    gambarKeranjang();
  }
});

$('kosongkan').addEventListener('click', () => {
  keranjang = {};
  gambarKeranjang();
});

$('kirim').addEventListener('click', () => {
  const nama = $('nama').value.trim();
  const galat = $('pesan-error');
  const semuaNama = Object.keys(keranjang);

  if (semuaNama.length === 0) { galat.textContent = 'Keranjang masih kosong.'; return; }
  if (nama === '') { galat.textContent = 'Isi nama dulu ya.'; $('nama').focus(); return; }
  galat.textContent = '';

  let total = 0;
  const baris = semuaNama.map((n) => {
    const item = keranjang[n];
    const subtotal = item.harga * item.jumlah;
    total += subtotal;
    return '- ' + n + ' x' + item.jumlah + ' = ' + rupiah(subtotal);
  });

  const catatan = $('catatan').value.trim();
  const pesan =
    'Halo Toko Ibu Eko, saya mau pesan (ambil di toko):\n' +
    baris.join('\n') + '\n' +
    'Total: ' + rupiah(total) + '\n' +
    'Nama: ' + nama + '\n' +
    'Jam ambil: ' + $('jam').value + '\n' +
    'Pembayaran: ' + $('bayar').value +
    (catatan ? '\nCatatan: ' + catatan : '');

  window.open('https://wa.me/' + NOMOR_TOKO + '?text=' + encodeURIComponent(pesan), '_blank');
});

function cekStatus() {
  const jam = new Date().getHours();
  const buka = jam >= JAM_BUKA && jam < JAM_TUTUP;
  const el = $('status-toko');
  el.textContent = buka
    ? 'Buka sekarang, tutup pukul ' + pad(JAM_TUTUP) + '.00'
    : 'Tutup, buka pukul ' + pad(JAM_BUKA) + '.00';
  el.className = 'status ' + (buka ? 'buka' : 'tutup');
}
cekStatus();
$('jam-buka').textContent = pad(JAM_BUKA) + '.00–' + pad(JAM_TUTUP) + '.00';
$('wa-link').href = 'https://wa.me/' + NOMOR_TOKO;
$('tahun').textContent = new Date().getFullYear();

tampilkanProduk();
gambarKeranjang();

function selarasBootstrap() {
  document.documentElement.dataset.bsTheme = document.documentElement.dataset.tema || 'light';
}
selarasBootstrap();
$('tema').addEventListener('click', selarasBootstrap);

const formMember = $('form-member');
formMember.addEventListener('submit', (e) => {
  e.preventDefault();                       

  if (!formMember.checkValidity()) {        
    formMember.classList.add('was-validated');
    return;
  }

  const hobi = [...formMember.querySelectorAll('input[name="hobi"]:checked')]
    .map((x) => x.value);

  const hasil = $('hasil-member');
  hasil.innerHTML =
    '<h3>Terima kasih, ' + esc($('m-nama').value.trim()) + '!</h3>' +
    '<p><strong>Alamat:</strong> ' + esc($('m-alamat').value.trim()).replace(/\n/g, '<br>') + '</p>' +
    '<p><strong>Kota:</strong> ' + esc($('m-kota').value) + '</p>' +
    '<p><strong>Hobi:</strong> ' + (hobi.length ? esc(hobi.join(', ')) : '-') + '</p>';
  hasil.hidden = false;

  formMember.reset();
  formMember.classList.remove('was-validated');
  toast('Biodata terkirim ✓');
});