import React, { useState, useRef, useEffect } from 'react';
import PageHeader from './PageHeader';
import { ChevronDownIcon, SparklesIcon, ClipboardDocumentListIcon, CalculatorIcon, UserIcon, RocketIcon } from './IconComponents';

interface FAQItem {
    q: string;
    a: React.ReactNode;
}

interface HelpCategory {
    name: string;
    id: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    items: FAQItem[];
}

const helpData: HelpCategory[] = [
    {
        name: 'شروع سریع',
        id: 'quick-start',
        icon: RocketIcon,
        items: [
            {
                q: 'این اپلیکیشن درباره چیست؟',
                a: (
                    <p>
                        این اپلیکیشن یک پلتفرم قدرتمند و هوشمند برای ایجاد و مدیریت کمپین‌های بازاریابی ایمیلی است. با استفاده از دستیار هوش مصنوعی ما، شما می‌توانید به سادگی محتوای جذاب بنویسید، مخاطبان مناسب را هدف قرار دهید، و بهترین زمان ارسال را پیدا کنید. هدف ما این است که بازاریابی ایمیلی را برای کسب‌وکارها و بازاریابان آسان‌تر، سریع‌تر و موثرتر کنیم تا بتوانند به بهترین شکل با مشتریان خود ارتباط برقرار کنند.
                    </p>
                ),
            },
            {
                q: 'چگونه می‌توانم به صورت رایگان ثبت‌نام کنم؟',
                a: (
                    <p>
                        ثبت‌نام در پلتفرم ما کاملا رایگان و آسان است. برای ایجاد حساب کاربری، کافیست روی آیکون پروفایل در گوشه بالا-چپ کلیک کرده و گزینه ثبت‌نام را انتخاب کنید. اگر از سیستم خارج شده باشید، در داشبورد نیز دکمه «ثبت نام رایگان» را مشاهده خواهید کرد. سپس فرم ثبت‌نام را با وارد کردن نام، نام خانوادگی، آدرس ایمیل و رمز عبور دلخواه خود تکمیل کنید. پس از ثبت‌نام، بلافاصله به امکانات پلتفرم دسترسی خواهید داشت و می‌توانید اولین کمپین خود را بسازید.
                    </p>
                ),
            },
            {
                q: 'چگونه اولین کمپین خود را بسازم؟',
                a: (
                    <p>
                        ساده است! از داشبورد، روی دکمه «کمپین جدید» کلیک کنید یا هدف خود را در باکس دستیار هوش مصنوعی تایپ کنید. هوش مصنوعی می‌تواند یک پیش‌نویس کامل برای شما ایجاد کند. در غیر این صورت، شما از طریق یک فرآیند ۴ مرحله‌ای راهنمایی می‌شوید: ۱. انتخاب مخاطبان، ۲. ساخت پیام، ۳. تنظیم زمان‌بندی، و ۴. بررسی نهایی.
                    </p>
                ),
            },
        ],
    },
    {
        name: 'دستیار هوش مصنوعی',
        id: 'ai-assistant',
        icon: SparklesIcon,
        items: [
            {
                q: 'دستیار هوش مصنوعی چه کارهایی انجام می‌دهد؟',
                a: (
                    <p>
                        دستیار هوش مصنوعی ما برای سرعت بخشیدن به فرآیند ساخت کمپین شما طراحی شده است. کافی است هدف خود را با زبان ساده توصیف کنید (مثلاً «یک فروش ویژه برای آخر هفته اعلام کن»). هوش مصنوعی به طور خودکار موارد زیر را تولید می‌کند:
                        <ul className="list-disc list-inside mr-4 mt-2 space-y-1">
                            <li>مخاطب مناسب را از لیست‌های شما پیشنهاد می‌دهد.</li>
                            <li>یک موضوع اصلی و یک موضوع جایگزین برای تست A/B می‌نویسد.</li>
                            <li>یک متن ایمیل جذاب و متقاعدکننده ایجاد می‌کند.</li>
                            <li>بهترین زمان ارسال را بر اساس تحلیل داده‌ها پیشنهاد می‌دهد.</li>
                        </ul>
                    </p>
                ),
            },
            {
                q: 'چگونه می‌توانم از هوش مصنوعی برای نوشتن محتوای ایمیل استفاده کنم؟',
                a: (
                    <p>
                        در مرحله «ساخت پیام» کمپین، پس از نوشتن متن اولیه خود در ویرایشگر، می‌توانید روی دکمه «بهبود با هوش مصنوعی» کلیک کنید. این کار متن شما را برای وضوح، جذابیت و تأثیرگذاری بیشتر بازنویسی می‌کند. همچنین، می‌توانید از هوش مصنوعی برای دریافت «پیشنهاد موضوع» بر اساس محتوای ایمیل خود استفاده کنید.
                    </p>
                ),
            },
        ],
    },
    {
        name: 'مدیریت کمپین',
        id: 'campaign-management',
        icon: ClipboardDocumentListIcon,
        items: [
            {
                q: 'تست A/B چیست و چگونه کار می‌کند؟',
                a: (
                    <p>
                        تست A/B به شما امکان می‌دهد دو نسخه مختلف از موضوع ایمیل خود را با بخش کوچکی از مخاطبان خود آزمایش کنید تا ببینید کدام یک عملکرد بهتری دارد. در مرحله ۲ (پیام)، می‌توانید تست A/B را فعال کنید، یک موضوع جایگزین (نسخه ب) بنویسید و اندازه گروه آزمون را تعیین کنید (مثلاً ۲۰٪). سیستم به طور خودکار به هر نیمه از گروه آزمون یک نسخه از موضوع را ارسال می‌کند. نسخه‌ای که نرخ باز شدن بالاتری داشته باشد، به طور خودکار برای بقیه مخاطبان شما ارسال می‌شود.
                    </p>
                ),
            },
            {
                q: 'آیا می‌توانم از قالب HTML خودم استفاده کنم؟',
                a: (
                    <p>
                        بله! در مرحله «ساخت پیام»، گزینه «آپلود HTML» را انتخاب کنید. شما می‌توانید فایل .html خود را مستقیماً آپلود کنید. ما یک پیش‌نمایش زنده از فایل شما نمایش خواهیم داد تا بتوانید قبل از ارسال، ظاهر آن را بررسی کنید.
                    </p>
                ),
            },
            {
                q: 'معنی وضعیت‌های مختلف کمپین چیست و چگونه می‌توانم آن را پیگیری کنم؟',
                a: (
                    <>
                        <p>
                            شما می‌توانید وضعیت تمام کمپین‌های خود را در صفحه «کمپین‌ها» مشاهده کنید. هر کمپین یک وضعیت دارد که نشان می‌دهد در کجای فرآیند قرار دارد. در اینجا راهنمای هر وضعیت آمده است:
                        </p>
                        <ul className="list-disc list-inside mr-4 mt-2 space-y-2">
                            <li><strong>انتخاب مشترکین (Targeting):</strong> این اولین مرحله است. شما در حال انتخاب مخاطبان برای کمپین خود هستید. برای ادامه، باید حداقل یک گروه مخاطب را انتخاب کرده و روی «ذخیره و ادامه» کلیک کنید.</li>
                            <li><strong>ویرایش کمپین (Editing):</strong> در این مرحله، شما در حال نوشتن موضوع و محتوای ایمیل خود هستید. پس از اتمام، روی «ذخیره و ادامه» کلیک کنید.</li>
                            <li><strong>زمانبندی شده (Scheduled):</strong> شما در حال تنظیم تاریخ و ساعت ارسال کمپین خود هستید. پس از انتخاب زمان، روی «تایید زمانبندی» کلیک کنید تا به مرحله بعد بروید.</li>
                            <li><strong>ثبت و پرداخت (Payment):</strong> این مرحله بررسی نهایی است. شما تمام جزئیات کمپین و هزینه آن را مشاهده می‌کنید. برای نهایی کردن، باید روی «پرداخت و نهایی کردن» کلیک کنید.</li>
                            <li><strong>در صف ارسال (Processing):</strong> تبریک! کمپین شما قفل شده و منتظر رسیدن به زمان ارسال برنامه‌ریزی شده است. در این مرحله، سیستم به طور خودکار ارسال را انجام خواهد داد.</li>
                            <li><strong>در حال ارسال (Sending):</strong> کمپین شما در حال ارسال فعال به مشترکین است. این فرآیند ممکن است بسته به اندازه لیست شما کمی طول بکشد.</li>
                            <li><strong>تکمیل ارسال‌ها (Completed):</strong> تمام ایمیل‌ها ارسال شده‌اند. اکنون می‌توانید با کلیک روی کمپین، به صفحه گزارشات بروید و عملکرد آن را مشاهده کنید.</li>
                        </ul>
                    </>
                ),
            },
        ],
    },
    {
        name: 'قیمت‌گذاری',
        id: 'pricing',
        icon: CalculatorIcon,
        items: [
            {
                q: 'قیمت‌گذاری شما چگونه کار می‌کند؟',
                a: (
                    <>
                        <p>
                            ما از یک مدل قیمت‌گذاری پلکانی استفاده می‌کنیم که به این معنی است که هرچه تعداد ایمیل‌های بیشتری ارسال کنید، هزینه هر ایمیل کمتر می‌شود. سیستم ما به طور خودکار هزینه کمپین شما را بر اساس تعداد کل گیرندگان انتخاب شده محاسبه می‌کند.
                        </p>
                        <p className="mt-2">
                            هر سطح قیمت‌گذاری (مانند Start, Medium, Business) یک حداقل تعداد ارسال و یک نرخ مشخص برای هر ایمیل دارد. با افزایش تعداد گیرندگان و رسیدن به آستانه یک سطح بالاتر، شما از نرخ پایین‌تر آن سطح بهره‌مند می‌شوید.
                        </p>
                    </>
                ),
            },
            {
                q: 'چگونه می‌توانم هزینه کمپین خود را ببینم؟',
                a: (
                    <p>
                        شما می‌توانید هزینه کمپین خود را در دو مرحله مشاهده کنید:
                        <ul className="list-disc list-inside mr-4 mt-2 space-y-1">
                            <li><strong>مرحله ۱ (انتخاب مخاطبان):</strong> در کارت «خلاصه مخاطبان»، پس از انتخاب حداقل یک گروه، سطح قیمت‌گذاری فعلی و هزینه هر ایمیل بر اساس تعداد کل گیرندگان نمایش داده می‌شود.</li>
                            <li><strong>مرحله ۴ (تایید نهایی):</strong> در صفحه بررسی نهایی، یک کارت «قیمت‌گذاری» وجود دارد که جزئیات کامل هزینه، شامل تعداد گیرندگان، نرخ هر ایمیل و هزینه کل نهایی را به تومان نمایش می‌دهد.</li>
                        </ul>
                    </p>
                ),
            },
        ],
    },
    {
        name: 'حساب کاربری',
        id: 'account',
        icon: UserIcon,
        items: [
            {
                q: 'چگونه اطلاعات پروفایل خود را ویرایش کنم؟',
                a: (
                    <p>
                        روی آیکون پروفایل در گوشه بالا سمت چپ هدر کلیک کنید تا به صفحه «پروفایل کاربری» بروید. در آنجا می‌توانید نام، اطلاعات شرکت، وب‌سایت و موبایل خود را ویرایش کنید. همچنین می‌توانید تنظیمات نمایش (تم روشن/تیره) و تنظیمات اعلان‌ها را تغییر دهید. فراموش نکنید که پس از ایجاد تغییرات، روی دکمه «ذخیره تغییرات» کلیک کنید.
                    </p>
                ),
            },
            {
                q: 'چگونه رمز عبور خود را تغییر دهم؟',
                a: (
                     <p>
                        در صفحه «پروفایل کاربری»، روی دکمه «تغییر رمز عبور» کلیک کنید. یک پنجره باز می‌شود که از شما می‌خواهد رمز عبور فعلی و رمز عبور جدید خود را وارد کنید. پس از تأیید، رمز عبور شما به‌روزرسانی خواهد شد.
                    </p>
                ),
            },
        ],
    },
];

