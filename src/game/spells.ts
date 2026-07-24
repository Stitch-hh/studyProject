// АВТОСГЕНЕРИРОВАНО из docs/MAGIC_TABLE.md (понятные заклинания, см. MAGIC_DESIGN).
// Названия/школы/уровни — канон онлайн-игры; числа (baseCost/baseDamage/castTicks/
// effectPower) — НАШИ, по формуле от уровня. Урон масштабируется от вложенной Силы
// (оверчардж). Уровень: 7 слабый … 1 сильный, 0 = «вне категорий» (сильнее 1-го).
// Иной уровня L владеет заклинанием, если spell.level >= L (свой уровень и слабее).

export type DamageType =
  | 'physical' | 'fire' | 'cold' | 'lightning'
  | 'mental' | 'inferno' | 'vital' | 'barrier' | 'poison';

export type SpellCategory =
  | 'damage' | 'heal' | 'shield' | 'drain' | 'dispel' | 'sunder'
  | 'control' | 'charm' | 'buff' | 'debuff'
  | 'energy' | 'scout' | 'transform' | 'social' | 'util' | 'feed';

export interface Spell {
  id: string;
  name: string;
  school: string;
  /** Мин. уровень Иного: 7 слабый … 1 сильный, 0 = вне категорий. */
  level: number;
  /** Общая школа (доступна магу) vs классовая (вампиры/ведьмы/…). */
  general: boolean;
  category: SpellCategory;
  /** Участвует ли в боевой сцене (утилита/социалка — нет). */
  combat: boolean;
  type: DamageType;
  baseCost: number;
  baseDamage: number;
  castTicks: number;
  effect?: 'interrupt' | 'shield' | 'sleep' | 'drain' | 'dominate' | 'heal' | 'dispel' | 'lifedrain';
  effectPower?: number;
  livingOnly?: boolean;
  desc: string;
}

export const TYPE_COLORS: Record<DamageType, string> = {
  physical: '#d8d2c0',
  fire: '#ff6a2a',
  cold: '#7fd4ff',
  lightning: '#ffe066',
  mental: '#c98bff',
  inferno: '#b0344f',
  vital: '#7a1f2a',
  barrier: '#c8a44a',
  poison: '#8fbf4a',
};

