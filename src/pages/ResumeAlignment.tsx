import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Sparkles, X, ChevronRight, BrainCircuit, FileEdit } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    const [file, setFile] = useState<File | null>(null); // Keep for compatibility with existing check logic, but unused
    const [isParsing, setIsParsing] = useState(false);
    const [parsedProjects, setParsedProjects] = useState<ParsedProject[]>([]);
    const [alignmentResult, setAlignmentResult] = useState<AlignmentResult | null>(null);
    const [aiFeedback, setAiFeedback] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [debugText, setDebugText] = useState<string>("");

    // const [activeInputTab, setActiveInputTab] = useState("manual"); // Removed
    const [manualText, setManualText] = useState("");
    // const fileInputRef = useRef<HTMLInputElement>(null); // Removed

    // handleFileChange removed

    const handleManualAnalysis = async () => {
        if (!manualText.trim()) {
            toast.error("Please enter some text to analyze.");
            return;
        }
        setIsParsing(true);
        setParsedProjects([]);
        setAlignmentResult(null);

        try {
            // Treat manual text just like extracted text
            const projects = await aiHelper.extractProjects(manualText);
            setParsedProjects(projects);

            if (projects.length > 0) {
                // Formatting success message
                toast.success(`Portfolio analyzed! Found ${projects.length} aggregated profile.`);
                // Auto-analyze the first (and only) portfolio object
                if (projects.length === 1) {
                    analyzeProject(projects[0]);
                }
            } else {
                toast.warning("No projects detected.");
            }
        } catch (error: any) {
            console.error("Manual Analysis Error:", error);
            // Show the actual error message from the API/Helper
            toast.error(`Analysis failed: ${error.message || "Unknown error"}`);
        } finally {
            setIsParsing(false);
        }
    };

    // parseResume removed

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
        setFile(null);
        setManualText("");
        setParsedProjects([]);
        setAlignmentResult(null);
        setAiFeedback(null);
        // if (fileInputRef.current) fileInputRef.current.value = ''; // update
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
            {/* Warning if no Company Data */}
            {(!companyInnovxData || Object.keys(companyInnovxData).length === 0) && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-600 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>Warning: Innovation data for {companyName} is incomplete. Alignment scores may be inaccurate.</span>
                </div>
            )}

            {/* 1. Input Section (Manual Only) */}
            {parsedProjects.length === 0 && (
                <Card className="border-2 border-border/60">
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-full bg-primary/10 mt-1">
                                <FileEdit className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 space-y-3">
                                <div>
                                    <h3 className="text-lg font-semibold">Enter Project Details</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Paste <strong>ALL</strong> your projects here. (Title, problem statement, tech stack for each).
                                        <br />
                                        <em>Example: "Project 1: E-commerce app using React... Project 2: AI Chatbot using Python..."</em>
                                    </p>
                                </div>
                                <Textarea
                                    placeholder="Paste all your project descriptions here..."
                                    className="min-h-[250px] font-mono text-sm"
                                    value={manualText}
                                    onChange={(e) => setManualText(e.target.value)}
                                />
                                <Button onClick={handleManualAnalysis} disabled={!manualText.trim() || isParsing} className="w-full sm:w-auto">
                                    {isParsing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Projects...
                                        </>
                                    ) : (
                                        <>Analyze Projects</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 2. Parsing Status & Project Selection */}
            <AnimatePresence>
                {(parsedProjects.length > 0) && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                        {/* Header */}
                        <div className="flex items-center justify-between p-4 bg-card border rounded-xl shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/10 rounded-lg">
                                    <FileEdit className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Projects Input</p>
                                    <p className="text-xs text-muted-foreground">
                                        {manualText.length} chars • {isParsing ? 'Parsing...' : 'Ready'}
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={clearFile} disabled={isParsing}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {isParsing && (
                            <div className="text-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-3" />
                                <p className="text-muted-foreground">Extracting projects from your resume...</p>
                            </div>
                        )}

                        {/* Parsed Projects Grid - VISIBLE AGAIN for debug/fallback */}
                        {!isParsing && parsedProjects.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="heading-section">
                                    {alignmentResult ? "Analyzed Profile" : "Ready to Analyze"}
                                </h3>
                                <div className="grid grid-cols-1">
                                    {parsedProjects.map((proj, idx) => (
                                        <Card key={idx} className={`border-l-4 ${alignmentResult ? 'border-l-green-500' : 'border-l-primary'} shadow-sm`}>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-lg flex justify-between items-start gap-2">
                                                    {proj.project_name}
                                                    {(!alignmentResult && !isAnalyzing) && (
                                                        <Button size="sm" onClick={() => analyzeProject(proj)}>
                                                            Run Analysis <ChevronRight className="h-4 w-4 ml-1" />
                                                        </Button>
                                                    )}
                                                </CardTitle>
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {proj.technologies_used?.slice(0, 6).map(t => (
                                                        <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                                                    ))}
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-muted-foreground line-clamp-3">{proj.problem_statement}</p>
                                                <p className="text-xs text-muted-foreground mt-2 font-mono">
                                                    {proj.description.slice(0, 100)}...
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No Projects Found State */}
                        {!isParsing && parsedProjects.length === 0 && (
                            <div className="space-y-4">
                                <div className="text-center p-8 bg-muted/10 rounded-xl border border-dashed">
                                    <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                                    <p className="font-medium">No projects found</p>
                                    <p className="text-sm text-muted-foreground mt-1">We couldn't auto-detect a "Projects" section. Please ensure your resume is formatted clearly.</p>
                                </div>

                                {/* Debug Info - Hidden by default, useful for troubleshooting */}
                                <div className="p-4 border rounded-lg bg-muted/5">
                                    <p className="text-xs font-semibold mb-2">Debug: Extracted Text Preview (First 500 chars)</p>
                                    <pre className="text-[10px] text-muted-foreground whitespace-pre-wrap font-mono h-24 overflow-y-auto p-2 bg-background border rounded">
                                        {debugText ? debugText.slice(0, 500) + '...' : 'No text extracted.'}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* 3. Analysis Results */}
                        {alignmentResult && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="heading-section">Alignment Analysis</h2>
                                    <Button variant="outline" size="sm" onClick={() => { setAlignmentResult(null); setAiFeedback(null); }} disabled={isAnalyzing}>
                                        Analyze Another Project
                                    </Button>
                                </div>

                                {/* Score Card */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Card className="md:col-span-1 bg-gradient-to-br from-background to-muted/20">
                                        <CardContent className="pt-6 text-center">
                                            <div className="relative w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                                                <div className="absolute inset-0 rounded-full border-8 border-muted" />
                                                <div
                                                    className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent animate-spin-slow"
                                                    style={{ clipPath: `inset(0 0 0 0)` }} // Simplified visual for now
                                                />
                                                <div className="text-3xl font-bold">{alignmentResult.total_score}%</div>
                                            </div>
                                            <h3 className="font-semibold text-lg mb-1">Overall Match</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {alignmentResult.total_score > 75 ? "Excellent Strategic Fit" :
                                                    alignmentResult.total_score > 50 ? "Moderate Alignment" : "Needs Improvement"}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="md:col-span-2">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base">Scoring Breakdown</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {[
                                                { label: "Theme & Problem Statement", score: alignmentResult.breakdown.theme_match, w: 30 },
                                                { label: "Technology Stack Overlap", score: alignmentResult.breakdown.tech_match, w: 25 },
                                                { label: "Architecture & Design", score: alignmentResult.breakdown.architecture_match, w: 15 },
                                                { label: "Innovation Depth (AI/ML/Cloud)", score: alignmentResult.breakdown.innovation_depth, w: 15 },
                                                { label: "Industry Domain Fit", score: alignmentResult.breakdown.domain_match, w: 15 },
                                            ].map((item, i) => (
                                                <div key={i} className="space-y-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span>{item.label}</span>
                                                        <span className="font-mono text-muted-foreground">{item.score}/100</span>
                                                    </div>
                                                    <Progress value={item.score} className="h-2" />
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* AI Strategic Commentary */}
                                {isAnalyzing && (
                                    <div className="p-6 border rounded-xl bg-muted/5 flex items-center justify-center gap-3 text-muted-foreground">
                                        <Loader2 className="h-5 w-5 animate-spin" /> Generating Executive Feedback...
                                    </div>
                                )}

                                {!isAnalyzing && aiFeedback && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card className="border-primary/20 bg-primary/5">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 text-primary">
                                                    <BrainCircuit className="h-5 w-5" />
                                                    Strategic Commentary
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm leading-relaxed text-foreground/90">
                                                    {aiFeedback.feedback}
                                                </p>
                                            </CardContent>
                                        </Card>

                                        <div className="space-y-4">
                                            <Card>
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-base">🚀 Recommended Improvements</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <ul className="space-y-2">
                                                        {aiFeedback.improvements?.map((imp: string, i: number) => (
                                                            <li key={i} className="text-sm flex gap-2 items-start">
                                                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                                                {imp}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </CardContent>
                                            </Card>

                                            <Card>
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-base">💡 Differentiation Ideas</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <ul className="space-y-2">
                                                        {aiFeedback.differentiation?.map((diff: string, i: number) => (
                                                            <li key={i} className="text-sm flex gap-2 items-start">
                                                                <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                                                {diff}
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
