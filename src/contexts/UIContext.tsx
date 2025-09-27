import React, { createContext, useContext } from 'react';
import type { Page } from '../types';

interface UIContextType {
    navigateToLogin: () => void;
    navigate: (page: Page) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = UIContext.Provider;

export const useUI = (): UIContextType => {
    const context = useContext(UIContext);
    if (context === undefined) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};
