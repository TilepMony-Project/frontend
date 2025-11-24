'use client';

import styles from './landing.module.css';

import { Icon } from '@/components/icons';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';

const featureList = [
  {
    icon: 'Cards',
    title: 'Visual orchestration',
    description: 'Drag-and-drop nodes to model treasury, settlement, and DeFi flows in minutes.',
  },
  {
    icon: 'ShieldCheck',
    title: 'Safe execution',
    description:
      'Node validation, staged simulation, and audit trails keep stablecoin ops compliant.',
  },
  {
    icon: 'Play',
    title: 'One-click deployment',
    description:
      'Run workflows on Mantle testnet today and graduate to production with no rewrites.',
  },
];

export default function LandingPage() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.replace('/dashboard');
    }
  }, [isConnected, router]);

  return (
    <main className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.copy}>
          <p className={styles.badge}>TilepMoney · Web3 Treasury</p>
          <h1 className={styles.heroTitle}>Orchestrate stablecoin operations without code.</h1>
          <p className={styles.subtitle}>
            Connect your wallet to unlock the workflow builder, automate settlements, and monitor
            flows in real time.
          </p>
          <div className={styles.ctaRow}>
            <ConnectButton />
            <button
              type="button"
              className={styles.secondaryCta}
              onClick={() =>
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
              }
            >
              Learn more
            </button>
          </div>
          <p className={styles.helperText}>
            Wallet connect = instant access to dashboard & workspace.
          </p>
        </div>
        <div className={styles.previewCard}>
          <div className={styles.previewHeader}>
            <Icon name="LayoutGrid" size={20} />
            <span>Workflow Preview</span>
          </div>
          <ul className={styles.previewSteps}>
            <li>Deposit → Mint</li>
            <li>Partition → Bridge</li>
            <li>Vault → Transfer</li>
          </ul>
          <p className={styles.previewFooter}>Secure on Mantle L2 · Full audit log</p>
        </div>
      </section>

      <section className={styles.features}>
        {featureList.map((feature) => (
          <article key={feature.title} className={styles.featureCard}>
            <Icon name={feature.icon} size={24} />
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
