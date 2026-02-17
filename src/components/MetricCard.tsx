import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface MetricCardProps {
    label: string;
    value: number;
    icon?: LucideIcon;
    logoUrl?: string;
    color: string;
    delay?: number;
    onClick?: () => void;
}

export function MetricCard({ label, value, icon: Icon, logoUrl, color, delay = 0, onClick }: MetricCardProps) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const duration = 800;
        const steps = 30;
        const increment = value / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                setDisplayValue(value);
                clearInterval(timer);
            } else {
                setDisplayValue(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            onClick={onClick}
            className="card-metric card-hover p-6 text-left cursor-pointer overflow-hidden"
        >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent opacity-80" />

            <div className="flex items-center gap-4 mb-2">
                <div className={`w-12 h-12 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center ${color} shadow-sm overflow-hidden transition-transform duration-250 group-hover:scale-105`}>
                    {logoUrl ? (
                        <img src={logoUrl} alt={label} className="w-8 h-8 object-contain" />
                    ) : Icon ? (
                        <Icon className="h-6 w-6" />
                    ) : null}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="metric-value text-foreground mb-0 animate-count-up">{displayValue}</div>
                    <div className="metric-label text-muted-foreground mt-1">{label}</div>
                </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250" />
        </motion.button>
    );
}
