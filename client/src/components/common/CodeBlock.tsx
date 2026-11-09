import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  highlightMasked?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, highlightMasked = true }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderHighlightedText = (text: string) => {
    if (!highlightMasked) return text;

    // Split on masked tokens or pattern variables: {VAR}, tok_***, ***@***.com, Bearer ***
    const regex = /(\{[A-Z0-9_]+\}|tok_\*\*\*|usr_\*\*\*|Bearer \*\*\*|\*\*\*@\*\*\*|\*\*\*)/g;
    const parts = text.split(regex);

    return parts.map((part, i) => {
      if (part.startsWith('{') && part.endsWith('}')) {
        return (
          <span key={i} className="token-highlight">
            {part}
          </span>
        );
      }
      if (part.includes('***')) {
        return (
          <span key={i} className="token-masked" title="Masked sensitive credential (HM-06)">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={handleCopy}
        className="btn btn-sm btn-secondary"
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          padding: '4px 8px',
          zIndex: 5,
          opacity: 0.85,
        }}
        title="Copy to clipboard"
      >
        {copied ? (
          <>
            <Check size={12} color="#10b981" /> Copied
          </>
        ) : (
          <>
            <Copy size={12} /> Copy
          </>
        )}
      </button>
      <pre className="code-block" style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        <code>{renderHighlightedText(code)}</code>
      </pre>
    </div>
  );
};
