


import { Template, Segment, AudienceCategory, Report } from './types.ts';

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

export const AUDIENCE_CATEGORIES: AudienceCategory[] = [
  { id: 'bus1', name_fa: 'تجاری بازرگانی', name_en: 'BUSINESS', count: 450000, imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop', health: 'Good' },
  { id: 'ind1', name_fa: 'صنعتی و تولیدی', name_en: 'INDUSTRY', count: 300000, imageUrl: 'https://images.unsplash.com/photo-1567789884554-0b844b597180?q=80&w=800&auto=format&fit=crop', health: 'Good' },
  { id: 'edu1', name_fa: 'علمی آموزشی', name_en: 'EDUCATION', count: 250000, imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop', health: 'Excellent' },
  { id: 'hea1', name_fa: 'پزشکی درمانی', name_en: 'HEALTH', count: 300000, imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&auto=format&fit=crop', health: 'Good' },
  { id: 'act1', name_fa: 'کاربران فعال', name_en: 'ACTIVE-USERS', count: 850000, imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=800&auto=format&fit=crop', health: 'Excellent' },
  { id: 'ict1', name_fa: 'فناوری اطلاعات', name_en: 'ICT', count: 550000, imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop', health: 'Excellent' },
  { id: 'con1', name_fa: 'خانه ساختمان', name_en: 'CONSTRUCTION', count: 350000, imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800&auto=format&fit=crop', health: 'Good' },
  { id: 'tra1', name_fa: 'سفر گردشگری', name_en: 'TRAVEL', count: 250000, imageUrl: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?q=80&w=800&auto=format&fit=crop', health: 'Poor' },
  { id: 'art1', name_fa: 'هنری فرهنگی', name_en: 'ART', count: 150000, imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop', health: 'Good' },
  { id: 'foo1', name_fa: 'غذا و خوراک', name_en: 'FOODS', count: 150000, imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop', health: 'Excellent' },
  { id: 'spo1', name_fa: 'ورزشی تفریحی', name_en: 'SPORT', count: 100000, imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=800&auto=format&fit=crop', health: 'Poor' },
  { id: 'trn1', name_fa: 'حمل و نقل', name_en: 'TRANSPORT', count: 200000, imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop', health: 'Good' },
  { id: 'fin1', name_fa: 'مالی و رمزارز', name_en: 'FINANCIAL', count: 250000, imageUrl: 'https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=800&auto=format&fit=crop', health: 'Excellent' },
  { id: 'rel1', name_fa: 'مذهبی اسلامی', name_en: 'RELIGIOUS', count: 200000, imageUrl: 'https://images.unsplash.com/photo-1508273590289-55d61de6c29b?q=80&w=800&auto=format&fit=crop', health: 'Good' },
  { id: 'adv1', name_fa: 'بازاریابی دیجیتال', name_en: 'ADVERTISE', count: 350000, imageUrl: 'https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=800&auto=format&fit=crop', health: 'Excellent' },
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