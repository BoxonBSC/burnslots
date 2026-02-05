import { motion } from 'framer-motion';
import { Copy, ExternalLink, FileCode } from 'lucide-react';
import { CYBER_SLOTS_ADDRESS, CYBER_TOKEN_ADDRESS } from '@/config/contracts';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

export function ContractAddresses() {
  const { t } = useLanguage();

  const copyAddress = (address: string, name: string) => {
    navigator.clipboard.writeText(address);
    toast.success(`${name} ${t('contract.copied')}`);
  };

  const isDeployed = (address: string) => 
    address !== '0x0000000000000000000000000000000000000000';

  const formatAddress = (address: string) => 
    isDeployed(address) 
      ? `${address.slice(0, 8)}...${address.slice(-6)}`
      : t('contract.pending');

  const contracts = [
    {
      label: t('contract.game'),
      address: CYBER_SLOTS_ADDRESS.mainnet,
      icon: <FileCode className="w-3 h-3 text-neon-cyan" />,
      color: 'text-neon-cyan',
      hoverBg: 'hover:bg-neon-cyan/10',
      scanUrl: (addr: string) => `https://bscscan.com/address/${addr}`,
    },
    {
      label: t('contract.token'),
      address: CYBER_TOKEN_ADDRESS.mainnet,
      icon: <span className="text-xs">🪙</span>,
      color: 'text-neon-yellow',
      hoverBg: 'hover:bg-neon-yellow/10',
      scanUrl: (addr: string) => `https://bscscan.com/token/${addr}`,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="flex flex-wrap justify-center gap-2 mt-2 mb-3"
    >
      {contracts.map((c) => (
        <div
          key={c.label}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/20 border border-border/40 text-xs"
        >
          {c.icon}
          <span className={`font-display ${c.color} text-[11px]`}>{c.label}:</span>
          <code className="text-foreground/70 font-mono text-[11px]">
            {formatAddress(c.address)}
          </code>
          <button
            onClick={() => copyAddress(c.address, c.label)}
            className={`p-0.5 rounded ${c.hoverBg} transition-colors`}
          >
            <Copy className="w-2.5 h-2.5 text-muted-foreground" />
          </button>
          {isDeployed(c.address) && (
            <a
              href={c.scanUrl(c.address)}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-0.5 rounded ${c.hoverBg} transition-colors`}
            >
              <ExternalLink className="w-2.5 h-2.5 text-muted-foreground" />
            </a>
          )}
        </div>
      ))}
    </motion.div>
  );
}
