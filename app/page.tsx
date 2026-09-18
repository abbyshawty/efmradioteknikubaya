import { readConfig } from "@/lib/config";
import { ModalProvider } from "@/components/Modal";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Ticker from "@/components/Ticker";
import VisiMisi from "@/components/VisiMisi";
import Live from "@/components/Live";
import RequestLagu from "@/components/RequestLagu";
import About from "@/components/About";
import ProgramKerja from "@/components/ProgramKerja";
import Divisi from "@/components/Divisi";
import Kontak from "@/components/Kontak";
import Footer from "@/components/Footer";

// baca konfigurasi terbaru setiap request, supaya perubahan dari /admin
// langsung tampil tanpa perlu build ulang
export const dynamic = "force-dynamic";

export default async function Home() {
  const config = await readConfig();

  return (
    <ModalProvider>
      <Header />
      <Hero />
      <Ticker />
      <VisiMisi />
      <Live
        config={{
          youtubeVideoId: config.youtubeVideoId,
          liveChatDomain: config.liveChatDomain,
          channelUrl: config.channelUrl,
        }}
      />
      <RequestLagu sheetWebhookUrl={config.sheetWebhookUrl} />
      <About />
      <ProgramKerja programKerja={config.programKerja} />
      <Divisi members={config.members} />
      <Kontak
        config={{
          instagram: config.instagram,
          youtube: config.youtube,
          spotify: config.spotify,
          tiktok: config.tiktok,
          email: config.email,
        }}
      />
      <Footer />
    </ModalProvider>
  );
}
