// Opens Shorts links in the regular YouTube player:
// /shorts/VIDEOID -> /watch?v=VIDEOID, bare /shorts -> home page.

function watchPathFor(url) {
  const match = url.pathname.match(/^\/shorts(?:\/([\w-]+))?\/?$/);
  if (!match) return null;
  return match[1] ? `/watch?v=${match[1]}` : "/";
}

function redirectIfShorts() {
  const target = watchPathFor(location);
  if (target) location.replace(target);
}

redirectIfShorts();

// A plain click on a Shorts link goes straight to the regular player before
// YouTube can open the Shorts view. Ctrl/Cmd/middle clicks pass through:
// the new tab is redirected by the check above when it loads.
window.addEventListener(
  "click",
  (event) => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest?.("a[href]");
    if (!link || !link.hostname.endsWith("youtube.com")) return;
    const target = watchPathFor(link);
    if (!target) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    location.assign(target);
  },
  true
);

// The "Shorts" filter chip on the search page has no distinguishing attribute,
// so it is hidden by its text. YouTube recycles chips, so every other chip
// is made visible again.
function hideShortsChips() {
  for (const chip of document.querySelectorAll("yt-chip-cloud-chip-renderer, ytm-chip-cloud-chip-renderer")) {
    if (chip.textContent.trim() === "Shorts") chip.style.setProperty("display", "none", "important");
    else chip.style.removeProperty("display");
  }
}

// YouTube navigates without full page loads, so the URL is polled.
let lastHref = location.href;
setInterval(() => {
  hideShortsChips();
  if (location.href === lastHref) return;
  lastHref = location.href;
  redirectIfShorts();
}, 300);
