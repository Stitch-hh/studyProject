export type OptionKind = 'force' | 'talk' | 'paper' | 'ignore' | 'personal';

/** Эффекты применения решения (или его провала). */
export interface Effects {
  text: string;
  saved?: number;
  victims?: number;
  /** Сдвиг баланса: плюс — к Свету, минус — к Тьме. */
  balance?: number;
  /** Уровень лицензии, выданной противнику (0 или отсутствие — нет записи в Реестре). */
  license?: number;
  /** Публичность: люди что-то заметили. Портит итоговую оценку. */
  exposure?: number;
  /** Лицензия-компенсация Свету за доказанное нарушение Тьмы (канонический уровень). */
  reward?: number;
  /** Деньги: минус — трата, плюс — редко. */
  money?: number;
  /** Репутация в общине Иных. */
  reputation?: number;
}

/** Тип противника для боевой сцены. */
export type CombatKind = 'vampire' | 'witch';

export interface DecisionOption {
  kind: OptionKind;
  label: string;
  time: number;
  power: number;
  /** Вероятность провала [0..1]; отсутствие — исход гарантирован. */
  risk?: number;
  /** Если задано — выбор запускает боевую сцену; success = победа, fail = поражение. */
  combat?: CombatKind;
  success: Effects;
  fail?: Effects;
}

export interface IncidentTemplate {
  id: string;
  title: string;
  creature: string;
  text: string;
  /** Может ли инцидент получить осложнение «свидетель». */
  canWitness?: boolean;
  options: DecisionOption[];
}

export interface IncidentInstance {
  tpl: IncidentTemplate;
  district: string;
  witness: boolean;
  /** Заявка размечена аналитиком на планёрке — риск ниже, подвох известен. */
  prepped?: boolean;
  /** Заявку прогадали — угроза выросла к утру. */
  escalated?: boolean;
  /** Множитель риска опций (prep — 0.5, эскалация — 1.4). */
  riskMod?: number;
}

export interface EnemyResponse {
  level: number;
  text: string;
  victims?: number;
  exposure?: number;
}

export interface NightState {
  seed: number;
  timeLeft: number;
  power: number;
  balance: number;
  /** Уровни лицензий, накопленных Тьмой за ночь. */
  licenses: number[];
  saved: number;
  victims: number;
  exposure: number;
  /** Уровни лицензий-компенсаций, заработанных Светом за ночь. */
  rewards: number[];
  money: number;
  reputation: number;
  incidents: IncidentInstance[];
  idx: number;
  log: string[];
}

export interface ReportLine {
  text: string;
  level: number;
}

export interface NightReport {
  responses: ReportLine[];
  balance: number;
  saved: number;
  victims: number;
  exposure: number;
  powerLeft: number;
  resolved: number;
  total: number;
  grade: string;
  gradeNote: string;
  arbitration: boolean;
}
