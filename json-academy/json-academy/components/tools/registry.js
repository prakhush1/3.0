import FormatterWidget from "@/components/tools/FormatterWidget";
import ValidatorWidget from "@/components/tools/ValidatorWidget";
import MinifierWidget from "@/components/tools/MinifierWidget";
import ConverterWidget from "@/components/tools/ConverterWidget";
import TreeViewerWidget from "@/components/tools/TreeViewerWidget";
import DiffCheckerWidget from "@/components/tools/DiffCheckerWidget";
import PathExtractorWidget from "@/components/tools/PathExtractorWidget";

export const WIDGETS = {
  "json-formatter": FormatterWidget,
  "json-validator": ValidatorWidget,
  "json-minifier": MinifierWidget,
  "json-csv-converter": ConverterWidget,
  "json-tree-viewer": TreeViewerWidget,
  "json-diff-checker": DiffCheckerWidget,
  "json-path-extractor": PathExtractorWidget,
};
