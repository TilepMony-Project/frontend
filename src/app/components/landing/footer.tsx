"use client";

import type React from "react";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";
import {
  useFadeInOnScroll,
  useStaggerFade,
} from "@/hooks/use-scroll-animations";

const Footer: React.FC = () => {
  // Cinematic animation refs with enhanced effects
  const logoRef = useFadeInOnScroll({ 
    delay: 0, 
    y: 30, 
    scale: 0.9,
    duration: 1.2,
    ease: "power3.out"
  });
  const columnsRef = useStaggerFade({ 
    stagger: 0.15, 
    y: 40, 
    scale: 0.92,
    blur: 4,
    duration: 1.1,
    ease: "power3.out"
  });
  const bottomRef = useFadeInOnScroll({ 
    delay: 0.2, 
    y: 20, 
    scale: 0.95,
    duration: 1,
    ease: "power3.out"
  });

  return (
    <div className="flex flex-col gap-16 px-8 lg:px-24 pt-16 lg:pt-20 pb-10">
      <div className="flex flex-col gap-16">
        {/* Logo Section */}
        <div 
          ref={logoRef as React.RefObject<HTMLDivElement>}
          className="flex items-center gap-5"
        >
          <div className="flex items-center gap-1">
            <img
              alt="TilepMoney Logo"
              className="w-10 h-10 sm:w-12 sm:h-12"
              src="/tilepmoney.png"
            />
          </div>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Footer Links */}
        <div 
          ref={columnsRef as React.RefObject<HTMLDivElement>}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {/* About TilepMoney */}
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-foreground">About TilepMoney</h3>
            <div className="flex flex-col gap-2">
              <Link
                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
                href="#"
              >
                Company Overview
              </Link>
              <Link
                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
                href="#"
              >
                Careers
              </Link>
              <Link
                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
                href="#"
              >
                Press & Media
              </Link>
              <Link
                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
                href="#"
              >
                Testimonials
              </Link>
            </div>
          </div>
          {/* Resources */}
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-foreground">Resources</h3>
            <div className="flex flex-col gap-2">
              <Link
                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
                href="#"
              >
                Blog
              </Link>
              <Link
                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
                href="#"
              >
                Help Center
              </Link>
              <Link
                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
                href="#"
              >
                Webinars & Events
              </Link>
              <Link
                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
                href="#"
              >
                Case Studies
              </Link>
            </div>
          </div>
          {/* Support & Contact */}
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-foreground">Support & Contact</h3>
            <div className="flex flex-col gap-2">
              <Link
                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
                href="#"
              >
                Contact Us
              </Link>
              <Link
                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
                href="#"
              >
                Technical Support
              </Link>
              <Link
                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
                href="#"
              >
                Feedback
              </Link>
              <Link
                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
                href="#"
              >
                Community Forum
              </Link>
            </div>
          </div>
          {/* Connect */}
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-foreground">Connect</h3>
            <div className="flex flex-col gap-2">
              <Link
                className="flex items-center gap-2 text-base font-medium text-muted-foreground hover:text-foreground transition-colors duration-300 min-h-12"
                href="#"
              >
                <Instagram className="w-4 h-4" />
                Instagram
              </Link>
              <Link
                className="flex items-center gap-2 text-base font-medium text-muted-foreground hover:text-foreground transition-colors duration-300 min-h-12"
                href="#"
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </Link>
              <Link
                className="flex items-center gap-2 text-base font-medium text-muted-foreground hover:text-foreground transition-colors duration-300 min-h-12"
                href="#"
              >
                <Twitter className="w-4 h-4" />
                Twitter / X
              </Link>
              <Link
                className="flex items-center gap-2 text-base font-medium text-muted-foreground hover:text-foreground transition-colors duration-300 min-h-12"
                href="#"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div 
        ref={bottomRef as React.RefObject<HTMLDivElement>}
        className="border-t border-border pt-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">©2025 TilepMoney · All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
              href="#"
            >
              Terms of Use
            </Link>
            <Link
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
              href="#"
            >
              Privacy Policy
            </Link>
            <Link
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
              href="#"
            >
              Security
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
