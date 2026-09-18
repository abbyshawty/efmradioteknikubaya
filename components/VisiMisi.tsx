import SigIcon from "./SigIcon";

export default function VisiMisi() {
  return (
    <section className="band" id="visi-misi" style={{ paddingBottom: 0 }}>
      <div className="wrap">
        <div className="head">
          <SigIcon />
          <h2>VISI dan MISI E-FM</h2>
        </div>
        <div className="vm-grid">
          {/* ✏️ EDIT: visi */}
          <div className="list-panel">
            <h3><i className="ph-bold ph-target" style={{ color: "var(--violet)" }} />VISI</h3>
            <ol>
              <li><b>1</b>Membangun kolaborasi dan jaringan.</li>
              <li><b>2</b>Menciptakan lingkungan kerja yang kolaboratif dan suportif.</li>
              <li><b>3</b>Memfasilitasi anggota untuk membangun jaringan dengan media eksternal.</li>
            </ol>
          </div>
          {/* ✏️ EDIT: misi */}
          <div className="list-panel">
            <h3><i className="ph-bold ph-flag-pennant" style={{ color: "var(--violet)" }} />MISI</h3>
            <ol>
              <li><b>1</b>Mendorong kolaborasi internal dan memperluas jaringan anggota dengan praktisi media eksternal.</li>
              <li><b>2</b>Menjadi fasilitator dalam menginformasikan segala kegiatan ORMAWA maupun NON-ORMAWA di lingkungan Fakultas Teknik Universitas Surabaya.</li>
              <li><b>3</b>Memberikan informasi yang fresh dan mendidik bagi seluruh masyarakat Universitas Surabaya.</li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
