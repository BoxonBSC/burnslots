import { motion } from 'framer-motion';
import { AdvancedSlotMachine } from '@/components/AdvancedSlotMachine';
import { WalletConnect } from '@/components/WalletConnect';
import { CompactRewardTiers } from '@/components/CompactRewardTiers';
import { CompactGameHistory } from '@/components/CompactGameHistory';
import { FloatingElements } from '@/components/FloatingElements';
import { JackpotTicker } from '@/components/JackpotTicker';
import { CreditsExchange } from '@/components/CreditsExchange';
import { BurnStats } from '@/components/BurnStats';
import { Navbar } from '@/components/Navbar';
import { ContractAddresses } from '@/components/ContractAddresses';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background cyber-grid relative overflow-x-hidden">
      {/* Subtle scanlines */}
      <div className="fixed inset-0 pointer-events-none scanlines opacity-20" />
      
      {/* Ambient glow - desktop only */}
      {!isMobile && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-neon-blue/[0.04] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-neon-purple/[0.03] rounded-full blur-[120px]" />
        </div>
      )}

      {/* Floating elements - reduced */}
      <FloatingElements count={isMobile ? 4 : 8} />
      
      <Navbar />
      
      <main className="container mx-auto px-3 sm:px-4 pt-18 sm:pt-22 pb-6 sm:pb-10 relative z-10">
        {/* Hero - compact & impactful */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4 sm:mb-8"
        >
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold text-shimmer mb-2 sm:mb-3 tracking-tight">
            FOURSLOTS
          </h1>
          
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto mb-4">
            {t('home.tag.symbols')} · {t('home.tag.payline')} · {t('home.tag.return')}
          </p>

          {/* Contract Addresses */}
          <ContractAddresses />

          {/* Global Stats */}
          <BurnStats />

          {/* Win Ticker */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <JackpotTicker />
          </motion.div>
        </motion.div>

        {/* Mobile Layout - single column */}
        <div className="lg:hidden space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <AdvancedSlotMachine />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <WalletConnect />
            <CreditsExchange />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <CompactRewardTiers />
          </motion.div>
        </div>

        {/* Desktop Layout - 3 columns */}
        <div className="hidden lg:grid xl:grid-cols-[300px_1fr_280px] lg:grid-cols-[260px_1fr_240px] gap-5 items-start">
          {/* Left - Wallet + Exchange + History */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col gap-4 sticky top-20"
          >
            <WalletConnect />
            <CreditsExchange />
            <CompactGameHistory />
          </motion.div>

          {/* Center - Slot Machine */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <AdvancedSlotMachine />
          </motion.div>

          {/* Right - Reward Tiers */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="sticky top-20"
          >
            <CompactRewardTiers />
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 sm:mt-12 text-center text-xs text-muted-foreground"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/20 border border-border/50">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
            <span>{t('footer.onchain')}</span>
            <span className="text-border">·</span>
            <span>{t('footer.poweredBy')}</span>
          </div>
        </motion.footer>
      </main>
    </div>
  );
};

export default Index;
