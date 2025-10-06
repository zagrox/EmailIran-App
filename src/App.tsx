
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { CampaignState, AICampaignDraft, AudienceCategory, ApiAudienceItem, Page, EmailMarketingCampaign } from './types';
import Header from './components/Header';
import AIAssistantModal from './components/AIAssistantModal';
import AudiencesPage from './components/AudiencesPage';
import DashboardPage from './components/DashboardPage';
import CalendarPage from './components/CalendarPage';
import UserProfilePage from './components/UserProfilePage';
import CampaignsPage from './components/CampaignsPage';
import CampaignWorkflowPage from './components/CampaignWorkflowPage';
import LoginPage from './components/LoginPage';
import HelpPage from './components/HelpPage';
import PricingPage from './components/PricingPage';
import { useAuth } from './contexts/AuthContext';
import { UIProvider } from './contexts/UIContext';
import NotificationContainer from './components/NotificationContainer';
import { useNotification } from './contexts/NotificationContext';
import { createCampaign } from './services/campaignService';
import { uploadFile } from './services/fileService';

type Theme = 'light' | 'dark' | 'system';

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
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system');
    const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');
    const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
    const [viewedCampaignId, setViewedCampaignId] = useState<number | null>(null);
    const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>();
    const [audienceCategories, setAudienceCategories] = useState<AudienceCategory[]>([]);
    const [isLoadingAudiences, setIsLoadingAudiences] = useState(true);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [newCampaignInitialData, setNewCampaignInitialData] = useState<Partial<Omit<EmailMarketingCampaign, 'id'>> | null>(null);
    const [pendingCampaignDraft, setPendingCampaignDraft] = useState<CampaignState | null>(null);

    const { isAuthenticated, user, accessToken } = useAuth();
    const { addNotification } = useNotification();

    const handleNavigation = useCallback((page: Page) => {
        setCurrentPage(prevPage => {
            if (page !== 'campaigns') {
                setViewedCampaignId(null);
            }
            return page;
        });
    }, []);

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
    
    const handleViewCampaign = useCallback((id: number) => {
        setViewedCampaignId(id);
        setCurrentPage('campaigns');
    }, []);

    const createCampaignFromDraft = useCallback(async (draft: CampaignState) => {
        if (!accessToken) {
            addNotification('Authentication failed. Please log in again.', 'error');
            return;
        }
        try {
            let htmlFileId: string | null = draft.message.htmlFileId;
            if (draft.message.contentType === 'html' && draft.message.htmlFile) {
                addNotification('در حال آپلود فایل جدید HTML...', 'info');
                htmlFileId = await uploadFile(draft.message.htmlFile, accessToken);
                addNotification('فایل HTML با موفقیت آپلود شد.', 'success');
            } else if (draft.message.contentType === 'editor') {
                htmlFileId = null;
            }

            const campaignDate = `${draft.schedule.sendDate}T${draft.schedule.sendTime}:00`;
            const payload: Partial<Omit<EmailMarketingCampaign, 'id'>> = {
                campaign_subject: draft.message.subject,
                campaign_content: draft.message.contentType === 'editor' ? draft.message.body : '',
                campaign_html: htmlFileId,
                campaign_ab: draft.message.abTest.enabled,
                campaign_subject_b: draft.message.abTest.subjectB,
                campaign_date: campaignDate,
                campaign_audiences: draft.audience.categoryIds.map(id => ({ audiences_id: parseInt(id, 10) })),
                campaign_status: 'scheduled',
                status: 'draft',
            };
            const newCampaign = await createCampaign(payload, accessToken);
            addNotification('کمپین با موفقیت ایجاد و ذخیره شد!', 'success');
            handleViewCampaign(newCampaign.id);
        } catch (error: any) {
             addNotification(error.message || 'خطا در ایجاد کمپین.', 'error');
        }
    }, [accessToken, addNotification, handleViewCampaign]);

    useEffect(() => {
        // This effect handles post-authentication logic.
        if (isAuthenticated) {
            if (pendingCampaignDraft) {
                createCampaignFromDraft(pendingCampaignDraft);
                setPendingCampaignDraft(null);
            } else if (currentPage === 'login') {
                // If the user just logged in without a pending action, go to dashboard.
                handleNavigation('dashboard');
            }
        }
    }, [isAuthenticated, currentPage, handleNavigation, pendingCampaignDraft, createCampaignFromDraft]);

    const navigateToLogin = useCallback(() => {
        handleNavigation('login');
    }, [handleNavigation]);

    const requestLogin = (draft: CampaignState) => {
        setPendingCampaignDraft(draft);
        navigateToLogin();
    };

    const handleStartNewCampaign = () => {
        setNewCampaignInitialData({});
        setViewedCampaignId(0); // 0 indicates a new, unsaved campaign
        setCurrentPage('campaigns');
    };
    
    const handleStartCampaign = (categoryId: string) => {
        setNewCampaignInitialData({
             campaign_audiences: [{ audiences_id: parseInt(categoryId, 10) }]
        });
        setViewedCampaignId(0);
        setCurrentPage('campaigns');
    };

    const handleStartCampaignFromCalendar = (date: string) => {
        setNewCampaignInitialData({
            campaign_date: `${date}T09:00:00`,
        });
        setViewedCampaignId(0);
        setCurrentPage('campaigns');
    };

    const handleApplyAIDraft = (draft: AICampaignDraft) => {
        setIsAIAssistantOpen(false);
        setNewCampaignInitialData({
            campaign_subject: draft.subject,
            campaign_content: draft.body,
            campaign_ab: !!draft.subjectB,
            campaign_subject_b: draft.subjectB || null,
            campaign_date: `${new Date().toISOString().split('T')[0]}T${draft.sendTime}:00`,
            campaign_audiences: [{ audiences_id: parseInt(draft.audienceCategoryId, 10) }]
        });
        setViewedCampaignId(0);
        setCurrentPage('campaigns');
    };
    
    const handleBackToCampaigns = () => {
        setViewedCampaignId(null);
    };

    const handleOpenAIAssistant = (prompt?: string) => {
        setAiInitialPrompt(prompt);
        setIsAIAssistantOpen(true);
    };

    const handleCloseAIAssistant = () => {
        setIsAIAssistantOpen(false);
        setAiInitialPrompt(undefined);
    };

    const renderPage = () => {
        const pageContent = () => {
            switch (currentPage) {
                 case 'dashboard':
                    return (
                        <DashboardPage 
                            theme={effectiveTheme}
                            onOpenAIAssistant={handleOpenAIAssistant} 
                            audienceCategories={audienceCategories}
                            onViewCampaign={handleViewCampaign}
                        />
                    );
                case 'audiences':
                    return (
                        <AudiencesPage onStartCampaign={handleStartCampaign} audienceCategories={audienceCategories} />
                    );
                case 'campaigns':
                    return viewedCampaignId !== null ? (
                        <CampaignWorkflowPage 
                            campaignId={viewedCampaignId} 
                            onBack={handleBackToCampaigns}
                            audienceCategories={audienceCategories}
                            theme={effectiveTheme}
                            initialData={viewedCampaignId === 0 ? newCampaignInitialData : null}
                            requestLogin={requestLogin}
                            onCampaignCreated={handleViewCampaign}
                            onOpenAIAssistant={handleOpenAIAssistant}
                        />
                    ) : (
                        <CampaignsPage 
                            onStartNewCampaign={handleStartNewCampaign}
                            onViewCampaign={handleViewCampaign}
                        />
                    );
                 case 'calendar':
                    return (
                        <CalendarPage onStartCampaign={handleStartCampaignFromCalendar} />
                    );
                case 'profile':
                    return (
                        <UserProfilePage theme={theme} setTheme={setTheme} onNavigate={handleNavigation} />
                    );
                case 'help':
                    return <HelpPage />;
                case 'pricing':
                    return <PricingPage />;
                case 'login':
                    return <LoginPage logoUrl={logoUrl} />;
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

                {renderPage()}
            </div>
        </UIProvider>
    );
};

export default App;
