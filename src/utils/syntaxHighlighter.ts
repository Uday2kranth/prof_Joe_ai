/**
 * Universal High-Performance Syntax Tokenizer & Highlighter
 * Tokenizes code into semantic HTML spans without external heavy dependencies.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface LanguageDef {
  keywords: Set<string>;
  types: Set<string>;
  builtins: Set<string>;
  singleLineComment: string;
  multiLineComment?: [string, string];
}

const PYTHON_DEF: LanguageDef = {
  keywords: new Set([
    'def', 'class', 'import', 'from', 'as', 'return', 'yield', 'lambda',
    'if', 'elif', 'else', 'for', 'while', 'break', 'continue', 'pass',
    'try', 'except', 'finally', 'raise', 'with', 'assert', 'async', 'await',
    'global', 'nonlocal', 'del', 'in', 'is', 'not', 'and', 'or', 'True', 'False', 'None'
  ]),
  types: new Set([
    'int', 'float', 'str', 'bool', 'list', 'dict', 'set', 'tuple', 'bytes',
    'bytearray', 'memoryview', 'complex', 'range', 'frozenset', 'type', 'object',
    'Any', 'Union', 'Optional', 'List', 'Dict', 'Tuple', 'Set', 'Callable', 'Iterable'
  ]),
  builtins: new Set([
    'print', 'len', 'range', 'enumerate', 'zip', 'map', 'filter', 'sum',
    'min', 'max', 'abs', 'round', 'all', 'any', 'open', 'read', 'write',
    'input', 'isinstance', 'issubclass', 'id', 'hex', 'bin', 'oct', 'ord',
    'chr', 'sorted', 'reversed', 'format', 'vars', 'dir', 'help', 'super',
    'self', 'cls'
  ]),
  singleLineComment: '#'
};

const JS_TS_DEF: LanguageDef = {
  keywords: new Set([
    'function', 'const', 'let', 'var', 'return', 'yield', 'import', 'export',
    'from', 'default', 'as', 'class', 'extends', 'super', 'this', 'new',
    'if', 'else', 'switch', 'case', 'default', 'for', 'while', 'do', 'break',
    'continue', 'try', 'catch', 'finally', 'throw', 'typeof', 'instanceof',
    'in', 'of', 'async', 'await', 'static', 'get', 'set', 'true', 'false',
    'null', 'undefined', 'void', 'delete', 'interface', 'type', 'enum',
    'implements', 'namespace', 'public', 'private', 'protected', 'readonly'
  ]),
  types: new Set([
    'string', 'number', 'boolean', 'symbol', 'bigint', 'any', 'unknown',
    'never', 'void', 'object', 'Array', 'Record', 'Promise', 'Partial',
    'Required', 'Readonly', 'Pick', 'Omit', 'Exclude', 'Extract', 'NonNullable'
  ]),
  builtins: new Set([
    'console', 'log', 'error', 'warn', 'info', 'document', 'window', 'Math',
    'JSON', 'Object', 'Array', 'String', 'Number', 'Boolean', 'Date', 'RegExp',
    'Map', 'Set', 'WeakMap', 'WeakSet', 'Promise', 'fetch', 'setTimeout',
    'setInterval', 'clearTimeout', 'clearInterval', 'parseInt', 'parseFloat'
  ]),
  singleLineComment: '//',
  multiLineComment: ['/*', '*/']
};

const BASH_DEF: LanguageDef = {
  keywords: new Set([
    'if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'until', 'do', 'done',
    'in', 'case', 'esac', 'select', 'function', 'return', 'exit', 'source',
    'export', 'local', 'readonly', 'set', 'unset', 'shift', 'test'
  ]),
  types: new Set(['string', 'int', 'array']),
  builtins: new Set([
    'echo', 'printf', 'read', 'cd', 'pwd', 'ls', 'mkdir', 'rm', 'cp', 'mv',
    'touch', 'cat', 'grep', 'sed', 'awk', 'find', 'chmod', 'chown', 'curl',
    'wget', 'git', 'npm', 'node', 'python', 'python3', 'pip', 'docker', 'ssh',
    'sudo', 'apt', 'yum', 'tar', 'zip', 'unzip', 'head', 'tail', 'less', 'wc'
  ]),
  singleLineComment: '#'
};

