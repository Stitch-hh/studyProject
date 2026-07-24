import {
  advance,
  applyDecision,
  autoResolveRest,
  canAfford,
  currentIncident,
  effectiveRisk,
  enemyTurn,
  formatTime,
  outOfTime,
  payOptionCost,
  resolveCombatOption,
  resolveWitness,
  START_POWER,
} from './game/engine';
import { buildNight, createBriefing, type Briefing } from './game/leads';
import { randomSeed, seedFromUrl, type Rng } from './game/rng';
import type { DecisionOption, IncidentInstance, NightState } from './game/types';
import { renderCombat } from './combatUi';

const KIND_LABEL: Record<DecisionOption['kind'], string> = {
  force: 'СИЛА',
  talk: 'СЛОВО',
  paper: 'БУМАГА',
  ignore: 'МИМО',
  personal: 'ЛИЧНО',
};

let root: HTMLElement;
let state: NightState;
let rng: Rng;
let briefing: Briefing;
let selected: Set<string>;

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
      'Ночная стража. Одна смена, пять вызовов, Реестр помнит всё.',
    ),
    el(
      'p',
      'intro-text',
      'Каждое вмешательство Света даёт Тьме право на ответ той же силы. ' +
        'Побеждает не тот, кто сильнее бьёт, — а тот, кто платит меньше. ' +
        'Смена начинается в 20:00 и закончится в 08:00, чего бы это ни стоило.',
    ),
  );
  // Сид из ссылки — главная кнопка: ссылка на смену должна открывать ЭТУ смену.
  const seed = seedFromUrl();
  if (seed !== null) {
    const startBtn = el('button', 'btn primary', `Заступить на смену #${seed}`);
    startBtn.addEventListener('click', () => startNight(seed));
    const randomBtn = el('button', 'btn', 'Случайная смена');
    randomBtn.addEventListener('click', () => startNight(randomSeed()));
    scr.append(startBtn, randomBtn);
  } else {
    const startBtn = el('button', 'btn primary', 'Заступить на смену');
    startBtn.addEventListener('click', () => startNight(randomSeed()));
    scr.append(startBtn);
  }
  const combatBtn = el('button', 'btn', '⚔ Тренировочный бой');
  combatBtn.addEventListener('click', () => renderCombat(root, renderIntro));
  scr.append(combatBtn);
  root.append(scr);
}

function startNight(seed: number): void {
  setSeedInUrl(seed);
  const b = createBriefing(seed);
  briefing = b.briefing;
  rng = b.rng;
  selected = new Set();
  renderBriefing();
}

function renderBriefing(): void {
  root.innerHTML = '';
  const scr = el('div', 'screen');
  scr.append(el('div', 'title small', 'РАЗБОР ЗАЯВОК'));
  scr.append(
    el(
      'p',
      'intro-text',
      'Смена — 12 часов, а заявок больше, чем часов аналитика. ' +
        'Часть сводок — реальные угрозы, часть — жёлтая пресса. ' +
        'Размеченное дело пойдёт с меньшим риском; неразмеченная угроза к утру вырастет.',
    ),
  );

  const meter = el('div', 'brief-meter');
  scr.append(meter);

  const list = el('div', 'lead-list');
  for (const lead of briefing.leads) {
    const cardCls = () => `lead ${selected.has(lead.id) ? 'sel' : ''}`;
    const card = el('button', cardCls());
    card.innerHTML =
      `<div class="lead-head"><span class="lead-title">${lead.title}</span>` +
      `<span class="lead-mark">${selected.has(lead.id) ? '★ в работе' : '＋ разметить'}</span></div>` +
      `<div class="lead-blurb">${lead.blurb}</div>` +
      `<div class="lead-signal">${lead.signal}</div>`;
    card.addEventListener('click', () => {
      if (selected.has(lead.id)) {
        selected.delete(lead.id);
      } else if (selected.size < briefing.points) {
        selected.add(lead.id);
      }
      // перерисовать метку и метр без пересборки экрана
      card.className = cardCls();
      const mk = card.querySelector('.lead-mark') as HTMLElement;
      mk.textContent = selected.has(lead.id) ? '★ в работе' : '＋ разметить';
      updateMeter(meter);
      updateLeadDisabled(list);
    });
    list.append(card);
  }
  scr.append(list);
  updateMeter(meter);
  updateLeadDisabled(list);

  const start = el('button', 'btn primary', 'Заступить на смену');
  start.addEventListener('click', () => {
    state = buildNight(briefing, rng, selected);
    renderIncident();
  });
  scr.append(start);
  root.append(scr);
}

function updateMeter(meter: HTMLElement): void {
  const left = briefing.points - selected.size;
  meter.innerHTML =
    `<span class="brief-label">Часы аналитика:</span> ` +
    Array.from({ length: briefing.points }, (_, i) =>
      `<span class="hour ${i < selected.size ? 'used' : ''}"></span>`,
    ).join('') +
    ` <span class="dim">осталось ${left}</span>`;
}

function updateLeadDisabled(list: HTMLElement): void {
  const full = selected.size >= briefing.points;
  list.querySelectorAll('.lead').forEach((node) => {
    const card = node as HTMLElement;
    card.classList.toggle('locked', full && !card.classList.contains('sel'));
  });
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

function optionCosts(opt: DecisionOption, inc: IncidentInstance): string {
  const parts: string[] = [`${opt.time} мин`];
  if (opt.power > 0) parts.push(`${opt.power} Силы`);
  const money = opt.success.money ?? 0;
  if (money < 0) parts.push(`${-money} денег`);
  const lvl = opt.success.license ?? 0;
  if (lvl > 0) parts.push(`лицензия ${lvl}-го ур. Тьме`);
  const rew = opt.success.reward ?? 0;
  if (rew > 0) parts.push(`компенсация ${rew}-го ур. Свету`);
  if (opt.combat) parts.push('бой');
  const risk = effectiveRisk(opt, inc);
  if (risk > 0) {
    const base = opt.risk ?? 0;
    const tag = inc.prepped && risk < base ? ' ↓' : inc.escalated && risk > base ? ' ↑' : '';
    parts.push(`риск ${Math.round(risk * 100)}%${tag}`);
  }
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
  if (inc.prepped) {
    card.append(
      el(
        'div',
        'prep-banner',
        '📋 Размечено на планёрке: подвох известен заранее — риск в этом деле ниже.',
      ),
    );
  }
  if (inc.escalated) {
    card.append(
      el(
        'div',
        'complication escalated',
        '⚠ Заявку прогадали на разборе — пока вы занимались другими, угроза выросла. Риск выше обычного.',
      ),
    );
  }
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
        `<span class="option-costs">${optionCosts(opt, inc)}</span>`,
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
  if (opt.combat) {
    payOptionCost(state, opt);
    renderCombat(
      root,
      (result) => {
        const fx = resolveCombatOption(state, opt, result === 'win');
        renderOutcome(fx.text, result !== 'win');
      },
      { enemy: opt.combat },
    );
    return;
  }
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
    el(
      'p',
      'card-text dim',
      `Компенсации Свету: ${state.rewards.length} · Репутация: ${state.reputation > 0 ? '+' : ''}${state.reputation} · Деньги: ${state.money}`,
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
