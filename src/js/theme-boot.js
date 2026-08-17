(function () {
  var color = "system";
  var style = "app";
  try {
    var d = Object.assign(
      { color: "system", style: "app" },
      JSON.parse(localStorage.getItem("openhat-ios-ui-v1") || "{}")
    );
    color = d.color === "light" || d.color === "dark" ? d.color : "system";
    style = ["app", "primer", "paper", "terminal"].indexOf(d.style) >= 0 ? d.style : "app";
  } catch (e) {}
  document.documentElement.dataset.color = color;
  document.documentElement.dataset.style = style;
  var overlay = document.getElementById("theme-overlay");
  var base = document.getElementById("theme-base");
  var map = { primer: "theme-primer.css", paper: "theme-paper.css", terminal: "theme-terminal.css" };
  if (overlay && base && map[style]) {
    overlay.href = base.href.replace(/app\.css[^/]*$/, map[style] + "?v=5");
    overlay.disabled = false;
  }
})();
