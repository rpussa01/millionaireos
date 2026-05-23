export type HabitCategory = "fitness" | "career" | "finance" | "mindset" | "health";
export type HabitFrequency = "daily" | "weekly";
export type HabitType = "positive" | "negative";
export type HabitStatus = "pending" | "completed" | "missed";

export type Habit = {
  id: string;
  title: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  type: HabitType;
  xp: number;
  deadline: string;
  createdAt: string;
  active: boolean;
};

export type HabitLog = {
  id: string;
  habitId: string;
  date: string;
  status: "completed" | "missed";
  xpEarned: number;
  reasonMissed?: string;
};

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function uid() {
  return crypto.randomUUID();
}

const HABITS_KEY = "millionaireos_habits_v2";
const LOGS_KEY = "millionaireos_habit_logs_v2";

export const defaultHabits: Habit[] = [
  {
    id: "gym",
    title: "Train Gym",
    category: "fitness",
    frequency: "daily",
    type: "positive",
    xp: 40,
    deadline: "Before 8:00 PM",
    createdAt: todayKey(),
    active: true,
  },
  {
    id: "coding",
    title: "90 Min Deep Work Coding",
    category: "career",
    frequency: "daily",
    type: "positive",
    xp: 50,
    deadline: "Before 6:00 PM",
    createdAt: todayKey(),
    active: true,
  },
  {
    id: "protein",
    title: "Hit Protein Goal",
    category: "health",
    frequency: "daily",
    type: "positive",
    xp: 20,
    deadline: "Before 11:59 PM",
    createdAt: todayKey(),
    active: true,
  },
  {
    id: "alcohol",
    title: "No Alcohol",
    category: "mindset",
    frequency: "daily",
    type: "negative",
    xp: 40,
    deadline: "All Day",
    createdAt: todayKey(),
    active: true,
  },
  {
    id: "spending",
    title: "No Impulsive Spending",
    category: "finance",
    frequency: "daily",
    type: "negative",
    xp: 30,
    deadline: "All Day",
    createdAt: todayKey(),
    active: true,
  },
];

export function getHabits(): Habit[] {
  if (typeof window === "undefined") return defaultHabits;

  const saved = localStorage.getItem(HABITS_KEY);

  if (!saved) {
    localStorage.setItem(HABITS_KEY, JSON.stringify(defaultHabits));
    return defaultHabits;
  }

  return JSON.parse(saved);
}

export function saveHabits(habits: Habit[]) {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

export function getLogs(): HabitLog[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem(LOGS_KEY);
  return saved ? JSON.parse(saved) : [];
}

export function saveLogs(logs: HabitLog[]) {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

export function getTodayLog(habitId: string) {
  return getLogs().find(
    (log) => log.habitId === habitId && log.date === todayKey()
  );
}

export function upsertTodayLog(log: HabitLog) {
  const logs = getLogs();
  const existingIndex = logs.findIndex(
    (l) => l.habitId === log.habitId && l.date === log.date
  );

  if (existingIndex >= 0) {
    logs[existingIndex] = log;
  } else {
    logs.push(log);
  }

  saveLogs(logs);
}

export function deleteTodayLog(habitId: string) {
  const logs = getLogs().filter(
    (log) => !(log.habitId === habitId && log.date === todayKey())
  );

  saveLogs(logs);
}

export function calculateStreak(habitId: string) {
  const logs = getLogs()
    .filter((log) => log.habitId === habitId)
    .sort((a, b) => b.date.localeCompare(a.date));

  let streak = 0;

  for (const log of logs) {
    if (log.status === "completed") {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}