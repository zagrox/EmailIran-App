import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { STEPS, MOCK_REPORTS } from './constants';
// FIX: Import the centralized Page type to resolve conflicting type definitions.
import type { CampaignState, AICampaignDraft, Report, AudienceCategory, ApiAudienceItem, Page } from './types';
import Stepper from './components/Stepper';
import Header from './components/Header';
import Step1Audience from './components/steps/Step1_Audience';
import Step2Message from './components/steps/Step2_Message';
import Step3Schedule from './components/steps/Step3_Schedule';
import Step4Review from './components/steps/Step4_Review';
import Step5Analytics from './components/steps/Step5_Analytics';
import AIAssistantModal from './components/AIAssistantModal';
import AudiencesPage from './components/AudiencesPage';
import ReportsPage from './components/ReportsPage';
import DashboardPage from './components/DashboardPage';
import CalendarPage from './components/CalendarPage';
import UserProfilePage from './components/UserProfilePage';
import CampaignsPage from './components/CampaignsPage';
import LoginPage from './components/LoginPage';
import { useAuth } from './contexts/AuthContext';
import { UIProvider } from './contexts/UIContext';
import NotificationContainer from './components/NotificationContainer';

// FIX: The local 'Page' type definition was removed to use the centralized one from src/types.ts.
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

const mapHealth = (engage: string): 'Excellent' | 'Good' | 'Poor' => {
  switch (engage) {
    case 'great':
      return 'Excellent';
    case 'good':
      return 'Good';
    default:
      return 'Poor';
  }
};

const fetchAudienceCategories = async (): Promise<AudienceCategory[]> => {
  try {
    const response = await fetch('https://crm.ir48.com/items/audiences');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const { data } = await response.json();

    return data
        .filter((item: ApiAudienceItem) => item.status === 'published')
        .map((item: ApiAudienceItem): AudienceCategory => ({
            id: item.id.toString(),
            name_fa: item.audience_title,
            name_en: item.audience_slug.toUpperCase(),
            count: item.audience_contacts,
            imageUrl: `https://crm.ir48.com/assets/${item.audience_thumbnail}`,
            health: mapHealth(item.audience_engage),
    }));
  } catch (error) {
    console.error('Failed to fetch audience categories:', error);
    return [];
  }
};


