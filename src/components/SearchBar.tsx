import { Search, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";

interface SearchResult {
    id: number;
    title: string;
    subtitle: string;
    category?: string;
}

interface SearchBarProps {
    placeholder?: string;
    results: SearchResult[];
    onSelect: (result: SearchResult) => void;
    onSearchChange: (value: string) => void;
    value: string;
}

export function SearchBar({ placeholder, results, onSelect, onSearchChange, value }: SearchBarProps) {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="relative w-full max-w-2xl mx-auto">
            <motion.div
                initial={false}
                animate={{
                    boxShadow: isFocused
                        ? "0 10px 40px -10px rgba(0, 0, 0, 0.1), 0 0 0 2px hsl(var(--primary) / 0.15)"
                        : "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
                }}
                transition={{ duration: 0.2 }}
                className="relative rounded-xl bg-card border border-border/50 overflow-hidden"
            >
                <div className="flex items-center px-4">
                    <Search className={`h-5 w-5 transition-colors duration-200 ${isFocused ? 'text-primary' : 'text-muted-foreground'}`} />
                    <Input
                        ref={inputRef}
                        type="text"
                        placeholder={placeholder || "Search..."}
                        value={value}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                        className="border-0 bg-transparent h-14 text-base focus-visible:ring-0 focus-visible:ring-offset-0 px-3"
                    />
                    {value && (
                        <button
                            onClick={() => onSearchChange("")}
                            className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                    )}
                </div>
            </motion.div>

            <AnimatePresence>
                {results.length > 0 && value && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 w-full mt-2 bg-card border border-border/50 rounded-xl shadow-xl overflow-hidden"
                    >
                        <div className="max-h-80 overflow-y-auto scrollbar-thin">
                            {results.map((result, index) => (
                                <motion.button
                                    key={result.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.03 }}
                                    onClick={() => {
                                        onSelect(result);
                                        onSearchChange("");
                                    }}
                                    className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-muted/50 transition-colors text-left border-b border-border/30 last:border-0"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-semibold text-sm text-primary">
                                        {result.title.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm text-foreground truncate">{result.title}</div>
                                        <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                                    </div>
                                    {result.category && (
                                        <div className="px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                                            {result.category}
                                        </div>
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
