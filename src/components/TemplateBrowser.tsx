
import React, { useState } from 'react';
import { TEMPLATES } from '../constants';
import type { Template } from '../types';
import { XIcon, GiftIcon, NewspaperIcon, TagIcon } from './IconComponents';
import { STYLES } from '../styles';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: { subject: string; body: string }) => void;
}

const iconMap = {
    gift: GiftIcon,
    newspaper: NewspaperIcon,
    tag: TagIcon,
};

const TemplateBrowser: React.FC<Props> = ({ isOpen, onClose, onSelectTemplate }) => {
  const [previewTemplate, setPreviewTemplate] = useState<Template>(TEMPLATES[0]);

  if (!isOpen) return null;

  const handleSelect = (template: Template) => {
    onSelectTemplate({ subject: template.subject, body: template.body });
    onClose();
  };

  return (
    <div
      className={STYLES.modal.overlay}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`${STYLES.modal.container} max-w-6xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`${STYLES.modal.header} flex-shrink-0`}>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">انتخاب یک قالب</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
            <XIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <div className="flex-grow p-6 lg:p-8 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                {/* Template List */}
                <div className="lg:col-span-2 overflow-y-auto h-full pr-4 -mr-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {TEMPLATES.map((template) => {
                            const IconComponent = iconMap[template.icon];
                            return (
                                <div 
                                    key={template.id} 
                                    onMouseEnter={() => setPreviewTemplate(template)}
                                    className="flex flex-col p-5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 transition-all duration-200 shadow-sm hover:shadow-lg hover:border-brand-purple dark:hover:border-brand-purple"
                                >
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${template.iconBgColor}`}>
                                        <IconComponent className="w-6 h-6" />
                                    </div>
                                    <div className="flex-grow pt-4">
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{template.name}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 min-h-[60px]">{template.description}</p>
                                    </div>
                                    <button
                                        onClick={() => handleSelect(template)}
                                        className="w-full mt-4 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md hover:bg-brand-purple hover:text-white dark:hover:bg-brand-purple transition-colors duration-200 font-semibold"
                                        >
                                        انتخاب
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Preview Pane */}
                <div className={`${STYLES.card.container} hidden lg:block h-full flex flex-col`}>
                    {previewTemplate && (
                        <>
                           <div className="p-4 flex-shrink-0">
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg">پیش‌نمایش</h3>
                           </div>
                           <div className="flex-grow p-4 pt-0 overflow-y-auto">
                                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
                                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{previewTemplate.subject}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">از: تیم شما &lt;team@yourcompany.com&gt;</p>
                                    </div>
                                    <div className="p-4 text-sm text-slate-700 dark:text-slate-300">
                                        <p className="whitespace-pre-wrap">{previewTemplate.body}</p>
                                    </div>
                                </div>
                           </div>
                        </>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateBrowser;