export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-3xl">
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center w-24 h-24">
          <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-purple-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-b-2 border-l-2 border-cyan-500 animate-spin-reverse" />
          <span className="text-2xl font-bold font-space text-gradient animate-pulse">HC</span>
        </div>
        <div className="text-slate-400 font-space tracking-widest uppercase text-sm animate-pulse">
          Initializing Experience...
        </div>
      </div>
    </div>
  );
}
