import Link from "next/link";
import { ArrowLeft, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-white dark:from-zinc-950 dark:via-zinc-900 dark:to-background p-4 font-sans">
      <div className="max-w-md w-full bg-card/60 backdrop-blur-md border border-border p-8 rounded-3xl shadow-xl text-center space-y-6">
        <div className="h-16 w-16 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center mx-auto text-3xl font-extrabold animate-bounce">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-foreground">Page Not Found</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The page you are looking for doesn't exist or has been moved. Scan your restaurant's QR code again or head back home.
          </p>
        </div>
        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 bg-background border border-border hover:bg-muted text-foreground font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            Get Support
          </Link>
        </div>
      </div>
    </div>
  );
}
