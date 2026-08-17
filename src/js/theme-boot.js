(function () {
  var color = "light";
  var style = "app";
  try {
    var d = Object.assign(
      { color: "light", style: "app" },
      JSON.parse(localStorage.getItem("openhat-ios-ui-v1") || "{}")
    );
    color = d.color === "dark" ? "dark" : "light";
    style = ["app", "blackhat", "paper", "terminal"].indexOf(d.style) >= 0 ? d.style : "app";
  } catch (e) {}
  document.documentElement.dataset.color = color;
  document.documentElement.dataset.style = style;
  var overlay = document.getElementById("theme-overlay");
  var base = document.getElementById("theme-base");
  var map = {
    blackhat: "theme-blackhat.css",
    paper: "theme-paper.css",
    terminal: "theme-terminal.css",
  };
  if (overlay && base && map[style]) {
    overlay.href = base.href.replace(/app\.css[^/]*$/, map[style] + "?v=8");
    overlay.disabled = false;
  }
})();
