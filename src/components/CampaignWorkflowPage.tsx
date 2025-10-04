import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { fetchCampaignById, updateCampaign, createCampaign } from '../services/campaignService';
import { uploadFile } from '../services/fileService';
import type { EmailMarketingCampaign, CampaignState, CampaignStatus, AudienceCategory, Report } from '../types';
import { LoadingSpinner } from '../components/IconComponents';
import CampaignStatusStepper from './CampaignStatusStepper';
import Step1Audience from './steps/Step1_Audience';
import Step2Message from './steps/Step2_Message';
import Step3Schedule from './steps/Step3_Schedule';
import Step4Review from './steps/Step4_Review';
import Step5Analytics from './steps/Step5_Analytics';

interface Props {
    campaignId: number;
    onBack: () => void;
    audienceCategories: AudienceCategory[];
    theme: 'light' | 'dark';
    initialData: Partial<Omit<EmailMarketingCampaign, 'id'>> | null;
    requestLogin: (callback: () => void) => void;
    onCampaignCreated: (id: number) => void;
}

const mapCampaignToWizardState = (campaign: EmailMarketingCampaign, categories: AudienceCategory[]): CampaignState => {
    const campaignDate = new Date(campaign.campaign_date);
    const sendDate = campaignDate.toISOString().split('T')[0];
    const sendTime = campaignDate.toTimeString().split(' ')[0].substring(0, 5);
    
    const categoryIds = campaign.campaign_audiences?.map(rel => {
        const audience = rel.audiences_id;
        if (typeof audience === 'object' && audience !== null) {
            return String(audience.id);
        }
        // Handle cases where audiences_id is just a number (on create)
        if (typeof audience === 'number') {
            return String(audience);
        }
        return '';
    }).filter(id => id) || [];
    
    const selectedCategories = categories.filter(c => categoryIds.includes(c.id));
    const totalHealthScore = selectedCategories.reduce((acc, c) => {
        const score = c.health === 'Excellent' ? 95 : c.health === 'Good' ? 75 : 25;
        return acc + score;
    }, 0);
    const avgHealthScore = selectedCategories.length > 0 ? totalHealthScore / selectedCategories.length : 0;

    return {
        audience: {
            segmentId: null,
            categoryIds: categoryIds,
            healthScore: avgHealthScore,
        },
        message: {
            subject: campaign.campaign_subject,
            body: campaign.campaign_content,
            contentType: campaign.campaign_html ? 'html' : 'editor',
            htmlFile: null,
            htmlFileId: campaign.campaign_html,
            abTest: {
                enabled: campaign.campaign_ab,
                subjectB: campaign.campaign_subject_b || '',
                testSize: 20,
            },
        },
        schedule: {
            sendDate: sendDate,
            sendTime: sendTime,
            timezoneAware: true,
        },
    };
};

const mapCampaignToReport = (campaign: EmailMarketingCampaign): Report => ({
    id: String(campaign.id),
    name: campaign.campaign_subject,
    sentDate: campaign.campaign_date,
    stats: {
        openRate: 25.3 + (campaign.id % 10),
        clickRate: 3.8 + (campaign.id % 5),
        conversions: 112 + (campaign.id % 50)
    },
    chartData: [
      { name: '۱ ساعت', opens: 1200, clicks: 150 },
      { name: '۳ ساعت', opens: 2500, clicks: 400 },
      { name: '۶ ساعت', opens: 2800, clicks: 550 },
      { name: '۱۲ ساعت', opens: 3100, clicks: 610 },
      { name: '۲۴ ساعت', opens: 3580, clicks: 702 },
      { name: '۴۸ ساعت', opens: 3820, clicks: 750 },
    ]
});


