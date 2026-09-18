export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer>
      <div className="wrap foot">
        <div className="lock">
          <img className="efm" src="/assets/logo-efm.png" alt="107.9 E-FM" />
          <span className="sep" />
          <img className="uby" src="/assets/logo-ubaya.png" alt="UBAYA" />
        </div>
        {/* ✏️ EDIT: baris identitas stasiun */}
        <div className="id">
          107.9 E-FM · Universitas Surabaya, Surabaya
          <br />
          © {year} · seluruh hak dilindungi · <a href="/admin">Admin</a>
        </div>
      </div>
    </footer>
  );
}
