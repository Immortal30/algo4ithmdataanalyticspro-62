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
                {/* Outer glow effect - enhanced */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-dashboard-primary via-dashboard-accent to-dashboard-primary opacity-50 blur-2xl animate-pulse scale-110" />
                
                {/* Main logo container - bigger and clearer */}
                <div className="relative h-56 w-56 rounded-full bg-gradient-to-br from-dashboard-primary via-dashboard-accent to-dashboard-primary p-[3px] shadow-2xl">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-dashboard-background">
                    {/* Clear and bold A4 logo */}
                    <svg className="h-44 w-44" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="hsl(var(--dashboard-primary))" />
                          <stop offset="100%" stopColor="hsl(var(--dashboard-accent))" />
                        </linearGradient>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      
                      {/* Hexagon background - simplified and clearer */}
                      <path
                        d="M90 20 L140 50 L140 130 L90 160 L40 130 L40 50 Z"
                        fill="url(#logoGradient)"
                        opacity="0.1"
                      />
                      
                      {/* Hexagon border - thicker for visibility */}
                      <path
                        d="M90 20 L140 50 L140 130 L90 160 L40 130 L40 50 Z"
                        stroke="url(#logoGradient)"
                        strokeWidth="3"
                        fill="none"
                        filter="url(#glow)"
                      />
                      
                      {/* A4 Text - much larger and bolder */}
                      <text
                        x="90"
                        y="105"
                        textAnchor="middle"
                        fontSize="72"
                        fontWeight="900"
                        fill="url(#logoGradient)"
                        filter="url(#glow)"
                        fontFamily="system-ui, -apple-system, sans-serif"
                        letterSpacing="-2"
                      >
                        A4
                      </text>
                      
                      {/* Corner accents for emphasis */}
                      <circle cx="90" cy="30" r="4" fill="url(#logoGradient)" opacity="0.9" />
                      <circle cx="130" cy="55" r="4" fill="url(#logoGradient)" opacity="0.9" />
                      <circle cx="130" cy="125" r="4" fill="url(#logoGradient)" opacity="0.9" />
                      <circle cx="90" cy="150" r="4" fill="url(#logoGradient)" opacity="0.9" />
                      <circle cx="50" cy="125" r="4" fill="url(#logoGradient)" opacity="0.9" />
                      <circle cx="50" cy="55" r="4" fill="url(#logoGradient)" opacity="0.9" />
                    </svg>
                  </div>
                </div>
                
                {/* Orbiting particles - larger and more visible */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-dashboard-primary shadow-lg shadow-dashboard-primary/50" />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-dashboard-accent shadow-lg shadow-dashboard-accent/50" />
                </motion.div>
                
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-dashboard-accent shadow-lg shadow-dashboard-accent/50" />
                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-dashboard-primary shadow-lg shadow-dashboard-primary/50" />
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