const CampaignWorkflowPage: React.FC<Props> = ({ campaignId, onBack, audienceCategories, theme, initialData, requestLogin, onCampaignCreated }) => {
    const [campaign, setCampaign] = useState<EmailMarketingCampaign | null>(null);
    const [wizardState, setWizardState] = useState<CampaignState | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [localStatus, setLocalStatus] = useState<CampaignStatus>('targeting');
    
    const { accessToken, isAuthenticated } = useAuth();
    const { addNotification } = useNotification();
    
    const isNewCampaign = campaignId === 0;

    const loadCampaign = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        if (isNewCampaign) {
            const defaultCampaignData: EmailMarketingCampaign = {
                id: 0,
                status: 'draft',
                campaign_subject: 'کمپین جدید بدون عنوان',
                campaign_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                campaign_color: null,
                campaign_link: null,
                campaign_sender: null,
                campaign_status: 'targeting',
                campaign_ab: false,
                campaign_subject_b: null,
                campaign_content: 'سلام،\n\nاین محتوای پیش‌فرض برای کمپین جدید شماست. لطفاً آن را ویرایش کنید.',
                campaign_html: null,
                ...initialData
            };
            setCampaign(defaultCampaignData);
            setWizardState(mapCampaignToWizardState(defaultCampaignData, audienceCategories));
            setIsLoading(false);
            return;
        }

        if (!accessToken) {
            setError("Authentication token is missing.");
            setIsLoading(false);
            return;
        }

        try {
            const data = await fetchCampaignById(campaignId, accessToken);
            setCampaign(data);
            setWizardState(mapCampaignToWizardState(data, audienceCategories));
        } catch (err) {
            setError("Failed to load campaign details.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [campaignId, accessToken, audienceCategories, isNewCampaign, initialData]);

    useEffect(() => {
        loadCampaign();
    }, [loadCampaign]);

    const updateWizardState = useCallback(<K extends keyof CampaignState>(field: K, value: CampaignState[K]) => {
        setWizardState(prev => prev ? ({
            ...prev,
            [field]: value
        }) : null);
    }, []);
    
    const handleStatusUpdate = async (newStatus: CampaignStatus, updatedData?: Partial<EmailMarketingCampaign>) => {
        if (!accessToken || !campaign || isNewCampaign) return;
        setIsUpdating(true);
        try {
            const payload = { ...updatedData, campaign_status: newStatus };
            await updateCampaign(campaign.id, payload, accessToken);
            addNotification('مرحله کمپین با موفقیت بروزرسانی شد!', 'success');
            await loadCampaign();
        } catch (err: any) {
            addNotification(err.message || 'خطا در بروزرسانی کمپین.', 'error');
        } finally {
            setIsUpdating(false);
        }
    };
    
    const handleSaveAudience = async () => {
        if (isNewCampaign) {
            setLocalStatus('editing');
            return;
        }

        if (!wizardState) return;
        const payload: Partial<EmailMarketingCampaign> = {
            campaign_audiences: wizardState.audience.categoryIds.map(id => ({ audiences_id: parseInt(id, 10) }))
        };
        await handleStatusUpdate('editing', payload);
    };

    const createNewCampaign = async (targetStatus: CampaignStatus) => {
        if (!wizardState || !accessToken) return;
        setIsUpdating(true);
        try {
            let htmlFileId: string | null = wizardState.message.htmlFileId;
            if (wizardState.message.contentType === 'html' && wizardState.message.htmlFile) {
                addNotification('در حال آپلود فایل جدید HTML...', 'info');
                htmlFileId = await uploadFile(wizardState.message.htmlFile, accessToken);
                addNotification('فایل HTML با موفقیت آپلود شد.', 'success');
            } else if (wizardState.message.contentType === 'editor') {
                htmlFileId = null;
            }

            const campaignDate = `${wizardState.schedule.sendDate}T${wizardState.schedule.sendTime}:00`;
            const payload: Partial<Omit<EmailMarketingCampaign, 'id'>> = {
                campaign_subject: wizardState.message.subject,
                campaign_content: wizardState.message.contentType === 'editor' ? wizardState.message.body : '',
                campaign_html: htmlFileId,
                campaign_ab: wizardState.message.abTest.enabled,
                campaign_subject_b: wizardState.message.abTest.subjectB,
                campaign_date: campaignDate,
                campaign_audiences: wizardState.audience.categoryIds.map(id => ({ audiences_id: parseInt(id, 10) })),
                campaign_status: targetStatus,
                status: 'draft',
            };
            const newCampaign = await createCampaign(payload, accessToken);
            addNotification('کمپین با موفقیت ایجاد و ذخیره شد!', 'success');
            onCampaignCreated(newCampaign.id);
        } catch (error: any) {
             addNotification(error.message || 'خطا در ایجاد کمپین.', 'error');
        } finally {
            setIsUpdating(false);
        }
    }


    const handleSaveChanges = async () => {
        if (!isAuthenticated) {
            addNotification('برای ذخیره و ادامه، لطفاً وارد شوید.', 'info');
            requestLogin(() => handleSaveChanges());
            return;
        }

        if (isNewCampaign) {
            await createNewCampaign('scheduled');
            return;
        }
        
        if (!wizardState || !accessToken) return;
        setIsUpdating(true);
        try {
            let htmlFileId: string | null = wizardState.message.htmlFileId;

            if (wizardState.message.contentType === 'html' && wizardState.message.htmlFile) {
                addNotification('در حال آپلود فایل جدید HTML...', 'info');
                htmlFileId = await uploadFile(wizardState.message.htmlFile, accessToken);
                addNotification('فایل HTML با موفقیت آپلود شد.', 'success');
            } else if (wizardState.message.contentType === 'editor') {
                htmlFileId = null;
            }

            const payload: Partial<EmailMarketingCampaign> = {
                campaign_subject: wizardState.message.subject,
                campaign_content: wizardState.message.contentType === 'editor' ? wizardState.message.body : '',
                campaign_html: htmlFileId,
                campaign_ab: wizardState.message.abTest.enabled,
                campaign_subject_b: wizardState.message.abTest.subjectB,
                campaign_audiences: wizardState.audience.categoryIds.map(id => ({ audiences_id: parseInt(id, 10) }))
            };
            await handleStatusUpdate('scheduled', payload);
        } catch (error: any) {
            addNotification(error.message || 'خطا در ذخیره تغییرات.', 'error');
            setIsUpdating(false);
        }
    };

    const handleUpdateSchedule = () => {
        // This flow should only be accessible for existing campaigns.
        if (isNewCampaign || !wizardState) return;

        const payload: Partial<EmailMarketingCampaign> = {
            campaign_date: `${wizardState.schedule.sendDate}T${wizardState.schedule.sendTime}:00`,
        };
        handleStatusUpdate('payment', payload);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center py-40"><LoadingSpinner className="w-16 h-16 text-brand-purple" /></div>;
    }
    if (error || !campaign || !wizardState) {
        return (
            <div className="text-center py-20 card">
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">خطا در بارگذاری کمپین</h3>
                <p className="mt-2 text-base text-slate-500 dark:text-slate-400">{error || 'کمپین یافت نشد.'}</p>
                <button onClick={onBack} className="btn btn-primary mt-6">بازگشت به لیست</button>
            </div>
        );
    }
    
    const currentStatus = isNewCampaign ? localStatus : campaign.campaign_status;

    const renderContent = () => {
        switch (currentStatus) {
            case 'targeting':
                return (
                    <div>
                        <Step1Audience campaignData={wizardState} updateCampaignData={updateWizardState} onOpenAIAssistant={() => {}} audienceCategories={audienceCategories} />
                        <footer className="mt-8 flex justify-between items-center">
                            <button onClick={onBack} className="btn btn-secondary">بازگشت به لیست</button>
                            <button onClick={handleSaveAudience} disabled={isUpdating} className="btn btn-primary w-48">{isUpdating ? <LoadingSpinner className="w-5 h-5"/> : 'ذخیره و ادامه'}</button>
                        </footer>
                    </div>
                );
            case 'editing':
                return (
                    <div>
                        <Step2Message campaignData={wizardState} updateCampaignData={updateWizardState} />
                        <footer className="mt-8 flex justify-between items-center">
                            <button onClick={() => isNewCampaign ? setLocalStatus('targeting') : handleStatusUpdate('targeting')} disabled={isUpdating} className="btn btn-secondary">بازگشت به مخاطبان</button>
                            <button onClick={handleSaveChanges} disabled={isUpdating} className="btn btn-primary w-48">{isUpdating ? <LoadingSpinner className="w-5 h-5"/> : 'ذخیره و ادامه'}</button>
                        </footer>
                    </div>
                );
            case 'scheduled':
                return (
                    <div>
                        <Step3Schedule campaignData={wizardState} updateCampaignData={updateWizardState} />
                        <footer className="mt-8 flex justify-between items-center">
                            <button onClick={() => handleStatusUpdate('editing')} disabled={isUpdating} className="btn btn-secondary">بازگشت به ویرایش</button>
                            <button onClick={handleUpdateSchedule} disabled={isUpdating} className="btn btn-primary w-52">{isUpdating ? <LoadingSpinner className="w-5 h-5"/> : 'تایید زمانبندی و ادامه'}</button>
                        </footer>
                    </div>
                );
            case 'payment':
                 return (
                    <div>
                        <Step4Review campaignData={wizardState} audienceCategories={audienceCategories} />
                         <footer className="mt-8 flex justify-between items-center">
                            <button onClick={() => handleStatusUpdate('scheduled')} disabled={isUpdating} className="btn btn-secondary">بازگشت به زمانبندی</button>
                            <button onClick={() => handleStatusUpdate('processing')} disabled={isUpdating} className="btn btn-launch w-52">{isUpdating ? <LoadingSpinner className="w-5 h-5"/> : 'پرداخت و نهایی کردن'}</button>
                        </footer>
                    </div>
                );
            case 'processing': {
                const sendDate = new Date(campaign.campaign_date);
                return (
                    <div className="text-center card py-20">
                         <h2 className="text-2xl font-bold text-slate-900 dark:text-white">کمپین در صف ارسال است</h2>
                         <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">کمپین شما برای ارسال در زمان زیر آماده است:</p>
                         <p className="mt-4 text-3xl font-bold text-brand-purple">{sendDate.toLocaleString('fa-IR', { dateStyle: 'full', timeStyle: 'short' })}</p>
                    </div>
                );
            }
            case 'sending': {
                return (
                    <div className="text-center card py-20">
                         <h2 className="text-2xl font-bold text-slate-900 dark:text-white animate-pulse">کمپین در حال ارسال است...</h2>
                         <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">ما در حال ارسال ایمیل‌ها به مخاطبان شما هستیم.</p>
                         <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 mt-8 overflow-hidden">
                            <div className="bg-brand-purple h-4 rounded-full w-2/3 animate-pulse"></div>
                        </div>
                    </div>
                );
            }
            case 'completed':
                return <Step5Analytics theme={theme} viewedReport={mapCampaignToReport(campaign)} onBack={onBack} />;
            default:
                return <p>وضعیت کمپین نامشخص است.</p>;
        }
    };

    return (
        <div className="animate-fade-in">
             <div className="flex flex-col md:flex-row justify-between md:items-center mb-10 gap-4">
                <div className="flex-grow">
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-4xl">{isNewCampaign ? "ایجاد کمپین جدید" : campaign.campaign_subject}</h1>
                </div>
                {currentStatus !== 'completed' && (
                    <button onClick={onBack} className="btn btn-secondary flex-shrink-0">&rarr; بازگشت به کمپین‌ها</button>
                )}
            </div>
            
            <div className="mb-12">
                <CampaignStatusStepper currentStatus={currentStatus} />
            </div>

            <main className="page-main-content">
                {renderContent()}
            </main>
        </div>
    );
};

export default CampaignWorkflowPage;
