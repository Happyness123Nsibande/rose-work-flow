import { useCallback, useEffect, useState } from "react";

export type Task = {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  deadline: string;
  done: boolean;
  createdAt: number;
};

export type Activity = {
  id: string;
  tool: string;
  label: string;
  at: number;
};

export type Settings = {
  theme: "light" | "dark";
  notifications: boolean;
  deadlineAlerts: boolean;
  responseLength: "concise" | "balanced" | "detailed";
  autoCopy: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  theme: "light",
  notifications: true,
  deadlineAlerts: true,
  responseLength: "balanced",
  autoCopy: false,
};

const KEYS = {
  tasks: "workmate.tasks",
  activity: "workmate.activity",
  settings: "workmate.settings",
  chat: "workmate.chat",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
  window.dispatchEvent(new CustomEvent("workmate-store", { detail: key }));
}

/** Hydration-safe localStorage-backed state. */
function usePersisted<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    setValue(read<T>(key, fallback));
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail || detail === key) setValue(read<T>(key, fallback));
    };
    window.addEventListener("workmate-store", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("workmate-store", onChange);
      window.removeEventListener("storage", onChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        write(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return [value, update] as const;
}

export function useTasks() {
  const [tasks, setTasks] = usePersisted<Task[]>(KEYS.tasks, []);

  const addTask = (task: Omit<Task, "id" | "createdAt" | "done">) =>
    setTasks((prev) => [
      ...prev,
      { ...task, id: crypto.randomUUID(), createdAt: Date.now(), done: false },
    ]);
  const toggleTask = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const removeTask = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));
  const clearTasks = () => setTasks([]);

  return { tasks, addTask, toggleTask, removeTask, clearTasks, setTasks };
}

export function useActivity() {
  const [activity, setActivity] = usePersisted<Activity[]>(KEYS.activity, []);
  const clearActivity = () => setActivity([]);
  return { activity, clearActivity };
}

export function logActivity(tool: string, label: string) {
  const current = read<Activity[]>(KEYS.activity, []);
  const next = [
    { id: crypto.randomUUID(), tool, label: label.slice(0, 90), at: Date.now() },
    ...current,
  ].slice(0, 25);
  write(KEYS.activity, next);
}

export function useSettings() {
  const [settings, setSettings] = usePersisted<Settings>(KEYS.settings, DEFAULT_SETTINGS);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", settings.theme === "dark");
  }, [settings.theme]);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  return { settings, update, reset: () => setSettings(DEFAULT_SETTINGS) };
}

export function getResponseLength(): string {
  const s = read<Settings>(KEYS.settings, DEFAULT_SETTINGS);
  return s.responseLength;
}

export type ChatMessage = { id: string; role: "user" | "assistant"; content: string };

export function useChatHistory() {
  return usePersisted<ChatMessage[]>(KEYS.chat, []);
}

export function clearAllHistory() {
  write(KEYS.chat, []);
  write(KEYS.activity, []);
}

export function relativeTime(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}
