import {
  absorbAmulet,
  available,
  computeDamage,
  createCombat,
  playerAct,
  startCombat,
  type CombatOpts,
  type CombatState,
  type FxEvent,
} from './game/combat';
import { Rng, randomSeed } from './game/rng';
import { SPELLS, TYPE_COLORS, isUnlocked } from './game/spells';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface FloatNum {
  x: number;
  y: number;
  vy: number;
  life: number;
  text: string;
  color: string;
  big: boolean;
}

let state: CombatState;
let rng: Rng;
let root: HTMLElement;
let onExit: (outcome: 'win' | 'lose') => void;

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let particles: Particle[] = [];
let floats: FloatNum[] = [];
let shake = 0;
let flash: { color: string; a: number } | null = null;
let rafId = 0;

// текущая заготовка каста (выбор заклинания + вложение)
let selectedSpell: string | null = null;
let invest = 0;

export function renderCombat(
  mount: HTMLElement,
  exit: (outcome: 'win' | 'lose') => void,
  opts: CombatOpts = {},
): void {
  root = mount;
  onExit = exit;
  particles = [];
  floats = [];
  lastLogLen = 0;
  rng = new Rng(randomSeed());
  state = createCombat(opts);
  startCombat(state, rng);
  buildDom();
  loop();
}

function el(tag: string, cls: string, html?: string): HTMLElement {
  const n = document.createElement(tag);
  n.className = cls;
  if (html !== undefined) n.innerHTML = html;
  return n;
}

function buildDom(): void {
  root.innerHTML = '';
  const scr = el('div', 'combat');

  const arena = el('div', 'arena');
  canvas = document.createElement('canvas');
  canvas.className = 'fx-canvas';
  arena.append(canvas);

  const foeSil = el('div', 'sil sil-enemy', '🦇');
  const heroSil = el('div', 'sil sil-hero', '🜁');
  arena.append(heroSil, foeSil);
  scr.append(arena);

  scr.append(el('div', 'bars', ''));
  scr.append(el('div', 'combat-log', ''));
  scr.append(el('div', 'actions', ''));

  root.append(scr);
  sizeCanvas();
  window.addEventListener('resize', sizeCanvas);
  refresh();
}

function sizeCanvas(): void {
  if (!canvas) return;
  const rect = canvas.parentElement!.getBoundingClientRect();
  canvas.width = Math.max(300, rect.width);
  canvas.height = Math.max(180, rect.height);
  ctx = canvas.getContext('2d')!;
}

function bar(label: string, cur: number, max: number, cls: string, extra = ''): string {
  const pct = Math.max(0, Math.min(100, (cur / max) * 100));
  return (
    `<div class="stat-line"><span class="bl">${label}</span>` +
    `<span class="bv">${Math.round(cur)}<span class="dim">/${max}</span>${extra}</span></div>` +
    `<div class="track ${cls}"><div class="fill" style="width:${pct}%"></div></div>`
  );
}

function refresh(): void {
  const p = state.player;
  const e = state.enemy;

  const bars = root.querySelector('.bars') as HTMLElement;
  const over = p.overflow > 0 ? ` <span class="overflow">+${Math.round(p.overflow)} ⚡</span>` : '';
  bars.innerHTML =
    `<div class="side hero">` +
    `<div class="cname">${p.name} <span class="lvl">ур. ${p.level}</span></div>` +
    bar('HP', p.hp, p.hpMax, 'hp') +
    bar('Сила', p.power, p.powerMax, 'pw', over) +
    (p.casting ? `<div class="casting">плетёт ${p.casting.spell.name} (${p.casting.ticksLeft} т.)</div>` : '') +
    `</div>` +
    `<div class="side foe">` +
    `<div class="cname">${e.name} <span class="lvl">вне кат.? ур. ${e.level}</span></div>` +
    bar('HP', e.hp, e.hpMax, 'hp') +
    bar('Сила', e.power, e.powerMax, 'pw') +
    (e.casting ? `<div class="casting foe">плетёт ${e.casting.spell.name} (${e.casting.ticksLeft} т.)</div>` : (e.asleep > 0 ? `<div class="casting foe">спит (${e.asleep})</div>` : '')) +
    `</div>`;

  renderLog();
  renderActions();
}

function renderLog(): void {
  const box = root.querySelector('.combat-log') as HTMLElement;
  box.innerHTML = '';
  for (const line of state.log.slice(-6)) {
    box.append(el('div', `log-line lk-${line.kind}`, line.text));
  }
  box.scrollTop = box.scrollHeight;
}

