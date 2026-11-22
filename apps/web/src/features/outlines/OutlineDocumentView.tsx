import type { CSSProperties, ReactNode } from 'react';

type NodeData = { type?: string; text?: string; attrs?: Record<string, unknown>; marks?: { type?: string; attrs?: Record<string, unknown> }[]; content?: NodeData[] };

function safeColor(value: unknown) {
  return typeof value === 'string' && /^(#[0-9a-fA-F]{3,8}|(?:rgb|hsl)a?\([\d.,%\s]+\)|[a-zA-Z]{3,20})$/.test(value) ? value : undefined;
}
function fontStyle(attrs?: Record<string, unknown>) {
  return {
    color: safeColor(attrs?.color),
    fontSize: typeof attrs?.fontSize === 'string' && /^\d{1,2}px$/.test(attrs.fontSize) ? attrs.fontSize : undefined,
    fontFamily: typeof attrs?.fontFamily === 'string' && /^[\w\s,'-]{1,90}$/.test(attrs.fontFamily) ? attrs.fontFamily : undefined,
    textAlign: attrs?.textAlign === 'center' || attrs?.textAlign === 'right' || attrs?.textAlign === 'justify' ? attrs.textAlign : undefined,
  } as CSSProperties;
}
function render(node: NodeData, key: number): ReactNode {
  const attrs = node.attrs ?? {};
  const children = node.content?.map((item, index) => render(item, index));
  if (node.type === 'text') {
    let content: ReactNode = node.text ?? '';
    node.marks?.forEach((mark, index) => {
      const a = mark.attrs ?? {};
      switch (mark.type) {
        case 'bold': content = <strong key={index}>{content}</strong>; break;
        case 'italic': content = <em key={index}>{content}</em>; break;
        case 'underline': content = <u key={index}>{content}</u>; break;
        case 'strike': content = <s key={index}>{content}</s>; break;
        case 'code': content = <code key={index}>{content}</code>; break;
        case 'highlight': content = <mark key={index} style={{ backgroundColor: safeColor(a.color) }}>{content}</mark>; break;
        case 'textStyle': content = <span key={index} style={fontStyle(a)}>{content}</span>; break;
        case 'link': {
          const href = typeof a.href === 'string' && /^https?:\/\//i.test(a.href) ? a.href : undefined;
          content = href ? <a key={index} href={href} target="_blank" rel="noopener noreferrer">{content}</a> : content;
          break;
        }
      }
    });
    return <span key={key}>{content}</span>;
  }
  switch (node.type) {
    case 'doc': return <div key={key}>{children}</div>;
    case 'paragraph': return <p key={key} style={fontStyle(attrs)}>{children ?? <br />}</p>;
    case 'heading': { const level = Number(attrs.level); return level === 1 ? <h1 key={key}>{children}</h1> : level === 2 ? <h2 key={key}>{children}</h2> : <h3 key={key}>{children}</h3>; }
    case 'bulletList': return <ul key={key}>{children}</ul>;
    case 'orderedList': return <ol key={key} start={typeof attrs.start === 'number' ? attrs.start : 1}>{children}</ol>;
    case 'listItem': return <li key={key}>{children}</li>;
    case 'taskList': return <ul key={key} className="op-view-tasks">{children}</ul>;
    case 'taskItem': return <li key={key}><input type="checkbox" disabled checked={attrs.checked === true} readOnly /> {children}</li>;
    case 'blockquote': return <blockquote key={key}>{children}</blockquote>;
    case 'codeBlock': return <pre key={key}><code>{children}</code></pre>;
    case 'horizontalRule': return <hr key={key} />;
    case 'hardBreak': return <br key={key} />;
    case 'table': return <div key={key} className="op-table-scroll"><table><tbody>{children}</tbody></table></div>;
    case 'tableRow': return <tr key={key}>{children}</tr>;
    case 'tableHeader': return <th key={key}>{children}</th>;
    case 'tableCell': return <td key={key}>{children}</td>;
    case 'image': {
      const src = typeof attrs.src === 'string' && (/^https?:\/\//i.test(attrs.src) || /^data:image\/(png|jpeg|webp);base64,/i.test(attrs.src)) ? attrs.src : '';
      return src ? <img key={key} src={src} alt={typeof attrs.alt === 'string' ? attrs.alt : 'Imagem do esboço'} loading="lazy" /> : null;
    }
    default: return <section key={key} className="op-sermon-block"><strong>{(node.type ?? 'Bloco').replace(/Block$/, '').replace(/^./, c => c.toUpperCase())}</strong>{children}{!children && typeof attrs.text === 'string' ? <p>{attrs.text}</p> : null}</section>;
  }
}
export function OutlineDocumentView({ content }: { content: unknown }) {
  let doc: NodeData | null = null;
  try {
    const value: unknown = typeof content === 'string' ? JSON.parse(content) : content;
    if (value && typeof value === 'object' && 'type' in value) doc = value as NodeData;
  } catch { /* conteúdo legado em texto simples */ }
  if (!doc) return <div className="op-readable-document">{typeof content === 'string' ? <p style={{ whiteSpace: 'pre-wrap' }}>{content}</p> : <p>Este esboço ainda não tem conteúdo.</p>}</div>;
  return <div className="op-readable-document">{render(doc, 0)}</div>;
}
