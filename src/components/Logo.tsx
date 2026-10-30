import Image from "next/image";
import { copy } from "@/copy";
import logo from "../../public/legion-health-logo.png";

// Legion Health's logo, at the size the boards leave for it: 28px tall on
// phones, 32px on desktop
export const Logo = () => <Image src={logo} alt={copy.shell.name} priority className="h-7 w-auto md:h-8" />;
