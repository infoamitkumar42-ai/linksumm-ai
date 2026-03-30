import { memo } from 'react'

const AnimatedBackground = memo(() => {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      
      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{
          perspective: '1200px',
          transformOrigin: 'center bottom',
        }}
      >
        <div 
          style={{ 
            transform: 'perspective(1200px) rotateX(12deg)',
            transformOrigin: 'center bottom',
            position: 'absolute',
            inset: 0,
          }}
        >
          
          {/* Ring 1 - LARGE Purple/Blue */}
          <div
            className="absolute top-1/2 left-1/2 rounded-full"
            style={{
              width: '1000px',
              height: '1000px',
              marginLeft: '-500px',
              marginTop: '-500px',
              background: 'conic-gradient(from 0deg, transparent, rgba(168, 85, 247, 0.4), transparent, rgba(59, 130, 246, 0.35), transparent)',
              filter: 'blur(50px)',
              animation: 'linksummSpin 50s linear infinite',
              willChange: 'transform',
            }}
          />

          {/* Ring 2 - MEDIUM Blue/Cyan */}
          <div
            className="absolute top-1/2 left-1/2 rounded-full"
            style={{
              width: '700px',
              height: '700px',
              marginLeft: '-350px',
              marginTop: '-350px',
              background: 'conic-gradient(from 120deg, transparent, rgba(59, 130, 246, 0.5), transparent, rgba(6, 182, 212, 0.4), transparent)',
              filter: 'blur(35px)',
              animation: 'linksummSpinReverse 40s linear infinite',
              willChange: 'transform',
            }}
          />

          {/* Ring 3 - SMALL Cyan/Purple */}
          <div
            className="absolute top-1/2 left-1/2 rounded-full"
            style={{
              width: '450px',
              height: '450px',
              marginLeft: '-225px',
              marginTop: '-225px',
              background: 'conic-gradient(from 240deg, transparent, rgba(6, 182, 212, 0.6), transparent, rgba(168, 85, 247, 0.45), transparent)',
              filter: 'blur(25px)',
              animation: 'linksummSpin 30s linear infinite',
              willChange: 'transform',
            }}
          />

          {/* Center Glow */}
          <div
            className="absolute top-1/2 left-1/2 rounded-full"
            style={{
              width: '250px',
              height: '250px',
              marginLeft: '-125px',
              marginTop: '-125px',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3), transparent 70%)',
              filter: 'blur(15px)',
              animation: 'linksummPulse 4s ease-in-out infinite',
            }}
          />

        </div>
      </div>

      {/* Gradient Overlay - less aggressive so rings show through */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, #000000 3%, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.3) 45%, rgba(0,0,0,0.1) 70%, transparent 100%)',
          zIndex: 1,
        }}
      />

      {/* Keyframes */}
      <style>{`
        @keyframes linksummSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes linksummSpinReverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes linksummPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
      `}</style>

    </div>
  )
})

AnimatedBackground.displayName = 'AnimatedBackground'

export default AnimatedBackground
