import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * CINEMATIC ANIMATION HOOKS FOR WEB3 DAPP LANDING PAGE
 * Enhanced with advanced easing, scale, rotation, blur, and parallax effects
 */

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
 * ENHANCED: Cinematic fade in with scale, rotation, and blur
 * Perfect for hero elements and important CTAs
 */
export function useFadeInOnScroll(options?: {
  y?: number;
  x?: number;
  scale?: number;
  rotation?: number;
  blur?: number;
  duration?: number;
  delay?: number;
  scrub?: boolean;
  ease?: string;
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
            x: options?.x || 0,
            scale: options?.scale || 1,
            rotation: options?.rotation || 0,
            filter: options?.blur ? `blur(${options.blur}px)` : "blur(0px)",
            willChange: "transform, opacity, filter",
          },
          {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            rotation: 0,
            filter: "blur(0px)",
            scrollTrigger: {
              trigger: elementRef.current,
              start: "top 90%",
              end: "top 60%",
              scrub: 0.5,
            },
          }
        );
      } else {
        // Toggle mode with cinematic entrance
        gsap.fromTo(
          elementRef.current,
          {
            opacity: 0,
            y: options?.y || 30,
            x: options?.x || 0,
            scale: options?.scale !== undefined ? options.scale : 0.95,
            rotation: options?.rotation || 0,
            filter: options?.blur ? `blur(${options.blur}px)` : "blur(0px)",
            willChange: "transform, opacity, filter",
          },
          {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            rotation: 0,
            filter: "blur(0px)",
            duration: options?.duration || 1.2,
            delay: options?.delay || 0,
            ease: options?.ease || "power3.out",
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
  }, [
    options?.y,
    options?.x,
    options?.scale,
    options?.rotation,
    options?.blur,
    options?.duration,
    options?.delay,
    options?.scrub,
    options?.ease,
  ]);

  return elementRef;
}

/**
 * ENHANCED: Cinematic stagger animation with scale and rotation
 * Perfect for card grids and feature lists
 */
export function useStaggerFade(options?: {
  stagger?: number;
  y?: number;
  x?: number;
  scale?: number;
  rotation?: number;
  blur?: number;
  duration?: number;
  ease?: string;
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
          y: options?.y || 40,
          x: options?.x || 0,
          scale: options?.scale !== undefined ? options.scale : 0.9,
          rotation: options?.rotation || 0,
          filter: options?.blur ? `blur(${options.blur}px)` : "blur(0px)",
        },
        {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          rotation: 0,
          filter: "blur(0px)",
          duration: options?.duration || 0.8,
          stagger: options?.stagger || 0.12,
          ease: options?.ease || "power3.out",
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
  }, [
    options?.stagger,
    options?.y,
    options?.x,
    options?.scale,
    options?.rotation,
    options?.blur,
    options?.duration,
    options?.ease,
  ]);

  return containerRef;
}

/**
 * NEW: Parallax scroll effect for depth and dimension
 * Creates layered movement for immersive experience
 */
export function useParallaxScroll(options?: {
  speed?: number;
  direction?: "up" | "down" | "left" | "right";
  start?: string;
  end?: string;
}) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const speed = options?.speed || 0.5;
    const direction = options?.direction || "up";

    const ctx = gsap.context(() => {
      let yMovement = 0;
      let xMovement = 0;

      switch (direction) {
        case "up":
          yMovement = -100 * speed;
          break;
        case "down":
          yMovement = 100 * speed;
          break;
        case "left":
          xMovement = -100 * speed;
          break;
        case "right":
          xMovement = 100 * speed;
          break;
      }

      gsap.to(elementRef.current, {
        y: yMovement,
        x: xMovement,
        ease: "none",
        scrollTrigger: {
          trigger: elementRef.current,
          start: options?.start || "top bottom",
          end: options?.end || "bottom top",
          scrub: 1,
        },
      });
    });

    return () => ctx.revert();
  }, [options?.speed, options?.direction, options?.start, options?.end]);

  return elementRef;
}

/**
 * NEW: Reveal animation with clip-path
 * Creates dramatic entrance effect
 */
export function useRevealAnimation(options?: {
  direction?: "left" | "right" | "top" | "bottom";
  duration?: number;
  delay?: number;
  ease?: string;
}) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const direction = options?.direction || "bottom";
    let clipPathFrom = "";
    let clipPathTo = "inset(0% 0% 0% 0%)";

    switch (direction) {
      case "left":
        clipPathFrom = "inset(0% 0% 0% 100%)";
        break;
      case "right":
        clipPathFrom = "inset(0% 100% 0% 0%)";
        break;
      case "top":
        clipPathFrom = "inset(100% 0% 0% 0%)";
        break;
      case "bottom":
        clipPathFrom = "inset(0% 0% 100% 0%)";
        break;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elementRef.current,
        {
          clipPath: clipPathFrom,
        },
        {
          clipPath: clipPathTo,
          duration: options?.duration || 1.2,
          delay: options?.delay || 0,
          ease: options?.ease || "power3.inOut",
          scrollTrigger: {
            trigger: elementRef.current,
            start: "top 85%",
            toggleActions: "play reverse play reverse",
          },
        }
      );
    });

    return () => ctx.revert();
  }, [options?.direction, options?.duration, options?.delay, options?.ease]);

  return elementRef;
}

/**
 * NEW: Magnetic hover effect for interactive elements
 * Creates smooth follow-cursor animation
 */
export function useMagneticHover(strength: number = 0.3) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;

      gsap.to(element, {
        x: deltaX,
        y: deltaY,
        duration: 0.5,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.5)",
      });
    };

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [strength]);

  return elementRef;
}

/**
 * NEW: Elastic scale animation for badges and labels
 * Creates bouncy, attention-grabbing entrance
 */
export function useElasticEntrance(options?: {
  delay?: number;
  rotation?: number;
}) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elementRef.current,
        {
          opacity: 0,
          scale: 0,
          rotation: options?.rotation || -10,
        },
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 1.2,
          delay: options?.delay || 0,
          ease: "elastic.out(1, 0.6)",
          scrollTrigger: {
            trigger: elementRef.current,
            start: "top 90%",
            toggleActions: "play reverse play reverse",
          },
        }
      );
    });

    return () => ctx.revert();
  }, [options?.delay, options?.rotation]);

  return elementRef;
}