interface AccordionItemProps {
    item: FAQItem;
    isOpen: boolean;
    onClick: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ item, isOpen, onClick }) => {
    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-lg shadow-sm ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
            <button
                onClick={onClick}
                className="flex justify-between items-center w-full p-5 text-right"
                aria-expanded={isOpen}
            >
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{item.q}</h3>
                <ChevronDownIcon className={`w-6 h-6 text-slate-500 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px]' : 'max-h-0'}`}>
                <div className="px-5 pb-5 pt-0 text-base text-slate-600 dark:text-slate-400 space-y-4">
                    {item.a}
                </div>
            </div>
        </div>
    );
};


const HelpPage: React.FC = () => {
    const [openAccordion, setOpenAccordion] = useState<string>(helpData[0].items[0].q);
    const [activeSection, setActiveSection] = useState<string>(helpData[0].id);
    const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { threshold: 0.5, rootMargin: "-40% 0px -60% 0px" }
        );

        Object.values(sectionRefs.current).forEach((el) => {
            // FIX: Use `instanceof HTMLElement` as a type guard. This resolves the issue where `Object.values`
            // might be inferred as returning `unknown[]`, and a simple truthiness check (`if (el)`)
            // is not enough to narrow the type to `Element`.
            if (el instanceof HTMLElement) {
                observer.observe(el);
            }
        });

        return () => observer.disconnect();
    }, []);

    const handleToggle = (question: string) => {
        setOpenAccordion(prev => (prev === question ? '' : question));
    };
    
    const handleNavClick = (id: string) => {
        sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    return (
        <div>
            <PageHeader 
                title="مرکز راهنمایی"
                description="پاسخ سوالات خود را پیدا کنید و یاد بگیرید چگونه از تمام امکانات پلتفرم ما استفاده کنید."
            />
            <div className="flex flex-col lg:flex-row-reverse gap-12">
                <aside className="lg:w-1/4 xl:w-1/5">
                    <nav className="sticky top-24">
                        <h3 className="text-base font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">دسته‌بندی‌ها</h3>
                        <ul className="space-y-2">
                           {helpData.map(category => {
                                const Icon = category.icon;
                                const isActive = activeSection === category.id;
                                return (
                                    <li key={category.id}>
                                        <button
                                            onClick={() => handleNavClick(category.id)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-base font-semibold transition-colors duration-200 text-right ${
                                                isActive 
                                                ? 'bg-brand-500/20 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300' 
                                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                            }`}
                                        >
                                            <Icon className={`w-5 h-5 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                                            <span>{category.name}</span>
                                        </button>
                                    </li>
                                );
                           })}
                        </ul>
                    </nav>
                </aside>

                <main className="flex-1 min-w-0">
                     {helpData.map((category) => (
                        <section 
                            // FIX: The ref callback function must not return a value. Wrapping the assignment in a block statement ensures it returns `void`.
                            ref={el => { sectionRefs.current[category.id] = el; }}
                            id={category.id} 
                            key={category.id} 
                            className="mb-12 scroll-mt-24"
                        >
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{category.name}</h2>
                            <div className="space-y-4">
                                {category.items.map((item) => (
                                    <AccordionItem 
                                        key={item.q}
                                        item={item}
                                        isOpen={openAccordion === item.q}
                                        onClick={() => handleToggle(item.q)}
                                    />
                                ))}
                            </div>
                        </section>
                    ))}
                </main>
            </div>
        </div>
    );
};

export default HelpPage;