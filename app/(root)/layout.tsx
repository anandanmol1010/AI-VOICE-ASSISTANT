import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated } from "@/lib/actions/auth.action";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  const user = await getCurrentUser();
  const userName = user?.name || "User";

  return (
    <div className="root-layout pt-2">
      <nav className="flex items-center justify-between w-full mb-0">
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-90 transition-opacity"
        >
          <div className="bg-dark-200 border border-[#dddfff]/20 rounded-lg w-[60px] h-[60px] flex items-center justify-center shadow-md">
            <div className="w-[50px] h-[50px] relative">
              <Image
                src="/logo.png"
                alt="IntervuBuddy Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#dddfff]">IntervuBuddy</h2>
            <p className="text-sm text-[#dddfff]/70 -mt-1">by Anmol</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <p className="text-3xl font-semibold text-light-100">Hey</p>
          <span className="inline-block animate-wave origin-bottom-right text-4xl">
            👋
          </span>
          <p className="text-3xl font-semibold text-light-100">{userName}</p>
        </div>
      </nav>

      <main className="w-full animate-fadeIn pt-0">{children}</main>
    </div>
  );
};

export default Layout;
