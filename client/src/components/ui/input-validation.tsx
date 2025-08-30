import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface InputValidationProps {
  value: string;
  isValid: boolean;
  errorMessage?: string;
  successMessage?: string;
  type: 'username' | 'password' | 'email';
}

export default function InputValidation({ 
  value, 
  isValid, 
  errorMessage, 
  successMessage, 
  type 
}: InputValidationProps) {
  const getValidationRules = () => {
    switch (type) {
      case 'username':
        return {
          minLength: 3,
          pattern: /^[a-zA-Z0-9_]+$/,
          message: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل ويحتوي على أحرف وأرقام فقط'
        };
      case 'password':
        return {
          minLength: 6,
          pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل وتحتوي على أحرف كبيرة وصغيرة وأرقام'
        };
      case 'email':
        return {
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: 'يرجى إدخال بريد إلكتروني صحيح'
        };
      default:
        return { minLength: 0, pattern: /.*/, message: '' };
    }
  };

  const rules = getValidationRules();
  const hasValue = value.length > 0;
  const meetsMinLength = rules.minLength ? value.length >= rules.minLength : true;
  const meetsPattern = rules.pattern ? rules.pattern.test(value) : true;
  const isFieldValid = hasValue && meetsMinLength && meetsPattern;

  if (!hasValue) return null;

  return (
    <AnimatePresence mode="wait">
      {isFieldValid ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs mt-1"
        >
          <CheckCircle className="w-3 h-3" />
          <span>{successMessage || 'صحيح'}</span>
        </motion.div>
      ) : (
        <motion.div
          key="error"
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs mt-1"
        >
          <AlertCircle className="w-3 h-3" />
          <span>{errorMessage || rules.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
