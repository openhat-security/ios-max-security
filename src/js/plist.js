function kids(el) {
  return [...el.children].filter((n) => n.nodeType === 1);
}

function parseValue(node) {
  const tag = node.tagName;
  if (tag === "string" || tag === "data") return node.textContent;
  if (tag === "integer" || tag === "real") return Number(node.textContent);
  if (tag === "true") return true;
  if (tag === "false") return false;
  if (tag === "date") return node.textContent;
  if (tag === "array") return kids(node).map(parseValue);
  if (tag === "dict") {
    const out = {};
    const items = kids(node);
    for (let i = 0; i < items.length; i += 2) {
      if (items[i].tagName !== "key" || !items[i + 1]) continue;
      out[items[i].textContent] = parseValue(items[i + 1]);
    }
    return out;
  }
  return node.textContent;
}

export function parsePlist(xml) {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  if (doc.querySelector("parsererror")) {
    throw new Error("This file is not readable XML.");
  }
  const root = doc.querySelector("plist > dict");
  if (!root) throw new Error("This file is not an Apple configuration profile.");
  return parseValue(root);
}
