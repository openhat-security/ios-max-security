import { wireInstallButton } from "./profile-install.js";
import { wireCopyButton } from "./copy.js";
import { wireThemeControls, hostStatus } from "./theme.js";

wireThemeControls();

const status = hostStatus();
if (status === "phish") document.body.classList.add("host-phish");
if (status === "local") document.body.classList.add("host-local");

const copy = document.querySelector("[data-copy]");
if (copy) wireCopyButton(copy, copy.getAttribute("data-copy"));

if (status !== "phish") {
  document.querySelectorAll("[data-install]").forEach((el) => {
    wireInstallButton(el, el.getAttribute("data-install") || el.getAttribute("href"));
  });
}

const readMore = document.getElementById("read-more");
const introMore = document.getElementById("intro-more");
if (readMore && introMore) {
  readMore.addEventListener("click", (event) => {
    event.preventDefault();
    const open = introMore.hidden;
    introMore.hidden = !open;
    readMore.textContent = open ? "Read less" : "Read more";
    readMore.setAttribute("aria-expanded", String(open));
  });
}
