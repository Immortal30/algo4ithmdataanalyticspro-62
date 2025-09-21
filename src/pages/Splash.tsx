import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Splash = () => {
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        navigate('/home');
      }, 500);
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dashboard-background via-dashboard-card to-dashboard-background overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-dashboard-primary/10 via-transparent to-transparent" />
          
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.8,
              type: "spring",
              stiffness: 100,
              damping: 10
            }}
            className="relative z-10"
          >
            {/* Logo/Brand Mark */}
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{
                duration: 1,
                type: "spring",
                stiffness: 80,
                delay: 0.2
              }}
              className="mb-8 flex justify-center"
            >
              <div className="relative">
                {/* Outer glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-dashboard-primary via-dashboard-accent to-dashboard-primary opacity-30 blur-3xl animate-pulse" />
                
                {/* Main logo container */}
                <div className="relative h-40 w-40 rounded-full bg-gradient-to-br from-dashboard-primary via-dashboard-accent to-dashboard-primary p-[2px]">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-dashboard-background">
                    {/* Hexagon shape with A4 */}
                    <svg className="h-28 w-28" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="hsl(var(--dashboard-primary))" />
                          <stop offset="50%" stopColor="hsl(var(--dashboard-accent))" />
                          <stop offset="100%" stopColor="hsl(var(--dashboard-primary))" />
                        </linearGradient>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      
                      {/* Hexagon background */}
                      <path
                        d="M60 10 L95 30 L95 70 L60 90 L25 70 L25 30 Z"
                        fill="url(#logoGradient)"
                        opacity="0.15"
                        filter="url(#glow)"
                      />
                      
                      {/* Hexagon border */}
                      <path
                        d="M60 10 L95 30 L95 70 L60 90 L25 70 L25 30 Z"
                        stroke="url(#logoGradient)"
                        strokeWidth="2"
                        fill="none"
                        filter="url(#glow)"
                      />
                      
                      {/* A4 Text */}
                      <text
                        x="60"
                        y="65"
                        textAnchor="middle"
                        fontSize="42"
                        fontWeight="bold"
                        fill="url(#logoGradient)"
                        filter="url(#glow)"
                        fontFamily="system-ui, -apple-system, sans-serif"
                      >
                        A4
                      </text>
                      
                      {/* Decorative dots */}
                      <circle cx="60" cy="20" r="2" fill="url(#logoGradient)" opacity="0.8" />
                      <circle cx="85" cy="35" r="2" fill="url(#logoGradient)" opacity="0.8" />
                      <circle cx="85" cy="65" r="2" fill="url(#logoGradient)" opacity="0.8" />
                      <circle cx="60" cy="80" r="2" fill="url(#logoGradient)" opacity="0.8" />
                      <circle cx="35" cy="65" r="2" fill="url(#logoGradient)" opacity="0.8" />
                      <circle cx="35" cy="35" r="2" fill="url(#logoGradient)" opacity="0.8" />
                    </svg>
                  </div>
                </div>
                
                {/* Orbiting particles */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-dashboard-primary" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-dashboard-accent" />
                </motion.div>
                
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-dashboard-accent" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-dashboard-primary" />
                </motion.div>
              </div>
            </motion.div>

            {/* Text Animation */}
            <div className="text-center">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.8,
                  type: "spring",
                  stiffness: 100
                }}
                className="text-4xl font-bold text-dashboard-text mb-3"
              >
                Developed By
              </motion.h1>
              
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.8,
                  delay: 1.2,
                  type: "spring",
                  stiffness: 120
                }}
              >
                <h2 className="text-6xl font-extrabold bg-gradient-to-r from-dashboard-primary via-dashboard-accent to-dashboard-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]">
                  Algo4ithm
                </h2>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.8 }}
                className="mt-4 text-dashboard-muted text-lg"
              >
                Analytics Pro
              </motion.p>

              {/* Loading indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 0.5 }}
                className="mt-12 flex justify-center gap-3"
              >
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                    className="h-3 w-3 rounded-full bg-gradient-to-r from-dashboard-primary to-dashboard-accent"
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Background decoration */}
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-20 right-20 h-64 w-64 rounded-full bg-gradient-to-r from-dashboard-primary/10 to-dashboard-accent/10 blur-3xl"
          />
          <motion.div
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute bottom-20 left-20 h-80 w-80 rounded-full bg-gradient-to-r from-dashboard-accent/10 to-dashboard-primary/10 blur-3xl"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Splash;