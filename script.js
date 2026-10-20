/* ============================================================
   Portal Escolar Abel - JavaScript puro
   Funcionalidades:
   - Menu mobile acessível
   - Navegação entre seções com destaque do link ativo
   - Filtro de avisos por categoria
   - Validação do formulário de contato (demonstrativo)
   - Ano atual no rodapé, barra de progresso e botão "voltar ao topo"
   - Registro do Service Worker (PWA)
   ============================================================ */

(function () {
  "use strict";

  /* ----------------------------------------------------------
     1. Menu mobile
     ---------------------------------------------------------- */
  function initMenuMobile() {
    const toggle = document.getElementById("navToggle");
    const nav = document.getElementById("menuPrincipal");
    if (!toggle || !nav) return;

    const closeMenu = () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menu de navegação");
    };

    const openMenu = () => {
      nav.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Fechar menu de navegação");
    };

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      isOpen ? closeMenu() : openMenu();
    });

    // Fecha ao clicar em um link do menu
    nav.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    // Fecha ao clicar em links da navegação inferior
    document.querySelectorAll(".bottom-nav-link").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    // Fecha com a tecla Escape
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    // Fecha ao clicar fora do menu
    document.addEventListener("click", (event) => {
      if (
        nav.classList.contains("is-open") &&
        !nav.contains(event.target) &&
        !toggle.contains(event.target)
      ) {
        closeMenu();
      }
    });

    // Reinicia o menu ao redimensionar para desktop
    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) closeMenu();
    });
  }

  /* ----------------------------------------------------------
     2. Navegação: link ativo + rolagem suave entre as seções
     ---------------------------------------------------------- */
  function initNavegacaoSecoes() {
    const desktopLinks = Array.from(document.querySelectorAll(".nav-link[href^='#']"));
    const bottomLinks = Array.from(document.querySelectorAll(".bottom-nav-link[href^='#']"));
    const links = [...desktopLinks, ...bottomLinks];
    const views = Array.from(document.querySelectorAll(".view[data-view]"));
    if (!links.length) return;

    const getViewIdFromHash = (hash) => {
      if (!hash) return "inicio";
      const id = hash.replace("#", "");
      return id || "inicio";
    };

    let currentViewId = getViewIdFromHash(window.location.hash);
    let isTransitioning = false;

    const activateView = (id, direction = "forward") => {
      if (isTransitioning) return;
      const targetView = views.find((v) => v.dataset.view === id || v.id === id) || views[0];
      const currentView = views.find((v) => v.classList.contains("is-active")) || targetView;

      if (targetView === currentView || !targetView) {
        currentViewId = id;
        [...desktopLinks, ...bottomLinks].forEach((link) => {
          const href = link.getAttribute("href") || "";
          const isActive = href === `#${id}`;
          link.classList.toggle("is-active", isActive);
          if (isActive) {
            link.setAttribute("aria-current", "page");
          } else {
            link.removeAttribute("aria-current");
          }
        });
        return;
      }

      const isStandalone = document.documentElement.classList.contains("app-standalone");

      if (isStandalone && window.innerWidth <= 760) {
        isTransitioning = true;
        const dir = direction === "backward" ? "backward" : "forward";

        currentView.classList.add("is-leaving");
        currentView.classList.remove("is-active");
        currentView.dataset.leaveDir = dir;

        targetView.classList.remove("is-leaving");
        targetView.dataset.enterDir = dir;
        targetView.classList.add("is-entering");

        void targetView.offsetWidth;

        targetView.classList.add("is-active");
        targetView.classList.remove("is-entering");

        setTimeout(() => {
          currentView.classList.remove("is-leaving");
          targetView.classList.remove("is-entering");
          delete currentView.dataset.leaveDir;
          delete targetView.dataset.enterDir;
          isTransitioning = false;
        }, 220);
      } else {
        views.forEach((v) => v.classList.toggle("is-active", v === targetView));
      }

      currentViewId = id;

      [...desktopLinks, ...bottomLinks].forEach((link) => {
        const href = link.getAttribute("href") || "";
        const isActive = href === `#${id}`;
        link.classList.toggle("is-active", isActive);
        if (isActive) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });

      if (!isStandalone && window.innerWidth <= 760) {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    };

    const viewOrder = views.map((v) => v.dataset.view || v.id);

    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");
        if (!href || !href.startsWith("#")) return;
        const id = href.replace("#", "") || "inicio";
        event.preventDefault();

        const currentIndex = viewOrder.indexOf(currentViewId);
        const nextIndex = viewOrder.indexOf(id);
        const direction = nextIndex >= currentIndex ? "forward" : "backward";

        activateView(id, direction);
        history.replaceState(null, "", href);
      });
    });

    window.addEventListener("hashchange", () => {
      const id = getViewIdFromHash(window.location.hash);
      const currentIndex = viewOrder.indexOf(currentViewId);
      const nextIndex = viewOrder.indexOf(id);
      const direction = nextIndex >= currentIndex ? "forward" : "backward";
      activateView(id, direction);
    });

    activateView(currentViewId);

    let lastWidth = window.innerWidth;
    window.addEventListener("resize", () => {
      const w = window.innerWidth;
      if (w > 760 && lastWidth <= 760) {
        views.forEach((v) => {
          v.classList.remove("is-leaving", "is-entering");
          v.classList.add("is-active");
        });
      }
      lastWidth = w;
    });
  }

  /* ----------------------------------------------------------
     3. Filtro de avisos por categoria
     ---------------------------------------------------------- */
  function initFiltroAvisos() {
    const botoes = Array.from(document.querySelectorAll(".filter-btn"));
    const avisos = Array.from(document.querySelectorAll(".notice-card"));
    const resultado = document.getElementById("resultadoFiltro");
    const vazio = document.getElementById("avisoVazio");
    if (!botoes.length || !avisos.length) return;

    const rotulos = {
      todos: "avisos",
      academico: "avisos acadêmicos",
      eventos: "avisos de eventos",
      administrativo: "avisos administrativos",
      urgente: "avisos urgentes"
    };

    function aplicarFiltro(categoria) {
      let visiveis = 0;

      avisos.forEach((aviso) => {
        const corresponde =
          categoria === "todos" || aviso.dataset.categoria === categoria;

        aviso.classList.toggle("is-hidden", !corresponde);
        if (corresponde) {
          visiveis += 1;
          // Reinicia a animação de entrada
          aviso.classList.remove("is-entering");
          void aviso.offsetWidth;
          aviso.classList.add("is-entering");
        }
      });

      // Atualiza estado dos botões
      botoes.forEach((botao) => {
        const ativo = botao.dataset.filter === categoria;
        botao.classList.toggle("is-active", ativo);
        botao.setAttribute("aria-pressed", String(ativo));
      });

      // Mensagem acessível de resultado
      if (resultado) {
        resultado.textContent =
          categoria === "todos"
            ? `Mostrando todos os ${rotulos.todos} (${visiveis}).`
            : `Mostrando ${visiveis} ${rotulos[categoria] || "avisos"}.`;
      }

      if (vazio) vazio.hidden = visiveis !== 0;
    }

    botoes.forEach((botao) => {
      botao.addEventListener("click", () => aplicarFiltro(botao.dataset.filter));
    });

    aplicarFiltro("todos");
  }

  /* ----------------------------------------------------------
     4. Formulário de contato (validação demonstrativa)
     ---------------------------------------------------------- */
  function initFormularioContato() {
    const form = document.getElementById("formContato");
    if (!form) return;

    const feedback = document.getElementById("formFeedback");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function mostrarErro(campo, mensagem) {
      const aviso = form.querySelector(`[data-error-for="${campo.id}"]`);
      if (aviso) aviso.textContent = mensagem;
      if (mensagem) {
        campo.setAttribute("aria-invalid", "true");
      } else {
        campo.removeAttribute("aria-invalid");
      }
    }

    function validarCampo(campo) {
      const valor = campo.value.trim();

      if (campo.hasAttribute("required") && !valor) {
        mostrarErro(campo, "Este campo é obrigatório.");
        return false;
      }
      if (campo.type === "email" && valor && !emailRegex.test(valor)) {
        mostrarErro(campo, "Informe um e-mail válido.");
        return false;
      }
      if (campo.id === "mensagem" && valor && valor.length < 10) {
        mostrarErro(campo, "Escreva pelo menos 10 caracteres.");
        return false;
      }
      mostrarErro(campo, "");
      return true;
    }

    const campos = Array.from(form.querySelectorAll("input, textarea"));

    campos.forEach((campo) => {
      campo.addEventListener("blur", () => validarCampo(campo));
      campo.addEventListener("input", () => {
        if (campo.getAttribute("aria-invalid") === "true") validarCampo(campo);
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const valido = campos.every((campo) => validarCampo(campo));

      if (feedback) {
        feedback.hidden = false;
        if (valido) {
          feedback.classList.remove("is-error");
          feedback.textContent =
            "Mensagem validada com sucesso! Este formulário é apenas demonstrativo e não envia dados.";
          form.reset();
        } else {
          feedback.classList.add("is-error");
          feedback.textContent = "Verifique os campos destacados antes de enviar.";
        }
      }

      if (!valido) {
        const primeiroErro = form.querySelector('[aria-invalid="true"]');
        if (primeiroErro) primeiroErro.focus();
      }
    });
  }

  /* ----------------------------------------------------------
     5. Ano atual, barra de progresso e botão voltar ao topo
     ---------------------------------------------------------- */
  function initUtilidades() {
    const anoAtual = document.getElementById("anoAtual");
    if (anoAtual) anoAtual.textContent = String(new Date().getFullYear());

    const heroAno = document.getElementById("heroAno");
    if (heroAno) heroAno.textContent = String(new Date().getFullYear());

    const progresso = document.getElementById("scrollProgress");
    const toTop = document.getElementById("toTop");

    function atualizarScroll() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const ratio = max > 0 ? doc.scrollTop / max : 0;

      if (progresso) progresso.style.width = `${(ratio * 100).toFixed(1)}%`;
      if (toTop) toTop.hidden = doc.scrollTop < 300;
    }

    window.addEventListener("scroll", atualizarScroll, { passive: true });
    atualizarScroll();

    if (toTop) {
      toTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  /* ----------------------------------------------------------
     6. Registro do Service Worker (PWA)
     ---------------------------------------------------------- */
  function initServiceWorker() {
    if (!("serviceWorker" in navigator)) return;

    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./service-worker.js")
        .catch((erro) => {
          console.warn("Falha ao registrar o Service Worker:", erro);
        });
    });
  }

  /* ----------------------------------------------------------
     Inicialização
     ---------------------------------------------------------- */
  function initAppMode() {
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isStandaloneMode) {
      document.documentElement.classList.add("app-standalone");
      document.body.classList.add("app-standalone");
    }
  }

  function initAppScreens() {
    const isStandalone = document.documentElement.classList.contains("app-standalone");
    if (!isStandalone) return;

    const bottomLinks = Array.from(document.querySelectorAll(".bottom-nav-link[href^='#']"));
    const screens = Array.from(document.querySelectorAll(".app-screen"));
    if (!bottomLinks.length || !screens.length) return;

    const map = {
      "#inicio": "inicio",
      "#cursos": "cursos",
      "#avisos": "avisos",
      "#calendario": "calendario",
      "#contato": "contato"
    };

    let current = document.querySelector(".app-screen.is-active")?.dataset.screen || "inicio";
    let busy = false;

    function showScreen(targetKey) {
      if (busy || targetKey === current) return;
      busy = true;

      const active = document.querySelector(`.app-screen[data-screen="${current}"]`);
      const next = document.querySelector(`.app-screen[data-screen="${targetKey}"]`);
      if (!next) {
        busy = false;
        return;
      }

      if (active) {
        active.classList.add("is-leaving");
        active.classList.remove("is-active");
        setTimeout(() => active.classList.remove("is-leaving"), 190);
      }

      next.scrollTop = 0;
      next.classList.add("is-active");

      bottomLinks.forEach((link) => {
        const key = map[link.getAttribute("href")];
        const isActive = key === targetKey;
        link.classList.toggle("is-active", isActive);
        if (isActive) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });

      current = targetKey;
      history.replaceState(null, "", `#${targetKey}`);
      setTimeout(() => {
        busy = false;
      }, 180);
    }

    bottomLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const key = map[link.getAttribute("href")];
        if (key) showScreen(key);
      });
    });

    const startKey = map[window.location.hash] || "inicio";
    showScreen(startKey);
  }

  function init() {
    initAppMode();
    initAppScreens();
    initMenuMobile();
    initNavegacaoSecoes();
    initFiltroAvisos();
    initFormularioContato();
    initUtilidades();
    initServiceWorker();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
