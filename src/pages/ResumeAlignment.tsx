import { useState } from 'react';
import { FileText, CheckCircle, AlertCircle, Loader2, Sparkles, X, ChevronRight, BrainCircuit, FileEdit, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { motion, AnimatePresence } from "framer-motion";

import { aiHelper, ParsedProject } from '@/utils/aiHelper';
import { resumeAlignmentEngine, AlignmentResult } from '@/utils/resumeAlignmentEngine';

interface ResumeAlignmentProps {
    companyId: number;
    companyInnovxData: any;
    companyName: string;
}

export default function ResumeAlignment({ companyId, companyInnovxData, companyName }: ResumeAlignmentProps) {
    const [isParsing, setIsParsing] = useState(false);
    const [parsedProjects, setParsedProjects] = useState<ParsedProject[]>([]);
    const [alignmentResult, setAlignmentResult] = useState<AlignmentResult | null>(null);
    const [aiFeedback, setAiFeedback] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [manualText, setManualText] = useState("");

    const handleManualAnalysis = async () => {
        if (!manualText.trim()) {
            toast.error("Please enter some text to analyze.");
            return;
        }
        setIsParsing(true);
        setParsedProjects([]);
        setAlignmentResult(null);

        try {
            const projects = await aiHelper.extractProjects(manualText);
            setParsedProjects(projects);

            if (projects.length > 0) {
                toast.success(`Portfolio analyzed! Found ${projects.length} aggregated profile.`);
                if (projects.length === 1) {
                    analyzeProject(projects[0]);
                }
            } else {
                toast.warning("No projects detected.");
            }
        } catch (error: any) {
            console.error("Manual Analysis Error:", error);
            toast.error(`Analysis failed: ${error.message || "Unknown error"}`);
        } finally {
            setIsParsing(false);
        }
    };

    const analyzeProject = async (project: ParsedProject) => {
        setIsAnalyzing(true);
        try {
            // 1. Deterministic Scoring
            const result = resumeAlignmentEngine.calculateAlignment(project, companyInnovxData);
            setAlignmentResult(result);

            // 2. AI Strategic Feedback
            const feedback = await aiHelper.generateStrategicFeedback(project, companyName, companyInnovxData);
            setAiFeedback(feedback);

            toast.success("Analysis Complete!");
        } catch (error) {
            console.error(error);
            toast.error("Analysis failed.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const clearFile = () => {
        setManualText("");
        setParsedProjects([]);
        setAlignmentResult(null);
        setAiFeedback(null);
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto py-6">
            {/* Warning if no Company Data */}
            {(!companyInnovxData || Object.keys(companyInnovxData).length === 0) && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 flex items-center gap-3 shadow-sm">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span className="font-medium">Warning: Innovation data for {companyName} is incomplete. Alignment scores may be inaccurate.</span>
                </div>
            )}

            {/* 1. Input Section (Manual Only) */}
            {parsedProjects.length === 0 && (
                <Card className="border border-border/60 shadow-md bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-4 border-b border-border/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                                <FileEdit className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Resume & Project Alignment</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">Paste your project details to see how well they match {companyName}.</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="space-y-3">
                            <div className="p-4 bg-muted/30 rounded-lg border border-border/50 text-sm text-muted-foreground">
                                <p className="font-medium text-foreground mb-1">💡 Tip: Be descriptive!</p>
                                Paste <strong>ALL</strong> your projects here. Include the project title, problem statement, and tech stack for best results.
                                <br />
                                <span className="opacity-80 italic mt-1 block">Example: "Project 1: E-commerce app using React... Project 2: AI Chatbot using Python..."</span>
                            </div>

                            <Textarea
                                placeholder="Paste all your project descriptions here..."
                                className="min-h-[250px] font-mono text-sm resize-none focus-visible:ring-primary/20 border-border/60 shadow-inner bg-background/50"
                                value={manualText}
                                onChange={(e) => setManualText(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button
                                onClick={handleManualAnalysis}
                                disabled={!manualText.trim() || isParsing}
                                className="w-full sm:w-auto min-w-[150px] shadow-sm"
                                size="lg"
                            >
                                {isParsing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                                    </>
                                ) : (
                                    <>
                                        Analyze Projects <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 2. Parsing Status & Project Selection */}
            <AnimatePresence mode="wait">
                {(parsedProjects.length > 0) && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                        {/* Analysis Header */}
                        <div className="flex items-center justify-between p-5 bg-card border border-border/60 rounded-xl shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-green-500/10 rounded-lg text-green-600">
                                    <CheckCircle className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Analysis Ready</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Parsed {manualText.length} characters successfully.
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={clearFile} disabled={isParsing} className="text-muted-foreground hover:text-foreground">
                                <X className="h-4 w-4 mr-2" /> Clear & Restart
                            </Button>
                        </div>

                        {isParsing && (
                            <div className="flex flex-col items-center justify-center py-16 gap-4">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                <p className="text-muted-foreground font-medium">Extracting insights from your resume...</p>
                            </div>
                        )}

                        {/* Parsed Projects Grid */}
                        {!isParsing && parsedProjects.length > 0 && (
                            <div className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold tracking-tight">
                                        {alignmentResult ? "Analysis Results" : "Select Project to Analyze"}
                                    </h3>
                                    {!alignmentResult && (
                                        <Badge variant="outline" className="text-xs">
                                            {parsedProjects.length} Projects Found
                                        </Badge>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {parsedProjects.map((proj, idx) => (
                                        <Card key={idx} className={`shadow-sm transition-all duration-300 ${alignmentResult ? 'border-primary/50 bg-primary/5' : 'hover:border-primary/30 hover:shadow-md'}`}>
                                            <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                                                <div>
                                                    <CardTitle className="text-lg font-bold text-foreground/90">{proj.project_name}</CardTitle>
                                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                                        {proj.technologies_used?.slice(0, 6).map(t => (
                                                            <Badge key={t} variant="secondary" className="text-[10px] uppercase tracking-wider font-semibold bg-background/50 border border-border/50">{t}</Badge>
                                                        ))}
                                                    </div>
                                                </div>

                                                {(!alignmentResult && !isAnalyzing) && (
                                                    <Button size="sm" onClick={() => analyzeProject(proj)} className="shrink-0 ml-4">
                                                        Analyze <ChevronRight className="h-4 w-4 ml-1" />
                                                    </Button>
                                                )}
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{proj.problem_statement}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 3. Analysis Results */}
                        {alignmentResult && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold tracking-tight">Strategic Alignment</h2>
                                    <Button variant="outline" size="sm" onClick={() => { setAlignmentResult(null); setAiFeedback(null); }} disabled={isAnalyzing}>
                                        Analyze Another Project
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Score Card */}
                                    <Card className="md:col-span-1 overflow-hidden relative border-none shadow-lg bg-gradient-to-br from-primary/90 to-primary text-primary-foreground">
                                        <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                                        <CardContent className="pt-8 flex flex-col items-center justify-center text-center h-full relative z-10">
                                            <div className="relative w-36 h-36 mb-6 flex items-center justify-center">
                                                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                                    <circle className="text-primary-foreground/20" strokeWidth="8" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50" />
                                                    <circle
                                                        className="text-white transition-all duration-1000 ease-out"
                                                        strokeWidth="8"
                                                        strokeDasharray={264}
                                                        strokeDashoffset={264 - (264 * alignmentResult.total_score) / 100}
                                                        strokeLinecap="round"
                                                        stroke="currentColor"
                                                        fill="transparent"
                                                        r="42"
                                                        cx="50"
                                                        cy="50"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold">{alignmentResult.total_score}%</div>
                                            </div>
                                            <h3 className="font-bold text-xl mb-1">Alignment Score</h3>
                                            <p className="text-primary-foreground/80 font-medium max-w-[200px]">
                                                {alignmentResult.total_score > 75 ? "Excellent Strategic Fit" :
                                                    alignmentResult.total_score > 50 ? "Moderate Alignment" : "Needs Improvement"}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    {/* Breakdown */}
                                    <Card className="md:col-span-2 shadow-md border-border/60">
                                        <CardHeader className="pb-4 border-b border-border/50">
                                            <CardTitle className="text-lg">Scoring Breakdown</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6 pt-6">
                                            {[
                                                { label: "Theme & Problem Statement", score: alignmentResult.breakdown.theme_match },
                                                { label: "Technology Stack Overlap", score: alignmentResult.breakdown.tech_match },
                                                { label: "Architecture & Design", score: alignmentResult.breakdown.architecture_match },
                                                { label: "Innovation Depth (AI/ML/Cloud)", score: alignmentResult.breakdown.innovation_depth },
                                                { label: "Industry Domain Fit", score: alignmentResult.breakdown.domain_match },
                                            ].map((item, i) => (
                                                <div key={i} className="space-y-2">
                                                    <div className="flex justify-between text-sm font-medium">
                                                        <span>{item.label}</span>
                                                        <span className="text-muted-foreground">{item.score}/100</span>
                                                    </div>
                                                    <Progress value={item.score} className="h-2.5 bg-secondary" indicatorClassName={item.score > 75 ? "bg-green-500" : item.score > 50 ? "bg-primary" : "bg-amber-500"} />
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* AI Strategic Commentary */}
                                {isAnalyzing && (
                                    <div className="p-8 border rounded-xl bg-muted/5 flex flex-col items-center justify-center gap-4 text-muted-foreground animate-pulse">
                                        <BrainCircuit className="h-8 w-8 animate-pulse text-primary" />
                                        <p>Generating Executive Feedback...</p>
                                    </div>
                                )}

                                {!isAnalyzing && aiFeedback && (
                                    <div className="grid grid-cols-1 gap-6">
                                        <Card className="border-primary/20 bg-primary/5 shadow-inner">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="flex items-center gap-2 text-primary text-lg">
                                                    <BrainCircuit className="h-5 w-5" />
                                                    Strategic Commentary
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm leading-7 text-foreground/90 p-2">
                                                    {aiFeedback.feedback}
                                                </p>
                                            </CardContent>
                                        </Card>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Card className="shadow-sm border-border/60 h-full">
                                                <CardHeader className="pb-3 bg-red-500/5 border-b border-red-500/10">
                                                    <CardTitle className="text-base text-red-700 dark:text-red-400 flex items-center gap-2">
                                                        <Sparkles className="h-4 w-4" /> Recommended Improvements
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="pt-4">
                                                    <ul className="space-y-3">
                                                        {aiFeedback.improvements?.map((imp: string, i: number) => (
                                                            <li key={i} className="text-sm flex gap-3 items-start text-foreground/80">
                                                                <CheckCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                                                <span className="leading-snug">{imp}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </CardContent>
                                            </Card>

                                            <Card className="shadow-sm border-border/60 h-full">
                                                <CardHeader className="pb-3 bg-amber-500/5 border-b border-amber-500/10">
                                                    <CardTitle className="text-base text-amber-700 dark:text-amber-400 flex items-center gap-2">
                                                        <Sparkles className="h-4 w-4" /> Differentiation Ideas
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="pt-4">
                                                    <ul className="space-y-3">
                                                        {aiFeedback.differentiation?.map((diff: string, i: number) => (
                                                            <li key={i} className="text-sm flex gap-3 items-start text-foreground/80">
                                                                <CheckCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                                                <span className="leading-snug">{diff}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
