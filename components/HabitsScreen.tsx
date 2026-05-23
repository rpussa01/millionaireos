"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Check,
  X,
  Flame,
  Dumbbell,
  Code2,
  Wallet,
  Brain,
  HeartPulse,
  Trash2,
} from "lucide-react";

import {
  Habit,
  HabitCategory,
  HabitLog,
  calculateStreak,
  deleteTodayLog,
  getHabits,
  getLogs,
  getTodayLog,
  saveHabits,
  saveLogs,
  todayKey,
  uid,
  upsertTodayLog,
} from "@/lib/habitStorage";

const categories: ("all" | HabitCategory)[] = [
  "all",
  "fitness",
  "career",
  "finance",
  "mindset",
  "health",
];

function categoryIcon(category: HabitCategory) {
  if (category === "fitness") return <Dumbbell size={22} />;
  if (category === "career") return <Code2 size={22} />;
  if (category === "finance") return <Wallet size={22} />;
  if (category === "mindset") return <Brain size={22} />;
  return <HeartPulse size={22} />;
}

export default function HabitsScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [filter, setFilter] = useState<"all" | HabitCategory>("all");
  const [showAdd, setShowAdd] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<HabitCategory>("fitness");
  const [xp, setXp] = useState(30);
  const [deadline, setDeadline] = useState("Before 8:00 PM");
  const [type, setType] = useState<"positive" | "negative">("positive");

  useEffect(() => {
    setHabits(getHabits());
    setLogs(getLogs());
  }, []);

  function refresh() {
    setHabits(getHabits());
    setLogs(getLogs());
  }

  function addHabit() {
    if (!title.trim()) return;

    const newHabit: Habit = {
      id: uid(),
      title,
      category,
      frequency: "daily",
      type,
      xp,
      deadline,
      createdAt: todayKey(),
      active: true,
    };

    const updated = [...habits, newHabit];

    saveHabits(updated);
    setHabits(updated);

    setTitle("");
    setXp(30);
    setDeadline("Before 8:00 PM");
    setShowAdd(false);
  }

  function deleteHabit(id: string) {
    const updated = habits.map((habit) =>
      habit.id === id ? { ...habit, active: false } : habit
    );

    saveHabits(updated);
    setHabits(updated);
  }

  function toggleHabit(habit: Habit) {
    const existing = getTodayLog(habit.id);

    if (existing?.status === "completed") {
      deleteTodayLog(habit.id);
      refresh();
      return;
    }

    upsertTodayLog({
      id: existing?.id || uid(),
      habitId: habit.id,
      date: todayKey(),
      status: "completed",
      xpEarned: habit.xp,
    });

    refresh();
  }

  function markMissed(habit: Habit, reasonMissed: string) {
    upsertTodayLog({
      id: uid(),
      habitId: habit.id,
      date: todayKey(),
      status: "missed",
      xpEarned: 0,
      reasonMissed,
    });

    refresh();
  }

  function endDayReview() {
    const currentLogs = getLogs();
    const today = todayKey();

    const updatedLogs = [...currentLogs];

    habits
      .filter((habit) => habit.active)
      .forEach((habit) => {
        const exists = updatedLogs.some(
          (log) => log.habitId === habit.id && log.date === today
        );

        if (!exists) {
          updatedLogs.push({
            id: uid(),
            habitId: habit.id,
            date: today,
            status: "missed",
            xpEarned: 0,
            reasonMissed: "Not reviewed",
          });
        }
      });

    saveLogs(updatedLogs);
    setLogs(updatedLogs);
  }

  const activeHabits = habits.filter((habit) => habit.active);

  const filteredHabits = activeHabits.filter((habit) =>
    filter === "all" ? true : habit.category === filter
  );

  const todayLogs = logs.filter((log) => log.date === todayKey());

  const completedCount = todayLogs.filter(
    (log) => log.status === "completed"
  ).length;

  const missedCount = todayLogs.filter((log) => log.status === "missed").length;

  const xpToday = todayLogs.reduce((sum, log) => sum + log.xpEarned, 0);

  const maxXp = activeHabits.reduce((sum, habit) => sum + habit.xp, 0);

  const disciplineScore = activeHabits.length
    ? Math.round((completedCount / activeHabits.length) * 100)
    : 0;

  const weeklyCompletion = useMemo(() => {
    const last7Days = [...Array(7)].map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - index);
      return date.toISOString().slice(0, 10);
    });

    const relevantLogs = logs.filter((log) => last7Days.includes(log.date));

    if (!relevantLogs.length) return 0;

    const completed = relevantLogs.filter(
      (log) => log.status === "completed"
    ).length;

    return Math.round((completed / relevantLogs.length) * 100);
  }, [logs]);

  return (
    <main className="min-h-screen bg-[#05080d] text-white px-4 py-6 pb-28">
      <section className="text-center mb-6">
        <h1 className="text-3xl font-bold">Today’s Mission</h1>
        <p className="text-gray-400">Win the day. Be 1% better.</p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 mb-5">
        <div className="grid grid-cols-2 gap-5">
          <div className="flex flex-col items-center justify-center border-r border-white/10">
            <div className="h-32 w-32 rounded-full border-[10px] border-emerald-400 flex items-center justify-center">
              <div className="text-center">
                <p className="text-4xl font-bold">{disciplineScore}</p>
                <p className="text-sm text-gray-400">/100</p>
              </div>
            </div>
            <p className="text-sm text-emerald-400 mt-3">● Discipline Score</p>
          </div>

          <div>
            <p className="text-sm text-gray-400">XP TODAY</p>
            <h2 className="text-3xl font-bold">
              {xpToday} <span className="text-emerald-400">/</span> {maxXp} XP
            </h2>

            <div className="h-3 bg-white/10 rounded-full mt-4 overflow-hidden">
              <div
                className="h-full bg-emerald-400"
                style={{
                  width: `${maxXp ? (xpToday / maxXp) * 100 : 0}%`,
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <Check className="text-emerald-400 mb-1" />
                <p className="text-xs text-gray-400">COMPLETED</p>
                <p className="text-2xl font-bold">
                  {completedCount} / {activeHabits.length}
                </p>
              </div>

              <div>
                <X className="text-red-400 mb-1" />
                <p className="text-xs text-gray-400">MISSED</p>
                <p className="text-2xl font-bold">{missedCount}</p>
              </div>
            </div>

            <p className="text-sm text-gray-400 mt-5">
              Weekly Completion:{" "}
              <span className="text-emerald-400">{weeklyCompletion}%</span>
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2 mb-5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`rounded-2xl border p-3 text-sm capitalize ${
              filter === cat
                ? "border-emerald-400 bg-emerald-400/10 text-emerald-400"
                : "border-white/10 bg-white/[0.04] text-gray-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </section>

      {showAdd && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 mb-5 space-y-3">
          <h2 className="text-xl font-bold">Add Habit</h2>

          <input
            className="w-full rounded-xl bg-black/30 border border-white/10 p-3 outline-none"
            placeholder="Habit name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <select
            className="w-full rounded-xl bg-black/30 border border-white/10 p-3"
            value={category}
            onChange={(e) => setCategory(e.target.value as HabitCategory)}
          >
            <option value="fitness">Fitness</option>
            <option value="career">Career</option>
            <option value="finance">Finance</option>
            <option value="mindset">Mindset</option>
            <option value="health">Health</option>
          </select>

          <select
            className="w-full rounded-xl bg-black/30 border border-white/10 p-3"
            value={type}
            onChange={(e) => setType(e.target.value as "positive" | "negative")}
          >
            <option value="positive">Positive Habit</option>
            <option value="negative">Negative Habit / Avoidance</option>
          </select>

          <input
            className="w-full rounded-xl bg-black/30 border border-white/10 p-3"
            placeholder="Deadline"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />

          <input
            className="w-full rounded-xl bg-black/30 border border-white/10 p-3"
            type="number"
            value={xp}
            onChange={(e) => setXp(Number(e.target.value))}
          />

          <button
            onClick={addHabit}
            className="w-full rounded-xl bg-emerald-500 p-3 font-bold text-black"
          >
            Save Habit
          </button>
        </section>
      )}

      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Habits</h2>

          <button
            onClick={() => setShowAdd(!showAdd)}
            className="rounded-xl bg-emerald-500 text-black px-4 py-2 font-bold flex items-center gap-2"
          >
            <Plus size={18} /> Add
          </button>
        </div>

        <div className="space-y-3">
          {filteredHabits.map((habit) => {
            const log = getTodayLog(habit.id);
            const completed = log?.status === "completed";
            const missed = log?.status === "missed";
            const streak = calculateStreak(habit.id);

            return (
              <div
                key={habit.id}
                className="rounded-2xl border border-white/10 bg-[#0b1118] p-4"
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleHabit(habit)}
                    className={`h-12 w-12 rounded-full flex items-center justify-center border ${
                      completed
                        ? "bg-emerald-500 border-emerald-400"
                        : missed
                        ? "bg-red-500/20 border-red-400"
                        : "border-gray-500"
                    }`}
                  >
                    {completed && <Check />}
                    {missed && <X />}
                  </button>

                  <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400">
                    {categoryIcon(habit.category)}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{habit.title}</h3>
                    <p className="text-sm text-emerald-400 capitalize">
                      {habit.type === "negative"
                        ? "Avoidance Habit"
                        : "Growth Habit"}{" "}
                      · {habit.category}
                    </p>
                    <p className="text-sm text-gray-400">{habit.deadline}</p>

                    {missed && (
                      <p className="text-xs text-red-300 mt-1">
                        Missed: {log?.reasonMissed}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-emerald-400">+{habit.xp} XP</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                      {streak} <Flame size={14} className="text-orange-400" />
                    </p>
                  </div>

                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="text-gray-500 hover:text-red-400"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {!completed && !missed && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {["No time", "Low energy", "Forgot"].map((reason) => (
                      <button
                        key={reason}
                        onClick={() => markMissed(habit, reason)}
                        className="rounded-xl border border-white/10 py-2 text-xs text-gray-300"
                      >
                        Missed: {reason}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-5 rounded-3xl border border-purple-500/20 bg-purple-500/10 p-5 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-xl">End of Day Review</h2>
          <p className="text-gray-400">Mark pending habits as missed.</p>
        </div>

        <button
          onClick={endDayReview}
          className="rounded-2xl bg-purple-600 px-5 py-3 font-bold"
        >
          Review Day
        </button>
      </section>
    </main>
  );
}