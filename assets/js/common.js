const STORAGE_KEYS = {
  favorites: "sugu-tools:favorites",
  recent: "sugu-tools:recent"
};

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("コピーしました");
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    showToast("コピーしました");
  }
}

function copyToClipboard(elementId) {
  const element = document.getElementById(elementId);
  copyText(element ? (element.value ?? element.textContent) : "");
}

async function pasteFromClipboard(elementId) {
  try {
    const text = await navigator.clipboard.readText();
    const element = document.getElementById(elementId);
    if (element) {
      element.value = text;
      element.dispatchEvent(new Event("input", { bubbles: true }));
    }
  } catch {
    showToast("クリップボードを読めませんでした");
  }
}

function clearAll(root = document) {
  root.querySelectorAll("textarea, input[type=text], input[type=search], input[type=number]").forEach((field) => {
    if (!field.dataset.keep) field.value = "";
  });
  root.querySelectorAll("[data-output]").forEach((node) => { node.textContent = ""; });
  root.dispatchEvent(new Event("input", { bubbles: true }));
}

function swapInputOutput(inputId = "input-text", outputId = "output-text") {
  const input = document.getElementById(inputId);
  const output = document.getElementById(outputId);
  if (!input || !output) return;
  const next = output.value || output.textContent;
  output.value = input.value;
  input.value = next;
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function downloadText(filename, text, type = "text/plain") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

function readStoredList(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writeStoredList(key, values) {
  localStorage.setItem(key, JSON.stringify([...new Set(values)].slice(0, 30)));
}

function getFavorites() {
  return readStoredList(STORAGE_KEYS.favorites);
}

function getRecentTools() {
  return readStoredList(STORAGE_KEYS.recent);
}

function getToolById(id) {
  return typeof TOOL_REGISTRY === "undefined" ? undefined : TOOL_REGISTRY.find((tool) => tool.id === id);
}

function getCategoryById(id) {
  return typeof CATEGORIES === "undefined" ? undefined : CATEGORIES.find((category) => category.id === id);
}

function isFavorite(id) {
  return getFavorites().includes(id);
}

function toggleFavorite(id) {
  if (!id) return;
  const favorites = getFavorites();
  const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [id, ...favorites];
  writeStoredList(STORAGE_KEYS.favorites, next);
  updateFavoriteButtons();
  updateStoredCounts();
  showToast(next.includes(id) ? "お気に入りに追加しました" : "お気に入りから外しました");
}

function trackToolUse(id) {
  if (!getToolById(id)) return;
  const recent = getRecentTools().filter((item) => item !== id);
  writeStoredList(STORAGE_KEYS.recent, [id, ...recent].slice(0, 12));
  updateStoredCounts();
}

function updateStoredCounts() {
  const favoriteCount = document.getElementById("favorite-count");
  const recentCount = document.getElementById("recent-count");
  if (favoriteCount) favoriteCount.textContent = String(getFavorites().filter(getToolById).length);
  if (recentCount) recentCount.textContent = String(getRecentTools().filter(getToolById).length);
}

function updateFavoriteButtons() {
  const favorites = getFavorites();
  document.querySelectorAll("[data-favorite-id]").forEach((button) => {
    const active = favorites.includes(button.dataset.favoriteId);
    button.setAttribute("aria-pressed", active ? "true" : "false");
    if (button.classList.contains("favorite-star")) {
      button.textContent = active ? "★" : "☆";
      button.setAttribute("aria-label", active ? "お気に入りから外す" : "お気に入りに追加");
      button.title = active ? "お気に入りから外す" : "お気に入りに追加";
    } else {
      const mark = button.querySelector("span");
      if (mark) mark.textContent = active ? "★" : "☆";
    }
  });
}

function bindFavoriteButtons(afterToggle) {
  document.querySelectorAll("[data-favorite-id]").forEach((button) => {
    if (button.dataset.favoriteBound) return;
    button.dataset.favoriteBound = "true";
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleFavorite(button.dataset.favoriteId);
      if (typeof afterToggle === "function") afterToggle();
    });
  });
  updateFavoriteButtons();
}

