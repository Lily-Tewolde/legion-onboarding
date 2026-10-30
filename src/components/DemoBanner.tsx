import { copy } from "@/copy";

// On every screen, above everything else, and never covered
export const DemoBanner = () => (
  <div className="relative z-20 bg-navy px-4 py-0.5 text-center text-label text-white md:py-1">
    <p>{copy.shell.banner}</p>
  </div>
);
