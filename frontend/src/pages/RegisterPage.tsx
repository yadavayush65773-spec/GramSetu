import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Landmark,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  MapPin,
  ArrowLeft,
  UserPlus
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { setActivePage, language, setCurrentRole, addToast, setAuthSession } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('citizen');
  const [district, setDistrict] = useState('Varanasi');
  const [block, setBlock] = useState('Sevapuri');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isHi = language === 'hi';

  const districtBlockMap: Record<string, string[]> = {
    Varanasi: ['Sevapuri', 'Pindra', 'Kashi Vidyapeeth', 'Araziline'],
    Prayagraj: ['Phulpur', 'Karchhana', 'Soraon', 'Holagarh'],
    Gorakhpur: ['Chargawan', 'Pipraich', 'Sahjanwa', 'Belghat'],
    Mirzapur: ['Chunar', 'Naraynpur', 'Majhawan', 'City'],
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage(isHi ? 'कृपया अपना पूरा नाम दर्ज करें।' : 'Please enter your full name (minimum 2 characters).');
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage(isHi ? 'कृपया एक वैध ईमेल पता दर्ज करें।' : 'Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage(isHi ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' : 'Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(isHi ? 'पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते।' : 'Passwords do not match. Please re-enter.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage(isHi ? 'कृपया नियमों व शर्तों को स्वीकार करें।' : 'Please agree to the platform guidelines.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          role,
          districtId: district,
          blockId: block,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || json.message || 'Registration failed');
      }

      const { user, token } = json.data;
      setAuthSession(user, token || null);

      setSuccessMessage(
        isHi
          ? 'खाता सफलतापूर्वक पंजीकृत हुआ! डैशबोर्ड पर पुनर्निर्देशित किया जा रहा है...'
          : 'Account registered successfully! Redirecting to dashboard...'
      );
      addToast(isHi ? `स्वागत है, ${fullName}!` : `Welcome, ${fullName}! Account created.`, 'success');

      setTimeout(() => {
        setActivePage('overview');
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
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
          <span className="text-xs text-stone-500 font-medium">{isHi ? 'पहले से खाता है?' : 'Already have an account?'}</span>
          <button
            onClick={() => setActivePage('login')}
            className="text-emerald-700 hover:text-emerald-800 font-bold text-xs underline"
          >
            {isHi ? 'साइन इन करें' : 'Sign In Here'}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 my-auto py-8">
        <div className="bg-white p-7 sm:p-10 rounded-3xl border border-stone-200/90 shadow-xl shadow-stone-900/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-700 to-stone-900 flex items-center justify-center text-white shadow-md">
              <Landmark className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-stone-900 tracking-tight">
                {isHi ? 'ग्रामसेतु पंजीकरण' : 'Create Officer / Citizen Account'}
              </h1>
              <p className="text-xs text-stone-500 font-medium">
                {isHi
                  ? 'सत्यापित डिजिटल ग्रामीण निगरानी मंच'
                  : 'Enroll into GramSetu Smart Rural Housing Platform'}
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

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                {isHi ? 'पूरा नाम' : 'Full Name'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Anand Kumar / Ramesh Patel"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all bg-stone-50/50"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                {isHi ? 'ईमेल पता' : 'Email Address'}
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
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all bg-stone-50/50"
                />
              </div>
            </div>

            {/* Role & Access Tier */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                {isHi ? 'खाता प्रकार / भूमिका' : 'Role & Institutional Access Tier'}
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-stone-50/50"
              >
                <option value="citizen">Public Citizen / Rural Beneficiary (ग्रामीण नागरिक)</option>
                <option value="field_inspector">Field Technical Inspector / JE (क्षेत्रीय तकनीकी निरीक्षक)</option>
                <option value="bdo">Block Development Officer / BDO (खंड विकास अधिकारी)</option>
                <option value="district_officer">District Officer / DM / CDO (जिला अधिकारी)</option>
                <option value="auditor">Public Accounts Auditor / CAG (लेखा परीक्षक)</option>
                <option value="state_admin">State Administrator (राज्य प्रशासक)</option>
              </select>
            </div>

            {/* Geographic Jurisdiction */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  {isHi ? 'जिला' : 'District'}
                </label>
                <select
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    const blocks = districtBlockMap[e.target.value];
                    if (blocks && blocks.length > 0) setBlock(blocks[0]);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-stone-50/50"
                >
                  <option value="Varanasi">Varanasi (वाराणसी)</option>
                  <option value="Prayagraj">Prayagraj (प्रयागराज)</option>
                  <option value="Gorakhpur">Gorakhpur (गोरखपुर)</option>
                  <option value="Mirzapur">Mirzapur (मिर्जापुर)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  {isHi ? 'ब्लॉक' : 'Block'}
                </label>
                <select
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-stone-50/50"
                >
                  {(districtBlockMap[district] || ['Sevapuri']).map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  {isHi ? 'पासवर्ड' : 'Password'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-10 pr-3 py-2 rounded-xl border border-stone-200 text-sm bg-stone-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  {isHi ? 'पासवर्ड पुष्टि' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-10 py-2 rounded-xl border border-stone-200 text-sm bg-stone-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-stone-600">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 mt-0.5"
                />
                <span>
                  {isHi
                    ? 'मैं ग्रामसेतु के डिजिटल साक्ष्य, ऑडिट ट्रेल और गैर-छेड़छाड़ नियमों का पालन करने की पुष्टि करता हूं।'
                    : 'I confirm compliance with Digital Evidence Integrity and statutory anti-fraud monitoring guidelines.'}
                </span>
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
                  <span>{isHi ? 'खाता बनाएं एवं आगे बढ़ें' : 'Complete Registration & Enter'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Simple Footer */}
      <div className="py-4 text-center text-xs text-stone-400 border-t border-stone-200">
        &copy; 2026 GramSetu (ग्रामसेतु) • Smart Rural Housing &amp; Panchayat Monitoring
      </div>
    </div>
  );
};
