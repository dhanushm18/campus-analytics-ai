import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Loader, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
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
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success('Welcome back.');
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50">
      {/* Left Side - Visuals (Academic/Professional) */}
      <div className="hidden lg:flex w-1/2 relative bg-[#1e3a8a] overflow-hidden items-center justify-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 via-blue-900/80 to-indigo-900/90" />

        <div className="relative z-10 max-w-xl px-12 space-y-8 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-white/90 font-semibold tracking-wide text-sm uppercase">Official Student Portal</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-bold tracking-tight leading-tight"
          >
            Placement <br />
            <span className="text-blue-200">Intelligence System</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-blue-100/80 max-w-lg leading-relaxed"
          >
            Streamline your campus placement journey with advanced analytics, skill verification, and company-specific preparation modules.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pt-8 border-t border-white/10 flex gap-12"
          >
            <div>
              <div className="text-3xl font-bold">95%</div>
              <div className="text-sm text-blue-200">Placement Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold">150+</div>
              <div className="text-sm text-blue-200">Hiring Partners</div>
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
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Student Login</h2>
              <p className="text-slate-500 text-sm">Access your placement dashboard and resources.</p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-5"
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                <Link to="#" className="text-xs font-semibold text-[#1e3a8a] hover:underline">Forgot password?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-[#1e3a8a] transition-colors" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className={`pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]/20 transition-all ${errors.password ? 'border-destructive' : ''}`}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1 font-medium">{errors.password}</p>}
            </div>

            <Button
              className="w-full h-12 font-semibold text-base bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 shadow-md hover:shadow-lg transition-all rounded-lg"
              size="lg"
              disabled={loading}
            >
              {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
            </Button>
          </motion.form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-slate-500 font-medium">Or continue with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-11 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors">
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
              Google
            </Button>
            <Button variant="outline" className="h-11 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors">
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="microsoft" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M0 32h214.6v214.6H0V32zm233.4 0H448v214.6H233.4V32zM0 265.4h214.6V480H0V265.4zm233.4 0H448V480H233.4V265.4z"></path></svg>
              Microsoft
            </Button>
          </div>

          <p className="text-center text-sm text-slate-600">
            Don't have an account? {' '}
            <Link to="/signup" className="font-bold text-[#1e3a8a] hover:underline">
              Create Account
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
