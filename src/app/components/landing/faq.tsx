"use client";

import type React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  useFadeInOnScroll,
  useStaggerFade,
} from "@/hooks/use-scroll-animations";

const FAQ: React.FC = () => {
  const faqItems = [
    {
      question: "What is TilepMoney and how does it help B2B payment infrastructure?",
      answer:
        "TilepMoney is a codeless stablecoin orchestration builder for B2B payments infrastructure. It enables businesses to visually design and configure stablecoin movement workflows (Deposit → Mint → Swap → Bridge → Output) on Mantle L2. Everything is modular, provider-agnostic, and designed for integration into enterprise backend pipelines.",
    },
    {
      question: "How does the visual drag-and-drop workflow builder work?",
      answer:
        "Our visual workflow builder uses a node-based interface where you drag and drop modular nodes to create stablecoin payment flows. Each node represents an action (Deposit, Mint, Swap, Bridge, Redeem, Transfer, Vault, Wait, Partition) and is fully configurable via a right-side panel. You connect nodes to define your workflow logic, and the system validates and simulates it before execution.",
    },
    {
      question: "What makes TilepMoney suitable for enterprise B2B operations?",
      answer:
        "TilepMoney is B2B-oriented with enterprise-friendly features: API entrypoints for backend integration, workflow storage, authentication layer with API keys for businesses, complete routing transparency for audits and compliance, provider-agnostic choice for issuers and bridges, and L2-based approach for safe experimentation before deploying real money flows.",
    },
    {
      question: "Can I test workflows safely before deploying to production?",
      answer:
        "Yes! TilepMoney runs entirely on Mantle L2, allowing businesses to test their routing logic safely before deploying real money flows. You can experiment with different provider combinations, workflow configurations, and output strategies without any financial risk.",
    },
    {
      question: "What types of nodes are available and what can I build with them?",
      answer:
        "TilepMoney offers 9 node types: Deposit (bring fiat into system), Mint (convert fiat to stablecoin), Swap (exchange tokens), Bridge (move assets across chains), Redeem (convert stablecoin to fiat), Transfer (send to wallets), Vault (earn yield with stop conditions), Wait (delay execution), and Partition (split amounts into multiple branches). You can build complex workflows like corporate payments, treasury automation, merchant settlements, and cross-chain liquidity management.",
    },
    {
      question: "How does TilepMoney ensure routing transparency and compliance?",
      answer:
        "TilepMoney provides complete routing transparency by visualizing how money moves through each provider in your workflow. Every step is auditable, and you can see exactly which issuers, swap providers, and bridges are used. This transparency is essential for enterprise audits, compliance requirements, and understanding the complete flow of funds through your payment infrastructure.",
    },
  ];

  // Cinematic animation refs with enhanced effects
  const badgeRef = useFadeInOnScroll({ 
    delay: 0, 
    y: 20, 
    scale: 0.85,
    blur: 6,
    duration: 0.8,
    ease: "power3.out"
  });
  const headlineRef = useFadeInOnScroll({ 
    delay: 0.2, 
    y: 40, 
    scale: 0.93,
    blur: 5,
    duration: 1.5,
    ease: "power4.out"
  });
  const descriptionRef = useFadeInOnScroll({ 
    delay: 0.4, 
    y: 30, 
    scale: 0.95,
    duration: 1.3,
    ease: "power3.out"
  });
  const faqItemsRef = useStaggerFade({ 
    stagger: 0.12, 
    y: 40, 
    scale: 0.92,
    blur: 4,
    duration: 1,
    ease: "power3.out"
  });

  return (
    <div id="faq" className="flex flex-col items-center gap-4 px-8 lg:px-24 pt-20 lg:pt-32 pb-20 lg:pb-28">
      <div className="flex flex-col items-center gap-4 w-full max-w-7xl">
        <div className="flex flex-col items-center gap-10 w-full">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 w-full">
            {/* Text Content */}
            <div className="flex flex-col gap-6 lg:pr-10 w-full lg:w-auto lg:min-w-[380px]">
              <div className="flex flex-col gap-4">
                <div 
                  ref={badgeRef as React.RefObject<HTMLDivElement>}
                  className="group flex items-center gap-2 px-3 py-2 rounded-2xl border-[1px] bg-card shadow-lg hover:shadow-xl border-primary dark:border-white/40 hover:border-primary dark:hover:border-primary transition-all duration-300 hover:bg-gradient-to-r hover:from-card hover:to-primary/5 hover:cursor-default w-fit"
                >
                  <img
                    alt="Sparkle"
                    className="w-4 h-4 lg:w-5 lg:h-5 group-hover:rotate-12 transition-transform duration-300"
                    src="/landing/Sparkle.svg"
                  />
                  <p className="text-sm lg:text-base font-medium text-center text-muted-foreground group-hover:text-primary transition-colors duration-300">
                    FAQ
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <h2 
                    ref={headlineRef as React.RefObject<HTMLHeadingElement>}
                    className="w-full lg:w-96 text-2xl sm:text-3xl lg:text-4xl font-bold text-left leading-tight"
                  >
                    <span className="text-gray-900 dark:text-gray-100">
                      Frequently asked{" "}
                    </span>
                    <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      questions
                    </span>
                  </h2>
                </div>
                <div 
                  ref={descriptionRef as React.RefObject<HTMLDivElement>}
                  className="flex items-center gap-2 lg:pr-6"
                >
                  <p className="w-full lg:w-96 opacity-80 text-sm lg:text-base text-left text-muted-foreground leading-relaxed">
                    Explore our frequently asked questions to learn more about TilepMoney's
                    features, security, integration capabilities, and more
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Items */}
            <div className="flex flex-col gap-4 w-full lg:flex-1">
              <Accordion
                type="single"
                collapsible
                defaultValue="item-0"
                className="w-full space-y-3"
                ref={faqItemsRef as React.RefObject<HTMLDivElement>}
              >
                {faqItems.map((item, index) => (
                  <AccordionItem
                    key={item.question}
                    value={`item-${index}`}
                    className="border-[1px] border-primary/20 dark:border-white/40 bg-card rounded-xl px-5 py-1 hover:border-primary dark:hover:border-primary/40 transition-all duration-300 group data-[state=open]:border-primary/50 data-[state=open]:bg-card/80"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-5 text-base lg:text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm lg:text-base leading-relaxed pb-5 pt-1">
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
