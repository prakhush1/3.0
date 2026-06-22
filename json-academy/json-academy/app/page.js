import Icon from "@/components/Icon";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { TOOLS } from "@/lib/tools";

const FEATURES = [
  { icon: "lock", tag: '"privacy_first":', title: "100% Private", desc: "All processing happens in your browser. Your data never touches our servers." },
  { icon: "zap", tag: '"instant_results":', title: "Instant Results", desc: "No loading screens, no queues. Tools execute the moment you click." },
  { icon: "shield", tag: '"no_signup":', title: "No Sign-up", desc: "Jump straight into any tool. No account, no email, no tracking required." },
  { icon: "cpu", tag: '"client_side":', title: "Client-Side Power", desc: "Your browser does the heavy lifting — no server roundtrips, no limits." },
  { icon: "eye", tag: '"visual_feedback":', title: "Visual Feedback", desc: "Interactive trees, color-coded diffs, and real-time validation you can see." },
  { icon: "infinity", tag: '"free_forever":', title: "Free Forever", desc: "Every tool is completely free. No premium tier, no hidden paywalls." },
];

const FEATURED_TOOLS = TOOLS.slice(0, 3);
const PATH_TOOL = TOOLS.find((t) => t.slug === "json-path-extractor");

function Badge({ children }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium"
      style={{ borderColor: "var(--color-brand-100)", backgroundColor: "var(--color-brand-50)", color: "var(--color-brand-text)" }}
    >
      {children}
    </span>
  );
}

