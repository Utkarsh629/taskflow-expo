// src/screens/auth/RegisterScreen.tsx
// User registration screen with validation

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../utils/theme';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

const RegisterScreen = ({ navigation }: Props) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setIsLoading(true);
    const result = await register(name.trim(), email.trim(), password);
    setIsLoading(false);
    if (!result.success) {
      Alert.alert('Registration Failed', result.error || 'Something went wrong');
    }
  };

  const renderField = (
    label: string,
    value: string,
    setter: (v: string) => void,
    placeholder: string,
    key: string,
    options?: {
      secure?: boolean;
      keyboardType?: any;
      autoCapitalize?: any;
      showToggle?: boolean;
    }
  ) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={options?.showToggle ? styles.passwordContainer : undefined}>
        <TextInput
          style={[
            styles.input,
            options?.showToggle && styles.passwordInput,
            errors[key] && styles.inputError,
          ]}
          value={value}
          onChangeText={setter}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={options?.secure && !showPassword}
          keyboardType={options?.keyboardType}
          autoCapitalize={options?.autoCapitalize || 'sentences'}
          autoCorrect={false}
        />
        {options?.showToggle && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(v => !v)}
          >
            <Text>{showPassword ? '🙈' : '👁'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {errors[key] && <Text style={styles.errorText}>{errors[key]}</Text>}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>✦</Text>
          </View>
          <Text style={styles.appName}>TASKFLOW</Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create account</Text>
          <Text style={styles.cardSubtitle}>Start your productivity journey</Text>

          {renderField('Full name', name, setName, 'John Doe', 'name')}
          {renderField('Email address', email, setEmail, 'you@example.com', 'email', {
            keyboardType: 'email-address',
            autoCapitalize: 'none',
          })}
          {renderField('Password', password, setPassword, 'Min. 6 characters', 'password', {
            secure: true,
            autoCapitalize: 'none',
            showToggle: true,
          })}
          {renderField('Confirm password', confirmPassword, setConfirmPassword, 'Re-enter password', 'confirmPassword', {
            secure: true,
            autoCapitalize: 'none',
          })}

          {/* Strength indicator */}
          {password.length > 0 && (
            <View style={styles.strengthContainer}>
              <Text style={styles.strengthLabel}>Password strength:</Text>
              <View style={styles.strengthBars}>
                {[1, 2, 3].map(level => (
                  <View
                    key={level}
                    style={[
                      styles.strengthBar,
                      {
                        backgroundColor:
                          password.length >= level * 3
                            ? level === 1
                              ? Colors.danger
                              : level === 2
                              ? Colors.warning
                              : Colors.success
                            : Colors.border,
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.strengthText}>
                {password.length < 6 ? 'Weak' : password.length < 10 ? 'Fair' : 'Strong'}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.registerButton, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.registerButtonText}>CREATE ACCOUNT</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginLinkText}>
              Already have an account?{' '}
              <Text style={styles.loginLinkAccent}>Sign in →</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1, padding: Spacing.lg, paddingTop: Spacing.xl },
  backButton: { marginBottom: Spacing.md },
  backText: {
    fontSize: Typography.sizeMD,
    color: Colors.accent,
    fontWeight: Typography.weightMedium,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    ...Shadow.button,
  },
  logoIcon: { fontSize: 24, color: Colors.white },
  appName: {
    fontSize: Typography.size2XL,
    fontWeight: Typography.weightBlack,
    color: Colors.textPrimary,
    letterSpacing: 6,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  cardTitle: {
    fontSize: Typography.size2XL,
    fontWeight: Typography.weightBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    fontSize: Typography.sizeMD,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  fieldGroup: { marginBottom: Spacing.md },
  label: {
    fontSize: Typography.sizeSM,
    fontWeight: Typography.weightMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: Typography.sizeMD,
    color: Colors.textPrimary,
  },
  inputError: { borderColor: Colors.danger },
  passwordContainer: { position: 'relative' },
  passwordInput: { paddingRight: 48 },
  eyeButton: {
    position: 'absolute',
    right: Spacing.md,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  errorText: {
    fontSize: Typography.sizeXS,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  strengthLabel: {
    fontSize: Typography.sizeXS,
    color: Colors.textMuted,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
  },
  strengthBar: {
    width: 24,
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: Typography.sizeXS,
    color: Colors.textSecondary,
  },
  registerButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
    ...Shadow.button,
  },
  buttonDisabled: { opacity: 0.6 },
  registerButtonText: {
    fontSize: Typography.sizeMD,
    fontWeight: Typography.weightBold,
    color: Colors.white,
    letterSpacing: 2,
  },
  loginLink: { alignItems: 'center', marginTop: Spacing.lg },
  loginLinkText: {
    fontSize: Typography.sizeMD,
    color: Colors.textSecondary,
  },
  loginLinkAccent: {
    color: Colors.accent,
    fontWeight: Typography.weightSemiBold,
  },
});

export default RegisterScreen;
