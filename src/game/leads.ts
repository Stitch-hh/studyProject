// «Разбор заявок» — планёрка в начале смены. Смена 12 часов, вызовов больше,
// чем часов аналитика: часть заявок — реальные угрозы, часть — жёлтая пресса
// (утки). Разметишь утку — потратишь час впустую, а реальная угроза, оставшаяся
// «холодной», к утру вырастет. Баланс времени и внимания (см. GD, «Доска зацепок»).

import { DISTRICTS } from './data';
import { INCIDENTS_POOL } from './incidents_pool';
import { Rng } from './rng';
import type { IncidentInstance, IncidentTemplate, NightState } from './types';
import { SHIFT_MINUTES, START_MONEY, START_POWER, WITNESS_CHANCE } from './engine';

export type LeadKind = 'real' | 'duck';

export interface Lead {
  id: string;
  title: string;
  /** Как заявка выглядит в сводке. */
  blurb: string;
  /** Нечёткий сигнал достоверности — то, по чему игрок и решает. */
  signal: string;
  kind: LeadKind;
  /** Для реальной заявки — инцидент, который случится ночью. */
  tpl?: IncidentTemplate;
}

export interface Briefing {
  seed: number;
  leads: Lead[];
  /** Часов аналитика на разметку (сколько заявок можно взять в приоритет). */
  points: number;
}

export const REAL_LEADS = 5;
export const DUCK_LEADS = 3;
export const ANALYST_HOURS = 3;

/** Утки: звучат как дела Иных, но за ними ничего нет. Нарочно соблазнительны. */
const DUCK_POOL: Omit<Lead, 'id' | 'kind'>[] = [
  {
    title: 'Бес в подъезде',
    blurb: 'Жилец с пятого этажа: по ночам в подъезде кто-то хохочет и гасит лампы.',
    signal: 'Третий звонок за месяц. Свидетелей нет, мха нет, фон чистый.',
  },
  {
    title: 'Круги во дворе',
    blurb: 'На районном форуме фото: ровные круги на снегу у детской площадки.',
    signal: 'Геометрия ровная — но и следы от санок ровные. Похоже на вброс.',
  },
  {
    title: 'Салон «потомственной ведуньи»',
    blurb: '«Ведунья» просит Стражу официально заверить, что её салон чист.',
    signal: 'Саморегистрации нет, но и нарушений нет: обычная гадалка-человек.',
  },
  {
    title: 'Призрак в маршрутке',
    blurb: 'Водитель 34-го боится ночную смену: «на заднем сиденье кто-то дышит».',
    signal: 'Скорее переутомление. Фон в салоне — как у любого куска железа.',
  },
  {
    title: 'Вой у гаражей',
    blurb: 'Собачники слышат вой на пустыре — «точно оборотень вышел».',
    signal: 'Вой есть. Но оборотни к луне не привязаны, а фон — собачий. Псы и есть.',
  },
  {
    title: 'Порча по переписке',
    blurb: 'Женщина уверена: бывшая мужа навела порчу через голосовые сообщения.',
    signal: 'Эмоций море, Силы — ноль. Ведьмовством тут и не пахло.',
  },
];

/** Сигналы для реальных заявок — в основном внятные, но одна «тихая» (ловушка). */
const REAL_SIGNALS = [
  'Вера разметила: паттерн повторяется третью смену — достоверно.',
  'Сводка Дневного дозора подтверждает: фон растёт по адресу.',
  'Аналитики: три сигнала за ночь, все сходятся в одну точку.',
  'Мох кольцом на месте — питается, значит, Сила и эмоции реальные.',
];
const QUIET_REAL_SIGNAL = 'След слабый, почти на фоне. Легко принять за пустышку.';

function firstSentence(text: string): string {
  const m = text.match(/^[^.!?]*[.!?]/);
  return (m ? m[0] : text).trim();
}

export function createBriefing(seed: number): { briefing: Briefing; rng: Rng } {
  const rng = new Rng(seed);

  const realTpls = rng.shuffle(INCIDENTS_POOL).slice(0, REAL_LEADS);
  const reals: Lead[] = realTpls.map((tpl, i) => ({
    id: `r${i}`,
    kind: 'real',
    tpl,
    title: tpl.title,
    blurb: firstSentence(tpl.text),
    signal: rng.pick(REAL_SIGNALS),
  }));
  // одна реальная угроза маскируется под пустышку — цена невнимательности
  const quiet = rng.int(reals.length);
  reals[quiet].signal = QUIET_REAL_SIGNAL;

  const ducks: Lead[] = rng.shuffle(DUCK_POOL).slice(0, DUCK_LEADS).map((d, i) => ({
    id: `d${i}`,
    kind: 'duck',
    ...d,
  }));

  const leads = rng.shuffle([...reals, ...ducks]);
  return { briefing: { seed, leads, points: ANALYST_HOURS }, rng };
}

/** Собрать смену из разметки. Реальные заявки — события ночи; размеченные идут
 *  «подготовленными» (риск ниже), одна неразмеченная угроза эскалирует. */
export function buildNight(
  briefing: Briefing,
  rng: Rng,
  selected: Set<string>,
): NightState {
  const realLeads = briefing.leads.filter((l) => l.kind === 'real');
  const incidents: IncidentInstance[] = realLeads.map((l) => {
    const prepped = selected.has(l.id);
    return {
      tpl: l.tpl!,
      district: rng.pick(DISTRICTS),
      witness: Boolean(l.tpl!.canWitness) && rng.chance(WITNESS_CHANCE),
      prepped,
      escalated: false,
      riskMod: prepped ? 0.5 : 1,
    };
  });

  // эскалация: первая «холодная» (неразмеченная) угроза вырастает к утру
  const cold = incidents.filter((i) => !i.prepped);
  if (cold.length > 0) {
    const esc = cold[0];
    esc.escalated = true;
    esc.riskMod = 1.4;
    if (esc.tpl.canWitness) esc.witness = true;
  }

  const wastedHours = briefing.leads.filter((l) => l.kind === 'duck' && selected.has(l.id)).length;
  const preppedCount = incidents.filter((i) => i.prepped).length;

  const log: string[] = [];
  const note =
    `Разбор заявок: размечено дел — ${preppedCount}` +
    (wastedHours > 0 ? `, часов на пустышки — ${wastedHours}` : '') +
    (cold.length > 0 ? `. Осталось холодных угроз — ${cold.length}.` : '.');
  log.push(note);

  return {
    seed: briefing.seed,
    timeLeft: SHIFT_MINUTES,
    power: START_POWER,
    balance: 0,
    licenses: [],
    saved: 0,
    victims: 0,
    exposure: 0,
    rewards: [],
    money: START_MONEY,
    reputation: 0,
    incidents,
    idx: 0,
    log,
  };
}