function Card({ icon, tag, title, desc }) {
  return (
    <div>
      <div
        className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: "var(--color-brand-100)", color: "var(--color-brand)" }}
      >
        <Icon name={icon} className="w-5 h-5" />
      </div>
      <p className="mb-1 text-xs text-gray-400">{tag}</p>
      <h3 className="mb-2 text-lg font-bold" style={{ color: "var(--color-ink)" }}>{title}</h3>
      <p className="text-sm leading-relaxed text-gray-500">{desc}</p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <Nav active="home" />

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-10">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Badge>
              <Icon name="sparkle" className="w-3.5 h-3.5" /> New: JSON Diff Checker
            </Badge>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              The complete
              <br />
              <span style={{ color: "var(--color-brand)" }}>JSON</span>
              <br />
              toolkit<span style={{ color: "var(--color-brand)" }}>.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-gray-500">
              Format, validate, minify, convert, and compare JSON — all in one
              place. Fast, free, and privacy-first. Everything runs right in
              your browser.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="/tools"
                className="flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: "var(--color-brand)" }}
              >
                Explore Tools <Icon name="arrow-right" className="w-4 h-4" />
              </a>
              <a href="#" className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-semibold hover:bg-gray-50" style={{ color: "var(--color-ink)" }}>
                <Icon name="play" className="w-3.5 h-3.5" /> Why Us
              </a>
            </div>

            <div className="mt-12 grid max-w-sm grid-cols-3 gap-6 border-t border-gray-200 pt-6">
              {[["9", "Tools"], ["100%", "Private"], ["$0", "Forever"]].map(([n, l]) => (
                <div key={l}>
                  <p className="text-2xl font-extrabold">{n}</p>
                  <p className="text-xs text-gray-400">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* terminal mockup */}
          <div className="relative">
            <div className="rounded-xl bg-[#0d1117] p-5 shadow-2xl">
              <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
                <span className="ml-2 text-xs text-gray-400">tools.json</span>
              </div>
              <pre className="text-[13px] leading-7"><code>
<span className="text-gray-500">{"{"}</span>{"\n"}
<span className="text-[#9cdcfe]">  &quot;platform&quot;</span><span className="text-gray-500"> : </span><span className="text-[#7ee787]">&quot;JSON Tools&quot;</span><span className="text-gray-500">,</span>{"\n"}
<span className="text-[#9cdcfe]">  &quot;tools&quot;</span><span className="text-gray-500"> : </span><span className="text-[#f0883e]">9</span><span className="text-gray-500">,</span>{"\n"}
<span className="text-[#9cdcfe]">  &quot;privacy&quot;</span><span className="text-gray-500"> : </span><span className="text-[#7ee787]">&quot;100% local&quot;</span><span className="text-gray-500">,</span>{"\n"}
<span className="text-[#9cdcfe]">  &quot;price&quot;</span><span className="text-gray-500"> : </span><span className="text-[#f0883e]">0</span><span className="text-gray-500">,</span>{"\n"}
<span className="text-[#9cdcfe]">  &quot;signup&quot;</span><span className="text-gray-500"> : </span><span className="text-[#c586c0]">false</span><span className="text-gray-500">,</span>{"\n"}
<span className="text-[#9cdcfe]">  &quot;speed&quot;</span><span className="text-gray-500"> : </span><span className="text-[#7ee787]">&quot;instant&quot;</span>{"\n"}
<span className="text-gray-500">{"}"}</span>
              </code></pre>
              <p className="mt-3 text-[13px]" style={{ color: "var(--color-brand)" }}>
                <span className="text-gray-500">→</span>{" "}
                <span className="inline-block h-3.5 w-2 animate-pulse align-middle" style={{ backgroundColor: "var(--color-brand)" }} />
              </p>
            </div>
            <div
              className="pointer-events-none absolute -bottom-8 -right-6 h-28 w-28 rounded-full blur-xl"
              style={{ background: `radial-gradient(circle, color-mix(in srgb, var(--color-brand) 30%, transparent), color-mix(in srgb, var(--color-brand) 10%, transparent))` }}
            />
          </div>
        </div>

        <div className="mt-16 flex justify-center text-gray-300">
          <Icon name="mouse" className="w-6 h-6" />
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <p className="text-xs font-bold tracking-widest" style={{ color: "var(--color-brand)" }}>// FEATURES</p>
          <h2 className="mt-3 text-4xl font-extrabold sm:text-5xl">
            Built for <span style={{ color: "var(--color-brand)" }}>developers</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-gray-500">
            Every tool is designed to be fast, reliable, and respectful of
            your privacy. No bloat, no ads, no nonsense.
          </p>
        </div>

        <div className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} {...f} />
          ))}
        </div>
      </section>

      {/* TOOLS */}
      <section id="tools" className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest" style={{ color: "var(--color-brand)" }}>// TOOLS</p>
            <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">The JSON Toolbox</h2>
          </div>
          <a
            href="/tools"
            className="flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-semibold transition hover:opacity-80"
            style={{ borderColor: "var(--color-line)", backgroundColor: "var(--color-surface)", color: "var(--color-ink)" }}
          >
            View All <Icon name="arrow-right" className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {FEATURED_TOOLS.map((t) => (
            <a
              key={t.slug}
              href={`/tools/${t.slug}`}
              className="group rounded-2xl border p-6 transition hover:shadow-md"
              style={{ borderColor: "var(--color-line)", backgroundColor: "var(--color-surface)" }}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: "var(--color-brand-100)", color: "var(--color-brand)" }}>
                  <Icon name={t.icon} className="w-5 h-5" />
                </div>
                <Icon name="arrow-right" className="w-4 h-4 text-gray-300 transition group-hover:translate-x-0.5" />
              </div>
              <p className="mt-5 text-xs text-gray-400">{t.tag}</p>
              <h3 className="mt-1 text-lg font-bold">{t.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{t.shortDesc}</p>
            </a>
          ))}
        </div>

        <a
          href={`/tools/${PATH_TOOL.slug}`}
          className="group mt-5 flex items-center justify-between rounded-2xl border p-6 transition hover:shadow-md"
          style={{ borderColor: "var(--color-line)", backgroundColor: "var(--color-surface)" }}
        >
          <div className="flex items-center gap-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "var(--color-brand-100)", color: "var(--color-brand)" }}>
              <Icon name="crosshair" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{PATH_TOOL.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{PATH_TOOL.shortDesc}</p>
            </div>
          </div>
          <Icon name="arrow-right" className="w-4 h-4 shrink-0 text-gray-300 transition group-hover:translate-x-0.5" />
        </a>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-[#2f3236] text-center text-white">
          <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full blur-3xl" style={{ backgroundColor: "color-mix(in srgb, var(--color-brand) 20%, transparent)" }} />
          <div className="relative px-6 py-16">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/10" style={{ color: "var(--color-brand)" }}>
              <Icon name="code" className="w-5 h-5" />
            </div>
            <h2 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl">
              Ready to work
              <br />
              with data<span style={{ color: "var(--color-brand)" }}>?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-gray-300">
              Pick a tool and start working. No sign-up, no downloads, no fees.
              Just clean, fast JSON utilities.
            </p>
            <a
              href="/tools"
              className="mt-8 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition hover:opacity-90"
              style={{ backgroundColor: "var(--color-brand)", color: "#ffffff" }}
            >
              Browse All Tools <Icon name="arrow-right" className="w-4 h-4" />
            </a>
          </div>
          <div className="relative border-t border-white/10 px-6 py-4 text-xs text-gray-400">
            <span className="text-emerald-400">•</span> No sign-up &nbsp;&nbsp;
            <span className="text-emerald-400">•</span> 100% private &nbsp;&nbsp;
            <span className="text-emerald-400">•</span> Free forever
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
