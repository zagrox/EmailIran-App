

import React, { useState, useCallback, useEffect } from 'react';
import { STEPS, AUDIENCE_CATEGORIES, MOCK_REPORTS } from './constants.ts';
import type { CampaignState, AICampaignDraft, Report } from './types.ts';
import Stepper from './components/Stepper.tsx';
import Header from './components/Header.tsx';
import Step1Audience from './components/steps/Step1_Audience.tsx';
import Step2Message from './components/steps/Step2_Message.tsx';
import Step3Schedule from './components/steps/Step3_Schedule.tsx';
import Step4Review from './components/steps/Step4_Review.tsx';
import Step5Analytics from './components/steps/Step5_Analytics.tsx';
import AIAssistantModal from './components/AIAssistantModal.tsx';
import AudiencesPage from './components/AudiencesPage.tsx';
import ReportsPage from './components/ReportsPage.tsx';
import { STYLES } from './styles.ts';
import DashboardPage from './components/DashboardPage.tsx';
import CalendarPage from './components/CalendarPage.tsx';
import UserProfilePage from './components/UserProfilePage.tsx';

type Page = 'dashboard' | 'audiences' | 'wizard' | 'reports' | 'calendar' | 'profile';
type Theme = 'light' | 'dark' | 'system';

const initialCampaignState: CampaignState = {
    audience: {
        segmentId: null,
        categoryId: null,
        filters: [],
        healthScore: 0,
    },
    message: {
        subject: 'اخبار هیجان‌انگیز از شرکت ما!',
        body: 'سلام {{firstName}}،\n\nما به‌روزرسانی‌های شگفت‌انگیزی برای شما داریم. ما سخت روی ویژگی‌های جدید کار کرده‌ایم و بی‌صبرانه منتظریم تا شما آن‌ها را ببینید.\n\nبا احترام،\nتیم',
        abTest: {
            enabled: false,
            subjectB: '',
            testSize: 20,
        },
    },
    schedule: {
        sendDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        sendTime: '09:00',
        timezoneAware: true,
    },
};


