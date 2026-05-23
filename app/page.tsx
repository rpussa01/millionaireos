"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { addXP, calcPercent, getUserId } from "@/lib/helpers";
import { Button, Card, Input, ProgressBar, Textarea } from "@/components/UI";

const tabs = [
  "Dashboard",
  "Habits",
  "Finance",
  "Career",
  "Fitness",
  "Mindset",
  "AI Coach",
  "Progress",
  "Achievements",
  "Review",
];

export default function HomePage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Dashboard");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  if (loading) {
    return <main className="min-h-screen bg-slate-950 p-8 text-white">Loading...</main>;
  }

  if (!session) return <Auth />;

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-4xl font-black md:text-5xl">MillionaireOS</h1>
            <p className="mt-2 text-slate-400">Your full life operating system.</p>
          </div>

          <Button className="bg-red-600" onClick={() => supabase.auth.signOut()}>
            Logout
          </Button>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {tabs.map((x) => (
            <button
              key={x}
              onClick={() => setTab(x)}
              className={`rounded-2xl px-4 py-2 font-bold ${
                tab === x ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-300"
              }`}
            >
              {x}
            </button>
          ))}
        </div>

        {tab === "Dashboard" && <Dashboard />}
        {tab === "Habits" && <Habits />}
        {tab === "Finance" && <Finance />}
        {tab === "Career" && <Career />}
        {tab === "Fitness" && <Fitness />}
        {tab === "Mindset" && <Mindset />}
        {tab === "AI Coach" && <AICoach />}
        {tab === "Progress" && <Progress />}
        {tab === "Achievements" && <Achievements />}
        {tab === "Review" && <WeeklyReview />}
      </div>
    </main>
  );
}

function Auth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function register() {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { first_name: firstName, last_name: lastName } },
    });

    if (error) return alert(error.message);

    if (data.user?.id) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        first_name: firstName,
        last_name: lastName,
        email,
        xp: 0,
        level: 1,
      });
    }

    alert("Account created. Login now.");
    setMode("login");
  }

  async function login() {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) return alert(error.message);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <Card className="w-full max-w-md">
        <h1 className="text-4xl font-black">MillionaireOS</h1>
        <p className="mt-2 text-slate-400">Your full life operating system.</p>

        {mode === "register" && (
          <>
            <Input placeholder="First name" value={firstName} onChange={(e: any) => setFirstName(e.target.value)} />
            <Input placeholder="Last name" value={lastName} onChange={(e: any) => setLastName(e.target.value)} />
          </>
        )}

        <Input placeholder="Email" value={email} onChange={(e: any) => setEmail(e.target.value)} />
        <Input placeholder="Password" type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} />

        <Button className="mt-5 w-full" onClick={mode === "login" ? login : register}>
          {mode === "login" ? "Login" : "Create Account"}
        </Button>

        <button
          className="mt-5 w-full text-slate-400"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "Create account" : "Already have an account?"}
        </button>
      </Card>
    </main>
  );
}