const CPP_DEF: LanguageDef = {
  keywords: new Set([
    'include', 'define', 'if', 'ifdef', 'ifndef', 'endif', 'else', 'elif',
    'int', 'float', 'double', 'char', 'void', 'bool', 'long', 'short',
    'unsigned', 'signed', 'auto', 'const', 'static', 'return', 'class',
    'struct', 'enum', 'union', 'public', 'private', 'protected', 'virtual',
    'override', 'final', 'friend', 'template', 'typename', 'namespace',
    'using', 'new', 'delete', 'this', 'sizeof', 'throw', 'try', 'catch',
    'for', 'while', 'do', 'break', 'continue', 'switch', 'case', 'default',
    'nullptr', 'true', 'false', 'constexpr'
  ]),
  types: new Set([
    'size_t', 'int32_t', 'int64_t', 'uint32_t', 'uint64_t', 'string',
    'vector', 'map', 'set', 'unordered_map', 'unordered_set', 'pair',
    'tuple', 'queue', 'deque', 'stack', 'priority_queue', 'shared_ptr', 'unique_ptr'
  ]),
  builtins: new Set([
    'std', 'cout', 'cin', 'cerr', 'endl', 'printf', 'scanf', 'malloc',
    'free', 'memset', 'memcpy', 'sort', 'max', 'min', 'swap', 'make_pair',
    'make_shared', 'make_unique'
  ]),
  singleLineComment: '//',
  multiLineComment: ['/*', '*/']
};

const SQL_DEF: LanguageDef = {
  keywords: new Set([
    'select', 'from', 'where', 'insert', 'into', 'values', 'update', 'set',
    'delete', 'join', 'inner', 'left', 'right', 'full', 'outer', 'cross',
    'on', 'group', 'by', 'order', 'having', 'limit', 'offset', 'as',
    'distinct', 'union', 'all', 'create', 'table', 'alter', 'drop', 'index',
    'view', 'primary', 'key', 'foreign', 'references', 'not', 'null', 'and',
    'or', 'in', 'between', 'like', 'is', 'exists', 'case', 'when', 'then',
    'else', 'end', 'cast', 'with', 'as', 'asc', 'desc'
  ]),
  types: new Set([
    'int', 'integer', 'bigint', 'smallint', 'tinyint', 'varchar', 'char',
    'text', 'boolean', 'date', 'datetime', 'timestamp', 'float', 'double',
    'decimal', 'numeric', 'blob', 'json'
  ]),
  builtins: new Set([
    'count', 'sum', 'avg', 'min', 'max', 'coalesce', 'now', 'current_date',
    'current_timestamp', 'concat', 'upper', 'lower', 'trim', 'round', 'substr'
  ]),
  singleLineComment: '--'
};

function getLanguageDef(lang?: string): LanguageDef {
  const normalized = (lang || '').toLowerCase().trim();
  if (normalized === 'py' || normalized === 'python') return PYTHON_DEF;
  if (normalized === 'js' || normalized === 'javascript' || normalized === 'ts' || normalized === 'typescript' || normalized === 'jsx' || normalized === 'tsx') return JS_TS_DEF;
  if (normalized === 'bash' || normalized === 'sh' || normalized === 'shell' || normalized === 'zsh') return BASH_DEF;
  if (normalized === 'cpp' || normalized === 'c' || normalized === 'c++' || normalized === 'h' || normalized === 'hpp') return CPP_DEF;
  if (normalized === 'sql') return SQL_DEF;
  return PYTHON_DEF; // Default rich fallback
}

