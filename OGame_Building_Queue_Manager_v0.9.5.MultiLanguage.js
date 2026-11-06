// ==UserScript==
// @name         OGame Building Queue Manager (Multilanguage)
// @namespace    https://s181-pt.ogame.gameforge.com/
// @version      0.9.5
// @description  Gestor com suporte a PT/EN e iframe de execução isolado para impedir navegação da janela principal.
// @match        https://*.ogame.gameforge.com/game/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  if (window.top !== window.self) return;

  // --- SISTEMA DE TRADUÇÃO (i18n) ---
  const USER_LANG = navigator.language.startsWith('en') ? 'en' : 'pt';
  const I18N = {
    pt: {
      brand: 'OGame Building Queue Manager',
      modeManual: 'Modo Manual',
      modeAuto: 'Modo Automático — execução',
      modeManualDesc: 'Edifícios e pesquisas têm filas separadas',
      modeAutoDesc: 'Verifica edifícios e pesquisas a cada 45–60 segundos',
      planetOpen: 'Planeta aberto',
      lastRead: 'Última leitura',
      updateNow: 'Atualizar agora',
      reading: 'A ler…',
      globalCheck: 'Próxima verificação global (edifícios + pesquisas)',
      tabBuildings: 'Edifícios',
      tabResearch: 'Pesquisas',
      buildingSelectTitle: 'Escolher edifícios e nível pretendido',
      buildingSelectMuted: 'seleciona os edifícios a acompanhar. No modo automático, o alvo é sempre o nível atual +1.',
      listHeadBuilding: 'Edifício',
      listHeadCurrent: 'Atual',
      listHeadTarget: 'Subir para',
      addSelected: 'Adicionar selecionados à fila',
      autoBuildTitle: 'Monitorização automática — edifícios',
      autoBuildMuted: 'O gestor verifica edifícios selecionados em todos os planetas e luas a cada 45–60 segundos. Uma construção ativa por planeta.',
      startAuto: 'Iniciar monitorização automática',
      stopAuto: 'Parar monitorização',
      autoBuildNotice: 'As ordens são executadas num contexto oculto; o planeta aberto continua a ser elegível e a janela principal fica livre para navegação manual. Uma construção ativa por planeta.',
      queueBuildings: 'Fila de edifícios',
      export: 'Exportar filas',
      reset: 'Repor gestor',
      researchGlobalTitle: 'Pesquisas globais',
      researchGlobalMuted: 'As tecnologias são globais à conta: escolhe as que queres acompanhar. A fila respeita uma investigação de cada vez.',
      addSelectedRes: 'Adicionar pesquisas selecionadas à fila',
      researchSelected: 'Selecionadas',
      researchKnown: 'Níveis conhecidos',
      autoResearchTitle: 'Monitorização automática — pesquisas',
      autoResearchMuted: 'O gestor tenta iniciar a próxima pesquisa selecionada num planeta com Laboratório de Pesquisas. O botão do jogo valida recursos e pré-requisitos. Só existe uma investigação ativa em toda a conta.',
      researchInProgress: 'Em curso',
      researchQueueTitle: 'Fila de pesquisas',
      researchQueueMuted: 'As pesquisas iniciadas saem da fila; a fila mostra apenas as próximas pesquisas pendentes.',
      footerResearch: 'A fila global de pesquisas está pronta.',
      footerBuildingNext: 'Próxima',
      footerBuildingSent: 'A aguardar confirmação',
      footerBuildingProgress: 'Em construção',
      footerBuildingEmpty: 'A fila de edifícios não tem tarefas pendentes.',
      footerAutoActive: 'Monitorização em segundo plano ativa; uma construção por planeta e uma investigação global de cada vez. Navegação manual livre.',
      footerManual: 'Modo Manual: as ordens são apresentadas sem execução automática.',
      statusDone: 'Concluído',
      statusCancelled: 'Cancelado',
      statusStarted: 'Construção iniciada',
      statusSent: 'Pedido enviado — a confirmar',
      statusWait: 'Pendente',
      statusWaitGame: 'Pendente — disponibilidade confirmada no jogo',
      statusRetry: 'A aguardar próxima verificação',
      readSuccess: 'Leitura concluída: {p} planetas e {m} luas.',
      readError: 'Não foi possível ler os níveis: {e}',
      readDataRequest: 'Carrega primeiro nos dados dos planetas.',
      noBuildings: 'Não foram encontrados edifícios neste astro.',
      noResearchLevels: 'Ainda não consegui ler os níveis das pesquisas. A leitura automática tenta obtê-los do accountInfo; abre uma vez a página de Pesquisas do OGame para o gestor também ler os níveis dos botões.',
      researchQueueEmpty: 'A fila de pesquisas está vazia.',
      buildingQueueEmpty: 'A fila ainda está vazia.',
      min: 'Minimizar',
      expand: 'Expandir',
      readAccountData: 'A consultar os dados da conta…',
      b1: 'Mina de Metal', b2: 'Mina de Cristal', b3: 'Sintetizador de Deutério', b4: 'Planta de Energia Solar', b12: 'Reator de Fusão', b14: 'Fábrica de Robôs', b15: 'Fábrica de Nanites', b21: 'Hangar', b22: 'Armazém de Metal', b23: 'Armazém de Cristal', b24: 'Depósito de Deutério', b31: 'Laboratório de Pesquisas', b33: 'Terra-Formador', b34: 'Depósito da Aliança', b36: 'Estaleiro Espacial', b41: 'Base Lunar', b42: 'Sensor Phalanx', b43: 'Portal de Salto Quântico', b44: 'Silo de Mísseis',
      r106: 'Tecnologia de Espionagem', r108: 'Tecnologia de Computadores', r109: 'Tecnologia de Armas', r110: 'Tecnologia de Escudo', r111: 'Tecnologia de Blindagem', r113: 'Tecnologia de Energia', r114: 'Tecnologia de Hiperespaço', r115: 'Motor de Combustão', r117: 'Motor de Impulsão', r118: 'Motor de Hiperespaço', r120: 'Tecnologia Laser', r121: 'Tecnologia de Iões', r122: 'Tecnologia de Plasma', r123: 'Rede Intergaláctica de Pesquisas', r124: 'Astrofísica', r199: 'Tecnologia de Gravitão'
    },
    en: {
      brand: 'OGame Building Queue Manager',
      modeManual: 'Manual Mode',
      modeAuto: 'Auto Mode — execution',
      modeManualDesc: 'Buildings and research have separate queues',
      modeAutoDesc: 'Checks buildings and research every 45–60 seconds',
      planetOpen: 'Current Planet',
      lastRead: 'Last sync',
      updateNow: 'Update Now',
      reading: 'Reading…',
      globalCheck: 'Next global check (buildings + research)',
      tabBuildings: 'Buildings',
      tabResearch: 'Research',
      buildingSelectTitle: 'Select buildings and target level',
      buildingSelectMuted: 'select the buildings to track. In auto mode, the target is always current level +1.',
      listHeadBuilding: 'Building',
      listHeadCurrent: 'Current',
      listHeadTarget: 'Upgrade to',
      addSelected: 'Add selected to queue',
      autoBuildTitle: 'Automatic Monitoring — buildings',
      autoBuildMuted: 'The manager checks selected buildings on all planets and moons every 45–60 seconds. One active construction per planet.',
      startAuto: 'Start automatic monitoring',
      stopAuto: 'Stop monitoring',
      autoBuildNotice: 'Orders are executed in a hidden context; the open planet remains eligible and the main window stays free for manual navigation. One active construction per planet.',
      queueBuildings: 'Building Queue',
      export: 'Export queues',
      reset: 'Reset manager',
      researchGlobalTitle: 'Global Research',
      researchGlobalMuted: 'Technologies are account-wide: choose which ones to track. The queue allows one research at a time.',
      addSelectedRes: 'Add selected research to queue',
      researchSelected: 'Selected',
      researchKnown: 'Known levels',
      autoResearchTitle: 'Automatic Monitoring — research',
      autoResearchMuted: 'The manager attempts to start the next selected research on a planet with a Research Lab. The game button validates resources and prerequisites. Only one active research per account.',
      researchInProgress: 'In progress',
      researchQueueTitle: 'Research Queue',
      researchQueueMuted: 'Started research leaves the queue; only pending ones are shown.',
      footerResearch: 'Global research queue is ready.',
      footerBuildingNext: 'Next',
      footerBuildingSent: 'Awaiting confirmation',
      footerBuildingProgress: 'Under construction',
      footerBuildingEmpty: 'The building queue has no pending tasks.',
      footerAutoActive: 'Background monitoring active; one construction per planet and one global research at a time. Manual navigation free.',
      footerManual: 'Manual Mode: orders are listed without automatic execution.',
      statusDone: 'Completed',
      statusCancelled: 'Cancelled',
      statusStarted: 'Construction started',
      statusSent: 'Request sent — confirming',
      statusWait: 'Pending',
      statusWaitGame: 'Pending — availability confirmed in game',
      statusRetry: 'Awaiting next check',
      readSuccess: 'Read complete: {p} planets and {m} moons.',
      readError: 'Could not read levels: {e}',
      readDataRequest: 'Please load planet data first.',
      noBuildings: 'No buildings found on this celestial body.',
      noResearchLevels: 'Could not read research levels yet. Automatic reading tries accountInfo; open the Research page once for the manager to read button levels.',
      researchQueueEmpty: 'Research queue is empty.',
      buildingQueueEmpty: 'Queue is still empty.',
      min: 'Minimize',
      expand: 'Expand',
      readAccountData: 'Fetching account data…',
      b1: 'Metal Mine', b2: 'Crystal Mine', b3: 'Deuterium Synthesizer', b4: 'Solar Power Plant', b12: 'Fusion Reactor', b14: 'Robotics Factory', b15: 'Nanite Factory', b21: 'Hangar', b22: 'Metal Warehouse', b23: 'Crystal Warehouse', b24: 'Deuterium Tank', b31: 'Research Lab', b33: 'Terraformer', b34: 'Alliance Depot', b36: 'Space Dock', b41: 'Moon Base', b42: 'Phalanx Sensor', b43: 'Quantum Jump Gate', b44: 'Missile Silo',
      r106: 'Espionage Technology', r108: 'Computer Technology', r109: 'Weapons Technology', r110: 'Shielding Technology', r111: 'Armour Technology', r113: 'Energy Technology', r114: 'Hyperspace Technology', r115: 'Combustion Drive', r117: 'Impulse Drive', r118: 'Hyperspace Drive', r120: 'Laser Technology', r121: 'Ion Technology', r122: 'Plasma Technology', r123: 'Intergalactic Research Network', r124: 'Astrophysics', r199: 'Graviton Technology'
    }
  };

  const t = (key, vars = {}) => {
    let text = I18N[USER_LANG][key] || I18N['en'][key] || key;
    for (const [vKey, vVal] of Object.entries(vars)) {
      text = text.replace(`{${vKey}}`, vVal);
    }
    return text;
  };

  const VERSION = '0.9.5';
  const STORAGE_KEY = 'ogbqm_s181_v1';
  const ACCOUNT_INFO_URL = '/game/index.php?page=componentOnly&component=externaldataexport&action=accountInfo&asJson=1';

  const BUILDINGS = {
    1: t('b1'), 2: t('b2'), 3: t('b3'), 4: t('b4'), 12: t('b12'), 14: t('b14'), 15: t('b15'),
    21: t('b21'), 22: t('b22'), 23: t('b23'), 24: t('b24'), 31: t('b31'), 33: t('b33'),
    34: t('b34'), 36: t('b36'), 41: t('b41'), 42: t('b42'), 43: t('b43'), 44: t('b44')
  };

  const RESEARCHES = {
    106: { name: t('r106'), field: 'EspionageTechnology', aliases: ['espionage', 'espionagetechnology'] },
    108: { name: t('r108'), field: 'ComputerTechnology', aliases: ['computer', 'computertechnology'] },
    109: { name: t('r109'), field: 'WeaponsTechnology', aliases: ['weapons', 'weaponstechnology'] },
    110: { name: t('r110'), field: 'ShieldingTechnology', aliases: ['shielding', 'shieldingtechnology'] },
    111: { name: t('r111'), field: 'ArmourTechnology', aliases: ['armour', 'armourtechnology', 'armor', 'armortechnology'] },
    113: { name: t('r113'), field: 'EnergyTechnology', aliases: ['energy', 'energytechnology'] },
    114: { name: t('r114'), field: 'HyperspaceTechnology', aliases: ['hyperspace', 'hyperspacetechnology'] },
    115: { name: t('r115'), field: 'CombustionDrive', aliases: ['combustion', 'combustiondrive'] },
    117: { name: t('r117'), field: 'ImpulseDrive', aliases: ['impulse', 'impulsedrive'] },
    118: { name: t('r118'), field: 'HyperspaceDrive', aliases: ['hyperspacedrive'] },
    120: { name: t('r120'), field: 'LaserTechnology', aliases: ['laser', 'lasertechnology'] },
    121: { name: t('r121'), field: 'IonTechnology', aliases: ['ion', 'iontechnology'] },
    122: { name: t('r122'), field: 'PlasmaTechnology', aliases: ['plasma', 'plasmatechnology'] },
    123: { name: t('r123'), field: 'IntergalacticResearchNetwork', aliases: ['intergalacticresearchnetwork', 'irn'] },
    124: { name: t('r124'), field: 'Astrophysics', aliases: ['astrophysics'] },
    199: { name: t('r199'), field: 'GravitonTechnology', aliases: ['graviton', 'gravitontechnology'] }
  };

  const DEFAULTS = {
    mode: 'manual',
    minimized: false,
    position: { right: 18, top: 90 },
    queue: [],
    researchQueue: [],
    activeBuildingLocks: [],
    selectedPlanetId: '',
    accountSnapshot: null,
    buildingSelections: {},
    researchSelections: {},
    activeResearchLock: null,
    activeTab: 'buildings',
    autoBuild: { active: false, currentQueueId: null, currentResearchQueueId: null, lastMessage: '', nextCheckAt: null, lastScanAt: null, resumeAfterNavigation: false, navigationTarget: null, manualNavigationHold: false, manualPlanetId: null, manualNavigationAt: null }
  };

  const clone = value => JSON.parse(JSON.stringify(value));
  const loadState = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return {
        ...clone(DEFAULTS),
        ...(saved && typeof saved === 'object' ? saved : {}),
        position: { ...DEFAULTS.position, ...(saved?.position || {}) },
        queue: Array.isArray(saved?.queue) ? saved.queue : [],
        researchQueue: Array.isArray(saved?.researchQueue) ? saved.researchQueue : [],
        activeBuildingLocks: Array.isArray(saved?.activeBuildingLocks) ? saved.activeBuildingLocks : [],
        accountSnapshot: saved?.accountSnapshot && Array.isArray(saved.accountSnapshot.planets)
          ? saved.accountSnapshot : null,
        buildingSelections: saved?.buildingSelections && typeof saved.buildingSelections === 'object'
          ? saved.buildingSelections : {},
        researchSelections: saved?.researchSelections && typeof saved.researchSelections === 'object'
          ? saved.researchSelections : {},
        activeResearchLock: saved?.activeResearchLock && typeof saved.activeResearchLock === 'object' ? saved.activeResearchLock : null,
        activeTab: saved?.activeTab === 'research' ? 'research' : 'buildings',
        autoBuild: { ...DEFAULTS.autoBuild, ...(saved?.autoBuild || {}) }
      };
    } catch {
      return clone(DEFAULTS);
    }
  };

  let state = loadState();
  state.activeBuildingLocks ||= [];
  let drag = null;
  let readStatus = '';
  let readBusy = false;
  let autoBuildBusy = false;

  const save = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (error) { console.warn('[OGame BQM] Não foi possível guardar os dados locais:', error); }
  };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
  const asInt = value => {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
  };

  state.autoBuild ||= clone(DEFAULTS.autoBuild);
  state.autoBuild.manualNavigationHold = false;
  state.autoBuild.resumeAfterNavigation = false;
  state.autoBuild.navigationTarget = null;

  function normalizeAutoSelections() {
    state.buildingSelections ||= {};
  }

  function getPagePlanetId() {
    const metaId = document.querySelector('meta[name="ogame-planet-id"]')?.getAttribute('content') || '';
    let queryId = '';
    try { queryId = new URL(location.href).searchParams.get('cp') || ''; } catch { /* URL ainda indisponível */ }
    return String(metaId || queryId || '');
  }

  state.autoBuild ||= {};
  state.autoBuild.manualPlanetId ||= String(getPagePlanetId() || '');

  function rememberManualPlanetId(planetId) {
    const id = String(planetId || '');
    if (!id) return;
    state.autoBuild.manualPlanetId = id;
    state.autoBuild.manualNavigationAt = Date.now();
    save();
  }

  document.addEventListener('click', event => {
    if (event.target?.closest?.('#ogbqm')) return;
    const link = event.target?.closest?.('a[href*="cp="]');
    if (!link) return;
    try {
      const id = new URL(link.getAttribute('href') || link.href, location.href).searchParams.get('cp');
      if (id) rememberManualPlanetId(id);
    } catch (_) { /* link não contém um URL válido */ }
  }, true);

  function getPagePlanetType() {
    const raw = (document.querySelector('meta[name="ogame-planet-type"]')?.getAttribute('content') || '').toLowerCase();
    return raw === 'moon' || raw === '3' ? 'moon' : 'planet';
  }

  function getPlanetListFromDom() {
    const byId = {};
    document.querySelectorAll('#planetList .smallplanet, .smallplanet').forEach(row => {
      const planetLink = row.querySelector('.planetlink');
      const moonLink = row.querySelector('.moonlink');
      const coords = (row.querySelector('.planet-koords')?.textContent || '').replace(/[\[\]()\s]/g, '').trim();
      const getCp = link => {
        if (!link) return '';
        try { return new URL(link.getAttribute('href') || '', location.href).searchParams.get('cp') || ''; }
        catch { return ''; }
      };
      const planetId = getCp(planetLink);
      const moonId = getCp(moonLink);
      const planetName = row.querySelector('.planet-name')?.textContent?.trim()
        || row.querySelector('.planetPic')?.getAttribute('alt') || 'Planeta';
      const moonName = moonLink?.querySelector('img')?.getAttribute('alt')
        || moonLink?.getAttribute('title') || 'Lua';

      if (planetId) byId[String(planetId)] = { id: String(planetId), name: planetName, coords, type: 'planet' };
      if (moonId) byId[String(moonId)] = { id: String(moonId), name: moonName, coords, type: 'moon' };
    });
    return byId;
  }

  function getCurrentPlanet() {
    const id = String(getPagePlanetId());
    const type = getPagePlanetType();
    const domPlanet = getPlanetListFromDom()[id];
    const savedPlanet = state.accountSnapshot?.planets?.find(planet => String(planet.id) === id);
    return {
      id,
      type,
      name: domPlanet?.name || savedPlanet?.name || (id ? `${type === 'moon' ? 'Lua' : 'Planeta'} ${id}` : 'Não identificado'),
      coords: domPlanet?.coords || savedPlanet?.coords || ''
    };
  }

  function normalizeAccountData(data) {
    if (!data || data.success === false || data.status === 'failure') {
      const detail = data?.errors?.map(error => error.message || error.error).filter(Boolean).join(', ');
      throw new Error(detail || 'O servidor não devolveu os dados da conta.');
    }
    if (!data.planets && !data.moons) {
      throw new Error('A resposta não contém planetas nem luas.');
    }

    const domPlanets = getPlanetListFromDom();
    const normalized = [];

    function addCelestials(collection, type) {
      const entries = Array.isArray(collection)
        ? collection.map((value, index) => [String(value?.id ?? index), value])
        : Object.entries(collection || {});

      for (const [key, raw] of entries) {
        if (!raw || typeof raw !== 'object') continue;
        const id = String(raw.id ?? key);
        if (!id || id === 'undefined') continue;

        const dom = domPlanets[id] || {};
        const coordParts = [raw.galaxy, raw.system, raw.position];
        const coords = coordParts.every(part => part !== undefined && part !== null)
          ? coordParts.join(':') : (raw.coords || dom.coords || '');
        const buildingsRaw = raw.buildings && typeof raw.buildings === 'object' ? raw.buildings : {};
        const buildings = {};
        for (const [buildingId, level] of Object.entries(buildingsRaw)) {
          if (/^\d+$/.test(buildingId)) buildings[buildingId] = asInt(level);
        }
        const resourcesRaw = raw.resources && typeof raw.resources === 'object' ? raw.resources : {};
        const resources = {
          metal: asInt(resourcesRaw.metal),
          crystal: asInt(resourcesRaw.crystal),
          deuterium: asInt(resourcesRaw.deuterium ?? resourcesRaw.deut)
        };

        normalized.push({
          id,
          type,
          name: dom.name || raw.name || `${type === 'moon' ? 'Lua' : 'Planeta'} ${coords ? `[${coords}]` : id}`,
          coords,
          buildings,
          resources,
          resourcesKnown: !!raw.resources && Number.isFinite(Number(resourcesRaw.metal))
            && Number.isFinite(Number(resourcesRaw.crystal))
            && Number.isFinite(Number(resourcesRaw.deuterium ?? resourcesRaw.deut))
        });
      }
    }

    addCelestials(data.planets, 'planet');
    addCelestials(data.moons, 'moon');
    normalized.sort((a, b) => {
      const ac = a.coords.split(':').map(Number);
      const bc = b.coords.split(':').map(Number);
      for (let i = 0; i < 3; i++) if ((ac[i] || 0) !== (bc[i] || 0)) return (ac[i] || 0) - (bc[i] || 0);
      return a.type.localeCompare(b.type);
    });
    return normalized;
  }

  function normalizeResearchLevelValue(value) {
    if (value && typeof value === 'object') {
      value = value.level ?? value.technologyLevel ?? value.amount ?? value.quantity ?? value.value;
    }
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? Math.floor(number) : null;
  }

  function normalizeResearchLevels(data) {
    const candidates = [
      data?.researches, data?.research, data?.researchLevels, data?.playerResearches, data?.technologies,
      data?.player?.researches, data?.player?.research, data?.player?.researchLevels,
      data?.account?.researches, data?.account?.research, data?.account?.researchLevels,
      data?.playerData?.researches, data?.playerData?.research, data?.playerData?.researchLevels
    ].filter(value => value && typeof value === 'object');
    const result = {};

    for (const source of candidates) {
      const entries = Array.isArray(source)
        ? source.map(item => [String(item?.id ?? item?.technologyId ?? ''), item])
        : Object.entries(source);
      const normalizedEntries = entries.map(([key, value]) => [String(key).toLowerCase().replace(/[^a-z0-9]/g, ''), value]);
      for (const [id, definition] of Object.entries(RESEARCHES)) {
        if (result[id] !== undefined) continue;
        const aliases = [id, definition.field, ...definition.aliases]
          .map(value => String(value).toLowerCase().replace(/[^a-z0-9]/g, ''));
        const found = normalizedEntries.find(([key]) => aliases.includes(key));
        if (found) {
          const level = normalizeResearchLevelValue(found[1]);
          if (level !== null) result[id] = level;
        }
      }
    }

    const domLevels = readResearchLevelsFromDom();
    for (const [id, level] of Object.entries(domLevels)) {
      if (result[id] === undefined) result[id] = level;
    }
    return result;
  }

  function readResearchLevelsFromDom() {
    const result = {};
    for (const button of document.querySelectorAll('button.upgrade[data-technology]')) {
      const id = String(button.getAttribute('data-technology') || '');
      if (!RESEARCHES[id]) continue;
      const target = getButtonTargetLevel(button);
      if (Number.isInteger(target) && target > 0) result[id] = target - 1;
    }
    for (const card of document.querySelectorAll('.technology, [data-technology]')) {
      const id = String(card.getAttribute('data-technology') || '');
      if (!RESEARCHES[id] || result[id] !== undefined) continue;
      const levelNode = card.querySelector('.level, .technologyLevel, .researchLevel, [class*="level"]');
      const text = levelNode?.textContent || card.textContent || '';
      const match = text.match(/(?:nível|level)\s*[:#]?\s*(\d+)/i);
      if (match) result[id] = Number(match[1]);
    }
    return result;
  }

  async function readAccountData(options = {}) {
    const silent = Boolean(options.silent);
    if (readBusy) return false;
    readBusy = true;
    if (!silent) {
      readStatus = t('readAccountData');
      render();
    }

    let success = false;
    try {
      const response = await fetch(ACCOUNT_INFO_URL, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'same-origin',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); }
      catch { throw new Error('O servidor não devolveu JSON.'); }
      if (!response.ok) throw new Error(`Erro HTTP ${response.status}.`);

      const planets = normalizeAccountData(data);
      if (!planets.length) throw new Error('Não encontrei planetas ou luas com IDs válidos.');

      const parsedResearches = normalizeResearchLevels(data);
      const researches = {
        ...(state.accountSnapshot?.researches || {}),
        ...parsedResearches
      };
      state.accountSnapshot = { syncedAt: new Date().toISOString(), planets, researches };
      const validSelected = state.selectedPlanetId
        && planets.some(planet => String(planet.id) === String(state.selectedPlanetId));
      if (!validSelected) {
        const currentId = String(state.autoBuild?.manualPlanetId || getPagePlanetId());
        state.selectedPlanetId = planets.some(planet => String(planet.id) === currentId)
          ? currentId : String(planets[0].id);
      }
      save();
      const planetCount = planets.filter(planet => planet.type === 'planet').length;
      const moonCount = planets.filter(planet => planet.type === 'moon').length;
      readStatus = t('readSuccess', { p: planetCount, m: moonCount });
      success = true;
    } catch (error) {
      console.error('[OGame BQM] Erro ao ler dados da conta:', error);
      readStatus = t('readError', { e: error.message || error });
    } finally {
      readBusy = false;
      render();
    }
    return success;
  }

  normalizeAutoSelections();
  save();


  const style = document.createElement('style');
  style.textContent = `
    #ogbqm { position:fixed; z-index:2147483000; top:${state.position.top}px; right:${state.position.right}px;
      width:370px; max-width:calc(100vw - 12px); max-height:calc(100vh - 8px); max-height:calc(100dvh - 8px);
      display:flex; flex-direction:column; overflow:hidden; color:#e8edf4; background:#17212e;
      border:1px solid #526477; border-radius:9px; box-shadow:0 8px 28px #0009;
      font:12px/1.35 Arial,sans-serif; }
    #ogbqm * { box-sizing:border-box; }
    #ogbqm .head { display:flex; align-items:center; justify-content:space-between; gap:8px;
      flex:0 0 auto; padding:6px 8px; background:#223247; cursor:move; }
    #ogbqm .brand { font-weight:700; letter-spacing:.1px; }
    #ogbqm button, #ogbqm input, #ogbqm select { font:inherit; }
    #ogbqm button { border:1px solid #60758b; color:#f5f7fa; background:#30465d; border-radius:5px;
      padding:5px 8px; cursor:pointer; }
    #ogbqm button:hover { background:#3d5874; }
    #ogbqm button:disabled { opacity:.45; cursor:not-allowed; }
    #ogbqm .body { padding:6px; display:grid; gap:5px; min-height:0; overflow-y:auto; overscroll-behavior:contain;
      max-height:calc(100vh - 45px); max-height:calc(100dvh - 45px); }
    #ogbqm .muted { color:#aebdca; font-size:10px; }
    #ogbqm .mode { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:5px 7px;
      background:#202f40; border-radius:6px; }
    #ogbqm .switch { position:relative; width:39px; height:21px; display:inline-block; flex:none; }
    #ogbqm .switch input { opacity:0; width:0; height:0; }
    #ogbqm .slider { position:absolute; inset:0; background:#68798a; border-radius:20px; cursor:pointer; transition:.2s; }
    #ogbqm .slider:before { content:""; position:absolute; width:15px; height:15px; left:3px; top:3px;
      background:white; border-radius:50%; transition:.2s; }
    #ogbqm .switch input:checked + .slider { background:#b07b2c; }
    #ogbqm .switch input:checked + .slider:before { transform:translateX(18px); }
    #ogbqm select { min-width:0; max-width:100%; color:#f4f7fa; background:#0f1924;
      border:1px solid #53687d; border-radius:5px; padding:5px 6px; }
    #ogbqm .section { padding:5px 6px; background:#202f40; border:1px solid #3b5065; border-radius:6px; display:grid; gap:4px; }
    #ogbqm .topline { display:flex; align-items:center; justify-content:space-between; gap:7px; }
    #ogbqm .planet-select { width:100%; }
    #ogbqm .tabs { display:flex; gap:5px; }
    #ogbqm .tabs button { flex:1; }
    #ogbqm .tabs button.active { background:#315b45; border-color:#568a69; font-weight:700; }
    #ogbqm .research-list { display:grid; gap:3px; max-height:210px; overflow-y:auto; padding-right:2px; }
    #ogbqm .research-row { display:grid; grid-template-columns:19px minmax(0,1fr) 38px 76px; align-items:center; gap:5px;
      padding:5px; border-radius:4px; background:#172635; }
    #ogbqm .research-row input[type=checkbox] { width:15px; height:15px; margin:0; accent-color:#59ad78; cursor:pointer; }
    #ogbqm .research-name { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    #ogbqm .research-level { text-align:right; color:#b9e3c8; font-weight:700; font-variant-numeric:tabular-nums; }
    #ogbqm .notice { padding:6px 7px; border-radius:5px; background:#3a3020; color:#f2d7a8; font-size:10px; }
    #ogbqm .notice.good { background:#20392f; color:#bce8ce; }
    #ogbqm .notice.error { background:#492b2b; color:#ffd0d0; }
    #ogbqm .building-list { display:grid; gap:3px; max-height:195px; overflow-y:auto; padding-right:2px; }
    #ogbqm .building-row { display:grid; grid-template-columns:19px minmax(0,1fr) 42px 88px; align-items:center;
      gap:4px; padding:3px 4px; border-radius:4px; background:#172635; }
    #ogbqm .building-row:hover { background:#263b50; }
    #ogbqm .building-row input[type=checkbox] { width:15px; height:15px; margin:0; accent-color:#59ad78; cursor:pointer; }
    #ogbqm .building-name { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    #ogbqm .current-level { text-align:right; color:#b9e3c8; font-weight:700; font-variant-numeric:tabular-nums; }
    #ogbqm .target-level { width:88px; padding:4px 3px !important; }
    #ogbqm .target-auto { width:88px; text-align:center; color:#bce8ce; font-weight:700; font-variant-numeric:tabular-nums; }
    #ogbqm .suggestions { display:grid; gap:5px; max-height:135px; overflow-y:auto; }
    #ogbqm .suggestion { padding:6px; background:#172635; border:1px solid #3b5065; border-radius:5px; font-size:10px; }
    #ogbqm .list-head { display:grid; grid-template-columns:19px minmax(0,1fr) 42px 88px; gap:5px; padding:0 5px;
      color:#9fb0c0; font-size:9px; text-transform:uppercase; }
    #ogbqm .primary { width:100%; background:#315b45; border-color:#568a69; font-weight:700; }
    #ogbqm .queue { display:grid; gap:4px; max-height:115px; overflow-y:auto; }
    #ogbqm .item { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:4px; padding:4px;
      background:#202f40; border:1px solid #3b5065; border-radius:6px; }
    #ogbqm .item.current { border-color:#c18a3c; }
    #ogbqm .item-title { font-weight:700; }
    #ogbqm .item-meta { color:#b7c5d2; font-size:10px; margin-top:2px; }
    #ogbqm .item-status { grid-column:1 / -1; font-size:10px; margin-top:2px; padding:3px 5px; border-radius:4px; }
    #ogbqm .item-status.ready { color:#bce8ce; background:#20392f; }
    #ogbqm .item-status.short { color:#f2d7a8; background:#3a3020; }
    #ogbqm .item-status.wait { color:#c7d2de; background:#283746; }
    #ogbqm .item-status.achieved { color:#bce8ce; background:#20392f; }
    #ogbqm .item-status.unknown { color:#ffd0d0; background:#492b2b; }
    #ogbqm .item-status.started { color:#bce8ce; background:#20392f; }
    #ogbqm .item-status.sent { color:#d7e4f2; background:#283746; }
    #ogbqm .analysis-summary { font-size:10px; padding:6px 7px; border-radius:5px; background:#20392f; color:#bce8ce; }
    #ogbqm .countdown-panel { display:flex; align-items:center; justify-content:space-between; gap:6px; padding:5px 7px;
      background:#172635; border:1px solid #3b5065; border-radius:5px; font-size:10px; }
    #ogbqm .countdown-panel strong { color:#bce8ce; font-size:13px; font-variant-numeric:tabular-nums; }
    #ogbqm .item-buttons { display:flex; flex-direction:row; align-items:center; gap:3px; }
    #ogbqm .item-buttons button { min-width:24px; padding:3px 5px; }
    #ogbqm .item-buttons button[data-action="cancel-order"] { color:#ffd6d6; border-color:#a65353; background:#512d35; font-weight:700; }
    #ogbqm .item-buttons button[data-action="cancel-order"]:hover { background:#713840; }
    #ogbqm .actions { display:flex; gap:5px; flex-wrap:wrap; }
    #ogbqm .actions button { padding:4px 6px; font-size:10px; }
    #ogbqm .footer { border-top:1px solid #3b5065; padding-top:5px; font-size:10px; color:#aebdca; }
    #ogbqm.min .body { display:none; }
    @media (max-height:900px) {
      #ogbqm { width:350px; max-height:calc(100dvh - 8px); }
      #ogbqm .head { padding:5px 7px; }
      #ogbqm .body { padding:5px; gap:4px; max-height:calc(100dvh - 42px); }
      #ogbqm .mode { padding:4px 6px; }
      #ogbqm .section { padding:4px 5px; gap:3px; }
      #ogbqm .building-list { max-height:155px; }
      #ogbqm .research-list { max-height:155px; }
      #ogbqm .suggestions { max-height:105px; gap:3px; }
      #ogbqm .queue { max-height:95px; gap:3px; }
      #ogbqm .suggestion { padding:4px; }
      #ogbqm .item { padding:4px; gap:3px; }
      #ogbqm .item-meta, #ogbqm .item-status { margin-top:1px; }
      #ogbqm .countdown-panel { padding:4px 6px; }
      #ogbqm .notice { padding:4px 5px; }
      #ogbqm .footer { padding-top:3px; }
    }
    @media (max-width:420px) { #ogbqm { right:6px !important; width:calc(100vw - 12px); } }
  `;
  document.head.appendChild(style);

  const root = document.createElement('section');
  root.id = 'ogbqm';
  document.body.appendChild(root);

  function getDisplayedPlanet() {
    const list = state.accountSnapshot?.planets || [];
    const selectedId = String(state.selectedPlanetId || getPagePlanetId());
    return list.find(planet => String(planet.id) === selectedId) || null;
  }

  function captureBuildingSelections() {
    const planet = getDisplayedPlanet();
    if (!planet) return;
    const list = root.querySelector('.building-list');
    if (list && String(list.dataset.planetId || '') !== String(planet.id)) return;
    state.buildingSelections ||= {};
    const planetSelections = state.buildingSelections[String(planet.id)] ||= {};
    root.querySelectorAll('.building-row').forEach(row => {
      const buildingId = String(row.dataset.buildingId || '');
      if (!buildingId) return;
      const checkbox = row.querySelector('.building-check');
      const target = row.querySelector('.target-level');
      const targetLevel = Number(target?.value);
      const previous = planetSelections[buildingId] || {};
      planetSelections[buildingId] = {
        checked: checkbox ? checkbox.checked : Boolean(previous.checked),
        targetLevel: Number.isInteger(targetLevel) && targetLevel > 0
          ? targetLevel : previous.targetLevel
      };
    });
  }

  function renderBuildingChoices(planet) {
    if (!planet) return `<div class="muted">${t('readDataRequest')}</div>`;
    const entries = Object.entries(planet.buildings || {})
      .filter(([id]) => /^\d+$/.test(id))
      .sort((a, b) => Number(a[0]) - Number(b[0]));
    if (!entries.length) return `<div class="muted">${t('noBuildings')}</div>`;

    return entries.map(([id, rawLevel]) => {
      const level = asInt(rawLevel);
      const name = BUILDINGS[id] || `Edifício #${id}`;
      const savedSelection = state.buildingSelections?.[String(planet.id)]?.[String(id)] || {};
      const maxTarget = Math.min(999, Math.max(level + 1, level + 20));
      const savedTarget = Number(savedSelection.targetLevel);
      const selectedTarget = Number.isInteger(savedTarget) && savedTarget > level && savedTarget <= maxTarget
        ? savedTarget : level + 1;
      const targetControl = state.mode === 'auto'
        ? `<span class="target-auto" title="Próximo nível calculado automaticamente">${level} → ${level + 1}</span>`
        : `<select class="target-level" aria-label="Nível pretendido para ${esc(name)}">${Array.from({ length: maxTarget - level }, (_, index) => {
            const target = level + index + 1;
            return `<option value="${target}" ${target === selectedTarget ? 'selected' : ''}>Nível ${target}</option>`;
          }).join('')}</select>`;
      return `<label class="building-row" data-building-id="${esc(id)}" data-current-level="${level}">
        <input class="building-check" type="checkbox" ${savedSelection.checked ? 'checked' : ''} aria-label="Analisar ${esc(name)}">
        <span class="building-name" title="${esc(name)}">${esc(name)}</span>
        <span class="current-level" title="Nível atual">${level}</span>
        ${targetControl}
      </label>`;
    }).join('');
  }

  function getSelectedBuildingIds(planetId) {
    const selected = state.buildingSelections?.[String(planetId)] || {};
    const planet = getPlanetSnapshot(planetId);
    return Object.keys(selected)
      .filter(id => selected[id]?.checked && /^\d+$/.test(id)
        && (!planet || Object.prototype.hasOwnProperty.call(planet.buildings || {}, id)))
      .sort((a, b) => Number(a) - Number(b));
  }

  function getAutomaticBuildingSuggestions() {
    const planets = state.accountSnapshot?.planets || [];
    const suggestions = [];
    for (const planet of planets) {
      for (const buildingId of getSelectedBuildingIds(planet.id)) {
        const currentLevel = asInt(planet.buildings?.[buildingId]);
        const targetLevel = currentLevel + 1;
        const existing = state.queue.find(item =>
          !['done', 'cancelled'].includes(item.status)
          && String(item.planetId) === String(planet.id)
          && String(item.buildingId) === String(buildingId)
        );
        const inProgress = hasBuildingLock(planet.id, buildingId);
        suggestions.push({
          planet,
          buildingId,
          building: BUILDINGS[buildingId] || `Edifício #${buildingId}`,
          currentLevel,
          targetLevel,
          existing,
          inProgress
        });
      }
    }
    return suggestions;
  }

  function getResearchLevel(technologyId) {
    const value = state.accountSnapshot?.researches?.[String(technologyId)];
    return Number.isFinite(Number(value)) ? asInt(value) : null;
  }

  function captureResearchSelections() {
    state.researchSelections ||= {};
    root.querySelectorAll('.research-row').forEach(row => {
      const id = String(row.dataset.researchId || '');
      if (!RESEARCHES[id]) return;
      const previous = state.researchSelections[id] || {};
      state.researchSelections[id] = { checked: Boolean(row.querySelector('.research-check')?.checked ?? previous.checked) };
    });
  }

  function getSelectedResearchIds() {
    return Object.keys(state.researchSelections || {})
      .filter(id => RESEARCHES[id] && state.researchSelections[id]?.checked)
      .sort((a, b) => Number(a) - Number(b));
  }

  function renderResearchChoices() {
    const ids = Object.keys(RESEARCHES).sort((a, b) => Number(a) - Number(b));
    const knownCount = ids.filter(id => getResearchLevel(id) !== null).length;
    if (!knownCount) {
      return `<div class="notice">${t('noResearchLevels')}</div>`;
    }
    return ids.map(id => {
      const definition = RESEARCHES[id];
      const level = getResearchLevel(id);
      const selected = Boolean(state.researchSelections?.[id]?.checked);
      const active = state.researchQueue.find(item => String(item.technologyId) === id && !['done', 'cancelled'].includes(item.status));
      const target = level === null ? '?' : String(level + 1);
      return `<label class="research-row" data-research-id="${id}">
        <input class="research-check" type="checkbox" ${selected ? 'checked' : ''} ${level === null ? 'disabled' : ''} aria-label="Monitorizar ${esc(definition.name)}">
        <span class="research-name" title="${esc(definition.name)}">${esc(definition.name)}</span>
        <span class="research-level" title="Nível atual">${level === null ? '—' : level}</span>
        <span class="target-auto" title="Próximo nível">${level === null ? '—' : `→ ${target}`}</span>
      </label>`;
    }).join('');
  }

  function isActiveResearchItem(item) {
    return item && ['pending', 'sent', 'started'].includes(item.status) && Boolean(RESEARCHES[String(item.technologyId)]);
  }

  function reconcileAutomaticResearchQueue() {
    const researches = state.accountSnapshot?.researches || {};
    if (state.activeResearchLock) {
      const lockedLevel = normalizeResearchLevelValue(researches[String(state.activeResearchLock.technologyId)]);
      if (lockedLevel !== null && lockedLevel >= Number(state.activeResearchLock.targetLevel)) {
        state.activeResearchLock = null;
      }
    }
    for (let index = state.researchQueue.length - 1; index >= 0; index--) {
      const item = state.researchQueue[index];
      if (!isActiveResearchItem(item)) {
        state.researchQueue.splice(index, 1);
        continue;
      }
      const technologyId = String(item.technologyId);
      const actual = normalizeResearchLevelValue(researches[technologyId]);
      if (actual !== null && actual >= Number(item.targetLevel)) {
        state.researchQueue.splice(index, 1);
        continue;
      }
      if (item.status === 'pending' && !state.researchSelections?.[technologyId]?.checked) {
        state.researchQueue.splice(index, 1);
        continue;
      }
      if (item.status === 'started' || (item.status === 'sent' && item.visualConfirmation)) {
        state.activeResearchLock = {
          technologyId,
          targetLevel: Number(item.targetLevel),
          research: item.research || RESEARCHES[technologyId]?.name || 'Pesquisa',
          sourcePlanetId: item.sourcePlanetId || '',
          sourcePlanet: item.sourcePlanet || '',
          startedAt: item.sentAt || item.lastAttemptAt || new Date().toISOString()
        };
        state.researchQueue.splice(index, 1);
      }
    }
    for (const id of getSelectedResearchIds()) {
      const level = getResearchLevel(id);
      if (level === null) continue;
      if (state.activeResearchLock && String(state.activeResearchLock.technologyId) === id) continue;
      const hasActive = state.researchQueue.some(item => String(item.technologyId) === id && isActiveResearchItem(item));
      if (hasActive) continue;
      state.researchQueue.push({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type: 'research',
        technologyId: id,
        research: RESEARCHES[id].name,
        currentLevel: level,
        targetLevel: level + 1,
        status: 'pending',
        autoGenerated: true,
        triedPlanets: [],
        createdAt: new Date().toISOString()
      });
    }
    save();
  }

  function getNextPendingResearch() {
    const active = state.researchQueue.find(item => item.status === 'sent' || item.status === 'started');
    if (active || state.activeResearchLock) return null;
    return state.researchQueue
      .filter(item => item.status === 'pending')
      .filter(item => state.researchSelections?.[String(item.technologyId)]?.checked)
      .filter(item => !item.retryAfter || Number(item.retryAfter) <= Date.now())
      .sort((a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')))[0] || null;
  }

  function renderResearchQueue() {
    const rows = state.researchQueue.filter(item => !['cancelled'].includes(item.status));
    if (!rows.length) return `<div class="muted">${t('researchQueueEmpty')}</div>`;
    return rows.map((item, index) => {
      const status = item.status === 'done' ? t('statusDone')
        : item.status === 'started' ? t('statusStarted')
        : item.status === 'sent' ? t('statusSent')
        : item.retryAfter && Number(item.retryAfter) > Date.now() ? t('statusRetry')
        : t('statusWait');
      const cls = item.status === 'done' || item.status === 'started' ? 'started' : item.status === 'sent' ? 'sent' : 'wait';
      return `<div class="item">
        <div><div class="item-title">${index + 1}. ${esc(item.research || RESEARCHES[String(item.technologyId)]?.name || 'Pesquisa')} — nível ${Number(item.targetLevel)}</div>
          <div class="item-meta">Global · ${esc(status)}${Number.isInteger(item.currentLevel) ? ` · atual ${item.currentLevel}` : ''}${item.sourcePlanet ? ` · laboratório: ${esc(item.sourcePlanet)}` : ''}</div></div>
        <div class="item-buttons"><button data-action="research-up" data-id="${esc(item.id)}" ${index === 0 ? 'disabled' : ''} title="Mover para cima">↑</button>
          <button data-action="research-down" data-id="${esc(item.id)}" ${index === rows.length - 1 ? 'disabled' : ''} title="Mover para baixo">↓</button>
          <button data-action="cancel-research" data-id="${esc(item.id)}" title="Retirar da fila" aria-label="Cancelar ${esc(item.research || 'pesquisa')}">×</button></div>
        <div class="item-status ${cls}">${esc(status)}</div>
      </div>`;
    }).join('');
  }

  function formatCountdown(milliseconds) {
    const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return minutes ? `${minutes}:${String(seconds).padStart(2, '0')}` : `${seconds}s`;
  }

  function getAutoCountdownText() {
    if (state.autoBuild?.active) {
      const target = Number(state.autoBuild.nextCheckAt);
      if (Number.isFinite(target) && target > 0) return formatCountdown(target - Date.now());
      if (autoBuildBusy) return t('reading');
      return t('reading');
    }
    if (readBusy) return t('reading');
    if (Number.isFinite(accountRefreshDueAt) && accountRefreshDueAt > 0) {
      return formatCountdown(accountRefreshDueAt - Date.now());
    }
    return t('reading');
  }

  function updateCountdownDisplay() {
    const node = root.querySelector('#ogbqm-countdown');
    if (node) node.textContent = getAutoCountdownText();
  }

  function renderAutomaticSuggestions() {
    const suggestions = getAutomaticBuildingSuggestions();
    if (!suggestions.length) {
      return `<div class="muted">${t('buildingSelectMuted')}</div>`;
    }
    const cards = suggestions.map(item => {
      let status = t('statusWaitGame');
      let cls = 'wait';
      if (item.inProgress) {
        status = t('statusStarted'); cls = 'started';
      } else if (item.existing?.status === 'sent' || item.existing?.status === 'started') {
        status = t('statusSent'); cls = 'started';
      } else if (item.existing?.status === 'pending' && item.existing?.retryAfter > Date.now()) {
        status = t('statusRetry'); cls = 'short';
      } else if (item.existing?.status === 'pending') {
        status = t('statusWait'); cls = 'wait';
      }
      return `<div class="suggestion">
        <div><strong>${esc(item.planet.name)}</strong> <span class="muted">${esc(item.planet.coords || '')}</span></div>
        <div>${esc(item.building)}: nível ${item.currentLevel} → <strong>${item.targetLevel}</strong></div>
        <div class="item-status ${cls}">${esc(status)}</div>
      </div>`;
    }).join('');
    const executionButton = state.autoBuild?.active
      ? `<button data-action="stop-auto-build">${t('stopAuto')}</button>`
      : `<button class="primary" data-action="prepare-and-run">${t('startAuto')}</button>`;
    return `<div class="suggestions">${cards}</div>
      <div class="actions">${executionButton}</div>
      <div class="muted">${t('autoBuildNotice')}</div>
      ${state.autoBuild?.lastMessage ? `<div class="notice">${esc(state.autoBuild.lastMessage)}</div>` : ''}`;
  }

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const POLL_MIN_MS = 45000;
  const POLL_MAX_MS = 60000;
  let autoBuildTimer = null;
  let accountRefreshTimer = null;
  let accountRefreshDueAt = null;

  function randomPollDelay() {
    return Math.floor(POLL_MIN_MS + Math.random() * (POLL_MAX_MS - POLL_MIN_MS + 1));
  }

  function scheduleAccountRefresh() {
    if (accountRefreshTimer) clearTimeout(accountRefreshTimer);
    accountRefreshTimer = null;
    if (state.autoBuild?.active) {
      accountRefreshDueAt = null;
      return;
    }
    const wait = randomPollDelay();
    accountRefreshDueAt = Date.now() + wait;
    accountRefreshTimer = setTimeout(async () => {
      accountRefreshTimer = null;
      accountRefreshDueAt = null;
      if (state.autoBuild?.active) return;
      await readAccountData({ silent: true });
      scheduleAccountRefresh();
    }, wait);
  }

  function buildPageUrl(planetId, component = 'supplies') {
    const url = new URL('/game/index.php', location.origin);
    url.searchParams.set('page', 'ingame');
    url.searchParams.set('component', String(component || 'supplies'));
    url.searchParams.set('cp', String(planetId));
    return url.toString();
  }

  function researchPageUrl(planetId) {
    return buildPageUrl(planetId, 'research');
  }

  let backgroundGameFrame = null;
  let backgroundFrameBusy = false;

  const BACKGROUND_FRAME_SANDBOX = 'allow-scripts allow-same-origin allow-forms';

  function normalizeBackgroundNavigationTargets(frame) {
    try {
      const doc = frame.contentDocument;
      if (!doc) return;
      doc.querySelectorAll('base[target]').forEach(base => {
        const target = (base.getAttribute('target') || '').toLowerCase();
        if (target === '_top' || target === '_parent') base.setAttribute('target', '_self');
      });
      doc.querySelectorAll('a[target], form[target]').forEach(element => {
        const target = (element.getAttribute('target') || '').toLowerCase();
        if (target === '_top' || target === '_parent') element.setAttribute('target', '_self');
      });
      if (!doc.__ogbqmTargetGuardInstalled) {
        const forceLocalTarget = event => {
          const element = event.target?.closest?.('a[target], form[target]');
          if (!element) return;
          const target = (element.getAttribute('target') || '').toLowerCase();
          if (target === '_top' || target === '_parent') element.setAttribute('target', '_self');
        };
        doc.addEventListener('click', forceLocalTarget, true);
        doc.addEventListener('submit', forceLocalTarget, true);
        Object.defineProperty(doc, '__ogbqmTargetGuardInstalled', { value: true, configurable: false });
      }
    } catch (error) {
      console.warn('[OGame BQM] Não foi possível normalizar destinos do iframe:', error);
    }
  }

  function getBackgroundGameFrame() {
    if (backgroundGameFrame?.isConnected) return backgroundGameFrame;
    const frame = document.createElement('iframe');
    frame.id = 'ogbqm-background-game-frame';
    frame.title = 'OGame gestor — execução em segundo plano';
    frame.setAttribute('aria-hidden', 'true');
    frame.setAttribute('sandbox', BACKGROUND_FRAME_SANDBOX);
    frame.setAttribute('referrerpolicy', 'same-origin');
    frame.addEventListener('load', () => normalizeBackgroundNavigationTargets(frame));
    Object.assign(frame.style, {
      position: 'fixed', left: '-1400px', top: '0', width: '1280px', height: '900px',
      border: '0', opacity: '0', pointerEvents: 'none', zIndex: '-1'
    });
    document.body.appendChild(frame);
    backgroundGameFrame = frame;
    return frame;
  }

  function backgroundUrlMatches(frame, planetId, component) {
    try {
      const win = frame.contentWindow;
      const doc = frame.contentDocument;
      if (!win || !doc || win.location.origin !== location.origin) return false;
      const params = new URLSearchParams(win.location.search);
      const metaPlanet = doc.querySelector('meta[name="ogame-planet-id"]')?.getAttribute('content') || '';
      const actualPlanet = metaPlanet || params.get('cp') || '';
      return params.get('page') === 'ingame'
        && params.get('component') === component
        && String(actualPlanet) === String(planetId)
        && doc.readyState !== 'loading';
    } catch (_) {
      return false;
    }
  }

  function isExecutionContextCurrent(context, planetId, component) {
    if (!context || context.visible || !context.frame) return false;
    return backgroundUrlMatches(context.frame, planetId, component);
  }

  async function loadBackgroundGamePage(planetId, component) {
    if (backgroundFrameBusy) throw new Error('O executor em segundo plano já está ocupado.');
    backgroundFrameBusy = true;
    try {
      const frame = getBackgroundGameFrame();
      if (!backgroundUrlMatches(frame, planetId, component)) {
        const url = component === 'research' ? researchPageUrl(planetId) : buildPageUrl(planetId, component);
        const loaded = new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Tempo esgotado ao abrir o contexto de execução em segundo plano.')), 20000);
          const onLoad = () => { clearTimeout(timeout); resolve(); };
          const onError = () => { clearTimeout(timeout); reject(new Error('O navegador ou o servidor não permitiu carregar o jogo em contexto oculto.')); };
          frame.addEventListener('load', onLoad, { once: true });
          frame.addEventListener('error', onError, { once: true });
          frame.src = url;
        });
        await loaded;
      }

      const deadline = Date.now() + 15000;
      while (Date.now() < deadline) {
        if (backgroundUrlMatches(frame, planetId, component)) {
          const doc = frame.contentDocument;
          if (doc?.body) {
            normalizeBackgroundNavigationTargets(frame);
            return { frame, doc, visible: false };
          }
        }
        await sleep(250);
      }
      throw new Error('A página do planeta não ficou disponível no executor oculto.');
    } finally {
      backgroundFrameBusy = false;
    }
  }

  function getBackgroundFramePlanetId(frame) {
    try {
      const win = frame?.contentWindow;
      const doc = frame?.contentDocument;
      if (!win || !doc || win.location.origin !== location.origin) return '';
      const params = new URLSearchParams(win.location.search);
      return String(doc.querySelector('meta[name="ogame-planet-id"]')?.getAttribute('content')
        || params.get('cp') || '');
    } catch (_) {
      return '';
    }
  }

  async function restoreVisiblePlanetInBackground() {
    if (!backgroundGameFrame?.isConnected) return true;
    for (let attempt = 0; attempt < 3; attempt++) {
      const visiblePlanetId = String(state.autoBuild?.manualPlanetId || getPagePlanetId() || state.lastObservedPagePlanetId || '');
      if (!visiblePlanetId) return false;
      if (getBackgroundFramePlanetId(backgroundGameFrame) === visiblePlanetId) return true;
      try {
        await loadBackgroundGamePage(visiblePlanetId, 'overview');
        const currentVisibleId = String(state.autoBuild?.manualPlanetId || getPagePlanetId() || state.lastObservedPagePlanetId || '');
        if (getBackgroundFramePlanetId(backgroundGameFrame) === currentVisibleId) return true;
      } catch (error) {
        if (attempt === 2) {
          console.warn('[OGame BQM] Não foi possível repor o planeta ativo na sessão:', error);
          state.autoBuild.lastMessage = `Aviso: não consegui repor o planeta aberto após a tarefa em segundo plano.`;
          save();
          render();
          return false;
        }
        await sleep(250);
      }
    }
    return false;
  }

  function getResearchUpgradeButton(technologyId, doc = document) {
    return doc.querySelector(`button.upgrade[data-technology="${CSS.escape(String(technologyId))}"]`);
  }

  function getResearchLabCandidates(item) {
    const tried = new Set((item.triedPlanets || []).map(String));
    const currentId = String(state.autoBuild?.manualPlanetId || getPagePlanetId());
    const candidates = (state.accountSnapshot?.planets || [])
      .filter(planet => asInt(planet.buildings?.['31']) > 0)
      .sort((a, b) => {
        if (String(a.id) === currentId) return -1;
        if (String(b.id) === currentId) return 1;
        const labDiff = asInt(b.buildings?.['31']) - asInt(a.buildings?.['31']);
        if (labDiff) return labDiff;
        const aTotal = asInt(a.resources?.metal) + asInt(a.resources?.crystal) + asInt(a.resources?.deuterium);
        const bTotal = asInt(b.resources?.metal) + asInt(b.resources?.crystal) + asInt(b.resources?.deuterium);
        return bTotal - aTotal;
      });
    const available = candidates.filter(planet => !tried.has(String(planet.id)));
    return available;
  }

  async function runAutoResearchOnceInternal() {
    reconcileAutomaticResearchQueue();
    if (state.activeResearchLock) return false;
    const inProgress = state.researchQueue.find(item => item.status === 'sent' || item.status === 'started');
    if (inProgress) return false;
    const item = state.researchQueue.find(entry => entry.id === state.autoBuild.currentResearchQueueId
      && entry.status === 'pending' && state.researchSelections?.[String(entry.technologyId)]?.checked
      && (!entry.retryAfter || Number(entry.retryAfter) <= Date.now())) || getNextPendingResearch();
    if (!item) return false;

    const candidates = getResearchLabCandidates(item);
    if (!candidates.length) {
      const hasAnyLab = (state.accountSnapshot?.planets || []).some(planet => asInt(planet.buildings?.['31']) > 0);
      item.triedPlanets = [];
      item.retryAfter = Date.now() + POLL_MIN_MS;
      state.autoBuild.lastMessage = hasAnyLab
        ? 'Nenhum laboratório ficou acessível; vou tentar no próximo ciclo.'
        : 'Não encontrei nenhum planeta com Laboratório de Pesquisas.';
      save();
      return false;
    }

    let selectedContext = null;
    let selectedPlanet = null;
    let selectedButton = null;
    const expectedTarget = Number(item.targetLevel);
    for (const planet of candidates) {
      try {
        const context = await loadBackgroundGamePage(planet.id, 'research');
        let button = null;
        const deadline = Date.now() + 10000;
        while (Date.now() < deadline) {
          if (!state.autoBuild.active) return true;
          button = getResearchUpgradeButton(item.technologyId, context.doc);
          if (button) break;
          await sleep(250);
        }
        if (!button) {
          item.triedPlanets ||= [];
          if (!item.triedPlanets.includes(String(planet.id))) item.triedPlanets.push(String(planet.id));
          continue;
        }
        const actualTarget = getButtonTargetLevel(button);
        if (actualTarget !== expectedTarget) {
          item.triedPlanets ||= [];
          if (!item.triedPlanets.includes(String(planet.id))) item.triedPlanets.push(String(planet.id));
          continue;
        }
        if (button.disabled || button.getAttribute('aria-disabled') === 'true' || button.classList.contains('disabled')) {
          item.triedPlanets ||= [];
          if (!item.triedPlanets.includes(String(planet.id))) item.triedPlanets.push(String(planet.id));
          continue;
        }
        selectedContext = context;
        selectedPlanet = planet;
        selectedButton = button;
        break;
      } catch (error) {
        item.lastBackgroundError = error?.message || String(error);
      }
    }

    if (!selectedContext || !selectedButton || !selectedPlanet) {
      item.retryAfter = Date.now() + POLL_MIN_MS;
      state.autoBuild.currentResearchQueueId = null;
      state.autoBuild.lastMessage = item.lastBackgroundError
        ? `Erro ao carregar laboratório (${item.lastBackgroundError}).`
        : `Não encontrei botão válido para ${item.research}, nível ${expectedTarget}.`;
      save();
      return false;
    }

    if (!state.researchSelections?.[String(item.technologyId)]?.checked) {
      item.status = 'cancelled';
      state.autoBuild.currentResearchQueueId = null;
      state.autoBuild.lastMessage = `${item.research} foi retirada da seleção.`;
      save();
      return false;
    }

    const doc = selectedContext.doc;
    if (!isExecutionContextCurrent(selectedContext, selectedPlanet.id, 'research')) {
      item.retryAfter = Date.now() + POLL_MIN_MS;
      state.autoBuild.currentResearchQueueId = null;
      state.autoBuild.lastMessage = 'O contexto mudou antes do envio; não iniciei a pesquisa.';
      save();
      scheduleNextAutoCheck(null, null);
      return false;
    }
    const beforeCard = (selectedButton.closest('.technology') || selectedButton.parentElement)?.outerHTML || '';
    const beforeResearch = doc.querySelector('.researchQueue, .researchqueue, #researchQueue, .research.active')?.textContent || '';
    item.status = 'sent';
    item.sentAt = new Date().toISOString();
    item.sourcePlanetId = String(selectedPlanet.id);
    item.sourcePlanet = selectedPlanet.name;
    item.visualConfirmation = false;
    item.retryAfter = null;
    state.autoBuild.currentResearchQueueId = null;
    state.autoBuild.lastMessage = `A submeter ${item.research}, nível ${expectedTarget} em ${selectedPlanet.name}…`;
    save();
    render();
    selectedButton.click();
    await sleep(1800);

    const afterDoc = selectedContext.frame?.contentDocument || doc;
    const buttonAfter = getResearchUpgradeButton(item.technologyId, afterDoc);
    const afterCard = (buttonAfter?.closest('.technology') || buttonAfter?.parentElement)?.outerHTML || '';
    const afterResearch = afterDoc.querySelector('.researchQueue, .researchqueue, #researchQueue, .research.active')?.textContent || '';
    const confirmed = !buttonAfter || buttonAfter.disabled || getButtonTargetLevel(buttonAfter) !== expectedTarget
      || (beforeCard && afterCard && beforeCard !== afterCard)
      || (beforeResearch && afterResearch && beforeResearch !== afterResearch);
    item.visualConfirmation = Boolean(confirmed);
    item.lastAttemptAt = new Date().toISOString();
    if (confirmed) {
      state.activeResearchLock = {
        technologyId: String(item.technologyId),
        targetLevel: expectedTarget,
        research: item.research,
        sourcePlanetId: String(selectedPlanet.id),
        sourcePlanet: selectedPlanet.name,
        startedAt: item.sentAt
      };
      state.researchQueue = state.researchQueue.filter(entry => entry.id !== item.id);
      const technologyId = String(item.technologyId);
      state.researchSelections ||= {};
      state.researchSelections[technologyId] ||= {};
      state.researchSelections[technologyId].checked = false;
      const researchRow = [...root.querySelectorAll('.research-row')]
        .find(row => String(row.dataset.researchId || '') === technologyId);
      const researchCheckbox = researchRow?.querySelector('.research-check');
      if (researchCheckbox) researchCheckbox.checked = false;
      state.autoBuild.lastMessage = `${item.research}, nível ${expectedTarget}: iniciada.`;
    } else {
      item.status = 'sent';
      state.autoBuild.lastMessage = `${item.research}, nível ${expectedTarget}: pedido enviado.`;
    }
    save();
    render();
    scheduleNextAutoCheck('Verificação concluída; continuo a monitorizar.', null);
    return true;
  }

  async function runAutoResearchOnce() {
    try {
      return await runAutoResearchOnceInternal();
    } finally {
      await restoreVisiblePlanetInBackground();
    }
  }

  function getBuildingComponent(buildingId) {
    const resourceBuildings = new Set(['1', '2', '3', '4', '12', '22', '23', '24']);
    return resourceBuildings.has(String(buildingId)) ? 'supplies' : 'facilities';
  }

  function getUpgradeButton(buildingId, doc = document) {
    return doc.querySelector(`button.upgrade[data-technology="${CSS.escape(String(buildingId))}"]`);
  }

  function getButtonTargetLevel(button) {
    const label = `${button?.getAttribute('aria-label') || ''} ${button?.getAttribute('data-tooltip-title') || ''}`;
    const match = label.match(/(?:nível|level)\s+(\d+)/i);
    return match ? Number(match[1]) : null;
  }

  function isSelectedBuilding(planetId, buildingId) {
    return getSelectedBuildingIds(planetId).includes(String(buildingId));
  }

  function isActiveQueueItem(item) {
    return item && ['pending', 'sent', 'started'].includes(item.status)
      && /^\d+$/.test(String(item.buildingId || ''));
  }

  function getPlanetSnapshot(planetId) {
    return state.accountSnapshot?.planets?.find(planet => String(planet.id) === String(planetId)) || null;
  }

  function hasBuildingLock(planetId, buildingId) {
    return (state.activeBuildingLocks || []).some(lock =>
      String(lock.planetId) === String(planetId)
      && String(lock.buildingId) === String(buildingId)
    );
  }

  function addBuildingLock(item) {
    state.activeBuildingLocks ||= [];
    const exists = state.activeBuildingLocks.some(lock =>
      String(lock.planetId) === String(item.planetId)
      && String(lock.buildingId) === String(item.buildingId)
      && Number(lock.targetLevel) === Number(item.targetLevel)
    );
    if (!exists) {
      state.activeBuildingLocks.push({
        planetId: String(item.planetId),
        buildingId: String(item.buildingId),
        building: item.building,
        planet: item.planet,
        targetLevel: Number(item.targetLevel),
        startedAt: item.sentAt || item.lastAttemptAt || new Date().toISOString()
      });
    }
  }

  function reconcileAutomaticQueue() {
    const planets = state.accountSnapshot?.planets || [];
    if (!planets.length) return;
    state.activeBuildingLocks ||= [];
    state.activeBuildingLocks = state.activeBuildingLocks.filter(lock => {
      const planet = getPlanetSnapshot(lock.planetId);
      if (!planet) return true;
      const actualLevel = asInt(planet.buildings?.[String(lock.buildingId)]);
      return actualLevel < Number(lock.targetLevel);
    });
    for (let index = state.queue.length - 1; index >= 0; index--) {
      const item = state.queue[index];
      if (!isActiveQueueItem(item)) {
        state.queue.splice(index, 1);
        continue;
      }
      const planet = getPlanetSnapshot(item.planetId);
      const actualLevel = planet ? asInt(planet.buildings?.[String(item.buildingId)]) : null;
      if (actualLevel !== null && actualLevel >= Number(item.targetLevel)) {
        state.queue.splice(index, 1);
        continue;
      }
      if (item.status === 'pending' && !isSelectedBuilding(item.planetId, item.buildingId)) {
        state.queue.splice(index, 1);
        continue;
      }
      if (item.status === 'started' || (item.status === 'sent' && item.visualConfirmation)) {
        addBuildingLock(item);
        state.queue.splice(index, 1);
      }
    }
    for (const planet of planets) {
      for (const buildingId of getSelectedBuildingIds(planet.id)) {
        const hasInFlightSameBuilding = hasBuildingLock(planet.id, buildingId);
        const hasQueuedOrder = state.queue.some(item =>
          String(item.planetId) === String(planet.id)
          && String(item.buildingId) === String(buildingId)
          && isActiveQueueItem(item)
        );
        if (hasInFlightSameBuilding || hasQueuedOrder) continue;
        const currentLevel = asInt(planet.buildings?.[buildingId]);
        state.queue.push({
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          building: BUILDINGS[buildingId] || `Edifício #${buildingId}`,
          planet: planet.name,
          planetId: String(planet.id),
          buildingId: String(buildingId),
          currentLevel,
          targetLevel: currentLevel + 1,
          status: 'pending',
          autoGenerated: true,
          createdAt: new Date().toISOString()
        });
      }
    }
    save();
  }

  function findReadyQueueItems() {
    const planets = state.accountSnapshot?.planets || [];
    const planetsAlreadyBuilding = new Set([
      ...(state.queue || []).filter(item => item.status === 'sent' || item.status === 'started').map(item => String(item.planetId)),
      ...(state.activeBuildingLocks || []).map(lock => String(lock.planetId))
    ]);
    const pending = state.queue.filter(item => item.status === 'pending')
      .filter(item => isSelectedBuilding(item.planetId, item.buildingId))
      .filter(item => !item.retryAfter || Number(item.retryAfter) <= Date.now())
      .filter(item => !planetsAlreadyBuilding.has(String(item.planetId)))
      .sort((a, b) => {
        const currentId = String(state.autoBuild?.manualPlanetId || getPagePlanetId());
        const aCurrent = String(a.planetId) === currentId;
        const bCurrent = String(b.planetId) === currentId;
        if (aCurrent !== bCurrent) return aCurrent ? -1 : 1;
        const pa = planets.findIndex(planet => String(planet.id) === String(a.planetId));
        const pb = planets.findIndex(planet => String(planet.id) === String(b.planetId));
        if (pa !== pb) return pa - pb;
        return String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
      });
    const seenPlanets = new Set();
    return pending.filter(item => {
      const planetId = String(item.planetId);
      if (seenPlanets.has(planetId)) return false;
      seenPlanets.add(planetId);
      return true;
    });
  }

  function scheduleNextAutoCheck(message) {
    if (autoBuildTimer) clearTimeout(autoBuildTimer);
    if (!state.autoBuild?.active) return;
    const wait = randomPollDelay();
    state.autoBuild.nextCheckAt = Date.now() + wait;
    if (message) state.autoBuild.lastMessage = `${message} Próxima verificação em ${Math.round(wait / 1000)} s.`;
    save();
    render();
    autoBuildTimer = setTimeout(() => {
      autoBuildTimer = null;
      state.autoBuild.nextCheckAt = null;
      runAutoBuild();
    }, wait);
  }

  function stopAutoBuild(message) {
    if (autoBuildTimer) clearTimeout(autoBuildTimer);
    autoBuildTimer = null;
    state.autoBuild.active = false;
    state.autoBuild.currentQueueId = null;
    state.autoBuild.currentResearchQueueId = null;
    state.autoBuild.nextCheckAt = null;
    accountRefreshDueAt = null;
    state.autoBuild.resumeAfterNavigation = false;
    state.autoBuild.navigationTarget = null;
    state.autoBuild.manualNavigationHold = false;
    state.autoBuild.lastMessage = message;
    save();
    render();
    scheduleAccountRefresh();
  }

  async function tryStartBuildingItemInternal(item) {
    const planet = getPlanetSnapshot(item.planetId);
    if (!planet || !Object.prototype.hasOwnProperty.call(planet.buildings || {}, String(item.buildingId))) {
      item.retryAfter = Date.now() + POLL_MIN_MS;
      return { started: false, message: `Sem dados de ${item.building} em ${item.planet}.` };
    }
    let context;
    try {
      context = await loadBackgroundGamePage(item.planetId, getBuildingComponent(item.buildingId));
    } catch (error) {
      item.retryAfter = Date.now() + POLL_MIN_MS;
      item.lastBackgroundError = error?.message || String(error);
      return { started: false, message: `Não consegui abrir ${item.planet} em segundo plano.` };
    }
    let button = null;
    const deadline = Date.now() + 12000;
    while (Date.now() < deadline) {
      if (!state.autoBuild.active) return { started: false, stopped: true };
      button = getUpgradeButton(item.buildingId, context.doc);
      if (button) break;
      await sleep(250);
    }
    if (!button) {
      item.retryAfter = Date.now() + POLL_MIN_MS;
      return { started: false, message: `Não encontrei o botão de ${item.building} em ${item.planet}.` };
    }
    const expectedTarget = Number(item.targetLevel);
    const actualButtonTarget = getButtonTargetLevel(button);
    if (actualButtonTarget !== expectedTarget) {
      item.retryAfter = Date.now() + POLL_MIN_MS;
      return { started: false, message: `${item.building} em ${item.planet}: nível incorreto.` };
    }
    if (button.disabled || button.getAttribute('aria-disabled') === 'true' || button.classList.contains('disabled')) {
      item.retryAfter = Date.now() + POLL_MIN_MS;
      return { started: false, message: `${item.building} em ${item.planet}: botão indisponível.` };
    }
    if (!isSelectedBuilding(item.planetId, item.buildingId)) {
      item.retryAfter = Date.now() + POLL_MIN_MS;
      return { started: false, message: `${item.building} em ${item.planet}: seleção desativada.` };
    }
    if (!isExecutionContextCurrent(context, item.planetId, getBuildingComponent(item.buildingId))) {
      item.retryAfter = Date.now() + POLL_MIN_MS;
      return { started: false, message: `O contexto de ${item.planet} mudou.` };
    }
    const technologyCard = button.closest('li.technology') || button.parentElement;
    const beforeCard = technologyCard?.outerHTML || '';
    const beforeQueue = context.doc.querySelector('#buildingqueue, #buildingQueue, .buildingQueue, .construction.active')?.textContent || '';
    if (!state.autoBuild.active) return { started: false, stopped: true };
    item.status = 'sent';
    item.sentAt = new Date().toISOString();
    item.visualConfirmation = false;
    item.retryAfter = null;
    state.autoBuild.currentQueueId = item.id;
    state.autoBuild.lastMessage = `A submeter ${item.building} nível ${expectedTarget} em ${item.planet}…`;
    save();
    render();
    button.click();
    await sleep(1800);
    const afterDoc = context.frame?.contentDocument || context.doc;
    const buttonAfter = getUpgradeButton(item.buildingId, afterDoc);
    const afterCard = (buttonAfter?.closest('li.technology') || buttonAfter?.parentElement)?.outerHTML || '';
    const afterQueue = afterDoc.querySelector('#buildingqueue, #buildingQueue, .buildingQueue, .construction.active')?.textContent || '';
    const visuallyConfirmed = !buttonAfter || buttonAfter.disabled
      || getButtonTargetLevel(buttonAfter) !== expectedTarget
      || (afterCard && beforeCard && afterCard !== beforeCard)
      || (afterQueue && afterQueue !== beforeQueue);
    item.visualConfirmation = Boolean(visuallyConfirmed);
    item.lastAttemptAt = new Date().toISOString();
    state.autoBuild.currentQueueId = null;
    if (visuallyConfirmed) {
      addBuildingLock(item);
      state.queue = state.queue.filter(entry => entry.id !== item.id);
      state.buildingSelections ||= {};
      const planetSelections = state.buildingSelections[String(item.planetId)] ||= {};
      const buildingSelection = planetSelections[String(item.buildingId)] ||= {};
      buildingSelection.checked = false;
      const visibleList = root.querySelector('.building-list');
      if (visibleList && String(visibleList.dataset.planetId || '') === String(item.planetId)) {
        const row = [...visibleList.querySelectorAll('.building-row')]
          .find(element => String(element.dataset.buildingId || '') === String(item.buildingId));
        const checkbox = row?.querySelector('.building-check');
        if (checkbox) checkbox.checked = false;
      }
    } else {
      item.status = 'sent';
    }
    save();
    render();
    return {
      started: Boolean(visuallyConfirmed),
      submitted: true,
      confirmed: Boolean(visuallyConfirmed),
      message: `${item.building} nível ${expectedTarget} em ${item.planet}: ${visuallyConfirmed ? 'iniciada' : 'pedido enviado'}.`
    };
  }

  async function tryStartBuildingItem(item) {
    try {
      return await tryStartBuildingItemInternal(item);
    } finally {
      await restoreVisiblePlanetInBackground();
    }
  }

  async function runAutoBuild(options = {}) {
    if (autoBuildBusy || !state.autoBuild?.active || state.mode !== 'auto') return;
    autoBuildBusy = true;
    try {
      const canResumeSnapshot = Boolean(options.skipRefresh && state.accountSnapshot?.planets?.length);
      const refreshed = canResumeSnapshot || await readAccountData({ silent: true });
      if (!refreshed) {
        scheduleNextAutoCheck('Não foi possível atualizar os dados da conta.', null);
        return;
      }
      state.autoBuild.lastScanAt = new Date().toISOString();
      reconcileAutomaticQueue();
      reconcileAutomaticResearchQueue();
      const readyItems = findReadyQueueItems();
      const outcomes = [];
      let startedCount = 0;
      for (const item of readyItems) {
        if (!state.autoBuild.active || state.mode !== 'auto') break;
        try {
          const result = await tryStartBuildingItem(item);
          if (result.started) startedCount++;
          if (result.message) outcomes.push(result.message);
          if (result.stopped) break;
        } catch (error) {
          item.retryAfter = Date.now() + POLL_MIN_MS;
          outcomes.push(`Erro em ${item.planet}: ${error?.message || error}`);
        }
      }
      state.autoBuild.currentQueueId = null;
      save();
      const researchHandled = await runAutoResearchOnce();
      if (researchHandled) return;
      await restoreVisiblePlanetInBackground();
      const selectedCount = (state.accountSnapshot?.planets || []).reduce((total, planet) =>
        total + getSelectedBuildingIds(planet.id).length, 0);
      const selectedResearchCount = getSelectedResearchIds().length;
      const activeResearch = state.researchQueue.find(entry => entry.status === 'sent' || entry.status === 'started') || state.activeResearchLock;
      let message;
      if (startedCount > 0) {
        message = `Ciclo concluído: ${startedCount} construção(ões) submetida(s).`;
        if (outcomes.length > startedCount) message += ` ${outcomes.filter(Boolean).join(' ')}`;
      } else if (outcomes.length) {
        message = `Verifiquei ${readyItems.length} planeta(s), mas não iniciei novas construções. ${outcomes.join(' ')}`;
      } else if (activeResearch) {
        message = `${activeResearch.research} nível ${activeResearch.targetLevel} está em investigação.`;
      } else {
        message = (selectedCount || selectedResearchCount)
          ? `Verificados ${selectedCount} edifício(s) e ${selectedResearchCount} pesquisa(s).`
          : 'Monitorização ativa, mas sem seleções.';
      }
      scheduleNextAutoCheck(message, null);
    } catch (error) {
      console.error('[OGame BQM] Erro no ciclo automático:', error);
      scheduleNextAutoCheck(`Erro no ciclo automático: ${error?.message || error}.`, null);
    } finally {
      autoBuildBusy = false;
    }
  }

  function startAutoBuild() {
    if (state.mode !== 'auto') {
      alert('Ativa primeiro o modo Automático.');
      return;
    }
    const selectedCount = (state.accountSnapshot?.planets || []).reduce((total, planet) =>
      total + getSelectedBuildingIds(planet.id).length, 0);
    const selectedResearchCount = getSelectedResearchIds().length;
    if (!selectedCount && !selectedResearchCount) {
      alert('Seleciona pelo menos um edifício ou uma pesquisa.');
      return;
    }
    if (autoBuildTimer) clearTimeout(autoBuildTimer);
    if (accountRefreshTimer) clearTimeout(accountRefreshTimer);
    accountRefreshTimer = null;
    accountRefreshDueAt = null;
    state.autoBuild.resumeAfterNavigation = false;
    state.autoBuild.navigationTarget = null;
    state.autoBuild.manualNavigationHold = false;
    state.autoBuild.active = true;
    state.autoBuild.manualPlanetId = String(getPagePlanetId() || state.autoBuild.manualPlanetId || '');
    state.autoBuild.currentQueueId = null;
    state.autoBuild.currentResearchQueueId = null;
    state.autoBuild.nextCheckAt = null;
    reconcileAutomaticResearchQueue();
    state.autoBuild.lastMessage = 'Monitorização iniciada.';
    save();
    render();
    runAutoBuild();
  }

  function render() {
    captureBuildingSelections();
    captureResearchSelections();
    root.style.top = `${Math.max(4, Math.min(state.position.top, window.innerHeight - 100))}px`;
    root.style.right = `${Math.max(4, Math.min(state.position.right, window.innerWidth - 100))}px`;
    root.classList.toggle('min', !!state.minimized);

    const current = getCurrentPlanet();
    const displayed = getDisplayedPlanet();
    const allPlanets = state.accountSnapshot?.planets || [];
    const next = state.queue.find(item => item.status === 'pending');
    const sent = state.queue.find(item => item.status === 'sent');
    const inProgressBuilding = (state.activeBuildingLocks || [])[0] || null;
    const queueHtml = state.queue.length ? state.queue.map((item, index) => {
      const queueStatus = item.status === 'done' ? t('statusDone')
        : item.status === 'cancelled' ? t('statusCancelled')
        : item.status === 'started' ? t('statusStarted')
        : item.status === 'sent' ? t('statusSent')
        : item.retryAfter && Number(item.retryAfter) > Date.now() ? t('statusRetry')
        : t('statusWaitGame');
      const assessmentHtml = `<div class=\"item-status ${item.status === 'started' ? 'started' : item.status === 'sent' ? 'sent' : 'wait'}\">${esc(queueStatus)}</div>`;
      return `
      <div class="item ${next && next.id === item.id ? 'current' : ''}">
        <div><div class="item-title">${index + 1}. ${esc(item.building)} — nível ${Number(item.targetLevel)}</div>
          <div class="item-meta">${esc(item.planet || 'Planeta por definir')} · ${item.status === 'done' ? t('statusDone') : item.status === 'cancelled' ? t('statusCancelled') : item.status === 'started' ? t('statusStarted') : item.status === 'sent' ? t('statusSent') : t('statusWait')}${Number.isInteger(item.currentLevel) ? ` · atual ${item.currentLevel}` : ''}</div></div>
        <div class="item-buttons">
          <button data-action="up" data-id="${esc(item.id)}" ${index === 0 ? 'disabled' : ''} title="Mover para cima">↑</button>
          <button data-action="down" data-id="${esc(item.id)}" ${index === state.queue.length - 1 ? 'disabled' : ''} title="Mover para baixo">↓</button>
          <button data-action="cancel-order" data-id="${esc(item.id)}" title="Anular" aria-label="Anular ${esc(item.building)}">×</button>
        </div>
        ${assessmentHtml}
      </div>`;
    }).join('') : `<div class="muted">${t('buildingQueueEmpty')}</div>`;

    const statusClass = readStatus.startsWith('Leitura concluída') ? 'notice good'
      : (readStatus.startsWith('Não foi possível') ? 'notice error' : 'notice');
    const snapshotAge = state.accountSnapshot?.syncedAt
      ? new Date(state.accountSnapshot.syncedAt).toLocaleString('pt-PT') : 'Ainda não lido';
    const planetOptions = allPlanets.map(planet =>
      `<option value="${esc(planet.id)}" ${String(planet.id) === String(displayed?.id) ? 'selected' : ''}>${esc(planet.type === 'moon' ? 'Lua' : 'Planeta')} · ${esc(planet.name)} ${planet.coords ? `[${esc(planet.coords)}]` : ''}</option>`
    ).join('');
    const analysisHtml = state.mode === 'auto' ? `<div class=\"section\"><strong>${t('autoBuildTitle')}</strong><div class=\"muted\">${t('autoBuildMuted')}</div>${renderAutomaticSuggestions()}</div>` : '';
    const selectedResearchCount = getSelectedResearchIds().length;
    const activeResearchItem = state.researchQueue.find(item => item.status === 'sent' || item.status === 'started') || state.activeResearchLock;
    const researchTabHtml = `
      <div class=\"section\"><strong>${t('researchGlobalTitle')}</strong>
        <div class=\"muted\">${t('researchGlobalMuted')}</div>
        <div class=\"research-list\">${renderResearchChoices()}</div>
        ${state.mode === 'manual' ? '<button class=\"primary\" data-action=\"add-selected-research\">' + t('addSelectedRes') + '</button>' : (state.autoBuild?.active ? '<button data-action=\"stop-auto-build\">' + t('stopAuto') + '</button>' : '<button class=\"primary\" data-action=\"prepare-and-run\">' + t('startAuto') + '</button>')}
        <div class=\"muted\">${t('researchSelected')}: ${selectedResearchCount} · ${t('researchKnown')}: ${Object.keys(state.accountSnapshot?.researches || {}).length}/${Object.keys(RESEARCHES).length}</div>
      </div>
      ${state.mode === 'auto' ? `<div class=\"section\"><strong>${t('autoResearchTitle')}</strong>
        <div class=\"muted\">${t('autoResearchMuted')}</div>
        ${activeResearchItem ? `<div class=\"notice good\">${t('researchInProgress')}: ${esc(activeResearchItem.research)} nível ${Number(activeResearchItem.targetLevel)}${activeResearchItem.sourcePlanet ? ` · ${esc(activeResearchItem.sourcePlanet)}` : ''}.</div>` : '<div class=\"muted\">Não há investigação submetida.</div>'}
        <div class=\"muted\">Monitorização integrada com a fila de edifícios.</div>
        ${state.autoBuild?.lastMessage ? `<div class=\"notice\">${esc(state.autoBuild.lastMessage)}</div>` : ''}
      </div>` : ''}
      <div class=\"section\"><div class=\"topline\"><strong>${t('researchQueueTitle')}</strong><strong>${state.researchQueue.length}</strong></div>
        <div class=\"queue\">${renderResearchQueue()}</div>
        <div class=\"muted\">${t('researchQueueMuted')}</div>
      </div>`;
    const buildingTabHtml = `
      <div class=\"section\">
        <strong>${t('buildingSelectTitle')}</strong>
        ${allPlanets.length ? `<select class=\"planet-select\" id=\"ogbqm-select-planet\">${planetOptions}</select>` : '<div class=\"muted\">Atualiza os dados para carregar os planetas.</div>'}
        ${displayed ? `<div class=\"muted\">${esc(displayed.name)} ${displayed.coords ? `· ${esc(displayed.coords)}` : ''} — ${t('buildingSelectMuted')}</div>` : ''}
        <div class=\"list-head\"><span></span><span>${t('listHeadBuilding')}</span><span>${t('listHeadCurrent')}</span><span>${t('listHeadTarget')}</span></div>
        <div class=\"building-list\" data-planet-id=\"${esc(displayed?.id || '')}\">${renderBuildingChoices(displayed)}</div>
        <button class=\"primary\" data-action=\"add-selected\" ${displayed && state.mode === 'manual' ? '' : 'disabled'} style=\"${state.mode === 'auto' ? 'display:none' : ''}\">${t('addSelected')}</button>
      </div>
      ${analysisHtml}
      <div class=\"section\"><div class=\"topline\"><strong>${t('queueBuildings')}</strong><strong>${state.queue.length}</strong></div>
        <div class=\"queue\">${queueHtml}</div>
        <div class=\"actions\"><button data-action=\"export\">${t('export')}</button><button data-action=\"reset\">${t('reset')}</button></div>
      </div>`;

    root.innerHTML = `
      <div class="head" id="ogbqm-drag">
        <div><div class="brand">${t('brand')}</div><div class="muted">S181 · v${VERSION}</div></div>
        <button data-action="min" title="${state.minimized ? t('expand') : t('min')}">${state.minimized ? '□' : '—'}</button>
      </div>
      <div class="body">
        <div class="mode">
          <div><strong>${state.mode === 'manual' ? t('modeManual') : t('modeAuto')}</strong>
            <div class="muted">${state.mode === 'manual' ? t('modeManualDesc') : t('modeAutoDesc')}</div></div>
          <label class="switch" title="Alternar modo"><input id="ogbqm-mode" type="checkbox" ${state.mode === 'auto' ? 'checked' : ''}><span class="slider"></span></label>
        </div>

        <div class="section">
          <div class="topline"><strong>${t('planetOpen')}: ${esc(current.name)}</strong><span class="muted">${esc(current.coords || '')}</span></div>
          <div class="topline"><span class="muted">${t('lastRead')}: ${esc(snapshotAge)}</span>
            <button data-action="read" ${readBusy ? 'disabled' : ''}>${readBusy ? t('reading') : t('updateNow')}</button></div>
          <div class="muted">Os dados são atualizados automaticamente a cada 45–60 segundos.</div>
          ${readStatus ? `<div class="${statusClass}">${esc(readStatus)}</div>` : ''}
        </div>

        <div class="countdown-panel"><span>${t('globalCheck')}</span><strong id="ogbqm-countdown">${esc(getAutoCountdownText())}</strong></div>

        <div class="tabs">
          <button data-action="tab-buildings" class="${state.activeTab === 'buildings' ? 'active' : ''}">${t('tabBuildings')} (${state.queue.filter(item => !['done','cancelled'].includes(item.status)).length})</button>
          <button data-action="tab-research" class="${state.activeTab === 'research' ? 'active' : ''}">${t('tabResearch')} (${state.researchQueue.filter(item => !['done','cancelled'].includes(item.status)).length})</button>
        </div>
        ${state.activeTab === 'research' ? researchTabHtml : buildingTabHtml}
        <div class="footer">${state.activeTab === 'research'
          ? (activeResearchItem ? `Em curso: ${esc(activeResearchItem.research)} nível ${Number(activeResearchItem.targetLevel)}` : t('footerResearch'))
          : (next ? `${t('footerBuildingNext')}: ${esc(next.building)} nível ${Number(next.targetLevel)}` : sent ? `${t('footerBuildingSent')}: ${esc(sent.building)} nível ${Number(sent.targetLevel)}` : inProgressBuilding ? `${t('footerBuildingProgress')}: ${esc(inProgressBuilding.building)} nível ${Number(inProgressBuilding.targetLevel)}` : t('footerBuildingEmpty'))}
          ${state.mode === 'auto' ? t('footerAutoActive') : t('footerManual')}</div>
      </div>`;
  }

  root.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    const id = button.dataset.id;
    const index = state.queue.findIndex(item => item.id === id);

    if (action === 'read') { readAccountData().finally(() => { if (state.autoBuild?.active) scheduleNextAutoCheck('Atualização manual concluída.', null); else scheduleAccountRefresh(); }); return; }
    if (action === 'tab-buildings') { captureResearchSelections(); state.activeTab = 'buildings'; save(); render(); return; }
    if (action === 'tab-research') { captureBuildingSelections(); state.activeTab = 'research'; save(); render(); return; }
    if (action === 'add-selected-research') {
      captureResearchSelections();
      const ids = getSelectedResearchIds();
      if (!ids.length) return alert('Seleciona pelo menos uma pesquisa.');
      let added = 0;
      for (const technologyId of ids) {
        const level = getResearchLevel(technologyId);
        if (level === null) continue;
        const duplicate = state.researchQueue.some(item => String(item.technologyId) === technologyId && !['done', 'cancelled'].includes(item.status));
        if (duplicate) continue;
        state.researchQueue.push({
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          type: 'research', technologyId, research: RESEARCHES[technologyId].name,
          currentLevel: level, targetLevel: level + 1, status: 'pending', createdAt: new Date().toISOString()
        });
        added++;
      }
      save(); render(); return;
    }
    if (action === 'cancel-research') {
      const researchIndex = state.researchQueue.findIndex(item => item.id === id);
      if (researchIndex < 0) return;
      const item = state.researchQueue[researchIndex];
      const sent = item.status === 'sent' || item.status === 'started';
      state.researchSelections ||= {};
      state.researchSelections[String(item.technologyId)] = { checked: false };
      if (sent) {
        state.activeResearchLock = { technologyId: String(item.technologyId), targetLevel: Number(item.targetLevel), research: item.research, sourcePlanetId: item.sourcePlanetId || '', sourcePlanet: item.sourcePlanet || '' };
      }
      state.researchQueue.splice(researchIndex, 1);
      save(); render(); return;
    }
    if (action === 'research-up' || action === 'research-down') {
      const visible = state.researchQueue.filter(item => item.status !== 'cancelled');
      const ri = visible.findIndex(item => item.id === id);
      if (ri >= 0) {
        const targetIndex = action === 'research-up' ? ri - 1 : ri + 1;
        if (targetIndex >= 0 && targetIndex < visible.length) {
          const a = state.researchQueue.indexOf(visible[ri]);
          const b = state.researchQueue.indexOf(visible[targetIndex]);
          [state.researchQueue[a], state.researchQueue[b]] = [state.researchQueue[b], state.researchQueue[a]];
        }
      }
      save(); render(); return;
    }
    if (action === 'stop-auto-build') { stopAutoBuild('Automatismo parado.'); return; }
    if (action === 'prepare-and-run') { startAutoBuild(); return; }
    if (action === 'min') state.minimized = !state.minimized;
    if (action === 'add-selected') {
      captureBuildingSelections();
      const planet = getDisplayedPlanet();
      if (!planet) return alert('Atualiza primeiro os dados.');
      const checkedRows = [...root.querySelectorAll('.building-row')].filter(row => row.querySelector('.building-check')?.checked);
      if (!checkedRows.length) return alert('Seleciona pelo menos um edifício.');
      let added = 0;
      for (const row of checkedRows) {
        const buildingId = row.dataset.buildingId;
        const building = BUILDINGS[buildingId] || `Edifício #${buildingId}`;
        const currentLevel = asInt(row.dataset.currentLevel);
        const targetLevel = Number(row.querySelector('.target-level')?.value);
        if (!Number.isInteger(targetLevel) || targetLevel <= currentLevel) continue;
        const duplicate = hasBuildingLock(planet.id, buildingId) || state.queue.some(item => item.status !== 'done' && String(item.planetId) === String(planet.id) && String(item.buildingId) === String(buildingId) && Number(item.targetLevel) === targetLevel);
        if (duplicate) continue;
        state.queue.push({
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          building, planet: planet.name, planetId: String(planet.id), buildingId: String(buildingId), currentLevel, targetLevel, status: 'pending', createdAt: new Date().toISOString()
        });
        added++;
      }
      save(); render(); return;
    }
    if ((action === 'cancel-order' || action === 'delete') && index >= 0) {
      const item = state.queue[index];
      const alreadySent = item.status === 'sent' || item.status === 'started';
      if (state.mode === 'auto' || item.autoGenerated) {
        captureBuildingSelections();
        const visibleList = root.querySelector('.building-list');
        if (visibleList && String(visibleList.dataset.planetId || '') === String(item.planetId)) {
          const row = [...visibleList.querySelectorAll('.building-row')].find(element => String(element.dataset.buildingId || '') === String(item.buildingId));
          const checkbox = row?.querySelector('.building-check');
          if (checkbox) checkbox.checked = false;
        }
        state.buildingSelections ||= {};
        const planetSelections = state.buildingSelections[String(item.planetId)] ||= {};
        const buildingSelection = planetSelections[String(item.buildingId)] ||= {};
        buildingSelection.checked = false;
      }
      if (alreadySent) addBuildingLock(item);
      state.queue.splice(index, 1);
      save(); render(); return;
    }
    if (action === 'up' && index > 0) [state.queue[index - 1], state.queue[index]] = [state.queue[index], state.queue[index - 1]];
    if (action === 'down' && index >= 0 && index < state.queue.length - 1) [state.queue[index + 1], state.queue[index]] = [state.queue[index], state.queue[index + 1]];
    if (action === 'export') {
      const blob = new Blob([JSON.stringify({ version: VERSION, buildingQueue: state.queue, researchQueue: state.researchQueue }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'ogame-queue-s181.json'; anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    if (action === 'reset' && confirm('Apagar tudo?')) state = clone(DEFAULTS);
    save(); render();
  });

  root.addEventListener('change', event => {
    if (event.target.matches('.research-check')) {
      captureResearchSelections();
      save();
      if (state.mode === 'auto' && state.autoBuild?.active) reconcileAutomaticResearchQueue();
      render();
      return;
    }
    if (event.target.matches('.building-check, .target-level')) {
      captureBuildingSelections();
      save();
      render();
      return;
    }
    if (event.target.id === 'ogbqm-mode') {
      state.mode = event.target.checked ? 'auto' : 'manual';
      if (state.mode === 'manual' && state.autoBuild?.active) {
        if (autoBuildTimer) clearTimeout(autoBuildTimer);
        autoBuildTimer = null;
        state.autoBuild.active = false;
      }
      normalizeAutoSelections();
      if (state.mode === 'auto') reconcileAutomaticResearchQueue();
      save(); render();
      if (state.mode === 'manual') scheduleAccountRefresh();
    }
    if (event.target.id === 'ogbqm-select-planet') {
      captureBuildingSelections();
      state.selectedPlanetId = event.target.value;
      save(); render();
    }
  });

  root.addEventListener('pointerdown', event => {
    const handle = event.target.closest('#ogbqm-drag');
    if (!handle || event.target.closest('button')) return;
    const rect = root.getBoundingClientRect();
    drag = { x: event.clientX, y: event.clientY, top: rect.top, right: window.innerWidth - rect.right };
    handle.setPointerCapture?.(event.pointerId);
  });
  root.addEventListener('pointermove', event => {
    if (!drag) return;
    state.position.top = Math.max(4, Math.min(window.innerHeight - 100, drag.top + event.clientY - drag.y));
    state.position.right = Math.max(4, Math.min(window.innerWidth - 100, drag.right - (event.clientX - drag.x)));
    root.style.top = `${state.position.top}px`;
    root.style.right = `${state.position.right}px`;
  });
  root.addEventListener('pointerup', () => { if (drag) { drag = null; save(); } });
  root.addEventListener('pointercancel', () => { if (drag) { drag = null; save(); } });

  const initialPagePlanetId = String(getPagePlanetId());
  const previousObservedPagePlanetId = String(state.lastObservedPagePlanetId || '');
  if (initialPagePlanetId && previousObservedPagePlanetId !== initialPagePlanetId) {
    state.selectedPlanetId = initialPagePlanetId;
    state.lastObservedPagePlanetId = initialPagePlanetId;
    save();
  }
  let observedPlanetKey = `${getPagePlanetId()}|${getPagePlanetType()}`;

  function syncCurrentPlanetContext() {
    const nextKey = `${getPagePlanetId()}|${getPagePlanetType()}`;
    if (!nextKey.split('|')[0] || nextKey === observedPlanetKey) return;
    captureBuildingSelections();
    observedPlanetKey = nextKey;
    const activeId = String(getPagePlanetId());
    if (activeId) {
      state.selectedPlanetId = activeId;
      state.lastObservedPagePlanetId = activeId;
      if (!state.autoBuild?.active) rememberManualPlanetId(activeId);
    }
    save();
    render();
    if (!readBusy && !state.autoBuild?.active) readAccountData({ silent: true }).finally(() => scheduleAccountRefresh());
  }

  const pageObserver = new MutationObserver(() => syncCurrentPlanetContext());
  pageObserver.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['content'] });
  window.addEventListener('popstate', () => { rememberManualPlanetId(getPagePlanetId()); syncCurrentPlanetContext(); });
  window.addEventListener('hashchange', () => { rememberManualPlanetId(getPagePlanetId()); syncCurrentPlanetContext(); });
  const planetContextPoll = window.setInterval(syncCurrentPlanetContext, 1200);

  if (new URLSearchParams(location.search).get('component') === 'research') {
    const domResearches = readResearchLevelsFromDom();
    if (Object.keys(domResearches).length) {
      state.accountSnapshot ||= { syncedAt: new Date().toISOString(), planets: [], researches: {} };
      state.accountSnapshot.researches ||= {};
      for (const [id, level] of Object.entries(domResearches)) {
        if (state.accountSnapshot.researches[id] === undefined) state.accountSnapshot.researches[id] = level;
      }
      save();
    }
  }

  render();
  const countdownUiTimer = window.setInterval(updateCountdownDisplay, 1000);
  if (state.autoBuild?.active && state.mode === 'auto') {
    const dueAt = Number(state.autoBuild.nextCheckAt);
    if (Number.isFinite(dueAt) && dueAt > Date.now()) {
      autoBuildTimer = setTimeout(() => { autoBuildTimer = null; state.autoBuild.nextCheckAt = null; runAutoBuild(); }, dueAt - Date.now());
    } else {
      setTimeout(runAutoBuild, 1200);
    }
  } else {
    readAccountData({ silent: Boolean(state.accountSnapshot) }).finally(() => scheduleAccountRefresh());
  }
})();