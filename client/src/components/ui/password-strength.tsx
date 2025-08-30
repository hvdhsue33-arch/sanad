import { motion } from 'framer-motion';

interface PasswordStrengthProps {
  password: string;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    let feedback = [];

    // طول كلمة المرور
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // وجود أحرف كبيرة
    if (/[A-Z]/.test(password)) score += 1;
    
    // وجود أحرف صغيرة
    if (/[a-z]/.test(password)) score += 1;
    
    // وجود أرقام
    if (/\d/.test(password)) score += 1;
    
    // وجود رموز خاصة
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

    // تحديد القوة
    if (score <= 2) {
      return { score, label: 'ضعيفة', color: 'bg-red-500' };
    } else if (score <= 3) {
      return { score, label: 'متوسطة', color: 'bg-yellow-500' };
    } else if (score <= 4) {
      return { score, label: 'جيدة', color: 'bg-blue-500' };
    } else {
      return { score, label: 'قوية', color: 'bg-green-500' };
    }
  };

  const strength = getPasswordStrength(password);
  const maxScore = 6;

  if (!password) return null;

  return (
    <motion.div
      className="mt-2 space-y-2"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600 dark:text-gray-400">قوة كلمة المرور:</span>
        <span className={`font-medium ${strength.color.replace('bg-', 'text-')}`}>
          {strength.label}
        </span>
      </div>
      
      <div className="flex space-x-1 rtl:space-x-reverse">
        {Array.from({ length: maxScore }).map((_, index) => (
          <motion.div
            key={index}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              index < strength.score ? strength.color : 'bg-gray-200 dark:bg-gray-700'
            }`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          />
        ))}
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {strength.score < 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1"
          >
            💡 نصيحة: أضف أحرف كبيرة وأرقام ورموز خاصة لتقوية كلمة المرور
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
