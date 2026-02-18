import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Loader, GraduationCap, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  const validateForm = () => {
    const newErrors: any = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success('Account created successfully.');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50">
      {/* Left Side - Visuals */}
      <div className="hidden lg:flex w-1/2 relative bg-[#1e3a8a] overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/95 via-blue-900/80 to-indigo-900/90" />

        <div className="relative z-10 max-w-xl px-12 space-y-8 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-block"
          >
            <div className="h-16 w-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 mb-6">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-bold tracking-tight leading-tight"
          >
            Start Your <br />
            <span className="text-blue-200">Professional Journey</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <p className="text-lg text-blue-100/80 max-w-md leading-relaxed">
              Join thousands of PESCE students leveraging AI to secure top-tier placements.
            </p>

            <div className="grid gap-4">
              {[
                "AI-Powered Resume Alignment",
                "Personalized Learning Roadmaps",
                "Company-Specific Mock Tests"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-medium text-blue-100">
                  <CheckCircle2 className="h-5 w-5 text-blue-300" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 bg-white relative">
        <div className="w-full max-w-[420px] space-y-8">
          {/* Header / Logo */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-6"
          >
            <img
              src="https://pesce.ac.in/img/pes%20logo%201.svg"
              alt="PES College of Engineering"
              className="h-20 w-auto object-contain"
            />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Student Registration</h2>
              <p className="text-slate-500 text-sm">Create your account for the placement portal.</p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-[#1e3a8a] transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="usn@pesce.ac.in"
                  className={`pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]/20 transition-all ${errors.email ? 'border-destructive' : ''}`}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive mt-1 font-medium">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-[#1e3a8a] transition-colors" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 6 characters"
                  className={`pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]/20 transition-all ${errors.password ? 'border-destructive' : ''}`}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1 font-medium">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">Confirm Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-[#1e3a8a] transition-colors" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  className={`pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]/20 transition-all ${errors.confirmPassword ? 'border-destructive' : ''}`}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive mt-1 font-medium">{errors.confirmPassword}</p>}
            </div>

            <div className="pt-2">
              <Button
                className="w-full h-12 font-semibold text-base bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 shadow-md hover:shadow-lg transition-all rounded-lg"
                size="lg"
                disabled={loading}
              >
                {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
              </Button>
            </div>

            <p className="text-xs text-slate-500 text-center px-4">
              By clicking continue, you agree to our <a href="#" className="underline hover:text-[#1e3a8a]">Terms of Service</a> and <a href="#" className="underline hover:text-[#1e3a8a]">Privacy Policy</a>.
            </p>
          </motion.form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-slate-500 font-medium">Or register with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-11 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors">
              Google
            </Button>
            <Button variant="outline" className="h-11 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors">
              Microsoft
            </Button>
          </div>

          <p className="text-center text-sm text-slate-600">
            Already have an account? {' '}
            <Link to="/login" className="font-bold text-[#1e3a8a] hover:underline">
              Sign In
            </Link>
          </p>
        </div>

        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} PES College of Engineering, Mandya. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