function Dashboard() {
  const [stats, setStats] = useState<any>({
    overall: 0,
    discipline: 0,
    career: 0,
    finance: 0,
    fitness: 0,
    mindset: 0,
    xp: 0,
    level: 1,
  });

  const [identity, setIdentity] = useState(
    "You are becoming a disciplined builder of your future."
  );

  const [identityLoading, setIdentityLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function generateIdentity(identityData: any) {
    try {
      setIdentityLoading(true);

      const res = await fetch("/api/identity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(identityData),
      });

      const data = await res.json();

      setIdentity(
        data.identity || "You are becoming a disciplined builder of your future."
      );
    } catch {
      setIdentity("You are becoming a disciplined builder of your future.");
    } finally {
      setIdentityLoading(false);
    }
  }

  async function load() {
    const userId = await getUserId();
    if (!userId) return;

    const [
      profile,
      habits,
      career,
      finance,
      fitness,
      mindset,
      aiPlans,
      reviews,
    ] = await Promise.all([
      supabase.from("profiles").select("xp, level").eq("id", userId).single(),
      supabase.from("habits").select("*").eq("user_id", userId),
      supabase.from("career_tasks").select("*").eq("user_id", userId),
      supabase.from("finance_logs").select("*").eq("user_id", userId),
      supabase.from("fitness_workouts").select("*").eq("user_id", userId),
      supabase.from("mindset_entries").select("*").eq("user_id", userId),
      supabase.from("ai_insights").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
      supabase.from("weekly_reviews").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(3),
    ]);

    const h = habits.data || [];
    const c = career.data || [];
    const f = finance.data || [];
    const w = fitness.data || [];
    const m = mindset.data || [];
    const a = aiPlans.data || [];
    const r = reviews.data || [];

    const completedHabits = h.filter((x: any) => x.completed_today || x.completed);
    const missedHabits = h.filter((x: any) => !x.completed_today && !x.completed);

    const discipline = h.length
      ? Math.round((completedHabits.length / h.length) * 100)
      : 0;

    const careerRate = c.length
      ? Math.round((c.filter((x: any) => x.completed).length / c.length) * 100)
      : 0;

    const income = f
      .filter((x: any) => x.type === "income")
      .reduce((s: number, x: any) => s + Number(x.amount), 0);

    const expenses = f
      .filter((x: any) => x.type === "expense")
      .reduce((s: number, x: any) => s + Number(x.amount), 0);

    const financeRate = income
      ? Math.max(0, Math.min(100, Math.round(((income - expenses) / income) * 100)))
      : 0;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentWorkouts = w.filter((x: any) => new Date(x.created_at) >= weekAgo);
    const recentMindset = m.filter((x: any) => new Date(x.created_at) >= weekAgo);

    const fitnessRate = Math.min(100, Math.round((recentWorkouts.length / 5) * 100));
    const mindsetRate = Math.min(100, Math.round((recentMindset.length / 7) * 100));

    const highestStreak = h.length
      ? Math.max(...h.map((x: any) => Number(x.streak || 0)))
      : 0;

    const overall = Math.round(
      discipline * 0.3 +
        careerRate * 0.25 +
        financeRate * 0.25 +
        fitnessRate * 0.15 +
        mindsetRate * 0.05
    );

    const newStats = {
      overall,
      discipline,
      career: careerRate,
      finance: financeRate,
      fitness: fitnessRate,
      mindset: mindsetRate,
      xp: profile.data?.xp || 0,
      level: profile.data?.level || 1,
    };

    const identityData = {
      scores: newStats,

      habits: {
        completedToday: completedHabits.map((x: any) => x.title),
        missedToday: missedHabits.map((x: any) => x.title),
        highestStreak,
      },

      career: {
        completedTasks: c.filter((x: any) => x.completed).map((x: any) => x.title),
        pendingTasks: c.filter((x: any) => !x.completed).map((x: any) => x.title),
      },

      finance: {
        income,
        expenses,
        balance: income - expenses,
        recentLogs: f.slice(0, 5).map((x: any) => ({
          type: x.type,
          amount: x.amount,
          note: x.note,
        })),
      },

      fitness: {
        workoutsThisWeek: recentWorkouts.length,
        recentWorkouts: w.slice(0, 5).map((x: any) => x.workout_name),
      },

      mindset: {
        entriesThisWeek: recentMindset.length,
        recentMood: m.slice(0, 3).map((x: any) => ({
          gratitude: x.gratitude,
          notes: x.notes,
          mood: x.mood,
          energy: x.energy,
          stress: x.stress,
        })),
      },

      aiCoachHistory: a.map((x: any) => ({
        goal: x.goal,
        category: x.category,
        insight: x.insight,
      })),

      weeklyReviews: r.map((x: any) => ({
        wins: x.wins,
        failures: x.failures,
        nextFocus: x.next_focus,
      })),
    };

    setStats(newStats);
    generateIdentity(identityData);
  }

  return (
    <div>
      <Card className="mb-5 border border-blue-500/30 bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">
          AI Powered Identity
        </p>

        <h2 className="mt-4 text-2xl font-black leading-tight md:text-4xl">
          {identityLoading ? "Generating your identity..." : identity}
        </h2>

        <p className="mt-3 text-slate-400">
          Generated from habits, missed habits, streaks, goals, reviews, mindset,
          AI coach history and life scores.
        </p>

        <Button className="mt-5" onClick={load}>
          Regenerate Identity
        </Button>
      </Card>

      <Card>
        <p className="text-slate-400">Overall Life Score</p>
        <h2
          className={`text-7xl font-black ${
            stats.overall >= 70 ? "text-green-500" : "text-orange-500"
          }`}
        >
          {stats.overall}
        </h2>
      </Card>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {["discipline", "career", "finance", "fitness", "mindset", "xp", "level"].map((k) => (
          <Card key={k}>
            <p className="capitalize text-slate-400">{k}</p>
            <h3 className="mt-2 text-4xl font-black">{stats[k]}</h3>
          </Card>
        ))}
      </div>

      <Button className="mt-5" onClick={load}>
        Refresh
      </Button>
    </div>
  );
}

