import {
  advance,
  applyDecision,
  autoResolveRest,
  canAfford,
  createNight,
  currentIncident,
  enemyTurn,
  formatTime,
  outOfTime,
  resolveWitness,
  START_POWER,
} from './game/engine';
import { randomSeed, seedFromUrl, type Rng } from './game/rng';
import type { DecisionOption, NightState } from './game/types';
import { renderCombat } from './combatUi';

const KIND_LABEL: Record<DecisionOption['kind'], string> = {
  force: 'СИЛА',
  talk: 'СЛОВО',
  paper: 'БУМАГА',
  ignore: 'МИМО',
};

let root: HTMLElement;
let state: NightState;
let rng: Rng;

export function boot(el: HTMLElement): void {
  root = el;
  renderIntro();
}

function el(tag: string, cls: string, html?: string): HTMLElement {
  const node = document.createElement(tag);
  node.className = cls;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

function setSeedInUrl(seed: number): void {
  const url = new URL(window.location.href);
  url.searchParams.set('seed', String(seed));
  history.replaceState(null, '', url.toString());
}

function renderIntro(): void {
  root.innerHTML = '';
  const scr = el('div', 'screen intro');
  scr.append(
    el('div', 'title', 'СМЕНА'),
    el(
      'div',
      'subtitle',
      'Ночная стража. Прототип этапа&nbsp;0: одна смена, шесть вызовов, Реестр помнит всё.',
    ),
    el(
      'p',
      'intro-text',
      'Каждое вмешательство Света даёт Тьме право на ответ той же силы. ' +
        'Побеждает не тот, кто сильнее бьёт, — а тот, кто платит меньше. ' +
        'Смена начинается в 20:00 и закончится в 08:00, чего бы это ни стоило.',
    ),
  );
  const startBtn = el('button', 'btn primary', 'Заступить на смену');
  startBtn.addEventListener('click', () => startNight(randomSeed()));
  const seed = seedFromUrl();
  scr.append(startBtn);
  if (seed !== null) {
    const replayBtn = el('button', 'btn', `Повторить смену #${seed}`);
    replayBtn.addEventListener('click', () => startNight(seed));
    scr.append(replayBtn);
  }
  const combatBtn = el('button', 'btn', '⚔ Испытать бой (этап 0.5)');
  combatBtn.addEventListener('click', () => renderCombat(root, renderIntro));
  scr.append(combatBtn);
  root.append(scr);
}

function startNight(seed: number): void {
  setSeedInUrl(seed);
  const night = createNight(seed);
  state = night.state;
  rng = night.rng;
  renderIncident();
}

function statsBar(): HTMLElement {
  const bar = el('div', 'stats');
  bar.append(
    el('div', 'stat', `<span class="stat-label">Время</span>${formatTime(state.timeLeft)}`),
    el(
      'div',
      'stat',
      `<span class="stat-label">Сила</span>${state.power}<span class="dim">/${START_POWER}</span>`,
    ),
    el(
      'div',
      'stat',
      `<span class="stat-label">Реестр</span>${
        state.licenses.length > 0
          ? state.licenses.map((l) => `<span class="lic">${l}-й ур.</span>`).join('')
          : '<span class="dim">пусто</span>'
      }`,
    ),
  );
  const balanceWrap = el('div', 'balance-wrap');
  balanceWrap.append(el('span', 'balance-side dark', 'Тьма'));
  const track = el('div', 'balance-track');
  const marker = el('div', 'balance-marker');
  const pct = ((state.balance + 10) / 20) * 100;
  marker.style.left = `${Math.max(2, Math.min(98, pct))}%`;
  track.append(marker);
  balanceWrap.append(track, el('span', 'balance-side light', 'Свет'));
  bar.append(balanceWrap);
  return bar;
}

function optionCosts(opt: DecisionOption): string {
  const parts: string[] = [`${opt.time} мин`];
  if (opt.power > 0) parts.push(`${opt.power} Силы`);
  const lvl = opt.success.license ?? 0;
  if (lvl > 0) parts.push(`лицензия ${lvl}-го ур. Тьме`);
  if (opt.risk) parts.push(`риск ${Math.round(opt.risk * 100)}%`);
  return parts.join(' · ');
}

function renderIncident(): void {
  if (outOfTime(state)) {
    finishNight(true);
    return;
  }
  const inc = currentIncident(state);
  if (!inc) {
    finishNight(false);
    return;
  }

  root.innerHTML = '';
  const scr = el('div', 'screen');
  scr.append(statsBar());

  const card = el('div', 'card');
  card.append(
    el(
      'div',
      'card-meta',
      `Вызов ${state.idx + 1}/${state.incidents.length} · ${inc.district} · ${inc.tpl.creature}`,
    ),
    el('h2', 'card-title', inc.tpl.title),
    el('p', 'card-text', inc.tpl.text),
  );
  if (inc.witness) {
    card.append(
      el(
        'div',
        'complication',
        'Осложнение: рядом случайный человек — любое грубое вмешательство он увидит.',
      ),
    );
  }

  const opts = el('div', 'options');
  for (const opt of inc.tpl.options) {
    const btn = el(
      'button',
      `option kind-${opt.kind}`,
      `<span class="option-kind">${KIND_LABEL[opt.kind]}</span>` +
        `<span class="option-label">${opt.label}</span>` +
        `<span class="option-costs">${optionCosts(opt)}</span>`,
    ) as HTMLButtonElement;
    if (!canAfford(state, opt)) {
      btn.disabled = true;
      btn.title = 'Не хватает Силы';
    }
    btn.addEventListener('click', () => choose(opt));
    opts.append(btn);
  }
  card.append(opts);
  scr.append(card, renderLog());
  root.append(scr);
}

function choose(opt: DecisionOption): void {
  const outcome = applyDecision(state, rng, opt);
  if (outcome.witnessPrompt) {
    renderWitnessPrompt(outcome.failed);
  } else {
    renderOutcome(outcome.effects.text, outcome.failed);
  }
}

function renderWitnessPrompt(failed: boolean): void {
  root.innerHTML = '';
  const scr = el('div', 'screen');
  scr.append(statsBar());
  const card = el('div', 'card');
  card.append(
    el('h2', 'card-title', 'Свидетель всё видел'),
    el(
      'p',
      'card-text',
      state.log[state.log.length - 1] +
        '<br><br>Случайный прохожий стоит в десяти шагах и смотрит на вас круглыми глазами.',
    ),
  );
  const opts = el('div', 'options');

  const erase = el(
    'button',
    'option kind-force',
    `<span class="option-kind">СИЛА</span>` +
      `<span class="option-label">Стереть память о часе</span>` +
      `<span class="option-costs">15 мин · лицензия 6-го ур. Тьме</span>`,
  );
  erase.addEventListener('click', () => {
    resolveWitness(state, 'erase');
    renderOutcome(state.log[state.log.length - 1], failed);
  });

  const leave = el(
    'button',
    'option kind-ignore',
    `<span class="option-kind">МИМО</span>` +
      `<span class="option-label">Оставить как есть</span>` +
      `<span class="option-costs">бесплатно · слухи по району</span>`,
  );
  leave.addEventListener('click', () => {
    resolveWitness(state, 'leave');
    renderOutcome(state.log[state.log.length - 1], failed);
  });

  opts.append(erase, leave);
  card.append(opts);
  scr.append(card, renderLog());
  root.append(scr);
}

function renderOutcome(text: string, failed: boolean): void {
  root.innerHTML = '';
  const scr = el('div', 'screen');
  scr.append(statsBar());
  const card = el('div', `card outcome ${failed ? 'outcome-fail' : ''}`);
  card.append(
    el('div', 'card-meta', failed ? 'Пошло не по плану' : 'Исход'),
    el('p', 'card-text', text),
  );
  const next = el('button', 'btn primary', 'Дальше');
  next.addEventListener('click', () => {
    advance(state);
    renderIncident();
  });
  card.append(next);
  scr.append(card, renderLog());
  root.append(scr);
}

function renderLog(): HTMLElement {
  const box = el('div', 'log');
  const lines = state.log.slice(-4);
  for (const line of lines) box.append(el('div', 'log-line', line));
  return box;
}

function finishNight(ranOut: boolean): void {
  const skipped = ranOut ? autoResolveRest(state) : [];
  const report = enemyTurn(state, rng);

  root.innerHTML = '';
  const scr = el('div', 'screen report');
  scr.append(el('div', 'title small', 'УТРЕННИЙ ОТЧЁТ'));

  if (skipped.length > 0) {
    const box = el('div', 'card');
    box.append(el('h2', 'card-title', 'До чего не доехали'));
    for (const s of skipped) box.append(el('p', 'card-text dim', s));
    scr.append(box);
  }

  const resp = el('div', 'card');
  resp.append(el('h2', 'card-title', 'Ответ Тьмы по Реестру'));
  if (report.responses.length === 0) {
    resp.append(
      el(
        'p',
        'card-text',
        'Реестр пуст. Ни одной лицензии за ночь — Тьме нечем ответить. Редкая, дорогая тишина.',
      ),
    );
  } else {
    for (const r of report.responses) {
      resp.append(el('p', `card-text resp-l${r.level}`, `[${r.level}-й ур.] ${r.text}`));
    }
  }
  scr.append(resp);

  const totals = el('div', 'card');
  totals.append(
    el('h2', 'card-title', `Оценка смены: ${report.grade}`),
    el('p', 'card-text', report.gradeNote),
    el(
      'p',
      'card-text dim',
      `Спасено: ${report.saved} · Жертвы: ${report.victims} · Огласка: ${report.exposure} · ` +
        `Баланс: ${report.balance > 0 ? '+' : ''}${report.balance} · Остаток Силы: ${report.powerLeft}`,
    ),
  );
  if (report.arbitration) {
    totals.append(
      el(
        'p',
        'card-text warn',
        'Арбитры уведомляют: перекос Баланса зафиксирован. Ещё одна такая ночь — и в город войдёт Зеркало.',
      ),
    );
  }
  scr.append(totals);

  const again = el('button', 'btn primary', 'Новая смена');
  again.addEventListener('click', () => startNight(randomSeed()));
  const replay = el('button', 'btn', `Переиграть смену #${state.seed}`);
  replay.addEventListener('click', () => startNight(state.seed));
  scr.append(again, replay);

  root.append(scr);
}
