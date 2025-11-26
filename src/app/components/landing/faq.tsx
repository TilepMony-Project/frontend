'use client';

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ: React.FC = () => {
  const faqItems = [
    {
      question:
        "What is TilepMoney and how does it differ from other treasury platforms?",
      answer:
        "TilepMoney is a visual workflow builder for Web3 treasury operations. Unlike traditional platforms, TilepMoney lets you design complex stablecoin workflows with drag-and-drop simplicity, execute them on Mantle L2, and monitor everything in real-time—all without writing code.",
    },
    {
      question: "How does the visual workflow builder work?",
      answer:
        "Our visual workflow builder uses a node-based interface where you drag and drop components to create treasury operations. Each node represents an action (deposit, mint, transfer, etc.), and you connect them to define your workflow logic. The system validates your workflow and simulates it before execution.",
    },
    {
      question: "Is my wallet and data secure with TilepMoney?",
      answer:
        "Yes, security is our top priority. We never store your private keys. All transactions are signed in your wallet, and we implement enterprise-grade security measures including end-to-end encryption, secure data transmission, and compliance with Web3 security best practices.",
    },
    {
      question:
        "Can I integrate TilepMoney with other Web3 tools and platforms?",
      answer:
        "Absolutely! TilepMoney integrates seamlessly with popular Web3 wallets, DeFi protocols, and blockchain networks. We support Mantle L2 natively and are expanding to other chains. Our API-first approach ensures easy connectivity with your existing tech stack.",
    },
    {
      question:
        "How is the pricing structured for TilepMoney? Are there any hidden fees?",
      answer:
        "TilepMoney offers transparent pricing with no hidden fees. We have free tier for testing, and paid plans based on your workflow complexity and execution volume. Gas fees for on-chain transactions are separate and paid directly to the network. Contact our team for custom enterprise pricing.",
    },
    {
      question:
        "I'm new to Web3 treasury operations. Does TilepMoney offer support?",
      answer:
        "Yes! We provide comprehensive onboarding including video tutorials, detailed documentation, example workflows, and a dedicated support team. We also offer webinars, best practices guides, and community support to help you master treasury operations on TilepMoney.",
    },
  ];

  return (
    <div className="flex flex-col items-center gap-4 px-8 lg:px-24 pt-20 lg:pt-32 pb-20 lg:pb-28 bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-10">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 w-full">
            
            {/* Text Content */}
            <div className="flex flex-col gap-6 lg:pr-10 w-full lg:w-auto">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-card border border-border shadow-lg w-fit">
                  <img
                    alt="Sparkle"
                    className="w-4 h-4 lg:w-5 lg:h-5"
                    src="/landing/Sparkle.svg"
                  />
                  <p className="text-sm lg:text-base font-medium text-center text-muted-foreground">
                    FAQ
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="w-full lg:w-96 text-2xl sm:text-3xl lg:text-4xl font-bold text-left text-foreground">
                    Frequently asked questions
                  </p>
                </div>
                <div className="flex items-center gap-2 lg:pr-6">
                  <p className="w-full lg:w-96 opacity-80 text-sm lg:text-base text-left text-muted-foreground leading-relaxed">
                    Explore our frequently asked questions to learn more about
                    TilepMoney's features, security, integration capabilities, and
                    more
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Items */}
            <div className="flex flex-col gap-6 w-full lg:w-auto">
              <Accordion type="single" collapsible defaultValue="item-0">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
