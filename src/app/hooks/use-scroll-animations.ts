import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Hook for simple fade in/out animation based on scroll position
 * Element fades in when entering viewport and fades out when leaving
 */
export function useFadeScroll(options?: {
  start?: string;
  end?: string;
  scrub?: boolean | number;
}) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elementRef.current,
        {
          opacity: 0,
        },
        {
          opacity: 1,
          scrollTrigger: {
            trigger: elementRef.current,
            start: options?.start || "top 80%",
            end: options?.end || "bottom 20%",
            scrub: options?.scrub ?? 0.5,
            toggleActions: "play reverse play reverse",
          },
        }
      );
    });

    return () => ctx.revert();
  }, [options?.start, options?.end, options?.scrub]);

  return elementRef;
}

/**
 * Hook for fade in animation with optional Y movement
 * Fades in when entering viewport and fades out when leaving
 */
export function useFadeInOnScroll(options?: {
  y?: number;
  duration?: number;
  delay?: number;
  scrub?: boolean;
}) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const ctx = gsap.context(() => {
      if (options?.scrub) {
        // Scrub mode - smooth fade based on scroll position
        gsap.fromTo(
          elementRef.current,
          {
            opacity: 0,
            y: options?.y || 30,
          },
          {
            opacity: 1,
            y: 0,
            scrollTrigger: {
              trigger: elementRef.current,
              start: "top 90%",
              end: "top 60%",
              scrub: 0.5,
            },
          }
        );
      } else {
        // Toggle mode - reverse animation when scrolling back
        gsap.fromTo(
          elementRef.current,
          {
            opacity: 0,
            y: options?.y || 30,
          },
          {
            opacity: 1,
            y: 0,
            duration: options?.duration || 0.8,
            delay: options?.delay || 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: elementRef.current,
              start: "top 85%",
              end: "bottom 15%",
              toggleActions: "play reverse play reverse",
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, [options?.y, options?.duration, options?.delay, options?.scrub]);

  return elementRef;
}

/**
 * Hook for stagger fade in animation on children
 * Children fade in sequentially when container enters viewport
 * Fades out when leaving viewport
 */
export function useStaggerFade(options?: {
  stagger?: number;
  y?: number;
  duration?: number;
}) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const children = containerRef.current.children;
    if (!children.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        children,
        {
          opacity: 0,
          y: options?.y || 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: options?.duration || 0.6,
          stagger: options?.stagger || 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play reverse play reverse",
          },
        }
      );
    });

    return () => ctx.revert();
  }, [options?.stagger, options?.y, options?.duration]);

  return containerRef;
}