const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [isWizardActive, setIsWizardActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [campaignData, setCampaignData] = useState<CampaignState>(initialCampaignState);
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system');
    const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');
    const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
    const [viewedReport, setViewedReport] = useState<Report | null>(null);
    const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>();
    const [audienceCategories, setAudienceCategories] = useState<AudienceCategory[]>([]);
    const [isLoadingAudiences, setIsLoadingAudiences] = useState(true);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                const response = await fetch('https://crm.ir48.com/items/projects/d0749635-72fb-481e-9d87-e7bcdc8bd2ac');
                if (response.ok) {
                    const { data } = await response.json();
                    if (data.project_logo) {
                        setLogoUrl(`https://crm.ir48.com/assets/${data.project_logo}`);
                    }
                } else {
                     console.error('Failed to fetch project details');
                }
            } catch (error) {
                console.error('Error fetching project logo:', error);
            }
        };
        fetchProjectDetails();
    }, []);

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

    useEffect(() => {
        const loadAudiences = async () => {
            setIsLoadingAudiences(true);
            const categories = await fetchAudienceCategories();
            setAudienceCategories(categories);
            setIsLoadingAudiences(false);
        };
        loadAudiences();
    }, []);


    const handleNavigation = useCallback((page: Page) => {
        setCurrentPage(prevPage => {
            if (prevPage === 'reports' && page !== 'reports') {
                setViewedReport(null);
            }
            return page;
        });
        setIsWizardActive(false);
    }, []);
    
    const navigateToLogin = useCallback(() => {
        handleNavigation('login');
    }, [handleNavigation]);

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
        if (!isAuthenticated) {
            navigateToLogin();
            return;
        }
        console.log("کمپین ارسال شد:", campaignData);
        setViewedReport(null);
        setCurrentStep(5);
    };
    
    const resetCampaign = () => {
        setCampaignData(initialCampaignState);
        setCurrentStep(1);
        setIsWizardActive(false);
        handleNavigation('dashboard');
        setViewedReport(null);
    }

    const handleStartNewCampaign = () => {
        setCampaignData(initialCampaignState);
        setCurrentStep(1);
        setViewedReport(null);
        setIsWizardActive(true);
    };
    
    const handleStartCampaign = (categoryId: string) => {
        const selectedCategory = audienceCategories.find(c => c.id === categoryId);
        const healthScore = selectedCategory?.health === 'Excellent' ? 95 : selectedCategory?.health === 'Good' ? 75 : 25;

        setCampaignData({
            ...initialCampaignState,
            audience: {
                ...initialCampaignState.audience,
                categoryId: categoryId,
                healthScore: healthScore,
            },
        });
        setCurrentStep(1);
        setViewedReport(null);
        setIsWizardActive(true);
    };

    const handleStartCampaignFromCalendar = (date: string) => {
        setCampaignData({
            ...initialCampaignState,
            schedule: {
                ...initialCampaignState.schedule,
                sendDate: date,
            },
        });
        setCurrentStep(1);
        setViewedReport(null);
        setIsWizardActive(true);
    };

    const handleApplyAIDraft = (draft: AICampaignDraft) => {
        const selectedCategory = audienceCategories.find(c => c.id === draft.audienceCategoryId);
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
        setIsWizardActive(true);
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
                    audienceCategories={audienceCategories}
                />;
            case 2:
                return <Step2Message campaignData={campaignData} updateCampaignData={updateCampaignData} />;
            case 3:
                return <Step3Schedule campaignData={campaignData} updateCampaignData={updateCampaignData} />;
            case 4:
                return <Step4Review campaignData={campaignData} audienceCategories={audienceCategories} />;
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
                    audienceCategories={audienceCategories}
                />;
        }
    };

    const renderWizard = () => (
        <div className="page-container animate-fade-in">
            {currentStep <= 4 && <Stepper currentStep={currentStep} steps={STEPS.slice(0, 4)} />}
            
            <main className="page-main-content">
                {renderWizardStep()}
            </main>
            
            {currentStep <= 4 && (
                <footer className="mt-8 flex justify-between items-center">
                    <div>
                        {currentStep > 1 && (
                            <button
                                onClick={handlePrev}
                                className="btn btn-secondary"
                            >
                                بازگشت
                            </button>
                        )}
                    </div>
                    <div>
                        {currentStep < 4 ? (
                            <button
                                onClick={handleNext}
                                className="btn btn-primary"
                            >
                                بعدی
                            </button>
                        ) : (
                            <button
                                onClick={handleLaunch}
                                className="btn btn-launch"
                            >
                                {isAuthenticated ? 'پرداخت و ارسال کمپین' : 'ورود و ارسال کمپین'}
                            </button>
                        )}
                    </div>
                </footer>
            )}
        </div>
    );

    const renderPage = () => {
        const pageContent = () => {
            switch (currentPage) {
                 case 'dashboard':
                    return (
                        <DashboardPage 
                            theme={effectiveTheme}
                            onNavigate={handleNavigation} 
                            onOpenAIAssistant={handleOpenAIAssistant} 
                            audienceCategories={audienceCategories}
                        />
                    );
                case 'audiences':
                    return (
                        <AudiencesPage onStartCampaign={handleStartCampaign} audienceCategories={audienceCategories} />
                    );
                case 'campaigns':
                    return (
                        <CampaignsPage onStartNewCampaign={handleStartNewCampaign} />
                    );
                case 'reports':
                    return (
                        viewedReport ? (
                            <Step5Analytics 
                                theme={effectiveTheme}
                                viewedReport={viewedReport}
                                onStartNewCampaign={resetCampaign}
                                onBackToReports={handleBackToReports}
                            />
                        ) : (
                            <ReportsPage reports={MOCK_REPORTS} onViewReport={handleViewReport} />
                        )
                    );
                 case 'calendar':
                    return (
                        <CalendarPage onStartCampaign={handleStartCampaignFromCalendar} />
                    );
                case 'profile':
                    return (
                        <UserProfilePage theme={theme} setTheme={setTheme} onNavigate={handleNavigation} />
                    );
                case 'login':
                    return <LoginPage />;
            }
        };

        return <div className="w-full max-w-7xl animate-fade-in">{pageContent()}</div>
    }
    
    const uiContextValue = useMemo(() => ({
        navigateToLogin,
        navigate: handleNavigation
    }), [navigateToLogin, handleNavigation]);

    const showHeader = currentPage !== 'login' || isAuthenticated;

    return (
        <UIProvider value={uiContextValue}>
            <div className="app-container">
                {showHeader && (
                    <Header 
                        setCurrentPage={handleNavigation} 
                        currentPage={currentPage}
                        onStartNewCampaign={handleStartNewCampaign}
                        logoUrl={logoUrl}
                    />
                )}
                
                <NotificationContainer />

                {isAIAssistantOpen && (
                    <AIAssistantModal 
                        isOpen={isAIAssistantOpen}
                        onClose={handleCloseAIAssistant}
                        onApply={handleApplyAIDraft}
                        initialPrompt={aiInitialPrompt}
                        audienceCategories={audienceCategories}
                    />
                )}

                {isWizardActive ? renderWizard() : renderPage()}
            </div>
        </UIProvider>
    );
};

export default App;