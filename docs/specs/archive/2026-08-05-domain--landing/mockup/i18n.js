/* Shared ES/EN for mockup pages — locale persists in localStorage */
(function (global) {
  const STORAGE_KEY = "amd-mockup-locale";

  const copy = {
    es: {
      // Chrome
      navHome: "Home",
      navAboutPage: "Quiénes somos",
      navServicesPage: "Servicios",
      navCta: "Contactar",
      menuAria: "Menú",
      langAria: "Idioma",
      bannerHome: "Mockup multi-página · Home = landing · Top nav = páginas · Izquierda = anclas del landing",
      bannerAbout: "Mockup · Página profunda Quiénes somos (misión, visión, 3 líderes)",
      bannerServices: "Mockup · Página Servicios · 5 grupos + sub-servicios",
      brandSub: "Integrales S.A.S.",
      ftPrivacy: "Privacidad",
      ftTerms: "Términos",
      waAria: "WhatsApp",

      // Side nav / landing anchors
      sideHome: "Inicio",
      navServices: "Servicios",
      navAbout: "Sobre AMD",
      navTrust: "Confianza",
      navContact: "Contacto",

      // Home hero
      heroPromise:
        "Formaliza y profesionaliza tu operación con contabilidad, gestión y asesoría de confianza — desde Cali, para tu negocio.",
      heroCtaPrimary: "Hablar con un asesor",
      heroCtaSecondary: "Ver servicios",

      // Home services road
      servicesTitle: "Nuestros servicios",
      servicesLead:
        "Cinco líneas de servicio. En el landing ves el resumen; el detalle completo está en la página Servicios.",
      roadHint: "Clic en un nodo para expandir. “Más info” abre la página completa.",
      moreInfo: "Más info",
      g1Title: "Contabilidad",
      g1Sum: "Estados financieros, sistema contable, declaraciones y más.",
      g1Body:
        "Portafolio contable para persona natural y jurídica: EEFF, inventarios, costos, exógena, revisoría, facturación electrónica…",
      g2Title: "Gestión Administrativa",
      g2Sum: "Nómina, seguridad social, cartera y proveedores.",
      g2Body:
        "Operación administrativa con cumplimiento: afiliaciones, liquidación de nómina, seguimiento de clientes y proveedores.",
      g3Title: "Sistemas de Riesgo",
      g3Sum: "Cumplimiento, control y protección reputacional.",
      g3Body:
        "Diseño y acompañamiento en sistemas de riesgo y cumplimiento normativo para operar con seguridad.",
      g4Title: "Asesoría",
      g4Sum: "Legal, financiera y de formalización.",
      g4Body: "Asesoría para constituir, formalizar y crecer con criterio legal y financiero.",
      g5Title: "Marca",
      g5Sum: "Identidad y posicionamiento de tu negocio.",
      g5Body:
        "Acompañamiento en marca e imagen para reforzar la propuesta de valor frente al mercado.",

      // Home about teaser
      aboutTitle: "Quiénes somos",
      aboutBody:
        "PYME colombiana enfocada en finanzas, administración y cumplimiento. Equipo con más de una década acompañando empresas de distintas industrias.",
      seeMore: "Ver más",
      aboutCta: "Contactar",

      // Trust
      trustTitle: "Confianza que se nota",
      trustLead: "Clientes en movimiento continuo; testimonios con pausa larga para leer.",
      m1: "años de acompañamiento",
      m2: "satisfacción",
      m3: "atención bilingüe",
      m4: "base regional",
      logosLabel: "Algunos clientes / sectores",
      q1: "“Por fin entendimos qué debíamos formalizar y en qué orden. El contacto fue directo y claro.”",
      q1By: "Emprendedora, comercio",
      q2: "“Needed bilingual support for our ops setup in Colombia. Smooth and professional.”",
      q2By: "Ops lead, SaaS",
      q3: "“La nómina y la seguridad social dejaron de ser un dolor de cabeza mensual.”",
      q3By: "Gerente, retail",
      q4: "“Claridad en declaraciones y acompañamiento real cuando hay cambios normativos.”",
      q4By: "Director financiero",
      trustCta: "Contactar",

      // Contact
      contactTitle: "Hablemos",
      contactLead: "Cuéntanos qué necesitas. Fase 1: WhatsApp o correo — sin backend.",
      locLabel: "Ubicación",
      waLabel: "WhatsApp",
      fName: "Nombre completo",
      fEmail: "Correo",
      fService: "Línea de servicio",
      fServiceOpt: "Selecciona (opcional)",
      fMessage: "Mensaje",
      fSubmit: "Enviar consulta",
      fWhatsapp: "Abrir WhatsApp",
      fNote: "Mockup: validación client-side + handoff.",
      fToast: "Listo — abriendo canal de contacto.",
      errRequired: "Campo requerido",
      errEmail: "Correo inválido",
      waPrefill: "Hola AMD, quiero información",

      // Quiénes somos page
      aboutPageTitle: "¿Quiénes somos?",
      aboutPageLead:
        "AMD Soluciones Integrales es una PYME colombiana comprometida con ofrecer soluciones integrales en finanzas, tecnología y cumplimiento normativo. Protegemos la reputación de las empresas, optimizamos operaciones y garantizamos seguridad en un entorno competitivo.",
      missionLabel: "Misión",
      missionBody:
        "Proporcionar soluciones integrales innovadoras y confiables que impulsen el éxito y la eficiencia de nuestros clientes, a través de servicios de alta calidad, adaptados a sus necesidades específicas.",
      visionLabel: "Visión",
      visionBody:
        "Convertirnos en el socio de confianza preferido por empresas y organizaciones, destacando por nuestra excelencia en la entrega de soluciones integrales que transformen y optimicen sus operaciones, contribuyendo al crecimiento sostenible de clientes y comunidades.",
      leadersTitle: "Nuestras líderes",
      leadersLead:
        "Equipo con más de una década en el mercado, atendiendo clientes de diversas industrias.",
      roleGg: "Gerente General",
      roleGc: "Gerente Comercial",
      roleGf: "Gerente Financiero",
      aboutClosing:
        "Somos un equipo comprometido con la excelencia y la confiabilidad. Nuestra identidad se cimienta en profesionales con décadas de experiencia y un profundo entendimiento de las necesidades empresariales contemporáneas.",
      viewServices: "Ver servicios",
      backHome: "Volver al Home",

      // Servicios page
      svcPageTitle: "Nuestros servicios",
      svcPageLead:
        "Soluciones personalizadas para formalizar, optimizar y hacer crecer tu negocio. Agrupamos la oferta en cinco líneas; dentro de cada una encontrarás los sub-servicios.",
      tocAria: "Líneas de servicio",
      g1Lead: "Portafolio integral para persona natural y jurídica. Contratación individual o en paquetes.",
      g2Lead: "Operación administrativa con cumplimiento normativo para personas naturales y jurídicas.",
      g3Lead: "Protección reputacional, control interno y cumplimiento en entornos competitivos.",
      g4Lead: "Formaliza tu negocio y asegura crecimiento sostenible con orientación experta.",
      g5Lead: "Identidad y posicionamiento para reforzar la propuesta de valor en el mercado.",
      g3Note: "Sub-servicios placeholder — validar copy final con AMD / brochure.",
      g5Note: "Sub-servicios placeholder — validar alcance Marca con AMD.",
      talkAdvisor: "Hablar con un asesor",
      backRoad: "Volver al road del Home",

      // Sub-services (short labels)
      subC01t: "01. Estados Financieros",
      subC01d: "Preparación, elaboración y revisión con precisión.",
      subC02t: "02. Sistema contable",
      subC02d: "Optimización y verificación de eficiencia.",
      subC03t: "03. Inventarios",
      subC03d: "Levantamiento y mantenimiento con metodologías actuales.",
      subC04t: "04. Costos",
      subC04d: "Análisis y mantenimiento para maximizar rentabilidad.",
      subC05t: "05. Asesoría contable / tesorería",
      subC05d: "Orientación en contabilidad, finanzas y tesorería.",
      subC06t: "06. Declaraciones",
      subC06d: "Renta, IVA, ReteFuente y demás obligaciones.",
      subC07t: "07. Información exógena",
      subC07d: "Medios magnéticos oportunos y precisos.",
      subC08t: "08. Revisoría Fiscal / Auditoría",
      subC08d: "Auditorías profesionales de cumplimiento.",
      subC09t: "09. Facturación electrónica",
      subC09d: "Implementación y documentos soporte.",
      subC10t: "10. Actualización RUB",
      subC10d: "Registro Único de Beneficiarios vigente.",
      subC11t: "11. Cámara de Comercio",
      subC11d: "Inscripción y renovación.",
      subC12t: "12. RUT",
      subC12d: "Creación y actualización eficiente.",
      subC13t: "13. RUP para ESAL",
      subC13d: "Actualización para entidades sin ánimo de lucro.",
      subC14t: "14. Proyecciones financieras",
      subC14d: "Planificación del futuro financiero.",
      subC15t: "15. Certificado de ingresos",
      subC15d: "Para personas naturales, con rapidez.",
      subC16t: "16. RNT y TRA",
      subC16d: "Registro Nacional de Turismo y alojamiento.",
      subA01t: "01. Seguridad social",
      subA01d: "Afiliación, revisión y liquidación.",
      subA02t: "02. Nómina",
      subA02d: "Revisión y liquidación con pagos exactos.",
      subA03t: "03. Cartera y proveedores",
      subA03d: "Levantamiento y mantenimiento actualizado.",
      subA04t: "04. Fidelización",
      subA04d: "Seguimiento de clientes y proveedores.",
      subR01t: "Diagnóstico de riesgos",
      subR01d: "Identificación de exposiciones operativas y normativas.",
      subR02t: "Políticas y controles",
      subR02d: "Diseño de controles y documentación de procesos.",
      subR03t: "Monitoreo continuo",
      subR03d: "Seguimiento y mejora de sistemas de riesgo.",
      subR04t: "Cumplimiento normativo",
      subR04d: "Acompañamiento frente a obligaciones sectoriales.",
      subAs01t: "Asesoría legal",
      subAs01d: "Constitución de empresa y beneficios de la formalización.",
      subAs02t: "Asesoría financiera",
      subAs02d: "Gestión de finanzas y optimización del crecimiento.",
      subAs03t: "Planes personalizados",
      subAs03d: "Adaptados a la industria del cliente.",
      subAs04t: "Soporte post-implementación",
      subAs04d: "Acompañamiento continuo después del arranque.",
      subM01t: "Identidad visual",
      subM01d: "Lineamientos de marca coherentes con el negocio.",
      subM02t: "Posicionamiento",
      subM02d: "Mensaje y presencia alineados a la oferta.",
      subM03t: "Materiales comerciales",
      subM03d: "Soportes para comunicación con clientes.",
    },
    en: {
      navHome: "Home",
      navAboutPage: "About us",
      navServicesPage: "Services",
      navCta: "Contact",
      menuAria: "Menu",
      langAria: "Language",
      bannerHome: "Multi-page mockup · Home = landing · Top nav = pages · Left = landing anchors",
      bannerAbout: "Mockup · About us deep page (mission, vision, 3 leaders)",
      bannerServices: "Mockup · Services page · 5 groups + sub-services",
      brandSub: "Integrales S.A.S.",
      ftPrivacy: "Privacy",
      ftTerms: "Terms",
      waAria: "WhatsApp",

      sideHome: "Home",
      navServices: "Services",
      navAbout: "About AMD",
      navTrust: "Trust",
      navContact: "Contact",

      heroPromise:
        "Formalize and professionalize your operations with trusted accounting, admin, and advisory — from Cali to your business.",
      heroCtaPrimary: "Talk to an advisor",
      heroCtaSecondary: "View services",

      servicesTitle: "Our services",
      servicesLead:
        "Five service lines. The landing shows a summary; full detail lives on the Services page.",
      roadHint: "Click a node to expand. “More info” opens the full page.",
      moreInfo: "More info",
      g1Title: "Accounting",
      g1Sum: "Financial statements, accounting system, tax filings, and more.",
      g1Body:
        "Full accounting portfolio for individuals and companies: statements, inventory, costs, exogenous info, statutory audit, e-invoicing…",
      g2Title: "Administrative Management",
      g2Sum: "Payroll, social security, A/R and suppliers.",
      g2Body:
        "Administrative operations with compliance: enrollments, payroll, client and supplier follow-up.",
      g3Title: "Risk Systems",
      g3Sum: "Compliance, control, and reputational protection.",
      g3Body: "Design and support for risk systems and regulatory compliance.",
      g4Title: "Advisory",
      g4Sum: "Legal, financial, and formalization.",
      g4Body: "Advisory to incorporate, formalize, and grow with legal and financial judgment.",
      g5Title: "Brand",
      g5Sum: "Identity and market positioning.",
      g5Body: "Brand and image support to strengthen your value proposition.",

      aboutTitle: "Who we are",
      aboutBody:
        "Colombian SME focused on finance, administration, and compliance. A team with over a decade supporting companies across industries.",
      seeMore: "See more",
      aboutCta: "Contact",

      trustTitle: "Trust you can see",
      trustLead: "Client logos in a slow loop; testimonials pause long enough to read.",
      m1: "years of support",
      m2: "satisfaction",
      m3: "bilingual service",
      m4: "regional base",
      logosLabel: "Some clients / sectors",
      q1: "“We finally understood what to formalize and in what order. Contact was direct and clear.”",
      q1By: "Founder, retail",
      q2: "“Needed bilingual support for our ops setup in Colombia. Smooth and professional.”",
      q2By: "Ops lead, SaaS",
      q3: "“Payroll and social security stopped being a monthly headache.”",
      q3By: "Manager, retail",
      q4: "“Clarity on filings and real support when regulations change.”",
      q4By: "Finance director",
      trustCta: "Contact",

      contactTitle: "Let's talk",
      contactLead: "Tell us what you need. Phase 1: WhatsApp or email — no backend.",
      locLabel: "Location",
      waLabel: "WhatsApp",
      fName: "Full name",
      fEmail: "Email",
      fService: "Service line",
      fServiceOpt: "Select (optional)",
      fMessage: "Message",
      fSubmit: "Send inquiry",
      fWhatsapp: "Open WhatsApp",
      fNote: "Mockup: client-side validation + handoff.",
      fToast: "Ready — opening contact channel.",
      errRequired: "Required field",
      errEmail: "Invalid email",
      waPrefill: "Hi AMD, I'd like more information",

      aboutPageTitle: "Who we are",
      aboutPageLead:
        "AMD Soluciones Integrales is a Colombian SME committed to integrated solutions in finance, technology, and regulatory compliance. We protect company reputation, optimize operations, and ensure security in a competitive environment.",
      missionLabel: "Mission",
      missionBody:
        "Provide innovative, reliable integrated solutions that drive client success and efficiency through high-quality services tailored to specific needs.",
      visionLabel: "Vision",
      visionBody:
        "Become the preferred trusted partner for companies and organizations, recognized for excellence in delivering integrated solutions that transform and optimize operations, contributing to sustainable growth for clients and communities.",
      leadersTitle: "Our leaders",
      leadersLead: "A team with over a decade in the market, serving clients across industries.",
      roleGg: "General Manager",
      roleGc: "Commercial Manager",
      roleGf: "Finance Manager",
      aboutClosing:
        "We are a team committed to excellence and reliability. Our identity is built on professionals with decades of experience and a deep understanding of contemporary business needs.",
      viewServices: "View services",
      backHome: "Back to Home",

      svcPageTitle: "Our services",
      svcPageLead:
        "Personalized solutions to formalize, optimize, and grow your business. We group the offer into five lines; each contains sub-services.",
      tocAria: "Service lines",
      g1Lead: "Full portfolio for individuals and companies. Hire individually or in packages.",
      g2Lead: "Administrative operations with regulatory compliance for individuals and companies.",
      g3Lead: "Reputational protection, internal control, and compliance in competitive environments.",
      g4Lead: "Formalize your business and secure sustainable growth with expert guidance.",
      g5Lead: "Identity and positioning to strengthen your value proposition in the market.",
      g3Note: "Placeholder sub-services — validate final copy with AMD / brochure.",
      g5Note: "Placeholder sub-services — validate Brand scope with AMD.",
      talkAdvisor: "Talk to an advisor",
      backRoad: "Back to Home road",

      subC01t: "01. Financial Statements",
      subC01d: "Preparation, drafting, and review with precision.",
      subC02t: "02. Accounting system",
      subC02d: "Optimization and efficiency verification.",
      subC03t: "03. Inventories",
      subC03d: "Setup and maintenance with current methods.",
      subC04t: "04. Costs",
      subC04d: "Analysis and maintenance to maximize profitability.",
      subC05t: "05. Accounting / treasury advisory",
      subC05d: "Guidance on accounting, finance, and treasury.",
      subC06t: "06. Tax returns",
      subC06d: "Income tax, VAT, withholding, and other filings.",
      subC07t: "07. Exogenous information",
      subC07d: "Timely and accurate magnetic media filings.",
      subC08t: "08. Statutory audit / external audit",
      subC08d: "Professional compliance audits.",
      subC09t: "09. Electronic invoicing",
      subC09d: "Implementation and supporting documents.",
      subC10t: "10. RUB update",
      subC10d: "Keep the Ultimate Beneficial Owner registry current.",
      subC11t: "11. Chamber of Commerce",
      subC11d: "Registration and renewal.",
      subC12t: "12. Tax ID (RUT)",
      subC12d: "Efficient creation and updates.",
      subC13t: "13. RUP for nonprofits",
      subC13d: "Updates for non-profit entities.",
      subC14t: "14. Financial projections",
      subC14d: "Planning your financial future.",
      subC15t: "15. Income certificate",
      subC15d: "For individuals, fast and precise.",
      subC16t: "16. RNT and TRA",
      subC16d: "National Tourism Registry and lodging card.",
      subA01t: "01. Social security",
      subA01d: "Enrollment, review, and settlement.",
      subA02t: "02. Payroll",
      subA02d: "Review and settlement with accurate payments.",
      subA03t: "03. Receivables & suppliers",
      subA03d: "Setup and up-to-date maintenance.",
      subA04t: "04. Loyalty / follow-up",
      subA04d: "Client and supplier relationship follow-up.",
      subR01t: "Risk diagnosis",
      subR01d: "Identify operational and regulatory exposures.",
      subR02t: "Policies and controls",
      subR02d: "Control design and process documentation.",
      subR03t: "Continuous monitoring",
      subR03d: "Follow-up and improvement of risk systems.",
      subR04t: "Regulatory compliance",
      subR04d: "Support for sector obligations.",
      subAs01t: "Legal advisory",
      subAs01d: "Company formation and formalization benefits.",
      subAs02t: "Financial advisory",
      subAs02d: "Finance management and growth optimization.",
      subAs03t: "Custom plans",
      subAs03d: "Adapted to the client’s industry.",
      subAs04t: "Post-implementation support",
      subAs04d: "Ongoing support after go-live.",
      subM01t: "Visual identity",
      subM01d: "Brand guidelines aligned with the business.",
      subM02t: "Positioning",
      subM02d: "Message and presence aligned to the offer.",
      subM03t: "Sales materials",
      subM03d: "Assets for client communication.",
    },
  };

  function getLocale() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "en" || stored === "es" ? stored : "es";
  }

  function setLocale(locale) {
    const next = locale === "en" ? "en" : "es";
    localStorage.setItem(STORAGE_KEY, next);
    applyI18n(next);
    return next;
  }

  function dict(locale) {
    return copy[locale] || copy.es;
  }

  function applyI18n(locale) {
    const lang = locale || getLocale();
    const d = dict(lang);
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (d[key] != null) el.textContent = d[key];
    });

    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria");
      if (d[key] != null) el.setAttribute("aria-label", d[key]);
    });

    document.querySelectorAll(".lang button").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang));
    });

    const fab = document.getElementById("fab");
    if (fab && d.waPrefill) {
      fab.href = `https://wa.me/573248805290?text=${encodeURIComponent(d.waPrefill)}`;
    }

    document.dispatchEvent(new CustomEvent("amd:locale", { detail: { locale: lang } }));
  }

  function bindLangButtons() {
    document.querySelectorAll(".lang button").forEach((btn) => {
      btn.addEventListener("click", () => setLocale(btn.dataset.lang));
    });
  }

  function bindMenu() {
    const menuBtn = document.querySelector(".menu-btn");
    const drawer = document.getElementById("drawer");
    if (!menuBtn || !drawer) return;
    menuBtn.addEventListener("click", () => {
      const open = drawer.classList.toggle("is-open");
      drawer.hidden = !open;
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    drawer.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        drawer.classList.remove("is-open");
        drawer.hidden = true;
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initChrome() {
    bindLangButtons();
    bindMenu();
    applyI18n(getLocale());
    const year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  global.AMDi18n = {
    copy,
    getLocale,
    setLocale,
    applyI18n,
    dict,
    initChrome,
  };
})(window);
