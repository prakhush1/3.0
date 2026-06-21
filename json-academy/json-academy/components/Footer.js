import Icon from "./Icon";

export default function Footer() {
  return (
    <footer className="bg-[#0d1117] px-6 pt-16 text-gray-400">
      <div className="mx-auto grid max-w-6xl gap-12 pb-12 sm:grid-cols-2">
        <div>
          <a href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500 text-white">
              <Icon name="code" className="w-4 h-4" />
            </span>
            <span className="text-base font-bold text-white">
              <span className="text-violet-400">{"{JSON}"}</span> Academy
            </span>
          </a>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            Powerful, privacy-first JSON tools. Everything runs in your browser.
          </p>
          <pre className="mt-6 text-xs leading-6 text-gray-500">{`{
  "version": "2.0",
  "status": "online",
  "tools": 9,
  "privacy": "100%"
}`}</pre>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-sm font-bold text-white">
            <span className="text-violet-400">→</span> Learn
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            <li><a href="/tools" className="hover:text-white">All Tools</a></li>
            <li><a href="/tools/json-formatter" className="hover:text-white">Formatter</a></li>
            <li><a href="/tools/json-validator" className="hover:text-white">Validator</a></li>
            <li><a href="/tools/json-diff-checker" className="hover:text-white">Diff Checker</a></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-xs sm:flex-row">
        <p>© 2026 JSON Academy. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white">Privacy Policy</a>
          <a href="#" className="hover:text-white">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