export const SPELL_LIST: Spell[] = [
  { id: 'vifleemskiy_ogon', name: 'Вифлеемский огонь', school: 'Колдовство', level: 7, general: true, category: 'damage', combat: true, type: 'fire', baseCost: 6, baseDamage: 13, castTicks: 4, desc: 'Урон огнём' },
  { id: 'cepnoy_razryad', name: 'Цепной разряд', school: 'Колдовство', level: 6, general: true, category: 'damage', combat: true, type: 'lightning', baseCost: 8, baseDamage: 20, castTicks: 4, desc: 'Урон молнией' },
  { id: 'fayerbol', name: 'Файербол', school: 'Колдовство', level: 5, general: true, category: 'damage', combat: true, type: 'fire', baseCost: 10, baseDamage: 27, castTicks: 4, desc: 'Урон огнём' },
  { id: 'razyaschaya_molniya', name: 'Разящая молния', school: 'Колдовство', level: 4, general: true, category: 'damage', combat: true, type: 'lightning', baseCost: 12, baseDamage: 34, castTicks: 4, desc: 'Урон молнией' },
  { id: 'zaschita_luzhina', name: 'Защита Лужина', school: 'Колдовство', level: 4, general: true, category: 'shield', combat: true, type: 'barrier', baseCost: 13, baseDamage: 0, castTicks: 3, effect: 'shield', effectPower: 40, desc: 'Барьер' },
  { id: 'pauche_plamya', name: 'Паучье пламя', school: 'Колдовство', level: 3, general: true, category: 'damage', combat: true, type: 'fire', baseCost: 14, baseDamage: 41, castTicks: 4, desc: 'Урон огнём' },
  { id: 'gruppovoy_fayerbol', name: 'Групповой файербол', school: 'Колдовство', level: 2, general: true, category: 'damage', combat: true, type: 'fire', baseCost: 16, baseDamage: 48, castTicks: 4, desc: 'Урон огнём' },
  { id: 'molniya', name: 'Молния', school: 'Колдовство', level: 2, general: true, category: 'damage', combat: true, type: 'lightning', baseCost: 16, baseDamage: 48, castTicks: 4, desc: 'Урон молнией' },
  { id: 'potok_lavy', name: 'Поток лавы', school: 'Колдовство', level: 1, general: true, category: 'damage', combat: true, type: 'fire', baseCost: 18, baseDamage: 55, castTicks: 4, desc: 'Урон огнём' },
  { id: 'led', name: 'Лед', school: 'Кудесничество', level: 7, general: true, category: 'damage', combat: true, type: 'cold', baseCost: 6, baseDamage: 13, castTicks: 4, desc: 'Урон льдом' },
  { id: 'ledyanaya_stena', name: 'Ледяная стена', school: 'Кудесничество', level: 6, general: true, category: 'shield', combat: true, type: 'barrier', baseCost: 9, baseDamage: 0, castTicks: 3, effect: 'shield', effectPower: 26, desc: 'Барьер' },
  { id: 'ognennyy_schit', name: 'Огненный щит', school: 'Кудесничество', level: 6, general: true, category: 'shield', combat: true, type: 'barrier', baseCost: 9, baseDamage: 0, castTicks: 3, effect: 'shield', effectPower: 26, desc: 'Барьер' },
  { id: 'morok', name: 'Морок', school: 'Кудесничество', level: 5, general: true, category: 'control', combat: true, type: 'mental', baseCost: 12, baseDamage: 0, castTicks: 4, effect: 'sleep', effectPower: 3, desc: 'Контроль (обездвиживание)' },
  { id: 'oskolok_lda', name: 'Осколок Льда', school: 'Кудесничество', level: 5, general: true, category: 'damage', combat: true, type: 'cold', baseCost: 10, baseDamage: 27, castTicks: 4, desc: 'Урон льдом' },
  { id: 'stena_ognya', name: 'Стена огня', school: 'Кудесничество', level: 4, general: true, category: 'damage', combat: true, type: 'fire', baseCost: 12, baseDamage: 34, castTicks: 4, desc: 'Урон огнём' },
  { id: 'hrustalnyy_schit', name: 'Хрустальный щит', school: 'Кудесничество', level: 3, general: true, category: 'shield', combat: true, type: 'barrier', baseCost: 15, baseDamage: 0, castTicks: 4, effect: 'shield', effectPower: 47, desc: 'Барьер' },
  { id: 'ledyanaya_burya', name: 'Ледяная буря', school: 'Кудесничество', level: 2, general: true, category: 'damage', combat: true, type: 'cold', baseCost: 16, baseDamage: 48, castTicks: 5, desc: 'Урон льдом' },
  { id: 'meteornyy_dozhd', name: 'Метеорный дождь', school: 'Кудесничество', level: 1, general: true, category: 'damage', combat: true, type: 'fire', baseCost: 18, baseDamage: 55, castTicks: 5, desc: 'Урон огнём' },
  { id: 'proboy_schita', name: 'Пробой щита', school: 'Кудесничество', level: 0, general: true, category: 'sunder', combat: true, type: 'barrier', baseCost: 13, baseDamage: 0, castTicks: 4, effect: 'dispel', desc: 'Ослабляет чужую защиту' },
  { id: 'ledenyaschee_prikosnovenie', name: 'Леденящее прикосновение', school: 'Некромантия', level: 7, general: true, category: 'damage', combat: true, type: 'cold', baseCost: 6, baseDamage: 13, castTicks: 4, desc: 'Урон льдом' },
  { id: 'otricanie_smerti', name: 'Отрицание смерти', school: 'Некромантия', level: 6, general: true, category: 'shield', combat: true, type: 'barrier', baseCost: 9, baseDamage: 0, castTicks: 2, effect: 'shield', effectPower: 26, desc: 'Барьер' },
  { id: 'raspad', name: 'Распад', school: 'Некромантия', level: 6, general: true, category: 'damage', combat: true, type: 'inferno', baseCost: 8, baseDamage: 20, castTicks: 3, desc: 'Урон инферно' },
  { id: 'ustrashenie', name: 'Устрашение', school: 'Некромантия', level: 6, general: true, category: 'control', combat: true, type: 'mental', baseCost: 10, baseDamage: 0, castTicks: 3, effect: 'sleep', effectPower: 3, desc: 'Контроль (обездвиживание)' },
  { id: 'otricanie_nezhivogo', name: 'Отрицание неживого', school: 'Некромантия', level: 5, general: true, category: 'damage', combat: true, type: 'inferno', baseCost: 10, baseDamage: 27, castTicks: 4, desc: 'Урон инферно' },
  { id: 'smertelnyy_perst', name: 'Смертельный перст', school: 'Некромантия', level: 4, general: true, category: 'drain', combat: true, type: 'vital', baseCost: 14, baseDamage: 16, castTicks: 4, effect: 'drain', effectPower: 18, desc: 'Вытягивает энергию' },
  { id: 'tanatos', name: 'Танатос', school: 'Некромантия', level: 3, general: true, category: 'damage', combat: true, type: 'inferno', baseCost: 14, baseDamage: 41, castTicks: 4, desc: 'Урон инферно' },
  { id: 'schit_tanatosa', name: 'Щит Танатоса', school: 'Некромантия', level: 3, general: true, category: 'shield', combat: true, type: 'barrier', baseCost: 15, baseDamage: 0, castTicks: 3, effect: 'shield', effectPower: 47, desc: 'Барьер' },
  { id: 'issushenie', name: 'Иссушение', school: 'Некромантия', level: 2, general: true, category: 'damage', combat: true, type: 'inferno', baseCost: 16, baseDamage: 48, castTicks: 4, desc: 'Урон инферно' },
  { id: 'krug_smerti', name: 'Круг смерти', school: 'Некромантия', level: 2, general: true, category: 'damage', combat: true, type: 'inferno', baseCost: 16, baseDamage: 48, castTicks: 4, desc: 'Урон инферно' },
  { id: 'proryv_inferno', name: 'Прорыв инферно', school: 'Некромантия', level: 1, general: true, category: 'damage', combat: true, type: 'inferno', baseCost: 18, baseDamage: 55, castTicks: 5, desc: 'Урон инферно' },
  { id: 'ten_vladyk', name: 'Тень владык', school: 'Некромантия', level: 1, general: true, category: 'drain', combat: true, type: 'vital', baseCost: 20, baseDamage: 25, castTicks: 5, effect: 'drain', effectPower: 27, desc: 'Вытягивает энергию' },
  { id: 'tanec_smerti', name: 'Танец смерти', school: 'Некромантия', level: 1, general: true, category: 'damage', combat: true, type: 'inferno', baseCost: 18, baseDamage: 55, castTicks: 5, desc: 'Урон инферно' },
  { id: 'dyhanie_smerti', name: 'Дыхание смерти', school: 'Некромантия', level: 1, general: true, category: 'damage', combat: true, type: 'inferno', baseCost: 18, baseDamage: 55, castTicks: 4, desc: 'Урон инферно' },
  { id: 'schit_teney', name: 'Щит теней', school: 'Некромантия', level: 1, general: true, category: 'shield', combat: true, type: 'barrier', baseCost: 19, baseDamage: 0, castTicks: 3, effect: 'shield', effectPower: 61, desc: 'Барьер' },
  { id: 'yasnovidenie', name: 'Ясновидение', school: 'Прорицание', level: 7, general: true, category: 'scout', combat: false, type: 'barrier', baseCost: 8, baseDamage: 0, castTicks: 3, desc: 'Разведка/анализ' },
  { id: 'analiz', name: 'Анализ', school: 'Прорицание', level: 4, general: true, category: 'scout', combat: false, type: 'barrier', baseCost: 14, baseDamage: 0, castTicks: 2, desc: 'Разведка/анализ' },
  { id: 'oko_maga', name: 'Око мага', school: 'Прорицание', level: 3, general: true, category: 'scout', combat: false, type: 'barrier', baseCost: 16, baseDamage: 0, castTicks: 2, desc: 'Разведка/анализ' },
  { id: 'zaschitnyy_ekran', name: 'Защитный экран', school: 'Прорицание', level: 2, general: true, category: 'shield', combat: true, type: 'barrier', baseCost: 17, baseDamage: 0, castTicks: 4, effect: 'shield', effectPower: 54, desc: 'Барьер' },
  { id: 'polnyy_analiz', name: 'Полный анализ', school: 'Прорицание', level: 2, general: true, category: 'scout', combat: false, type: 'barrier', baseCost: 18, baseDamage: 0, castTicks: 2, desc: 'Разведка/анализ' },
  { id: 'zametanie_sledov', name: 'Заметание следов', school: 'Универсальная', level: 7, general: true, category: 'util', combat: false, type: 'barrier', baseCost: 8, baseDamage: 0, castTicks: 3, desc: 'Утилита' },
  { id: 'obratit_k_svetu', name: 'Обратить к Свету', school: 'Универсальная', level: 7, general: true, category: 'social', combat: false, type: 'barrier', baseCost: 8, baseDamage: 0, castTicks: 2, desc: 'Влияние на людей' },
  { id: 'obratit_k_tme', name: 'Обратить к Тьме', school: 'Универсальная', level: 7, general: true, category: 'social', combat: false, type: 'barrier', baseCost: 8, baseDamage: 0, castTicks: 2, desc: 'Влияние на людей' },
  { id: 'remoralizaciya', name: 'Реморализация', school: 'Универсальная', level: 7, general: true, category: 'social', combat: false, type: 'barrier', baseCost: 8, baseDamage: 0, castTicks: 2, desc: 'Влияние на людей' },
  { id: 'sbor_energii', name: 'Сбор энергии', school: 'Универсальная', level: 7, general: true, category: 'energy', combat: false, type: 'vital', baseCost: 8, baseDamage: 0, castTicks: 5, desc: 'Восстановление энергии' },
  { id: 'schit_maga', name: 'Щит мага', school: 'Универсальная', level: 7, general: true, category: 'shield', combat: true, type: 'barrier', baseCost: 7, baseDamage: 0, castTicks: 2, effect: 'shield', effectPower: 19, desc: 'Барьер' },
  { id: 'zaschita_ot_zondirovaniya', name: 'Защита от зондирования', school: 'Универсальная', level: 6, general: true, category: 'shield', combat: true, type: 'barrier', baseCost: 9, baseDamage: 0, castTicks: 2, effect: 'shield', effectPower: 26, desc: 'Барьер' },
  { id: 'otvod_glaz', name: 'Отвод глаз', school: 'Универсальная', level: 6, general: true, category: 'util', combat: false, type: 'barrier', baseCost: 10, baseDamage: 0, castTicks: 2, desc: 'Утилита' },
  { id: 'peredacha_energii', name: 'Передача энергии', school: 'Универсальная', level: 6, general: true, category: 'energy', combat: false, type: 'vital', baseCost: 10, baseDamage: 0, castTicks: 2, desc: 'Восстановление энергии' },
  { id: 'press', name: 'Пресс', school: 'Универсальная', level: 6, general: true, category: 'control', combat: true, type: 'mental', baseCost: 10, baseDamage: 0, castTicks: 3, effect: 'sleep', effectPower: 3, desc: 'Контроль (обездвиживание)' },
  { id: 'snyatie_proklyatiya', name: 'Снятие проклятия', school: 'Универсальная', level: 6, general: true, category: 'dispel', combat: true, type: 'barrier', baseCost: 7, baseDamage: 0, castTicks: 2, effect: 'dispel', desc: 'Срывает щиты и плетения' },
  { id: 'troynoy_kinzhal', name: 'Тройной кинжал', school: 'Универсальная', level: 6, general: true, category: 'damage', combat: true, type: 'physical', baseCost: 8, baseDamage: 20, castTicks: 4, desc: 'Урон ударом' },
  { id: 'proverit_auru', name: 'Проверить ауру', school: 'Универсальная', level: 5, general: true, category: 'scout', combat: false, type: 'barrier', baseCost: 12, baseDamage: 0, castTicks: 2, desc: 'Разведка/анализ' },
  { id: 'sfera_otricaniya', name: 'Сфера отрицания', school: 'Универсальная', level: 5, general: true, category: 'shield', combat: true, type: 'barrier', baseCost: 11, baseDamage: 0, castTicks: 2, effect: 'shield', effectPower: 33, desc: 'Барьер' },
  { id: 'poisk_po_aure', name: 'Поиск по ауре', school: 'Универсальная', level: 4, general: true, category: 'scout', combat: false, type: 'barrier', baseCost: 14, baseDamage: 0, castTicks: 2, desc: 'Разведка/анализ' },
  { id: 'zaschitnaya_stena', name: 'Защитная стена', school: 'Универсальная', level: 3, general: true, category: 'shield', combat: true, type: 'barrier', baseCost: 15, baseDamage: 0, castTicks: 3, effect: 'shield', effectPower: 47, desc: 'Барьер' },
  { id: 'otricanie', name: 'Отрицание', school: 'Универсальная', level: 3, general: true, category: 'drain', combat: true, type: 'vital', baseCost: 16, baseDamage: 19, castTicks: 4, effect: 'drain', effectPower: 21, desc: 'Вытягивает энергию' },
  { id: 'bezmyatezhnost', name: 'Безмятежность', school: 'Универсальная', level: 2, general: true, category: 'dispel', combat: true, type: 'barrier', baseCost: 11, baseDamage: 0, castTicks: 3, effect: 'dispel', desc: 'Срывает щиты и плетения' },
  { id: 'vognutyy_schit', name: 'Вогнутый щит', school: 'Универсальная', level: 2, general: true, category: 'shield', combat: true, type: 'barrier', baseCost: 17, baseDamage: 0, castTicks: 3, effect: 'shield', effectPower: 54, desc: 'Барьер' },
  { id: 'svoboda', name: 'Свобода', school: 'Универсальная', level: 2, general: true, category: 'dispel', combat: true, type: 'barrier', baseCost: 11, baseDamage: 0, castTicks: 3, effect: 'dispel', desc: 'Срывает щиты и плетения' },
  { id: 'skovyvanie', name: 'Сковывание', school: 'Универсальная', level: 2, general: true, category: 'control', combat: true, type: 'mental', baseCost: 18, baseDamage: 0, castTicks: 3, effect: 'sleep', effectPower: 5, desc: 'Контроль (обездвиживание)' },
  { id: 'friz', name: 'Фриз', school: 'Универсальная', level: 2, general: true, category: 'control', combat: true, type: 'cold', baseCost: 18, baseDamage: 0, castTicks: 5, effect: 'interrupt', effectPower: 5, desc: 'Контроль (обездвиживание)' },
  { id: 'individualnyy_portal', name: 'Индивидуальный портал', school: 'Универсальная', level: 1, general: true, category: 'util', combat: false, type: 'barrier', baseCost: 20, baseDamage: 0, castTicks: 2, desc: 'Утилита' },
  { id: 'rasseivanie', name: 'Рассеивание', school: 'Универсальная', level: 1, general: true, category: 'dispel', combat: true, type: 'barrier', baseCost: 12, baseDamage: 0, castTicks: 4, effect: 'dispel', desc: 'Срывает щиты и плетения' },
  { id: 'massovoe_rasseivanie', name: 'Массовое Рассеивание', school: 'Универсальная', level: 0, general: true, category: 'dispel', combat: true, type: 'barrier', baseCost: 13, baseDamage: 0, castTicks: 5, effect: 'dispel', desc: 'Срывает щиты и плетения' },
  { id: 'otrazhenie', name: 'Отражение', school: 'Универсальная', level: 0, general: true, category: 'shield', combat: true, type: 'barrier', baseCost: 21, baseDamage: 0, castTicks: 4, effect: 'shield', effectPower: 68, desc: 'Барьер' },
  { id: 'prosvetlenie', name: 'Просветление', school: 'Универсальная', level: 0, general: true, category: 'dispel', combat: true, type: 'barrier', baseCost: 13, baseDamage: 0, castTicks: 5, effect: 'dispel', desc: 'Срывает щиты и плетения' },
  { id: 'hrustalnyy_kupol', name: 'Хрустальный купол', school: 'Универсальная', level: 0, general: true, category: 'shield', combat: true, type: 'barrier', baseCost: 21, baseDamage: 0, castTicks: 5, effect: 'shield', effectPower: 68, desc: 'Барьер' },
  { id: 'citadel_anubisa', name: 'Цитадель Анубиса', school: 'Универсальная', level: 0, general: true, category: 'shield', combat: true, type: 'barrier', baseCost: 21, baseDamage: 0, castTicks: 5, effect: 'shield', effectPower: 68, desc: 'Барьер' },
  { id: 'kosmeticheskaya_magiya', name: 'Косметическая магия', school: 'Целительство', level: 7, general: true, category: 'heal', combat: true, type: 'vital', baseCost: 8, baseDamage: 0, castTicks: 4, effect: 'heal', effectPower: 16, desc: 'Лечение (оверчардж усиливает)' },
  { id: 'slepota', name: 'Слепота', school: 'Целительство', level: 6, general: true, category: 'control', combat: true, type: 'mental', baseCost: 10, baseDamage: 0, castTicks: 4, effect: 'sleep', effectPower: 3, desc: 'Контроль (обездвиживание)' },
  { id: 'zagovor_ran', name: 'Заговор ран', school: 'Целительство', level: 5, general: true, category: 'heal', combat: true, type: 'vital', baseCost: 12, baseDamage: 0, castTicks: 5, effect: 'heal', effectPower: 28, desc: 'Лечение (оверчардж усиливает)' },
  { id: 'zamedlenie', name: 'Замедление', school: 'Целительство', level: 5, general: true, category: 'control', combat: true, type: 'mental', baseCost: 12, baseDamage: 0, castTicks: 4, effect: 'sleep', effectPower: 3, desc: 'Контроль (обездвиживание)' },
  { id: 'oslablenie', name: 'Ослабление', school: 'Целительство', level: 5, general: true, category: 'debuff', combat: false, type: 'poison', baseCost: 12, baseDamage: 0, castTicks: 4, desc: 'Ослабление (в разработке)' },
  { id: 'sila', name: 'Сила', school: 'Целительство', level: 5, general: true, category: 'buff', combat: false, type: 'barrier', baseCost: 12, baseDamage: 0, castTicks: 4, desc: 'Усиление (в разработке)' },
  { id: 'otrezvlenie', name: 'Отрезвление', school: 'Целительство', level: 4, general: true, category: 'dispel', combat: true, type: 'barrier', baseCost: 9, baseDamage: 0, castTicks: 3, effect: 'dispel', desc: 'Срывает щиты и плетения' },
  { id: 'pyan', name: 'Пьян', school: 'Целительство', level: 4, general: true, category: 'debuff', combat: false, type: 'poison', baseCost: 14, baseDamage: 0, castTicks: 4, desc: 'Ослабление (в разработке)' },
  { id: 'magicheskoe_izlechenie', name: 'Магическое излечение', school: 'Целительство', level: 3, general: true, category: 'heal', combat: true, type: 'vital', baseCost: 16, baseDamage: 0, castTicks: 5, effect: 'heal', effectPower: 40, desc: 'Лечение (оверчардж усиливает)' },
  { id: 'usypit', name: 'Усыпить', school: 'Целительство', level: 3, general: true, category: 'control', combat: true, type: 'mental', baseCost: 16, baseDamage: 0, castTicks: 4, effect: 'sleep', effectPower: 4, desc: 'Контроль (обездвиживание)' },
  { id: 'pautina', name: 'Паутина', school: 'Целительство', level: 2, general: true, category: 'control', combat: true, type: 'mental', baseCost: 18, baseDamage: 0, castTicks: 5, effect: 'sleep', effectPower: 5, desc: 'Контроль (обездвиживание)' },
  { id: 'celebnyy_krug', name: 'Целебный круг', school: 'Целительство', level: 2, general: true, category: 'heal', combat: true, type: 'vital', baseCost: 18, baseDamage: 0, castTicks: 6, effect: 'heal', effectPower: 46, desc: 'Лечение (оверчардж усиливает)' },
  { id: 'avicenna', name: 'Авиценна', school: 'Целительство', level: 1, general: true, category: 'heal', combat: true, type: 'vital', baseCost: 20, baseDamage: 0, castTicks: 5, effect: 'heal', effectPower: 52, desc: 'Лечение (оверчардж усиливает)' },
  { id: 'prikosnovenie_empata', name: 'Прикосновение эмпата', school: 'Чары', level: 7, general: true, category: 'damage', combat: true, type: 'mental', baseCost: 6, baseDamage: 13, castTicks: 4, desc: 'Урон разумом' },
  { id: 'podavlenie_voli', name: 'Подавление воли', school: 'Чары', level: 5, general: true, category: 'damage', combat: true, type: 'mental', baseCost: 10, baseDamage: 27, castTicks: 4, desc: 'Урон разумом' },
  { id: 'sila_mysli', name: 'Сила мысли', school: 'Чары', level: 4, general: true, category: 'damage', combat: true, type: 'mental', baseCost: 12, baseDamage: 34, castTicks: 4, desc: 'Урон разумом' },
  { id: 'mentalnyy_schit', name: 'Ментальный щит', school: 'Чары', level: 3, general: true, category: 'shield', combat: true, type: 'barrier', baseCost: 15, baseDamage: 0, castTicks: 2, effect: 'shield', effectPower: 47, desc: 'Барьер' },
  { id: 'bol_i_stradaniya', name: 'Боль и страдания', school: 'Чары', level: 3, general: true, category: 'damage', combat: true, type: 'mental', baseCost: 14, baseDamage: 41, castTicks: 4, desc: 'Урон разумом' },
  { id: 'barer_voli', name: 'Барьер Воли', school: 'Чары', level: 2, general: true, category: 'shield', combat: true, type: 'barrier', baseCost: 17, baseDamage: 0, castTicks: 4, effect: 'shield', effectPower: 54, desc: 'Барьер' },
  { id: 'ledenyaschiy_uzhas', name: 'Леденящий ужас', school: 'Чары', level: 2, general: true, category: 'damage', combat: true, type: 'cold', baseCost: 16, baseDamage: 48, castTicks: 5, desc: 'Урон льдом' },
  { id: 'pytka_razuma', name: 'Пытка разума', school: 'Чары', level: 1, general: true, category: 'damage', combat: true, type: 'mental', baseCost: 18, baseDamage: 55, castTicks: 4, desc: 'Урон разумом' },
  { id: 'uhischrenie', name: 'Ухищрение', school: 'Чары', level: 0, general: true, category: 'drain', combat: true, type: 'vital', baseCost: 22, baseDamage: 28, castTicks: 5, effect: 'drain', effectPower: 30, desc: 'Вытягивает энергию' },
  { id: 'vampirskoe_obayanie', name: 'Вампирское обаяние', school: 'Вампиризм', level: 7, general: false, category: 'charm', combat: true, type: 'mental', baseCost: 8, baseDamage: 0, castTicks: 4, effect: 'sleep', effectPower: 2, desc: 'Очарование (обездвиживает)' },
  { id: 'preobrazhenie', name: 'Преображение', school: 'Вампиризм', level: 7, general: false, category: 'transform', combat: false, type: 'barrier', baseCost: 8, baseDamage: 0, castTicks: 6, desc: 'Оборот/смена облика' },
  { id: 'ukusit_cheloveka', name: 'Укусить человека', school: 'Вампиризм', level: 7, general: false, category: 'feed', combat: false, type: 'vital', baseCost: 8, baseDamage: 0, castTicks: 5, desc: 'Питание (кровь/мясо)' },
  { id: 'vampirskoe_vosstanovlenie', name: 'Вампирское восстановление', school: 'Вампиризм', level: 6, general: false, category: 'heal', combat: true, type: 'vital', baseCost: 10, baseDamage: 0, castTicks: 4, effect: 'heal', effectPower: 22, desc: 'Лечение (оверчардж усиливает)' },
  { id: 'zov', name: 'Зов', school: 'Вампиризм', level: 6, general: false, category: 'scout', combat: false, type: 'barrier', baseCost: 10, baseDamage: 0, castTicks: 2, desc: 'Разведка/анализ' },
  { id: 'ledyanoy_voy', name: 'Ледяной вой', school: 'Вампиризм', level: 6, general: false, category: 'damage', combat: true, type: 'cold', baseCost: 8, baseDamage: 20, castTicks: 4, desc: 'Урон льдом' },
  { id: 'ocepenenie', name: 'Оцепенение', school: 'Вампиризм', level: 5, general: false, category: 'damage', combat: true, type: 'inferno', baseCost: 10, baseDamage: 27, castTicks: 4, desc: 'Урон инферно' },
  { id: 'uskolzanie', name: 'Ускользание', school: 'Вампиризм', level: 5, general: false, category: 'buff', combat: false, type: 'barrier', baseCost: 12, baseDamage: 0, castTicks: 4, desc: 'Усиление (в разработке)' },
  { id: 'poceluy_smerti', name: 'Поцелуй смерти', school: 'Вампиризм', level: 4, general: false, category: 'damage', combat: true, type: 'inferno', baseCost: 12, baseDamage: 34, castTicks: 4, desc: 'Урон инферно' },
  { id: 'transformaciya_vampira', name: 'Трансформация Вампира', school: 'Вампиризм', level: 4, general: false, category: 'transform', combat: false, type: 'barrier', baseCost: 14, baseDamage: 0, castTicks: 6, desc: 'Оборот/смена облика' },
  { id: 'vampirskaya_regeneraciya', name: 'Вампирская регенерация', school: 'Вампиризм', level: 3, general: false, category: 'heal', combat: true, type: 'vital', baseCost: 16, baseDamage: 0, castTicks: 5, effect: 'heal', effectPower: 40, desc: 'Лечение (оверчардж усиливает)' },
  { id: 'vampirskiy_oskal', name: 'Вампирский оскал', school: 'Вампиризм', level: 3, general: false, category: 'damage', combat: true, type: 'physical', baseCost: 14, baseDamage: 41, castTicks: 4, desc: 'Урон ударом' },
  { id: 'vytyagivanie_zhizni', name: 'Вытягивание жизни', school: 'Вампиризм', level: 3, general: false, category: 'damage', combat: true, type: 'inferno', baseCost: 14, baseDamage: 41, castTicks: 4, desc: 'Урон инферно' },
  { id: 'schit_mertvyh', name: 'Щит мертвых', school: 'Вампиризм', level: 3, general: false, category: 'shield', combat: true, type: 'barrier', baseCost: 15, baseDamage: 0, castTicks: 3, effect: 'shield', effectPower: 47, desc: 'Барьер' },
  { id: 'schit_krovi', name: 'Щит Крови', school: 'Вампиризм', level: 3, general: false, category: 'shield', combat: true, type: 'barrier', baseCost: 15, baseDamage: 0, castTicks: 3, effect: 'shield', effectPower: 47, desc: 'Барьер' },
  { id: 'krovavyy_tuman', name: 'Кровавый туман', school: 'Вампиризм', level: 2, general: false, category: 'sunder', combat: true, type: 'barrier', baseCost: 11, baseDamage: 0, castTicks: 5, effect: 'dispel', desc: 'Ослабляет чужую защиту' },
  { id: 'terzanie_ploti', name: 'Терзание плоти', school: 'Вампиризм', level: 2, general: false, category: 'damage', combat: true, type: 'physical', baseCost: 16, baseDamage: 48, castTicks: 4, desc: 'Урон ударом' },
  { id: 'vzor_serdca', name: 'Взор сердца', school: 'Вампиризм', level: 1, general: false, category: 'scout', combat: false, type: 'barrier', baseCost: 20, baseDamage: 0, castTicks: 2, desc: 'Разведка/анализ' },
  { id: 'mogilnyy_holod', name: 'Могильный холод', school: 'Вампиризм', level: 1, general: false, category: 'damage', combat: true, type: 'cold', baseCost: 18, baseDamage: 55, castTicks: 5, desc: 'Урон льдом' },
  { id: 'prikosnovenie_mertvyh', name: 'Прикосновение мертвых', school: 'Вампиризм', level: 1, general: false, category: 'damage', combat: true, type: 'inferno', baseCost: 18, baseDamage: 55, castTicks: 4, desc: 'Урон инферно' },
  { id: 'schit_smerti', name: 'Щит Смерти', school: 'Вампиризм', level: 1, general: false, category: 'shield', combat: true, type: 'barrier', baseCost: 19, baseDamage: 0, castTicks: 3, effect: 'shield', effectPower: 61, desc: 'Барьер' },
  { id: 'istinnoe_lico', name: 'Истинное лицо', school: 'Ведовство', level: 7, general: false, category: 'dispel', combat: true, type: 'barrier', baseCost: 6, baseDamage: 0, castTicks: 2, effect: 'dispel', desc: 'Срывает щиты и плетения' },
  { id: 'otvorot', name: 'Отворот', school: 'Ведовство', level: 7, general: false, category: 'dispel', combat: true, type: 'barrier', baseCost: 6, baseDamage: 0, castTicks: 2, effect: 'dispel', desc: 'Срывает щиты и плетения' },
  { id: 'vospolnenie_energii', name: 'Восполнение энергии', school: 'Ведовство', level: 6, general: false, category: 'energy', combat: false, type: 'vital', baseCost: 10, baseDamage: 0, castTicks: 2, desc: 'Восстановление энергии' },
  { id: 'porcha', name: 'Порча', school: 'Ведовство', level: 6, general: false, category: 'debuff', combat: false, type: 'poison', baseCost: 10, baseDamage: 0, castTicks: 2, desc: 'Ослабление (в разработке)' },
  { id: 'potrava', name: 'Потрава', school: 'Ведовство', level: 6, general: false, category: 'debuff', combat: false, type: 'poison', baseCost: 10, baseDamage: 0, castTicks: 2, desc: 'Ослабление (в разработке)' },
  { id: 'rost_shipov', name: 'Рост шипов', school: 'Ведовство', level: 6, general: false, category: 'damage', combat: true, type: 'cold', baseCost: 8, baseDamage: 20, castTicks: 2, desc: 'Урон льдом' },
  { id: 'vosstanovlenie_energii', name: 'Восстановление энергии', school: 'Ведовство', level: 5, general: false, category: 'energy', combat: false, type: 'vital', baseCost: 12, baseDamage: 0, castTicks: 2, desc: 'Восстановление энергии' },
  { id: 'lechenie_ran', name: 'Лечение ран', school: 'Ведовство', level: 5, general: false, category: 'heal', combat: true, type: 'vital', baseCost: 12, baseDamage: 0, castTicks: 2, effect: 'heal', effectPower: 28, desc: 'Лечение (оверчардж усиливает)' },
  { id: 'sglaz', name: 'Сглаз', school: 'Ведовство', level: 5, general: false, category: 'control', combat: true, type: 'mental', baseCost: 12, baseDamage: 0, castTicks: 4, effect: 'sleep', effectPower: 3, desc: 'Контроль (обездвиживание)' },
  { id: 'dubovaya_kozha', name: 'Дубовая кожа', school: 'Ведовство', level: 4, general: false, category: 'shield', combat: true, type: 'barrier', baseCost: 13, baseDamage: 0, castTicks: 2, effect: 'shield', effectPower: 40, desc: 'Барьер' },
  { id: 'ognennye_semena', name: 'Огненные семена', school: 'Ведовство', level: 4, general: false, category: 'damage', combat: true, type: 'fire', baseCost: 12, baseDamage: 34, castTicks: 2, desc: 'Урон огнём' },
  { id: 'smena_oblika', name: 'Смена облика', school: 'Ведовство', level: 4, general: false, category: 'transform', combat: false, type: 'barrier', baseCost: 14, baseDamage: 0, castTicks: 2, desc: 'Оборот/смена облика' },
  { id: 'volshebnoe_odeyanie', name: 'Волшебное одеяние', school: 'Ведовство', level: 3, general: false, category: 'shield', combat: true, type: 'barrier', baseCost: 15, baseDamage: 0, castTicks: 2, effect: 'shield', effectPower: 47, desc: 'Барьер' },
  { id: 'izlechenie', name: 'Излечение', school: 'Ведовство', level: 3, general: false, category: 'heal', combat: true, type: 'vital', baseCost: 16, baseDamage: 0, castTicks: 2, effect: 'heal', effectPower: 40, desc: 'Лечение (оверчардж усиливает)' },
  { id: 'oputyvanie', name: 'Опутывание', school: 'Ведовство', level: 3, general: false, category: 'control', combat: true, type: 'mental', baseCost: 16, baseDamage: 0, castTicks: 2, effect: 'sleep', effectPower: 4, desc: 'Контроль (обездвиживание)' },
  { id: 'polet', name: 'Полет', school: 'Ведовство', level: 3, general: false, category: 'buff', combat: false, type: 'barrier', baseCost: 16, baseDamage: 0, castTicks: 2, desc: 'Усиление (в разработке)' },
  { id: 'hischnye_pticy', name: 'Хищные птицы', school: 'Ведовство', level: 3, general: false, category: 'damage', combat: true, type: 'cold', baseCost: 14, baseDamage: 41, castTicks: 4, desc: 'Урон льдом' },
  { id: 'zhivaya_voda', name: 'Живая вода', school: 'Ведовство', level: 2, general: false, category: 'heal', combat: true, type: 'vital', baseCost: 18, baseDamage: 0, castTicks: 4, effect: 'heal', effectPower: 46, desc: 'Лечение (оверчардж усиливает)' },
  { id: 'privorot', name: 'Приворот', school: 'Ведовство', level: 2, general: false, category: 'charm', combat: true, type: 'mental', baseCost: 18, baseDamage: 0, castTicks: 2, effect: 'sleep', effectPower: 5, desc: 'Очарование (обездвиживает)' },
  { id: 'serdce_burana', name: 'Сердце Бурана', school: 'Ведовство', level: 2, general: false, category: 'damage', combat: true, type: 'cold', baseCost: 16, baseDamage: 48, castTicks: 2, desc: 'Урон льдом' },
  { id: 'son', name: 'Сон', school: 'Ведовство', level: 2, general: false, category: 'control', combat: true, type: 'mental', baseCost: 18, baseDamage: 0, castTicks: 4, effect: 'sleep', effectPower: 5, desc: 'Контроль (обездвиживание)' },
  { id: 'chernaya_metel', name: 'Черная метель', school: 'Ведовство', level: 2, general: false, category: 'damage', combat: true, type: 'cold', baseCost: 16, baseDamage: 48, castTicks: 2, desc: 'Урон льдом' },
  { id: 'chuma', name: 'Чума', school: 'Ведовство', level: 2, general: false, category: 'drain', combat: true, type: 'vital', baseCost: 18, baseDamage: 22, castTicks: 4, effect: 'drain', effectPower: 24, desc: 'Вытягивает энергию' },
  { id: 'schit_vesty', name: 'Щит Весты', school: 'Ведовство', level: 2, general: false, category: 'shield', combat: true, type: 'barrier', baseCost: 17, baseDamage: 0, castTicks: 2, effect: 'shield', effectPower: 54, desc: 'Барьер' },
  { id: 'schit_znaniy', name: 'Щит Знаний', school: 'Ведовство', level: 2, general: false, category: 'shield', combat: true, type: 'barrier', baseCost: 17, baseDamage: 0, castTicks: 2, effect: 'shield', effectPower: 54, desc: 'Барьер' },
  { id: 'iscelenie', name: 'Исцеление', school: 'Ведовство', level: 1, general: false, category: 'heal', combat: true, type: 'vital', baseCost: 20, baseDamage: 0, castTicks: 2, effect: 'heal', effectPower: 52, desc: 'Лечение (оверчардж усиливает)' },
  { id: 'metel', name: 'Метель', school: 'Ведовство', level: 1, general: false, category: 'damage', combat: true, type: 'cold', baseCost: 18, baseDamage: 55, castTicks: 5, desc: 'Урон льдом' },
  { id: 'yasnyy_vzor', name: 'Ясный взор', school: 'Ведовство', level: 1, general: false, category: 'scout', combat: false, type: 'barrier', baseCost: 20, baseDamage: 0, castTicks: 2, desc: 'Разведка/анализ' },
  { id: 'plamya_drakona', name: 'Пламя Дракона', school: 'Ведовство', level: 0, general: false, category: 'damage', combat: true, type: 'fire', baseCost: 20, baseDamage: 62, castTicks: 2, desc: 'Урон огнём' },
  { id: 'kom_snega', name: 'Ком снега', school: 'Ведовство', level: 0, general: false, category: 'damage', combat: true, type: 'cold', baseCost: 20, baseDamage: 62, castTicks: 2, desc: 'Урон льдом' },
  { id: 'obvorozhenie', name: 'Обворожение', school: 'Обворожение', level: 7, general: false, category: 'charm', combat: true, type: 'mental', baseCost: 8, baseDamage: 0, castTicks: 4, effect: 'sleep', effectPower: 2, desc: 'Очарование (обездвиживает)' },
  { id: 'smertelnyy_poceluy', name: 'Смертельный поцелуй', school: 'Обворожение', level: 7, general: false, category: 'drain', combat: true, type: 'vital', baseCost: 8, baseDamage: 7, castTicks: 3, effect: 'drain', effectPower: 9, desc: 'Вытягивает энергию' },
  { id: 'zaschitnyy_polog', name: 'Защитный полог', school: 'Обворожение', level: 6, general: false, category: 'shield', combat: true, type: 'barrier', baseCost: 9, baseDamage: 0, castTicks: 2, effect: 'shield', effectPower: 26, desc: 'Барьер' },
  { id: 'strela_amura', name: 'Стрела Амура', school: 'Обворожение', level: 5, general: false, category: 'damage', combat: true, type: 'mental', baseCost: 10, baseDamage: 27, castTicks: 4, desc: 'Урон разумом' },
  { id: 'snyat_chary', name: 'Снять чары', school: 'Обворожение', level: 4, general: false, category: 'dispel', combat: true, type: 'barrier', baseCost: 9, baseDamage: 0, castTicks: 4, effect: 'dispel', desc: 'Срывает щиты и плетения' },
  { id: 'golovnaya_bol', name: 'Головная боль', school: 'Обворожение', level: 3, general: false, category: 'damage', combat: true, type: 'mental', baseCost: 14, baseDamage: 41, castTicks: 4, desc: 'Урон разумом' },
  { id: 'uskorenie', name: 'Ускорение', school: 'Обворожение', level: 3, general: false, category: 'buff', combat: false, type: 'barrier', baseCost: 16, baseDamage: 0, castTicks: 4, desc: 'Усиление (в разработке)' },
  { id: 'ledyanaya_kora', name: 'Ледяная Кора', school: 'Обворожение', level: 2, general: false, category: 'shield', combat: true, type: 'barrier', baseCost: 17, baseDamage: 0, castTicks: 3, effect: 'shield', effectPower: 54, desc: 'Барьер' },
  { id: 'massovoe_ocharovanie', name: 'Массовое очарование', school: 'Обворожение', level: 2, general: false, category: 'charm', combat: true, type: 'mental', baseCost: 18, baseDamage: 0, castTicks: 5, effect: 'sleep', effectPower: 5, desc: 'Очарование (обездвиживает)' },
  { id: 'morfey', name: 'Морфей', school: 'Обворожение', level: 2, general: false, category: 'control', combat: true, type: 'mental', baseCost: 18, baseDamage: 0, castTicks: 4, effect: 'sleep', effectPower: 5, desc: 'Контроль (обездвиживание)' },
  { id: 'schit_razuma', name: 'Щит разума', school: 'Обворожение', level: 2, general: false, category: 'shield', combat: true, type: 'barrier', baseCost: 17, baseDamage: 0, castTicks: 2, effect: 'shield', effectPower: 54, desc: 'Барьер' },
  { id: 'schit_emociy', name: 'Щит эмоций', school: 'Обворожение', level: 2, general: false, category: 'shield', combat: true, type: 'barrier', baseCost: 17, baseDamage: 0, castTicks: 2, effect: 'shield', effectPower: 54, desc: 'Барьер' },
  { id: 'breynstorm', name: 'Брэйнсторм', school: 'Обворожение', level: 1, general: false, category: 'damage', combat: true, type: 'mental', baseCost: 18, baseDamage: 55, castTicks: 5, desc: 'Урон разумом' },
  { id: 'istinnoe_zrenie', name: 'Истинное зрение', school: 'Обворожение', level: 1, general: false, category: 'scout', combat: false, type: 'barrier', baseCost: 20, baseDamage: 0, castTicks: 2, desc: 'Разведка/анализ' },
  { id: 'strah_i_uzhas', name: 'Страх и Ужас', school: 'Обворожение', level: 1, general: false, category: 'control', combat: true, type: 'mental', baseCost: 20, baseDamage: 0, castTicks: 5, effect: 'sleep', effectPower: 5, desc: 'Контроль (обездвиживание)' },
  { id: 'uspokaivayuschaya_pelena', name: 'Успокаивающая пелена', school: 'Обворожение', level: 1, general: false, category: 'dispel', combat: true, type: 'barrier', baseCost: 12, baseDamage: 0, castTicks: 4, effect: 'dispel', desc: 'Срывает щиты и плетения' },
  { id: 'psionicheskiy_udar', name: 'Псионический удар', school: 'Обворожение', level: 0, general: false, category: 'damage', combat: true, type: 'mental', baseCost: 20, baseDamage: 62, castTicks: 4, desc: 'Урон разумом' },
  { id: 'zagryzt_cheloveka', name: 'Загрызть человека', school: 'Оборотничество', level: 7, general: false, category: 'feed', combat: false, type: 'vital', baseCost: 8, baseDamage: 0, castTicks: 5, desc: 'Питание (кровь/мясо)' },
  { id: 'sbor_energii_2', name: 'Сбор энергии', school: 'Оборотничество', level: 7, general: false, category: 'energy', combat: false, type: 'vital', baseCost: 8, baseDamage: 0, castTicks: 5, desc: 'Восстановление энергии' },
  { id: 'transformaciya_oborotnya', name: 'Трансформация оборотня', school: 'Оборотничество', level: 7, general: false, category: 'transform', combat: false, type: 'barrier', baseCost: 8, baseDamage: 0, castTicks: 6, desc: 'Оборот/смена облика' },
  { id: 'vosstanovlenie', name: 'Восстановление', school: 'Оборотничество', level: 6, general: false, category: 'heal', combat: true, type: 'vital', baseCost: 10, baseDamage: 0, castTicks: 4, effect: 'heal', effectPower: 22, desc: 'Лечение (оверчардж усиливает)' },
  { id: 'voinstvennyy_voy', name: 'Воинственный вой', school: 'Оборотничество', level: 3, general: false, category: 'damage', combat: true, type: 'physical', baseCost: 14, baseDamage: 41, castTicks: 4, desc: 'Урон ударом' },
  { id: 'medvezhya_hvatka', name: 'Медвежья хватка', school: 'Оборотничество', level: 3, general: false, category: 'damage', combat: true, type: 'physical', baseCost: 14, baseDamage: 41, castTicks: 4, desc: 'Урон ударом' },
  { id: 'pryzhok_smerti', name: 'Прыжок смерти', school: 'Оборотничество', level: 3, general: false, category: 'damage', combat: true, type: 'inferno', baseCost: 14, baseDamage: 41, castTicks: 4, desc: 'Урон инферно' },
  { id: 'stremitelnyy_udar', name: 'Стремительный удар', school: 'Оборотничество', level: 3, general: false, category: 'damage', combat: true, type: 'physical', baseCost: 14, baseDamage: 41, castTicks: 4, desc: 'Урон ударом' },
  { id: 'volshebnaya_shkura', name: 'Волшебная Шкура', school: 'Оборотничество', level: 3, general: false, category: 'shield', combat: true, type: 'barrier', baseCost: 15, baseDamage: 0, castTicks: 3, effect: 'shield', effectPower: 47, desc: 'Барьер' },
  { id: 'regeneraciya', name: 'Регенерация', school: 'Оборотничество', level: 3, general: false, category: 'heal', combat: true, type: 'vital', baseCost: 16, baseDamage: 0, castTicks: 5, effect: 'heal', effectPower: 40, desc: 'Лечение (оверчардж усиливает)' },
  { id: 'oglushayuschiy_ryk', name: 'Оглушающий рык', school: 'Оборотничество', level: 3, general: false, category: 'damage', combat: true, type: 'physical', baseCost: 14, baseDamage: 41, castTicks: 4, desc: 'Урон ударом' },
  { id: 'dikaya_ohota', name: 'Дикая охота', school: 'Оборотничество', level: 2, general: false, category: 'damage', combat: true, type: 'physical', baseCost: 16, baseDamage: 48, castTicks: 4, desc: 'Урон ударом' },
  { id: 'yarost', name: 'Ярость', school: 'Оборотничество', level: 2, general: false, category: 'sunder', combat: true, type: 'barrier', baseCost: 11, baseDamage: 0, castTicks: 5, effect: 'dispel', desc: 'Ослабляет чужую защиту' },
  { id: 'ledyanoy_klyk', name: 'Ледяной клык', school: 'Оборотничество', level: 1, general: false, category: 'damage', combat: true, type: 'cold', baseCost: 18, baseDamage: 55, castTicks: 4, desc: 'Урон льдом' },
  { id: 'lezviya_holoda', name: 'Лезвия холода', school: 'Оборотничество', level: 1, general: false, category: 'damage', combat: true, type: 'cold', baseCost: 18, baseDamage: 55, castTicks: 5, desc: 'Урон льдом' },
  { id: 'nyuh', name: 'Нюх', school: 'Оборотничество', level: 1, general: false, category: 'scout', combat: false, type: 'barrier', baseCost: 20, baseDamage: 0, castTicks: 2, desc: 'Разведка/анализ' },
  { id: 'yarostnoe_vozmezdie', name: 'Яростное возмездие', school: 'Оборотничество', level: 1, general: false, category: 'damage', combat: true, type: 'physical', baseCost: 18, baseDamage: 55, castTicks: 5, desc: 'Урон ударом' },
  { id: 'neistovstvo', name: 'Неистовство', school: 'Оборотничество', level: 0, general: false, category: 'sunder', combat: true, type: 'barrier', baseCost: 13, baseDamage: 0, castTicks: 5, effect: 'dispel', desc: 'Ослабляет чужую защиту' },
];

export const SPELLS: Record<string, Spell> = Object.fromEntries(SPELL_LIST.map((s) => [s.id, s]));

/** Общие школы, доступные магу-оперативнику. */
export const GENERAL_SCHOOLS = [
  'Колдовство', 'Кудесничество', 'Некромантия', 'Прорицание', 'Универсальная', 'Целительство', 'Чары',
];

/** Иной уровня casterLevel владеет заклинанием своего уровня и слабее (большие числа). */
export function isUnlocked(spell: Spell, casterLevel: number): boolean {
  return spell.level >= casterLevel; // 0 (ВК) доступно только «вне категорий»
}
