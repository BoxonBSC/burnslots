import { motion } from 'framer-motion';
import { Flame, TrendingUp, Zap } from 'lucide-react';
import { useCyberSlots } from '@/hooks/useCyberSlots';
import { useLanguage } from '@/contexts/LanguageContext';

export function BurnStats() {
  const { totalBurned, totalSpins, prizePool } = useCyberSlots();
  const { t } = useLanguage();

  const formatNumber = (value: string | bigint) => {
    const n = typeof value === 'bigint' ? Number(value) : Number(value);
    if (!Number.isFinite(n) || n <= 0) return '0';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toLocaleString();
  };

  const formatBnb = (value: string) => {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return '0';
    const decimals = n >= 1 ? 2 : n >= 0.01 ? 4 : 6;
    return n.toFixed(decimals).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  };

  const stats = [
    {
      icon: Flame,
      label: t('stats.totalBurned'),
      value: formatNumber(totalBurned),
      suffix: 'TOKENS',
      color: 'text-neon-pink',
      borderColor: 'border-neon-pink/20',
      bgColor: 'from-neon-pink/10 to-transparent',
      iconPulse: true,
    },
    {
      icon: TrendingUp,
      label: t('jackpot.pool'),
      value: formatBnb(prizePool),
      suffix: 'BNB',
      color: 'text-neon-yellow',
      borderColor: 'border-neon-yellow/20',
      bgColor: 'from-neon-yellow/10 to-transparent',
      iconPulse: false,
    },
    {
      icon: Zap,
      label: t('stats.totalSpins'),
      value: formatNumber(totalSpins),
      suffix: 'SPINS',
      color: 'text-neon-blue',
      borderColor: 'border-neon-blue/20',
      bgColor: 'from-neon-blue/10 to-transparent',
      iconPulse: false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto mb-4 sm:mb-5"
    >
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`relative overflow-hidden rounded-xl bg-gradient-to-b ${stat.bgColor} border ${stat.borderColor} p-2.5 sm:p-3.5`}
          >
            <div className="relative flex flex-col items-center text-center gap-0.5">
              <div className="flex items-center gap-1">
                <stat.icon className={`w-3.5 h-3.5 ${stat.color} ${stat.iconPulse ? 'animate-pulse' : ''}`} />
                <span className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <motion.span
                key={stat.value}
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                className={`text-lg sm:text-2xl font-display font-bold ${stat.color}`}
              >
                {stat.value}
              </motion.span>
              <span className={`text-[9px] sm:text-[10px] ${stat.color} opacity-50`}>{stat.suffix}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
