// ==UserScript==
// @name         OGame Building Queue Manager
// @namespace    https://ogame.gameforge.com/
// @version      0.9.3.7
// @description  Gestor com iframe de execução isolado para impedir navegação da janela principal.
// @match        https://*.ogame.gameforge.com/game/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  // O gestor só é criado na janela principal; o executor oculto usa o DOM do jogo.
  if (window.top !== window.self) return;

  const VERSION = '0.9.3.7';
  const STORAGE_KEY = `ogbqm_${location.hostname.replace(/[^a-z0-9]+/gi, '_')}_v2`;
  const ACCOUNT_INFO_URL = '/game/index.php?page=componentOnly&component=externaldataexport&action=accountInfo&asJson=1';
  const BUILDINGS = {
    1: 'Mina de Metal',
    2: 'Mina de Cristal',
    3: 'Sintetizador de Deutério',
    4: 'Planta de Energia Solar',
    12: 'Reator de Fusão',
    14: 'Fábrica de Robôs',
    15: 'Fábrica de Nanites',
    21: 'Hangar',
    22: 'Armazém de Metal',
    23: 'Armazém de Cristal',
    24: 'Depósito de Deutério',
    31: 'Laboratório de Pesquisas',
    33: 'Terra-Formador',
    34: 'Depósito da Aliança',
    36: 'Estaleiro Espacial',
    41: 'Base Lunar',
    42: 'Sensor Phalanx',
    43: 'Portal de Salto Quântico',
    44: 'Silo de Mísseis'
  };

  // Pesquisas convencionais (tecnologias globais da conta). As pesquisas de
  // formas de vida são específicas de cada planeta e ficam fora desta fila.
  const RESEARCHES = {
    106: { name: 'Tecnologia de Espionagem', field: 'EspionageTechnology', aliases: ['espionage', 'espionagetechnology'] },
    108: { name: 'Tecnologia de Computadores', field: 'ComputerTechnology', aliases: ['computer', 'computertechnology'] },
    109: { name: 'Tecnologia de Armas', field: 'WeaponsTechnology', aliases: ['weapons', 'weaponstechnology'] },
    110: { name: 'Tecnologia de Escudo', field: 'ShieldingTechnology', aliases: ['shielding', 'shieldingtechnology'] },
    111: { name: 'Tecnologia de Blindagem', field: 'ArmourTechnology', aliases: ['armour', 'armourtechnology', 'armor', 'armortechnology'] },
    113: { name: 'Tecnologia de Energia', field: 'EnergyTechnology', aliases: ['energy', 'energytechnology'] },
    114: { name: 'Tecnologia de Hiperespaço', field: 'HyperspaceTechnology', aliases: ['hyperspace', 'hyperspacetechnology'] },
    115: { name: 'Motor de Combustão', field: 'CombustionDrive', aliases: ['combustion', 'combustiondrive'] },
    117: { name: 'Motor de Impulsão', field: 'ImpulseDrive', aliases: ['impulse', 'impulsedrive'] },
    118: { name: 'Motor de Hiperespaço', field: 'HyperspaceDrive', aliases: ['hyperspacedrive'] },
    120: { name: 'Tecnologia Laser', field: 'LaserTechnology', aliases: ['laser', 'lasertechnology'] },
    121: { name: 'Tecnologia de Iões', field: 'IonTechnology', aliases: ['ion', 'iontechnology'] },
    122: { name: 'Tecnologia de Plasma', field: 'PlasmaTechnology', aliases: ['plasma', 'plasmatechnology'] },
    123: { name: 'Rede Intergaláctica de Pesquisas', field: 'IntergalacticResearchNetwork', aliases: ['intergalacticresearchnetwork', 'irn'] },
    124: { name: 'Astrofísica', field: 'Astrophysics', aliases: ['astrophysics'] },
    199: { name: 'Tecnologia de Gravitão', field: 'GravitonTechnology', aliases: ['graviton', 'gravitontechnology'] }
  };

  const LIFEFORM_BUILDINGS = {
    11101: 'Residential Sector', 11102: 'Biosphere Farm', 11103: 'Research Centre', 11104: 'Academy of Sciences',
    11105: 'Neuro-Calibration Centre', 11106: 'High Energy Smelting', 11107: 'Food Silo', 11108: 'Fusion-Powered Production',
    11109: 'Skyscraper', 11110: 'Biotech Lab', 11111: 'Metropolis', 11112: 'Planetary Shield',
    12101: 'Meditation Enclave', 12102: 'Crystal Farm', 12103: 'Rune Technologium', 12104: 'Rune Forge',
    12105: 'Oriktorium', 12106: 'Magma Forge', 12107: 'Disruption Chamber', 12108: 'Megalith',
    12109: 'Crystal Refinery', 12110: 'Deuterium Synthesiser', 12111: 'Mineral Research Centre', 12112: 'Advanced Recycling Plant',
    13101: 'Assembly Line', 13102: 'Fusion Cell Factory', 13103: 'Robotics Research Centre', 13104: 'Update Network',
    13105: 'Quantum Computer Centre', 13106: 'Automatised Assembly Centre', 13107: 'High-Performance Transformer',
    13108: 'Microchip Assembly Line', 13109: 'Production Assembly Hall', 13110: 'High-Performance Synthesiser',
    13111: 'Chip Mass Production', 13112: 'Nano Repair Bots',
    14101: 'Sanctuary', 14102: 'Antimatter Condenser', 14103: 'Vortex Chamber', 14104: 'Halls of Realisation',
    14105: 'Forum of Transcendence', 14106: 'Antimatter Convector', 14107: 'Cloning Laboratory',
    14108: 'Chrysalis Accelerator', 14109: 'Bio Modifier', 14110: 'Psionic Modulator',
    14111: 'Ship Manufacturing Hall', 14112: 'Supra Refractor'
  };
  const LIFEFORM_SPECIES = { 11: 'Humans', 12: "Rock'tal", 13: 'Mechas', 14: 'Kaelesh' };

  const DEFAULTS = {
    mode: 'auto',
    queueSequence: 0,
    minimized: false,
    position: { right: 18, top: 90 },
    queue: [],
    researchQueue: [],
    lfBuildingQueue: [],
    lfResearchQueue: [],
    lfData: {},
    lfBuildingSelections: {},
    lfResearchSelections: {},
    lfBuildingLocks: [],
    lfResearchLocks: [],
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
      const primarySaved = localStorage.getItem(STORAGE_KEY);
      const legacyKey = location.hostname.includes('s181-pt') ? 'ogbqm_s181_v1' : '';
      const saved = JSON.parse(primarySaved || (legacyKey ? localStorage.getItem(legacyKey) : 'null') || 'null');
      return {
        ...clone(DEFAULTS),
        ...(saved && typeof saved === 'object' ? saved : {}),
        position: { ...DEFAULTS.position, ...(saved?.position || {}) },
        queue: Array.isArray(saved?.queue) ? saved.queue : [],
        researchQueue: Array.isArray(saved?.researchQueue) ? saved.researchQueue : [],
        lfBuildingQueue: Array.isArray(saved?.lfBuildingQueue) ? saved.lfBuildingQueue : [],
        lfResearchQueue: Array.isArray(saved?.lfResearchQueue) ? saved.lfResearchQueue : [],
        lfData: saved?.lfData && typeof saved.lfData === 'object' ? saved.lfData : {},
        lfBuildingSelections: saved?.lfBuildingSelections && typeof saved.lfBuildingSelections === 'object' ? saved.lfBuildingSelections : {},
        lfResearchSelections: saved?.lfResearchSelections && typeof saved.lfResearchSelections === 'object' ? saved.lfResearchSelections : {},
        lfBuildingLocks: Array.isArray(saved?.lfBuildingLocks) ? saved.lfBuildingLocks : [],
        lfResearchLocks: Array.isArray(saved?.lfResearchLocks) ? saved.lfResearchLocks : [],
        activeBuildingLocks: Array.isArray(saved?.activeBuildingLocks) ? saved.activeBuildingLocks : [],
        accountSnapshot: saved?.accountSnapshot && Array.isArray(saved.accountSnapshot.planets)
          ? saved.accountSnapshot : null,
        buildingSelections: saved?.buildingSelections && typeof saved.buildingSelections === 'object'
          ? saved.buildingSelections : {},
        researchSelections: saved?.researchSelections && typeof saved.researchSelections === 'object'
          ? saved.researchSelections : {},
        activeResearchLock: saved?.activeResearchLock && typeof saved.activeResearchLock === 'object' ? saved.activeResearchLock : null,
        activeTab: ['research', 'lfbuildings', 'lfresearch'].includes(saved?.activeTab) ? saved.activeTab : 'buildings',
        autoBuild: { ...DEFAULTS.autoBuild, ...(saved?.autoBuild || {}) }
      };
    } catch {
      return clone(DEFAULTS);
    }
  };

  let state = loadState();
  state.mode = 'auto'; // compatibilidade de estado; já não existe seletor Manual/Automático.
  state.autoBuild ||= clone(DEFAULTS.autoBuild);
  const persistedQueueWork = [...state.queue, ...state.researchQueue, ...state.lfBuildingQueue, ...state.lfResearchQueue]
    .some(item => item && ['pending', 'sent'].includes(item.status));
  if (!persistedQueueWork) {
    state.autoBuild.active = false;
    state.autoBuild.nextCheckAt = null;
    state.autoBuild.currentQueueId = null;
    state.autoBuild.currentResearchQueueId = null;
  }
  state.activeBuildingLocks ||= [];
  let drag = null;
  let readStatus = '';
  let readBusy = false;
  let autoBuildBusy = false;
  let rerunRequested = false;
  let lifeformReadBusy = false;
  let runnerWaitingForLfRead = false;

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

  // Compatibilidade com estado antigo: a execução passa a ser sempre acionada pela seleção.
  state.autoBuild ||= clone(DEFAULTS.autoBuild);
  state.autoBuild.manualNavigationHold = false;
  state.autoBuild.resumeAfterNavigation = false;
  state.autoBuild.navigationTarget = null;

  // Vários edifícios podem ficar selecionados; a execução respeita uma construção ativa por planeta.
  state.buildingSelections ||= {};

  function getPagePlanetId() {
    const metaId = document.querySelector('meta[name="ogame-planet-id"]')?.getAttribute('content') || '';
    let queryId = '';
    try { queryId = new URL(location.href).searchParams.get('cp') || ''; } catch { /* URL ainda indisponível */ }
    return String(metaId || queryId || '');
  }

  // Este ID representa a escolha manual do utilizador. Não o substituímos
  // por mudanças de sessão provocadas por pedidos em segundo plano.
  state.autoBuild ||= {};
  state.autoBuild.manualPlanetId ||= String(getPagePlanetId() || '');

  function rememberManualPlanetId(planetId) {
    const id = String(planetId || '');
    if (!id) return;
    state.autoBuild.manualPlanetId = id;
    state.autoBuild.manualNavigationAt = Date.now();
    save();
  }

  // O seletor lateral de planetas/luas usa links com cp=. Capturamos a escolha
  // antes de a interface mudar, para que a restauração nunca force um destino antigo.
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

    // Algumas versões da interface não incluem os níveis no accountInfo. No
    // ecrã de pesquisas, o nível alvo no botão permite inferir o nível atual.
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
      readStatus = 'A consultar os dados da conta…';
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
      catch { throw new Error('O servidor não devolveu JSON. Confirma que estás autenticado no OGame.'); }
      if (!response.ok) throw new Error(`Erro HTTP ${response.status}.`);

      const planets = normalizeAccountData(data);
      if (!planets.length) throw new Error('Não encontrei planetas ou luas com IDs válidos.');

      const parsedResearches = normalizeResearchLevels(data);
      // accountInfo pode expor apenas parte dos campos de investigação; não
      // descartamos níveis já lidos no ecrã de Pesquisas quando a resposta
      // seguinte vier incompleta.
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
      readStatus = `Leitura concluída: ${planetCount} planetas e ${moonCount} luas.`;
      success = true;
    } catch (error) {
      console.error('[OGame BQM] Erro ao ler dados da conta:', error);
      readStatus = `Não foi possível ler os níveis: ${error.message || error}`;
    } finally {
      readBusy = false;
      render();
    }
    return success;
  }

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
    #ogbqm .tabs { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:5px; }
    #ogbqm .tabs button.active { background:#315b45; border-color:#568a69; font-weight:700; }
    #ogbqm .research-list { display:grid; gap:3px; max-height:210px; overflow-y:auto; padding-right:2px; }
    #ogbqm .research-row, #ogbqm .lf-research-row { display:grid; grid-template-columns:19px minmax(0,1fr) 38px 76px; align-items:center; gap:5px;
      padding:5px; border-radius:4px; background:#172635; }
    #ogbqm .research-row input[type=checkbox], #ogbqm .lf-research-row input[type=checkbox] { width:15px; height:15px; margin:0; accent-color:#59ad78; cursor:pointer; }
    #ogbqm .research-name { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    #ogbqm .research-level { text-align:right; color:#b9e3c8; font-weight:700; font-variant-numeric:tabular-nums; }
    #ogbqm .notice { padding:6px 7px; border-radius:5px; background:#3a3020; color:#f2d7a8; font-size:10px; }
    #ogbqm .notice.good { background:#20392f; color:#bce8ce; }
    #ogbqm .notice.error { background:#492b2b; color:#ffd0d0; }
    #ogbqm .building-list { display:grid; gap:3px; max-height:195px; overflow-y:auto; padding-right:2px; }
    #ogbqm .building-row, #ogbqm .lf-building-row { display:grid; grid-template-columns:19px minmax(0,1fr) 42px 88px; align-items:center;
      gap:4px; padding:3px 4px; border-radius:4px; background:#172635; }
    #ogbqm .building-row:hover, #ogbqm .lf-building-row:hover { background:#263b50; }
    #ogbqm .building-row input[type=checkbox], #ogbqm .lf-building-row input[type=checkbox] { width:15px; height:15px; margin:0; accent-color:#59ad78; cursor:pointer; }
    #ogbqm .building-name { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    #ogbqm .current-level { text-align:right; color:#b9e3c8; font-weight:700; font-variant-numeric:tabular-nums; }
    #ogbqm .target-level, #ogbqm .lf-target-level { width:88px; padding:4px 3px !important; }
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
    /* Compacta a interface em ecrãs de portátil: 1920x1080 a 125% costuma
       disponibilizar cerca de 864px de altura CSS. Mantém a letra legível. */
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

  // Guarda o estado dos vistos e dos níveis antes de qualquer atualização visual.
  // O OGame atualiza elementos do <head> em segundo plano; sem esta cópia,
  // uma nova renderização repõe os vistos e parece que desaparecem sozinhos.
  function captureBuildingSelections() {
    const planet = getDisplayedPlanet();
    if (!planet) return;
    const list = root.querySelector('.building-list');
    // Durante a troca de planeta, o painel ainda pode conter as linhas antigas.
    // Só guardar quando o ID das linhas corresponder ao planeta apresentado.
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
    if (!planet) return '<div class="muted">Carrega primeiro nos dados dos planetas.</div>';
    const entries = Object.entries(planet.buildings || {})
      .filter(([id]) => /^\d+$/.test(id))
      .sort((a, b) => Number(a[0]) - Number(b[0]));
    if (!entries.length) return '<div class="muted">Não foram encontrados edifícios neste astro.</div>';

    return entries.map(([id, rawLevel]) => {
      const level = asInt(rawLevel);
      const name = BUILDINGS[id] || `Edifício #${id}`;
      const savedSelection = state.buildingSelections?.[String(planet.id)]?.[String(id)] || {};
      const maxTarget = Math.min(999, Math.max(level + 1, level + 20));
      const savedTarget = Number(savedSelection.targetLevel);
      const selectedTarget = Number.isInteger(savedTarget) && savedTarget > level && savedTarget <= maxTarget
        ? savedTarget : level + 1;
      const targetControl = `<select class="target-level" aria-label="Nível pretendido para ${esc(name)}">${Array.from({ length: maxTarget - level }, (_, index) => {
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
      return `<div class="notice">Ainda não consegui ler os níveis das pesquisas. A leitura automática tenta obtê-los do accountInfo; abre uma vez a página de Pesquisas do OGame para o gestor também ler os níveis dos botões.</div>`;
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

    // O bloqueio guarda apenas a investigação que está realmente em curso;
    // não é um histórico de pesquisas concluídas.
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
        // A pesquisa já terminou: retirar simplesmente da fila.
        state.researchQueue.splice(index, 1);
        continue;
      }

      if (item.status === 'pending' && !state.researchSelections?.[technologyId]?.checked) {
        state.researchQueue.splice(index, 1);
        continue;
      }

      // Migra ordens iniciadas nas versões anteriores para um bloqueio
      // transitório, fora da fila pendente.
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
      const hasActive = state.researchQueue.some(item =>
        String(item.technologyId) === id && isActiveResearchItem(item)
      );
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
        queueOrder: Number(state.researchSelections?.[id]?.queueOrder) || nextQueueOrder(),
        createdAt: new Date().toISOString()
      });
    }
    save();
  }

  function getNextPendingResearch() {
    const active = state.researchQueue.find(item => item.status === 'sent' || item.status === 'started');
    if (active || state.activeResearchLock) return null; // Só pode existir uma investigação global em curso.
    return state.researchQueue
      .filter(item => item.status === 'pending')
      .filter(item => state.researchSelections?.[String(item.technologyId)]?.checked)
      .filter(item => !item.retryAfter || Number(item.retryAfter) <= Date.now())
      .sort((a, b) => Number(a.queueOrder || 0) - Number(b.queueOrder || 0) || String(a.createdAt || '').localeCompare(String(b.createdAt || '')))[0] || null;
  }

  function renderResearchQueue() {
    const rows = state.researchQueue.filter(item => !['cancelled'].includes(item.status));
    if (!rows.length) return '<div class="muted">A fila de pesquisas está vazia.</div>';
    return rows.map((item, index) => {
      const status = item.status === 'done' ? 'Concluída'
        : item.status === 'started' ? 'Investigação iniciada'
        : item.status === 'sent' ? 'Pedido enviado — a confirmar'
        : item.retryAfter && Number(item.retryAfter) > Date.now() ? 'À espera de nova verificação'
        : 'Pendente';
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

  // Contador único, partilhado entre edifícios e pesquisas.
  // Mostra a próxima tentativa apenas enquanto existir trabalho pendente.
  function getAutoCountdownText() {
    if (state.autoBuild?.active && hasQueuedWork()) {
      const target = Number(state.autoBuild.nextCheckAt);
      if (Number.isFinite(target) && target > 0) return formatCountdown(target - Date.now());
      if (autoBuildBusy) return 'A verificar edifícios e pesquisas…';
      return 'A preparar verificação global…';
    }
    if (readBusy) return 'A atualizar dados da conta…';
    return 'Sem tarefas pendentes';
  }

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const POLL_MIN_MS = 45000;
  const POLL_MAX_MS = 60000;
  const RESOURCE_RETRY_MS = 20000;
  // Quando uma construção LF está em curso e há níveis seguintes na fila,
  // verificar a conclusão com maior frequência do que o ciclo geral.
  const LF_PROGRESS_RETRY_MS = 5000;
  let autoBuildTimer = null;
  let countdownTicker = null;

  function randomPollDelay() {
    // Intervalo aleatório inclusivo: 45 000–60 000 ms.
    return Math.floor(POLL_MIN_MS + Math.random() * (POLL_MAX_MS - POLL_MIN_MS + 1));
  }

  function nextQueueOrder() {
    state.queueSequence = Math.max(0, Number(state.queueSequence) || 0) + 1;
    return state.queueSequence;
  }

  function ensureQueueOrder(items) {
    for (const item of items || []) {
      if (!Number.isFinite(Number(item.queueOrder)) || Number(item.queueOrder) <= 0) {
        item.queueOrder = nextQueueOrder();
      } else {
        state.queueSequence = Math.max(Number(state.queueSequence) || 0, Number(item.queueOrder));
      }
    }
  }

  // Constrói URLs limpos para o iframe. Não reutiliza nem altera a URL da
  // janela principal: a navegação manual do utilizador é sempre independente.
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

  // Ações em segundo plano: o jogo é aberto num iframe same-origin fora da
  // área visível. Assim, a janela principal continua livre para navegação manual.
  let backgroundGameFrame = null;
  let backgroundFrameBusy = false;

  const BACKGROUND_FRAME_SANDBOX = 'allow-scripts allow-same-origin allow-forms';

  function normalizeBackgroundNavigationTargets(frame) {
    // Algumas páginas do jogo declaram target=_top/_parent em links, formulários
    // ou em <base>. Reescrevemos esses destinos para _self e deixamos ainda a
    // sandbox do iframe bloquear qualquer tentativa programática de navegar a janela principal.
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
    // Não incluir allow-top-navigation nem allow-top-navigation-by-user-activation:
    // mesmo que o jogo tente usar window.top.location, o browser bloqueia a saída
    // do iframe e preserva a página onde o utilizador está a navegar.
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

  // Função de validação ao nível do IIFE: tem de estar acessível tanto ao
  // executor de edifícios como ao executor de pesquisas.
  function isExecutionContextCurrent(context, planetId, component) {
    // Nunca aceitar document da janela principal como contexto de execução.
    // Mesmo quando o planeta aberto coincide com a ordem, a execução decorre
    // exclusivamente no iframe oculto para não interferir com a navegação.
    if (!context || context.visible || !context.frame) return false;
    return backgroundUrlMatches(context.frame, planetId, component);
  }

  function visibleLifeformPageMatches(planetId, component) {
    try {
      const params = new URLSearchParams(location.search);
      const page = params.get('page');
      const currentComponent = params.get('component');
      const currentPlanet = getPagePlanetId();
      return page === 'ingame'
        && currentComponent === component
        && String(currentPlanet) === String(planetId)
        && document.readyState !== 'loading'
        && Boolean(document.querySelector('button.upgrade[data-technology]'));
    } catch (_) {
      return false;
    }
  }

  // Para formas de vida, se o utilizador já está exatamente na página e no
  // planeta da ordem, usa o DOM visível. Evita depender de um iframe oculto
  // para clicar num botão que já está carregado na sessão autenticada.
  async function loadLifeformGamePage(planetId, component) {
    if (visibleLifeformPageMatches(planetId, component)) {
      return { frame: null, doc: document, visible: true };
    }
    return loadBackgroundGamePage(planetId, component);
  }

  async function loadBackgroundGamePage(planetId, component) {
    // Não há fast-path para a página visível. Todas as ordens, incluindo as do
    // planeta atualmente aberto, usam sempre o executor oculto.
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
      throw new Error('A página do planeta não ficou disponível no executor oculto. A navegação visível não foi alterada.');
    } finally {
      backgroundFrameBusy = false;
    }
  }

  function extractLifeformEntries(doc, kind) {
    const isBuilding = kind === 'buildings';
    const idPattern = isBuilding ? /^(111|121|131|141)\d{2}$/ : /^(112|122|132|142)\d{2}$/;
    const found = new Map();
    const nodes = [...doc.querySelectorAll('button.upgrade[data-technology], [data-technology], li[class*="lifeformTech"]')];
    for (const node of nodes) {
      const button = node.matches?.('button.upgrade[data-technology]') ? node : node.querySelector?.('button.upgrade[data-technology]');
      const card = node.matches?.('li[class*="lifeformTech"], li.technology, .technology')
        ? node : (button?.closest('li.lifeformTech, li.technology, .technology') || button?.parentElement || node);
      let id = String(button?.getAttribute('data-technology') || node.getAttribute?.('data-technology') || '');
      if (!id) {
        const classMatch = String(card?.className || '').match(/lifeformTech(\d{5})/i);
        if (classMatch) id = classMatch[1];
      }
      if (!idPattern.test(id) || found.has(id)) continue;
      const targetLevel = button ? getButtonTargetLevel(button) : null;
      const levelNode = card?.querySelector?.('.level[data-value], .level, .technologyLevel, .researchLevel, [class*="level"]');
      const rawLevel = levelNode?.getAttribute?.('data-value') ?? levelNode?.textContent ?? card?.getAttribute?.('data-level');
      const levelMatch = String(rawLevel ?? '').match(/\d+/);
      const currentLevel = Number.isInteger(targetLevel) && targetLevel > 0
        ? targetLevel - 1 : levelMatch ? Number(levelMatch[0]) : null;
      if (currentLevel === null) continue;
      const nameNode = card?.querySelector?.('.name, .technologyName, .lifeformTechName, .tooltip, [data-tooltip-title]');
      let name = (nameNode?.getAttribute?.('data-tooltip-title') || nameNode?.textContent || button?.getAttribute('data-tooltip-title')
        || button?.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim();
      name = name.replace(/^(melhorar|pesquisar|upgrade|research|améliorer|rechercher)\s+/i, '').replace(/\s+(para o nível|nível|level|niveau)\s+\d+.*$/i, '').trim();
      if (!name) name = (isBuilding ? LIFEFORM_BUILDINGS[id] : '') || `Tecnologia ${id}`;
      found.set(id, {
        id,
        name,
        currentLevel,
        targetLevel: currentLevel + 1,
        disabled: Boolean(button && (button.disabled || button.getAttribute('aria-disabled') === 'true' || button.classList.contains('disabled'))),
        species: LIFEFORM_SPECIES[Number(id.slice(0, 2))] || 'Forma de vida'
      });
    }
    return [...found.values()].sort((a, b) => Number(a.id) - Number(b.id));
  }

  async function readLifeformDataForPlanet(planetId, kind, options = {}) {
    if (autoBuildBusy || lifeformReadBusy) {
      state.autoBuild.lastMessage = 'O executor está ocupado. Lê as formas de vida novamente quando a operação atual terminar.';
      save();
      return false;
    }
    const component = kind === 'buildings' ? 'lfbuildings' : 'lfresearch';
    const planet = getPlanetSnapshot(planetId);
    if (!planet) return false;
    lifeformReadBusy = true;
    try {
      const context = await loadBackgroundGamePage(planetId, component);
      const deadline = Date.now() + 10000;
      let entries = [];
      while (Date.now() < deadline) {
        entries = extractLifeformEntries(context.doc, kind);
        if (entries.length) break;
        await sleep(250);
      }
      if (!entries.length) {
        state.autoBuild.lastMessage = `Não encontrei tecnologias de formas de vida na página ${component} de ${planet.name}.`;
        save();
        if (!options.keepContext) await restoreVisiblePlanetInBackground();
        return false;
      }
      state.lfData ||= {};
      const planetData = state.lfData[String(planetId)] ||= { buildings: [], researches: [], syncedAt: null };
      planetData[kind] = entries;
      planetData.syncedAt = new Date().toISOString();
      save();
      if (!options.keepContext) await restoreVisiblePlanetInBackground();
      return true;
    } catch (error) {
      state.autoBuild.lastMessage = `Falha ao ler ${kind === 'buildings' ? 'edifícios' : 'pesquisas'} de formas de vida em ${planet.name}: ${error?.message || error}`;
      save();
      if (!options.keepContext) await restoreVisiblePlanetInBackground();
      return false;
    } finally {
      lifeformReadBusy = false;
      if (runnerWaitingForLfRead) {
        runnerWaitingForLfRead = false;
        if (hasQueuedWork()) scheduleNextAutoCheck('Leitura das formas de vida concluída; retomo a fila.', 0);
      }
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

  // OGame pode persistir no lado do servidor o último cp usado num contexto
  // oculto. No fim de cada operação, repõe no executor o planeta que o
  // utilizador tem efetivamente aberto na janela principal. Se o utilizador
  // mudar de planeta durante a operação, voltamos a ler o ID atual antes de
  // restaurar para não impor um destino antigo.
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
          state.autoBuild.lastMessage = `Aviso: não consegui repor o planeta aberto após a tarefa em segundo plano (${error?.message || error}).`;
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
        // O planeta aberto é um destino elegível e preferido quando tem laboratório.
        // Caso contrário, usa o laboratório de nível mais elevado.
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

  async function recheckSentResearchOrder() {
    const item = state.researchQueue.find(entry => entry.status === 'sent');
    if (!item) return;
    const source = (state.accountSnapshot?.planets || []).find(planet => String(planet.id) === String(item.sourcePlanetId));
    const candidates = source ? [source, ...getResearchLabCandidates(item).filter(planet => String(planet.id) !== String(source.id))]
      : getResearchLabCandidates(item);
    for (const planet of candidates) {
      try {
        const context = await loadBackgroundGamePage(planet.id, 'research');
        const button = getResearchUpgradeButton(item.technologyId, context.doc);
        const queueText = context.doc.querySelector('.researchQueue, .researchqueue, #researchQueue, .research.active')?.textContent || '';
        const target = button ? getButtonTargetLevel(button) : null;
        const confirmed = Boolean(
          (button && (button.disabled || button.getAttribute('aria-disabled') === 'true' || target !== Number(item.targetLevel)))
          || (queueText && queueText !== String(item.beforeQueueText || ''))
        );
        if (confirmed) {
          state.activeResearchLock = {
            technologyId: String(item.technologyId), targetLevel: Number(item.targetLevel),
            research: item.research, sourcePlanetId: String(planet.id), sourcePlanet: planet.name,
            startedAt: item.sentAt || new Date().toISOString()
          };
          state.researchQueue = state.researchQueue.filter(entry => entry.id !== item.id);
          state.researchSelections[String(item.technologyId)] ||= {};
          state.researchSelections[String(item.technologyId)].checked = false;
          const row = [...root.querySelectorAll('.research-row')].find(node => String(node.dataset.researchId || '') === String(item.technologyId));
          const checkbox = row?.querySelector('.research-check');
          if (checkbox) checkbox.checked = false;
          state.autoBuild.lastMessage = `${item.research}, nível ${item.targetLevel}: investigação confirmada.`;
          save();
          return;
        }
        if (button && !button.disabled && target === Number(item.targetLevel)) {
          if (!state.researchSelections?.[String(item.technologyId)]?.checked) {
            state.researchQueue = state.researchQueue.filter(entry => entry.id !== item.id);
            state.autoBuild.lastMessage = `${item.research}: retirada da fila; o jogo confirmou que ainda não tinha começado.`;
          } else {
            item.status = 'pending';
            item.sentAt = null;
            item.retryAfter = Date.now() + randomPollDelay();
            item.triedPlanets = [];
            state.autoBuild.lastMessage = `${item.research}: o jogo não confirmou o início; a ordem continua na fila.`;
          }
          save();
          return;
        }
      } catch (error) {
        item.lastRecheckError = error?.message || String(error);
      }
    }
    item.retryAfter = Date.now() + POLL_MIN_MS;
    save();
  }

  async function runAutoResearchOnceInternal() {
    reconcileAutomaticResearchQueue();
    if (state.activeResearchLock) return false;
    await recheckSentResearchOrder();
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
        ? 'Nenhum laboratório ficou acessível no executor em segundo plano; vou voltar a tentar no próximo ciclo.'
        : 'Não encontrei nenhum planeta com Laboratório de Pesquisas para iniciar a próxima investigação.';
      save();
      return false;
    }

    let selectedContext = null;
    let selectedPlanet = null;
    let selectedButton = null;
    let blockedRetryDelay = POLL_MIN_MS;
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
          blockedRetryDelay = Math.min(blockedRetryDelay, getBlockedRetryDelay(button));
          item.retryAfter = Date.now() + blockedRetryDelay;
          // Um botão desativado por recursos não significa que este laboratório
          // esteja permanentemente indisponível; volta a ser tentado no próximo ciclo.
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
      item.retryAfter = Date.now() + blockedRetryDelay;
      state.autoBuild.currentResearchQueueId = null;
      state.autoBuild.lastMessage = item.lastBackgroundError
        ? `Não consegui carregar o laboratório em segundo plano (${item.lastBackgroundError}). A navegação manual ficou intacta.`
        : `Não encontrei um botão válido para ${item.research}, nível ${expectedTarget}, nos laboratórios disponíveis.`;
      save();
      return false;
    }

    if (!state.researchSelections?.[String(item.technologyId)]?.checked) {
      item.status = 'cancelled';
      state.autoBuild.currentResearchQueueId = null;
      state.autoBuild.lastMessage = `${item.research} foi retirada da seleção; sem iniciar investigação.`;
      save();
      return false;
    }

    const doc = selectedContext.doc;
    if (!isExecutionContextCurrent(selectedContext, selectedPlanet.id, 'research')) {
      item.retryAfter = Date.now() + POLL_MIN_MS;
      state.autoBuild.currentResearchQueueId = null;
      state.autoBuild.lastMessage = 'O contexto do laboratório mudou antes do envio; não iniciei a pesquisa. A navegação manual ficou intacta.';
      save();
      scheduleNextAutoCheck(null, null);
      return false;
    }
    const beforeCard = (selectedButton.closest('.technology') || selectedButton.parentElement)?.outerHTML || '';
    const beforeResearch = doc.querySelector('.researchQueue, .researchqueue, #researchQueue, .research.active')?.textContent || '';
    item.beforeCardHtml = beforeCard;
    item.beforeQueueText = beforeResearch;
    item.status = 'sent';
    item.sentAt = new Date().toISOString();
    item.sourcePlanetId = String(selectedPlanet.id);
    item.sourcePlanet = selectedPlanet.name;
    item.visualConfirmation = false;
    item.retryAfter = null;
    state.autoBuild.currentResearchQueueId = null;
    state.autoBuild.lastMessage = `A submeter ${item.research}, nível ${expectedTarget}, em segundo plano no laboratório de ${selectedPlanet.name}…`;
    save();
    render();
    selectedButton.click();
    await sleep(1800);

    const afterDoc = selectedContext.frame?.contentDocument || doc;
    const buttonAfter = getResearchUpgradeButton(item.technologyId, afterDoc);
    const afterCard = (buttonAfter?.closest('.technology') || buttonAfter?.parentElement)?.outerHTML || '';
    const afterResearch = afterDoc.querySelector('.researchQueue, .researchqueue, #researchQueue, .research.active')?.textContent || '';
    const confirmed = Boolean((buttonAfter && (buttonAfter.disabled || getButtonTargetLevel(buttonAfter) !== expectedTarget))
      || (beforeCard && afterCard && beforeCard !== afterCard)
      || (afterResearch && afterResearch !== beforeResearch));
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
      // A tarefa deixa a fila assim que o jogo confirma o início.
      state.researchQueue = state.researchQueue.filter(entry => entry.id !== item.id);

      // Desmarcar também a seleção persistida para impedir que a reconciliação
      // volte a criar automaticamente esta mesma ordem no ciclo seguinte.
      const technologyId = String(item.technologyId);
      state.researchSelections ||= {};
      state.researchSelections[technologyId] ||= {};
      state.researchSelections[technologyId].checked = false;

      // Se o separador de pesquisas estiver visível, atualizar o checkbox antes
      // de render(), que começa por capturar novamente as seleções do DOM.
      const researchRow = [...root.querySelectorAll('.research-row')]
        .find(row => String(row.dataset.researchId || '') === technologyId);
      const researchCheckbox = researchRow?.querySelector('.research-check');
      if (researchCheckbox) researchCheckbox.checked = false;

      state.autoBuild.lastMessage = `${item.research}, nível ${expectedTarget}: iniciada; removida da fila pendente.`;
    } else {
      item.status = 'sent';
      state.autoBuild.lastMessage = `${item.research}, nível ${expectedTarget}: pedido enviado; mantenho na fila até confirmar o início.`;
    }
    save();
    render();
    scheduleNextAutoCheck('Verificação concluída; continuo a executar as filas pendentes.', null);
    return true;
  }

  async function runAutoResearchOnce() {
    try {
      return await runAutoResearchOnceInternal();
    } finally {
      await restoreVisiblePlanetInBackground();
    }
  }

  // Edifícios de recursos/armazéns usam supplies; instalações usam facilities.
  // Sem esta distinção, o executor nunca encontra Robótica/Base Lunar na lua.
  function getBuildingComponent(buildingId) {
    const resourceBuildings = new Set(['1', '2', '3', '4', '12', '22', '23', '24']);
    return resourceBuildings.has(String(buildingId)) ? 'supplies' : 'facilities';
  }

  function getUpgradeButton(buildingId, doc = document) {
    return doc.querySelector(`button.upgrade[data-technology="${CSS.escape(String(buildingId))}"]`);
  }

  function getButtonTargetLevel(button) {
    const label = `${button?.getAttribute('aria-label') || ''} ${button?.getAttribute('data-tooltip-title') || ''} ${button?.getAttribute('title') || ''}`;
    const match = label.match(/(?:nível|nivel|level|niveau|livello|stufe|poziom|szint|seviye|уровень|等级|レベル)\s*[:#]?\s*(\d+)/i)
      || label.match(/(?:to|para|à|a)\s+(?:level|niveau|nível|nivel|seviye)\s+(\d+)/i);
    if (match) return Number(match[1]);
    // Fallback independente do idioma: em cartões OGame, o nível atual está
    // normalmente num elemento .level/data-value; o botão sobe exatamente +1.
    const card = button?.closest?.('li.technology, li.lifeformTech, .technology') || button?.parentElement;
    const levelNode = card?.querySelector?.('.level[data-value], .level, .technologyLevel, .researchLevel, [data-level]');
    const raw = levelNode?.getAttribute?.('data-value') ?? levelNode?.getAttribute?.('data-level') ?? levelNode?.textContent;
    const current = String(raw ?? '').match(/\d+/);
    return current ? Number(current[0]) + 1 : null;
  }

  function getButtonBlockReason(button) {
    const card = button?.closest('li, .technology, .lifeformTech') || button?.parentElement;
    const detail = `${button?.getAttribute('title') || ''} ${button?.getAttribute('aria-label') || ''} ${button?.getAttribute('data-tooltip-title') || ''} ${card?.textContent || ''}`
      .replace(/\s+/g, ' ').trim();
    return detail.slice(0, 180);
  }

  function getBlockedRetryDelay(button) {
    const card = button?.closest('li, .technology, .lifeformTech') || button?.parentElement;
    const detail = `${button?.getAttribute('title') || ''} ${button?.getAttribute('aria-label') || ''} ${button?.getAttribute('data-tooltip-title') || ''} ${card?.textContent || ''}`.toLowerCase();
    const resourceWords = /not enough|insufficient|insuffisant|nicht genug|no hay suficientes|falta de recursos|recursos insuficientes|materiais insuficientes|ressources insuffisantes|ressourcen nicht ausreichend|risorse insufficienti|lack of resources|resource shortage|recursos em falta/;
    return resourceWords.test(detail) ? RESOURCE_RETRY_MS : randomPollDelay();
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


  function enqueueOrRemoveBuildingSelection(row) {
    const planet = getDisplayedPlanet();
    if (!planet || !row) return;
    const buildingId = String(row.dataset.buildingId || '');
    if (!/^\d+$/.test(buildingId)) return;
    const checked = Boolean(row.querySelector('.building-check')?.checked);
    const currentLevel = asInt(row.dataset.currentLevel);
    const targetControl = row.querySelector('.target-level');
    const targetLevel = Number(targetControl?.value || state.buildingSelections?.[String(planet.id)]?.[buildingId]?.targetLevel || currentLevel + 1);
    state.buildingSelections ||= {};
    const selection = state.buildingSelections[String(planet.id)] ||= {};
    selection[buildingId] = { ...(selection[buildingId] || {}), checked, targetLevel };
    if (checked && !Number(selection[buildingId].queueOrder)) selection[buildingId].queueOrder = nextQueueOrder();
    state.queue ||= [];

    if (!checked) {
      selection[buildingId].queueOrder = null;
      const sent = state.queue.find(item => String(item.planetId) === String(planet.id)
        && String(item.buildingId) === buildingId && ['sent', 'started'].includes(item.status));
      state.queue = state.queue.filter(item => !(String(item.planetId) === String(planet.id)
        && String(item.buildingId) === buildingId && item.status === 'pending'));
      if (sent) {
        state.autoBuild.lastMessage = `${BUILDINGS[buildingId] || `Edifício #${buildingId}`} já foi enviado ao jogo; mantenho-o sob confirmação. Se a construção já começou, só pode ser cancelada no próprio OGame.`;
      }
      save();
      render();
      if (hasQueuedWork()) scheduleNextAutoCheck('Seleção atualizada; continuo as restantes ordens.', 0);
      else scheduleNextAutoCheck(null);
      return;
    }

    if (!Number.isInteger(targetLevel) || targetLevel <= currentLevel) return;
    const existing = state.queue.find(item => String(item.planetId) === String(planet.id)
      && String(item.buildingId) === buildingId && ['pending', 'sent', 'started'].includes(item.status));
    if (existing) {
      if (existing.status === 'pending') {
        existing.currentLevel = currentLevel;
        existing.targetLevel = currentLevel + 1;
        existing.desiredTargetLevel = targetLevel;
      }
    } else {
      state.queue.push({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        building: BUILDINGS[buildingId] || `Edifício #${buildingId}`,
        planet: planet.name,
        planetId: String(planet.id),
        buildingId,
        currentLevel,
        targetLevel: currentLevel + 1,
        desiredTargetLevel: targetLevel,
        queueOrder: Number(selection.queueOrder) || nextQueueOrder(),
        status: 'pending',
        createdAt: new Date().toISOString()
      });
    }
    state.autoBuild.lastMessage = `${BUILDINGS[buildingId] || `Edifício #${buildingId}`} adicionado à fila; a tentar iniciar agora.`;
    save();
    render();
    scheduleNextAutoCheck(null, 0);
  }

  function enqueueOrRemoveResearchSelection(technologyId, checked) {
    const id = String(technologyId || '');
    if (!RESEARCHES[id]) return;
    state.researchSelections ||= {};
    state.researchSelections[id] = { ...(state.researchSelections[id] || {}), checked: Boolean(checked) };
    if (checked && !Number(state.researchSelections[id].queueOrder)) state.researchSelections[id].queueOrder = nextQueueOrder();
    if (!checked) {
      state.researchSelections[id].queueOrder = null;
      state.researchQueue = state.researchQueue.filter(item =>
        !(String(item.technologyId) === id && item.status === 'pending'));
      save();
      render();
      if (hasQueuedWork()) scheduleNextAutoCheck('Seleção de pesquisa atualizada.', 0);
      else scheduleNextAutoCheck(null);
      return;
    }
    reconcileAutomaticResearchQueue();
    state.autoBuild.lastMessage = `${RESEARCHES[id].name} adicionada à fila; a tentar iniciar agora.`;
    save();
    render();
    scheduleNextAutoCheck(null, 0);
  }

  function enqueueOrRemoveLfBuildingSelection(planetId, technologyId, checked) {
    const pid = String(planetId);
    const id = String(technologyId);
    const entry = state.lfData?.[pid]?.buildings?.find(item => String(item.id) === id);
    if (!entry) return;
    state.lfBuildingSelections ||= {};
    const selections = state.lfBuildingSelections[pid] ||= {};
    const row = [...root.querySelectorAll('.lf-building-row')].find(node => String(node.dataset.technologyId || '') === id);
    const targetLevel = Number(row?.querySelector('.lf-target-level')?.value || entry.currentLevel + 1);
    selections[id] = { ...(selections[id] || {}), checked: Boolean(checked), targetLevel };
    if (checked && !Number(selections[id].queueOrder)) selections[id].queueOrder = nextQueueOrder();
    if (!checked) {
      selections[id].queueOrder = null;
      state.lfBuildingQueue = state.lfBuildingQueue.filter(item =>
        !(String(item.planetId) === pid && String(item.technologyId) === id && item.status === 'pending'));
      save(); render();
      if (hasQueuedWork()) scheduleNextAutoCheck('Seleção de edifício de forma de vida atualizada.', 0);
      else scheduleNextAutoCheck(null);
      return;
    }
    const pendingCount = state.lfBuildingQueue.filter(item => ['pending', 'sent'].includes(item.status)).length;
    const existing = state.lfBuildingQueue.find(item => String(item.planetId) === pid
      && String(item.technologyId) === id && ['pending', 'sent'].includes(item.status));
    if (!existing && pendingCount >= 10) {
      selections[id].checked = false;
      const row = [...root.querySelectorAll('.lf-building-row')].find(node =>
        String(node.dataset.technologyId || '') === id);
      const checkbox = row?.querySelector('.lf-building-check');
      if (checkbox) checkbox.checked = false;
      alert('A fila de edifícios de formas de vida permite no máximo 10 ordens pendentes no total.');
      save(); render(); return;
    }
    if (!existing) {
      state.lfBuildingQueue.push({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type: 'lf-building', technologyId: id, building: entry.name,
        planetId: pid, planet: getPlanetSnapshot(pid)?.name || `Planeta ${pid}`,
        currentLevel: entry.currentLevel, targetLevel: entry.currentLevel + 1,
        desiredTargetLevel: targetLevel, queueOrder: Number(selections[id].queueOrder) || nextQueueOrder(),
        status: 'pending', createdAt: new Date().toISOString()
      });
    }
    save(); render(); scheduleNextAutoCheck(null, 0);
  }

  function enqueueOrRemoveLfResearchSelection(planetId, technologyId, checked) {
    const pid = String(planetId);
    const id = String(technologyId);
    const entry = state.lfData?.[pid]?.researches?.find(item => String(item.id) === id);
    if (!entry) return;
    state.lfResearchSelections ||= {};
    const selections = state.lfResearchSelections[pid] ||= {};
    selections[id] = { ...(selections[id] || {}), checked: Boolean(checked) };
    if (checked && !Number(selections[id].queueOrder)) selections[id].queueOrder = nextQueueOrder();
    if (!checked) {
      selections[id].queueOrder = null;
      state.lfResearchQueue = state.lfResearchQueue.filter(item =>
        !(String(item.planetId) === pid && String(item.technologyId) === id && item.status === 'pending'));
      save(); render();
      if (hasQueuedWork()) scheduleNextAutoCheck('Seleção de pesquisa de forma de vida atualizada.', 0);
      else scheduleNextAutoCheck(null);
      return;
    }
    const existing = state.lfResearchQueue.some(item => String(item.planetId) === pid
      && String(item.technologyId) === id && ['pending', 'sent'].includes(item.status));
    if (!existing) {
      state.lfResearchQueue.push({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type: 'lf-research', technologyId: id, research: entry.name,
        planetId: pid, planet: getPlanetSnapshot(pid)?.name || `Planeta ${pid}`,
        currentLevel: entry.currentLevel, targetLevel: entry.currentLevel + 1,
        queueOrder: Number(selections[id].queueOrder) || nextQueueOrder(), status: 'pending', createdAt: new Date().toISOString()
      });
    }
    save(); render(); scheduleNextAutoCheck(null, 0);
  }

  function renderLfEntries(planet, kind) {
    if (!planet) return '<div class="muted">Escolhe um planeta primeiro.</div>';
    const entries = state.lfData?.[String(planet.id)]?.[kind] || [];
    if (!entries.length) return '<div class="muted">Ainda não foram lidas tecnologias nesta página. Usa «Ler formas de vida» para carregar os dados.</div>';
    const isBuilding = kind === 'buildings';
    const selections = isBuilding ? state.lfBuildingSelections?.[String(planet.id)] : state.lfResearchSelections?.[String(planet.id)];
    return entries.map(entry => {
      const selected = Boolean(selections?.[String(entry.id)]?.checked);
      const cls = isBuilding ? 'lf-building' : 'lf-research';
      const savedTarget = Number(selections?.[String(entry.id)]?.targetLevel);
      const desiredTarget = Number.isInteger(savedTarget) && savedTarget > entry.currentLevel
        ? Math.min(savedTarget, entry.currentLevel + 10) : entry.currentLevel + 1;
      const targetControl = isBuilding
        ? `<select class="lf-target-level" aria-label="Nível pretendido para ${esc(entry.name)}">${Array.from({length: 10}, (_, index) => entry.currentLevel + index + 1).map(level => `<option value="${level}" ${level === desiredTarget ? 'selected' : ''}>${level}</option>`).join('')}</select>`
        : `<span class="target-auto">→ ${entry.currentLevel + 1}</span>`;
      return `<label class="${cls}-row" data-technology-id="${esc(entry.id)}" data-current-level="${entry.currentLevel}">
        <input class="${cls}-check" type="checkbox" ${selected ? 'checked' : ''} >
        <span class="building-name" title="${esc(entry.species || '')}">${esc(entry.name)}</span>
        <span class="current-level">${entry.currentLevel}</span>
        ${targetControl}
      </label>`;
    }).join('');
  }

  function renderLfQueue(queue, kind) {
    const rows = queue.filter(item => !['cancelled', 'done'].includes(item.status));
    if (!rows.length) return '<div class="muted">Fila vazia.</div>';
    return rows.map((item, index) => {
      const name = item.building || item.research || `Tecnologia ${item.technologyId}`;
      const status = item.status === 'sent' ? 'Pedido enviado — a confirmar'
        : item.retryAfter && Number(item.retryAfter) > Date.now() ? 'A aguardar nova tentativa' : 'Pendente';
      return `<div class="item"><div><div class="item-title">${index + 1}. ${esc(name)} — nível ${Number(item.targetLevel)}${Number(item.desiredTargetLevel) > Number(item.targetLevel) ? ` até ${Number(item.desiredTargetLevel)}` : ''}</div>
        <div class="item-meta">${esc(item.planet)} · ${esc(status)}</div></div>
        <div class="item-buttons"><button data-action="cancel-lf-order" data-kind="${kind}" data-id="${esc(item.id)}" title="Retirar da fila">×</button></div>
        <div class="item-status ${item.status === 'sent' ? 'sent' : 'wait'}">${esc(status)}</div></div>`;
    }).join('');
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

  // A fila mostra apenas tarefas por iniciar. Uma construção confirmada passa
  // para um bloqueio transitório até o nível subir; não guardamos histórico.
  function reconcileAutomaticQueue() {
    const planets = state.accountSnapshot?.planets || [];
    if (!planets.length) return;
    state.activeBuildingLocks ||= [];

    // Libertar bloqueios quando a leitura da conta já mostra o nível concluído.
    state.activeBuildingLocks = state.activeBuildingLocks.filter(lock => {
      const planet = getPlanetSnapshot(lock.planetId);
      if (!planet) return true;
      const actualLevel = asInt(planet.buildings?.[String(lock.buildingId)]);
      return actualLevel < Number(lock.targetLevel);
    });

    // Limpar ordens concluídas/canceladas e migrar inícios confirmados antigos.
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

    // Criar tarefas pendentes para todas as seleções. Se o mesmo edifício já
    // está em construção, só se cria o próximo nível depois de terminar.
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
        const selection = state.buildingSelections?.[String(planet.id)]?.[String(buildingId)] || {};
        const desiredTargetLevel = Number(selection.targetLevel) || currentLevel + 1;
        if (currentLevel >= desiredTargetLevel) {
          selection.checked = false;
          selection.queueOrder = null;
          const visibleList = root.querySelector('.building-list');
          if (visibleList && String(visibleList.dataset.planetId || '') === String(planet.id)) {
            const row = [...visibleList.querySelectorAll('.building-row')].find(element => String(element.dataset.buildingId || '') === String(buildingId));
            const checkbox = row?.querySelector('.building-check');
            if (checkbox) checkbox.checked = false;
          }
          continue;
        }
        if (!Number(selection.queueOrder)) selection.queueOrder = nextQueueOrder();
        state.queue.push({
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          building: BUILDINGS[buildingId] || `Edifício #${buildingId}`,
          planet: planet.name,
          planetId: String(planet.id),
          buildingId: String(buildingId),
          currentLevel,
          targetLevel: currentLevel + 1,
          desiredTargetLevel,
          queueOrder: Number(selection.queueOrder) || nextQueueOrder(),
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
      .sort((a, b) => Number(a.queueOrder || 0) - Number(b.queueOrder || 0)
        || String(a.createdAt || '').localeCompare(String(b.createdAt || '')));

    // Uma construção por planeta, mas não apenas uma construção por ciclo.
    const seenPlanets = new Set();
    return pending.filter(item => {
      const planetId = String(item.planetId);
      if (seenPlanets.has(planetId)) return false;
      seenPlanets.add(planetId);
      return true;
    });
  }

  function hasQueuedWork() {
    const queued = state.queue.some(item => item.status === 'pending' || item.status === 'sent')
      || state.researchQueue.some(item => item.status === 'pending' || item.status === 'sent')
      || state.lfBuildingQueue.some(item => item.status === 'pending' || item.status === 'sent')
      || state.lfResearchQueue.some(item => item.status === 'pending' || item.status === 'sent');
    if (queued) return true;

    // Uma melhoria em curso continua a fazer parte de uma sequência quando
    // existe um nível final superior ao nível já submetido. Mantém o temporizador
    // vivo apenas para acompanhar essas sequências, não para fazer polling vazio.
    const conventionalChain = (state.activeBuildingLocks || []).some(lock => {
      const selection = state.buildingSelections?.[String(lock.planetId)]?.[String(lock.buildingId)];
      return Boolean(selection?.checked && Number(selection.targetLevel) >= Number(lock.targetLevel));
    });
    const lifeformChain = (state.lfBuildingLocks || []).some(lock => {
      const selection = state.lfBuildingSelections?.[String(lock.planetId)]?.[String(lock.technologyId)];
      return Boolean(selection?.checked && Number(selection.targetLevel) >= Number(lock.targetLevel));
    });
    return conventionalChain || lifeformChain;
  }

  function startCountdownTicker() {
    if (countdownTicker || !hasQueuedWork()) return;
    countdownTicker = setInterval(() => {
      const node = root.querySelector('#ogbqm-countdown');
      if (!hasQueuedWork()) {
        clearInterval(countdownTicker); countdownTicker = null;
        if (node) node.textContent = 'Sem tarefas pendentes';
        return;
      }
      if (node) node.textContent = getAutoCountdownText();
    }, 1000);
  }

  function stopCountdownTicker() {
    if (countdownTicker) clearInterval(countdownTicker);
    countdownTicker = null;
  }

  function scheduleNextAutoCheck(message, explicitDelay = null) {
    if (autoBuildTimer) clearTimeout(autoBuildTimer);
    autoBuildTimer = null;
    if (!hasQueuedWork()) {
      stopCountdownTicker();
      state.autoBuild.active = false;
      state.autoBuild.nextCheckAt = null;
      save();
      render();
      return;
    }
    state.autoBuild.active = true;
    const pending = [...state.queue, ...state.researchQueue, ...state.lfBuildingQueue, ...state.lfResearchQueue]
      .filter(item => item.status === 'pending' || item.status === 'sent');
    const retryTimes = pending.map(item => Number(item.retryAfter) || 0).filter(time => time > Date.now());
    const earliestRetry = retryTimes.length ? Math.min(...retryTimes) - Date.now() : null;
    const hasLfWorkInProgress = (state.lfBuildingLocks || []).some(lock => {
      const selection = state.lfBuildingSelections?.[String(lock.planetId)]?.[String(lock.technologyId)];
      return Boolean(selection?.checked && Number(selection.targetLevel) >= Number(lock.targetLevel));
    }) || (state.lfResearchLocks || []).some(lock => {
      const selection = state.lfResearchSelections?.[String(lock.planetId)]?.[String(lock.technologyId)];
      return Boolean(selection?.checked && Number(selection.targetLevel) >= Number(lock.targetLevel));
    });
    const normalDelay = hasLfWorkInProgress ? LF_PROGRESS_RETRY_MS : randomPollDelay();
    const wait = explicitDelay !== null ? Math.max(0, explicitDelay)
      : earliestRetry !== null ? Math.min(normalDelay, earliestRetry)
      : normalDelay;
    state.autoBuild.nextCheckAt = Date.now() + wait;
    startCountdownTicker();
    if (message) state.autoBuild.lastMessage = `${message} Próxima tentativa em cerca de ${Math.ceil(wait / 1000)} s.`;
    save();
    render();
    autoBuildTimer = setTimeout(() => {
      autoBuildTimer = null;
      state.autoBuild.nextCheckAt = null;
      runAutoBuild();
    }, wait);
  }

  async function tryStartBuildingItemInternal(item) {
    const planet = getPlanetSnapshot(item.planetId);
    if (!planet || !Object.prototype.hasOwnProperty.call(planet.buildings || {}, String(item.buildingId))) {
      item.retryAfter = Date.now() + POLL_MIN_MS;
      return { started: false, message: `Sem dados de ${item.building} em ${item.planet}.` };
    }

    if (String(item.buildingId) === '15' && state.lfBuildingLocks.some(lock => String(lock.planetId) === String(item.planetId))) {
      item.retryAfter = Date.now() + POLL_MIN_MS;
      return { started: false, message: `${item.planet}: uma construção de forma de vida está em curso; a Fábrica de Nanites aguarda.` };
    }

    let context;
    try {
      // Cada planeta é aberto sequencialmente no iframe oculto. A janela
      // principal permanece livre e não há espera de 45–60 s entre planetas.
      context = await loadBackgroundGamePage(item.planetId, getBuildingComponent(item.buildingId));
    } catch (error) {
      item.retryAfter = Date.now() + POLL_MIN_MS;
      item.lastBackgroundError = error?.message || String(error);
      return { started: false, message: `Não consegui abrir ${item.planet} em segundo plano (${item.lastBackgroundError}).` };
    }

    let button = null;
    const deadline = Date.now() + 12000;
    while (Date.now() < deadline) {
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
      return { started: false, message: `${item.building} em ${item.planet}: o botão indica nível ${actualButtonTarget ?? 'desconhecido'}, não ${expectedTarget}.` };
    }
    if (button.disabled || button.getAttribute('aria-disabled') === 'true' || button.classList.contains('disabled')) {
      const delay = getBlockedRetryDelay(button);
      item.retryReason = delay === RESOURCE_RETRY_MS ? 'resources' : 'blocked';
      item.retryAfter = Date.now() + delay;
      const reason = getButtonBlockReason(button);
      return { started: false, resourceBlocked: delay === RESOURCE_RETRY_MS, message: `${item.building} em ${item.planet}: botão indisponível${reason ? ` (${reason})` : ''}; nova tentativa em ${Math.ceil(delay / 1000)} s.` };
    }
    if (!isSelectedBuilding(item.planetId, item.buildingId)) {
      item.retryAfter = Date.now() + POLL_MIN_MS;
      return { started: false, message: `${item.building} em ${item.planet}: seleção já desativada.` };
    }
    if (!isExecutionContextCurrent(context, item.planetId, getBuildingComponent(item.buildingId))) {
      item.retryAfter = Date.now() + POLL_MIN_MS;
      return { started: false, message: `O contexto de ${item.planet} mudou antes do envio; sem clique.` };
    }

    delete item.retryReason;
    const technologyCard = button.closest('li.technology') || button.parentElement;
    const beforeCard = technologyCard?.outerHTML || '';
    const beforeQueue = context.doc.querySelector('#buildingqueue, #buildingQueue, .buildingQueue, .construction.active')?.textContent || '';
    item.beforeCardHtml = beforeCard;
    item.beforeQueueText = beforeQueue;

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
    const visuallyConfirmed = Boolean(
      (buttonAfter && (buttonAfter.disabled || buttonAfter.getAttribute('aria-disabled') === 'true'
        || getButtonTargetLevel(buttonAfter) !== expectedTarget))
      || (afterQueue && afterQueue !== beforeQueue)
    );
    item.visualConfirmation = Boolean(visuallyConfirmed);
    item.lastAttemptAt = new Date().toISOString();
    state.autoBuild.currentQueueId = null;
    if (visuallyConfirmed) {
      addBuildingLock(item);
      // A tarefa sai imediatamente da fila pendente; o bloqueio transitório
      // impede tentativas duplicadas até o nível novo aparecer nos dados.
      state.queue = state.queue.filter(entry => entry.id !== item.id);

      // Mantém a seleção ativa até atingir o nível final pedido. Quando o nível
      // atual for confirmado, reconcileAutomaticQueue cria a próxima etapa.
    } else {
      item.status = 'sent';
    }
    save();
    render();
    return {
      started: Boolean(visuallyConfirmed),
      submitted: true,
      confirmed: Boolean(visuallyConfirmed),
      message: `${item.building} nível ${expectedTarget} em ${item.planet}: ${visuallyConfirmed ? 'iniciada e removida da fila pendente' : 'pedido enviado; mantém-se na fila até confirmação'}.`
    };
  }

  async function tryStartBuildingItem(item) {
    try {
      return await tryStartBuildingItemInternal(item);
    } finally {
      await restoreVisiblePlanetInBackground();
    }
  }

  async function recheckSentBuildingOrders() {
    const sentItems = state.queue.filter(item => item.status === 'sent' && /^\d+$/.test(String(item.buildingId || '')));
    for (const item of sentItems) {
      try {
        const component = getBuildingComponent(item.buildingId);
        const context = await loadBackgroundGamePage(item.planetId, component);
        const button = getUpgradeButton(item.buildingId, context.doc);
        const queueText = context.doc.querySelector('#buildingqueue, #buildingQueue, .buildingQueue, .construction.active')?.textContent || '';
        const target = button ? getButtonTargetLevel(button) : null;
        const confirmed = Boolean(
          (button && (button.disabled || button.getAttribute('aria-disabled') === 'true' || target !== Number(item.targetLevel)))
          || (queueText && queueText !== String(item.beforeQueueText || ''))
        );
        if (confirmed) {
          addBuildingLock(item);
          state.queue = state.queue.filter(entry => entry.id !== item.id);
          // A seleção permanece ativa para continuar até ao nível final pretendido.
          state.autoBuild.lastMessage = `${item.building}, nível ${item.targetLevel}: construção confirmada após atualização do contexto.`;
        } else if (button && !button.disabled && target === Number(item.targetLevel)) {
          // O contexto foi recarregado e o botão continua disponível para o mesmo nível:
          // o pedido anterior não iniciou a construção; devolvemos a ordem a pendente.
          item.status = 'pending';
          item.sentAt = null;
          item.retryAfter = Date.now() + randomPollDelay();
          item.visualConfirmation = false;
          state.autoBuild.lastMessage = `${item.building} em ${item.planet}: o jogo não confirmou o início. A ordem mantém-se na fila e será tentada novamente.`;
        }
      } catch (error) {
        item.retryAfter = Date.now() + POLL_MIN_MS;
        item.lastRecheckError = error?.message || String(error);
      }
    }
    save();
  }

  function saveLfSnapshot(planetId, kind, doc) {
    const entries = extractLifeformEntries(doc, kind);
    if (!entries.length) return entries;
    state.lfData ||= {};
    const planetData = state.lfData[String(planetId)] ||= { buildings: [], researches: [], syncedAt: null };
    planetData[kind] = entries;
    planetData.syncedAt = new Date().toISOString();
    return entries;
  }

  function completeLfQueueItem(item, kind) {
    const isBuilding = kind === 'building';
    const queue = isBuilding ? state.lfBuildingQueue : state.lfResearchQueue;
    const locks = isBuilding ? state.lfBuildingLocks : state.lfResearchLocks;
    const name = isBuilding ? item.building : item.research;
    if (!locks.some(lock => lock.id === item.id)) {
      locks.push({
        id: item.id, planetId: String(item.planetId), technologyId: String(item.technologyId),
        name, targetLevel: Number(item.targetLevel), startedAt: item.sentAt || new Date().toISOString()
      });
    }
    // Mantém a seleção ativa; a reconciliação cria o nível seguinte até ao alvo.
    if (isBuilding) state.lfBuildingQueue = queue.filter(entry => entry.id !== item.id);
    else state.lfResearchQueue = queue.filter(entry => entry.id !== item.id);
    state.autoBuild.lastMessage = `${name}, nível ${item.targetLevel}: início confirmado; removido da fila de formas de vida.`;
  }

  async function recheckSentLfOrders() {
    for (const [kind, queue] of [['building', state.lfBuildingQueue], ['research', state.lfResearchQueue]]) {
      const component = kind === 'building' ? 'lfbuildings' : 'lfresearch';
      for (const item of [...queue].filter(entry => entry.status === 'sent')) {
        try {
          const context = await loadLifeformGamePage(item.planetId, component);
          const dataKind = kind === 'building' ? 'buildings' : 'researches';
          saveLfSnapshot(item.planetId, dataKind, context.doc);
          const button = getUpgradeButton(item.technologyId, context.doc);
          const liveEntry = (state.lfData?.[String(item.planetId)]?.[dataKind] || [])
            .find(row => String(row.id) === String(item.technologyId));
          const target = button ? getButtonTargetLevel(button) : null;
          // Não usar uma alteração genérica de .construction.active como prova:
          // pode ser uma construção convencional ou outro elemento da página.
          const confirmed = Boolean(
            (liveEntry && Number(liveEntry.currentLevel) >= Number(item.targetLevel))
            || (button && (button.disabled || button.getAttribute('aria-disabled') === 'true'
              || button.classList.contains('disabled') || target !== Number(item.targetLevel)))
          );
          if (confirmed) {
            completeLfQueueItem(item, kind);
          } else if (button && !button.disabled && target === Number(item.targetLevel)) {
            const selections = kind === 'building' ? state.lfBuildingSelections : state.lfResearchSelections;
            const stillSelected = Boolean(selections?.[String(item.planetId)]?.[String(item.technologyId)]?.checked);
            if (!stillSelected) {
              if (kind === 'building') state.lfBuildingQueue = state.lfBuildingQueue.filter(entry => entry.id !== item.id);
              else state.lfResearchQueue = state.lfResearchQueue.filter(entry => entry.id !== item.id);
              state.autoBuild.lastMessage = `${item.building || item.research}: removido da fila; o jogo confirmou que ainda não tinha começado.`;
            } else {
              item.status = 'pending';
              item.sentAt = null;
              item.retryAfter = Date.now() + randomPollDelay();
              item.visualConfirmation = false;
              state.autoBuild.lastMessage = `${item.building || item.research}: o jogo não confirmou o início; a ordem continua na fila.`;
            }
          } else if (!button && (!liveEntry || Number(liveEntry.currentLevel) < Number(item.targetLevel))) {
            // Sem botão e sem nível aumentado não há confirmação suficiente.
            // Devolve a ordem a pendente em vez de a deixar eternamente em "sent".
            item.status = 'pending';
            item.sentAt = null;
            item.retryAfter = Date.now() + randomPollDelay();
            item.visualConfirmation = false;
            state.autoBuild.lastMessage = `${item.building || item.research}: botão não disponível para confirmar; mantenho a ordem pendente.`;
          }
        } catch (error) {
          item.retryAfter = Date.now() + POLL_MIN_MS;
          item.lastRecheckError = error?.message || String(error);
        }
      }
    }
    // Libertar bloqueios quando a página atualizada já mostra o nível concluído.
    for (const kind of ['buildings', 'researches']) {
      const locks = kind === 'buildings' ? state.lfBuildingLocks : state.lfResearchLocks;
      for (const lock of [...locks]) {
        const data = state.lfData?.[String(lock.planetId)]?.[kind] || [];
        const entry = data.find(row => String(row.id) === String(lock.technologyId));
        if (entry && Number(entry.currentLevel) >= Number(lock.targetLevel)) {
          const index = locks.indexOf(lock);
          if (index >= 0) locks.splice(index, 1);
        }
      }
    }
    save();
  }

  async function tryStartLfItem(item, kind) {
    const isBuilding = kind === 'building';
    const component = isBuilding ? 'lfbuildings' : 'lfresearch';
    const dataKind = isBuilding ? 'buildings' : 'researches';
    const name = isBuilding ? item.building : item.research;
    const locks = isBuilding ? state.lfBuildingLocks : state.lfResearchLocks;
    const planetId = String(item.planetId);
    const blockingLock = locks.find(lock => String(lock.planetId) === planetId);
    if (blockingLock) {
      const since = blockingLock.startedAt ? new Date(blockingLock.startedAt).toLocaleString('pt-PT') : 'data desconhecida';
      const message = `${name}: bloqueada por um registo de construção LF anterior (nível ${blockingLock.targetLevel ?? '?'}, ${since}). Vou validar novamente o estado no jogo.`;
      item.retryAfter = Date.now() + RESOURCE_RETRY_MS;
      item.retryReason = 'stale-lock-check';
      return { started: false, blocked: true, message };
    }
    const selected = isBuilding
      ? Boolean(state.lfBuildingSelections?.[planetId]?.[String(item.technologyId)]?.checked)
      : Boolean(state.lfResearchSelections?.[planetId]?.[String(item.technologyId)]?.checked);
    if (!selected) {
      if (isBuilding) state.lfBuildingQueue = state.lfBuildingQueue.filter(entry => entry.id !== item.id);
      else state.lfResearchQueue = state.lfResearchQueue.filter(entry => entry.id !== item.id);
      save();
      return { started: false, cancelled: true };
    }

    if (isBuilding) {
      const naniteBusy = state.activeBuildingLocks.some(lock => String(lock.planetId) === planetId && String(lock.buildingId) === '15')
        || state.queue.some(entry => String(entry.planetId) === planetId && String(entry.buildingId) === '15' && ['sent', 'started'].includes(entry.status));
      if (naniteBusy) { item.retryAfter = Date.now() + POLL_MIN_MS; return { started: false, message: `${item.planet}: a Fábrica de Nanites está em construção; os edifícios LF aguardam.` }; }
      if (String(item.technologyId).endsWith('03') && state.lfResearchLocks.some(lock => String(lock.planetId) === planetId)) {
        item.retryAfter = Date.now() + POLL_MIN_MS; return { started: false, message: `${item.planet}: o Centro de Pesquisa LF aguarda a conclusão da pesquisa de forma de vida.` };
      }
    } else if (state.lfBuildingLocks.some(lock => String(lock.planetId) === planetId && String(lock.technologyId).endsWith('03'))) {
      item.retryAfter = Date.now() + POLL_MIN_MS;
      return { started: false, message: `${item.planet}: o Centro de Pesquisa LF está em construção; a pesquisa aguarda.` };
    }

    let context;
    try { context = await loadLifeformGamePage(planetId, component); }
    catch (error) { item.retryAfter = Date.now() + POLL_MIN_MS; return { started: false, message: `${name}: não consegui abrir a página de formas de vida (${error?.message || error}).` }; }
    const entries = saveLfSnapshot(planetId, dataKind, context.doc);
    const liveEntry = entries.find(entry => String(entry.id) === String(item.technologyId));
    let expectedTarget = Number(item.targetLevel);
    if (liveEntry && Number(liveEntry.currentLevel) >= expectedTarget) {
      item.currentLevel = Number(liveEntry.currentLevel);
      item.targetLevel = item.currentLevel + 1;
      expectedTarget = Number(item.targetLevel);
    }
    const button = getUpgradeButton(item.technologyId, context.doc);
    if (!button) { item.retryAfter = Date.now() + POLL_MIN_MS; return { started: false, message: `Não encontrei o botão de ${name} na página ${component}.` }; }
    const actualTarget = getButtonTargetLevel(button);
    if (actualTarget !== expectedTarget) { item.retryAfter = Date.now() + POLL_MIN_MS; return { started: false, message: `${name}: o jogo indica nível ${actualTarget ?? 'desconhecido'}, não ${expectedTarget}.` }; }
    if (button.disabled || button.getAttribute('aria-disabled') === 'true' || button.classList.contains('disabled')) {
      const delay = getBlockedRetryDelay(button);
      item.retryReason = delay === RESOURCE_RETRY_MS ? 'resources' : 'blocked';
      item.retryAfter = Date.now() + delay;
      const reason = getButtonBlockReason(button);
      return { started: false, resourceBlocked: delay === RESOURCE_RETRY_MS, message: `${name}: botão indisponível${reason ? ` (${reason})` : ''}; nova tentativa em ${Math.ceil(delay / 1000)} s.` };
    }
    delete item.retryReason;
    const beforeCard = (button.closest('li') || button.closest('.technology') || button.parentElement)?.outerHTML || '';
    const beforeQueue = context.doc.querySelector('#lifeformBuildingQueue, .lifeformBuildingQueue, #lifeformResearchQueue, .lifeformResearchQueue, .construction.active')?.textContent || '';
    item.beforeQueueText = beforeQueue;
    item.beforeCardHtml = beforeCard;
    item.status = 'sent'; item.sentAt = new Date().toISOString(); item.retryAfter = null; item.visualConfirmation = false;
    save(); render();
    button.click();
    await sleep(1800);
    const afterDoc = context.frame?.contentDocument || context.doc;
    const buttonAfter = getUpgradeButton(item.technologyId, afterDoc);
    const afterCard = (buttonAfter?.closest('li') || buttonAfter?.closest('.technology') || buttonAfter?.parentElement)?.outerHTML || '';
    const confirmed = Boolean(
      (buttonAfter && (buttonAfter.disabled || buttonAfter.getAttribute('aria-disabled') === 'true'
        || buttonAfter.classList.contains('disabled') || getButtonTargetLevel(buttonAfter) !== expectedTarget))
    );
    item.visualConfirmation = confirmed;
    if (confirmed) completeLfQueueItem(item, kind);
    else state.autoBuild.lastMessage = `${name}: pedido enviado; mantenho na fila até confirmar o início.`;
    save(); render();
    return { started: confirmed, submitted: true, message: `${name}: ${confirmed ? 'iniciado' : 'pedido enviado; aguarda confirmação'}.` };
  }

  function reconcileLifeformQueueSelections() {
    for (const [planetId, data] of Object.entries(state.lfData || {})) {
      const planetName = getPlanetSnapshot(planetId)?.name || `Planeta ${planetId}`;
      const buildingSelections = state.lfBuildingSelections?.[planetId] || {};
      for (const [technologyId, selection] of Object.entries(buildingSelections)) {
        if (!selection?.checked) continue;
        const entry = (data.buildings || []).find(row => String(row.id) === String(technologyId));
        if (!entry) continue;
        // Usa a seleção já recebida no for..of. Uma segunda declaração com
        // o mesmo nome criava uma variável em TDZ e interrompia o ciclo.
        const desiredTargetLevel = Number(selection.targetLevel) || entry.currentLevel + 1;
        if (entry.currentLevel >= desiredTargetLevel) { selection.checked = false; selection.queueOrder = null; continue; }
        if (!Number(selection.queueOrder)) selection.queueOrder = nextQueueOrder();
        const locked = state.lfBuildingLocks.some(lock => String(lock.planetId) === planetId && String(lock.technologyId) === String(technologyId));
        const existing = state.lfBuildingQueue.find(item => String(item.planetId) === planetId && String(item.technologyId) === String(technologyId) && ['pending', 'sent'].includes(item.status));
        if (existing) {
          if (existing.status === 'pending') { existing.currentLevel = entry.currentLevel; existing.targetLevel = entry.currentLevel + 1; existing.desiredTargetLevel = desiredTargetLevel; }
          continue;
        }
        if (locked) continue;
        const count = state.lfBuildingQueue.filter(item => ['pending', 'sent'].includes(item.status)).length;
        if (count >= 10) continue;
        state.lfBuildingQueue.push({
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, type: 'lf-building', technologyId: String(technologyId),
          building: entry.name, planetId, planet: planetName, currentLevel: entry.currentLevel,
          targetLevel: entry.currentLevel + 1, desiredTargetLevel, queueOrder: Number(selection.queueOrder) || nextQueueOrder(),
          status: 'pending', createdAt: new Date().toISOString()
        });
      }
      const researchSelections = state.lfResearchSelections?.[planetId] || {};
      for (const [technologyId, selection] of Object.entries(researchSelections)) {
        if (!selection?.checked) continue;
        const entry = (data.researches || []).find(row => String(row.id) === String(technologyId));
        if (!entry) continue;
        const existing = state.lfResearchQueue.find(item => String(item.planetId) === planetId && String(item.technologyId) === String(technologyId) && ['pending', 'sent'].includes(item.status));
        if (existing) {
          if (existing.status === 'pending') { existing.currentLevel = entry.currentLevel; existing.targetLevel = entry.currentLevel + 1; }
          continue;
        }
        state.lfResearchQueue.push({
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, type: 'lf-research', technologyId: String(technologyId),
          research: entry.name, planetId, planet: planetName, currentLevel: entry.currentLevel,
          targetLevel: entry.currentLevel + 1, queueOrder: Number(selection.queueOrder) || nextQueueOrder(), status: 'pending', createdAt: new Date().toISOString()
        });
      }
    }
    save();
  }

  async function runLifeformQueuesOnce() {
    const outcomes = [];
    // Valida os bloqueios LF contra o estado real do jogo. Um bloqueio antigo
    // não pode prender uma ordem para sempre: se o nível ainda não subiu mas o
    // botão desse mesmo nível está novamente disponível, a construção não está ativa.
    for (const [kind, locks] of [['building', state.lfBuildingLocks], ['research', state.lfResearchLocks]]) {
      const component = kind === 'building' ? 'lfbuildings' : 'lfresearch';
      const dataKind = kind === 'building' ? 'buildings' : 'researches';
      for (const lock of [...locks]) {
        try {
          const context = await loadLifeformGamePage(lock.planetId, component);
          const entries = saveLfSnapshot(lock.planetId, dataKind, context.doc);
          const entry = entries.find(row => String(row.id) === String(lock.technologyId));
          const button = getUpgradeButton(lock.technologyId, context.doc);
          const buttonTarget = button ? getButtonTargetLevel(button) : null;
          const levelReached = Boolean(entry && Number(entry.currentLevel) >= Number(lock.targetLevel));
          const gameShowsIdle = Boolean(button
            && !button.disabled
            && button.getAttribute('aria-disabled') !== 'true'
            && !button.classList.contains('disabled')
            && (buttonTarget === null || buttonTarget >= Number(lock.targetLevel)));
          if (levelReached || gameShowsIdle) {
            const index = locks.indexOf(lock);
            if (index >= 0) locks.splice(index, 1);
            if (!levelReached) {
              const pending = (kind === 'building' ? state.lfBuildingQueue : state.lfResearchQueue)
                .filter(item => String(item.planetId) === String(lock.planetId)
                  && String(item.technologyId) === String(lock.technologyId)
                  && item.status === 'pending');
              for (const item of pending) {
                item.retryAfter = 0;
                item.retryReason = 'stale-lock-cleared';
              }
              outcomes.push(`${lock.name || 'Ordem LF'}: bloqueio antigo removido; o jogo mostra o botão disponível.`);
            }
          }
        } catch (error) {
          const pending = (kind === 'building' ? state.lfBuildingQueue : state.lfResearchQueue)
            .find(item => String(item.planetId) === String(lock.planetId) && item.status === 'pending');
          if (pending) {
            pending.retryAfter = Date.now() + RESOURCE_RETRY_MS;
            pending.retryReason = 'stale-lock-check';
          }
          outcomes.push(`${lock.name || 'Ordem LF'}: não consegui validar o bloqueio no jogo (${error?.message || error}). O registo foi mantido por segurança; nova tentativa em 20 s.`);
        }
      }
    }
    reconcileLifeformQueueSelections();
    const handledPlanets = new Set();
    const candidates = [
      ...state.lfBuildingQueue.filter(item => item.status === 'pending').map(item => ({ item, kind: 'building' })),
      ...state.lfResearchQueue.filter(item => item.status === 'pending').map(item => ({ item, kind: 'research' }))
    ].filter(({ item }) => !item.retryAfter || Number(item.retryAfter) <= Date.now())
      .sort((a, b) => Number(a.item.queueOrder || 0) - Number(b.item.queueOrder || 0)
        || String(a.item.createdAt || '').localeCompare(String(b.item.createdAt || '')));
    for (const { item, kind } of candidates) {
      const pid = String(item.planetId);
      const key = `${kind}:${pid}`;
      if (handledPlanets.has(key)) continue;
      handledPlanets.add(key);
      try {
        const result = await tryStartLfItem(item, kind);
        if (result.message) outcomes.push(result.message);
      } catch (error) {
        item.retryAfter = Date.now() + RESOURCE_RETRY_MS;
        item.retryReason = 'execution-error';
        outcomes.push(`${item.planet}: erro ao executar ${item.building || item.research} (${error?.message || error}). Nova tentativa em 20 s.`);
      } finally {
        await restoreVisiblePlanetInBackground();
      }
    }
    if (outcomes.length) state.autoBuild.lastMessage = outcomes.join(' ');
    save();
    return outcomes.length > 0;
  }

  async function runAutoBuild(options = {}) {
    if (autoBuildBusy) { rerunRequested = true; return; }
    if (lifeformReadBusy) { runnerWaitingForLfRead = true; return; }
    state.autoBuild.active = true;
    autoBuildBusy = true;
    try {
      const canResumeSnapshot = Boolean(options.skipRefresh && state.accountSnapshot?.planets?.length);
      const refreshed = canResumeSnapshot || await readAccountData({ silent: true });
      if (!refreshed) {
        scheduleNextAutoCheck('Não foi possível atualizar os dados da conta; vou tentar novamente.', null);
        return;
      }
      state.autoBuild.lastScanAt = new Date().toISOString();
      ensureQueueOrder([...state.queue, ...state.researchQueue, ...state.lfBuildingQueue, ...state.lfResearchQueue]);
      await recheckSentBuildingOrders();
      await recheckSentLfOrders();
      reconcileAutomaticQueue();
      reconcileAutomaticResearchQueue();

      // Recolhe todas as ordens prontas, uma por planeta. O código percorre-as
      // sequencialmente no iframe oculto dentro deste ciclo de execução.
      const readyItems = findReadyQueueItems();
      const outcomes = [];
      let startedCount = 0;
      for (const item of readyItems) {
        if (!state.autoBuild.active) break;
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

      // A pesquisa é global: no máximo uma investigação pode ser iniciada.
      const researchHandled = await runAutoResearchOnce();
      await runLifeformQueuesOnce();
      if (researchHandled) {
        if (hasQueuedWork()) scheduleNextAutoCheck('Pesquisa processada; continuo as restantes filas.', null);
        else scheduleNextAutoCheck(null);
        return;
      }
      // Defesa adicional: garante que a sessão termina no planeta que o
      // utilizador deixou aberto, mesmo após várias ordens no mesmo ciclo.
      await restoreVisiblePlanetInBackground();

      const selectedCount = (state.accountSnapshot?.planets || []).reduce((total, planet) =>
        total + getSelectedBuildingIds(planet.id).length, 0);
      const selectedResearchCount = getSelectedResearchIds().length;
      const activeResearch = state.researchQueue.find(entry => entry.status === 'sent' || entry.status === 'started') || state.activeResearchLock;
      let message;
      if (startedCount > 0) {
        message = `Ciclo concluído: ${startedCount} construção(ões) submetida(s) em planetas distintos.`;
        if (outcomes.length > startedCount) message += ` ${outcomes.filter(Boolean).join(' ')}`;
      } else if (outcomes.length) {
        message = `Verifiquei ${readyItems.length} planeta(s), mas não iniciei novas construções. ${outcomes.join(' ')}`;
      } else if (activeResearch) {
        message = `${activeResearch.research} nível ${activeResearch.targetLevel} está em investigação; a fila global aguarda a conclusão.`;
      } else {
        message = (selectedCount || selectedResearchCount)
          ? `Verificados ${selectedCount} edifício(s) e ${selectedResearchCount} pesquisa(s); as restantes ordens aguardam recursos, disponibilidade ou conclusão de outra tarefa.`
          : 'Monitorização ativa, mas ainda não há edifícios ou pesquisas selecionados.';
      }
      const resourceRetry = [...state.queue, ...state.researchQueue, ...state.lfBuildingQueue, ...state.lfResearchQueue].some(item => item.status === 'pending' && item.retryReason === 'resources' && item.retryAfter && Number(item.retryAfter) <= Date.now() + RESOURCE_RETRY_MS);
      scheduleNextAutoCheck(message, resourceRetry ? 20000 : null);
    } catch (error) {
      console.error('[OGame BQM] Erro no ciclo automático:', error);
      scheduleNextAutoCheck(`Erro no ciclo automático: ${error?.message || error}. Vou tentar novamente.`, null);
    } finally {
      autoBuildBusy = false;
      if (rerunRequested) {
        rerunRequested = false;
        if (hasQueuedWork()) scheduleNextAutoCheck('Nova ordem adicionada durante a execução; vou tratá-la agora.', 0);
        else scheduleNextAutoCheck(null);
      }
    }
  }

  function render() {
    const byQueueOrder = (a, b) => Number(a.queueOrder || 0) - Number(b.queueOrder || 0)
      || String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
    state.queue.sort(byQueueOrder);
    state.researchQueue.sort(byQueueOrder);
    state.lfBuildingQueue.sort(byQueueOrder);
    state.lfResearchQueue.sort(byQueueOrder);
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
      const queueStatus = item.status === 'done' ? 'Concluído'
        : item.status === 'cancelled' ? 'Cancelado'
        : item.status === 'started' ? 'Construção iniciada'
        : item.status === 'sent' ? 'Pedido enviado — a confirmar'
        : item.retryAfter && Number(item.retryAfter) > Date.now() ? 'A aguardar próxima verificação'
        : 'Pendente — disponibilidade confirmada no jogo';
      const assessmentHtml = `<div class=\"item-status ${item.status === 'started' ? 'started' : item.status === 'sent' ? 'sent' : 'wait'}\">${esc(queueStatus)}</div>`;
      return `
      <div class="item ${next && next.id === item.id ? 'current' : ''}">
        <div><div class="item-title">${index + 1}. ${esc(item.building)} — nível ${Number(item.targetLevel)}${Number(item.desiredTargetLevel) > Number(item.targetLevel) ? ` até ${Number(item.desiredTargetLevel)}` : ''}</div>
          <div class="item-meta">${esc(item.planet || 'Planeta por definir')} · ${item.status === 'done' ? 'Concluído' : item.status === 'cancelled' ? 'Cancelado — edifício retirado da seleção' : item.status === 'started' ? 'Construção iniciada' : item.status === 'sent' ? 'Clique enviado — aguarda confirmação do nível' : 'Pendente / a aguardar validação no jogo'}${Number.isInteger(item.currentLevel) ? ` · atual ${item.currentLevel}` : ''}</div></div>
        <div class="item-buttons">
          <button data-action="up" data-id="${esc(item.id)}" ${index === 0 ? 'disabled' : ''} title="Mover para cima">↑</button>
          <button data-action="down" data-id="${esc(item.id)}" ${index === state.queue.length - 1 ? 'disabled' : ''} title="Mover para baixo">↓</button>
          <button data-action="cancel-order" data-id="${esc(item.id)}" title="Anular esta ordem, removê-la da fila e desmarcar o edifício neste planeta" aria-label="Anular ${esc(item.building)} em ${esc(item.planet || 'planeta')}">×</button>
        </div>
        ${assessmentHtml}
      </div>`;
    }).join('') : '<div class="muted">A fila ainda está vazia.</div>';

    const statusClass = readStatus.startsWith('Leitura concluída') ? 'notice good'
      : (readStatus.startsWith('Não foi possível') ? 'notice error' : 'notice');
    const snapshotAge = state.accountSnapshot?.syncedAt
      ? new Date(state.accountSnapshot.syncedAt).toLocaleString('pt-PT') : 'Ainda não lido';
    const planetOptions = allPlanets.map(planet =>
      `<option value="${esc(planet.id)}" ${String(planet.id) === String(displayed?.id) ? 'selected' : ''}>${esc(planet.type === 'moon' ? 'Lua' : 'Planeta')} · ${esc(planet.name)} ${planet.coords ? `[${esc(planet.coords)}]` : ''}</option>`
    ).join('');
    const analysisHtml = `<div class=\"section\"><div class=\"muted\">Ao marcar um edifício, a ordem entra imediatamente na fila e o gestor tenta iniciá-la. Uma construção ativa por planeta.</div></div>`;
    const selectedResearchCount = getSelectedResearchIds().length;
    const activeResearchItem = state.researchQueue.find(item => item.status === 'sent' || item.status === 'started') || state.activeResearchLock;
    const researchTabHtml = `
      <div class=\"section\"><strong>Pesquisas globais</strong>
        <div class=\"muted\">As tecnologias são globais à conta: ao marcar uma pesquisa, entra imediatamente na fila. Só existe uma investigação convencional ativa de cada vez.</div>
        <div class=\"research-list\">${renderResearchChoices()}</div>
        <div class=\"muted\">Selecionadas: ${selectedResearchCount} · Níveis conhecidos: ${Object.keys(state.accountSnapshot?.researches || {}).length}/${Object.keys(RESEARCHES).length}</div>
      </div>
      <div class=\"section\"><div class=\"topline\"><strong>Fila de pesquisas</strong><strong>${state.researchQueue.length}</strong></div>
        <div class=\"queue\">${renderResearchQueue()}</div>
        <div class=\"muted\">As pesquisas iniciadas saem da fila; a fila mostra apenas as próximas pesquisas pendentes.</div>
      </div>`;
    const lfBuildingTabHtml = `
      <div class="section"><strong>Edifícios de formas de vida</strong>
        ${allPlanets.length ? `<select class="planet-select" id="ogbqm-select-planet">${planetOptions}</select>` : ''}
        <div class="muted">A lista mostra a espécie ativa no planeta selecionado. Podes escolher até 10 níveis acima do nível atual para cada edifício LF; a construção avança um nível de cada vez.</div>
        <div class="actions"><button data-action="read-lf" data-kind="buildings">Ler formas de vida</button></div>
        <div class="list-head"><span></span><span>Edifício</span><span>Atual</span><span>Subir para</span></div>
        <div class="building-list">${renderLfEntries(displayed, 'buildings')}</div>
      </div>
      <div class="section"><div class="topline"><strong>Fila de edifícios LF</strong><strong>${state.lfBuildingQueue.length}</strong></div>
        <div class="queue">${renderLfQueue(state.lfBuildingQueue, 'building')}</div>
      </div>`;
    const lfResearchTabHtml = `
      <div class="section"><strong>Pesquisas de formas de vida</strong>
        ${allPlanets.length ? `<select class="planet-select" id="ogbqm-select-planet">${planetOptions}</select>` : ''}
        <div class="muted">As tecnologias disponíveis são lidas da árvore real do planeta. A fila respeita os níveis, as opções desbloqueadas e os bloqueios do jogo.</div>
        <div class="actions"><button data-action="read-lf" data-kind="researches">Ler formas de vida</button></div>
        <div class="research-list">${renderLfEntries(displayed, 'researches')}</div>
      </div>
      <div class="section"><div class="topline"><strong>Fila de pesquisas LF</strong><strong>${state.lfResearchQueue.length}</strong></div>
        <div class="queue">${renderLfQueue(state.lfResearchQueue, 'research')}</div>
      </div>`;
    const buildingTabHtml = `
      <div class=\"section\">
        <strong>Escolher edifícios e nível pretendido</strong>
        ${allPlanets.length ? `<select class=\"planet-select\" id=\"ogbqm-select-planet\">${planetOptions}</select>` : '<div class=\"muted\">Atualiza os dados para carregar os planetas.</div>'}
        ${displayed ? `<div class=\"muted\">${esc(displayed.name)} ${displayed.coords ? `· ${esc(displayed.coords)}` : ''} — marca os edifícios para os colocar imediatamente na fila. Escolhe o nível final pretendido; o gestor constrói um nível de cada vez até lá.</div>` : ''}
        <div class=\"list-head\"><span></span><span>Edifício</span><span>Atual</span><span>Subir para</span></div>
        <div class=\"building-list\" data-planet-id=\"${esc(displayed?.id || '')}\">${renderBuildingChoices(displayed)}</div>
      </div>
      ${analysisHtml}
      <div class=\"section\"><div class=\"topline\"><strong>Fila de edifícios</strong><strong>${state.queue.length}</strong></div>
        <div class=\"queue\">${queueHtml}</div>
        <div class=\"actions\"><button data-action=\"export\">Exportar filas</button><button data-action=\"reset\">Repor gestor</button></div>
      </div>`;

    root.innerHTML = `
      <div class="head" id="ogbqm-drag">
        <div><div class="brand">OGame Building Queue Manager</div><div class="muted">Multiuniverso · v${VERSION}</div></div>
        <button data-action="min" title="${state.minimized ? 'Expandir' : 'Minimizar'}">${state.minimized ? '□' : '—'}</button>
      </div>
      <div class="body">

        <div class="section">
          <div class="topline"><strong>Planeta aberto: ${esc(current.name)}</strong><span class="muted">${esc(current.coords || '')}</span></div>
          <div class="topline"><span class="muted">Última leitura: ${esc(snapshotAge)}</span>
            <button data-action="read" ${readBusy ? 'disabled' : ''}>${readBusy ? 'A ler…' : 'Atualizar agora'}</button></div>
          <div class="muted">Os dados são lidos no arranque e quando pedes uma atualização. Sem ordens pendentes, o gestor não faz verificações periódicas.</div>
          ${readStatus ? `<div class="${statusClass}">${esc(readStatus)}</div>` : ''}
        </div>

        <div class="countdown-panel"><span>Próxima tentativa (apenas com ordens pendentes)</span><strong id="ogbqm-countdown">${esc(getAutoCountdownText())}</strong></div>
        ${state.autoBuild?.lastMessage ? `<div class="section"><div class="notice"><strong>Estado do executor:</strong> ${esc(state.autoBuild.lastMessage)}</div></div>` : ''}

        <div class="tabs">
          <button data-action="tab-buildings" class="${state.activeTab === 'buildings' ? 'active' : ''}">Edifícios (${state.queue.filter(item => !['done','cancelled'].includes(item.status)).length})</button>
          <button data-action="tab-research" class="${state.activeTab === 'research' ? 'active' : ''}">Pesquisas (${state.researchQueue.filter(item => !['done','cancelled'].includes(item.status)).length})</button>
          <button data-action="tab-lfbuildings" class="${state.activeTab === 'lfbuildings' ? 'active' : ''}">Edifícios LF (${state.lfBuildingQueue.filter(item => !['done','cancelled'].includes(item.status)).length})</button>
          <button data-action="tab-lfresearch" class="${state.activeTab === 'lfresearch' ? 'active' : ''}">Pesquisas LF (${state.lfResearchQueue.filter(item => !['done','cancelled'].includes(item.status)).length})</button>
        </div>
        ${state.activeTab === 'research' ? researchTabHtml : state.activeTab === 'lfbuildings' ? lfBuildingTabHtml : state.activeTab === 'lfresearch' ? lfResearchTabHtml : buildingTabHtml}
        <div class="footer">${state.activeTab === 'research'
          ? (activeResearchItem ? `Em curso: ${esc(activeResearchItem.research)} nível ${Number(activeResearchItem.targetLevel)}; fora da fila pendente.` : 'A fila global de pesquisas está pronta.')
          : state.activeTab === 'lfbuildings'
            ? `Fila de edifícios LF: ${state.lfBuildingQueue.length} ordens pendentes. Uma construção LF de cada vez por planeta.`
            : state.activeTab === 'lfresearch'
              ? `Fila de pesquisas LF: ${state.lfResearchQueue.length} ordens. Uma pesquisa LF de cada vez por planeta.`
              : (next ? `Próxima: ${esc(next.building)} nível ${Number(next.targetLevel)} · ${esc(next.planet || 'planeta por definir')}.` : sent ? `A aguardar confirmação: ${esc(sent.building)} nível ${Number(sent.targetLevel)} · ${esc(sent.planet || 'planeta por definir')}.` : inProgressBuilding ? `Em construção: ${esc(inProgressBuilding.building)} nível ${Number(inProgressBuilding.targetLevel)} · ${esc(inProgressBuilding.planet)}; removida da fila pendente.` : 'A fila de edifícios não tem tarefas pendentes.')}
          Execução por seleção; sem polling quando as filas estão vazias.</div>
      </div>`;
  }

  root.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    const id = button.dataset.id;
    const index = state.queue.findIndex(item => item.id === id);

    if (action === 'read') { readAccountData().finally(() => { if (hasQueuedWork()) scheduleNextAutoCheck('Dados atualizados; continuo a fila.', 0); }); return; }
    if (action === 'cancel-lf-order') {
      const kind = button.dataset.kind === 'building' ? 'building' : 'research';
      const queue = kind === 'building' ? state.lfBuildingQueue : state.lfResearchQueue;
      const item = queue.find(entry => entry.id === id);
      if (!item) return;
      const selections = kind === 'building' ? state.lfBuildingSelections : state.lfResearchSelections;
      selections[String(item.planetId)] ||= {};
      selections[String(item.planetId)][String(item.technologyId)] = { checked: false };
      if (item.status === 'pending') {
        if (kind === 'building') state.lfBuildingQueue = queue.filter(entry => entry.id !== id);
        else state.lfResearchQueue = queue.filter(entry => entry.id !== id);
        state.autoBuild.lastMessage = `${item.building || item.research} removido da fila de formas de vida.`;
      } else {
        state.autoBuild.lastMessage = `${item.building || item.research} já foi enviado ao jogo; mantenho a ordem para confirmar o resultado. Se começou, só pode ser cancelado no próprio OGame.`;
      }
      save(); render();
      if (!autoBuildBusy) scheduleNextAutoCheck(hasQueuedWork() ? 'Fila de formas de vida atualizada.' : null, hasQueuedWork() ? 0 : null);
      return;
    }
    if (action === 'tab-buildings') { captureResearchSelections(); state.activeTab = 'buildings'; save(); render(); return; }
    if (action === 'tab-research') { captureBuildingSelections(); state.activeTab = 'research'; save(); render(); return; }
    if (action === 'tab-lfbuildings' || action === 'tab-lfresearch') {
      captureBuildingSelections();
      captureResearchSelections();
      state.activeTab = action === 'tab-lfbuildings' ? 'lfbuildings' : 'lfresearch';
      save(); render();
      const planet = getDisplayedPlanet();
      if (planet) readLifeformDataForPlanet(planet.id, state.activeTab === 'lfbuildings' ? 'buildings' : 'researches').then(render);
      return;
    }
    if (action === 'read-lf') {
      const planet = getDisplayedPlanet();
      if (planet) readLifeformDataForPlanet(planet.id, button.dataset.kind === 'buildings' ? 'buildings' : 'researches').then(render);
      return;
    }
    if (action === 'cancel-research') {
      const researchIndex = state.researchQueue.findIndex(item => item.id === id);
      if (researchIndex < 0) return;
      const item = state.researchQueue[researchIndex];
      const sent = item.status === 'sent' || item.status === 'started';
      if (item.status === 'sent' && !item.visualConfirmation) {
        state.researchSelections ||= {};
        state.researchSelections[String(item.technologyId)] = { checked: false };
        state.autoBuild.lastMessage = `${item.research} retirada da seleção; estou a confirmar se o OGame chegou a iniciar a investigação.`;
        save(); render();
        if (!autoBuildBusy) scheduleNextAutoCheck('A confirmar a última ordem enviada.', 0);
        return;
      }
      state.researchSelections ||= {};
      state.researchSelections[String(item.technologyId)] = { checked: false };
      if (sent) {
        state.activeResearchLock = {
          technologyId: String(item.technologyId),
          targetLevel: Number(item.targetLevel),
          research: item.research,
          sourcePlanetId: item.sourcePlanetId || '',
          sourcePlanet: item.sourcePlanet || ''
        };
      }
      state.researchQueue.splice(researchIndex, 1);
      state.autoBuild.currentResearchQueueId = null;
      state.autoBuild.lastMessage = sent
        ? `${item.research} retirada do gestor e desmarcada. A investigação já tinha sido enviada ao jogo; para a cancelar, usa a opção de cancelar no próprio OGame.`
        : `${item.research} removida da fila.`;
      save(); render();
      if (!autoBuildBusy) scheduleNextAutoCheck(hasQueuedWork() ? 'Pesquisa retirada; continuo as restantes ordens.' : null, hasQueuedWork() ? 0 : null);
      return;
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
          const order = Number(state.researchQueue[a].queueOrder || 0);
          state.researchQueue[a].queueOrder = Number(state.researchQueue[b].queueOrder || 0);
          state.researchQueue[b].queueOrder = order;
          const firstResearchId = String(state.researchQueue[a].technologyId);
          const secondResearchId = String(state.researchQueue[b].technologyId);
          state.researchSelections[firstResearchId] ||= {};
          state.researchSelections[secondResearchId] ||= {};
          state.researchSelections[firstResearchId].queueOrder = Number(state.researchQueue[a].queueOrder);
          state.researchSelections[secondResearchId].queueOrder = Number(state.researchQueue[b].queueOrder);
        }
      }
      save(); render(); return;
    }
    if (action === 'clear-done-research') {
      state.researchQueue = state.researchQueue.filter(item => !['done', 'cancelled'].includes(item.status));
      save(); render(); return;
    }
    if (action === 'min') state.minimized = !state.minimized;
    if ((action === 'cancel-order' || action === 'delete') && index >= 0) {
      const item = state.queue[index];
      const alreadySent = item.status === 'sent' || item.status === 'started';
      if (item.status === 'sent' && !item.visualConfirmation) {
        state.buildingSelections ||= {};
        const selections = state.buildingSelections[String(item.planetId)] ||= {};
        selections[String(item.buildingId)] ||= {};
        selections[String(item.buildingId)].checked = false;
        const visibleList = root.querySelector('.building-list');
        if (visibleList && String(visibleList.dataset.planetId || '') === String(item.planetId)) {
          const row = [...visibleList.querySelectorAll('.building-row')].find(element => String(element.dataset.buildingId || '') === String(item.buildingId));
          const checkbox = row?.querySelector('.building-check');
          if (checkbox) checkbox.checked = false;
        }
        state.autoBuild.lastMessage = `${item.building} retirada da seleção; estou a confirmar se o OGame chegou a iniciar a construção.`;
        save(); render();
        if (!autoBuildBusy) scheduleNextAutoCheck('A confirmar a última ordem enviada.', 0);
        return;
      }

      // O X desmarca também este edifício neste planeta para não recriar a ordem.
      if (state.mode === 'auto' || item.autoGenerated) {
        // Primeiro sincroniza os vistos do painel, mas evita que o visto ainda
        // presente no DOM volte a ativar a ordem durante o render().
        captureBuildingSelections();
        const visibleList = root.querySelector('.building-list');
        if (visibleList && String(visibleList.dataset.planetId || '') === String(item.planetId)) {
          const row = [...visibleList.querySelectorAll('.building-row')]
            .find(element => String(element.dataset.buildingId || '') === String(item.buildingId));
          const checkbox = row?.querySelector('.building-check');
          if (checkbox) checkbox.checked = false;
        }
        state.buildingSelections ||= {};
        const planetSelections = state.buildingSelections[String(item.planetId)] ||= {};
        const buildingSelection = planetSelections[String(item.buildingId)] ||= {};
        buildingSelection.checked = false;
      }

      if (alreadySent) addBuildingLock(item);
      if (state.autoBuild?.currentQueueId === item.id) {
        state.autoBuild.currentQueueId = null;
      }
      state.queue.splice(index, 1);
      state.autoBuild ||= clone(DEFAULTS.autoBuild);
      state.autoBuild.lastMessage = alreadySent
        ? `Ordem de ${item.building} retirada do gestor e seleção desativada em ${item.planet}. Atenção: o pedido já tinha sido enviado ao OGame; para interromper uma construção já iniciada, cancela-a também na fila do próprio jogo.`
        : `Ordem de ${item.building} anulada e removida da fila em ${item.planet}. O edifício ficou desmarcado e não será novamente colocado na fila automaticamente.`;
      save();
      render();
      if (!autoBuildBusy) scheduleNextAutoCheck(hasQueuedWork() ? 'Ordem anulada; continuo as restantes ordens.' : null, hasQueuedWork() ? 0 : null);
      return;
    }
    if (action === 'up' && index > 0) {
      [state.queue[index - 1], state.queue[index]] = [state.queue[index], state.queue[index - 1]];
      [state.queue[index - 1].queueOrder, state.queue[index].queueOrder] = [state.queue[index].queueOrder, state.queue[index - 1].queueOrder];
      for (const item of [state.queue[index - 1], state.queue[index]]) {
        const selection = state.buildingSelections?.[String(item.planetId)]?.[String(item.buildingId)];
        if (selection) selection.queueOrder = Number(item.queueOrder);
      }
    }
    if (action === 'down' && index >= 0 && index < state.queue.length - 1) {
      [state.queue[index + 1], state.queue[index]] = [state.queue[index], state.queue[index + 1]];
      [state.queue[index + 1].queueOrder, state.queue[index].queueOrder] = [state.queue[index].queueOrder, state.queue[index + 1].queueOrder];
      for (const item of [state.queue[index + 1], state.queue[index]]) {
        const selection = state.buildingSelections?.[String(item.planetId)]?.[String(item.buildingId)];
        if (selection) selection.queueOrder = Number(item.queueOrder);
      }
    }
    if (action === 'clear-done') state.queue = state.queue.filter(item => !['done', 'cancelled'].includes(item.status));
    if (action === 'export') {
      const blob = new Blob([JSON.stringify({ version: VERSION, buildingQueue: state.queue, researchQueue: state.researchQueue, lfBuildingQueue: state.lfBuildingQueue, lfResearchQueue: state.lfResearchQueue }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'ogame-building-and-research-queue.json'; anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    if (action === 'reset' && confirm('Apagar a fila, dados lidos e definições do gestor?')) { state = clone(DEFAULTS); state.mode = 'auto'; }
    save();
    render();
  });

  root.addEventListener('change', event => {
    if (event.target.matches('.lf-building-check')) {
      const row = event.target.closest('.lf-building-row');
      enqueueOrRemoveLfBuildingSelection(getDisplayedPlanet()?.id, row?.dataset.technologyId, event.target.checked);
      return;
    }
    if (event.target.matches('.lf-target-level')) {
      const row = event.target.closest('.lf-building-row');
      const pid = String(getDisplayedPlanet()?.id || '');
      const id = String(row?.dataset.technologyId || '');
      const selections = state.lfBuildingSelections[pid] ||= {};
      selections[id] = { ...(selections[id] || {}), targetLevel: Number(event.target.value) };
      if (!Number(selections[id].queueOrder)) selections[id].queueOrder = nextQueueOrder();
      if (row?.querySelector('.lf-building-check')?.checked) {
        const entry = state.lfData?.[pid]?.buildings?.find(item => String(item.id) === id);
        const queued = state.lfBuildingQueue.find(item => String(item.planetId) === pid && String(item.technologyId) === id && item.status === 'pending');
        if (queued && entry) queued.desiredTargetLevel = Number(event.target.value);
        else if (entry) enqueueOrRemoveLfBuildingSelection(pid, id, true);
      }
      save(); render();
      if (hasQueuedWork()) scheduleNextAutoCheck('Nível final atualizado.', 0);
      return;
    }
    if (event.target.matches('.lf-research-check')) {
      const row = event.target.closest('.lf-research-row');
      enqueueOrRemoveLfResearchSelection(getDisplayedPlanet()?.id, row?.dataset.technologyId, event.target.checked);
      return;
    }
    if (event.target.matches('.research-check')) {
      const row = event.target.closest('.research-row');
      const technologyId = String(row?.dataset.researchId || '');
      enqueueOrRemoveResearchSelection(technologyId, event.target.checked);
      return;
    }
    if (event.target.matches('.building-check')) {
      const row = event.target.closest('.building-row');
      captureBuildingSelections();
      enqueueOrRemoveBuildingSelection(row);
      return;
    }
    if (event.target.matches('.target-level')) {
      const row = event.target.closest('.building-row');
      captureBuildingSelections();
      if (row?.querySelector('.building-check')?.checked) enqueueOrRemoveBuildingSelection(row);
      else { save(); render(); }
      return;
    }
    if (event.target.id === 'ogbqm-select-planet') {
      captureBuildingSelections();
      state.selectedPlanetId = event.target.value;
      save(); render();
      if (state.activeTab === 'lfbuildings' || state.activeTab === 'lfresearch') {
        readLifeformDataForPlanet(state.selectedPlanetId, state.activeTab === 'lfbuildings' ? 'buildings' : 'researches').then(render);
      }
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
    const maxTop = Math.max(4, window.innerHeight - 50);
    state.position.top = Math.max(4, Math.min(maxTop, drag.top + event.clientY - drag.y));
    state.position.right = Math.max(4, Math.min(window.innerWidth - 100, drag.right - (event.clientX - drag.x)));
    root.style.top = `${state.position.top}px`;
    root.style.right = `${state.position.right}px`;
  });
  root.addEventListener('pointerup', () => { if (drag) { drag = null; save(); } });
  root.addEventListener('pointercancel', () => { if (drag) { drag = null; save(); } });
  window.addEventListener('resize', () => {
    state.position.top = Math.max(4, Math.min(state.position.top, window.innerHeight - 100));
    state.position.right = Math.max(4, Math.min(state.position.right, window.innerWidth - 100));
    save(); render();
  });

  // Ao mudar de planeta no jogo, guarda as seleções do planeta anterior,
  // muda o contexto do painel e atualiza níveis/recursos automaticamente.
  const planetMetaSelector = 'meta[name="ogame-planet-id"], meta[name="ogame-planet-type"]';
  const initialPagePlanetId = String(getPagePlanetId());
  const previousObservedPagePlanetId = String(state.lastObservedPagePlanetId || '');
  // Compatibilidade com versões anteriores: elimina o bloqueio de navegação,
  // pois a versão atual executa ordens fora da janela principal.
  state.autoBuild.manualNavigationHold = false;
  state.autoBuild.resumeAfterNavigation = false;
  state.autoBuild.navigationTarget = null;
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
    // A mudança de planeta é sempre navegação manual do utilizador; não pausa
    // a execução, porque as ordens são executadas no iframe oculto.
    if (activeId) {
      state.selectedPlanetId = activeId;
      state.lastObservedPagePlanetId = activeId;
      if (!state.autoBuild?.active) rememberManualPlanetId(activeId);
    }
    save();
    render();

    // accountInfo devolve todos os planetas; a atualização não depende de
    // clicar em "Atualizar dados". Se já houver leitura em curso, ela própria
    // já está a obter a fotografia completa da conta.
    if (!readBusy && !state.autoBuild?.active) readAccountData({ silent: true });
  }

  const pageObserver = new MutationObserver(() => syncCurrentPlanetContext());
  pageObserver.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['content']
  });
  window.addEventListener('popstate', () => {
    rememberManualPlanetId(getPagePlanetId());
    syncCurrentPlanetContext();
  });
  window.addEventListener('hashchange', () => {
    rememberManualPlanetId(getPagePlanetId());
    syncCurrentPlanetContext();
  });
  // Algumas mudanças de planeta são feitas por navegação interna do OGame,
  // sem evento popstate nem alteração observável do <head>.

  // Se o separador já estiver na página de Pesquisas, recolhe os níveis
  // disponíveis no DOM e guarda-os como complemento do accountInfo.
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
  // Atualiza apenas o texto do contador; não volta a renderizar o painel nem
  // interfere com as caixas de seleção que o utilizador está a editar.
  // Uma leitura inicial. Sem ordens pendentes, não existe polling permanente.
  // Se havia fila guardada, o executor retoma-a depois de atualizar os dados.
  readAccountData({ silent: Boolean(state.accountSnapshot) }).finally(() => {
    if (hasQueuedWork()) scheduleNextAutoCheck('Retomar fila guardada.', 0);
  });
})();
