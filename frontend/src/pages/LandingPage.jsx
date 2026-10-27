import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import LandingNav from '../components/landing/LandingNav';
import HeroText from '../components/landing/HeroText';
import ThreeScene, { isWebGLAvailable } from '../components/landing/ThreeScene';
import FeatureCards from '../components/landing/FeatureCards';
import StepIndicator from '../components/landing/StepIndicator';
import FallbackView from '../components/landing/FallbackView';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export const LandingPage = ({ onNavigate }) => {
  const runwayRef = useRef(null);
  const stageRef = useRef(null);
  const heroWrapperRef = useRef(null);
  const scrollProgressRef = useRef(0);
  const orbGroupRef = useRef(null);

  const scrollUnlockedRef = useRef(false);
  const scrollTriggerRef = useRef(null);

  const [cardsState, setCardsState] = useState([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [scrollUnlocked, setScrollUnlocked] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [stepIndicatorVisible, setStepIndicatorVisible] = useState(false);

  useEffect(() => {
    scrollUnlockedRef.current = scrollUnlocked;
  }, [scrollUnlocked]);

  useEffect(() => {
    const isAvailable = isWebGLAvailable();
    setWebglSupported(isAvailable);

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);

    const handleMotionChange = (e) => setReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  const handleSceneReady = useCallback(({ orbGroup }) => {
    orbGroupRef.current = orbGroup;
  }, []);

  const handleUpdateCards = useCallback((newCardsState) => {
    setCardsState(newCardsState);
  }, []);

  const handleActiveCardChange = useCallback((newIndex) => {
    setActiveCardIndex(newIndex);
  }, []);

  const createScrollTrigger = useCallback(() => {
    const runway = runwayRef.current;
    const heroEl = heroWrapperRef.current;
    if (!runway || !heroEl) return null;

    if (scrollTriggerRef.current) {
      scrollTriggerRef.current.kill();
      scrollTriggerRef.current = null;
    }

    const st = ScrollTrigger.create({
      trigger: runway,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.8,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const progress = self.progress;
        scrollProgressRef.current = progress;

        if (progress <= 0.22) {
          const heroFade = Math.max(0, 1 - progress / 0.18);
          const heroDrift = -progress * 180;
          gsap.set(heroEl, {
            opacity: heroFade,
            y: heroDrift,
            scale: 1.0 - progress * 0.15,
            pointerEvents: heroFade > 0.4 ? 'auto' : 'none',
          });
        } else {
          gsap.set(heroEl, { opacity: 0, pointerEvents: 'none' });
        }

        if (progress > 0.02) {
          setShowScrollHint(false);
        } else if (scrollUnlockedRef.current) {
          setShowScrollHint(true);
        }

        setStepIndicatorVisible(progress > 0.36);
      },
    });

    scrollTriggerRef.current = st;
    return st;
  }, []);

  useEffect(() => {
    if (!webglSupported || reducedMotion) {
      setScrollUnlocked(true);
      setShowScrollHint(false);
      return;
    }

    const runway = runwayRef.current;
    const stage = stageRef.current;
    const heroEl = heroWrapperRef.current;
    if (!runway || !stage || !heroEl) return;

    const ctx = gsap.context(() => {
      gsap.set('#landing-header', { y: -25, opacity: 0 });
      gsap.set('.hero-badge', { y: 20, opacity: 0 });
      gsap.set('.hero-line-1', { y: '110%' });
      gsap.set('.hero-line-2', { y: '110%' });
      gsap.set('.hero-subtext', { y: 25, opacity: 0 });
      gsap.set('.hero-cta-primary', { scale: 0.9, opacity: 0 });
      gsap.set('.hero-cta-secondary', { scale: 0.9, opacity: 0 });

      const introTl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          playOrbEntrance();
        },
      });

      introTl
        .to('#landing-header', { y: 0, opacity: 1, duration: 0.8 }, 0.1)
        .to('.hero-badge', { y: 0, opacity: 1, duration: 0.6 }, 0.3)
        .to('.hero-line-1', { y: '0%', duration: 1.0, ease: 'power4.out' }, 0.45)
        .to('.hero-line-2', { y: '0%', duration: 1.0, ease: 'power4.out' }, 0.65)
        .to('.hero-subtext', { y: 0, opacity: 1, duration: 0.8 }, 1.0)
        .to('.hero-cta-primary', { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.5)' }, 1.25)
        .to('.hero-cta-secondary', { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.5)' }, 1.35);

      // Function to trigger orb reveal after text intro
      const playOrbEntrance = () => {
        const orbGroup = orbGroupRef.current;
        const orbTimeline = gsap.timeline({
          onComplete: () => {
            unlockScrolling();
          },
        });

        if (orbGroup) {
          orbTimeline.to(orbGroup.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 1.4,
            ease: 'expo.out',
          });
        } else {
          unlockScrolling();
        }
      };

      const unlockScrolling = () => {
        document.body.style.overflow = '';
        document.body.style.overflowX = 'hidden';

        setScrollUnlocked(true);
        setShowScrollHint(true);

        requestAnimationFrame(() => {
          createScrollTrigger();

          ScrollTrigger.refresh(true);

          setTimeout(() => {
            ScrollTrigger.refresh(true);
          }, 100);
        });
      };

      const safetyTimeout = setTimeout(() => {
        if (!scrollUnlockedRef.current) {
          unlockScrolling();
          if (orbGroupRef.current && orbGroupRef.current.scale.x < 0.5) {
            gsap.to(orbGroupRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.8 });
          }
        }
      }, 4500);

      return () => {
        clearTimeout(safetyTimeout);
        if (scrollTriggerRef.current) {
          scrollTriggerRef.current.kill();
          scrollTriggerRef.current = null;
        }
        introTl.kill();
      };
    }, runway);

    return () => {
      ctx.revert();
    };
  }, [webglSupported, reducedMotion, createScrollTrigger]);

  useEffect(() => {
    if (!webglSupported || reducedMotion) {
      document.body.style.overflow = '';
      return;
    }

    if (!scrollUnlocked) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.body.style.overflowX = 'hidden';

      requestAnimationFrame(() => {
        if (!scrollTriggerRef.current) {
          createScrollTrigger();
        }
        ScrollTrigger.refresh(true);
      });
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [scrollUnlocked, webglSupported, reducedMotion, createScrollTrigger]);

  if (!webglSupported) {
    return (
      <div className="relative w-full bg-[#050706]">
        <LandingNav onNavigate={onNavigate} />
        <FallbackView onNavigate={onNavigate} reason="no-webgl" />
      </div>
    );
  }

  if (reducedMotion) {
    return (
      <div className="relative w-full bg-[#050706]">
        <LandingNav onNavigate={onNavigate} />
        <FallbackView onNavigate={onNavigate} reason="reduced-motion" />
      </div>
    );
  }

  return (
    <div
      ref={runwayRef}
      id="landing-runway"
      className="relative w-full bg-[#050706] text-white select-none"
      style={{
        height: '550vh',
        minHeight: '550vh',
      }}
    >
      <LandingNav onNavigate={onNavigate} />

      <div
        ref={stageRef}
        id="landing-stage"
        className="fixed inset-0 w-full h-[100dvh] flex items-center justify-center overflow-hidden pointer-events-none"
        style={{ zIndex: 10 }}
      >
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(5,20,10,0.6)_0%,#050706_75%)] pointer-events-none"
          aria-hidden="true"
        />

        <ThreeScene
          scrollProgressRef={scrollProgressRef}
          onSceneReady={handleSceneReady}
          onUpdateCards={handleUpdateCards}
          onActiveCardChange={handleActiveCardChange}
          reducedMotion={reducedMotion}
        />

        <HeroText
          ref={heroWrapperRef}
          onNavigate={onNavigate}
          showScrollHint={showScrollHint}
        />

        <FeatureCards
          cardsState={cardsState}
          onNavigate={onNavigate}
          activeIndex={activeCardIndex}
        />

        <StepIndicator
          activeIndex={activeCardIndex}
          total={6}
          visible={stepIndicatorVisible}
        />
      </div>
    </div>
  );
};

export default LandingPage;
