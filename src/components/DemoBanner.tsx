import { copy } from "@/copy";

// On every screen, above everything else
export const DemoBanner = () => (
  <div className="bg-wash px-4 py-2 text-center text-sm font-medium text-navy">
    <p>{copy.shell.banner}</p>
  </div>
);
