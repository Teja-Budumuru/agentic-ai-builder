import Link from "next/link";
import {
  Gamepad2,
  Sparkles,
  Brain,
  Wrench,
  Download,
  Zap,
  Code2,
  MessageSquare,
  ChevronRight,
  Star,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
              <Gamepad2 className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-base">AI Game Builder</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Get Started
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary font-medium mb-6">
            <Sparkles className="w-3 h-3" />
            Powered by AI Agents · OpenRouter
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            Describe a game idea.
            <br />
            <span className="text-primary">Watch it come alive.</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Three specialized AI agents — Clarifier, Planner, and Coder — collaborate
            to transform your game idea into fully playable HTML, CSS &amp; JavaScript
            in minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors text-sm"
            >
              <Gamepad2 className="w-4 h-4" />
              Start Building for Free
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 px-6 py-3 bg-secondary border border-border text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors text-sm"
            >
              Continue as Guest
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            No credit card required · Google sign-in or instant guest access
          </p>
        </div>
      </section>

      {/* How It Works — Agent Pipeline */}
      <section className="py-20 px-4 border-t border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">How it works</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              A three-agent pipeline handles everything from requirements gathering to code generation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
            {/* Connector lines for desktop */}
            <div className="hidden sm:block absolute top-8 left-[calc(33%+1rem)] right-[calc(33%+1rem)] h-px bg-border" />

            {[
              {
                icon: Brain,
                step: "01",
                name: "Clarifier Agent",
                color: "text-blue-400",
                bg: "bg-blue-500/10 border-blue-500/20",
                description:
                  "Asks targeted questions to fully understand your game concept, mechanics, and desired experience.",
              },
              {
                icon: Sparkles,
                step: "02",
                name: "Planner Agent",
                color: "text-amber-400",
                bg: "bg-amber-500/10 border-amber-500/20",
                description:
                  "Designs the game architecture — framework choice, mechanics, game loop, controls, and systems.",
              },
              {
                icon: Wrench,
                step: "03",
                name: "Coder Agent",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10 border-emerald-500/20",
                description:
                  "Generates production-ready HTML, CSS, and JavaScript for a fully playable browser game.",
              },
            ].map(({ icon: Icon, step, name, color, bg, description }) => (
              <div key={step} className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center border mb-4 ${bg}`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <span className="text-xs text-muted-foreground font-mono mb-1">{step}</span>
                <h3 className="font-semibold text-sm mb-2">{name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Everything you need</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              From idea to playable game — no setup, no tooling, no configuration.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: MessageSquare,
                title: "Conversational Interface",
                description: "Chat naturally with the agent. Answer a few questions and get a complete, playable game.",
              },
              {
                icon: Code2,
                title: "Syntax-Highlighted Code",
                description: "View generated HTML, CSS, and JS side-by-side with full syntax highlighting.",
              },
              {
                icon: Download,
                title: "Download as ZIP",
                description: "One click to download your entire game project as a ZIP. Open locally to play instantly.",
              },
              {
                icon: Zap,
                title: "Dual Game Engines",
                description: "Agents choose between vanilla Canvas 2D or Phaser 3 based on your game requirements.",
              },
              {
                icon: Star,
                title: "Session History",
                description: "All your past games are saved. Revisit, review code, or download any previous build.",
              },
              {
                icon: Sparkles,
                title: "LLM Response Caching",
                description: "Identical requests are served from cache, making repeated builds lightning-fast.",
              },
            ].map(({ icon: Icon, title, description }) => (
              <div key={title} className="p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors group">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center mb-3 border border-primary/20 group-hover:bg-primary/15 transition-colors">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Output Section */}
      <section className="py-20 px-4 border-t border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">What gets generated</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Real output from a &quot;Snake &amp; Ladders&quot; game prompt — three files, ready to play.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[
              {
                file: "index.html",
                lang: "HTML",
                color: "text-orange-400",
                bg: "bg-orange-500/10 border-orange-500/20",
                snippet: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Snake & Ladders</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <canvas id="gameCanvas"></canvas>\n  <script src="game.js"></script>\n</body>\n</html>`,
              },
              {
                file: "style.css",
                lang: "CSS",
                color: "text-blue-400",
                bg: "bg-blue-500/10 border-blue-500/20",
                snippet: `* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\nbody {\n  background: #0a0a0f;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 100vh;\n}\n#gameCanvas {\n  border: 2px solid #333;\n}`,
              },
              {
                file: "game.js",
                lang: "JS",
                color: "text-yellow-400",
                bg: "bg-yellow-500/10 border-yellow-500/20",
                snippet: `const canvas = document.getElementById(\n  'gameCanvas'\n);\nconst ctx = canvas.getContext('2d');\n\nconst BOARD_SIZE = 10;\nconst CELL_SIZE = 60;\n\n// Initialize game state\nconst players = [\n  { pos: 0, color: '#e74c3c' },\n  { pos: 0, color: '#3498db' },\n];`,
              },
            ].map(({ file, lang, color, bg, snippet }) => (
              <div key={file} className="rounded-xl overflow-hidden border border-border bg-card">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border">
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${bg} ${color}`}>{lang}</span>
                  <span className="text-xs text-muted-foreground font-mono">{file}</span>
                </div>
                <pre className="p-4 text-[11px] text-muted-foreground font-mono leading-relaxed overflow-x-auto whitespace-pre">
                  {snippet}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 border-t border-border/50">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
            <Gamepad2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to build your game?
          </h2>
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
            Describe your idea in plain text — our agents handle the rest.
            No coding experience required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              <Gamepad2 className="w-4 h-4" />
              Start Building
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 px-8 py-3 bg-secondary border border-border text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors text-sm"
            >
              Continue as Guest
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center border border-primary/20">
              <Gamepad2 className="w-3 h-3 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">AI Game Builder</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Built with Next.js · NextAuth · Prisma · OpenRouter
          </p>
        </div>
      </footer>
    </div>
  );
}

