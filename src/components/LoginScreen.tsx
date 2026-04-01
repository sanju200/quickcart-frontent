import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useAppNavigation } from '../context/AppContext';
import { loginUser } from '../services/authentication.service';
import ToastNotification from './ToastNotification';

// ── Validation helpers ──────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface PasswordChecks {
  minLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

const getPasswordChecks = (pw: string): PasswordChecks => ({
  minLength: pw.length >= 8,
  hasUppercase: /[A-Z]/.test(pw),
  hasNumber: /[0-9]/.test(pw),
  hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pw),
});

const isPasswordValid = (checks: PasswordChecks) =>
  checks.minLength && checks.hasUppercase && checks.hasNumber && checks.hasSpecial;

// ── Component ───────────────────────────────────────────────────────
const LoginScreen = () => {
  const { navigate } = useAppNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Field-level errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Track whether user has interacted with each field
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' });

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ visible: true, message, type });
  };

  // ── Per-field validation ────────────────────────────────────────
  const validateEmail = useCallback((value: string): string => {
    if (!value.trim()) return 'Email address is required';
    if (!EMAIL_REGEX.test(value)) return 'Please enter a valid email address';
    return '';
  }, []);

  const validatePassword = useCallback((value: string): string => {
    if (!value) return 'Password is required';
    return '';
  }, []);

  // ── Change handlers (validate on change after first touch) ──────
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailTouched) {
      setEmailError(validateEmail(value));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordTouched) {
      setPasswordError(validatePassword(value));
    }
  };

  // ── Blur handlers ───────────────────────────────────────────────
  const handleEmailBlur = () => {
    setEmailTouched(true);
    setEmailError(validateEmail(email));
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    setPasswordError(validatePassword(password));
  };

  // ── Submit ──────────────────────────────────────────────────────
  const handleLogin = async () => {
    // Force-touch both fields so errors appear
    setEmailTouched(true);
    setPasswordTouched(true);

    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);

    if (eErr || pErr) {
      showToast('Please fix the errors below', 'error');
      return;
    }

    // Show password complexity hints (non-blocking) before hitting the server
    const checks = getPasswordChecks(password);
    if (!isPasswordValid(checks)) {
      // Don't block – just show the checklist as a visual hint
    }

    try {
      setLoading(true);
      const res = await loginUser(email, password);
      console.log(res);
      showToast('Login successful! Redirecting...', 'success');
      setTimeout(() => navigate('HOME'), 1200);
    } catch (err: any) {
      const msg: string = err.message || 'Login failed';

      // Map server error codes / messages to the correct field
      const lower = msg.toLowerCase();
      if (lower.includes('not registered') || lower.includes('not found') || lower.includes('user not found') || lower.includes('no account')) {
        setEmailError(msg);
        setPasswordError('');
      } else if (lower.includes('incorrect') || lower.includes('wrong password') || lower.includes('invalid password') || lower.includes('unauthorized') || lower.includes('credentials') || lower.includes('login failed')) {
        setPasswordError('Incorrect credentials. Please try again.');
        setEmailError('');
      } else {
        showToast(msg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Password requirement checks (for the live checklist) ────────
  const pwChecks = getPasswordChecks(password);
  const showChecklist = passwordTouched && password.length > 0 && !isPasswordValid(pwChecks);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <ToastNotification
          message={toast.message}
          type={toast.type}
          visible={toast.visible}
          onHide={() => setToast(prev => ({ ...prev, visible: false }))}
        />

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Log in to QuickCart to continue</Text>

        {/* ── Email field ──────────────────────────────────────── */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={[styles.input, emailError ? styles.inputError : null]}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={handleEmailChange}
            onBlur={handleEmailBlur}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}

          {/* ── Password field ────────────────────────────────── */}
          <Text style={styles.label}>Password</Text>
          <View style={[styles.passwordContainer, passwordError ? styles.inputError : null]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={handlePasswordChange}
              onBlur={handlePasswordBlur}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeIconText}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>
          {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}

          {/* ── Live password requirements checklist ──────────── */}
          {showChecklist && (
            <View style={styles.checklistContainer}>
              <Text style={styles.checklistTitle}>Password must contain:</Text>
              <CheckItem label="At least 8 characters" met={pwChecks.minLength} />
              <CheckItem label="One uppercase letter (A-Z)" met={pwChecks.hasUppercase} />
              <CheckItem label="One number (0-9)" met={pwChecks.hasNumber} />
              <CheckItem label="One special character (!@#$...)" met={pwChecks.hasSpecial} />
            </View>
          )}
        </View>

        {/* ── Login button ────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.btnPrimary, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Login</Text>}
        </TouchableOpacity>

        {/* ── Footer ──────────────────────────────────────────── */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigate('SIGNUP')}>
            <Text style={styles.linkText}> Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

// ── Small helper component for checklist items ──────────────────────
const CheckItem = ({ label, met }: { label: string; met: boolean }) => (
  <View style={styles.checkRow}>
    <Text style={[styles.checkIcon, met ? styles.checkMet : styles.checkUnmet]}>
      {met ? '✓' : '✗'}
    </Text>
    <Text style={[styles.checkLabel, met ? styles.checkLabelMet : styles.checkLabelUnmet]}>
      {label}
    </Text>
  </View>
);

// ── Styles ──────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 4,
  },
  inputError: {
    borderColor: '#EF5350',
    borderWidth: 1.5,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 4,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  eyeIcon: {
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIconText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#C62828',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 12,
    marginTop: 2,
    paddingLeft: 4,
  },
  // ── Checklist styles ──────────────────────────────────────────
  checklistContainer: {
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  checklistTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkIcon: {
    fontSize: 14,
    fontWeight: 'bold',
    width: 20,
    textAlign: 'center',
  },
  checkMet: {
    color: '#2E7D32',
  },
  checkUnmet: {
    color: '#EF5350',
  },
  checkLabel: {
    fontSize: 12,
    marginLeft: 6,
  },
  checkLabelMet: {
    color: '#2E7D32',
  },
  checkLabelUnmet: {
    color: '#888',
  },
  // ── Button styles ─────────────────────────────────────────────
  btnPrimary: {
    backgroundColor: '#2E7D32',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 15,
  },
  linkText: {
    color: '#2E7D32',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
