import Link from "next/link";
import { QrCode } from "lucide-react";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — Branding Panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 gradient-primary">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="Dineo Logo"
            width={56}
            height={56}
            className="h-12 w-12 object-contain"
          />
        </Link>

        <div className="space-y-6">
          <h2 className="text-4xl font-extrabold text-white leading-tight">
            Replace Printed Menus with Smart QR Menus
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Create, manage, and update your restaurant menu instantly without
            reprinting menu cards.
          </p>
          <div className="flex flex-col gap-3">
            {[
              "✓ No reprinting ever again",
              "✓ Real-time menu updates",
              "✓ Beautiful digital menus",
              "✓ Analytics & insights",
            ].map((item) => (
              <p key={item} className="text-white/90 text-sm font-medium">
                {item}
              </p>
            ))}
          </div>
        </div>

        <p className="text-white/60 text-sm">
          © {new Date().getFullYear()} Dineo. All rights reserved.
        </p>
      </div>

      {/* Right — Auth Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-8">
            <Image
              src="/logo.svg"
              alt="Dineo Logo"
              width={240}
              height={80}
              className="h-20 w-auto dark:hidden object-contain"
            />
            <Image
              src="/logo.svg"
              alt="Dineo Logo"
              width={240}
              height={80}
              className="h-20 w-auto hidden dark:block invert hue-rotate-180 brightness-110 object-contain"
            />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
