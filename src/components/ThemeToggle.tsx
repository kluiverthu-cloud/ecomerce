"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === "light" ? "Activar modo oscuro" : "Activar modo claro"}
        >
            {theme === "light" ? (
                <Moon size={22} className="text-slate-700" />
            ) : (
                <Sun size={22} className="text-yellow-400" />
            )}
        </button>
    );
}
