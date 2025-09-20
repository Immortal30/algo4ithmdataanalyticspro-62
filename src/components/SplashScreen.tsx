import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SplashScreen = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-dashboard-background via-dashboard-card to-dashboard-background"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.8,
              type: "spring",
              stiffness: 100,
              damping: 10
            }}
            className="relative"
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
              <div className="relative h-24 w-24 rounded-2xl bg-gradient-to-br from-dashboard-primary to-dashboard-accent p-[2px]">
                <div className="flex h-full w-full items-center justify-center rounded-2xl bg-dashboard-background">
                  <span className="text-4xl font-bold bg-gradient-to-r from-dashboard-primary to-dashboard-accent bg-clip-text text-transparent">
                    A4
                  </span>
                </div>
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-dashboard-primary to-dashboard-accent opacity-30 blur-lg animate-pulse" />
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
                className="text-3xl font-bold text-dashboard-text mb-2"
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
                <h2 className="text-5xl font-extrabold bg-gradient-to-r from-dashboard-primary via-dashboard-accent to-dashboard-primary bg-clip-text text-transparent animate-pulse">
                  Algo4ithm
                </h2>
              </motion.div>

              {/* Loading indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                className="mt-8 flex justify-center gap-2"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                    className="h-2 w-2 rounded-full bg-dashboard-primary"
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;