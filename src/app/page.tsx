import { redirect } from "next/navigation";

// next.config.ts redirects "/" to "/join" before this runs; this is the fallback
export default function Home() {
  redirect("/join");
}
