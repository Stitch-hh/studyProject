// Заклинания. Названия — канонные плейсхолдеры (см. LORE). Урон масштабируется
// от ВЛОЖЕННОЙ Силы, а не от фиксированной цены: базовая цена/урон — точка
// отсчёта, влить можно сколько угодно (овердрайв → большие числа).

export type DamageType =
  | 'physical'
  | 'fire'
  | 'cold'
  | 'mental'
  | 'vital'
  | 'barrier';

export interface Spell {
  id: string;
  name: string;
  type: DamageType;
  /** Базовая цена в Силе — единица масштаба. */
  baseCost: number;
  /** Базовый урон при вложении baseCost. */
  baseDamage: number;
  /** Тиков плетения с нуля (0 — мгновенное, но обычно вешается на рефлекс). */
  castTicks: number;
  /** Спецэффект. */
  effect?:
    | 'interrupt'
    | 'shield'
    | 'sleep'
    | 'drain'
    | 'dominate'
    | 'heal'
    | 'dispel'
    | 'lifedrain';
  /** Величина эффекта (щит/сон/выпитая Сила) при baseCost. */
  effectPower?: number;
  /** Действует только на живых (нежить/машины невосприимчивы). */
  livingOnly?: boolean;
  desc: string;
}

/** Цвета типов урона — язык частиц (см. GD, «Типы воздействия»). */
export const TYPE_COLORS: Record<DamageType, string> = {
  physical: '#d8d2c0',
  fire: '#ff6a2a',
  cold: '#7fd4ff',
  mental: '#c98bff',
  vital: '#7a1f2a',
  barrier: '#c8a44a',
};

