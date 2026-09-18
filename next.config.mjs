/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Semua gambar situs (logo, ikon sosial, foto anggota) sudah kecil &
    // teroptimasi. Mematikan optimizer memastikan gambar selalu tampil
    // di semua jenis hosting, termasuk Netlify / static export.
    unoptimized: true,
  },
};
export default nextConfig;
