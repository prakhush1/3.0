export const TOOLS = [
  {
    slug: "json-formatter",
    icon: "braces",
    tag: '"formatter":',
    title: "JSON Formatter",
    sub: "Beautify & indent",
    category: "Format",
    shortDesc:
      "Transform messy, minified JSON into clean, human-readable format with configurable indentation.",
    intro:
      "Paste minified or poorly indented JSON and instantly get a clean, readable version with 2-space, 4-space, or tab indentation — all processed locally in your browser.",
    keywords: ["json formatter", "json beautifier", "pretty print json", "format json online"],
    features: [
      { title: "Configurable indent", desc: "Switch between 2, 4 spaces, or tabs to match your codebase style." },
      { title: "Instant formatting", desc: "Formats as you type — no button presses, no waiting." },
      { title: "Error highlighting", desc: "Invalid JSON is flagged immediately with a clear message." },
    ],
    faqs: [
      { q: "Is this JSON formatter free?", a: "Yes, completely free with no limits, sign-up, or watermarks." },
      { q: "Does my JSON data leave my browser?", a: "No. Formatting happens entirely client-side — nothing is uploaded to a server." },
      { q: "Can I format very large JSON files?", a: "Yes, the formatter is built to handle large payloads smoothly since it runs locally." },
    ],
  },
  {
    slug: "json-validator",
    icon: "check-circle",
    tag: '"validator":',
    title: "JSON Validator",
    sub: "Syntax check",
    category: "Validate",
    shortDesc:
      "Validate your JSON against the RFC 8259 specification. Get precise error locations and messages.",
    intro:
      "Check whether your JSON is syntactically valid. Get the exact line and column of any error, with a plain-English explanation of what went wrong.",
    keywords: ["json validator", "validate json online", "json syntax checker", "rfc 8259"],
    features: [
      { title: "RFC 8259 compliant", desc: "Validation follows the official JSON specification." },
      { title: "Precise error location", desc: "Jump straight to the line and column causing the problem." },
      { title: "Real-time checking", desc: "Validation runs as you paste or type, no extra clicks." },
    ],
    faqs: [
      { q: "What does 'valid JSON' mean?", a: "It means the text strictly follows JSON syntax rules as defined in RFC 8259 — correct brackets, quoting, and types." },
      { q: "Why does my JSON fail validation?", a: "Common causes are trailing commas, single quotes instead of double quotes, or unquoted keys." },
      { q: "Is there a file size limit?", a: "No hard limit — validation runs locally in your browser." },
    ],
  },
  {
    slug: "json-minifier",
    icon: "minimize",
    tag: '"minifier":',
    title: "JSON Minifier",
    sub: "Compress & shrink",
    category: "Format",
    shortDesc:
      "Strip whitespace, line breaks, and unnecessary characters to produce the smallest valid JSON.",
    intro:
      "Remove all unnecessary whitespace and line breaks from your JSON to reduce payload size before sending it over the network or storing it.",
    keywords: ["json minifier", "minify json online", "compress json", "json compactor"],
    features: [
      { title: "Smaller payloads", desc: "Cut unnecessary bytes for faster network transfer." },
      { title: "Lossless output", desc: "Minifying never changes the structure or values of your data." },
      { title: "One-click copy", desc: "Copy the minified result straight to your clipboard." },
    ],
    faqs: [
      { q: "Does minifying change my data?", a: "No, only whitespace and formatting are removed — the data structure stays identical." },
      { q: "Can I reverse minification?", a: "Yes, use the JSON Formatter to pretty-print minified JSON again." },
    ],
  },
  {
    slug: "json-csv-converter",
    icon: "repeat",
    tag: '"converter":',
    title: "JSON ↔ CSV Converter",
    sub: "Transform formats",
    category: "Convert",
    shortDesc:
      "Convert JSON arrays to CSV and back. Perfect for data export, spreadsheet import, and migration.",
    intro:
      "Convert an array of flat JSON objects into CSV for spreadsheets, or paste CSV and turn it back into JSON — all processed instantly in your browser.",
    keywords: ["json to csv", "csv to json", "json csv converter online"],
    features: [
      { title: "Two-way conversion", desc: "Switch direction between JSON → CSV and CSV → JSON." },
      { title: "Auto header detection", desc: "Column headers are inferred from your JSON keys automatically." },
      { title: "Spreadsheet ready", desc: "Output is ready to paste straight into Excel or Google Sheets." },
    ],
    faqs: [
      { q: "Does it support nested JSON?", a: "Best results come from flat JSON arrays of objects; nested values are stringified into a single cell." },
      { q: "What delimiter does the CSV use?", a: "A standard comma delimiter, compatible with Excel and Google Sheets." },
    ],
  },
  {
    slug: "json-tree-viewer",
    icon: "list-tree",
    tag: '"tree_viewer":',
    title: "JSON Tree Viewer",
    sub: "Explore visually",
    category: "View",
    shortDesc:
      "Render JSON as an interactive, collapsible tree. Navigate nested structures with ease.",
    intro:
      "Paste any JSON and explore it as a collapsible tree. Expand and collapse nested objects and arrays to quickly understand deeply nested structures.",
    keywords: ["json tree viewer", "json viewer online", "explore json structure"],
    features: [
      { title: "Collapsible nodes", desc: "Expand or collapse any object or array with a click." },
      { title: "Type-aware coloring", desc: "Strings, numbers, booleans, and null are color-coded for clarity." },
      { title: "Deep nesting friendly", desc: "Built to stay readable even with heavily nested data." },
    ],
    faqs: [
      { q: "Can I expand all nodes at once?", a: "Yes, use the Expand All / Collapse All controls above the tree." },
      { q: "Does it handle arrays of objects?", a: "Yes, arrays render with indexed entries just like nested objects." },
    ],
  },
  {
    slug: "json-diff-checker",
    icon: "git-compare",
    tag: '"diff_checker":',
    title: "JSON Diff Checker",
    sub: "Compare & spot",
    category: "Compare",
    shortDesc:
      "Compare two JSON objects and highlight exactly what was added, removed, or changed.",
    intro:
      "Paste two JSON documents side by side and instantly see what was added, removed, or changed between them — useful for debugging API responses or config drift.",
    keywords: ["json diff", "compare json online", "json diff checker"],
    features: [
      { title: "Field-level diff", desc: "See exactly which keys were added, removed, or modified." },
      { title: "Color-coded changes", desc: "Additions, deletions, and edits are visually distinct." },
      { title: "Works on nested data", desc: "Recursively compares nested objects and arrays." },
    ],
    faqs: [
      { q: "Does key order matter for the diff?", a: "No, objects are compared by key, not by order." },
      { q: "Can I diff JSON arrays?", a: "Yes, arrays are compared index by index." },
    ],
  },
  {
    slug: "json-path-extractor",
    icon: "crosshair",
    tag: '"path_extractor":',
    title: "JSON Path Extractor",
    sub: "Extract paths",
    category: "View",
    shortDesc:
      "Generate all JSONPath expressions for every leaf node. Click to copy any path instantly.",
    intro:
      "Paste your JSON and instantly get every JSONPath expression for each leaf value in the document — click any path to copy it for use in your code or queries.",
    keywords: ["jsonpath generator", "json path extractor", "json path finder"],
    features: [
      { title: "Every leaf path", desc: "Generates a JSONPath expression for every terminal value." },
      { title: "Click to copy", desc: "Click any generated path to copy it instantly." },
      { title: "Great for debugging", desc: "Quickly locate the path to a value buried in deep JSON." },
    ],
    faqs: [
      { q: "What is JSONPath used for?", a: "JSONPath expressions let you query or reference a specific value inside a JSON document, similar to XPath for XML." },
      { q: "Does it support arrays?", a: "Yes, array indices are included in the generated path, e.g. $.items[0].id." },
    ],
  },
  {
    slug: "json-escape",
    icon: "slash",
    tag: '"escape":',
    title: "JSON Escape",
    sub: "Escape special chars",
    category: "Escape",
    shortDesc:
      "Escape quotes, backslashes, and line breaks so raw text can be safely embedded inside a JSON string value.",
    intro:
      "Paste raw text or JSON and instantly get an escaped version — quotes, backslashes, newlines, and tabs are converted to their \\n \\t \\\" \\\\ sequences so the text is safe to embed inside a JSON string.",
    keywords: ["json escape", "escape json string online", "json string escape tool"],
    features: [
      { title: "Handles all control chars", desc: "Escapes quotes, backslashes, newlines, tabs, and other control characters." },
      { title: "Embed-ready output", desc: "Paste the result straight into any JSON string value without breaking syntax." },
      { title: "Instant, local processing", desc: "Runs entirely in your browser as you type — nothing is uploaded." },
    ],
    faqs: [
      { q: "What does escaping JSON mean?", a: "It converts characters like quotes and newlines into safe escape sequences (e.g. \" becomes \\\") so text can live inside a JSON string without breaking it." },
      { q: "Does the output include the surrounding quotes?", a: "No, only the escaped content is returned so you can drop it into your own JSON string literal." },
    ],
  },
  {
    slug: "json-unescape",
    icon: "quote",
    tag: '"unescape":',
    title: "JSON Unescape",
    sub: "Reverse escape sequences",
    category: "Escape",
    shortDesc:
      "Convert an escaped JSON string back into its original, readable text by resolving \\n, \\t, \\\" and other sequences.",
    intro:
      "Paste an escaped JSON string fragment and instantly get the original, human-readable text back — every \\n, \\t, \\\" and \\\\ sequence is resolved to its real character.",
    keywords: ["json unescape", "unescape json string online", "remove json escape characters"],
    features: [
      { title: "Resolves every sequence", desc: "Handles \\n, \\t, \\r, \\\", \\\\, and unicode \\u escapes." },
      { title: "Clear error messages", desc: "Invalid or incomplete escape sequences are flagged immediately." },
      { title: "Great for log debugging", desc: "Turn escaped strings from logs or API payloads back into readable text." },
    ],
    faqs: [
      { q: "What input does this expect?", a: "Paste the escaped content without outer quotes, e.g. Hello\\nWorld, and it will be converted back to readable text." },
      { q: "What if I paste a full quoted string?", a: "Surrounding quotes are detected and stripped automatically before unescaping." },
    ],
  },
];

export function getToolBySlug(slug) {
  return TOOLS.find((t) => t.slug === slug);
}
