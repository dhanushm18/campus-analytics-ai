import { useState, useEffect } from 'react';
import { CheckCircle, X, ChevronsUpDown, Zap, Building2, Briefcase, Code2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { companyService } from '@/services/companyService';
import { type ComparisonCompany, type ComparisonSkill } from '@/utils/comparisonEngine';
import { toast } from '@/components/ui/sonner';
import { CompanyShort } from "@/data";
import { cn } from "@/lib/utils";

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
                toast.warning("Select up to 3 companies");
                return;
            }
            setSelectedIds([...selectedIds, id]);
        }
    };

    // Calculate common skills for the simplified view
    const topSkills = Array.from(new Set(
        comparisonData.flatMap(c => c.skills.slice(0, 5).map(s => s.skillName))
    )).slice(0, 8); // Take top 8 unique skills from the selected companies

    return (
        <div className="space-y-8 animate-fade-in pb-20 max-w-7xl mx-auto px-4 md:px-8 pt-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Compare Companies</h1>
                    <p className="text-muted-foreground mt-1">
                        Analyze hiring structures and technical requirements side-by-side.
                    </p>
                </div>

                {/* Compact Selector */}
                <div className="w-full md:w-auto min-w-[300px]">
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-full justify-between h-10 border-input bg-background/50 backdrop-blur-sm"
                            >
                                {selectedIds.length > 0
                                    ? `${selectedIds.length} Companies Selected`
                                    : "Add company to compare..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="end">
                            <Command>
                                <CommandInput placeholder="Search company..." />
                                <CommandList>
                                    <CommandEmpty>No company found.</CommandEmpty>
                                    <CommandGroup>
                                        {allCompanies.map((company) => (
                                            <CommandItem
                                                key={company.company_id}
                                                value={company.name}
                                                onSelect={() => toggleSelection(company.company_id)}
                                            >
                                                <div className={cn(
                                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                    selectedIds.includes(company.company_id)
                                                        ? "bg-primary text-primary-foreground"
                                                        : "opacity-50 [&_svg]:invisible"
                                                )}>
                                                    <CheckCircle className="h-4 w-4" />
                                                </div>
                                                {company.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {loading ? (
                <div className="h-96 flex flex-col items-center justify-center text-muted-foreground bg-muted/5 rounded-xl border border-border/50">
                    <Zap className="h-8 w-8 text-primary animate-pulse mb-3" />
                    <p>Loading comparison data...</p>
                </div>
            ) : comparisonData.length === 0 ? (
                <div className="h-96 flex flex-col items-center justify-center text-muted-foreground/60 bg-muted/5 rounded-xl border border-dashed border-border/50">
                    <Building2 className="h-12 w-12 mb-4 opacity-20" />
                    <p className="text-lg font-medium text-foreground/80">No Companies Selected</p>
                    <p className="text-sm mt-1">Select companies from the dropdown to view the comparison table.</p>
                </div>
            ) : (
                <div className="border border-border rounded-xl overflow-hidden bg-background shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b border-border bg-muted/30">
                                    <th className="p-6 font-semibold min-w-[200px] w-1/4 text-muted-foreground">Feature</th>
                                    {comparisonData.map(c => (
                                        <th key={c.id} className="p-6 font-bold text-foreground min-w-[250px] align-top">
                                            <div className="flex items-center gap-3 mb-2">
                                                {c.logo_url ? (
                                                    <img src={c.logo_url} alt={c.name} className="h-10 w-10 object-contain rounded-md bg-white p-1 shadow-sm" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                        {c.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-lg leading-tight">{c.name}</div>
                                                    <Badge variant="secondary" className="mt-1 text-[10px] h-5 font-normal text-muted-foreground">
                                                        {c.category}
                                                    </Badge>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="ml-auto h-6 w-6 text-muted-foreground hover:text-destructive"
                                                    onClick={() => toggleSelection(c.id)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {/* Section: Business Profile */}
                                <tr className="bg-muted/5">
                                    <td className="p-4 font-semibold text-muted-foreground/80 uppercase text-xs tracking-wider" colSpan={comparisonData.length + 1}>
                                        Business Profile
                                    </td>
                                </tr>
                                <tr>
                                    <td className="p-6 font-medium text-muted-foreground flex items-center gap-2">
                                        <Building2 className="h-4 w-4" /> Focus Area
                                    </td>
                                    {comparisonData.map(c => (
                                        <td key={c.id} className="p-6 align-top">
                                            <p className="font-medium text-foreground">{c.innovation.focusArea}</p>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-6 font-medium text-muted-foreground flex items-center gap-2">
                                        <Zap className="h-4 w-4" /> Strategic Pillar
                                    </td>
                                    {comparisonData.map(c => (
                                        <td key={c.id} className="p-6 align-top text-muted-foreground">
                                            {c.innovation.pillar}
                                        </td>
                                    ))}
                                </tr>

                                {/* Section: Hiring Process */}
                                <tr className="bg-muted/5">
                                    <td className="p-4 font-semibold text-muted-foreground/80 uppercase text-xs tracking-wider" colSpan={comparisonData.length + 1}>
                                        Hiring Process
                                    </td>
                                </tr>
                                <tr>
                                    <td className="p-6 font-medium text-muted-foreground flex items-center gap-2">
                                        <Briefcase className="h-4 w-4" /> Total Rounds
                                    </td>
                                    {comparisonData.map(c => (
                                        <td key={c.id} className="p-6 align-top">
                                            <Badge variant="outline" className="font-bold text-base px-3 py-1 bg-background">
                                                {c.hiringMethod.totalRounds} Rounds
                                            </Badge>
                                        </td>
                                    ))}
                                </tr>


                                {/* Section: Technology */}
                                <tr className="bg-muted/5">
                                    <td className="p-4 font-semibold text-muted-foreground/80 uppercase text-xs tracking-wider" colSpan={comparisonData.length + 1}>
                                        Technology
                                    </td>
                                </tr>
                                <tr>
                                    <td className="p-6 font-medium text-muted-foreground flex items-center gap-2">
                                        <Code2 className="h-4 w-4" /> Tech Stack
                                    </td>
                                    {comparisonData.map(c => (
                                        <td key={c.id} className="p-6 align-top">
                                            <div className="flex flex-wrap gap-1.5">
                                                {c.innovation.techStack.map(tech => (
                                                    <Badge key={tech} variant="secondary" className="font-normal border-border/50">
                                                        {tech}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-6 font-medium text-muted-foreground border-b-0">
                                        Top Skills
                                    </td>
                                    {comparisonData.map(c => (
                                        <td key={c.id} className="p-6 align-top border-b-0">
                                            <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                                {c.skills.slice(0, 4).map(skill => (
                                                    <li key={skill.skillName}>
                                                        <span className="text-foreground">{skill.skillName}</span>
                                                        <span className="text-xs ml-1 opacity-50">({skill.proficiencyLevel})</span>
                                                    </li>
                                                ))}
                                                {c.skills.length > 4 && (
                                                    <li className="list-none text-xs italic pt-1 text-muted-foreground/70">
                                                        + {c.skills.length - 4} more
                                                    </li>
                                                )}
                                            </ul>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