function Habits() {
  return <Crud table="habits" field="title" title="Habits" placeholder="Read 10 pages" xp={5} habitMode />;
}

function Career() {
  return <Crud table="career_tasks" field="title" title="Career" placeholder="Build one app feature" xp={20} />;
}

function Fitness() {
  return <Crud table="fitness_workouts" field="workout_name" title="Fitness" placeholder="Push day" xp={20} alwaysCompleted />;
}

function Crud({ table, field, title, placeholder, xp, habitMode = false, alwaysCompleted = false }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [value, setValue] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const userId = await getUserId();
    if (!userId) return;
    const { data } = await supabase.from(table).select("*").eq("user_id", userId).order("created_at", { ascending: false });
    setItems(data || []);
  }

  async function add() {
    const userId = await getUserId();
    if (!userId || !value.trim()) return;

    const payload: any = {
      [field]: value.trim(),
      completed: alwaysCompleted,
      user_id: userId,
    };

    if (habitMode) {
      payload.completed_today = false;
      payload.streak = 0;
    }

    const { error } = await supabase.from(table).insert(payload);
    if (error) return alert(error.message);

    if (alwaysCompleted) await addXP(xp);
    setValue("");
    load();
  }

  async function toggle(x: any) {
    const newCompleted = habitMode ? !x.completed_today : !x.completed;
    const update: any = habitMode
      ? {
          completed_today: newCompleted,
          completed: newCompleted,
          streak: newCompleted ? Number(x.streak || 0) + 1 : Math.max(0, Number(x.streak || 0) - 1),
          last_completed: newCompleted ? new Date().toISOString().split("T")[0] : x.last_completed,
        }
      : { completed: newCompleted };

    await supabase.from(table).update(update).eq("id", x.id);
    if (newCompleted) await addXP(xp);
    load();
  }

  async function remove(id: string) {
    await supabase.from(table).delete().eq("id", id);
    load();
  }

  return (
    <div>
      <h2 className="text-3xl font-black">{title}</h2>
      <Card className="mt-6">
        <Input placeholder={placeholder} value={value} onChange={(e: any) => setValue(e.target.value)} />
        <Button className="mt-4" onClick={add}>Add</Button>
      </Card>

      <div className="grid gap-4">
        {items.map((x) => {
          const done = habitMode ? x.completed_today : x.completed;
          return (
            <Card key={x.id}>
              <button className="text-left" onClick={() => toggle(x)}>
                <p className={`text-lg font-bold ${done ? "text-green-500" : "text-white"}`}>
                  {done ? "✅" : "⬜"} {x[field]}
                </p>
                {habitMode && <p className="mt-2 text-orange-400">🔥 Streak: {x.streak || 0}</p>}
              </button>
              <button className="mt-4 font-bold text-red-500" onClick={() => remove(x.id)}>Delete</button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Finance() {
  const [logs, setLogs] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const userId = await getUserId();
    if (!userId) return;
    const { data } = await supabase.from("finance_logs").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    setLogs(data || []);
  }

  async function add(type: "income" | "expense") {
    const userId = await getUserId();
    if (!userId || !amount) return;

    const { error } = await supabase.from("finance_logs").insert({ user_id: userId, amount: Number(amount), note, type });
    if (error) return alert(error.message);

    await addXP(type === "income" ? 10 : 3);
    setAmount("");
    setNote("");
    load();
  }

  async function remove(id: string) {
    await supabase.from("finance_logs").delete().eq("id", id);
    load();
  }

  const income = logs.filter((x) => x.type === "income").reduce((s, x) => s + Number(x.amount), 0);
  const expenses = logs.filter((x) => x.type === "expense").reduce((s, x) => s + Number(x.amount), 0);

  return (
    <div>
      <h2 className="text-3xl font-black">Finance</h2>

      <Card className="mt-6">
        <p className="text-slate-400">Balance</p>
        <h3 className={`text-5xl font-black ${income - expenses >= 0 ? "text-green-500" : "text-red-500"}`}>${(income - expenses).toFixed(2)}</h3>
        <p className="mt-2 text-slate-400">Income ${income.toFixed(2)} | Expenses ${expenses.toFixed(2)}</p>
      </Card>

      <Card>
        <Input placeholder="Amount" value={amount} onChange={(e: any) => setAmount(e.target.value)} />
        <Input placeholder="Note" value={note} onChange={(e: any) => setNote(e.target.value)} />
        <div className="mt-4 flex gap-3">
          <Button onClick={() => add("income")}>Income</Button>
          <Button className="bg-red-600" onClick={() => add("expense")}>Expense</Button>
        </div>
      </Card>

      <div className="grid gap-4">
        {logs.map((x) => (
          <Card key={x.id}>
            <p className={`text-2xl font-black ${x.type === "income" ? "text-green-500" : "text-red-500"}`}>
              {x.type === "income" ? "+" : "-"}${x.amount}
            </p>
            <p className="mt-2 text-slate-400">{x.note || "No note"}</p>
            <button className="mt-4 font-bold text-red-500" onClick={() => remove(x.id)}>Delete</button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Mindset() {
  const [entries, setEntries] = useState<any[]>([]);
  const [gratitude, setGratitude] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const userId = await getUserId();
    if (!userId) return;
    const { data } = await supabase.from("mindset_entries").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    setEntries(data || []);
  }

  async function add() {
    const userId = await getUserId();
    if (!userId) return;

    const { error } = await supabase.from("mindset_entries").insert({
      user_id: userId,
      gratitude,
      notes,
      mood: 8,
      energy: 8,
      stress: 3,
    });

    if (error) return alert(error.message);

    await addXP(10);
    setGratitude("");
    setNotes("");
    load();
  }

  async function remove(id: string) {
    await supabase.from("mindset_entries").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <h2 className="text-3xl font-black">Mindset</h2>
      <Card className="mt-6">
        <Input placeholder="Gratitude" value={gratitude} onChange={(e: any) => setGratitude(e.target.value)} />
        <Textarea placeholder="Mindset notes" value={notes} onChange={(e: any) => setNotes(e.target.value)} />
        <Button className="mt-4" onClick={add}>Save Entry</Button>
      </Card>

      {entries.map((x) => (
        <Card key={x.id}>
          <p className="font-bold text-white">{x.gratitude || "Mindset Entry"}</p>
          <p className="mt-2 whitespace-pre-wrap text-slate-400">{x.notes}</p>
          <button className="mt-4 font-bold text-red-500" onClick={() => remove(x.id)}>Delete</button>
        </Card>
      ))}
    </div>
  );
}

function AICoach() {
  const [goal, setGoal] = useState("");
  const [category, setCategory] = useState("career");
  const [result, setResult] = useState("");
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    const userId = await getUserId();
    if (!userId) return;
    const { data } = await supabase.from("ai_insights").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    setPlans(data || []);
  }

  async function generate() {
    if (!goal.trim()) return alert("Enter your goal first.");

    setLoading(true);
    const res = await fetch("/api/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal, category }),
    });

    const data = await res.json();
    const text = data.result || "Could not generate coaching plan.";
    setResult(text);

    const userId = await getUserId();
    if (userId) {
      const { error } = await supabase.from("ai_insights").insert({
        user_id: userId,
        goal: goal.trim(),
        category: category.trim(),
        insight: text,
      });

      if (error) alert(error.message);
      else {
        await addXP(15);
        await loadPlans();
      }
    }

    setLoading(false);
  }

  async function remove(id: string) {
    await supabase.from("ai_insights").delete().eq("id", id);
    loadPlans();
  }

  return (
    <div>
      <h2 className="text-3xl font-black">AI Coach</h2>
      <Card className="mt-6">
        <Input placeholder="Goal" value={goal} onChange={(e: any) => setGoal(e.target.value)} />
        <Input placeholder="Category" value={category} onChange={(e: any) => setCategory(e.target.value)} />
        <Button className="mt-4" disabled={loading} onClick={generate}>{loading ? "Generating..." : "Generate + Save Plan"}</Button>
      </Card>

      {result && (
        <Card>
          <h3 className="text-xl font-black">Latest Plan</h3>
          <p className="mt-4 whitespace-pre-wrap text-slate-300">{result}</p>
        </Card>
      )}

      <h3 className="mb-4 mt-8 text-2xl font-black">Saved AI Plans</h3>
      {plans.map((x) => (
        <Card key={x.id}>
          <p className="font-black text-blue-400">{x.category || "General"}</p>
          <h4 className="mt-2 text-xl font-black">{x.goal || "Saved Plan"}</h4>
          <p className="mt-3 whitespace-pre-wrap text-slate-400">{x.insight}</p>
          <button className="mt-4 font-bold text-red-500" onClick={() => remove(x.id)}>Delete</button>
        </Card>
      ))}
    </div>
  );
}

function Progress() {
  const [stats, setStats] = useState<any>({
    habitRate: 0,
    careerRate: 0,
    savingsRate: 0,
    fitnessRate: 0,
    mindsetRate: 0,
    overall: 0,
    xp: 0,
    level: 1,
    highestStreak: 0,
    aiPlans: 0,
    weeklyReviews: 0,
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const userId = await getUserId();
    if (!userId) return;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [profile, habits, career, finance, workouts, mindset, ai, reviews] = await Promise.all([
      supabase.from("profiles").select("xp, level").eq("id", userId).single(),
      supabase.from("habits").select("*").eq("user_id", userId),
      supabase.from("career_tasks").select("*").eq("user_id", userId),
      supabase.from("finance_logs").select("*").eq("user_id", userId),
      supabase.from("fitness_workouts").select("*").eq("user_id", userId),
      supabase.from("mindset_entries").select("*").eq("user_id", userId),
      supabase.from("ai_insights").select("*").eq("user_id", userId),
      supabase.from("weekly_reviews").select("*").eq("user_id", userId),
    ]);

    const h = habits.data || [];
    const c = career.data || [];
    const f = finance.data || [];
    const w = workouts.data || [];
    const m = mindset.data || [];
    const a = ai.data || [];
    const r = reviews.data || [];

    const habitRate = h.length ? Math.round((h.filter((x: any) => x.completed_today || x.completed).length / h.length) * 100) : 0;
    const careerRate = c.length ? Math.round((c.filter((x: any) => x.completed).length / c.length) * 100) : 0;

    const income = f.filter((x: any) => x.type === "income").reduce((s: number, x: any) => s + Number(x.amount), 0);
    const expenses = f.filter((x: any) => x.type === "expense").reduce((s: number, x: any) => s + Number(x.amount), 0);
    const savingsRate = income ? Math.max(0, Math.min(100, Math.round(((income - expenses) / income) * 100))) : 0;

    const fitnessRate = Math.min(100, Math.round((w.filter((x: any) => new Date(x.created_at) >= weekAgo).length / 5) * 100));
    const mindsetRate = Math.min(100, Math.round((m.filter((x: any) => new Date(x.created_at) >= weekAgo).length / 7) * 100));
    const highestStreak = h.length ? Math.max(...h.map((x: any) => Number(x.streak || 0))) : 0;
    const overall = Math.round(habitRate * 0.3 + careerRate * 0.25 + savingsRate * 0.25 + fitnessRate * 0.15 + mindsetRate * 0.05);

    setStats({
      habitRate,
      careerRate,
      savingsRate,
      fitnessRate,
      mindsetRate,
      overall,
      xp: profile.data?.xp || 0,
      level: profile.data?.level || 1,
      highestStreak,
      aiPlans: a.length,
      weeklyReviews: r.length,
    });
  }

  return (
    <div>
      <h2 className="text-3xl font-black">Progress</h2>
      <Card className="mt-6">
        <p className="text-slate-400">Overall Progress</p>
        <h3 className={`text-7xl font-black ${stats.overall >= 70 ? "text-green-500" : "text-orange-500"}`}>{stats.overall}</h3>
      </Card>

      <Card>
        <ProgressBar label="Daily Discipline" value={stats.habitRate} />
        <ProgressBar label="Career Execution" value={stats.careerRate} />
        <ProgressBar label="Savings Rate" value={stats.savingsRate} />
        <ProgressBar label="Weekly Fitness" value={stats.fitnessRate} />
        <ProgressBar label="Mindset Consistency" value={stats.mindsetRate} />
      </Card>

      <Card>
        <h3 className="text-2xl font-black">Life OS Stats</h3>
        <p className="mt-4 leading-8 text-slate-400">
          XP: {stats.xp}<br />
          Level: {stats.level}<br />
          Highest Streak: {stats.highestStreak}<br />
          AI Coach Plans: {stats.aiPlans}<br />
          Weekly Reviews: {stats.weeklyReviews}
        </p>
      </Card>

      <Button onClick={load}>Refresh Progress</Button>
    </div>
  );
}

function Achievements() {
  const [list, setList] = useState<any[]>([]);
  const [summary, setSummary] = useState({ unlocked: 0, total: 0, percent: 0 });

  function pct(current: number, target: number) {
    return calcPercent(current, target);
  }

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const userId = await getUserId();
    if (!userId) return;

    const [profile, habits, workouts, career, finance, ai, reviews, mindset] = await Promise.all([
      supabase.from("profiles").select("xp, level").eq("id", userId).single(),
      supabase.from("habits").select("*").eq("user_id", userId),
      supabase.from("fitness_workouts").select("*").eq("user_id", userId),
      supabase.from("career_tasks").select("*").eq("user_id", userId),
      supabase.from("finance_logs").select("*").eq("user_id", userId),
      supabase.from("ai_insights").select("*").eq("user_id", userId),
      supabase.from("weekly_reviews").select("*").eq("user_id", userId),
      supabase.from("mindset_entries").select("*").eq("user_id", userId),
    ]);

    const h = habits.data || [];
    const w = workouts.data || [];
    const c = career.data || [];
    const f = finance.data || [];
    const a = ai.data || [];
    const r = reviews.data || [];
    const m = mindset.data || [];
    const xp = Number(profile.data?.xp || 0);
    const level = Number(profile.data?.level || 1);
    const completedHabits = h.filter((x: any) => x.completed_today || x.completed).length;
    const highestStreak = h.length ? Math.max(...h.map((x: any) => Number(x.streak || 0))) : 0;
    const completedCareer = c.filter((x: any) => x.completed).length;
    const income = f.filter((x: any) => x.type === "income").reduce((sum: number, x: any) => sum + Number(x.amount), 0);
    const expenses = f.filter((x: any) => x.type === "expense").reduce((sum: number, x: any) => sum + Number(x.amount), 0);

    const generated = [
      ["✅ First Habit", `${h.length}/1 habits created`, h.length >= 1, pct(h.length, 1)],
      ["🧠 Discipline Starter", `${completedHabits}/10 habits completed`, completedHabits >= 10, pct(completedHabits, 10)],
      ["🔥 7 Day Streak", `${highestStreak}/7 highest streak`, highestStreak >= 7, pct(highestStreak, 7)],
      ["🏋️ First Workout", `${w.length}/1 workouts logged`, w.length >= 1, pct(w.length, 1)],
      ["💪 Fitness Warrior", `${w.length}/10 workouts logged`, w.length >= 10, pct(w.length, 10)],
      ["🚀 Career Builder", `${completedCareer}/10 career tasks completed`, completedCareer >= 10, pct(completedCareer, 10)],
      ["💰 Money Tracker", `${f.length}/5 finance logs added`, f.length >= 5, pct(f.length, 5)],
      ["📈 Positive Cashflow", `Income $${income.toFixed(2)} vs Expenses $${expenses.toFixed(2)}`, income > expenses && income > 0, income > expenses && income > 0 ? 100 : 0],
      ["🤖 First AI Plan", `${a.length}/1 AI plans generated`, a.length >= 1, pct(a.length, 1)],
      ["🧬 AI Strategist", `${a.length}/5 AI plans generated`, a.length >= 5, pct(a.length, 5)],
      ["📅 Weekly Reviewer", `${r.length}/1 weekly reviews completed`, r.length >= 1, pct(r.length, 1)],
      ["🧘 Mindset Builder", `${m.length}/10 mindset entries`, m.length >= 10, pct(m.length, 10)],
      ["💎 500 XP", `${xp}/500 XP earned`, xp >= 500, pct(xp, 500)],
      ["🏆 Level 5", `Level ${level}/5 reached`, level >= 5, pct(level, 5)],
    ].map(([title, description, unlocked, progress], i) => ({
      id: i,
      title,
      description,
      unlocked,
      progress,
    }));

    const unlocked = generated.filter((x: any) => x.unlocked).length;
    setList(generated);
    setSummary({ unlocked, total: generated.length, percent: Math.round((unlocked / generated.length) * 100) });
  }

  return (
    <div>
      <h2 className="text-3xl font-black">Achievements</h2>
      <Card className="mt-6">
        <p className="text-slate-400">Achievement Progress</p>
        <h3 className={`text-6xl font-black ${summary.percent >= 70 ? "text-green-500" : "text-orange-500"}`}>{summary.percent}%</h3>
        <p className="text-slate-400">{summary.unlocked} of {summary.total} unlocked</p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {list.map((x) => (
          <Card key={x.id}>
            <h3 className={`text-xl font-black ${x.unlocked ? "text-green-500" : "text-slate-400"}`}>
              {x.unlocked ? "✅ " : "🔒 "} {x.title}
            </h3>
            <p className="mt-2 text-slate-400">{x.description}</p>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
              <div className={`h-3 rounded-full ${x.unlocked ? "bg-green-500" : "bg-blue-600"}`} style={{ width: `${x.progress}%` }} />
            </div>
            <p className="mt-2 text-slate-500">{x.progress}% complete</p>
          </Card>
        ))}
      </div>

      <Button className="mt-5" onClick={load}>Refresh Achievements</Button>
    </div>
  );
}

function WeeklyReview() {
  const [wins, setWins] = useState("");
  const [failures, setFailures] = useState("");
  const [nextFocus, setNextFocus] = useState("");

  async function save() {
    const userId = await getUserId();
    if (!userId) return;

    const { error } = await supabase.from("weekly_reviews").insert({
      user_id: userId,
      wins,
      failures,
      next_focus: nextFocus,
    });

    if (error) return alert(error.message);

    await addXP(50);
    setWins("");
    setFailures("");
    setNextFocus("");
    alert("Weekly review saved.");
  }

  return (
    <div>
      <h2 className="text-3xl font-black">Weekly Review</h2>
      <Card className="mt-6">
        <Textarea placeholder="Wins this week" value={wins} onChange={(e: any) => setWins(e.target.value)} />
        <Textarea placeholder="Failures / lessons" value={failures} onChange={(e: any) => setFailures(e.target.value)} />
        <Textarea placeholder="Next week focus" value={nextFocus} onChange={(e: any) => setNextFocus(e.target.value)} />
        <Button className="mt-4" onClick={save}>Save Review +50 XP</Button>
      </Card>
    </div>
  );
}