function renderActions(): void {
  const box = root.querySelector('.actions') as HTMLElement;
  box.innerHTML = '';
  const p = state.player;

  if (state.over) {
    const res = el(
      'div',
      `result ${state.outcome === 'win' ? 'win' : 'lose'}`,
      state.outcome === 'win' ? 'ПОБЕДА' : 'ПОРАЖЕНИЕ',
    );
    const back = el('button', 'btn primary', 'Выйти');
    back.addEventListener('click', () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', sizeCanvas);
      onExit(state.outcome === 'win' ? 'win' : 'lose');
    });
    box.append(res, back);
    return;
  }

  // Амулет — овердрайв
  if (state.amuletCharge > 0) {
    const amu = el(
      'button',
      'btn overdrive-btn',
      `⚡ Впитать амулет (+${state.amuletCharge} Силы, тает)`,
    );
    amu.addEventListener('click', () => {
      absorbAmulet(state);
      punch(0.4, '#c8a44a');
      refresh();
    });
    box.append(amu);
  }

  // Рефлексы (мгновенные)
  if (p.reflexes.length > 0) {
    const row = el('div', 'reflex-row', '<span class="rlabel">Рефлекс:</span>');
    for (const id of p.reflexes) {
      const sp = SPELLS[id];
      const b = el('button', 'chip', `${sp.name}`);
      b.addEventListener('click', () => {
        act({ kind: 'reflex', spellId: id });
      });
      row.append(b);
    }
    box.append(row);
  }

  // Выбор заклинания — по школам, с гейтингом по уровню Иного
  const bySchool = new Map<string, string[]>();
  for (const id of p.spellbook) {
    const sp = SPELLS[id];
    if (!bySchool.has(sp.school)) bySchool.set(sp.school, []);
    bySchool.get(sp.school)!.push(id);
  }
  const rank = (lvl: number) => (lvl === 0 ? -1 : lvl); // ВК — после 1-го
  for (const [school, list] of bySchool) {
    list.sort((a, b) => rank(SPELLS[b].level) - rank(SPELLS[a].level));
    const sec = el('div', 'spell-school', `<div class="school-name">${school}</div>`);
    const grid = el('div', 'spell-grid', '');
    for (const id of list) {
      const sp = SPELLS[id];
      const locked = !isUnlocked(sp, p.level);
      const lvl = sp.level === 0 ? 'ВК' : sp.level;
      const b = el(
        'button',
        `spell-cell ${selectedSpell === id ? 'sel' : ''} ${locked ? 'locked' : ''}`,
        `${sp.name}<span class="sc">ур.${lvl} · ${sp.baseCost}⋅${sp.castTicks}т${locked ? ' 🔒' : ''}</span>`,
      );
      b.style.setProperty('--tc', TYPE_COLORS[sp.type]);
      if (locked || sp.baseCost > available(p)) b.classList.add('disabled');
      if (!locked) {
        b.addEventListener('click', () => {
          selectedSpell = id;
          invest = Math.min(available(p), Math.max(sp.baseCost, invest || sp.baseCost));
          renderActions();
        });
      } else {
        b.title = `Нужен ${lvl}-й уровень Иного`;
      }
      grid.append(b);
    }
    sec.append(grid);
    box.append(sec);
  }

  // Панель вложения Силы (овердрайв)
  if (selectedSpell) {
    const sp = SPELLS[selectedSpell];
    const max = Math.floor(available(p));
    invest = Math.max(sp.baseCost, Math.min(invest, max));
    const proj = projectDamage(selectedSpell, invest);
    const panel = el('div', 'invest');
    panel.innerHTML =
      `<div class="invest-head">${sp.name}: вложить <b>${invest}</b> Силы` +
      `<span class="proj">≈ ${proj.lo}–${proj.hi}${proj.crit ? ' ⚡' : ''} урона</span></div>`;
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = String(sp.baseCost);
    slider.max = String(max);
    slider.value = String(invest);
    slider.className = 'invest-slider';
    slider.addEventListener('input', () => {
      invest = Number(slider.value);
      renderActions();
    });
    panel.append(slider);
    const quick = el('div', 'quick-row', '');
    for (const label of ['база', '×10', '½', 'ВСЁ']) {
      const q = el('button', 'chip small', label);
      q.addEventListener('click', () => {
        if (label === 'база') invest = sp.baseCost;
        else if (label === '×10') invest = Math.min(max, sp.baseCost * 10);
        else if (label === '½') invest = Math.max(sp.baseCost, Math.round(max / 2));
        else invest = max;
        renderActions();
      });
      quick.append(q);
    }
    panel.append(quick);
    const cast = el('button', 'btn primary cast-btn', `Плести (${invest} Силы)`);
    cast.addEventListener('click', () => {
      act({ kind: 'cast', spellId: selectedSpell!, invested: invest });
      selectedSpell = null;
    });
    panel.append(cast);
    box.append(panel);
  }

  const chan = el('button', 'btn ghost', 'Черпать Силу (+резерв, уязвимо)');
  chan.addEventListener('click', () => act({ kind: 'channel' }));
  box.append(chan);
}

