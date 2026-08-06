import Link from "next/link";
import { ArrowRight, Leaf, LineChart, NotebookPen, FileText, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/config/site.config";
import { ROUTES } from "@/config/routes.config";

const FEATURES = [
  {
    icon: Camera,
    title: "Objective scans, not selfies",
    body: "Every scan is analyzed by a dermatologist-validated skin analysis API, so your score is a measurement — never a guess.",
  },
  {
    icon: LineChart,
    title: "Real progress, visualized",
    body: "Watch every metric — acne, redness, texture, and more — move over weeks and months on one continuous timeline.",
  },
  {
    icon: NotebookPen,
    title: "Context that explains the data",
    body: "Log products, routines, and lifestyle notes alongside each scan, so patterns are easy to spot later — never guessed at by an algorithm.",
  },
  {
    icon: FileText,
    title: "A report your dermatologist can use",
    body: "Export your full scan history, comparisons, and notes as a clean PDF for your next appointment.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Leaf className="h-4 w-4" />
          </div>
          <span className="font-display text-lg font-medium">{SITE_CONFIG.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href={ROUTES.login}>Log in</Link>
          </Button>
          <Button asChild>
            <Link href={ROUTES.register}>Start your journey</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-16 pt-14 text-center sm:pt-24">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-pill border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
          Powered by dermatologist-validated skin analysis
        </div>
        <h1 className="font-display text-4xl font-medium leading-tight tracking-tight sm:text-6xl">
          {SITE_CONFIG.tagline}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          {SITE_CONFIG.description} No forecasts, no marketing claims — just your measurements, over time.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild className="gap-2">
            <Link href={ROUTES.register}>
              Start your baseline scan <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href={ROUTES.login}>I already have an account</Link>
          </Button>
        </div>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-medium">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-center text-xs text-muted-foreground">
        Built for the YouCam API Hackathon · Skin AI track
      </footer>
    </div>
  );
}
