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
              <div className="relative h-32 w-32 rounded-3xl bg-gradient-to-br from-dashboard-primary to-dashboard-accent p-[3px]">
                <div className="flex h-full w-full items-center justify-center rounded-3xl bg-dashboard-background">
                  <span className="text-5xl font-bold bg-gradient-to-r from-dashboard-primary to-dashboard-accent bg-clip-text text-transparent">
                    A4
                  </span>
                </div>
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-dashboard-primary to-dashboard-accent opacity-20 blur-2xl animate-pulse" />
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