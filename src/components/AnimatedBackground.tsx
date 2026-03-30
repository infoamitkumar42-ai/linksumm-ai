import { memo, useEffect, useRef, useState } from 'react'

const AnimatedBackground = memo(() => {
  const ring1Ref = useRef<HTMLDivElement>(null)
  const ring2Ref = useRef<HTMLDivElement>(null)
  const ring3Ref = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detect mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Ring 1 - Clockwise slow
    if (ring1Ref.current) {
      ring1Ref.current.animate(
        [
          { transform: 'translate(-50%, -50%) rotate(0deg)' },
          { transform: 'translate(-50%, -50%) rotate(360deg)' }
        ],
        { duration: 50000, iterations: Infinity, easing: 'linear' }
      )
    }

    // Ring 2 - Counter-clockwise
    if (ring2Ref.current) {
      ring2Ref.current.animate(
        [
          { transform: 'translate(-50%, -50%) rotate(0deg)' },
          { transform: 'translate(-50%, -50%) rotate(-360deg)' }
        ],
        { duration: 40000, iterations: Infinity, easing: 'linear' }
      )
    }

    // Ring 3 - Clockwise fast
    if (ring3Ref.current) {
      ring3Ref.current.animate(
        [
          { transform: 'translate(-50%, -50%) rotate(0deg)' },
          { transform: 'translate(-50%, -50%) rotate(360deg)' }
        ],
        { duration: 30000, iterations: Infinity, easing: 'linear' }
      )
    }

    // Center glow - Pulse
    if (glowRef.current) {
      glowRef.current.animate(
        [
          { opacity: 0.4, transform: 'translate(-50%, -50%) scale(1)' },
          { opacity: 0.8, transform: 'translate(-50%, -50%) scale(1.2)' },
          { opacity: 0.4, transform: 'translate(-50%, -50%) scale(1)' }
        ],
        { duration: 4000, iterations: Infinity, easing: 'ease-in-out' }
      )
    }

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Mobile vs Desktop sizes
  const sizes = isMobile 
    ? { ring1: 400, ring2: 280, ring3: 180, glow: 120, blur1: 25, blur2: 18, blur3: 12, blurGlow: 10, tilt: 20 }
    : { ring1: 1000, ring2: 700, ring3: 450, glow: 250, blur1: 45, blur2: 30, blur3: 20, blurGlow: 15, tilt: 25 }

  // Mobile vs Desktop opacity
  const opacity = isMobile
    ? { ring1: 0.3, ring2: 0.35, ring3: 0.4, glow: 0.3 }
    : { ring1: 0.45, ring2: 0.5, ring3: 0.55, glow: 0.4 }

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
      {/* 3D Perspective Container */}
      <div
        style={{
          position: 'absolute',
          top: isMobile ? '-5%' : '-10%',
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
            transform: `perspective(1200px) rotateX(${sizes.tilt}deg)`,
            transformOrigin: 'center center',
          }}
        >
          
          {/* Ring 1 - LARGE Purple/Blue */}
          <div
            ref={ring1Ref}
            style={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              width: `${sizes.ring1}px`,
              height: `${sizes.ring1}px`,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: `conic-gradient(from 0deg, transparent, rgba(168, 85, 247, ${opacity.ring1}), transparent 40%, rgba(59, 130, 246, ${opacity.ring1 - 0.1}), transparent 70%, rgba(139, 92, 246, ${opacity.ring1 - 0.15}), transparent)`,
              filter: `blur(${sizes.blur1}px)`,
              willChange: 'transform',
            }}
          />

          {/* Ring 2 - MEDIUM Blue/Cyan */}
          <div
            ref={ring2Ref}
            style={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              width: `${sizes.ring2}px`,
              height: `${sizes.ring2}px`,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: `conic-gradient(from 120deg, transparent, rgba(59, 130, 246, ${opacity.ring2}), transparent 35%, rgba(6, 182, 212, ${opacity.ring2 - 0.05}), transparent 65%, rgba(99, 102, 241, ${opacity.ring2 - 0.15}), transparent)`,
              filter: `blur(${sizes.blur2}px)`,
              willChange: 'transform',
            }}
          />

          {/* Ring 3 - SMALL Cyan/Purple */}
          <div
            ref={ring3Ref}
            style={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              width: `${sizes.ring3}px`,
              height: `${sizes.ring3}px`,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: `conic-gradient(from 240deg, transparent, rgba(6, 182, 212, ${opacity.ring3}), transparent 30%, rgba(168, 85, 247, ${opacity.ring3 - 0.05}), transparent 60%, rgba(59, 130, 246, ${opacity.ring3 - 0.15}), transparent)`,
              filter: `blur(${sizes.blur3}px)`,
              willChange: 'transform',
            }}
          />

          {/* Center Glow */}
          <div
            ref={glowRef}
            style={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              width: `${sizes.glow}px`,
              height: `${sizes.glow}px`,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(139, 92, 246, ${opacity.glow}), rgba(59, 130, 246, ${opacity.glow - 0.2}) 50%, transparent 70%)`,
              filter: `blur(${sizes.blurGlow}px)`,
            }}
          />

        </div>
      </div>

      {/* Gradient Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isMobile
            ? 'linear-gradient(to top, #000000 5%, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 70%, transparent 100%)'
            : 'linear-gradient(to top, #000000 2%, rgba(0,0,0,0.6) 15%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.05) 60%, transparent 100%)',
          zIndex: 1,
        }}
      />

    </div>
  )
})

AnimatedBackground.displayName = 'AnimatedBackground'

export default AnimatedBackground
