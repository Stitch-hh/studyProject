export type OptionKind = 'force' | 'talk' | 'paper' | 'ignore';

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
}

export interface DecisionOption {
  kind: OptionKind;
  label: string;
  time: number;
  power: number;
  /** Вероятность провала [0..1]; отсутствие — исход гарантирован. */
  risk?: number;
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
