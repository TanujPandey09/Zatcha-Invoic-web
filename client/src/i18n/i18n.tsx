import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface I18nContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

import { en } from './en';
import { ar } from './ar';

const translations = { en, ar };

export const I18nProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Language>(
        (localStorage.getItem('lang') as Language) || 'en'
    );

    useEffect(() => {
        localStorage.setItem('lang', language);
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
    }, [language]);

    const t = (key: string) => {
        const keys = key.split('.');
        let value: any = translations[language];

        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                return key; // Fallback to key if not found
            }
        }

        return typeof value === 'string' ? value : key;
    };

    const isRTL = language === 'ar';

    return (
        <I18nContext.Provider value={{ language, setLanguage, t, isRTL }}>
            <div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'font-arabic' : ''}>
                {children}
            </div>
        </I18nContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useTranslation must be used within an I18nProvider');
    }
    return context;
};
