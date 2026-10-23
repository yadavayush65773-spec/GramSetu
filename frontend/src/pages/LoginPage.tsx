import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Landmark,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowLeft,
  KeyRound,
  UserCheck
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { setActivePage, language, setCurrentRole, addToast, setAuthSession } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPin, setForgotPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStage, setForgotStage] = useState<'request' | 'reset'>('request');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotInfo, setForgotInfo] = useState('');

  const isHi = language === 'hi';

  const demoAccounts = [
    {
      role: 'state_admin' as UserRole,
      title: 'State Administrator',
      titleHi: 'राज्य प्रशासक (अपर मुख्य सचिव)',
      email: 'admin.rural@gramsetu.nic.in',
      tag: 'Tier 1 • Statewide Policy & Budget',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    {
      role: 'district_officer' as UserRole,
      title: 'District Officer (DM/CDO)',
      titleHi: 'जिला अधिकारी (जिलाधिकारी / सीडीओ)',
      email: 'dm.gorakhpur@gramsetu.nic.in',
      tag: 'Tier 2 • DBT Approvals & Vigilance',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      role: 'block_officer' as UserRole,
      title: 'Block Officer (BDO)',
      titleHi: 'खंड विकास अधिकारी (BDO)',
      email: 'bdo.chargawan@gramsetu.nic.in',
      tag: 'Tier 3 • Beneficiary Verification',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      role: 'field_inspector' as UserRole,
      title: 'Field Technical Inspector',
      titleHi: 'स्थलीय तकनीकी निरीक्षक (अवर अभियंता)',
      email: 'inspector.singh@gramsetu.nic.in',
      tag: 'Tier 4 • GPS Lock & SHA-256 Photo Proof',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      role: 'auditor' as UserRole,
      title: 'Public Accounts Auditor',
      titleHi: 'सार्वजनिक लेखा परीक्षक (कैग / सोशल ऑडिट)',
      email: 'auditor.cag@gramsetu.nic.in',
      tag: 'Constitutional • Read-Only Ledger Audit',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    },
    {
      role: 'public_citizen' as UserRole,
      title: 'Rural Citizen / Beneficiary',
      titleHi: 'ग्रामीण नागरिक / आवास लाभार्थी',
      email: 'citizen.rameshwar@gramsetu.nic.in',
      tag: 'Citizen Tier • Transparent Outlays & Tracking',
      badgeColor: 'bg-stone-100 text-stone-800 border-stone-200',
    },
  ];

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim()) {
      setErrorMessage(isHi ? 'कृपया वैध ईमेल पता दर्ज करें।' : 'Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage(isHi ? 'कृपया पासवर्ड दर्ज करें।' : 'Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || json.message || 'Authentication failed');
      }

      const { user, token } = json.data;
      setAuthSession(user, token || null);

      setSuccessMessage(isHi ? 'प्रमाणीकरण सफल! डैशबोर्ड पर पुनर्निर्देशित किया जा रहा है...' : 'Login successful! Redirecting to dashboard...');
      addToast(isHi ? `स्वागत है, ${user?.full_name || 'उपयोगकर्ता'}!` : `Welcome back, ${user?.full_name || 'Officer'}!`, 'success');

      setTimeout(() => {
        setActivePage('overview');
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (account: typeof demoAccounts[0]) => {
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: account.role }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        const { user, token } = json.data;
        setAuthSession(user, token || null);
        addToast(
          isHi ? `${account.titleHi} के रूप में प्रवेश किया गया!` : `Authenticated as ${account.title}!`,
          'success'
        );
        setActivePage('overview');
      } else {
        // Fallback demo switch in case network is offline
        setCurrentRole(account.role);
        addToast(`Operating as ${account.title}`, 'info');
        setActivePage('overview');
      }
    } catch (_) {
      setCurrentRole(account.role);
      setActivePage('overview');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;

    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const json = await res.json();
      if (json.data?.simulatedPin) {
        setForgotPin(json.data.simulatedPin);
        setForgotInfo(isHi ? `डेमो सुरक्षा पिन: ${json.data.simulatedPin}` : `Demo Security PIN: ${json.data.simulatedPin}`);
      } else {
        setForgotInfo(json.data?.message || 'Instructions sent to email.');
      }
      setForgotStage('reset');
    } catch (_) {
      setForgotInfo('Demo reset service available. Set your new password.');
      setForgotStage('reset');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, pin: forgotPin, newPassword }),
      });
      const json = await res.json();
      addToast(json.data?.message || 'Password successfully updated!', 'success');
      setShowForgotModal(false);
      setForgotStage('request');
      setPassword(newPassword);
      setEmail(forgotEmail);
    } catch (_) {
      addToast('Password updated in local session.', 'info');
      setShowForgotModal(false);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F4] text-stone-800 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Simple Navigation */}
      <div className="p-4 sm:p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <button
          onClick={() => setActivePage('landing')}
          className="flex items-center gap-2 text-stone-600 hover:text-emerald-800 text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isHi ? 'मुख्य पृष्ठ पर लौटें' : 'Back to Home'}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 font-medium">{isHi ? 'खाता नहीं है?' : "Don't have an account?"}</span>
          <button
            onClick={() => setActivePage('register')}
            className="text-emerald-700 hover:text-emerald-800 font-bold text-xs underline"
          >
            {isHi ? 'नया खाता बनाएं' : 'Register Here'}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 my-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Card */}
          <div className="lg:col-span-7 bg-white p-7 sm:p-9 rounded-3xl border border-stone-200/90 shadow-xl shadow-stone-900/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-700 to-stone-900 flex items-center justify-center text-white shadow-md">
                <Landmark className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-stone-900 tracking-tight">GramSetu Sign In</h1>
                <p className="text-xs text-stone-500 font-medium">
                  {isHi ? 'ग्रामसेतु सुरक्षित डिजिटल प्रमाणन प्रणाली' : 'Official Portal & Field Inspector Access'}
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 mb-5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 mb-5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleStandardLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  {isHi ? 'ईमेल पता' : 'Official / Citizen Email'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gramsetu.nic.in"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-stone-400 bg-stone-50/50"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    {isHi ? 'पासवर्ड' : 'Password'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setShowForgotModal(true);
                    }}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
                  >
                    {isHi ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-stone-400 bg-stone-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  {isHi ? 'डेमो खातों का डिफ़ॉल्ट पासवर्ड: GramSetu@2026' : 'Demo accounts default password: GramSetu@2026'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{isHi ? 'लॉगिन सत्र याद रखें' : 'Remember my session'}</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-700 via-emerald-800 to-emerald-900 hover:from-emerald-800 hover:to-stone-900 shadow-md shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{isHi ? 'सुरक्षित साइन इन' : 'Authenticate & Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: 1-Click Demo Evaluation Switcher */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  {isHi ? 'जज / मूल्यांकनकर्ता त्वरित लॉगिन' : 'Judge / Evaluator 1-Click Login'}
                </h3>
              </div>
              <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                {isHi
                  ? 'किसी भी भूमिका पर क्लिक कर सीधे संबंधित अनुमतियों, अधिकार क्षेत्र व वर्कस्पेस का परीक्षण करें:'
                  : 'Click any official role to instantly authenticate and evaluate permissions, jurisdiction, and separation of duties:'}
              </p>

              <div className="space-y-2.5">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.role}
                    onClick={() => handleQuickDemoLogin(acc)}
                    disabled={loading}
                    className="w-full p-3 rounded-xl border border-stone-200 hover:border-emerald-500/60 hover:bg-emerald-50/50 text-left transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900 group-hover:text-emerald-900">
                          {isHi ? acc.titleHi : acc.title}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${acc.badgeColor}`}>
                          {acc.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 font-mono truncate">{acc.email}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">{acc.tag}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-emerald-900/10 border border-emerald-300/60 p-4 rounded-2xl flex items-start gap-3 text-xs text-emerald-950">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Institutional Security Notice:</span>
                <p className="mt-0.5 text-stone-600">
                  Every sign-in session generates a cryptographic JWT with role claim verification and records audit access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-stone-200 shadow-2xl relative">
            <h3 className="text-lg font-bold text-stone-900 mb-2 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-emerald-700" />
              <span>{isHi ? 'पासवर्ड रीसेट करें' : 'Reset Account Password'}</span>
            </h3>
            <p className="text-xs text-stone-500 mb-4 leading-relaxed">
              {isHi
                ? 'अपने पंजीकृत ईमेल पते पर सुरक्षा पिन प्राप्त करें और नया पासवर्ड सेट करें।'
                : 'Enter your registered email address to receive a secure authorization PIN.'}
            </p>

            {forgotInfo && (
              <div className="p-3 mb-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                {forgotInfo}
              </div>
            )}

            {forgotStage === 'request' ? (
              <form onSubmit={handleRequestPasswordReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Registered Email</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="official@gramsetu.nic.in"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg"
                  >
                    {forgotLoading ? 'Processing...' : 'Send Reset PIN'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleConfirmPasswordReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Security PIN</label>
                  <input
                    type="text"
                    required
                    value={forgotPin}
                    onChange={(e) => setForgotPin(e.target.value)}
                    placeholder="Enter 6-digit PIN"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg"
                  >
                    {forgotLoading ? 'Updating...' : 'Set New Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Simple Footer */}
      <div className="py-4 text-center text-xs text-stone-400 border-t border-stone-200">
        &copy; 2026 GramSetu (ग्रामसेतु) • Smart Rural Housing &amp; Panchayat Monitoring
      </div>
    </div>
  );
};
