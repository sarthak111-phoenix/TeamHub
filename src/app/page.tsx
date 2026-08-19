import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ShieldCheck, CheckSquare, FolderKanban, ArrowRight, Building2, Flame, Users2, Layers } from "lucide-react";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-[100dvh] bg-[#070605] text-gray-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Fiery Glow & Ember Overlay */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-amber-600/15 via-orange-600/10 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header / Navbar */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between z-20">
        <Link href="/">
          <Logo size="md" tagline="CORPORATE GROUP" />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-mono tracking-wider uppercase text-gray-300">
          <Link href="#about" className="hover:text-amber-400 transition-colors">About</Link>
          <Link href="#businesses" className="hover:text-amber-400 transition-colors">Businesses</Link>
          <Link href="#projects" className="hover:text-amber-400 transition-colors">Projects</Link>
          <Link href="#careers" className="hover:text-amber-400 transition-colors">Careers</Link>
          <Link href="#contact" className="hover:text-amber-400 transition-colors">Contact</Link>
        </nav>

        {/* Portal Sign In CTA */}
        <div className="flex items-center gap-4 z-20">
          <Link href="/sign-in">
            <Button variant="secondary" size="sm" className="font-mono text-xs border-amber-500/40 text-amber-300 hover:border-amber-400 hover:text-white">
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              PORTAL SIGN IN
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="max-w-5xl w-full mx-auto px-6 py-12 md:py-20 text-center z-10 flex flex-col items-center gap-8 my-auto">
        {/* Brand Tag Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-950/30 text-amber-300 text-xs font-mono uppercase tracking-widest backdrop-blur-md">
          <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>PS PHOENIX CORPORATE GROUP</span>
        </div>

        {/* Main Headline from Image 1 */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
          Rise. Build.{" "}
          <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
            Endure.
          </span>
        </h1>

        {/* Corporate Description */}
        <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-3xl leading-relaxed font-light">
          We hold and operate ventures across infrastructure, technology, energy and trade — connected by one internal platform where every project, task and update is accountable to a name.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
          <Link href="/sign-in">
            <Button size="lg" className="px-8 py-3.5 text-base font-semibold uppercase tracking-wider">
              ENTER WORKSPACE <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button variant="secondary" size="lg" className="px-8 py-3.5 text-base font-medium">
              Create Team Account
            </Button>
          </Link>
        </div>

        {/* Stats Section matching Image 1 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 w-full mt-12 pt-10 border-t border-amber-500/20">
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-5xl font-extrabold text-amber-400 font-mono tracking-tight">17</span>
            <span className="text-[11px] sm:text-xs text-gray-400 uppercase font-mono tracking-widest mt-1">Years Operating</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-5xl font-extrabold text-amber-400 font-mono tracking-tight">4</span>
            <span className="text-[11px] sm:text-xs text-gray-400 uppercase font-mono tracking-widest mt-1">Business Verticals</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-5xl font-extrabold text-amber-400 font-mono tracking-tight">120+</span>
            <span className="text-[11px] sm:text-xs text-gray-400 uppercase font-mono tracking-widest mt-1">Projects Delivered</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-5xl font-extrabold text-amber-400 font-mono tracking-tight">600+</span>
            <span className="text-[11px] sm:text-xs text-gray-400 uppercase font-mono tracking-widest mt-1">Team Members</span>
          </div>
        </div>

        {/* Internal Platform Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full mt-10 text-left">
          <div className="metallic-card rounded-xl p-6 border border-amber-500/20 bg-dark-card/90">
            <CheckSquare className="w-7 h-7 text-amber-400 mb-3" />
            <h3 className="text-base font-bold text-white">Task Ownership</h3>
            <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
              Assign tasks with explicit priority, due dates, and real-time status updates across departments.
            </p>
          </div>
          <div className="metallic-card rounded-xl p-6 border border-amber-500/20 bg-dark-card/90">
            <FolderKanban className="w-7 h-7 text-orange-400 mb-3" />
            <h3 className="text-base font-bold text-white">Project Lifecycles</h3>
            <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
              Organize multi-sector work into Planning, Active, and Completed project pipelines.
            </p>
          </div>
          <div className="metallic-card rounded-xl p-6 border border-amber-500/20 bg-dark-card/90">
            <ShieldCheck className="w-7 h-7 text-amber-400 mb-3" />
            <h3 className="text-base font-bold text-white">Role-Based Control</h3>
            <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
              Strict Admin and Member authorization rules enforced server-side for internal security.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto px-6 py-8 text-center text-xs text-gray-500 font-mono border-t border-amber-500/10 z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span>TeamHub — PS Phoenix Corporate Workspace Platform</span>
        <span>© {new Date().getFullYear()} PS Phoenix Group. All Rights Reserved.</span>
      </footer>
    </div>
  );
}
