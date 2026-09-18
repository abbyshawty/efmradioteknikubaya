import SigIcon from "./SigIcon";

export default function About() {
  return (
    <section className="band" id="tentang">
      <div className="wrap">
        <div className="head" style={{ marginBottom: 34 }}>
          <SigIcon />
          <h2>About E-FM</h2>
        </div>
        <div className="about">
          <div className="body">
            <p>Radio Kampus E-FM awalnya dibentuk oleh jurusan Teknik Elektro pada tahun 1990-an. Awalnya Radio Kampus adalah eksperimen dari beberapa mahasiswa Teknik Elektro dan hanya dipegang oleh jurusan Teknik Elektro.</p>
            <p>Radio Kampus E-FM juga sempat hiatus dan kemudian kembali beroperasi pada tahun 2006 dan dikelola sebagai ORMAWA. Lokasi ruangan Radio Kampus berada di TC 04.04.</p>
          </div>
          <dl className="facts">
            <div className="row"><dt>Sejak</dt><dd>1990-an<span>tahun mengudara</span></dd></div>
            <div className="row"><dt>Jangkauan</dt><dd>107.9 FM<span>+ streaming daring</span></dd></div>
            <div className="row"><dt>Anggota</dt><dd>16 orang</dd></div>
          </dl>
        </div>
      </div>
    </section>
  );
}
