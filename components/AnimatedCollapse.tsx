import React, { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface AnimatedCollapseProps {
  isOpen: boolean;
  children: ReactNode;
}

export default function AnimatedCollapse({ isOpen, children }: AnimatedCollapseProps) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="collapse-content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}