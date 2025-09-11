
import React, { useState } from 'react';
import { CampaignState } from '../../types.ts';
import { getSubjectSuggestions, improveEmailBody } from '../../services/geminiService.ts';
import { SparklesIcon, LoadingSpinner, DocumentDuplicateIcon } from '../IconComponents.tsx';
import TemplateBrowser from '../TemplateBrowser.tsx';
import { STYLES } from '../../styles.ts';

interface Props {
  campaignData: CampaignState;
  updateCampaignData: <K extends keyof CampaignState>(field: K, value: CampaignState[K]) => void;
}

const AISuggestionButton: React.FC<{ onClick: () => void; isLoading: boolean; text: string }> = ({ onClick, isLoading, text }) => (
    <button
        onClick={onClick}
        disabled={isLoading}
        className={STYLES.button.aiSuggestion}
    >
        {isLoading ? <LoadingSpinner className="w-4 h-4" /> : <SparklesIcon className="w-4 h-4" />}
        <span>{text}</span>
    </button>
);

const Step2Message: React.FC<Props> = ({ campaignData, updateCampaignData }) => {
    const { message } = campaignData;
    const [isSubjectLoading, setIsSubjectLoading] = useState(false);
    const [isBodyLoading, setIsBodyLoading] = useState(false);
    const [subjectSuggestions, setSubjectSuggestions] = useState<string[]>([]);
    const [isTemplateBrowserOpen, setIsTemplateBrowserOpen] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        updateCampaignData('message', { ...message, [e.target.name]: e.target.value });
    };
    
    const handleAbTestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : type === 'range' ? parseInt(value, 10) : value;

        updateCampaignData('message', {
            ...message,
            abTest: { ...message.abTest, [name]: newValue }
        });
    };
    
    const handleAbTestEnableToggle = () => {
        updateCampaignData('message', { ...message, abTest: { ...message.abTest, enabled: !message.abTest.enabled } });
    }

    const handleGetSubjectSuggestions = async () => {
        if (!message.body) return;
        setIsSubjectLoading(true);
        setSubjectSuggestions([]);
        const suggestions = await getSubjectSuggestions(message.body);
        setSubjectSuggestions(suggestions);
        setIsSubjectLoading(false);
    };

    const handleImproveBody = async () => {
        if (!message.body) return;
        setIsBodyLoading(true);
        const improvedBody = await improveEmailBody(message.body);
        updateCampaignData('message', { ...message, body: improvedBody });
        setIsBodyLoading(false);
    };

    const applySuggestion = (subject: string) => {
        updateCampaignData('message', { ...message, subject });
        setSubjectSuggestions([]);
    };
    
    const handleSelectTemplate = ({ subject, body }: { subject: string, body: string }) => {
        updateCampaignData('message', { ...message, subject, body });
    };
    
    const isAbTestEnabled = message.abTest.enabled;

    return (
        <div className="animate-slide-in-up">
            <TemplateBrowser 
                isOpen={isTemplateBrowserOpen}
                onClose={() => setIsTemplateBrowserOpen(false)}
                onSelectTemplate={handleSelectTemplate}
            />

            <div className="flex justify-between items-center mb-2">
                <h2 className={STYLES.typography.h2}>پیام خود را بسازید</h2>
                <button
                    onClick={() => setIsTemplateBrowserOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-mint text-slate-900 rounded-md hover:opacity-90 transition-opacity duration-200 font-semibold text-sm"
                >
                    <DocumentDuplicateIcon className="w-5 h-5" />
                    انتخاب از قالب‌ها
                </button>
            </div>
            <p className={STYLES.typography.p}>با ذوق طراحی کنید، با کمک هوش مصنوعی با هدف صحبت کنید.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    {/* Subject */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="subject" className={STYLES.typography.label}>موضوع اصلی (نسخه الف)</label>
                            <AISuggestionButton onClick={handleGetSubjectSuggestions} isLoading={isSubjectLoading} text="پیشنهاد موضوع" />
                        </div>
                        <input
                            type="text"
                            name="subject"
                            id="subject"
                            value={message.subject}
                            onChange={handleInputChange}
                            className={STYLES.input.default}
                        />
                         {subjectSuggestions.length > 0 && (
                            <div className="mt-2 space-y-2 bg-slate-100 dark:bg-slate-900 p-3 rounded-md border border-slate-200 dark:border-slate-700">
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">پیشنهادات:</p>
                                {subjectSuggestions.map((s, i) => (
                                    <button key={i} onClick={() => applySuggestion(s)} className="block w-full text-right p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-sm text-slate-600 dark:text-slate-200 transition-colors">
                                        "{s}"
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* A/B Test Section */}
                    <div className={`${STYLES.card.container} !p-4`}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-slate-900 dark:text-white">آزمون A/B برای موضوع</h3>
                            <button
                                onClick={handleAbTestEnableToggle}
                                className={`${STYLES.toggle.base} ${isAbTestEnabled ? STYLES.abTest.on : STYLES.toggle.off}`}
                            >
                                <span className={`${STYLES.toggle.handle} ${isAbTestEnabled ? STYLES.toggle.handleOn : STYLES.toggle.handleOff}`} />
                            </button>
                        </div>
                         {isAbTestEnabled && (
                             <div className="mt-4 space-y-4 animate-fade-in">
                                <div>
                                    <label htmlFor="subjectB" className={`${STYLES.typography.label} mb-2`}>موضوع جایگزین (نسخه ب)</label>
                                    <input
                                        type="text"
                                        id="subjectB"
                                        name="subjectB"
                                        value={message.abTest.subjectB}
                                        onChange={handleAbTestChange}
                                        className={STYLES.input.default}
                                        placeholder="موضوع جایگزین را وارد کنید"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="testSize" className={`${STYLES.typography.label} mb-2`}>اندازه گروه آزمون ({message.abTest.testSize}%)</label>
                                    <input
                                        type="range"
                                        id="testSize"
                                        name="testSize"
                                        min="10"
                                        max="50"
                                        step="5"
                                        value={message.abTest.testSize}
                                        onChange={handleAbTestChange}
                                        className={STYLES.input.range}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                   
                    {/* Body */}
                    <div>
                         <div className="flex justify-between items-center mb-2">
                            <label htmlFor="body" className={STYLES.typography.label}>متن ایمیل</label>
                            <AISuggestionButton onClick={handleImproveBody} isLoading={isBodyLoading} text="بهبود با هوش مصنوعی" />
                        </div>
                        <div className="relative">
                            <textarea
                                name="body"
                                id="body"
                                rows={15}
                                value={message.body}
                                onChange={handleInputChange}
                                className={`${STYLES.input.default} resize-none`}
                            ></textarea>
                             {isBodyLoading && (
                                <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center rounded-md">
                                    <LoadingSpinner className="w-8 h-8 text-brand-purple" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Email Previews */}
                <div className="space-y-6">
                    <div className={STYLES.card.container}>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-4">پیش‌نمایش زنده</h3>
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
                            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{message.subject || <span className="text-slate-400">[موضوع شما در اینجا]</span>}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">از: تیم شما &lt;team@yourcompany.com&gt;</p>
                            </div>
                            <div className="p-4 text-sm text-slate-700 dark:text-slate-300 max-h-[350px] overflow-y-auto">
                                <p className="whitespace-pre-wrap">{message.body || <span className="text-slate-400">[محتوای ایمیل شما در اینجا نمایش داده می‌شود.]</span>}</p>
                            </div>
                        </div>
                    </div>
                    
                    {isAbTestEnabled && (
                         <div className={`${STYLES.card.container} animate-fade-in`}>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-4">پیش‌نمایش آزمون A/B</h3>
                            <div className="space-y-3 p-4 bg-white dark:bg-slate-900 rounded-md border border-slate-300 dark:border-slate-600">
                                <div>
                                    <span className="text-xs font-bold uppercase text-brand-purple">نسخه الف</span>
                                    <div className="mt-1 p-2 border-l-4 border-brand-purple bg-slate-50 dark:bg-slate-800 rounded-r-md">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{message.subject}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">سلام علی، ما به‌روزرسانی‌های شگفت‌انگیزی برای شما داریم...</p>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs font-bold uppercase text-brand-mint">نسخه ب</span>
                                    <div className="mt-1 p-2 border-l-4 border-brand-mint bg-slate-50 dark:bg-slate-800 rounded-r-md">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                                            {message.abTest.subjectB || <span className="text-slate-400 dark:text-slate-500">[موضوع جایگزین شما در اینجا]</span>}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">سلام علی، ما به‌روزرسانی‌های شگفت‌انگیزی برای شما داریم...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Step2Message;