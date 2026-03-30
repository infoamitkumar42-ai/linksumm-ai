import { memo, useEffect, useRef, useState } from 'react'

const AnimatedBackground = memo(() => {
  const ring1Ref = useRef<HTMLDivElement>(null)
  const ring2Ref = useRef<HTMLDivElement>(null)
  const ring3Ref = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  // Mobile blobs
  const blob1Ref = useRef<HTMLDivElement>(null)
  const blob2Ref = useRef<HTMLDivElement>(null)
  const blob3Ref = useRef<HTMLDivElement>(null)

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Desktop animations - spinning rings
  useEffect(() => {
    if (isMobile) return

    ring1Ref.current?.animate(
      [
        { transform: 'translate(-50%, -50%) rotate(0deg)' },
        { transform: 'translate(-50%, -50%) rotate(360deg)' }
      ],
      { duration: 50000, iterations: Infinity, easing: 'linear' }
    )

    ring2Ref.current?.animate(
      [
        { transform: 'translate(-50%, -50%) rotate(0deg)' },
        { transform: 'translate(-50%, -50%) rotate(-360deg)' }
      ],
      { duration: 40000, iterations: Infinity, easing: 'linear' }
    )

    ring3Ref.current?.animate(
      [
        { transform: 'translate(-50%, -50%) rotate(0deg)' },
        { transform: 'translate(-50%, -50%) rotate(360deg)' }
      ],
      { duration: 30000, iterations: Infinity, easing: 'linear' }
    )

    glowRef.current?.animate(
      [
        { opacity: 0.4, transform: 'translate(-50%, -50%) scale(1)' },
        { opacity: 0.8, transform: 'translate(-50%, -50%) scale(1.2)' },
        { opacity: 0.4, transform: 'translate(-50%, -50%) scale(1)' }
      ],
      { duration: 4000, iterations: Infinity, easing: 'ease-in-out' }
    )
  }, [isMobile])

  // Mobile animations - flowing blobs
  useEffect(() => {
    if (!isMobile) return

    blob1Ref.current?.animate(
      [
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.6 },
        { transform: 'translate(-30%, -40%) scale(1.3)', opacity: 0.8 },
        { transform: 'translate(-70%, -60%) scale(0.9)', opacity: 0.5 },
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.6 }
      ],
      { duration: 12000, iterations: Infinity, easing: 'ease-in-out' }
    )

    blob2Ref.current?.animate(
      [
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.5 },
        { transform: 'translate(-70%, -30%) scale(1.2)', opacity: 0.7 },
        { transform: 'translate(-30%, -70%) scale(1.1)', opacity: 0.6 },
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.5 }
      ],
      { duration: 15000, iterations: Infinity, easing: 'ease-in-out' }
    )

    blob3Ref.current?.animate(
      [
        { transform: 'translate(-50%, -50%) scale(1.1)', opacity: 0.4 },
        { transform: 'translate(-40%, -60%) scale(1.4)', opacity: 0.65 },
        { transform: 'translate(-60%, -40%) scale(0.95)', opacity: 0.45 },
        { transform: 'translate(-50%, -50%) scale(1.1)', opacity: 0.4 }
      ],
      { duration: 18000, iterations: Infinity, easing: 'ease-in-out' }
    )
  }, [isMobile])

  return (
    <div 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
      }}
    >

      {/* ========== DESKTOP VIEW — Spinning Rings ========== */}
      {!isMobile && (
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: 0,
            width: '100%',
            height: '100%',
            perspective: '1200px',
            transformOrigin: 'center center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transform: 'perspective(1200px) rotateX(25deg)',
              transformOrigin: 'center center',
            }}
          >
            <div
              ref={ring1Ref}
              style={{
                position: 'absolute',
                top: '40%',
                left: '50%',
                width: '1000px',
                height: '1000px',
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                background: 'conic-gradient(from 0deg, transparent, rgba(168, 85, 247, 0.45), transparent 40%, rgba(59, 130, 246, 0.35), transparent 70%, rgba(139, 92, 246, 0.3), transparent)',
                filter: 'blur(45px)',
                willChange: 'transform',
              }}
            />
            <div
              ref={ring2Ref}
              style={{
                position: 'absolute',
                top: '40%',
                left: '50%',
                width: '700px',
                height: '700px',
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                background: 'conic-gradient(from 120deg, transparent, rgba(59, 130, 246, 0.5), transparent 35%, rgba(6, 182, 212, 0.45), transparent 65%, rgba(99, 102, 241, 0.35), transparent)',
                filter: 'blur(30px)',
                willChange: 'transform',
              }}
            />
            <div
              ref={ring3Ref}
              style={{
                position: 'absolute',
                top: '40%',
                left: '50%',
                width: '450px',
                height: '450px',
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                background: 'conic-gradient(from 240deg, transparent, rgba(6, 182, 212, 0.55), transparent 30%, rgba(168, 85, 247, 0.5), transparent 60%, rgba(59, 130, 246, 0.4), transparent)',
                filter: 'blur(20px)',
                willChange: 'transform',
              }}
            />
            <div
              ref={glowRef}
              style={{
                position: 'absolute',
                top: '40%',
                left: '50%',
                width: '250px',
                height: '250px',
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4), rgba(59, 130, 246, 0.2) 50%, transparent 70%)',
                filter: 'blur(15px)',
              }}
            />
          </div>
        </div>
      )}

      {/* ========== MOBILE VIEW — Flowing Aurora Blobs ========== */}
      {isMobile && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '70vh',
            overflow: 'hidden',
          }}
        >
          {/* Blob 1 - Purple (top center) */}
          <div
            ref={blob1Ref}
            style={{
              position: 'absolute',
              top: '25%',
              left: '50%',
              width: '120vw',
              height: '120vw',
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(147, 51, 234, 0.5) 0%, rgba(139, 92, 246, 0.3) 30%, transparent 65%)',
              filter: 'blur(30px)',
              willChange: 'transform, opacity',
            }}
          />

          {/* Blob 2 - Blue (center-right) */}
          <div
            ref={blob2Ref}
            style={{
              position: 'absolute',
              top: '35%',
              left: '60%',
              width: '100vw',
              height: '100vw',
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.45) 0%, rgba(99, 102, 241, 0.25) 35%, transparent 65%)',
              filter: 'blur(25px)',
              willChange: 'transform, opacity',
            }}
          />

          {/* Blob 3 - Cyan (center-left) */}
          <div
            ref={blob3Ref}
            style={{
              position: 'absolute',
              top: '30%',
              left: '40%',
              width: '90vw',
              height: '90vw',
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, rgba(20, 184, 166, 0.2) 30%, transparent 60%)',
              filter: 'blur(20px)',
              willChange: 'transform, opacity',
            }}
          />

          {/* Accent dots - small floating particles */}
          <div
            style={{
              position: 'absolute',
              top: '15%',
              left: '20%',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'rgba(168, 85, 247, 0.8)',
              boxShadow: '0 0 15px 5px rgba(168, 85, 247, 0.4)',
              animation: 'mobileFloat1 8s ease-in-out infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '25%',
              right: '15%',
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: 'rgba(59, 130, 246, 0.8)',
              boxShadow: '0 0 12px 4px rgba(59, 130, 246, 0.4)',
              animation: 'mobileFloat2 10s ease-in-out infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '40%',
              left: '70%',
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: 'rgba(6, 182, 212, 0.8)',
              boxShadow: '0 0 12px 4px rgba(6, 182, 212, 0.4)',
              animation: 'mobileFloat3 12s ease-in-out infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '10%',
              left: '60%',
              width: '3px',
              height: '3px',
              borderRadius: '50%',
              background: 'rgba(139, 92, 246, 0.7)',
              boxShadow: '0 0 10px 3px rgba(139, 92, 246, 0.3)',
              animation: 'mobileFloat1 14s ease-in-out infinite reverse',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '45%',
              left: '25%',
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.7)',
              boxShadow: '0 0 10px 3px rgba(99, 102, 241, 0.3)',
              animation: 'mobileFloat2 9s ease-in-out infinite reverse',
            }}
          />

        </div>
      )}

      {/* Gradient Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isMobile
            ? 'linear-gradient(to top, #000000 3%, rgba(0,0,0,0.5) 25%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.05) 70%, transparent 100%)'
            : 'linear-gradient(to top, #000000 2%, rgba(0,0,0,0.6) 15%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.05) 60%, transparent 100%)',
          zIndex: 1,
        }}
      />

      {/* Mobile floating dot animations */}
      <style>{`
        @keyframes mobileFloat1 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-15px) translateX(8px); }
          50% { transform: translateY(-5px) translateX(-10px); }
          75% { transform: translateY(-20px) translateX(5px); }
        }
        @keyframes mobileFloat2 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-12px) translateX(-8px); }
          66% { transform: translateY(-18px) translateX(12px); }
        }
        @keyframes mobileFloat3 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-10px) translateX(15px); }
          50% { transform: translateY(-25px) translateX(-5px); }
          75% { transform: translateY(-8px) translateX(10px); }
        }
      `}</style>

    </div>
  )
})

AnimatedBackground.displayName = 'AnimatedBackground'

export default AnimatedBackground
