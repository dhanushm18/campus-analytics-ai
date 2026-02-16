import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface MetricCardProps {
    label: string;
    value: number;
    icon: LucideIcon;
    color: string;
    delay?: number;
    onClick?: () => void;
}

export function MetricCard({ label, value, icon: Icon, color, delay = 0, onClick }: MetricCardProps) {
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
            transition={{ delay, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            onClick={onClick}
            className="group relative rounded-xl border border-border/50 bg-card p-6 text-left transition-all duration-250 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20 cursor-pointer overflow-hidden"
        >
            {/* Gradient top border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent opacity-80" />

            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color} transition-transform duration-250 group-hover:scale-110`}>
                <Icon className="h-6 w-6" />
            </div>

            {/* Value */}
            <div className="metric-value text-foreground mb-1 animate-count-up">
                {displayValue}
            </div>

            {/* Label */}
            <div className="text-sm font-medium text-muted-foreground">
                {label}
            </div>

            {/* Hover glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250" />
        </motion.button>
    );
}
