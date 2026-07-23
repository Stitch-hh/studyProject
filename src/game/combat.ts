import { Rng } from './rng';
import { SPELLS, type Spell } from './spells';

// Пошаговый бой на «таймлайне» (ATB): у каждого бойца копится шкала действия;
// заполнилась — его ход. Ядро player-fantasy — овердрайв: урон масштабируется
// от вложенной Силы, а вложить можно из переизбытка сверх резерва (см. GD).

export interface Combatant {
  id: string;
  name: string;
  side: 'light' | 'dark';
  level: number; // канон: 7 слабый … 1 сильный
  hp: number;
  hpMax: number;
  /** Личный резерв Силы. */
  power: number;
  powerMax: number;
  /** Переизбыток сверх резерва (овердрайв). Тает каждый тик. */
  overflow: number;
  /** Скорость набора шкалы действия. */
  speed: number;
  gauge: number;
  shield: number;
  /** Тиков сна осталось (0 — бодр). */
  asleep: number;
  /** Незавершённый каст: копит тики. */
  casting: { spell: Spell; invested: number; ticksLeft: number } | null;
  /** Заготовки на рефлекс (мгновенные, одноразовые). */
  reflexes: string[];
  /** Нежить (вампир/оборотень) — уязвима к Серому молебну. */
  undead: boolean;
  spellbook: string[];
}

export interface CombatLogEntry {
  text: string;
  kind: 'info' | 'hit' | 'crit' | 'heal' | 'effect' | 'overdrive';
}

export interface FxEvent {
  type: Spell['type'];
  fromSide: 'light' | 'dark';
  magnitude: number; // для масштаба вспышки
  crit: boolean;
}

export interface CombatState {
  player: Combatant;
  enemy: Combatant;
  tick: number;
  over: boolean;
  outcome: 'win' | 'lose' | null;
  log: CombatLogEntry[];
  /** Разовый овердрайв-источник (амулет), который можно впитать. */
  amuletCharge: number;
  pendingFx: FxEvent[];
}

export const OVERFLOW_DECAY = 12; // сколько переизбытка тает за тик

export function makeMage(): Combatant {
  return {
    id: 'player',
    name: 'Оперативник',
    side: 'light',
    level: 5,
    hp: 120,
    hpMax: 120,
    // Маги держат большой резерв Силы (см. LORE): оверчардж работает и со
    // своего пула, а амулет — уже сверх-усиление, а не единственный путь.
    power: 200,
    powerMax: 200,
    overflow: 0,
    speed: 7,
    gauge: 0,
    shield: 0,
    asleep: 0,
    casting: null,
    reflexes: ['freeze', 'shield'],
    undead: false,
    spellbook: [
      'fireball', 'triple', 'press', 'iceblade', 'firerain', 'gremlin',
      'freeze', 'morpheus', 'opium', 'morok', 'dominant', 'remoral',
      'shield', 'sphere', 'negation', 'dispel', 'heal', 'greyprayer',
    ],
  };
}

export function makeVampire(): Combatant {
  return {
    id: 'enemy',
    name: 'Высший вампир',
    side: 'dark',
    level: 3,
    hp: 900,
    hpMax: 900,
    power: 120,
    powerMax: 120,
    overflow: 0,
    speed: 11, // вампиры быстры
    gauge: 0,
    shield: 0,
    asleep: 0,
    casting: null,
    reflexes: [],
    undead: true,
    spellbook: ['triple', 'press', 'fireball', 'morok', 'dominant', 'lifedrain'],
  };
}

export function makeWitch(): Combatant {
  return {
    id: 'enemy',
    name: 'Ведьма-браконьерша',
    side: 'dark',
    level: 4,
    hp: 260,
    hpMax: 260,
    power: 90,
    powerMax: 90,
    overflow: 0,
    speed: 6, // сила в закладках, а не в скорости
    gauge: 0,
    shield: 40, // соляной круг держит
    asleep: 0,
    casting: null,
    reflexes: [],
    undead: false,
    spellbook: ['morpheus', 'press', 'triple', 'opium', 'lifedrain', 'negation'],
  };
}

