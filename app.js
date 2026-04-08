(() => {
  "use strict";

  const POSITIONS_URL = "./data/positions.json";
  const PAGE_SIZE = 5;

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (value == null) continue;
      if (key === "class") node.className = String(value);
      else if (key === "text") node.textContent = String(value);
      else node.setAttribute(key, String(value));
    }
    for (const child of children) node.append(child);
    return node;
  }

  function formatDate(value) {
    if (!value) return "";
    if (value.toLowerCase?.() === "present") return "Present";
    // Expect YYYY-MM
    const [y, m] = value.split("-");
    if (!y || !m) return value;
    const date = new Date(Number(y), Number(m) - 1, 1);
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
    }).format(date);
  }

  function renderPositions(container, positions, visibleCount) {
    container.replaceChildren();

    if (!Array.isArray(positions) || positions.length === 0) {
      container.append(
        el("p", { class: "muted", text: "No positions to show yet." }),
      );
      return;
    }

    const list = el("ol", { class: "positionList" });

    positions.slice(0, visibleCount).forEach((p) => {
      const title = String(p?.title ?? "").trim();
      const company = String(p?.company ?? "").trim();
      const location = String(p?.location ?? "").trim();
      const start = String(p?.start ?? "").trim();
      const end = String(p?.end ?? "").trim();
      const highlights = Array.isArray(p?.highlights) ? p.highlights : [];

      const dateText = [formatDate(start), formatDate(end)]
        .filter(Boolean)
        .join(" — ");

      const headerBits = [];
      if (title) headerBits.push(title);
      if (company) headerBits.push(company);

      const li = el("li", { class: "positionItem" }, [
        el("div", { class: "positionTop" }, [
          el("div", {
            class: "positionRole",
            text: headerBits.join(" · ") || "Position",
          }),
          dateText
            ? el("div", { class: "positionDates", text: dateText })
            : el("div", { class: "positionDates" }),
        ]),
        location
          ? el("div", { class: "positionMeta", text: location })
          : el("div", { class: "positionMeta" }),
      ]);

      if (highlights.length > 0) {
        const ul = el(
          "ul",
          { class: "highlights" },
          highlights
            .map((h) => String(h ?? "").trim())
            .filter(Boolean)
            .map((h) => el("li", { text: h })),
        );
        li.append(ul);
      }

      list.append(li);
    });

    container.append(list);
  }

  async function load() {
    const year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());

    const container = document.getElementById("positions");
    if (!container) return;

    const loadMore = document.getElementById("loadMore");

    try {
      const res = await fetch(POSITIONS_URL, { cache: "no-cache" });
      if (!res.ok) throw new Error(`Failed to load positions (${res.status})`);
      const data = await res.json();
      const positions = Array.isArray(data) ? data : [];

      let visibleCount = Math.min(PAGE_SIZE, positions.length);
      renderPositions(container, positions, visibleCount);

      function syncButton() {
        if (!loadMore) return;
        const hasMore = visibleCount < positions.length;
        loadMore.hidden = !hasMore;
        loadMore.textContent = hasMore ? "Show more" : "Show more";
      }

      syncButton();
      loadMore?.addEventListener("click", (e) => {
        e.preventDefault();
        visibleCount = Math.min(visibleCount + PAGE_SIZE, positions.length);
        renderPositions(container, positions, visibleCount);
        syncButton();
      });
    } catch (err) {
      container.replaceChildren(
        el("p", { class: "muted", text: "Positions unavailable right now." }),
      );
      if (loadMore) loadMore.hidden = true;
      // Keep a console signal for debugging without impacting UI.
      console.warn(err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load, { once: true });
  } else {
    load();
  }
})();
