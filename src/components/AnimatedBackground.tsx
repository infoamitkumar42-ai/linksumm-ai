import { memo } from 'react'

const AnimatedBackground = memo(() => {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      
      <style>{`
        @keyframes hero-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes hero-spin-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .hero-spin {
          animation: hero-spin 60s linear infinite;
        }
        .hero-spin-reverse {
          animation: hero-spin-reverse 60s linear infinite;
        }
      `}</style>

      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{
          perspective: '1200px',
          transform: 'perspective(1200px) rotateX(15deg)',
          transformOrigin: 'center bottom',
        }}
      >
        
        <div className="absolute inset-0 hero-spin">
          <div
            className="absolute top-1/2 left-1/2 rounded-full"
            style={{
              width: '1200px',
              height: '1200px',
              transform: 'translate(-50%, -50%)',
              background: 'conic-gradient(from 0deg, transparent 0%, rgba(147, 51, 234, 0.15) 25%, transparent 50%, rgba(59, 130, 246, 0.1) 75%, transparent 100%)',
              filter: 'blur(40px)',
              opacity: 0.6,
              willChange: 'transform',
            }}
          />
        </div>

        <div className="absolute inset-0 hero-spin-reverse">
          <div
            className="absolute top-1/2 left-1/2 rounded-full"
            style={{
              width: '800px',
              height: '800px',
              transform: 'translate(-50%, -50%)',
              background: 'conic-gradient(from 90deg, transparent 0%, rgba(59, 130, 246, 0.2) 30%, transparent 50%, rgba(6, 182, 212, 0.15) 80%, transparent 100%)',
              filter: 'blur(30px)',
              opacity: 0.7,
              willChange: 'transform',
            }}
          />
        </div>

        <div 
          className="absolute inset-0 hero-spin"
          style={{ animationDuration: '35s' }}
        >
          <div
            className="absolute top-1/2 left-1/2 rounded-full"
            style={{
              width: '500px',
              height: '500px',
              transform: 'translate(-50%, -50%)',
              background: 'conic-gradient(from 180deg, transparent 0%, rgba(6, 182, 212, 0.25) 20%, transparent 40%, rgba(147, 51, 234, 0.15) 70%, transparent 100%)',
              filter: 'blur(20px)',
              opacity: 0.8,
              willChange: 'transform',
            }}
          />
        </div>

        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />

      </div>

      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, #000000 8%, rgba(0,0,0,0.9) 25%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.3) 75%, transparent 100%)',
          zIndex: 1,
        }}
      />

    </div>
  )
})

AnimatedBackground.displayName = 'AnimatedBackground'

export default AnimatedBackground
