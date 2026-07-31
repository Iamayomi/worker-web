import { common, createLowlight } from "lowlight";

type LowlightNode = {
  type?: string;
  value?: string;
  properties?: {
    className?: string[];
  };
  children?: LowlightNode[];
};

const lowlight = createLowlight({
  bash: common.bash,
  css: common.css,
  javascript: common.javascript,
  json: common.json,
  plaintext: common.plaintext,
  typescript: common.typescript,
  xml: common.xml,
});

lowlight.registerAlias({
  javascript: ["js", "jsx"],
  typescript: ["ts", "tsx"],
  xml: ["html"],
});

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderLowlightNode(node: LowlightNode): string {
  if (node.type === "text") {
    return escapeHtml(node.value ?? "");
  }

  const children = node.children?.map(renderLowlightNode).join("") ?? "";
  const className = node.properties?.className?.join(" ");

  if (!className) {
    return children;
  }

  return `<span class="${escapeHtml(className)}">${children}</span>`;
}

function getLanguageFromCodeElement(codeElement: Element) {
  const languageClass = Array.from(codeElement.classList).find((className) =>
    className.startsWith("language-")
  );

  return languageClass?.replace("language-", "") ?? null;
}

export function highlightCodeBlocksInHtml(content: string) {
  if (typeof DOMParser === "undefined") return content;

  const document = new DOMParser().parseFromString(
    `<div>${content}</div>`,
    "text/html"
  );
  const wrapper = document.body.firstElementChild;

  if (!wrapper) return content;

  wrapper.querySelectorAll("pre code").forEach((codeElement) => {
    const code = codeElement.textContent ?? "";
    const language = getLanguageFromCodeElement(codeElement);

    try {
      const highlighted =
        language && lowlight.registered(language)
          ? lowlight.highlight(language, code)
          : lowlight.highlightAuto(code);

      codeElement.innerHTML = highlighted.children
        .map((node) => renderLowlightNode(node as LowlightNode))
        .join("");
      codeElement.classList.add("hljs");

      if (!language && highlighted.data?.language) {
        codeElement.classList.add(`language-${highlighted.data.language}`);
      }
    } catch {
      codeElement.textContent = code;
    }
  });

  return wrapper.innerHTML;
}
