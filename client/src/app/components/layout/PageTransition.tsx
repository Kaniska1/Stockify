import { motion } from "motion/react";

interface PageTransitionProps {
    children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
    return (
        <motion.main
            initial={{
                opacity:0,
                y:12
            }}
            animate={{
                opacity:1,
                y:0
            }}
            exit={{
                opacity:0,
                y:-8
            }}
            transition={{
                duration:.25,
                ease:"easeOut"
            }}
        >
            {children}
        </motion.main>
    );
}