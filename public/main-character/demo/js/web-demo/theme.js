// Apply a pinned theme before first paint, so a choice that differs from the
  // OS setting doesn't flash the wrong palette for the moment before the app's
  // modules load. No pin (or "auto") leaves prefers-color-scheme in charge.
  try {
    var _t = localStorage.getItem('rag_theme');
    if (_t === 'light' || _t === 'dark') document.documentElement.dataset.theme = _t;
  } catch (e) {}
