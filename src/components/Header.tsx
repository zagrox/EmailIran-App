import React, { useState, useEffect } from 'react';
import { MenuIcon, XIcon, UserIcon } from './IconComponents';

type Page = 'dashboard' | 'audiences' | 'wizard' | 'reports' | 'calendar' | 'profile';

interface HeaderProps {
    setCurrentPage: (page: Page) => void;
    currentPage: Page;
}

const Header: React.FC<HeaderProps> = ({ setCurrentPage, currentPage }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const response = await fetch('https://crm.ir48.com/items/projects/d0749635-72fb-481e-9d87-e7bcdc8bd2ac');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                const logoId = data.data.project_logo;
                if (logoId) {
                    setLogoUrl(`https://crm.ir48.com/assets/${logoId}`);
                }
            } catch (error) {
                console.error('Failed to fetch logo:', error);
            }
        };

        fetchLogo();
    }, []);
    
    const handleNav = (page: Page) => {
        setCurrentPage(page);
        setIsMenuOpen(false);
    }

    const getLinkClasses = (page: Page, baseClasses: string, activeClasses: string, inactiveClasses: string) => {
        return `${baseClasses} ${currentPage === page ? activeClasses : inactiveClasses}`;
    };

    const navLinkBase = "transition-colors px-3 py-2 rounded-md text-base font-medium";
    const navLinkActive = "text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-700";
    const navLinkInactive = "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white";
    
    const mobileNavLinkBase = "block px-3 py-2 rounded-md text-lg font-medium";
    const mobileNavLinkActive = "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white";
    const mobileNavLinkInactive = "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white";

    const profileButtonClasses = getLinkClasses(
        'profile', 
        'p-2 ml-2 rounded-full focus:outline-none transition-colors',
        'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white', // active
        'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700' // inactive
    );

    return (
        <nav className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm w-full max-w-7xl rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 mb-8">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Title */}
                    <button onClick={() => handleNav('dashboard')} className="flex items-center focus:outline-none focus:ring-2 focus:ring-brand-purple rounded-lg">
                        {logoUrl && (
                            <img src={logoUrl} alt="ایمیل ایران" className="h-10 w-auto" />
                        )}
                        <h1 className="text-2xl font-bold mr-3 bg-gradient-to-r from-brand-pink to-brand-mint text-transparent bg-clip-text">
                           ایمیل ایران
                        </h1>
                    </button>
                    
                    {/* Desktop Nav and Profile Button */}
                    <div className="hidden md:flex md:items-center">
                        <div className="ml-10 flex items-baseline space-x-4 space-x-reverse">
                           <a href="#" onClick={(e) => {e.preventDefault(); handleNav('dashboard')}} className={getLinkClasses('dashboard', navLinkBase, navLinkActive, navLinkInactive)}>داشبورد</a>
                           <a href="#" onClick={(e) => {e.preventDefault(); handleNav('wizard')}} className={getLinkClasses('wizard', navLinkBase, navLinkActive, navLinkInactive)}>کمپین‌</a>
                           <a href="#" onClick={(e) => {e.preventDefault(); handleNav('calendar')}} className={getLinkClasses('calendar', navLinkBase, navLinkActive, navLinkInactive)}>تقویم</a>
                           <a href="#" onClick={(e) => {e.preventDefault(); handleNav('reports')}} className={getLinkClasses('reports', navLinkBase, navLinkActive, navLinkInactive)}>گزارش‌ها</a>
                           <a href="#" onClick={(e) => {e.preventDefault(); handleNav('audiences')}} className={getLinkClasses('audiences', navLinkBase, navLinkActive, navLinkInactive)}>مخاطبان</a>
                        </div>
                        <div className="flex items-center mr-6">
                             <button
                                onClick={() => handleNav('profile')}
                                className={profileButtonClasses}
                                aria-label="User Profile"
                            >
                                <UserIcon className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="-ml-2 flex md:hidden items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none"
                            aria-controls="mobile-menu"
                            aria-expanded={isMenuOpen}
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMenuOpen ? (
                                <XIcon className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden" id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                       <a href="#" onClick={(e) => {e.preventDefault(); handleNav('dashboard')}} className={getLinkClasses('dashboard', mobileNavLinkBase, mobileNavLinkActive, mobileNavLinkInactive)}>داشبورد</a>
                       <a href="#" onClick={(e) => {e.preventDefault(); handleNav('wizard')}} className={getLinkClasses('wizard', mobileNavLinkBase, mobileNavLinkActive, mobileNavLinkInactive)}>کمپین‌</a>
                       <a href="#" onClick={(e) => {e.preventDefault(); handleNav('calendar')}} className={getLinkClasses('calendar', mobileNavLinkBase, mobileNavLinkActive, mobileNavLinkInactive)}>تقویم</a>
                       <a href="#" onClick={(e) => {e.preventDefault(); handleNav('reports')}} className={getLinkClasses('reports', mobileNavLinkBase, mobileNavLinkActive, mobileNavLinkInactive)}>گزارش‌ها</a>
                       <a href="#" onClick={(e) => {e.preventDefault(); handleNav('audiences')}} className={getLinkClasses('audiences', mobileNavLinkBase, mobileNavLinkActive, mobileNavLinkInactive)}>مخاطبان</a>
                       <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
                       <a href="#" onClick={(e) => {e.preventDefault(); handleNav('profile')}} className={getLinkClasses('profile', mobileNavLinkBase, mobileNavLinkActive, mobileNavLinkInactive)}>پروفایل کاربری</a>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Header;