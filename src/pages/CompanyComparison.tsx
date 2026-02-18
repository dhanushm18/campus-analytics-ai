import { useState, useEffect } from 'react';
import { CheckCircle, X, ChevronsUpDown, Zap, Building2, Briefcase, Code2, Users, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { companyService } from '@/services/companyService';
import { type ComparisonCompany, type ComparisonSkill } from '@/utils/comparisonEngine';
import { toast } from '@/components/ui/sonner';
import { CompanyShort } from "@/data";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';

export default function CompanyComparison() {
    const [open, setOpen] = useState(false);
    const [allCompanies, setAllCompanies] = useState<CompanyShort[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [comparisonData, setComparisonData] = useState<ComparisonCompany[]>([]);
    const [loading, setLoading] = useState(false);

    // Load list of companies for the dropdown
    useEffect(() => {
        async function loadList() {
            const { data } = await companyService.getAllCompanies();
            setAllCompanies(data || []);
        }
        loadList();
    }, []);

    // Fetch detailed data when selection changes
    useEffect(() => {
        async function fetchDetails() {
            if (selectedIds.length === 0) {
                setComparisonData([]);
                return;
            }

            setLoading(true);
            try {
                // 1. Fetch Rich Comparison Details
                const { data: richDetails, error } = await companyService.getCompanyComparisonDetails(selectedIds);

                if (error) throw error;

                // 2. Process Data (Skills fetching preserved if needed, but display simplified)
                const enrichedData: ComparisonCompany[] = await Promise.all(
                    richDetails.map(async (comp: any) => {
                        const { data: skillsData } = await companyService.getCompanySkillsRelational(comp.company_id);

                        const skills: ComparisonSkill[] = skillsData.map((s: any) => ({
                            skillName: s.name,
                            rating: (s.stage * 2) || 5,
                            proficiencyLevel: s.level_code || 'AP',
                            proficiencyWeight: s.stage || 2
                        }));

                        return {
                            id: comp.company_id,
                            name: comp.name,
                            category: comp.category,
                            logo_url: comp.logo_url,
                            skills,
                            hiringMethod: {
                                totalRounds: comp.total_rounds,
                                codingRounds: comp.coding_rounds,
                                systemDesignRounds: comp.sys_design_rounds,
                                hrRounds: comp.hr_rounds,
                                aptitudeRounds: comp.total_rounds - comp.coding_rounds - comp.sys_design_rounds - comp.hr_rounds
                            },
                            innovation: {
                                focusArea: comp.focus_area,
                                techStack: comp.tech_stack,
                                pillar: comp.strategic_pillar
                            }
                        };
                    })
                );

                // Sort to maintain selection order
                const sortedData = selectedIds.map(id => enrichedData.find(c => c.id === id)).filter(Boolean) as ComparisonCompany[];
                setComparisonData(sortedData);

            } catch (err) {
                console.error(err);
                toast.error("Failed to load company details");
            } finally {
                setLoading(false);
            }
        }

        fetchDetails();
    }, [selectedIds]);

    const toggleSelection = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            if (selectedIds.length >= 3) {
                toast.warning("Select up to 3 companies for best viewing experience");
                return;
            }
            setSelectedIds([...selectedIds, id]);
        }
    };

    return (
        <div className="min-h-screen bg-background animate-fade-in pb-20 pt-6 px-4 md:px-8 max-w-[1600px] mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">Compare Companies</h1>
                    <p className="text-lg text-muted-foreground mt-2 max-w-xl">
                        Select up to 3 companies to analyze their hiring process, tech stack, and innovation focus side-by-side.
                    </p>
                </div>

                {/* Compact Selector */}
                <div className="w-full md:w-auto min-w-[320px]">
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-full justify-between h-12 text-base px-4 border-primary/20 bg-background hover:bg-muted/50 transition-all shadow-sm"
                            >
                                {selectedIds.length > 0
                                    ? `${selectedIds.length} Companies Selected`
                                    : "Select companies..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[320px] p-0" align="end">
                            <Command>
                                <CommandInput placeholder="Search company..." className="h-10" />
                                <CommandList>
                                    <CommandEmpty>No company found.</CommandEmpty>
                                    <CommandGroup heading="Available Companies">
                                        {allCompanies.map((company) => (
                                            <CommandItem
                                                key={company.company_id}
                                                value={company.name}
                                                onSelect={() => toggleSelection(company.company_id)}
                                                className="cursor-pointer py-2"
                                            >
                                                <div className={cn(
                                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary transition-all",
                                                    selectedIds.includes(company.company_id)
                                                        ? "bg-primary text-primary-foreground"
                                                        : "opacity-50 [&_svg]:invisible"
                                                )}>
                                                    <CheckCircle className="h-3 w-3" />
                                                </div>
                                                <span className="font-medium">{company.name}</span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <p className="text-xs text-muted-foreground mt-2 text-right">
                        {selectedIds.length}/3 selected
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="h-[500px] flex flex-col items-center justify-center text-muted-foreground bg-muted/5 rounded-3xl border border-border/50">
                    <Zap className="h-10 w-10 text-primary animate-pulse mb-4" />
                    <p className="text-lg font-medium">Analyzing data...</p>
                </div>
            ) : comparisonData.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-[500px] flex flex-col items-center justify-center bg-gradient-to-br from-muted/20 to-background rounded-3xl border border-dashed border-border/60 text-center px-4"
                >
                    <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
                        <Plus className="h-10 w-10 text-primary/40" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Start Comparison</h2>
                    <p className="text-muted-foreground max-w-sm mb-8">
                        Choose companies from the dropdown above to see a detailed breakdown of their differences.
                    </p>
                    <Button onClick={() => setOpen(true)} className="px-8 shadow-lg shadow-primary/20">
                        Add Company
                    </Button>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border border-border/60 rounded-3xl overflow-hidden bg-background shadow-lg shadow-black/5"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/10">
                                    <th className="p-6 font-semibold min-w-[200px] w-1/5 text-muted-foreground border-b border-border/50 sticky left-0 bg-background/95 backdrop-blur z-10">

                                    </th>
                                    {comparisonData.map(c => (
                                        <th key={c.id} className="p-6 min-w-[300px] align-top border-b border-border/50 border-l border-border/30 first:border-l-0">
                                            <div className="flex flex-col gap-4">
                                                <div className="flex justify-between items-start">
                                                    {c.logo_url ? (
                                                        <img src={c.logo_url} alt={c.name} className="h-12 w-12 object-contain rounded-lg bg-white p-1 shadow-sm border border-border/20" />
                                                    ) : (
                                                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                                                            {c.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => toggleSelection(c.id)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div>
                                                    <div className="text-xl font-bold text-foreground">{c.name}</div>
                                                    <Badge variant="secondary" className="mt-2 font-normal">
                                                        {c.category}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {/* Section: Business Profile */}
                                <tr className="bg-muted/30">
                                    <td className="px-6 py-3 font-bold text-xs uppercase tracking-wider text-muted-foreground" colSpan={comparisonData.length + 1}>
                                        Strategic Focus
                                    </td>
                                </tr>
                                <tr>
                                    <td className="p-6 font-medium text-muted-foreground sticky left-0 bg-background border-r border-border/30">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-primary" /> Focus Area
                                        </div>
                                    </td>
                                    {comparisonData.map(c => (
                                        <td key={c.id} className="p-6 align-top border-l border-border/30">
                                            <p className="font-medium text-foreground">{c.innovation.focusArea}</p>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-6 font-medium text-muted-foreground sticky left-0 bg-background border-r border-border/30">
                                        <div className="flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-primary" /> Key Pillar
                                        </div>
                                    </td>
                                    {comparisonData.map(c => (
                                        <td key={c.id} className="p-6 align-top border-l border-border/30 text-muted-foreground text-sm leading-relaxed">
                                            "{c.innovation.pillar}"
                                        </td>
                                    ))}
                                </tr>

                                {/* Section: Hiring Process */}
                                <tr className="bg-muted/30">
                                    <td className="px-6 py-3 font-bold text-xs uppercase tracking-wider text-muted-foreground" colSpan={comparisonData.length + 1}>
                                        Hiring Details
                                    </td>
                                </tr>
                                <tr>
                                    <td className="p-6 font-medium text-muted-foreground sticky left-0 bg-background border-r border-border/30">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="h-4 w-4 text-primary" /> Total Rounds
                                        </div>
                                    </td>
                                    {comparisonData.map(c => (
                                        <td key={c.id} className="p-6 align-top border-l border-border/30">
                                            <Badge variant="outline" className="text-base px-3 py-1 border-primary/20 bg-primary/5 text-primary">
                                                {c.hiringMethod.totalRounds} Rounds
                                            </Badge>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-6 font-medium text-muted-foreground sticky left-0 bg-background border-r border-border/30">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-primary" /> Breakdown
                                        </div>
                                    </td>
                                    {comparisonData.map(c => (
                                        <td key={c.id} className="p-6 align-top border-l border-border/30">
                                            <div className="space-y-1 text-sm text-muted-foreground">
                                                {c.hiringMethod.codingRounds > 0 && <div className="flex justify-between"><span>Coding:</span> <span className="font-medium text-foreground">{c.hiringMethod.codingRounds}</span></div>}
                                                {c.hiringMethod.systemDesignRounds > 0 && <div className="flex justify-between"><span>System Design:</span> <span className="font-medium text-foreground">{c.hiringMethod.systemDesignRounds}</span></div>}
                                                {c.hiringMethod.hrRounds > 0 && <div className="flex justify-between"><span>HR/Behavioral:</span> <span className="font-medium text-foreground">{c.hiringMethod.hrRounds}</span></div>}
                                            </div>
                                        </td>
                                    ))}
                                </tr>


                                {/* Section: Technology */}
                                <tr className="bg-muted/30">
                                    <td className="px-6 py-3 font-bold text-xs uppercase tracking-wider text-muted-foreground" colSpan={comparisonData.length + 1}>
                                        Tech Stack
                                    </td>
                                </tr>
                                <tr>
                                    <td className="p-6 font-medium text-muted-foreground sticky left-0 bg-background border-r border-border/30">
                                        <div className="flex items-center gap-2">
                                            <Code2 className="h-4 w-4 text-primary" /> Technologies
                                        </div>
                                    </td>
                                    {comparisonData.map(c => (
                                        <td key={c.id} className="p-6 align-top border-l border-border/30">
                                            <div className="flex flex-wrap gap-2">
                                                {c.innovation.techStack.map(tech => (
                                                    <Badge key={tech} variant="secondary" className="font-normal bg-background border border-border/50 text-foreground/80">
                                                        {tech}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                                <tr className="border-b-0">
                                    <td className="p-6 font-medium text-muted-foreground sticky left-0 bg-background border-r border-border/30 border-b-0">
                                        Top Skills
                                    </td>
                                    {comparisonData.map(c => (
                                        <td key={c.id} className="p-6 align-top border-l border-border/30 border-b-0">
                                            <div className="space-y-2">
                                                {c.skills.slice(0, 5).map((skill, i) => (
                                                    <div key={i} className="flex justify-between items-center text-sm">
                                                        <span className="text-foreground/90">{skill.skillName}</span>
                                                        <span className="text-xs text-muted-foreground">{skill.proficiencyLevel}</span>
                                                    </div>
                                                ))}
                                                {c.skills.length > 5 && (
                                                    <div className="text-xs text-muted-foreground italic pt-2">
                                                        + {c.skills.length - 5} more
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
