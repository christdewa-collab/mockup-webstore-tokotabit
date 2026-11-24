export type Product = {
  id: string; name: string; price: number; original: number; rating: number; sold: number;
  category: string; emoji: string; tone: "primary" | "sunny" | "coral" | "mint" | "sky" | "grape";
  city: string; flash?: boolean; stock: number; desc: string; variants: string[];
};

export const STORE = { name: "Teknik Jaya", city: "Surabaya" };

export const CATEGORIES = [
  { id: "perkakas", label: "Perkakas", emoji: "🔧", tone: "primary" },
  { id: "listrik", label: "Alat Listrik", emoji: "⚡", tone: "sunny" },
  { id: "las", label: "Mesin Las", emoji: "🔥", tone: "coral" },
  { id: "rumah", label: "Rumah Tangga", emoji: "🏠", tone: "mint" },
  { id: "elektronik", label: "Elektronik", emoji: "🎧", tone: "sky" },
  { id: "taman", label: "Taman", emoji: "🌱", tone: "mint" },
  { id: "cat", label: "Cat & Kuas", emoji: "🎨", tone: "grape" },
  { id: "keamanan", label: "Safety", emoji: "🦺", tone: "sunny" },
] as const;

export const PRODUCTS: Product[] = [
  { id: "bor-500w", name: "Bor Listrik Impact 500W + 13 Mata Bor", price: 485000, original: 650000, rating: 4.9, sold: 1240, category: "listrik", emoji: "🛠️", tone: "primary", city: "Surabaya", flash: true, stock: 12, desc: "Bor impact 500W untuk kayu, besi, dan tembok. Kecepatan bisa diatur, dilengkapi 13 mata bor dan koper.", variants: ["500W", "710W"] },
  { id: "gerinda-4", name: "Mesin Gerinda Tangan 4 inch 710W", price: 365000, original: 520000, rating: 4.8, sold: 860, category: "listrik", emoji: "⚙️", tone: "coral", city: "Surabaya", flash: true, stock: 20, desc: "Gerinda tangan bertenaga 710W, cocok untuk potong dan haluskan besi maupun keramik.", variants: ["Standar", "+5 Mata Potong"] },
  { id: "las-200a", name: "Mesin Las Inverter 200A Mini", price: 1850000, original: 2400000, rating: 4.7, sold: 312, category: "las", emoji: "🔥", tone: "sunny", city: "Surabaya", flash: true, stock: 4, desc: "Mesin las inverter 200A hemat listrik, ringan dibawa, cocok untuk bengkel rumahan.", variants: ["Standar", "Paket Lengkap"] },
  { id: "toolbox", name: "Toolbox Set 108 pcs Kunci Lengkap", price: 299000, original: 459000, rating: 4.9, sold: 2100, category: "perkakas", emoji: "🧰", tone: "mint", city: "Malang", flash: true, stock: 30, desc: "Set kunci sok, obeng, tang, dan meteran dalam satu koper kokoh.", variants: ["108 pcs", "150 pcs"] },
  { id: "obeng-set", name: "Obeng Presisi 25 in 1 Magnetik", price: 49000, original: 85000, rating: 4.8, sold: 5300, category: "perkakas", emoji: "🪛", tone: "sky", city: "Jakarta Selatan", stock: 120, desc: "Obeng presisi magnetik untuk HP, laptop, dan elektronik kecil.", variants: ["Hitam", "Oranye"] },
  { id: "blender", name: "Blender Kaca 2L 3 Kecepatan", price: 219000, original: 349000, rating: 4.6, sold: 980, category: "rumah", emoji: "🥤", tone: "coral", city: "Bandung", stock: 25, desc: "Blender gelas kaca 2 liter dengan pisau stainless 6 mata.", variants: ["Merah", "Hitam"] },
  { id: "kipas", name: "Kipas Meja Mini USB Recharge", price: 79000, original: 129000, rating: 4.7, sold: 3400, category: "elektronik", emoji: "🌀", tone: "sky", city: "Surabaya", stock: 60, desc: "Kipas portabel isi ulang, tahan 6 jam, 3 level angin.", variants: ["Biru", "Kuning", "Pink"] },
  { id: "headset", name: "Headphone Bluetooth Bass Mantap", price: 159000, original: 299000, rating: 4.5, sold: 1500, category: "elektronik", emoji: "🎧", tone: "grape", city: "Jakarta Selatan", stock: 40, desc: "Headphone nirkabel dengan bass tebal dan baterai 30 jam.", variants: ["Hitam", "Putih"] },
  { id: "lampu", name: "Lampu Belajar LED Lipat", price: 65000, original: 99000, rating: 4.8, sold: 2700, category: "rumah", emoji: "💡", tone: "sunny", city: "Malang", stock: 80, desc: "Lampu LED hemat energi dengan 3 mode warna cahaya.", variants: ["Putih", "Oranye"] },
  { id: "cat-tembok", name: "Cat Tembok Interior 5kg Warna Ceria", price: 135000, original: 175000, rating: 4.7, sold: 640, category: "cat", emoji: "🎨", tone: "grape", city: "Bandung", stock: 50, desc: "Cat tembok anti jamur, cepat kering, tersedia banyak warna.", variants: ["Kuning", "Peach", "Mint"] },
  { id: "selang", name: "Selang Taman 15m + Semprotan 7 Mode", price: 89000, original: 140000, rating: 4.6, sold: 870, category: "taman", emoji: "🌱", tone: "mint", city: "Surabaya", stock: 35, desc: "Selang elastis anti tekuk lengkap dengan nozzle 7 pola semprot.", variants: ["15m", "30m"] },
  { id: "helm", name: "Helm Safety Proyek SNI", price: 45000, original: 70000, rating: 4.9, sold: 4100, category: "keamanan", emoji: "⛑️", tone: "sunny", city: "Surabaya", stock: 200, desc: "Helm proyek berstandar SNI, ringan dan bertali dagu.", variants: ["Kuning", "Putih", "Merah"] },
];

export const rp = (n: number) => "Rp" + Math.round(n).toLocaleString("id-ID");
export const discount = (p: Product) => Math.round((1 - p.price / p.original) * 100);
export const soldLabel = (n: number) => (n >= 1000 ? `${(n / 1000).toLocaleString("id-ID", { maximumFractionDigits: 1 })}rb` : String(n)) + " terjual";
export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id);
