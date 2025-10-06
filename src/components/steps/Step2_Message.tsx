


import React, { useState } from 'react';
import type { CampaignState } from '../../types';
import { getSubjectSuggestions, improveEmailBody } from '../../services/geminiService';
import { SparklesIcon, LoadingSpinner, DocumentDuplicateIcon, ArrowUpTrayIcon, XCircleIcon } from '../IconComponents';
import TemplateBrowser from '../TemplateBrowser';

interface Props {
  campaignData: CampaignState;
  updateCampaignData: <K extends keyof CampaignState>(field: K, value: CampaignState[K]) => void;
}

const AISuggestionButton: React.FC<{ onClick: () => void; isLoading: boolean; text: string, disabled?: boolean }> = ({ onClick, isLoading, text, disabled }) => (
    <button
        onClick={onClick}
        disabled={isLoading || disabled}
        className="btn-ai-suggestion"
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
    const [htmlPreview, setHtmlPreview] = useState<string | null>(null);

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
    
    const handleContentTypeChange = (type: 'editor' | 'html') => {
        updateCampaignData('message', {
            ...message,
            contentType: type,
            // Reset the other content type's data
            body: type === 'html' ? '' : message.body || 'سلام {{firstName}}،\n\nما به‌روزرسانی‌های شگفت‌انگیزی برای شما داریم.',
            htmlFile: type === 'editor' ? null : message.htmlFile,
            htmlFileId: type === 'editor' ? null : message.htmlFileId,
        });
        if(type === 'editor') setHtmlPreview(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file && file.type === 'text/html') {
            updateCampaignData('message', { ...message, htmlFile: file });
            const reader = new FileReader();
            reader.onload = (event) => {
                setHtmlPreview(event.target?.result as string);
            };
            reader.readAsText(file);
        } else if (file) {
            alert('لطفا فقط فایل‌های HTML را انتخاب کنید.');
        }
    };
    
    const removeHtmlFile = () => {
        updateCampaignData('message', { ...message, htmlFile: null, htmlFileId: null });
        setHtmlPreview(null);
    };

    const isEditorMode = message.contentType === 'editor';
    const isHtmlMode = message.contentType === 'html';
    const isAbTestEnabled = message.abTest.enabled;

    return (
        <div className="animate-slide-in-up">
            <TemplateBrowser 
                isOpen={isTemplateBrowserOpen}
                onClose={() => setIsTemplateBrowserOpen(false)}
                onSelectTemplate={handleSelectTemplate}
            />

            <div className="flex justify-between items-center mb-2">
                <h2 className="h2">پیام خود را بسازید</h2>
                <button
                    onClick={() => setIsTemplateBrowserOpen(true)}
                    disabled={isHtmlMode}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-slate-900 rounded-md hover:opacity-90 transition-opacity duration-200 font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <DocumentDuplicateIcon className="w-5 h-5" />
                    انتخاب از قالب‌ها
                </button>
            </div>
            <p className="p-description">با ذوق طراحی کنید، با کمک هوش مصنوعی با هدف صحبت کنید یا قالب HTML خود را آپلود کنید.</p>
            
            <div className="mb-6">
                <div className="inline-grid grid-cols-2 gap-2 rounded-lg bg-slate-200 dark:bg-slate-700 p-1">
                    <button onClick={() => handleContentTypeChange('editor')} className={`px-4 py-1.5 text-base rounded-md font-semibold transition-colors ${isEditorMode ? 'bg-white dark:bg-slate-900 text-brand-600 shadow' : 'text-slate-600 dark:text-slate-300'}`}>ویرایشگر متن</button>
                    <button onClick={() => handleContentTypeChange('html')} className={`px-4 py-1.5 text-base rounded-md font-semibold transition-colors ${isHtmlMode ? 'bg-white dark:bg-slate-900 text-brand-600 shadow' : 'text-slate-600 dark:text-slate-300'}`}>آپلود HTML</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    {/* Subject */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="subject" className="label">موضوع اصلی (نسخه الف)</label>
                            <AISuggestionButton onClick={handleGetSubjectSuggestions} isLoading={isSubjectLoading} text="پیشنهاد موضوع" disabled={isHtmlMode} />
                        </div>
                        <input
                            type="text"
                            name="subject"
                            id="subject"
                            value={message.subject}
                            onChange={handleInputChange}
                            className="input"
                        />
                         {subjectSuggestions.length > 0 && (
                            <div className="mt-2 space-y-2 bg-slate-100 dark:bg-slate-900 p-3 rounded-md border border-slate-200 dark:border-slate-700">
                                <p className="text-base font-semibold text-slate-700 dark:text-slate-300">پیشنهادات:</p>
                                {subjectSuggestions.map((s, i) => (
                                    <button key={i} onClick={() => applySuggestion(s)} className="block w-full text-right p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-base text-slate-600 dark:text-slate-200 transition-colors">
                                        "{s}"
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* A/B Test Section */}
                    <div className="card !p-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">آزمون A/B برای موضوع</h3>
                            <button
                                onClick={handleAbTestEnableToggle}
                                className={`toggle-switch ${isAbTestEnabled ? 'toggle-switch-ab-on' : 'toggle-switch-off'}`}
                            >
                                <span className={`toggle-switch-handle ${isAbTestEnabled ? 'toggle-switch-handle-on' : 'toggle-switch-handle-off'}`} />
                            </button>
                        </div>
                         {isAbTestEnabled && (
                             <div className="mt-4 space-y-4 animate-fade-in">
                                <div>
                                    <label htmlFor="subjectB" className="label mb-2">موضوع جایگزین (نسخه ب)</label>
                                    <input
                                        type="text"
                                        id="subjectB"
                                        name="subjectB"
                                        value={message.abTest.subjectB}
                                        onChange={handleAbTestChange}
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="testSize" className="label mb-2">اندازه گروه آزمون ({message.abTest.testSize}%)</label>
                                    <input
                                        type="range"
                                        id="testSize"
                                        name="testSize"
                                        min="10"
                                        max="50"
                                        step="5"
                                        value={message.abTest.testSize}
                                        onChange={handleAbTestChange}
                                        className="input-range"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                   
                    {/* Body or HTML Upload */}
                    {isEditorMode ? (
                        <div className="animate-fade-in">
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="body" className="label">متن ایمیل</label>
                                <AISuggestionButton onClick={handleImproveBody} isLoading={isBodyLoading} text="بهبود با هوش مصنوعی" />
                            </div>
                            <div className="relative">
                                <textarea
                                    name="body"
                                    id="body"
                                    rows={15}
                                    value={message.body}
                                    onChange={handleInputChange}
                                    className="input resize-none"
                                ></textarea>
                                {isBodyLoading && (
                                    <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center rounded-md">
                                        <LoadingSpinner className="w-8 h-8 text-brand-500" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                         <div className="animate-fade-in">
                            <label className="label mb-2">فایل کمپین HTML</label>
                            {message.htmlFile ? (
                                <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md">
                                    <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">{message.htmlFile.name}</span>
                                    <button onClick={removeHtmlFile} className="p-1 rounded-full text-slate-500 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50">
                                        <XCircleIcon className="w-6 h-6"/>
                                    </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="html-upload"
                                        accept=".html,text/html"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <label htmlFor="html-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <ArrowUpTrayIcon className="w-10 h-10 text-slate-400 dark:text-slate-500"/>
                                        {message.htmlFileId ? (
                                            <>
                                                <p className="mt-2 text-base text-slate-600 dark:text-slate-300">یک فایل از قبل وجود دارد.</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">برای جایگزینی، فایل جدیدی را انتخاب کنید.</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="mt-2 text-base text-slate-500 dark:text-slate-400">فایل HTML خود را بکشید و رها کنید یا کلیک کنید</p>
                                                <p className="text-sm text-slate-400 dark:text-slate-500">فقط فایل‌های .html</p>
                                            </>
                                        )}
                                    </label>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Email Previews */}
                <div className="space-y-6">
                    <div className="card">
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-4">پیش‌نمایش زنده</h3>
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
                            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                                <p className="text-base font-bold text-slate-800 dark:text-slate-200 truncate">{message.subject || <span className="text-slate-400">[موضوع شما در اینجا]</span>}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">از: تیم شما &lt;team@yourcompany.com&gt;</p>
                            </div>
                            {isEditorMode ? (
                                <div className="p-4 text-base text-slate-700 dark:text-slate-300 max-h-[350px] overflow-y-auto">
                                    <p className="whitespace-pre-wrap">{message.body || <span className="text-slate-400">[محتوای ایمیل شما در اینجا نمایش داده می‌شود.]</span>}</p>
                                </div>
                            ) : (
                                <div className="p-1 text-base text-slate-700 dark:text-slate-300 h-[350px] overflow-hidden">
                                    {htmlPreview ? (
                                        <iframe
                                            srcDoc={htmlPreview}
                                            title="HTML Preview"
                                            className="w-full h-full border-0"
                                            sandbox="allow-same-origin"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-400">
                                            <p>[برای دیدن پیش‌نمایش، یک فایل HTML آپلود کنید.]</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {isAbTestEnabled && (
                         <div className="card animate-fade-in">
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-4">پیش‌نمایش آزمون A/B</h3>
                            <div className="space-y-3 p-4 bg-white dark:bg-slate-900 rounded-md border border-slate-300 dark:border-slate-600">
                                <div>
                                    <span className="text-sm font-bold uppercase text-brand-600">نسخه الف</span>
                                    <div className="mt-1 p-2 border-l-4 border-brand-600 bg-slate-50 dark:bg-slate-800 rounded-r-md">
                                        <p className="text-base font-semibold text-slate-800 dark:text-slate-200 truncate">{message.subject}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">سلام علی، ما به‌روزرسانی‌های شگفت‌انگیزی برای شما داریم...</p>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-sm font-bold uppercase text-brand-400">نسخه ب</span>
                                    <div className="mt-1 p-2 border-l-4 border-brand-400 bg-slate-50 dark:bg-slate-800 rounded-r-md">
                                        <p className="text-base font-semibold text-slate-800 dark:text-slate-200 truncate">
                                            {message.abTest.subjectB || <span className="text-slate-400 dark:text-slate-500">[موضوع جایگزین شما در اینجا]</span>}
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">سلام علی، ما به‌روزرسانی‌های شگفت‌انگیزی برای شما داریم...</p>
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