export interface CombatOpts {
  enemy?: 'vampire' | 'witch';
  amuletCharge?: number;
}

const ENEMY_TAUNT: Record<'vampire' | 'witch', string> = {
  vampire: 'Высший вампир скалится: «Мальчик, ты не в той весовой».',
  witch: 'Ведьма улыбается из центра соляного круга: «Ты зашёл на моё поле».',
};

export function createCombat(opts: CombatOpts = {}): CombatState {
  const kind = opts.enemy ?? 'vampire';
  const enemy = kind === 'witch' ? makeWitch() : makeVampire();
  const amuletCharge = opts.amuletCharge ?? (kind === 'vampire' ? 1000 : 0);
  return {
    player: makeMage(),
    enemy,
    tick: 0,
    over: false,
    outcome: null,
    log: [{ text: ENEMY_TAUNT[kind], kind: 'info' }],
    amuletCharge,
    pendingFx: [],
  };
}

function log(s: CombatState, text: string, kind: CombatLogEntry['kind'] = 'info'): void {
  s.log.push({ text, kind });
}

/** Урон масштабируется от вложенной Силы относительно базовой цены. */
export function computeDamage(spell: Spell, invested: number, rng: Rng): { dmg: number; crit: boolean } {
  const scale = invested / spell.baseCost;
  const base = spell.baseDamage * scale;
  const variance = 0.8 + rng.next() * 0.4; // ±20%
  const dmg = Math.round(base * variance);
  const crit = scale >= 20; // овердрайв-удар
  return { dmg, crit };
}

export function available(c: Combatant): number {
  return c.power + c.overflow;
}

/** Игрок впитывает заряд амулета — переизбыток сверх резерва. */
export function absorbAmulet(s: CombatState): void {
  if (s.amuletCharge <= 0) return;
  s.player.overflow += s.amuletCharge;
  log(s, `Вы впитываете амулет: +${s.amuletCharge} Силы сверх резерва. Она тает — тратьте с толком.`, 'overdrive');
  s.amuletCharge = 0;
}

function spendPower(c: Combatant, amount: number): void {
  const fromOverflow = Math.min(c.overflow, amount);
  c.overflow -= fromOverflow;
  c.power = Math.max(0, c.power - (amount - fromOverflow));
}

function applyDamage(target: Combatant, dmg: number): number {
  const absorbed = Math.min(target.shield, dmg);
  target.shield -= absorbed;
  const real = dmg - absorbed;
  target.hp = Math.max(0, target.hp - real);
  return real;
}

/** Затухающий оверчардж для длительности контроля: влить больше — держать
 *  дольше, но с убывающей отдачей (log2) и жёстким потолком. Не превращается
 *  в вечный лок даже при огромном вложении. */
function controlFactor(scale: number): number {
  return 1 + Math.log2(Math.max(1, Math.min(scale, 64)));
}

