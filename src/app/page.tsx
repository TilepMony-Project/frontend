'use client';

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
    <main className="min-h-screen pt-12 pb-16 px-6 bg-[radial-gradient(circle_at_top,color-mix(in_srgb,var(--ax-colors-acc1-500),transparent_70%),transparent_70%),var(--ax-ui-bg-secondary-default)] flex flex-col gap-12">
      <section className="flex flex-wrap gap-10 items-center justify-between flex-col md:flex-row">
        <div className="max-w-[560px] flex flex-col gap-4">
          <p className="inline-flex items-center gap-[0.35rem] rounded-full px-[0.9rem] py-[0.35rem] bg-[color-mix(in_srgb,var(--ax-colors-acc1-500),transparent_75%)] text-[var(--ax-colors-acc1-900)] font-semibold">
            TilepMoney · Web3 Treasury
          </p>
          <h1 className="m-0 text-[clamp(2.25rem,5vw,3rem)] text-[var(--ax-txt-primary-default)]">
            Orchestrate stablecoin operations without code.
          </h1>
          <p className="m-0 text-[var(--ax-txt-secondary-default)] text-[1.1rem]">
            Connect your wallet to unlock the workflow builder, automate settlements, and monitor
            flows in real time.
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <ConnectButton />
            <button
              type="button"
              className="rounded-full border border-[var(--ax-ui-stroke-secondary-default)] px-7 py-3 bg-transparent text-[var(--ax-txt-primary-default)] font-semibold cursor-pointer"
              onClick={() =>
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
              }
            >
              Learn more
            </button>
          </div>
          <p className="m-0 text-[0.95rem] text-[var(--ax-txt-secondary-default)]">
            Wallet connect = instant access to dashboard & workspace.
          </p>
        </div>
        <div className="flex-1 min-w-[280px] max-w-[420px] rounded-3xl p-6 bg-[var(--ax-ui-bg-primary-default)] border border-[var(--ax-ui-stroke-secondary-default)] shadow-[0_30px_80px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-2 font-semibold text-[var(--ax-txt-primary-default)]">
            <Icon name="LayoutGrid" size={20} />
            <span>Workflow Preview</span>
          </div>
          <ul className="list-none p-0 my-6 grid gap-3 text-[var(--ax-txt-secondary-default)] font-medium">
            <li>Deposit → Mint</li>
            <li>Partition → Bridge</li>
            <li>Vault → Transfer</li>
          </ul>
          <p className="m-0 text-[0.9rem] text-[var(--ax-txt-secondary-default)]">
            Secure on Mantle L2 · Full audit log
          </p>
        </div>
      </section>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
        {featureList.map((feature) => (
          <article
            key={feature.title}
            className="bg-[var(--ax-ui-bg-primary-default)] border border-[var(--ax-ui-stroke-secondary-default)] rounded-2xl p-5 flex flex-col gap-3 shadow-[0_15px_40px_rgba(0,0,0,0.05)]"
          >
            <Icon name={feature.icon} size={24} />
            <h3 className="m-0 text-[1.1rem] text-[var(--ax-txt-primary-default)]">
              {feature.title}
            </h3>
            <p className="m-0 text-[var(--ax-txt-secondary-default)] text-[0.95rem]">
              {feature.description}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
