// FIX: Imported React to resolve the 'Cannot find namespace React' error caused by using React.FC.
import React from 'react';
import type { Template, Segment, Report, CampaignStatus } from './types';
import { ClockIcon, CheckCircleIcon, CreditCardIcon, PencilIcon, PaperAirplaneIcon, EllipsisHorizontalIcon, UsersIcon } from './components/IconComponents';

export const CAMPAIGN_STATUS_INFO: Record<CampaignStatus, { label: string; colorClasses: string; icon: React.FC<any>; color: string; }> = {
  targeting: { label: 'انتخاب مشترکین', colorClasses: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300', icon: UsersIcon, color: '#22d3ee' },
  editing: { label: 'ویرایش کمپین', colorClasses: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300', icon: PencilIcon, color: '#64748b' },
  scheduled: { label: 'زمانبندی شده', colorClasses: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300', icon: ClockIcon, color: '#0ea5e9' },
  payment: { label: 'ثبت و پرداخت', colorClasses: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300', icon: CreditCardIcon, color: '#f59e0b' },
  processing: { label: 'در صف ارسال', colorClasses: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300', icon: EllipsisHorizontalIcon, color: '#f97316' },
  sending: { label: 'در حال ارسال', colorClasses: 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300', icon: PaperAirplaneIcon, color: '#8b5cf6' },
  completed: { label: 'تکمیل ارسال‌ها', colorClasses: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200', icon: CheckCircleIcon, color: '#22c55e' },
};

export const CAMPAIGN_STATUS_ORDER: CampaignStatus[] = ['targeting', 'editing', 'scheduled', 'payment', 'processing', 'sending', 'completed'];

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