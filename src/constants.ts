import type { Template, Segment, Report } from './types';

export const STEPS = [
  {
    id: 1,
    title: 'انتخاب مخاطبان',
    description: 'مخاطبان خود را پیدا کنید.',
  },
  {
    id: 2,
    title: 'ساخت پیام',
    description: 'با ذوق طراحی کنید، با هدف صحبت کنید.',
  },
  {
    id: 3,
    title: 'تنظیم زمان‌بندی',
    description: 'زمان‌بندی همه چیز است.',
  },
  {
    id: 4,
    title: 'تایید نهایی',
    description: 'بررسی، پرداخت و آماده‌سازی برای ارسال.',
  },
  {
    id: 5,
    title: 'جادو را تماشا کنید',
    description: 'پیگیری کنید. یاد بگیرید. رشد کنید.',
  },
];

export const MOCK_SEGMENTS: Segment[] = [
    { id: 'seg1', name: 'مشترکین فعال', subscribers: 12540, health: 'Excellent' },
    { id: 'seg2', name: 'خریداران اخیر (۹۰ روز گذشته)', subscribers: 4820, health: 'Excellent' },
    { id: 'seg3', name: 'خبرنامه هفتگی', subscribers: 35000, health: 'Good' },
    { id: 'seg4', name: 'غیرفعال (۶+ ماه)', subscribers: 8500, health: 'Poor' },
];


export const TEMPLATES: Template[] = [
  {
    id: 'tmpl1',
    name: 'اطلاعیه محصول جدید',
    description: 'یک قالب تمیز و مدرن برای معرفی محصولات یا ویژگی‌های جدید.',
    subject: 'معرفی جدیدترین نوآوری ما!',
    body: `سلام {{firstName}}،\n\nما هیجان‌زده‌ایم که جدیدترین محصول خود را معرفی کنیم! [نام محصول] برای کمک به شما در [مزیت اصلی] طراحی شده است.\n\nویژگی‌های کلیدی:\n- ویژگی ۱\n- ویژگی ۲\n- ویژگی ۳\n\nبرای کسب اطلاعات بیشتر، وب‌سایت ما را بررسی کنید.\n\nبا احترام،\nتیم`,
    icon: 'gift',
    iconBgColor: 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400',
  },
  {
    id: 'tmpl2',
    name: 'خبرنامه هفتگی',
    description: 'مخاطبان خود را با خلاصه‌ای از آخرین اخبار و مقالات درگیر کنید.',
    subject: 'خبرنامه این هفته شما اینجاست',
    body: `سلام {{firstName}}،\n\nبه نسخه این هفته خبرنامه ما خوش آمدید!\n\nدر این شماره:\n- [عنوان مقاله ۱]\n- [عنوان مقاله ۲]\n- [اخبار هیجان‌انگیز شرکت]\n\nامیدواریم لذت ببرید!\n\nبا احترام،\nتیم`,
    icon: 'newspaper',
    iconBgColor: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
  },
  {
    id: 'tmpl3',
    name: 'پیشنهاد ویژه',
    description: 'یک قالب جسورانه و متمرکز بر تبدیل برای تبلیغ تخفیف‌ها یا پیشنهادات.',
    subject: '⏳ پیشنهاد با زمان محدود: ۲۰٪ تخفیف برای شما',
    body: `سلام {{firstName}}،\n\nاز دست ندهید! برای مدت زمان محدود، ما ۲۰٪ تخفیف در [محصول/خدمات منتخب] ارائه می‌دهیم.\n\nاز کد کوپن SPECIAL20 هنگام پرداخت استفاده کنید.\n\n[دکمه فراخوان به اقدام]\n\nاین پیشنهاد در [تاریخ انقضا] به پایان می‌رسد.\n\nبا احترام،\nتیم`,
    icon: 'tag',
    iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
  },
];

export const MOCK_REPORTS: Report[] = [
    {
        id: 'rep1',
        name: 'کمپین معرفی محصول بهار ۱۴۰۳',
        sentDate: '2024-04-15T10:00:00Z',
        stats: { openRate: 32.5, clickRate: 5.8, conversions: 210 },
        chartData: [
            { name: '۱ ساعت', opens: 1500, clicks: 200 }, { name: '۳ ساعت', opens: 3100, clicks: 510 },
            { name: '۶ ساعت', opens: 3500, clicks: 680 }, { name: '۱۲ ساعت', opens: 3900, clicks: 750 },
            { name: '۲۴ ساعت', opens: 4350, clicks: 810 }, { name: '۴۸ ساعت', opens: 4500, clicks: 830 },
        ]
    },
    {
        id: 'rep2',
        name: 'خبرنامه هفتگی - اردیبهشت هفته ۲',
        sentDate: '2024-05-08T09:00:00Z',
        stats: { openRate: 25.1, clickRate: 3.2, conversions: 95 },
        chartData: [
            { name: '۱ ساعت', opens: 1100, clicks: 120 }, { name: '۳ ساعت', opens: 2200, clicks: 350 },
            { name: '۶ ساعت', opens: 2600, clicks: 410 }, { name: '۱۲ ساعت', opens: 2900, clicks: 450 },
            { name: '۲۴ ساعت', opens: 3200, clicks: 490 }, { name: '۴۸ ساعت', opens: 3350, clicks: 510 },
        ]
    },
    {
        id: 'rep3',
        name: 'فروش ویژه عید فطر',
        sentDate: '2024-04-10T14:30:00Z',
        stats: { openRate: 41.3, clickRate: 9.7, conversions: 542 },
        chartData: [
            { name: '۱ ساعت', opens: 2100, clicks: 450 }, { name: '۳ ساعت', opens: 4500, clicks: 1100 },
            { name: '۶ ساعت', opens: 5100, clicks: 1300 }, { name: '۱۲ ساعت', opens: 5500, clicks: 1450 },
            { name: '۲۴ ساعت', opens: 5900, clicks: 1550 }, { name: '۴۸ ساعت', opens: 6100, clicks: 1600 },
        ]
    }
];