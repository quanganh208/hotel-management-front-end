"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

const tabsAnimationVariants = {
  active: {
    scale: 1.05,
    y: -2,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15,
      duration: 0.3,
    },
  },
  inactive: {
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15,
      duration: 0.2,
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
};

const TabsContext = React.createContext<{
  selectedTabRef: React.RefObject<HTMLElement | null>;
  registerTab: (tab: HTMLElement, value: string) => void;
  activeTabValue: string | null;
  setActiveTabValue: (value: string) => void;
}>({
  selectedTabRef: { current: null },
  registerTab: () => {},
  activeTabValue: null,
  setActiveTabValue: () => {},
});

function Tabs({
  defaultValue,
  value,
  onValueChange,
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  const selectedTabRef = React.useRef<HTMLElement | null>(null);
  const [activeTabValue, setActiveTabValue] = React.useState<string | null>(
    defaultValue || value || null,
  );
  const tabsMap = React.useRef<Map<string, HTMLElement>>(new Map());

  const registerTab = React.useCallback(
    (tab: HTMLElement, value: string) => {
      tabsMap.current.set(value, tab);
      if (value === activeTabValue) {
        selectedTabRef.current = tab;
      }
    },
    [activeTabValue],
  );

  React.useEffect(() => {
    if (value !== undefined && value !== activeTabValue) {
      setActiveTabValue(value);
      const tabElement = tabsMap.current.get(value);
      if (tabElement) {
        selectedTabRef.current = tabElement;
      }
    }
  }, [value, activeTabValue]);

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      setActiveTabValue(newValue);
      const tabElement = tabsMap.current.get(newValue);
      if (tabElement) {
        selectedTabRef.current = tabElement;
      }
      onValueChange?.(newValue);
    },
    [onValueChange],
  );

  return (
    <TabsContext.Provider
      value={{ selectedTabRef, registerTab, activeTabValue, setActiveTabValue }}
    >
      <TabsPrimitive.Root
        data-slot="tabs"
        className={cn("flex flex-col gap-2", className)}
        defaultValue={defaultValue}
        value={value}
        onValueChange={handleValueChange}
        {...props}
      />
    </TabsContext.Provider>
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  const [dimensions, setDimensions] = React.useState<{
    left: number;
    width: number;
    top: number;
    height: number;
  } | null>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const { selectedTabRef, activeTabValue } = React.useContext(TabsContext);

  React.useEffect(() => {
    if (selectedTabRef.current && listRef.current) {
      const tabRect = selectedTabRef.current.getBoundingClientRect();
      const listRect = listRef.current.getBoundingClientRect();

      setDimensions({
        left: tabRect.left - listRect.left,
        width: tabRect.width,
        top: tabRect.top - listRect.top,
        height: tabRect.height,
      });
    }
  }, [selectedTabRef, activeTabValue]);

  return (
    <div ref={listRef} className="relative">
      <TabsPrimitive.List
        data-slot="tabs-list"
        className={cn(
          "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px] relative",
          className,
        )}
        {...props}
      />

      {dimensions && (
        <motion.div
          className="absolute bg-background dark:bg-gray-700 rounded-md shadow-sm pointer-events-none z-0"
          initial={false}
          animate={{
            left: dimensions.left,
            width: dimensions.width,
            top: dimensions.top,
            height: dimensions.height,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
        />
      )}
    </div>
  );
}

function TabsTrigger({
  className,
  value,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [isActive, setIsActive] = React.useState(false);
  const { registerTab, activeTabValue } = React.useContext(TabsContext);

  React.useEffect(() => {
    if (triggerRef.current && value) {
      registerTab(triggerRef.current, value);
      setIsActive(activeTabValue === value);
    }
  }, [registerTab, value, activeTabValue]);

  React.useEffect(() => {
    const checkActiveState = () => {
      if (triggerRef.current) {
        setIsActive(triggerRef.current.getAttribute("data-state") === "active");
      }
    };

    checkActiveState();

    const observer = new MutationObserver(checkActiveState);

    if (triggerRef.current) {
      observer.observe(triggerRef.current, { attributes: true });
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <motion.div
      variants={tabsAnimationVariants}
      initial="inactive"
      animate={isActive ? "active" : "inactive"}
      whileTap="tap"
      className="contents z-10 relative"
    >
      <TabsPrimitive.Trigger
        ref={triggerRef}
        data-slot="tabs-trigger"
        className={cn(
          "relative z-10 data-[state=active]:text-primary dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-colors duration-300 focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className,
        )}
        value={value}
        {...props}
      />
    </motion.div>
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  const contentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    >
      <motion.div
        variants={contentVariants}
        initial="hidden"
        animate="visible"
        className="h-full w-full"
      >
        {props.children}
      </motion.div>
    </TabsPrimitive.Content>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
