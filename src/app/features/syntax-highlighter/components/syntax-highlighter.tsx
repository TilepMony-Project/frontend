"use client";

import clsx from "clsx";
import { useState, useRef } from "react";
import { useTheme } from "@/hooks/use-theme";

import AceEditor from "react-ace";

// https://securingsincity.github.io/react-ace/

import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-monokai";

export type SyntaxHighlighterProps = {
  value: string;
  onChange?: (value?: string) => void;
  isDisabled?: boolean;
  placeholder?: string;
};

export function SyntaxHighlighter(props: SyntaxHighlighterProps) {
  const { value, onChange, isDisabled, placeholder } = props;
  const { theme } = useTheme();
  const aceTheme = theme === "dark" ? "monokai" : "github";
  const editorRef = useRef<AceEditor | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Show placeholder only when value is empty and not focused
  const showPlaceholder = !isFocused && value === "";
  const displayValue = value || "";

  const handleChange = (newValue: string) => {
    onChange?.(newValue || "");
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div
      className={clsx(
        "rounded-xl border border-border bg-background overflow-hidden relative",
        "dark:bg-[#1e1e1e]"
      )}
    >
      <AceEditor
        ref={editorRef}
        name="field"
        value={displayValue}
        mode="json"
        theme={aceTheme}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        fontSize={13}
        lineHeight={18}
        showPrintMargin={false}
        showGutter={false}
        highlightActiveLine={false}
        wrapEnabled={true}
        readOnly={isDisabled}
        width="100%"
        height="auto"
        style={{
          textIndent: "none",
          minHeight: "300px",
          boxSizing: "border-box",
          fontFamily:
            "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
        }}
        setOptions={{
          enableBasicAutocompletion: false,
          enableLiveAutocompletion: false,
          enableSnippets: false,
          enableMobileMenu: false,
          showLineNumbers: false,
          showPrintMargin: false,
          tabSize: 2,
          useSoftTabs: true,
          hasCssTransforms: true,
          $blockScrolling: true,
          maxLines: 20,
        }}
      />
      {showPlaceholder && (
        <div
          className={clsx(
            "absolute top-3 left-3 pointer-events-none select-none",
            "text-muted-foreground/50 dark:text-muted-foreground/40",
            "font-mono text-sm"
          )}
        >
          {placeholder}
        </div>
      )}
    </div>
  );
}
