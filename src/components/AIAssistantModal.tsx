
import React, { useState, useEffect } from 'react';
import { generateCampaignFromPrompt } from '../services/geminiService';
import { AUDIENCE_CATEGORIES } from '../constants';
import type { AICampaignDraft } from '../types';
import { XIcon, SparklesIcon, LoadingSpinner, UsersIcon, MailIcon, ClockIcon } from './IconComponents';
import { STYLES } from '../styles';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApply: (draft: AICampaignDraft) => void;
  initialPrompt?: string;
}

const AIAssistantModal: React.FC<Props> = ({ isOpen, onClose, onApply, initialPrompt }) => {
    const [prompt, setPrompt] = useState(initialPrompt || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [draft, setDraft] = useState<AICampaignDraft | null>(null);

    const handleGenerate = async (promptToUse?: string) => {
        const currentPrompt = promptToUse || prompt;
        if (!currentPrompt) return;
        setIsLoading(true);
        setError(null);
        setDraft(null);
        try {
            const result = await generateCampaignFromPrompt(currentPrompt, AUDIENCE_CATEGORIES);
            setDraft(result);
        } catch (err) {
            console.error(err);
            setError('متأسفانه، پیش‌نویس تولید نشد. لطفاً دوباره تلاش کنید.');
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (initialPrompt && !draft && !isLoading) {
            setPrompt(initialPrompt);
            handleGenerate(initialPrompt);
        }
    }, [initialPrompt, draft, isLoading]);


    if (!isOpen) return null;

    const handleApply = () => {
        if (draft) {
            onApply(draft);
            resetState();
        }
    };

    const handleClose = () => {
        onClose();
        // Do not reset state here, let parent component handle it
        // This preserves state if modal is just hidden
    };

    const resetState = () => {
        setPrompt('');
        setIsLoading(false);
        setError(null);
        setDraft(null);
    }
    
    const selectedCategory = AUDIENCE_CATEGORIES.find(c => c.id === draft?.audienceCategoryId);
    const selectedAudienceName = selectedCategory?.name_fa || 'مخاطب نامشخص';


    return (
        <div
            className={STYLES.modal.overlay}
            onClick={handleClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className={STYLES.modal.container}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={STYLES.modal.header}>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <SparklesIcon className="w-7 h-7 text-brand-purple" />
                        دستیار هوش مصنوعی کمپین
                    </h2>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                        <XIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                    </button>
                </div>

                <div className={STYLES.modal.content}>
                    {!draft && !isLoading && (
                        <div>
                            <label htmlFor="campaign-goal" className="block text-lg font-medium text-slate-700 dark:text-slate-300">
                                ۱. هدف کمپین خود را توصیف کنید
                            </label>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-3">مثال: «یک فروش ویژه ۲۴ ساعته برای مجموعه تابستانی ما برای مشتریان وفادار اعلام کن.»</p>
                            <textarea
                                id="campaign-goal"
                                rows={4}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                disabled={isLoading}
                                className={STYLES.input.default}
                                placeholder="اینجا بنویسید..."
                            />
                        </div>
                    )}
                    
                     {isLoading && (
                        <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
                            <LoadingSpinner className="w-12 h-12 text-brand-purple" />
                            <p className="text-slate-600 dark:text-slate-300">در حال ساخت کمپین شما... این ممکن است چند لحظه طول بکشد.</p>
                        </div>
                     )}

                    {error && <div className="p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md text-sm">{error}</div>}

                    {draft && (
                         <div className="space-y-6 animate-fade-in">
                            <div>
                                <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">۲. پیش‌نویس خود را بازبینی کنید</h3>
                                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-4 bg-white dark:bg-slate-800/50">
                                    <div className="flex items-start gap-3">
                                        <UsersIcon className="w-5 h-5 mt-1 text-brand-mint"/>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 dark:text-white">مخاطب پیشنهادی</h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-300">{selectedAudienceName}</p>
                                        </div>
                                    </div>
                                    <div className="border-t border-slate-200 dark:border-slate-700"></div>
                                    <div className="flex items-start gap-3">
                                        <MailIcon className="w-5 h-5 mt-1 text-brand-mint"/>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 dark:text-white">پیام پیشنهادی</h4>
                                            <p className="text-sm font-bold mt-2">موضوع اصلی: <span className="font-normal">"{draft.subject}"</span></p>
                                            <p className="text-sm font-bold mt-1 text-brand-mint">موضوع تست A/B: <span className="font-normal text-slate-600 dark:text-slate-300">"{draft.subjectB}"</span></p>
                                            <p className="text-sm mt-2 whitespace-pre-wrap border-l-4 border-slate-200 dark:border-slate-700 pl-3 py-1">{draft.body}</p>
                                        </div>
                                    </div>
                                    <div className="border-t border-slate-200 dark:border-slate-700"></div>
                                     <div className="flex items-start gap-3">
                                        <ClockIcon className="w-5 h-5 mt-1 text-brand-mint"/>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 dark:text-white">زمان ارسال پیشنهادی</h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-300">{draft.sendTime}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className={STYLES.modal.footer}>
                    <button
                        onClick={handleClose}
                        className={STYLES.button.secondary}
                    >
                        لغو
                    </button>
                    {!draft ? (
                        <button
                            onClick={() => handleGenerate()}
                            disabled={isLoading || !prompt}
                            className="w-48 px-6 py-2 bg-brand-purple text-white rounded-md hover:bg-violet-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? <LoadingSpinner className="w-5 h-5"/> : 'تولید پیش‌نویس'}
                        </button>
                    ) : (
                        <button
                            onClick={handleApply}
                            className="px-6 py-2 bg-brand-mint text-slate-900 rounded-md hover:opacity-90 transition-opacity font-semibold"
                        >
                            اعمال پیش‌نویس
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIAssistantModal;