import SigIcon from "./SigIcon";

type Member = { key: string; name: string; nick: string; role: string };
type Division = { name: string; code: string; desc: string; members: Member[] };

// ✏️ EDIT: nama, nickname, dan peran anggota. Foto diatur lewat /admin
// (disimpan per key, mis. "abby") -- bukan di sini.
const DIVISIONS: Division[] = [
  {
    name: "Badan Pengurus Harian",
    code: "BPH",
    desc: "Badan Pengurus Harian atau bisa juga disebut dengan BPH adalah divisi yang mengurus semua hal terkait internal maupun eksternal dari Radio Kampus.",
    members: [
      { key: "abby", name: "Assidiqie Habibillah", nick: "Abby", role: "Ketua E-FM" },
      { key: "jose", name: "Ignatius Jose Kurniawan", nick: "Jose", role: "Wakil Ketua E-FM" },
      { key: "velyn", name: "Fellina Ivanka", nick: "Velyn", role: "Sekretaris dan Bendahara E-FM" },
    ],
  },
  {
    name: "Producer and Announcer",
    code: "PA",
    desc: "Producer and Announcer atau bisa juga disebut dengan PA adalah divisi yang bertugas untuk menyiapkan materi siaran dan juga bertugas sebagai penyiar atau broadcasting.",
    members: [
      { key: "retha", name: "Margareta Yuna Agustina", nick: "Retha", role: "Koordinator" },
      { key: "laura", name: "Laura Gabriela Goyosa", nick: "Laura", role: "Anggota" },
      { key: "angel", name: "Angel Elysia Sari", nick: "Angel", role: "Anggota" },
      { key: "georgius", name: "Georgius Talenta Surya", nick: "Geo", role: "Anggota" },
    ],
  },
  {
    name: "Music Director",
    code: "MD",
    desc: "Music Director atau bisa juga disebut dengan MD adalah divisi yang mengurus seluruh hal yang berhubungan dengan music serta editing video.",
    members: [
      { key: "henokh", name: "Henokh Imanuel Purnama", nick: "Henokh", role: "Koordinator" },
      { key: "rafael", name: "Rafael Veroland Lukito", nick: "Rafael", role: "Anggota" },
      { key: "cristian", name: "Cristian Ronaldo Wijaya", nick: "Cristian", role: "Anggota" },
      { key: "hendrik", name: "Hendrik Chrystoper Lo", nick: "Hendrik", role: "Anggota" },
      { key: "ago", name: "Lago Kristiani Tarigas", nick: "Ago", role: "Anggota" },
    ],
  },
  {
    name: "Design Social Media",
    code: "DSM",
    desc: "Design Social Media atau bisa juga disebut sebagai DSM adalah divisi yang mengurus social media dan mengatur segala kebutuhan design Radio Kampus.",
    members: [
      { key: "echa", name: "Neysa Nathania Pane", nick: "Echa", role: "Koordinator" },
      { key: "nia", name: "Nathania Naya Irwangsa", nick: "Nia", role: "Anggota" },
      { key: "nana", name: "Alexandria Sophie", nick: "Nana", role: "Anggota" },
      { key: "keisya", name: "Keisya Olivia Suyanto", nick: "Keisya", role: "Anggota" },
    ],
  },
];

export default function Divisi({ members }: { members: Record<string, string> }) {
  return (
    <section className="band" id="tim">
      <div className="wrap">
        <div className="head">
          <SigIcon />
          <h2>Divisi E-FM</h2>
        </div>
        <div className="div-list">
          {DIVISIONS.map((div) => (
            <div className="div-panel" key={div.code}>
              <div className="div-head">
                <h3>{div.name}</h3>
                <span className="div-code">{div.code}</span>
              </div>
              <p>{div.desc}</p>
              <div className="member-grid">
                {div.members.map((m) => {
                  const photo = members[m.key];
                  return (
                    <div className="member" key={m.key}>
                      {photo ? (
                        <div className="photo filled">
                          <img src={photo} alt={m.name} />
                        </div>
                      ) : (
                        <div className="photo">
                          <i className="ph-bold ph-camera" />
                          <span>Foto menyusul</span>
                        </div>
                      )}
                      <b>{m.name}</b>
                      <span className="nick">({m.nick})</span>
                      <span className="role">{m.role}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