function resolveSpell(s: CombatState, caster: Combatant, target: Combatant, spell: Spell, invested: number, rng: Rng): void {
  const scale = invested / spell.baseCost;
  s.pendingFx.push({ type: spell.type, fromSide: caster.side, magnitude: scale, crit: scale >= 20 });

  if (spell.effect === 'shield') {
    const amt = Math.round((spell.effectPower ?? 0) * scale);
    caster.shield += amt;
    log(s, `${caster.name}: ${spell.name} — барьер +${amt}.`, 'effect');
    return;
  }
  if (spell.effect === 'interrupt') {
    if (target.casting) {
      log(s, `${caster.name}: ${spell.name} срывает каст ${target.name}! Вложенная Сила потеряна.`, 'effect');
      target.casting = null;
    } else {
      log(s, `${caster.name}: ${spell.name} — но прерывать нечего.`, 'effect');
    }
  }
  if (spell.effect === 'sleep') {
    if (spell.livingOnly && target.undead) {
      log(s, `${caster.name}: ${spell.name} — на нежить не действует.`, 'effect');
    } else {
      const ticks = Math.round((spell.effectPower ?? 0) * controlFactor(scale));
      target.asleep = Math.max(target.asleep, ticks);
      log(s, `${caster.name}: ${spell.name} — ${target.name} засыпает на ${ticks} т.`, 'effect');
    }
  }
  if (spell.effect === 'dominate') {
    if (target.casting) {
      log(s, `${caster.name}: ${spell.name} ломает волю ${target.name} — каст сорван.`, 'effect');
      target.casting = null;
    }
    const ticks = Math.round((spell.effectPower ?? 0) * controlFactor(scale));
    target.asleep = Math.max(target.asleep, ticks);
    log(s, `${caster.name}: ${spell.name} — ${target.name} застывает на ${ticks} т., подчиняясь приказу.`, 'effect');
  }
  if (spell.effect === 'heal') {
    // лечение оверчарджится наравне с уроном: влил больше Силы — восстановил больше
    const amt = Math.round((spell.effectPower ?? 0) * scale);
    caster.hp = Math.min(caster.hpMax, caster.hp + amt);
    log(s, `${caster.name}: ${spell.name} — восстановлено ${amt} HP.`, 'heal');
  }
  if (spell.effect === 'dispel') {
    const had = target.shield > 0 || Boolean(target.casting);
    target.shield = 0;
    if (target.casting) target.casting = null;
    log(
      s,
      had
        ? `${caster.name}: ${spell.name} — с ${target.name} сорваны щиты и плетения.`
        : `${caster.name}: ${spell.name} — снимать нечего.`,
      'effect',
    );
  }
  if (spell.effect === 'drain') {
    if (target.undead) {
      const drained = Math.round((spell.effectPower ?? 0) * scale);
      target.power = Math.max(0, target.power - drained);
      log(s, `${caster.name}: ${spell.name} высасывает из нежити ${drained} Силы.`, 'effect');
    }
  }

  if (spell.baseDamage > 0) {
    let { dmg, crit } = computeDamage(spell, invested, rng);
    if (spell.effect === 'drain' && target.undead) dmg = Math.round(dmg * 1.5); // молебен по нежити
    const real = applyDamage(target, dmg);
    if (spell.effect === 'lifedrain') {
      const healed = Math.round((real * (spell.effectPower ?? 0)) / 100);
      caster.hp = Math.min(caster.hpMax, caster.hp + healed);
      if (healed > 0) log(s, `${caster.name}: ${spell.name} возвращает ${healed} жизни.`, 'heal');
    }
    // оверчардж виден на всём диапазоне, а не только на ×20-крите
    const mult = scale >= 1.5 ? ` ×${scale >= 10 ? Math.round(scale) : scale.toFixed(1)}` : '';
    if (crit) {
      log(s, `⚡ ОВЕРДРАЙВ${mult}! ${caster.name}: ${spell.name} — ${real} урона!`, 'overdrive');
    } else {
      log(s, `${caster.name}: ${spell.name}${mult} — ${real} урона.`, 'hit');
    }
  }
}

export type PlayerAction =
  | { kind: 'cast'; spellId: string; invested: number }
  | { kind: 'reflex'; spellId: string }
  | { kind: 'channel' } // откачка: восстановить резерв, стоя (уязвимо)
  | { kind: 'wait' };

/** Ход игрока. Возвращает потраченные Силой/эффект; затем крутим тики до след. хода. */
export function playerAct(s: CombatState, action: PlayerAction, rng: Rng): void {
  const p = s.player;
  if (s.over) return;

  if (action.kind === 'reflex') {
    const idx = p.reflexes.indexOf(action.spellId);
    if (idx === -1) return;
    p.reflexes.splice(idx, 1);
    const spell = SPELLS[action.spellId];
    // Рефлекс мгновенен и почти бесплатен (заготовлен заранее).
    resolveSpell(s, p, s.enemy, spell, spell.baseCost, rng);
    p.gauge = 0; // рефлекс вне очереди — но сбрасывает шкалу
  } else if (action.kind === 'cast') {
    const spell = SPELLS[action.spellId];
    const invested = Math.min(action.invested, available(p));
    if (invested < spell.baseCost) {
      log(s, 'Слишком мало Силы для этого заклинания.', 'info');
      return;
    }
    spendPower(p, invested);
    if (spell.castTicks <= 0) {
      resolveSpell(s, p, s.enemy, spell, invested, rng);
    } else {
      p.casting = { spell, invested, ticksLeft: spell.castTicks };
      log(s, `Вы плетёте ${spell.name} (${invested} Силы, ${spell.castTicks} т.)…`, 'info');
    }
    p.gauge = 0;
  } else if (action.kind === 'channel') {
    const gain = Math.round(p.powerMax * 0.2);
    p.power = Math.min(p.powerMax, p.power + gain);
    log(s, `Вы черпаете Силу из окружения (+${gain} резерва).`, 'heal');
    p.gauge = 0;
  } else {
    p.gauge = 0;
  }

  advanceUntilPlayer(s, rng);
  checkEnd(s);
}

