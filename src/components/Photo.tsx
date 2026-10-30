import Image from "next/image";
import { cx } from "./cx";
import aboutYou from "../../public/photos/about-you.webp";
import book from "../../public/photos/book.webp";
import whatsGoingOn from "../../public/photos/whats-going-on.webp";
import yourProvider from "../../public/photos/your-provider.webp";

// Lily's photos (Pexels, credited in the README): one per phase on the
// desktop panel, the provider one after insurance, the coffee one when booked.
// A soft white curve sits over the bottom edge, like the boards
export const PHOTOS = { aboutYou, whatsGoingOn, yourProvider, book } as const;

export function Photo({
  photo,
  alt,
  className,
  priority = false,
}: {
  photo: keyof typeof PHOTOS;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={cx("relative flex-none overflow-hidden", className)}>
      <Image src={PHOTOS[photo]} alt={alt} fill sizes="(min-width: 1024px) 600px, 100vw" priority={priority} placeholder="blur" className="object-cover" />
      <svg viewBox="0 0 320 28" preserveAspectRatio="none" aria-hidden="true" className="absolute -bottom-px left-0 h-6 w-full">
        <path d="M0 28 C70 4 250 4 320 24 V28 Z" fill="#FFFFFF" />
      </svg>
    </div>
  );
}
