"use client";

import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { TemplateMiniPreview } from "./template-mini-preview";

interface TemplateCardProps {
  templateId: string;
  name: string;
  category: string;
  description: string;
  className?: string;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  templateId,
  name,
  category,
  description,
  className = "",
}) => {
  return (
    <Link
      href={`/dashboard?template=${templateId}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl",
        "bg-card border border-primary/20 dark:border-white/20",
        "hover:border-primary dark:hover:border-primary/60",
        "transition-all duration-300 hover:shadow-lg hover:shadow-primary/10",
        className
      )}
    >
      {/* Mini Canvas Preview */}
      <div className="relative w-full h-44 lg:h-52 overflow-hidden bg-muted/30">
        <TemplateMiniPreview templateId={templateId} />

        {/* Category Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2.5 py-1 rounded-full bg-primary/90 text-[10px] font-bold text-white uppercase tracking-wide">
            {category}
          </span>
        </div>

        {/* Gradient overlay for better text contrast */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none" />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-5">
        <h3 className="text-base lg:text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 min-h-[2.5rem]">
          {description}
        </p>

        {/* CTA */}
        <div className="flex items-center gap-1 mt-2 text-sm font-medium text-primary">
          <span>Use Template</span>
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </div>
    </Link>
  );
};
