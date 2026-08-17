import Link from "next/link";
import { Globe, Mail, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function AppFooter() {
  return (
    <footer className="mt-auto shrink-0 border-t border-border bg-white">
      <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-10 lg:grid-cols-4 lg:px-6">
        <div className="space-y-3">
          <p className="text-lg font-bold text-primary">ThreadSphere</p>
          <p className="max-w-xs text-sm text-muted">
            Connect, share, and follow thoughtful communities. Built for
            professionals who care about quality discussion.
          </p>
          <div className="flex gap-3 text-muted">
            <Link href="#" aria-label="Share" className="hover:text-primary">
              <Share2 className="h-4 w-4" />
            </Link>
            <Link href="#" aria-label="Website" className="hover:text-primary">
              <Globe className="h-4 w-4" />
            </Link>
            <Link href="#" aria-label="Email" className="hover:text-primary">
              <Mail className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Product</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="#" className="hover:text-foreground">Features</Link></li>
            <li><Link href="#" className="hover:text-foreground">Pricing</Link></li>
            <li><Link href="#" className="hover:text-foreground">Roadmap</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Company</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="#" className="hover:text-foreground">About</Link></li>
            <li><Link href="#" className="hover:text-foreground">Careers</Link></li>
            <li><Link href="#" className="hover:text-foreground">Press</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Newsletter</h3>
          <p className="mb-3 text-sm text-muted">
            Weekly digest of trending threads and community highlights.
          </p>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="Email address"
              className="h-10 flex-1 rounded-full border border-border px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
            <Button type="submit" size="md">
              Subscribe
            </Button>
          </form>
        </div>
      </div>

      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted lg:px-6">
        © 2024 ThreadSphere — Building better communities. All rights reserved.
      </div>
    </footer>
  );
}
