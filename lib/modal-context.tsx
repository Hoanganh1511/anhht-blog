"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { Modal, type ModalSize } from "@/components/ui/Modal";

interface ModalOptions {
  title?: string;
  size?: ModalSize;
}

interface ModalState {
  content: React.ReactNode;
  options: ModalOptions;
}

interface ModalContextValue {
  open: (content: React.ReactNode, options?: ModalOptions) => void;
  close: () => void;
  isOpen: boolean;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used inside ModalProvider");
  return ctx;
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<ModalState>({ content: null, options: {} });

  const open = useCallback((content: React.ReactNode, options: ModalOptions = {}) => {
    setState({ content, options });
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  return (
    <ModalContext.Provider value={{ open, close, isOpen }}>
      {children}
      <Modal
        isOpen={isOpen}
        onClose={close}
        title={state.options.title}
        size={state.options.size}
      >
        {state.content}
      </Modal>
    </ModalContext.Provider>
  );
}