export const SPELLS: Record<string, Spell> = {
  fireball: {
    id: 'fireball',
    name: 'Файербол',
    type: 'fire',
    baseCost: 6,
    baseDamage: 10,
    castTicks: 3,
    desc: 'Шар огня. Хлеб боевого мага. Отлично принимает переизбыток Силы.',
  },
  triple: {
    id: 'triple',
    name: 'Тройное лезвие',
    type: 'physical',
    baseCost: 8,
    baseDamage: 13,
    castTicks: 3,
    desc: 'Три стальных росчерка. Быстрое, надёжное, кинетичное.',
  },
  press: {
    id: 'press',
    name: 'Пресс',
    type: 'physical',
    baseCost: 10,
    baseDamage: 15,
    castTicks: 4,
    desc: 'Уплотнённая Сила давит противника к земле.',
  },
  freeze: {
    id: 'freeze',
    name: 'Фриз',
    type: 'cold',
    baseCost: 9,
    baseDamage: 6,
    castTicks: 2,
    effect: 'interrupt',
    effectPower: 1,
    desc: 'Локальная остановка. Срывает чужой каст, почти не раня.',
  },
  morpheus: {
    id: 'morpheus',
    name: 'Морфей',
    type: 'mental',
    baseCost: 12,
    baseDamage: 2,
    castTicks: 4,
    effect: 'sleep',
    effectPower: 3,
    desc: 'Погружает в сон. Обезвреживает, не убивая.',
  },
  shield: {
    id: 'shield',
    name: 'Щит мага',
    type: 'barrier',
    baseCost: 8,
    baseDamage: 0,
    castTicks: 2,
    effect: 'shield',
    effectPower: 20,
    desc: 'Гексагональный барьер. Поглощает урон.',
  },
  greyprayer: {
    id: 'greyprayer',
    name: 'Серый молебен',
    type: 'vital',
    baseCost: 14,
    baseDamage: 8,
    castTicks: 5,
    effect: 'drain',
    effectPower: 10,
    desc: 'Против нежити: ослабляет, замедляет и высасывает Силу.',
  },
  opium: {
    id: 'opium',
    name: 'Опиум',
    type: 'mental',
    baseCost: 18,
    baseDamage: 0,
    castTicks: 5,
    effect: 'sleep',
    effectPower: 5,
    desc: 'Тяжёлый наркотический сон — глубже и дольше Морфея. Дорогое плетение.',
  },
  dominant: {
    id: 'dominant',
    name: 'Доминанта',
    type: 'mental',
    baseCost: 20,
    baseDamage: 0,
    castTicks: 4,
    effect: 'dominate',
    effectPower: 2,
    desc: 'Приказ, которому нельзя не подчиниться: срывает чужой каст и сбивает противника с хода.',
  },
  sphere: {
    id: 'sphere',
    name: 'Сфера невнимания',
    type: 'mental',
    baseCost: 10,
    baseDamage: 0,
    castTicks: 2,
    effect: 'shield',
    effectPower: 22,
    desc: 'Взгляд соскальзывает: удары уходят мимо. Барьер из чужого невнимания.',
  },
  remoral: {
    id: 'remoral',
    name: 'Реморализация',
    type: 'mental',
    baseCost: 16,
    baseDamage: 0,
    castTicks: 4,
    effect: 'sleep',
    effectPower: 4,
    livingOnly: true,
    desc: 'Светлая догма: живой враг не может поднять на вас руку. На нежить не действует.',
  },
  gremlin: {
    id: 'gremlin',
    name: 'Гремлин',
    type: 'physical',
    baseCost: 8,
    baseDamage: 5,
    castTicks: 3,
    desc: 'Ломает технику и хрупкие плетения. Бьёт по неживому — лицензий не требует.',
  },

  // — Вторая волна. Провенанс сверить с каноном (см. LORE): 📖 книга, 🎮 онлайн-игра,
  //   🛠 наша адаптация, ❓ требует проверки арбитром канона.
  iceblade: {
    id: 'iceblade',
    name: 'Ледяное копьё', // 🛠 холодная атака (у Фриза был только «срыв»)
    type: 'cold',
    baseCost: 10,
    baseDamage: 12,
    castTicks: 3,
    desc: 'Отточенный клин льда. Холодный урон, хорошо принимает переизбыток.',
  },
  firerain: {
    id: 'firerain',
    name: 'Огненный дождь', // ❓ название — сверить с таблицей онлайн-игры
    type: 'fire',
    baseCost: 20,
    baseDamage: 30,
    castTicks: 6,
    desc: 'Долгий тяжёлый каст — но при вливании Силы выдаёт огромные числа.',
  },
  morok: {
    id: 'morok',
    name: 'Морок', // 📖 иллюзия — в бою сбивает противника с прицела
    type: 'mental',
    baseCost: 7,
    baseDamage: 0,
    castTicks: 2,
    effect: 'sleep',
    effectPower: 2,
    desc: 'Иллюзия-обманка: враг бьёт по фантому и теряет ход. Дёшево и быстро.',
  },
  negation: {
    id: 'negation',
    name: 'Сфера отрицания', // 📖 (Гесер/Завулон) — мощный барьер, у нас масштаб 🛠
    type: 'barrier',
    baseCost: 16,
    baseDamage: 0,
    castTicks: 3,
    effect: 'shield',
    effectPower: 45,
    desc: 'Купол, гасящий чужую волю. Огромный барьер — особенно на овердрайве.',
  },
  heal: {
    id: 'heal',
    name: 'Белое марево', // ❓ трактовка как лечение — сверить; 📖 Светлые целят
    type: 'vital',
    baseCost: 14,
    baseDamage: 0,
    castTicks: 4,
    effect: 'heal',
    effectPower: 30,
    desc: 'Светлое исцеление: затягивает раны. На овердрайве поднимает почти из ничего.',
  },
  dispel: {
    id: 'dispel',
    name: 'Снятие', // 📖 развеивание чужих плетений
    type: 'barrier',
    baseCost: 9,
    baseDamage: 0,
    castTicks: 2,
    effect: 'dispel',
    desc: 'Срывает с противника щиты и незавершённые касты. Обнуляет его защиту.',
  },
  lifedrain: {
    id: 'lifedrain',
    name: 'Вытягивание Силы', // 🛠 тёмный дренаж по живому (у нежити — Серый молебен)
    type: 'vital',
    baseCost: 12,
    baseDamage: 9,
    castTicks: 4,
    effect: 'lifedrain',
    effectPower: 50,
    desc: 'Тёмное плетение: ранит и возвращает часть отнятого кастующему.',
  },
};

export const SPELL_LIST = Object.values(SPELLS);
