import { DISTRICTS, ENEMY_RESPONSES, INCIDENTS } from './data';
import { Rng } from './rng';
import type {
  DecisionOption,
  Effects,
  IncidentInstance,
  NightReport,
  NightState,
} from './types';

/**
 * Уровни канонические: 7-й — слабейший, 1-й — сильнейший (дальше вне категорий).
 * Для арифметики (баланс, счёт) используется весомость = 8 − уровень.
 */
export function licenseWeight(level: number): number {
  return Math.max(1, Math.round((8 - level) / 2));
}

export const SHIFT_MINUTES = 720; // канон: смена 12 часов (20:00 → 08:00)
export const START_POWER = 100;
export const START_MONEY = 200;
export const TRAVEL_MINUTES = 20;
export const INCIDENTS_PER_NIGHT = 6;
export const WITNESS_CHANCE = 0.35;

export interface DecisionOutcome {
  effects: Effects;
  failed: boolean;
  /** Требуется дорешение «свидетель» (силовое решение при свидетеле). */
  witnessPrompt: boolean;
}

export function createNight(seed: number): { state: NightState; rng: Rng } {
  const rng = new Rng(seed);
  const picked = rng.shuffle(INCIDENTS).slice(0, INCIDENTS_PER_NIGHT);
  const incidents: IncidentInstance[] = picked.map((tpl) => ({
    tpl,
    district: rng.pick(DISTRICTS),
    witness: Boolean(tpl.canWitness) && rng.chance(WITNESS_CHANCE),
  }));
  const state: NightState = {
    seed,
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
    log: [],
  };
  return { state, rng };
}

export function currentIncident(state: NightState): IncidentInstance | null {
  return state.idx < state.incidents.length ? state.incidents[state.idx] : null;
}

export function canAfford(state: NightState, opt: DecisionOption): boolean {
  return state.power >= opt.power;
}

function applyEffects(state: NightState, fx: Effects): void {
  state.saved += fx.saved ?? 0;
  state.victims += fx.victims ?? 0;
  state.balance += fx.balance ?? 0;
  state.exposure += fx.exposure ?? 0;
  state.money += fx.money ?? 0;
  state.reputation += fx.reputation ?? 0;
  if (fx.license && fx.license > 0) state.licenses.push(fx.license);
  if (fx.reward && fx.reward > 0) state.rewards.push(fx.reward);
}

export function applyDecision(
  state: NightState,
  rng: Rng,
  opt: DecisionOption,
): DecisionOutcome {
  const inc = currentIncident(state);
  state.timeLeft = Math.max(0, state.timeLeft - opt.time);
  state.power = Math.max(0, state.power - opt.power);

  const failed = opt.risk !== undefined && opt.fail !== undefined && rng.chance(opt.risk);
  const fx = failed && opt.fail ? opt.fail : opt.success;
  applyEffects(state, fx);
  state.log.push(fx.text);

  const witnessPrompt =
    Boolean(inc?.witness) && opt.kind === 'force' && !failed;
  return { effects: fx, failed, witnessPrompt };
}

export type WitnessChoice = 'erase' | 'leave';

export function resolveWitness(state: NightState, choice: WitnessChoice): Effects {
  const fx: Effects =
    choice === 'erase'
      ? {
          text: 'Свидетелю мягко стёрта память о последнем часе. Минимальное вмешательство — но запись в Реестре появилась.',
          license: 6,
          balance: 0,
        }
      : {
          text: 'Свидетеля отпустили как есть. Его рассказ разойдётся по району — Стража промолчит, но осадок останется.',
          exposure: 1,
        };
  if (choice === 'erase') state.timeLeft = Math.max(0, state.timeLeft - 15);
  applyEffects(state, fx);
  state.log.push(fx.text);
  return fx;
}

export function advance(state: NightState): void {
  state.idx += 1;
  if (state.idx < state.incidents.length) {
    state.timeLeft = Math.max(0, state.timeLeft - TRAVEL_MINUTES);
  }
}

export function outOfTime(state: NightState): boolean {
  return state.timeLeft <= 0 && state.idx < state.incidents.length;
}

/** Нехватка времени: все оставшиеся инциденты закрываются последствиями игнора. */
export function autoResolveRest(state: NightState): string[] {
  const lines: string[] = [];
  while (state.idx < state.incidents.length) {
    const inc = state.incidents[state.idx];
    const ignore = inc.tpl.options.find((o) => o.kind === 'ignore');
    if (ignore) {
      applyEffects(state, ignore.success);
      lines.push(`${inc.tpl.title}: смена кончилась раньше. ${ignore.success.text}`);
    } else {
      lines.push(`${inc.tpl.title}: до вызова так и не доехали.`);
    }
    state.idx += 1;
  }
  return lines;
}

/** Конец ночи: Тьма тратит накопленные лицензии. */
export function enemyTurn(state: NightState, rng: Rng): NightReport {
  const responses: NightReport['responses'] = [];
  for (const level of state.licenses) {
    const tier = level >= 5 ? 6 : level >= 3 ? 4 : 2;
    const pool = ENEMY_RESPONSES.filter((r) => r.level === tier);
    const resp = pool.length > 0 ? rng.pick(pool) : null;
    if (!resp) continue;
    state.balance -= licenseWeight(resp.level);
    state.victims += resp.victims ?? 0;
    state.exposure += resp.exposure ?? 0;
    responses.push({ text: resp.text, level: resp.level });
  }

  const resolved = state.incidents.length;
  const arbitration = Math.abs(state.balance) >= 6;

  const licenseDebt = state.licenses.reduce((a, b) => a + licenseWeight(b), 0);
  const rewardCredit = state.rewards.reduce((a, b) => a + licenseWeight(b), 0);
  const score =
    state.saved * 12 -
    state.victims * 18 -
    state.exposure * 8 -
    licenseDebt * 6 +
    rewardCredit * 5 +
    state.reputation * 3 -
    Math.abs(state.balance) * 4 +
    Math.round(state.power / 10);

  let grade: string;
  let gradeNote: string;
  if (score >= 55) {
    grade = 'S';
    gradeNote = 'Шеф молча перечитывает отчёт дважды. Для него это овация.';
  } else if (score >= 35) {
    grade = 'A';
    gradeNote = 'Чистая смена. Таких на памяти отдела — по пальцам.';
  } else if (score >= 15) {
    grade = 'B';
    gradeNote = 'Крепкая работа. Город спал спокойно — почти весь.';
  } else if (score >= 0) {
    grade = 'C';
    gradeNote = 'Смена как смена. Никто не скажет спасибо, никто не подаст рапорт.';
  } else if (score >= -20) {
    grade = 'D';
    gradeNote = 'Шеф просит объяснительную. Письменно. К полудню.';
  } else {
    grade = 'F';
    gradeNote = 'Утренняя планёрка пройдёт без вас: вас ждут Арбитры.';
  }

  return {
    responses,
    balance: state.balance,
    saved: state.saved,
    victims: state.victims,
    exposure: state.exposure,
    powerLeft: state.power,
    resolved,
    total: state.incidents.length,
    grade,
    gradeNote,
    arbitration,
  };
}

export function formatTime(minutesLeft: number): string {
  const elapsed = SHIFT_MINUTES - minutesLeft;
  const startHour = 20;
  const h = (startHour + Math.floor(elapsed / 60)) % 24;
  const m = elapsed % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