/**
 * Fast universal code tokenizer that outputs HTML with semantic token classes
 */
export function highlightCode(rawCode: string, lang?: string): string {
  if (!rawCode) return '';
  const langDef = getLanguageDef(lang);
  const lines = rawCode.split('\n');

  const highlightedLines = lines.map(line => {
    let result = '';
    let i = 0;
    const len = line.length;

    while (i < len) {
      // Check single line comment
      if (line.startsWith(langDef.singleLineComment, i)) {
        const commentText = line.slice(i);
        result += `<span class="token-comment">${escapeHtml(commentText)}</span>`;
        i = len;
        break;
      }

      // Check strings (double quote, single quote, backtick)
      const ch = line[i];
      if (ch === '"' || ch === "'" || ch === '`') {
        const quote = ch;
        let strContent = quote;
        i++;
        while (i < len) {
          const sc = line[i];
          strContent += sc;
          if (sc === '\\' && i + 1 < len) {
            i++;
            strContent += line[i];
          } else if (sc === quote) {
            i++;
            break;
          }
          i++;
        }
        result += `<span class="token-string">${escapeHtml(strContent)}</span>`;
        continue;
      }

      // Check numbers (hex, floats, integers)
      if (/\d/.test(ch) && (i === 0 || /[\s,([{:+\-*/%=<>&|!]/.test(line[i - 1]))) {
        let numStr = '';
        while (i < len && /[\d.xXa-fA-F_]/.test(line[i])) {
          numStr += line[i];
          i++;
        }
        result += `<span class="token-number">${escapeHtml(numStr)}</span>`;
        continue;
      }

      // Check decorators in Python (e.g. @property)
      if (ch === '@' && (lang === 'python' || lang === 'py')) {
        let decStr = '@';
        i++;
        while (i < len && /[a-zA-Z0-9_.]/.test(line[i])) {
          decStr += line[i];
          i++;
        }
        result += `<span class="token-builtin">${escapeHtml(decStr)}</span>`;
        continue;
      }

      // Check identifiers / words
      if (/[a-zA-Z_$]/.test(ch)) {
        let word = '';
        const wordStart = i;
        while (i < len && /[a-zA-Z0-9_$]/.test(line[i])) {
          word += line[i];
          i++;
        }

        // Check if it's followed by a '(' -> function call or definition
        let nextNonSpace = i;
        while (nextNonSpace < len && /\s/.test(line[nextNonSpace])) {
          nextNonSpace++;
        }
        const isFunctionCall = nextNonSpace < len && line[nextNonSpace] === '(';
        const prevWord = line.slice(Math.max(0, wordStart - 10), wordStart).trim();
        const isFunctionDef = prevWord === 'def' || prevWord === 'function';

        const lowerWord = word.toLowerCase();

        if (langDef.keywords.has(word) || langDef.keywords.has(lowerWord)) {
          result += `<span class="token-keyword">${escapeHtml(word)}</span>`;
        } else if (langDef.types.has(word) || langDef.types.has(lowerWord)) {
          result += `<span class="token-type">${escapeHtml(word)}</span>`;
        } else if (langDef.builtins.has(word) || langDef.builtins.has(lowerWord)) {
          result += `<span class="token-builtin">${escapeHtml(word)}</span>`;
        } else if (isFunctionDef || isFunctionCall) {
          result += `<span class="token-function">${escapeHtml(word)}</span>`;
        } else {
          result += escapeHtml(word);
        }
        continue;
      }

      // Check operators & punctuation
      if (/[+\-*/%=<>!&|^~?:;]/.test(ch)) {
        result += `<span class="token-operator">${escapeHtml(ch)}</span>`;
        i++;
        continue;
      }

      // Regular characters / whitespace
      result += escapeHtml(ch);
      i++;
    }

    return result;
  });

  return highlightedLines.join('\n');
}