function initToolChrome(id) {
  bindFavoriteButtons();
  trackToolUse(id);
}

function initHome() {
  const directory = document.getElementById("tool-directory");
  const search = document.getElementById("search-tools");
  const stickySearch = document.getElementById("sticky-search-tools");
  const mobileSearchButton = document.getElementById("mobile-search-button");
  const tabs = [...document.querySelectorAll("[data-filter]")];
  const resultCount = document.getElementById("result-count");
  const commandHub = document.querySelector(".command-hub");
  let active = "all";

  function localUrl(tool) {
    return tool.url;
  }

  function renderToolRow(tool, category, compact) {
    return '<div class="tool-row' + (compact ? " is-compact" : "") + '" data-tool-id="' + escapeHtml(tool.id) + '" data-category="' + escapeHtml(tool.category) + '" data-tags="' + escapeHtml(tool.tags.join(",")) + '" data-name="' + escapeHtml(tool.name) + '">' +
      '<button class="favorite-star" type="button" data-favorite-id="' + escapeHtml(tool.id) + '" aria-pressed="false">☆</button>' +
      '<a href="' + localUrl(tool) + '" class="row-link" data-track-tool="' + escapeHtml(tool.id) + '">' +
        '<span class="row-icon" style="--accent:' + category.color + '">' + escapeHtml(tool.icon) + '</span>' +
        '<span class="row-main"><span class="row-title">' + escapeHtml(tool.name) + '</span><span class="row-desc">' + escapeHtml(tool.description) + '</span></span>' +
        '<span class="row-meta">' + escapeHtml(category.name) + '</span>' +
        '<span class="row-arrow">→</span>' +
      '</a>' +
    '</div>';
  }

  function renderCollectionBlock(group, title, ids, emptyText) {
    const rows = ids.map(getToolById).filter(Boolean).map((tool) => {
      const category = getCategoryById(tool.category) || CATEGORIES[0];
      return renderToolRow(tool, category, true);
    });
    return '<section class="tool-group" data-group="' + group + '">' +
      '<div class="section-heading"><h2>' + escapeHtml(title) + '</h2><span>' + rows.length + ' tools</span></div>' +
      (rows.length ? '<div class="tool-list">' + rows.join("") + '</div>' : '<div class="result-panel tool-note">' + escapeHtml(emptyText) + '</div>') +
    '</section>';
  }

  function renderHomeDirectory() {
    if (!directory || typeof TOOL_REGISTRY === "undefined" || typeof CATEGORIES === "undefined") return;
    const favorites = getFavorites().filter(getToolById);
    const recent = getRecentTools().filter(getToolById);
    const popular = TOOL_REGISTRY.filter(function(tool) { return tool.popular; }).map((tool) => tool.id);
    const favoriteBlock = renderCollectionBlock("favorites", "お気に入り", favorites, "星を押すと、よく使うツールをここに固定できます。");
    const recentBlock = renderCollectionBlock("recent", "最近使った", recent, "ツールを開くと、ここに最近使った順で表示されます。");
    const popularBlock = renderCollectionBlock("popular", "よく使うツール", popular, "よく使うツールを準備中です。");
    const categoryBlocks = CATEGORIES.map(function(category) {
      const tools = TOOL_REGISTRY.filter((tool) => tool.category === category.id);
      return '<section class="tool-group category-section" id="' + category.id + '" data-group="' + category.id + '">' +
        '<div class="section-heading"><h2>' + escapeHtml(category.name) + '</h2><span>' + tools.length + ' tools</span></div>' +
        '<div class="tool-list">' + tools.map(function(tool) { return renderToolRow(tool, category, false); }).join("") + '</div>' +
      '</section>';
    }).join("");
    directory.innerHTML = favoriteBlock + recentBlock + popularBlock + categoryBlocks;
    bindFavoriteButtons(() => {
      renderHomeDirectory();
      filter();
    });
    document.querySelectorAll("[data-track-tool]").forEach((link) => {
      link.addEventListener("click", () => trackToolUse(link.dataset.trackTool));
    });
    updateStoredCounts();
  }

  function visibleRows() {
    return [...document.querySelectorAll(".tool-row")].filter((row) => row.style.display !== "none");
  }

  function updateSelection() {
    document.querySelectorAll(".tool-row.is-selected").forEach((row) => row.classList.remove("is-selected"));
    const first = visibleRows().find((row) => row.querySelector(".row-link"));
    if (first && (document.activeElement === search || document.activeElement === stickySearch)) first.classList.add("is-selected");
  }

  function filter() {
    const query = ((search && search.value) || "").trim().toLowerCase();
    let visibleUnique = new Set();
    document.querySelectorAll(".tool-row").forEach((row) => {
      const group = row.closest(".tool-group")?.dataset.group || "";
      const haystack = [row.dataset.name, row.dataset.tags, row.textContent].join(" ").toLowerCase();
      const groupMatch = active === "all" ? true : active === group || row.dataset.category === active;
      const match = groupMatch && haystack.includes(query);
      row.style.display = match ? "" : "none";
      if (match && (active === "favorites" || active === "recent" || !row.classList.contains("is-compact"))) visibleUnique.add(row.dataset.toolId);
    });
    document.querySelectorAll(".tool-group").forEach((group) => {
      const hasVisibleRows = [...group.querySelectorAll(".tool-row")].some((row) => row.style.display !== "none");
      const emptyPanel = group.querySelector(".result-panel");
      group.style.display = hasVisibleRows || (emptyPanel && (active === "all" || active === group.dataset.group)) ? "" : "none";
    });
    if (resultCount) resultCount.textContent = visibleUnique.size + " tools";
    updateSelection();
  }

  function syncSearch(source, target) {
    if (!source || !target) return;
    target.value = source.value;
  }

  renderHomeDirectory();
  filter();

  if (search) {
    search.addEventListener("input", () => {
      syncSearch(search, stickySearch);
      filter();
    });
    search.addEventListener("focus", () => {
      commandHub?.classList.add("is-commanding");
      updateSelection();
    });
    search.addEventListener("blur", () => setTimeout(() => commandHub?.classList.remove("is-commanding"), 140));
  }
  if (stickySearch) {
    stickySearch.addEventListener("input", () => {
      syncSearch(stickySearch, search);
      filter();
    });
    stickySearch.addEventListener("focus", updateSelection);
  }
  if (mobileSearchButton && search) {
    mobileSearchButton.addEventListener("click", () => {
      search.scrollIntoView({ block: "center", behavior: "smooth" });
      setTimeout(() => { search.focus(); search.select(); }, 220);
    });
  }
  window.addEventListener("scroll", () => {
    if (!commandHub) return;
    const threshold = commandHub.offsetTop + commandHub.offsetHeight - 32;
    document.body.classList.toggle("search-docked", window.scrollY > threshold);
  }, { passive: true });
  window.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      const target = document.body.classList.contains("search-docked") && stickySearch ? stickySearch : search;
      target?.focus();
      target?.select();
      commandHub?.classList.add("is-commanding");
      updateSelection();
    }
    if (event.key === "Enter" && (document.activeElement === search || document.activeElement === stickySearch)) {
      const firstVisible = visibleRows().find((row) => row.querySelector(".row-link"));
      const link = firstVisible?.querySelector(".row-link");
      if (link) link.click();
    }
  });
  tabs.forEach((tab) => tab.addEventListener("click", () => {
    active = tab.dataset.filter;
    tabs.forEach((item) => item.classList.toggle("active", item === tab));
    filter();
  }));
  if (location.hash) {
    const hash = location.hash.slice(1);
    const matched = tabs.find((tab) => tab.dataset.filter === hash);
    if (matched) matched.click();
  }
}