function tickCombatant(s: CombatState, c: Combatant, rng: Rng): void {
  // тает овердрайв
  if (c.overflow > 0) c.overflow = Math.max(0, c.overflow - OVERFLOW_DECAY);
  if (c.asleep > 0) {
    c.asleep -= 1;
    return;
  }
  // завершение каста
  if (c.casting) {
    c.casting.ticksLeft -= 1;
    if (c.casting.ticksLeft <= 0) {
      const { spell, invested } = c.casting;
      c.casting = null;
      const target = c.id === 'player' ? s.enemy : s.player;
      resolveSpell(s, c, target, spell, invested, rng);
    }
    return;
  }
}

function enemyTurn(s: CombatState, rng: Rng): void {
  const e = s.enemy;
  if (e.asleep > 0 || e.casting) return;
  // простой ИИ: если игрок плетёт мощное — попробовать ударить быстрым; иначе бить сильным
  const affordable = e.spellbook.map((id) => SPELLS[id]).filter((sp) => sp.baseCost <= available(e));
  if (affordable.length === 0) {
    e.power = Math.min(e.powerMax, e.power + 20);
    log(s, `${e.name} копит Силу.`, 'info');
    e.gauge = 0;
    return;
  }
  const spell = rng.pick(affordable);
  // враг тоже может вкладывать больше базы (до трети резерва)
  const invested = Math.min(Math.max(spell.baseCost, Math.round(available(e) * 0.3)), available(e));
  spendPower(e, invested);
  if (spell.castTicks <= 0) {
    resolveSpell(s, e, s.player, spell, invested, rng);
  } else {
    e.casting = { spell, invested, ticksLeft: spell.castTicks };
    log(s, `${e.name} плетёт ${spell.name}…`, 'info');
  }
  e.gauge = 0;
}

/** Крутим тики, пока не заполнится шкала игрока (и он не спит/не кастует). */
function advanceUntilPlayer(s: CombatState, rng: Rng): void {
  let guard = 0;
  while (!s.over && guard < 500) {
    guard += 1;
    s.tick += 1;
    s.player.gauge += s.player.speed;
    s.enemy.gauge += s.enemy.speed;

    tickCombatant(s, s.player, rng);
    tickCombatant(s, s.enemy, rng);
    if (checkEnd(s)) return;

    // враг ходит первым, если готов
    if (s.enemy.gauge >= 100 && s.enemy.asleep <= 0 && !s.enemy.casting) {
      enemyTurn(s, rng);
      if (checkEnd(s)) return;
    }
    // ход игрока?
    if (s.player.gauge >= 100 && s.player.asleep <= 0 && !s.player.casting) {
      return; // ждём ввода
    }
  }
}

function checkEnd(s: CombatState): boolean {
  if (s.over) return true;
  if (s.enemy.hp <= 0) {
    s.over = true;
    s.outcome = 'win';
    log(s, `${s.enemy.name} повержен. Такое будут рассказывать стажёрам.`, 'crit');
    return true;
  }
  if (s.player.hp <= 0) {
    s.over = true;
    s.outcome = 'lose';
    log(s, 'Темнеет в глазах. Вас вытащат — если успеют.', 'info');
    return true;
  }
  return false;
}

/** Готова ли к первому ходу игрока сцена (крутит начальные тики). */
export function startCombat(s: CombatState, rng: Rng): void {
  advanceUntilPlayer(s, rng);
}
