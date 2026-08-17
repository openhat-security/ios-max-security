export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

export function githubUrlBox(url) {
  const wrap = document.createElement("div");
  wrap.className = "url-box";
  const copy = document.createElement("button");
  copy.type = "button";
  copy.className = "url-copy";
  copy.textContent = "Copy";
  wireCopyButton(copy, url);
  const pre = document.createElement("pre");
  pre.className = "copy-block";
  const code = document.createElement("code");
  const link = document.createElement("a");
  link.href = url;
  link.textContent = url;
  code.append(link);
  pre.append(code);
  wrap.append(copy, pre);
  return wrap;
}

export function wireCopyButton(button, text) {
  const original = button.textContent;
  button.addEventListener("click", async () => {
    const ok = await copyText(text);
    button.textContent = ok ? "Copied" : "Copy failed";
    setTimeout(() => {
      button.textContent = original;
    }, 1600);
  });
}
