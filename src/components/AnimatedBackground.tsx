import { memo, useEffect, useRef } from 'react'

const AnimatedBackground = memo(() => {
  const ring1Ref = useRef<HTMLDivElement>(null)
  const ring2Ref = useRef<HTMLDivElement>(null)
  const ring3Ref = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
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
  }, [])

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
      {/* 3D Perspective Container - positioned at TOP */}
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
          
          {/* Ring 1 - LARGE Purple/Blue */}
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

          {/* Ring 2 - MEDIUM Blue/Cyan */}
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

          {/* Ring 3 - SMALL Cyan/Purple */}
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

          {/* Center Glow */}
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

      {/* Gradient Overlay - lighter so rings show clearly */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, #000000 2%, rgba(0,0,0,0.6) 15%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.05) 60%, transparent 100%)',
          zIndex: 1,
        }}
      />

    </div>
  )
})

AnimatedBackground.displayName = 'AnimatedBackground'

export default AnimatedBackground
