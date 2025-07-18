import React, { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiChevronRight } from "react-icons/hi";

interface SidebarFolderProps {
  title: string;
  icon?: React.ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  collapsed?: boolean; // <--- added prop
}

export default function SidebarFolder({
  title,
  icon,
  children,
  defaultOpen = true,
  collapsed = false,
}: SidebarFolderProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = () => {
    if (!collapsed) {
      setIsOpen((prev) => !prev);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleToggle}
        className={`flex items-center w-full p-2 rounded-lg hover:bg-gray-100 transition text-sm ${
          isOpen && !collapsed ? "bg-gray-100" : ""
        }`}
      >
        <span className="text-gray-500">{icon}</span>
        {!collapsed && (
          <>
            <span className="ml-3 flex-1 font-medium text-left text-gray-900">
              {title}
            </span>
            <motion.div
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-gray-500"
            >
              <HiChevronRight className="w-4 h-4" />
            </motion.div>
          </>
        )}
      </button>

      {!collapsed && (
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="collapse-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden ml-11 mt-1 space-y-1"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
