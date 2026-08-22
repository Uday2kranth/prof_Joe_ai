import React, { useMemo } from 'react';
import { marked } from 'marked';
import katex from 'katex';
import 'katex/dist/katex.min.css';

marked.setOptions({
  gfm: true,
  breaks: true
});

/**
 * Auto-sanitizes common LLM LaTeX imperfections before passing to KaTeX:
 * 1. Wraps unbraced macro subscripts/superscripts (e.g. `\text{Cov}_\boldsymbol{\theta}` -> `\text{Cov}_{\boldsymbol{\theta}}`, `^\mathbf{T}` -> `^{\mathbf{T}}`)
 * 2. Wraps unbraced standalone macro commands in subscript/superscript
 * 3. Normalizes unicode greek and math symbols to LaTeX equivalents if needed
 */
export function sanitizeLatexForKatex(latex: string): string {
  if (!latex) return '';
  let cleaned = latex.trim();

  // 1. Fix unbraced macro with arguments: _\macro{arg} -> _{\macro{arg}}
  cleaned = cleaned.replace(/_\\([a-zA-Z]+)\{([^{}]+)\}/g, '_{\\$1{$2}}');
  // 2. Fix unbraced macro with arguments: ^\macro{arg} -> ^{\macro{arg}}
  cleaned = cleaned.replace(/\^\\([a-zA-Z]+)\{([^{}]+)\}/g, '^{\\$1{$2}}');
  // 3. Fix unbraced standalone macro: _\macro -> _{\macro}
  cleaned = cleaned.replace(/_\\([a-zA-Z]+)(?![{a-zA-Z])/g, '_{\\$1}');
  // 4. Fix unbraced standalone macro: ^\macro -> ^{\macro}
  cleaned = cleaned.replace(/\^\\([a-zA-Z]+)(?![{a-zA-Z])/g, '^{\\$1}');

  return cleaned;
}

const COMMON_LATEX_MACROS = [
  'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'varepsilon', 'zeta', 'eta', 'theta', 'vartheta',
  'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'pi', 'rho', 'sigma', 'tau', 'upsilon', 'phi',
  'varphi', 'chi', 'psi', 'omega', 'Gamma', 'Delta', 'Theta', 'Lambda', 'Xi', 'Pi', 'Sigma',
  'Upsilon', 'Phi', 'Psi', 'Omega', 'frac', 'sqrt', 'sum', 'prod', 'int', 'iint', 'iiint',
  'oint', 'partial', 'nabla', 'infty', 'forall', 'exists', 'neg', 'pm', 'mp', 'times',
  'div', 'cdot', 'approx', 'equiv', 'sim', 'propto', 'le', 'leq', 'ge', 'geq', 'neq',
  'subset', 'subseteq', 'supset', 'supseteq', 'in', 'notin', 'cap', 'cup', 'land', 'lor',
  'to', 'rightarrow', 'leftarrow', 'Rightarrow', 'Leftarrow', 'iff', 'implies',
  'mathbf', 'mathit', 'mathbb', 'mathcal', 'mathscr', 'text', 'operatorname',
  'hat', 'bar', 'tilde', 'vec', 'dot', 'ddot', 'sup', 'inf', 'lim', 'log', 'ln',
  'exp', 'sin', 'cos', 'tan', 'det', 'dim', 'ker', 'deg', 'arg', 'min', 'max'
];

const BARE_LATEX_REGEX = new RegExp(
  `\\\\(${COMMON_LATEX_MACROS.join('|')})(?:\\{[^{}]*\\}|_[a-zA-Z0-9{}]*|\\^[a-zA-Z0-9{}]*|\\([^\\)]*\\)|\\[[^\\]]*\\])*`,
  'g'
);

export interface RenderMathOptions {
  inline?: boolean;
  diagramMap?: Map<string, string>;
}

/**
 * Universal markdown + math rendering engine:
 * Supports $$...$$, \[...\], \(...\), $...$, bare LaTeX commands, and markdown formatting.
 */
export function renderMathHtml(content: string, options: RenderMathOptions = {}): string {
  if (!content) return '';
  const { inline = false, diagramMap = new Map() } = options;

  const mathMap = new Map<string, string>();
  const codeMap = new Map<string, string>();
  let tokenIdx = 0;

  // Step 1: Protect triple-backtick and inline backtick code blocks from math replacements
  let prepped = content.replace(/```[\s\S]*?```/g, (match) => {
    const token = `CODEBLOCKTOKEN${tokenIdx++}ENDTOKEN`;
    codeMap.set(token, match);
    return token;
  });

  prepped = prepped.replace(/`[^`\n]+`/g, (match) => {
    const token = `INLINECODETOKEN${tokenIdx++}ENDTOKEN`;
    codeMap.set(token, match);
    return token;
  });

  // Step 2: Extract block math $$...$$
  prepped = prepped.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    const token = `KATEXBLOCKTOKEN${tokenIdx++}ENDTOKEN`;
    try {
      const sanitized = sanitizeLatexForKatex(math);
      mathMap.set(token, `<div class="katex-display katex-block">${katex.renderToString(sanitized, { displayMode: true, throwOnError: false })}</div>`);
    } catch {
      mathMap.set(token, `$$${math}$$`);
    }
    return token;
  });

  // Step 2b: Extract block math \[...\]
  prepped = prepped.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
    const token = `KATEXBLOCKTOKEN${tokenIdx++}ENDTOKEN`;
    try {
      const sanitized = sanitizeLatexForKatex(math);
      mathMap.set(token, `<div class="katex-display katex-block">${katex.renderToString(sanitized, { displayMode: true, throwOnError: false })}</div>`);
    } catch {
      mathMap.set(token, `\\[${math}\\]`);
    }
    return token;
  });

  // Step 3: Extract inline math \(...\)
  prepped = prepped.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => {
    const token = `KATEXINLINETOKEN${tokenIdx++}ENDTOKEN`;
    try {
      const sanitized = sanitizeLatexForKatex(math);
      mathMap.set(token, `<span class="katex-inline">${katex.renderToString(sanitized, { displayMode: false, throwOnError: false })}</span>`);
    } catch {
      mathMap.set(token, `\\(${math}\\)`);
    }
    return token;
  });

  // Step 3b: Extract inline math $...$
  prepped = prepped.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    const token = `KATEXINLINETOKEN${tokenIdx++}ENDTOKEN`;
    try {
      const sanitized = sanitizeLatexForKatex(math);
      mathMap.set(token, `<span class="katex-inline">${katex.renderToString(sanitized, { displayMode: false, throwOnError: false })}</span>`);
    } catch {
      mathMap.set(token, `$${math}$`);
    }
    return token;
  });

  // Step 4: Standalone multiline LaTeX environments (\begin{...}...\end{...})
  prepped = prepped.replace(/\\begin\{([a-zA-Z*]+)\}[\s\S]*?\\end\{\1\}/g, (envMatch) => {
    const token = `KATEXBLOCKTOKEN${tokenIdx++}ENDTOKEN`;
    try {
      const sanitized = sanitizeLatexForKatex(envMatch);
      mathMap.set(token, `<div class="katex-display katex-block">${katex.renderToString(sanitized, { displayMode: true, throwOnError: false })}</div>`);
    } catch {
      mathMap.set(token, envMatch);
    }
    return token;
  });

  // Step 5: Detect bare LaTeX expressions in lines or fragments (e.g. \chi^2_\nu, \lambda(x), \frac{a}{b})
  prepped = prepped.replace(BARE_LATEX_REGEX, (bareMatch) => {
    const token = `KATEXINLINETOKEN${tokenIdx++}ENDTOKEN`;
    try {
      const sanitized = sanitizeLatexForKatex(bareMatch);
      mathMap.set(token, `<span class="katex-inline">${katex.renderToString(sanitized, { displayMode: false, throwOnError: false })}</span>`);
    } catch {
      mathMap.set(token, bareMatch);
    }
    return token;
  });

  // Step 6: Restore code blocks before marked parse
  codeMap.forEach((codeStr, token) => {
    prepped = prepped.replaceAll(token, codeStr);
  });

  // Step 7: Parse Markdown
  let parsedHtml = marked.parse(prepped) as string;

  // Step 8: Restore Math Tokens
  mathMap.forEach((html, token) => {
    const pWrapped = `<p>${token}</p>`;
    if (parsedHtml.includes(pWrapped)) {
      parsedHtml = parsedHtml.replace(pWrapped, html);
    } else {
      parsedHtml = parsedHtml.replaceAll(token, html);
    }
  });

  // Step 9: Restore Diagram Tokens if present
  diagramMap.forEach((svgContainerHtml, token) => {
    const paragraphWrapped = `<p>${token}</p>`;
    if (parsedHtml.includes(paragraphWrapped)) {
      parsedHtml = parsedHtml.replace(paragraphWrapped, svgContainerHtml);
    } else {
      parsedHtml = parsedHtml.replaceAll(token, svgContainerHtml);
    }
  });

  // If inline mode requested, strip top-level <p> and </p> tags
  if (inline) {
    parsedHtml = parsedHtml.trim();
    if (parsedHtml.startsWith('<p>') && parsedHtml.endsWith('</p>')) {
      parsedHtml = parsedHtml.slice(3, -4);
    }
  }

  return parsedHtml;
}

interface MathTextProps {
  content?: string;
  inline?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const MathText: React.FC<MathTextProps> = ({
  content = '',
  inline = false,
  className = '',
  style
}) => {
  const html = useMemo(() => {
    return renderMathHtml(content, { inline });
  }, [content, inline]);

  if (inline) {
    return (
      <span
        className={`math-text-inline ${className}`}
        style={style}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div
      className={`math-text-block markdown-body ${className}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