function projectDamage(id: string, invested: number): { lo: number; hi: number; crit: boolean } {
  const sp = SPELLS[id];
  const scale = invested / sp.baseCost;
  const base = sp.baseDamage * scale;
  return { lo: Math.round(base * 0.8), hi: Math.round(base * 1.2), crit: scale >= 20 };
}

function act(action: Parameters<typeof playerAct>[1]): void {
  const beforeFx = state.pendingFx.length;
  playerAct(state, action, rng);
  drainFx(beforeFx);
  refresh();
}

// превращаем pendingFx в частицы/цифры
function drainFx(from: number): void {
  const events = state.pendingFx.slice(from);
  state.pendingFx.length = 0;
  for (const fx of events) spawnFx(fx);
}

function spawnFx(fx: FxEvent): void {
  if (!canvas) return;
  const w = canvas.width;
  const h = canvas.height;
  const originX = fx.fromSide === 'light' ? w * 0.2 : w * 0.8;
  const targetX = fx.fromSide === 'light' ? w * 0.8 : w * 0.2;
  const y = h * 0.5;
  const color = TYPE_COLORS[fx.type];
  const count = Math.min(400, 20 + Math.round(fx.magnitude * 6));

  for (let i = 0; i < count; i++) {
    const t = Math.random();
    const px = originX + (targetX - originX) * (0.3 + t * 0.7);
    const spread = fx.crit ? 90 : 40;
    particles.push({
      x: px,
      y: y + (Math.random() - 0.5) * spread,
      vx: (targetX - originX > 0 ? 1 : -1) * (2 + Math.random() * 6),
      vy: (Math.random() - 0.5) * 6,
      life: 1,
      maxLife: 0.5 + Math.random() * 0.6,
      color,
      size: fx.crit ? 2 + Math.random() * 4 : 1 + Math.random() * 2.5,
    });
  }
  if (fx.crit) {
    punch(0.9, color);
  } else if (fx.magnitude > 3) {
    punch(0.35, color);
  }
}

function punch(intensity: number, color: string): void {
  shake = Math.max(shake, intensity * 14);
  flash = { color, a: intensity * 0.5 };
}

// летящие цифры урона — читаем из последней записи лога
let lastLogLen = 0;
function harvestNumbers(): void {
  if (!canvas) return;
  for (let i = lastLogLen; i < state.log.length; i++) {
    const line = state.log[i];
    const m = line.text.match(/(\d+)\s+урона/);
    if (m) {
      const n = Number(m[1]);
      const fromLight = /Оперативник|^Вы|ОВЕРДРАЙВ/.test(line.text) || line.kind === 'overdrive';
      floats.push({
        x: fromLight ? canvas.width * 0.8 : canvas.width * 0.2,
        y: canvas.height * 0.4,
        vy: -0.6,
        life: 1,
        text: String(n),
        color: line.kind === 'overdrive' ? '#ffd36a' : '#ffffff',
        big: line.kind === 'overdrive' || n >= 200,
      });
    }
  }
  lastLogLen = state.log.length;
}

function loop(): void {
  rafId = requestAnimationFrame(loop);
  if (!ctx) return;
  harvestNumbers();

  const sx = (Math.random() - 0.5) * shake;
  const sy = (Math.random() - 0.5) * shake;
  shake *= 0.85;
  if (shake < 0.3) shake = 0;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(1, 0, 0, 1, sx, sy);

  // частицы
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.12;
    p.life -= 0.016 / p.maxLife;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // цифры
  for (let i = floats.length - 1; i >= 0; i--) {
    const f = floats[i];
    f.y += f.vy;
    f.vy -= 0.004;
    f.life -= 0.012;
    if (f.life <= 0) {
      floats.splice(i, 1);
      continue;
    }
    ctx.globalAlpha = Math.max(0, f.life);
    ctx.fillStyle = f.color;
    ctx.font = `bold ${f.big ? 42 : 20}px Georgia, serif`;
    ctx.textAlign = 'center';
    if (f.big) {
      ctx.shadowColor = f.color;
      ctx.shadowBlur = 18;
    }
    ctx.fillText(f.text, f.x, f.y);
    ctx.shadowBlur = 0;
  }
  ctx.globalAlpha = 1;

  if (flash) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = flash.color;
    ctx.globalAlpha = flash.a;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    flash.a *= 0.82;
    if (flash.a < 0.02) flash = null;
  }
}

// экспорт для проверок
export { computeDamage };