const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [currentStep, setCurrentStep] = useState(1);
    const [campaignData, setCampaignData] = useState<CampaignState>(initialCampaignState);
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system');
    const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');
    const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
    const [viewedReport, setViewedReport] = useState<Report | null>(null);
    const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>();

    useEffect(() => {
        localStorage.setItem('theme', theme);
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const updateEffectiveTheme = () => {
            const isDark = theme === 'system' ? mediaQuery.matches : theme === 'dark';
            setEffectiveTheme(isDark ? 'dark' : 'light');
            document.documentElement.classList.toggle('dark', isDark);
        };
        
        updateEffectiveTheme();
        
        mediaQuery.addEventListener('change', updateEffectiveTheme);
        return () => mediaQuery.removeEventListener('change', updateEffectiveTheme);
    }, [theme]);


    const handleNavigation = (page: Page) => {
        if (currentPage === 'reports' && page !== 'reports') {
            setViewedReport(null);
        }
        setCurrentPage(page);
    };

    const updateCampaignData = useCallback(<K extends keyof CampaignState>(field: K, value: CampaignState[K]) => {
        setCampaignData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(prev => prev + 1);
        }
    };
    
    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleLaunch = () => {
        console.log("کمپین ارسال شد:", campaignData);
        setViewedReport(null);
        setCurrentStep(5);
    };
    
    const resetCampaign = () => {
        setCampaignData(initialCampaignState);
        setCurrentStep(1);
        handleNavigation('dashboard');
        setViewedReport(null);
    }
    
    const handleStartCampaign = (categoryId: string) => {
        setCampaignData({
            ...initialCampaignState,
            audience: {
                ...initialCampaignState.audience,
                categoryId: categoryId,
            },
        });
        handleNavigation('wizard');
        setCurrentStep(1);
        setViewedReport(null);
    };

    const handleStartCampaignFromCalendar = (date: string) => {
        setCampaignData({
            ...initialCampaignState,
            schedule: {
                ...initialCampaignState.schedule,
                sendDate: date,
            },
        });
        handleNavigation('wizard');
        setCurrentStep(1);
        setViewedReport(null);
    };

    const handleApplyAIDraft = (draft: AICampaignDraft) => {
        const selectedCategory = AUDIENCE_CATEGORIES.find(c => c.id === draft.audienceCategoryId);
        const healthScore = selectedCategory?.health === 'Excellent' ? 95 : selectedCategory?.health === 'Good' ? 75 : 25;
       
        const audienceUpdate: Partial<CampaignState['audience']> = {
            segmentId: null,
            categoryId: draft.audienceCategoryId,
            healthScore: healthScore,
        };
        
        setCampaignData({
            ...campaignData,
            audience: {
                ...campaignData.audience,
                ...audienceUpdate,
            },
            message: {
                ...campaignData.message,
                subject: draft.subject,
                body: draft.body,
                abTest: {
                    ...campaignData.message.abTest,
                    enabled: !!draft.subjectB,
                    subjectB: draft.subjectB || '',
                },
            },
            schedule: {
                ...campaignData.schedule,
                sendTime: draft.sendTime,
            }
        });

        setIsAIAssistantOpen(false);
        setCurrentStep(1); 
    };
    
    const handleViewReport = (report: Report) => {
        setViewedReport(report);
    };
    
    const handleBackToReports = () => {
        setViewedReport(null);
    }

    const handleOpenAIAssistant = (prompt?: string) => {
        setAiInitialPrompt(prompt);
        setIsAIAssistantOpen(true);
    };

    const handleCloseAIAssistant = () => {
        setIsAIAssistantOpen(false);
        setAiInitialPrompt(undefined);
    };

    const renderWizardStep = () => {
        switch (currentStep) {
            case 1:
                return <Step1Audience 
                    campaignData={campaignData} 
                    updateCampaignData={updateCampaignData}
                    onOpenAIAssistant={() => handleOpenAIAssistant()}
                />;
            case 2:
                return <Step2Message campaignData={campaignData} updateCampaignData={updateCampaignData} />;
            case 3:
                return <Step3Schedule campaignData={campaignData} updateCampaignData={updateCampaignData} />;
            case 4:
                return <Step4Review campaignData={campaignData} />;
            case 5:
                return <Step5Analytics 
                    theme={effectiveTheme}
                    viewedReport={viewedReport}
                    onStartNewCampaign={resetCampaign}
                    onBackToReports={handleBackToReports}
                />;
            default:
                return <Step1Audience 
                    campaignData={campaignData} 
                    updateCampaignData={updateCampaignData}
                    onOpenAIAssistant={() => handleOpenAIAssistant()}
                />;
        }
    };

    const renderPage = () => {
        switch (currentPage) {
             case 'dashboard':
                return (
                    <div className="w-full max-w-7xl animate-fade-in">
                        <DashboardPage 
                            theme={effectiveTheme}
                            onNavigate={handleNavigation} 
                            onOpenAIAssistant={handleOpenAIAssistant} 
                        />
                    </div>
                );
            case 'audiences':
                return (
                    <div className="w-full max-w-7xl animate-fade-in">
                        <AudiencesPage onStartCampaign={handleStartCampaign} />
                    </div>
                );
            case 'reports':
                return (
                     <div className="w-full max-w-7xl animate-fade-in">
                        {viewedReport ? (
                            <Step5Analytics 
                                theme={effectiveTheme}
                                viewedReport={viewedReport}
                                onStartNewCampaign={resetCampaign}
                                onBackToReports={handleBackToReports}
                            />
                        ) : (
                            <ReportsPage reports={MOCK_REPORTS} onViewReport={handleViewReport} />
                        )}
                    </div>
                );
             case 'calendar':
                return (
                    <div className="w-full max-w-7xl animate-fade-in">
                        <CalendarPage onStartCampaign={handleStartCampaignFromCalendar} />
                    </div>
                );
            case 'profile':
                return (
                    <div className="w-full max-w-7xl animate-fade-in">
                        <UserProfilePage theme={theme} setTheme={setTheme} />
                    </div>
                );
            case 'wizard':
                return (
                    <div className={STYLES.page.wizardContainer}>
                        {currentStep <= 4 && <Stepper currentStep={currentStep} steps={STEPS.slice(0, 4)} />}
                        
                        <main className={STYLES.page.mainContent}>
                            {renderWizardStep()}
                        </main>
                        
                        {currentStep <= 4 && (
                            <footer className="mt-8 flex justify-between items-center">
                                <div>
                                    {currentStep > 1 && (
                                        <button
                                            onClick={handlePrev}
                                            className={STYLES.button.secondary}
                                        >
                                            بازگشت
                                        </button>
                                    )}
                                </div>
                                <div>
                                    {currentStep < 4 ? (
                                        <button
                                            onClick={handleNext}
                                            className={STYLES.button.primary}
                                        >
                                            بعدی
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleLaunch}
                                            className={STYLES.button.launch}
                                        >
                                            پرداخت و ارسال کمپین
                                        </button>
                                    )}
                                </div>
                            </footer>
                        )}
                    </div>
                );
        }
    }


    return (
        <div className={STYLES.page.container}>
            <Header setCurrentPage={handleNavigation} currentPage={currentPage} />
            
            {isAIAssistantOpen && (
                <AIAssistantModal 
                    isOpen={isAIAssistantOpen}
                    onClose={handleCloseAIAssistant}
                    onApply={handleApplyAIDraft}
                    initialPrompt={aiInitialPrompt}
                />
            )}

            {renderPage()}
        </div>
    );
};

export default App;