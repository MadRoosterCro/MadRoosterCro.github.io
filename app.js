(() => {
  "use strict";

  const POSITIONS_URL = "./data/positions.json";
  const REVEAL_STAGGER_MS = 55;
  const REVEAL_STAGGER_CAP = 6;

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

  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // "2024-06" -> "Jun 2024"; "Present"/"Now" -> "Present".
  function formatMonth(value) {
    const v = String(value ?? "").trim();
    if (!v) return "";
    if (/^(present|now)$/i.test(v)) return "Present";
    const [year, month] = v.split("-");
    const mi = Number(month);
    if (!year || !mi || mi < 1 || mi > 12) return v;
    return `${MONTHS[mi - 1]} ${year}`;
  }

  // A single client engagement (or, for direct jobs, just a description + stack).
  function renderEngagement(item, headless) {
    const client = String(item?.client ?? "").trim();
    const title = String(item?.title ?? "").trim();
    const location = String(item?.location ?? "").trim();
    const description = String(item?.description ?? "").trim();
    const stack = Array.isArray(item?.stack)
      ? item.stack.map((s) => String(s ?? "").trim()).filter(Boolean)
      : [];

    const node = el("div", { class: "xpEng" });

    if (!headless && (client || title || location)) {
      const head = el("div", { class: "xpEngHead" });
      if (client) head.append(el("span", { class: "xpClient", text: client }));
      const meta = [title, location].filter(Boolean).join(" · ");
      if (meta) {
        head.append(
          el("span", {
            class: "xpEngMeta",
            text: (client ? " — " : "") + meta,
          }),
        );
      }
      node.append(head);
    }

    if (description) {
      node.append(el("div", { class: "xpEngDesc", text: description }));
    }
    if (stack.length > 0) {
      node.append(el("div", { class: "xpEngStack", text: stack.join(" · ") }));
    }

    return node;
  }

  function renderPositions(container, positions) {
    container.replaceChildren();

    if (!Array.isArray(positions) || positions.length === 0) {
      container.append(
        el("p", { class: "muted", text: "No positions to show yet." }),
      );
      return;
    }

    for (const job of positions) {
      const employer = String(job?.employer ?? "").trim();
      const role = String(job?.role ?? "").trim();
      const note = String(job?.note ?? "").trim();
      const range = [formatMonth(job?.start), formatMonth(job?.end)]
        .filter(Boolean)
        .join(" — ");

      const head = el("div", { class: "xpGroupHead" }, [
        el("div", { class: "xpHeadTop" }, [
          el("div", { class: "xpRole", text: role || employer || "Role" }),
          el("div", { class: "xpDate", text: range }),
        ]),
      ]);
      const employerLine = [employer, note].filter(Boolean).join(" · ");
      if (employerLine) {
        head.append(el("div", { class: "xpEmployer", text: employerLine }));
      }

      const group = el("div", { class: "xpGroup", "data-reveal": "" }, [head]);

      const engagements = Array.isArray(job?.engagements)
        ? job.engagements
        : [];
      const body = el("div", { class: "xpEngagements" });
      if (engagements.length > 0) {
        for (const e of engagements) body.append(renderEngagement(e, false));
      } else {
        body.append(renderEngagement(job, true));
      }
      if (body.children.length > 0) group.append(body);

      container.append(group);
    }
  }

  // Reveal-on-scroll. Returns an observe(nodes) function so dynamically added
  // rows can join after the positions fetch resolves. Falls back to revealing
  // everything immediately when IntersectionObserver is unavailable.
  function createRevealer() {
    if (!("IntersectionObserver" in window)) {
      return (nodes) => nodes.forEach((n) => n.classList.add("isVisible"));
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const node = entry.target;
          const index = Number(node.dataset.revealIndex || 0);
          node.style.transitionDelay =
            Math.min(index, REVEAL_STAGGER_CAP) * REVEAL_STAGGER_MS + "ms";
          node.classList.add("isVisible");
          obs.unobserve(node);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    return (nodes) => {
      nodes.forEach((node, i) => {
        if (node.dataset.revealBound) return;
        node.dataset.revealBound = "1";
        node.dataset.revealIndex = String(i);
        observer.observe(node);
      });
    };
  }

  async function load() {
    const year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());

    const observe = createRevealer();
    observe(Array.from(document.querySelectorAll("[data-reveal]")));

    const container = document.getElementById("positions");
    if (!container) return;

    try {
      const res = await fetch(POSITIONS_URL, { cache: "no-cache" });
      if (!res.ok) throw new Error(`Failed to load positions (${res.status})`);
      const data = await res.json();
      renderPositions(container, Array.isArray(data) ? data : []);
      observe(Array.from(container.querySelectorAll("[data-reveal]")));
    } catch (err) {
      container.replaceChildren(
        el("p", { class: "muted", text: "Positions unavailable right now." }),
      );
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
