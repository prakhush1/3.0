import FormatterWidget from "@/components/tools/FormatterWidget";
import ValidatorWidget from "@/components/tools/ValidatorWidget";
import MinifierWidget from "@/components/tools/MinifierWidget";
import ConverterWidget from "@/components/tools/ConverterWidget";
import TreeViewerWidget from "@/components/tools/TreeViewerWidget";
import DiffCheckerWidget from "@/components/tools/DiffCheckerWidget";
import PathExtractorWidget from "@/components/tools/PathExtractorWidget";
import EscapeWidget from "@/components/tools/EscapeWidget";
import UnescapeWidget from "@/components/tools/UnescapeWidget";
import JwtDecoderWidget from "@/components/tools/JwtDecoderWidget";
import SqlFormatterWidget from "@/components/tools/SqlFormatterWidget";
import StringCompareWidget from "@/components/tools/StringCompareWidget";

FormatterWidget.fullBleed = true;
ValidatorWidget.fullBleed = true;
MinifierWidget.fullBleed = true;
ConverterWidget.fullBleed = true;
TreeViewerWidget.fullBleed = true;
DiffCheckerWidget.fullBleed = true;
PathExtractorWidget.fullBleed = true;
EscapeWidget.fullBleed = true;
UnescapeWidget.fullBleed = true;
JwtDecoderWidget.fullBleed = true;
SqlFormatterWidget.fullBleed = true;
StringCompareWidget.fullBleed = true;

export const WIDGETS = {
  "json-formatter": FormatterWidget,
  "json-validator": ValidatorWidget,
  "json-minifier": MinifierWidget,
  "json-csv-converter": ConverterWidget,
  "json-tree-viewer": TreeViewerWidget,
  "json-diff-checker": DiffCheckerWidget,
  "json-path-extractor": PathExtractorWidget,
  "json-escape": EscapeWidget,
  "json-unescape": UnescapeWidget,
  "jwt-decoder": JwtDecoderWidget,
  "sql-formatter": SqlFormatterWidget,
  "string-compare": StringCompareWidget,
};
