import { motion } from "framer-motion";
import { MapPin, Users, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { getCompanyLogo } from "@/lib/logoUtils";

interface CompanyCardProps {
    company: {
        company_id: number;
        name: string;
        short_name: string;
        category: string;
        office_locations?: string;
        employee_size?: string;
        logo_url?: string;
    };
    onClick: () => void;
    delay?: number;
}

const categoryColors: Record<string, string> = {
    Marquee: "bg-red-50 text-red-700 border-red-200",
    SuperDream: "bg-purple-50 text-purple-700 border-purple-200",
    Dream: "bg-teal-50 text-teal-700 border-teal-200",
    Regular: "bg-gray-50 text-gray-700 border-gray-200",
    Enterprise: "bg-orange-50 text-orange-700 border-orange-200",
};

export function CompanyCard({ company, onClick, delay = 0 }: CompanyCardProps) {
    const categoryColor = categoryColors[company.category] || "bg-gray-50 text-gray-700 border-gray-200";

    const [imgError, setImgError] = useState(false);
    const logo = getCompanyLogo(company);

    return (
        <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            onClick={onClick}
            className="group w-full text-left card-premium p-6 transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer relative overflow-hidden"
        >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250" />

            {/* Content */}
            <div className="relative">
                {/* Logo and Name */}
                <div className="flex items-start gap-4 mb-4">
                    {(logo && !imgError) ? (
                        <div className="w-14 h-14 rounded-full border border-border/10 bg-white/70 p-2 flex items-center justify-center shrink-0 transition-transform duration-250 group-hover:scale-105">
                            <img
                                src={logo}
                                alt={company.name}
                                className="w-full h-full object-contain rounded-full"
                                onError={() => setImgError(true)}
                            />
                        </div>
                    ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center font-semibold text-xl text-primary shrink-0 transition-transform duration-250 group-hover:scale-105">
                            {company.short_name.charAt(0)}
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-base text-foreground truncate mb-1.5 group-hover:text-primary transition-colors">
                            {company.name}
                        </h3>
                        <Badge variant="outline" className={`text-xs font-medium ${categoryColor} px-2 py-1 rounded-full` }>
                            {company.category}
                        </Badge>
                    </div>
                </div>

                {/* Metadata */}
                <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="truncate">{company.office_locations?.split(";")[0] || "Global"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 shrink-0" />
                        <span>{company.employee_size || "N/A"}</span>
                    </div>
                </div>
            </div>

            {/* Hover indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-250" />
        </motion.button>
    );
}
