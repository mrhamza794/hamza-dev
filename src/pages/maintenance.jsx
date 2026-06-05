import { Wrench } from "lucide-react";
import { getSiteSettings } from "@/lib/siteSettings";

export async function getServerSideProps() {
  const settings = await getSiteSettings();

  if (!settings.siteMaintenance) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      message: settings.maintenanceMessage,
    },
  };
}

export default function MaintenancePage({ message }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-10 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/30">
          <Wrench size={32} className="text-white" />
        </div>
        <h1 className="mb-3 font-space text-3xl font-bold text-white">Under Maintenance</h1>
        <p className="font-inter text-lg leading-relaxed text-slate-300">{message}</p>
      </div>
    </div>
  );
}
