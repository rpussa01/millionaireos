import { supabase } from "./supabase";

export async function getUserId() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id;
}

export async function addXP(amount: number) {
  const userId = await getUserId();
  if (!userId) return;

  const { data } = await supabase
    .from("profiles")
    .select("xp, level")
    .eq("id", userId)
    .single();

  const newXp = Number(data?.xp || 0) + amount;
  const newLevel = Math.floor(newXp / 100) + 1;

  await supabase
    .from("profiles")
    .update({ xp: newXp, level: newLevel })
    .eq("id", userId);
}

export function calcPercent(current: number, target: number) {
  if (!target) return 0;
  return Math.min(100, Math.max(0, Math.round((current / target) * 100)));
}
