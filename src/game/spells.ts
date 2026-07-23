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
  effect?: 'interrupt' | 'shield' | 'sleep' | 'drain';
  /** Величина эффекта (щит/сон/выпитая Сила) при baseCost. */
  effectPower?: number;
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
};

export const SPELL_LIST = Object.values(SPELLS);
