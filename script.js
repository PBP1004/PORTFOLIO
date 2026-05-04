(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

  // Footer year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Toast
  const toast = $("#toast");
  let toastTimer = null;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 1400);
  }

  // Clipboard
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied");
      return true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "true");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        if (ok) showToast("Copied");
        return ok;
      } catch {
        showToast("Copy failed");
        return false;
      }
    }
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest?.("[data-copy]");
    if (!btn) return;
    const value = btn.getAttribute("data-copy") || "";
    if (value) copyText(value);
  });

  // Theme
  const themeBtn = $("#themeBtn");
  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
    if (themeBtn) themeBtn.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
  }
  function toggleTheme() {
    const current = document.documentElement.dataset.theme || "dark";
    setTheme(current === "dark" ? "light" : "dark");
    showToast("Theme toggled");
  }
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    setTheme(savedTheme);
  } else {
    const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)")?.matches ?? false;
    setTheme(prefersLight ? "light" : "dark");
  }
  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

  // Terminal typing
  const terminal = $("#terminal");
  const terminalCode = terminal?.querySelector("code");
  function sleep(ms) {
    return new Promise((r) => window.setTimeout(r, ms));
  }
  async function typeInto(el, text, cps = 42) {
    if (!el) return;
    if (prefersReducedMotion) {
      el.textContent += text;
      return;
    }
    const delay = Math.max(6, Math.floor(1000 / cps));
    for (const ch of text) {
      el.textContent += ch;
      await sleep(delay);
    }
  }
  function appendLineBreak() {
    terminalCode?.appendChild(document.createTextNode("\n"));
  }
  function appendText(text) {
    terminalCode?.appendChild(document.createTextNode(text));
  }
  function appendPromptLine() {
    if (!terminalCode) return null;
    const prompt = document.createElement("span");
    prompt.className = "prompt";
    prompt.textContent = "priya@runbook:~$ ";
    terminalCode.appendChild(prompt);
    const cmd = document.createElement("span");
    cmd.className = "cmd";
    terminalCode.appendChild(cmd);
    terminalCode.appendChild(document.createTextNode("\n"));
    return cmd;
  }
  function scrollTerminalToBottom() {
    if (!terminal) return;
    terminal.scrollTop = terminal.scrollHeight;
  }

  async function runTerminalIntro() {
    if (!terminalCode) return;
    terminalCode.textContent = "";

    const steps = [
      { cmd: "whoami", out: "Priya Patel\n\n" },
      { cmd: "echo $ROLE", out: "Cloud & DevOps Engineer\n\n" },
      { cmd: "kubectl config get-contexts -o name", out: "aks-dev\naks-uat\naks-prod\n\n" },
      { cmd: "terraform plan -compact-warnings", out: "Plan: 3 to add, 1 to change, 0 to destroy.\n\n" },
      {
        cmd: "cat skills.yaml | head",
        out:
          "cloud:\n  - Azure: VMs, AKS, Key Vault, Monitor\n  - AWS: EC2, EKS, S3, IAM\n" +
          "iac:\n  - Terraform\n  - Ansible\n\n",
      },
      { cmd: "open /contact", out: "Hint: use Ctrl+K to jump to Contact.\n" },
    ];

    appendText("Initializing runbook session…\n");
    await sleep(prefersReducedMotion ? 0 : 450);
    appendText("Loading profile: priya-patel\n\n");
    await sleep(prefersReducedMotion ? 0 : 350);

    for (const s of steps) {
      const cmdEl = appendPromptLine();
      await typeInto(cmdEl, s.cmd, 48);
      appendText(s.out);
      scrollTerminalToBottom();
      await sleep(prefersReducedMotion ? 0 : 280);
    }

    appendLineBreak();
    appendText("Status: READY  •  Use / or Ctrl+K for commands.\n");
    scrollTerminalToBottom();
  }
  runTerminalIntro();

  // Command palette
  const cmdk = $("#cmdk");
  const cmdkBtn = $("#cmdkBtn");
  const cmdkInput = $("#cmdkInput");
  const cmdkList = $("#cmdkList");

  const commands = [
    { id: "go-about", title: "Go to About", desc: "Jump to summary and principles", run: () => location.hash = "#about" },
    { id: "go-skills", title: "Go to Skills", desc: "Jump to skill matrix", run: () => location.hash = "#skills" },
    { id: "go-exp", title: "Go to Experience", desc: "Jump to pipeline timeline", run: () => location.hash = "#experience" },
    { id: "go-highlights", title: "Go to Highlights", desc: "Jump to engineering highlights", run: () => location.hash = "#highlights" },
    { id: "go-contact", title: "Go to Contact", desc: "Email, phone, LinkedIn", run: () => location.hash = "#contact" },
    { id: "copy-email", title: "Copy Email", desc: "priya.p1498@gmail.com", run: () => copyText("priya.p1498@gmail.com") },
    { id: "copy-phone", title: "Copy Mobile", desc: "+1 (416) 998-1788", run: () => copyText("+1 (416) 998-1788") },
    { id: "open-linkedin", title: "Open LinkedIn", desc: "Open profile in new tab", run: () => window.open("https://www.linkedin.com/in/priya-patel-b6a514233", "_blank", "noreferrer") },
    { id: "toggle-theme", title: "Toggle Theme", desc: "Switch light/dark", run: () => toggleTheme() },
    { id: "replay-terminal", title: "Replay Terminal Intro", desc: "Re-run runbook animation", run: () => runTerminalIntro() },
  ];

  function renderCmdkList(items) {
    if (!cmdkList) return;
    cmdkList.innerHTML = "";
    for (const item of items) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "cmdk-item";
      b.setAttribute("role", "option");
      b.dataset.cmdkId = item.id;

      const t = document.createElement("div");
      t.className = "cmdk-title";
      t.textContent = item.title;
      const d = document.createElement("div");
      d.className = "cmdk-desc";
      d.textContent = item.desc;

      b.appendChild(t);
      b.appendChild(d);
      b.addEventListener("click", () => {
        item.run();
        closeCmdk();
      });
      cmdkList.appendChild(b);
    }
  }

  function openCmdk() {
    if (!cmdk) return;
    renderCmdkList(commands);
    cmdk.showModal();
    if (cmdkInput) {
      cmdkInput.value = "";
      cmdkInput.focus();
    }
  }

  function closeCmdk() {
    if (!cmdk) return;
    if (cmdk.open) cmdk.close();
  }

  if (cmdkBtn) cmdkBtn.addEventListener("click", openCmdk);

  cmdkInput?.addEventListener("input", () => {
    const q = (cmdkInput.value || "").trim().toLowerCase();
    if (!q) return renderCmdkList(commands);
    const filtered = commands.filter((c) => (c.title + " " + c.desc).toLowerCase().includes(q));
    renderCmdkList(filtered.length ? filtered : [{ id: "none", title: "No matches", desc: "Try a different keyword.", run: () => {} }]);
  });

  cmdk?.addEventListener("click", (e) => {
    const rect = cmdk.getBoundingClientRect();
    const inside =
      e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
    if (!inside) closeCmdk();
  });

  // Global shortcuts
  document.addEventListener("keydown", (e) => {
    const tag = (e.target?.tagName || "").toLowerCase();
    const isTyping = tag === "input" || tag === "textarea" || e.target?.isContentEditable;
    if (isTyping) return;

    const key = e.key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && key === "k") {
      e.preventDefault();
      openCmdk();
      return;
    }
    if (key === "/") {
      e.preventDefault();
      openCmdk();
      return;
    }
    if (key === "t") {
      e.preventDefault();
      toggleTheme();
    }
    if (key === "escape") closeCmdk();
  });

  // Canvas network background
  const canvas = $("#net");
  const ctx = canvas?.getContext?.("2d");

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function buildNodes() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const target = Math.max(26, Math.min(64, Math.floor((w * h) / 22000)));
    const nodes = [];
    for (let i = 0; i < target; i++) {
      nodes.push({
        x: rand(0, w),
        y: rand(0, h),
        vx: rand(-0.35, 0.35),
        vy: rand(-0.28, 0.28),
        r: rand(1.2, 2.1),
        seed: Math.random(),
      });
    }
    return nodes;
  }

  function currentAccentRgb() {
    const s = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
    // parse hex like #46d3ff
    const hex = s.startsWith("#") ? s.slice(1) : null;
    if (!hex || (hex.length !== 6 && hex.length !== 3)) return { r: 70, g: 211, b: 255 };
    const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
    const n = parseInt(full, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  let nodes = [];
  let raf = 0;

  function drawNetwork() {
    if (!canvas || !ctx) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    const { r, g, b } = currentAccentRgb();
    const linkDist = Math.max(120, Math.min(190, Math.floor(Math.min(w, h) / 5)));
    const linkDist2 = linkDist * linkDist;

    // update
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -30) n.x = w + 30;
      if (n.x > w + 30) n.x = -30;
      if (n.y < -30) n.y = h + 30;
      if (n.y > h + 30) n.y = -30;
    }

    // links
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const c = nodes[j];
        const dx = a.x - c.x;
        const dy = a.y - c.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > linkDist2) continue;
        const t = 1 - d2 / linkDist2;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.15 * t})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(c.x, c.y);
        ctx.stroke();
      }
    }

    // nodes
    for (const n of nodes) {
      const pulse = 0.7 + 0.3 * Math.sin((performance.now() / 900) + n.seed * 8);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.22 + 0.14 * pulse})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    raf = window.requestAnimationFrame(drawNetwork);
  }

  function startNetwork() {
    if (!canvas || !ctx) return;
    resizeCanvas();
    nodes = buildNodes();
    if (prefersReducedMotion) {
      // One static render
      drawNetwork();
      window.cancelAnimationFrame(raf);
      return;
    }
    window.cancelAnimationFrame(raf);
    raf = window.requestAnimationFrame(drawNetwork);
  }

  window.addEventListener("resize", () => {
    resizeCanvas();
    nodes = buildNodes();
  });

  startNetwork();

  // Scroll reveal animations
  const animated = $$("[data-animate]");
  if ("IntersectionObserver" in window && animated.length) {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      },
      { threshold: 0.16 }
    );
    for (const el of animated) obs.observe(el);
  } else {
    for (const el of animated) el.classList.add("is-visible");
  }

  // Cursor-following glow
  const cursorGlow = $("#cursorGlow");
  let glowFrame = 0;
  let glowVisible = false;
  let glowTarget = null;

  function updateGlow() {
    glowFrame = 0;
    if (!cursorGlow || !glowTarget) return;
    const { x, y } = glowTarget;
    cursorGlow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    if (!glowVisible) {
      cursorGlow.style.opacity = "1";
      glowVisible = true;
    }
  }

  document.addEventListener("pointermove", (e) => {
    glowTarget = { x: e.clientX, y: e.clientY };
    if (!glowFrame) {
      glowFrame = window.requestAnimationFrame(updateGlow);
    }
  });

  document.addEventListener("pointerleave", () => {
    if (!cursorGlow) return;
    cursorGlow.style.opacity = "0";
    glowVisible = false;
  });
})();
