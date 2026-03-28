export default function Footer() {
  return (
    <footer className="w-full py-8 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center gap-2">
        <p className="text-sm text-[#8E8E93]">
          Built with <span className="text-[#FF453A]">❤️</span> by LinkSumm AI
        </p>
        <p className="text-xs text-[#636366]">
          Supports Instagram Reels & Facebook Reels
        </p>
        <div className="flex gap-4 mt-2">
          <a href="#" className="text-xs text-[#8E8E93] hover:text-white transition-colors">GitHub</a>
          <a href="#" className="text-xs text-[#8E8E93] hover:text-white transition-colors">Twitter</a>
        </div>
      </div>
    </footer>
  );
}
