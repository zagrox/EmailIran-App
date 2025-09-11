import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// =============================================
// START: src/types.ts
// =============================================

interface CampaignState {
  audience: {
    segmentId: string | null;
    categoryId: string | null;
    filters: string[];
    healthScore: number;
  };
  message: {
    subject: string;
    body: string;
    abTest: {
      enabled: boolean;
      subjectB: string;
      testSize: number;
    };
  };
  schedule: {
    sendDate: string;
    sendTime: string;
    timezoneAware: boolean;
  };
}

interface Segment {
    id: string;
    name: string;
    subscribers: number;
    health: 'Excellent' | 'Good' | 'Poor';
}

interface AudienceCategory {
  id: string;
  name_fa: string;
  name_en: string;
  count: number;
  imageUrl: string;
  health: 'Excellent' | 'Good' | 'Poor';
}

interface Template {
    id: string;
    name: string;
    description: string;
    subject: string;
    body: string;
    icon: 'gift' | 'newspaper' | 'tag';
    iconBgColor: string;
}

interface AICampaignDraft {
  audienceCategoryId: string;
  subject: string;
  subjectB: string; // The alternative subject for A/B testing
  body: string;
  sendTime: string; // "HH:MM"
}

interface Report {
  id: string;
  name: string;
  sentDate: string;
  stats: {
    openRate: number;
    clickRate: number;
    conversions: number;
  };
  chartData: { name: string; opens: number; clicks: number }[];
}

// =============================================
// END: src/types.ts
// =============================================


// =============================================
// START: src/data/persian-events.ts
// =============================================
interface Event {
    description: string;
    isHoliday?: boolean;
}

// Month Name -> Day Number -> Array of Events
const EVENTS_BY_MONTH: { [key: string]: { [key: number]: Event[] } } = {
    'فروردین': {
        1: [
            { description: 'جشن نوروز/جشن سال نو', isHoliday: true },
            { description: 'عید سعید فطر [ ١ شوال ]', isHoliday: true },
            { description: 'روز جهانی نوروز [ March 21 ]' }
        ],
        2: [
            { description: 'عید نوروز', isHoliday: true },
            { description: 'تعطیل به مناسبت عید سعید فطر [ ٢ شوال ]', isHoliday: true }
        ],
        3: [
            { description: 'عید نوروز', isHoliday: true },
            { description: 'روز جهانی هواشناسی [ March 23 ]' }
        ],
        4: [
            { description: 'عید نوروز', isHoliday: true }
        ],
        6: [
            { description: 'روز امید، روز شادباش نویسی' },
            { description: 'زادروز اشو زرتشت، آبرسان بزرگ تاریخ' }
        ],
        7: [{ description: 'روز جهانی تئاتر [ March 27 ]' }],
        10: [{ description: 'جشن آبانگاه' }],
        12: [{ description: 'روز جمهوری اسلامی', isHoliday: true }],
        13: [{ description: 'جشن سیزده به در', isHoliday: true }],
        17: [{ description: 'روز جهانی جشن سروشگان' }],
        18: [{ description: 'روز جهانی بهداشت [ April 7 ]' }],
        19: [{ description: 'فروردین روز، جشن فروردینگان' }],
        23: [{ description: 'روز دندانپزشک' }],
        25: [
            { description: 'روز بزرگداشت عطار نیشابوری' },
            { description: 'شهادت امام جعفر صادق (ع) [ ٢٥ شوال ]', isHoliday: true }
        ],
        29: [{ description: 'روز ارتش جمهوری اسلامی ایران' }],
        30: [
            { description: 'ولادت حضرت معصومه (س)، روز دختران [ ١ ذوالقعده ]' },
            { description: 'روز علوم آزمایشگاهی، زاد روز حکیم سید اسماعیل جرجانی' }
        ],
    },
    'اردیبهشت': {
        1: [{ description: 'روز بزرگداشت سعدی' }],
        2: [{ description: 'جشن گیاه آوری؛ روز زمین [ April 22 ]' }],
        3: [{ description: 'روز بزرگداشت شیخ بهایی؛ روز ملی کارآفرینی؛ روز معماری' }],
        6: [{ description: 'فاجعه ی انفجار بندر عباس [۱۴۰۴ خورشیدی]' }],
        7: [{ description: 'روز جهانی طراحی و گرافیک [ April 27 ]' }],
        9: [
            { description: 'ولادت امام رضا (ع) [ ۱۱ ذوالقعده ]' },
            { description: 'روز ملی روانشناس و مشاور' }
        ],
        10: [{ description: 'جشن چهلم نوروز؛ روز ملی خلیج فارس' }],
        11: [{ description: 'روز جهانی کارگر [ May 1 ]' }],
        12: [{ description: 'روز معلم' }],
        15: [
            { description: 'جشن میانه بهار/جشن بهاریه؛ روز شیراز' },
            { description: 'روز جهانی ماما [ May 5 ]' }
        ],
        18: [{ description: 'روز جهانی صلیب سرخ و هلال احمر [ May 8 ]' }],
        22: [
            { description: 'زادروز مریم میرزاخانی ریاضیدان ایرانی, روز جهانی زن در ریاضیات' },
            { description: 'روز جهانی پرستار [ May 12 ]' }
        ],
        25: [{ description: 'روز بزرگداشت فردوسی' }],
        27: [{ description: 'روز ارتباطات و روابط عمومی' }],
        28: [
            { description: 'روز بزرگداشت حکیم عمر خیام' },
            { description: 'روز جهانی موزه و میراث فرهنگی [ May 18 ]' },
            { description: 'شهادت امام محمد تقی (ع) [ ٣٠ ذوالقعده ]' }
        ],
    },
    'خرداد': {
        1: [
            { description: 'روز بهره وری و بهینه سازی مصرف' },
            { description: 'روز بزرگداشت ملاصدرا' }
        ],
        2: [{ description: 'فروریختن ساختمان متروپل در آبادان' }],
        3: [{ description: 'فتح خرمشهر در عملیات بیت المقدس و روز مقاومت, ایثار و پیروزی' }],
        4: [
            { description: 'شهادت امام محمد باقر (ع) [ ٧ ذوالحجه ]' },
            { description: 'روز دزفول، روز مقاومت و پایداری' }
        ],
        6: [
            { description: 'خرداد روز،جشن خردادگان' },
            { description: 'روز عرفه [ ٩ ذوالحجه ]' }
        ],
        7: [{ description: 'عید سعید قربان [ ١٠ ذوالحجه ]', isHoliday: true }],
        10: [{ description: 'روز جهانی بدون دخانیات [ May 31 ]' }],
        12: [{ description: 'ولادت امام علی النقی (ع) [ ١٥ ذوالحجه ]' }],
        14: [{ description: 'رحلت حضرت امام خمینی', isHoliday: true }],
        15: [
            { description: 'قیام ۱۵ خرداد', isHoliday: true },
            { description: 'روز جهانی محیط زیست [ June 5 ]' },
            { description: 'عید سعید غدیر خم [ ١٨ ذوالحجه ]', isHoliday: true }
        ],
        17: [{ description: 'ولادت امام موسی کاظم (ع) [ ٢٠ ذوالحجه ]' }],
        20: [{ description: 'روز جهانی صنایع دستی [ June 10 ]' }],
        22: [{ description: 'روز جهانی مبارزه با کار کودکان [ June 12 ]' }],
        24: [{ description: 'روز جهانی اهدای خون [ June 14 ]' }],
        25: [{ description: 'روز ملی گل وگیاه' }],
        26: [{ description: 'روز جهانی پدر [ June 16 ]' }],
        27: [{ description: 'روز جهانی بیابان زدایی [ June 17 ]' }],
        31: [{ description: 'سالروز زلزله رودبار و منجیل [۱۳۶۹ خورشیدی]' }]
    },
    'تیر': {
        1: [{ description: 'جشن آب پاشونک، جشن آغاز تابستان' }],
        4: [{ description: 'تاسوعای حسینی [ ٩ محرم ]', isHoliday: true }],
        5: [
            { description: 'روز جهانی مبارزه با مواد مخدر [ June 26 ]' },
            { description: 'عاشورای حسینی [ ١٠ محرم ]', isHoliday: true }
        ],
        7: [
            { description: 'انفجار دفتر حزب جمهوری اسلامی؛ روز قوه قضاییه' },
            { description: 'شهادت امام زین العابدین (ع) [ ١٢ محرم ]' }
        ],
        8: [{ description: 'روز مبارزه با سلاح های شیمیایی و میکروبی' }],
        10: [
            { description: 'روز صنعت و معدن' },
            { description: 'زادروز بابک خرمدین، سپه سالار دلاور ایران' },
            { description: 'روز بزرگداشت صائب تبریزی' }
        ],
        12: [{ description: 'شلیک به پرواز ۶۵۵ ایران ایر توسط ناو وینسنس [۱۳۶۷ خورشیدی]' }],
        13: [{ description: 'جشن تیرگان، بزرگداشت کمان کشیدن جان فدای ایران, آرش کمانگیر بر فراز البرز' }],
        14: [{ description: 'روز قلم' }],
        15: [{ description: 'جشن خام خواری' }],
        22: [{ description: 'زادروز محمد خوارزمی، ریاضیدان و فیلسوف ایرانی و روز ملی فناوری اطلاعات' }],
        25: [{ description: 'روز بهزیستی و تامین اجتماعی' }],
        27: [{ description: 'اعلام پذیرش قطعنامه ۵۹۸ شورای امنیت از سوی ایران [۱۳۶۷ خورشیدی]' }]
    },
    'آمرداد': {
        7: [{ description: 'اَمرداد روز،جشن اَمردادگان' }],
        8: [{ description: 'روز بزرگداشت شیخ شهاب الدین سهروردی' }],
        10: [
            { description: 'جشن چله تابستان' },
            { description: 'آغاز هفته جهانی شیردهی [ August 1 ]' }
        ],
        13: [{ description: 'اربعین حسینی [ ٢٠ صفر ]', isHoliday: true }],
        14: [{ description: 'سالروز صدور فرمان مشروطیت' }],
        17: [{ description: 'روز خبرنگار' }],
        21: [{ description: 'رحلت رسول اکرم؛شهادت امام حسن مجتبی (ع) [ ٢٨ صفر ]', isHoliday: true }],
        22: [{ description: 'روز جهانی چپ دست ها [ August 13 ]' }],
        23: [{ description: 'شهادت امام رضا (ع) [ ٣٠ صفر ]', isHoliday: true }],
        24: [{ description: 'هجرت پیامبر اکرم از مکه به مدینه [ ١ ربیع الاول ]' }],
        28: [
            { description: 'سالروز وقایع ۲۸ مرداد پس از برکناری محمد مصدق السلطنه' },
            { description: 'سالروز فاجعه آتش زدن سینما رکس آبادان' },
            { description: 'روز جهانی عکاسی [ August 19 ]' }
        ],
        31: [{ description: 'شهادت امام حسن عسکری (ع) [ ٨ ربیع الاول ]', isHoliday: true }]
    },
    'شهریور': {
        1: [{ description: 'روز بزرگداشت ابوعلی سینا و روز پزشک' }],
        2: [{ description: 'آغاز هفته دولت' }],
        4: [
            { description: 'زادروز کوروش بزرگ' },
            { description: 'شهریور روز،جشن شهریورگان' }
        ],
        5: [
            { description: 'میلاد رسول اکرم به روایت اهل سنت [ ١٢ ربیع الاول ]' },
            { description: 'روز بزرگداشت محمدبن زکریای رازی و روز داروساز' }
        ],
        8: [{ description: 'انفجار در دفتر نخست‌وزیری جمهوری اسلامی ایران، روز مبارزه با تروریسم' }],
        9: [{ description: 'میلاد رسول اکرم و امام جعفر صادق (ع) [ ١٧ ربیع الاول ]', isHoliday: true }],
        11: [{ description: 'روزصنعت چاپ' }],
        12: [{ description: 'سالروز شهادت رئیسعلی دلواری، سردار بزرگ میهن و فرمانده قیام جنوب علیه اشغالگران انگلیسی' }],
        13: [{ description: 'روز بزرگداشت ابوریحان بیرونی' }],
        19: [{ description: 'روز جهانی پیشگیری از خودکشی [ 10 September ]' }],
        20: [{ description: 'حمله به برج‌های دوقلوی مرکز تجارت جهانی [ 11 September ]' }],
        21: [{ description: 'روز سینما' }],
        27: [{ description: 'روز شعر و ادب پارسی و روز بزرگداشت استاد شهریار' }],
        29: [{ description: 'ولادت امام حسن عسکری (ع) [ ٨ ربیع الثانی ]' }],
        30: [{ description: 'روز جهانی صلح [ 21 September ]' }],
        31: [
            { description: 'آغاز هفته دفاع مقدس' },
            { description: 'وفات حضرت معصومه (س) [ ١٠ ربیع الثانی ]' }
        ]
    },
    'مهر': {
        1: [{ description: 'آغاز حمله مغول به ایران در پاییز ۵۹۸ خورشیدی' }],
        4: [{ description: 'روز گرامیداشت سربازان وطن' }],
        5: [{ description: 'روز جهانی جهانگردی [ September 27 ]' }],
        7: [
            { description: 'روز آتش نشانی و ایمنی' },
            { description: 'سقوط هواپیمای حامل جمعی از فرماندهان جنگ (کلاهدوز، نامجو، فلاحی، فکوری، جهان آرا) در سال ۱۳۶۰' },
            { description: 'روز بزرگداشت شمس تبریزی' }
        ],
        8: [
            { description: 'روز بزرگداشت مولوی' },
            { description: 'روز جهانی ناشنوایان [ September 30 ]' },
            { description: 'روز جهانی ترجمه و مترجم [ September 30 ]' },
            { description: 'ولادت امام حسن عسکری (ع) [ ۸ ربیع الثانی ]' }
        ],
        9: [{ description: 'روز جهانی سالمندان [ October 1 ]' }],
        10: [{ description: 'مهر روز،جشن مهرگان' }],
        11: [{ description: 'وفات حضرت معصومه (س) [ ۱۰ ربیع الثانی ]' }],
        12: [{ description: 'آغاز هفته جهانی فضا [ October 4 ]' }],
        13: [{ description: 'روز جهانی معلم [ October 5 ]' }],
        14: [{ description: 'روز دامپزشکی' }],
        16: [{ description: 'روز ملی کودک' }],
        17: [{ description: 'روز جهانی پست [ October 9 ]' }],
        18: [{ description: 'روز جهانی مبارزه با حکم اعدام [ October 10 ]' }],
        19: [{ description: 'روز جهانی دختر [ October 11 ]' }],
        20: [{ description: 'روز بزرگداشت حافظ' }],
        21: [{ description: 'روز پیروزی کاوه و فریدون بر ضحاک', isHoliday: true }],
        22: [{ description: 'روز جهانی استاندارد [ October 14 ]' }],
        23: [{ description: 'روز جهانی عصای سفید [ October 15 ]' }],
        24: [{ description: 'روز جهانی غذا [ October 16 ]' }],
        25: [{ description: 'روز جهانی ریشه کنی فقر [ October 17 ]' }],
        26: [{ description: 'روز تربیت بدنی و ورزش' }],
        28: [{ description: 'روز بزرگداشت یلغب به سردار ملی و از سرداران جنبش مشروطه ایران' }],
        29: [{ description: 'روز ملی کوهنورد' }]
    },
    'آبان': {
        1: [
            { description: 'روز آمار و برنامه ریزی' },
            { description: 'روز بزرگداشت ابوالفضل بیهقی، تاریخ‌نگار و نویسنده ایرانی' }
        ],
        5: [{ description: 'ولادت حضرت زینب (س) و روز پرستار و بهورز [ ۵ جمادی الاول ]' }],
        7: [{ description: 'سالروز ورود کوروش بزرگ به بابل در سال ۵۳۹ پیش از میلاد' }],
        10: [{ description: 'آبان روز، جشن آبانگان' }],
        13: [{ description: 'روز دانش آموز' }],
        14: [{ description: 'روز ملی مازندران' }],
        15: [{ description: 'آبان روز، جشن پاییز' }],
        18: [{ description: 'روز ملی کیفیت' }],
        23: [{ description: 'روز جهانی دیابت [ November 14 ]' }],
        24: [{ description: 'روز جهانی کتاب و کتابخوانی' }], // Note: Screenshot says 28, but it's usually 24. Going with screenshot data.
        28: [{ description: 'روز جهانی آقایان [ November 19 ]' }], // Note: Screenshot says 24, but it's 19. Going with screenshot data for day 28.
        29: [{ description: 'روز جهانی کودک [ November 20 ]' }]
    },
    'آذر': {
        1: [{ description: 'آذر جشن' }],
        3: [{ description: 'شهادت حضرت فاطمه زهرا (س) [ ۳ جمادی الثانیه ]', isHoliday: true }],
        4: [{ description: 'روز جهانی مبارزه با خشونت علیه زنان [ November 25 ]' }],
        5: [{ description: 'روز بسیج مستضعفان' }],
        7: [{ description: 'سالروز عملیات کربلای ۴ و روز نیروی دریایی' }],
        9: [{ description: 'آذر روز جشن آذرگان، آذر روز' }],
        10: [{ description: 'روز جهانی ایدز [ December 1 ]' }],
        12: [{ description: 'روز جهانی معلولان [ December 3 ]' }],
        13: [{ description: 'روز بیمه' }],
        15: [{ description: 'روز حسابدار' }],
        16: [{ description: 'روز دانشجو' }],
        19: [{ description: 'روز جهانی حقوق بشر [ December 10 ]' }],
        20: [
            { description: 'ولادت حضرت فاطمه زهرا (س) و روز مادر [ ۲۰ جمادی الثانیه ]' },
            { description: 'روز جهانی کوهستان [ December 11 ]' }
        ],
        21: [{ description: 'روز بزرگداشت آذربایجان' }],
        25: [{ description: 'روز پژوهش و فناوری' }],
        30: [{ description: 'شب یلدا، شب چله' }]
    },
    'دی': {
        1: [
            { description: 'روز میلاد خورشید؛ جشن خرم روز، نخستین جشن دیگان' },
            { description: 'ولادت امام محمد باقر (ع) [ ١ رجب ]' }
        ],
        3: [{ description: 'شهادت امام علی النقی (ع) [ ٣ رجب ]' }],
        4: [
            { description: 'جشن کریسمس [ December 25 ]' },
            { description: 'روز بزرگداشت دوستی [ December 25 ]' }
        ],
        5: [
            { description: 'زمین لرزه ی بم ۱۳۸۲ خورشیدی' },
            { description: 'سالروز شهادت اشو زرتشت، ابرانسان بزرگ تاریخ' },
            { description: 'سالروز عملیات کربلای ۴ [۱۳۶۵ خورشیدی]' }
        ],
        8: [
            { description: 'دی به آذر روز، دومین جشن دیگان' },
            { description: 'روز بزرگداشت یعقوب لیث صفاری (رادمان پورماهک) نخستین پادشاه ایرانی پس از اسلام' }
        ],
        9: [{ description: 'اعدام میهن‌پرستان آذری در تبریز توسط قوای اشغالگر روس [۱۲۹۰ خورشیدی]' }],
        10: [{ description: 'ولادت امام محمد تقی (ع) [ ۱۰ رجب ]' }],
        11: [{ description: 'جشن آغاز سال نو میلادی [ January 1 ]' }],
        13: [
            { description: 'ولادت امام علی (ع) و روز پدر [ ۱۳ رجب ]', isHoliday: true },
            { description: 'شهادت سردار حاج قاسم سلیمانی [۱۳۹۸ خورشیدی]' }
        ],
        15: [
            { description: 'دی به مهر روز، سومین جشن دیگان' },
            { description: 'وفات حضرت زینب (س) [ ۱۵ رجب ]' }
        ],
        16: [{ description: 'غرق شدن کشتی سانچی [۱۳۹۶ خورشیدی]' }],
        18: [{ description: 'شلیک به پرواز ۷۵۲ هواپیمایی اوکراین [۱۳۹۸ خورشیدی]' }],
        19: [{ description: 'درگذشت اکبر هاشمی رفسنجانی [۱۳۹۵ خورشیدی]' }],
        20: [{ description: 'قتل امیرکبیر به دستور ناصرالدین شاه قاجار [۱۲۳۰ خورشیدی]' }],
        23: [{ description: 'دی به دین روز، چهارمین جشن دیگان' }],
        25: [{ description: 'شهادت امام موسی کاظم (ع) [ ۲۵ رجب ]' }],
        27: [{ description: 'مبعث رسول اکرم (ص) [ ۲۷ رجب ]', isHoliday: true }],
        30: [{ description: 'آتش‌سوزی و فروریختن ساختمان پلاسکو [۱۳۹۵ خورشیدی]' }]
    },
    'بهمن': {
        1: [{ description: 'بهمن روز، جشن زادروز فردوسی' }],
        2: [{ description: 'بهمن روز، جشن بهمنگان' }],
        3: [{ description: 'ولادت امام حسین (ع) و روز پاسدار [ ٣ شعبان ]' }],
        4: [{ description: 'ولادت ابوالفضل العباس (ع) و روز جانباز [ ۴ شعبان ]' }],
        5: [
            { description: 'بهمن روز جشن نوسره' },
            { description: 'ولادت امام زین العابدین (ع) [ ۵ شعبان ]' }
        ],
        6: [{ description: 'بهمن‌روز، بزرگداشت صفی‌الدین اُرمَوی و روز موسیقی ایرانی' }],
        10: [{ description: 'بهمن جشن سده، گرامیداشت کشف آتش به دست هوشنگ شاه' }],
        11: [{ description: 'ولادت علی اکبر (ع) و روز جوان [ ١١ شعبان ]' }],
        12: [{ description: 'بهمن بازگشت امام خمینی (ره) به ایران' }],
        15: [{ description: 'ولادت حضرت قائم عجل الله تعالی فرجه و جشن نیمه شعبان [ ۱۵ شعبان ]', isHoliday: true }],
        19: [{ description: 'بهمن روز نیروی هوایی' }],
        22: [
            { description: 'پیروزی انقلاب اسلامی', isHoliday: true },
            { description: 'بهمن حمله به سفارت روسیه و قتل گریبایدوف سفیر روسیه تزاری در ایران [ 11 February ]' }
        ],
        25: [{ description: 'بهمن جشن ولنتاین [ 14 February ]' }],
        29: [{ description: 'بهمن جشن سپندارمذگان و روز عشق' }]
    },
    'اسفند': {
        5: [
            { description: 'جشن سپندارمذگان و روز عشق' },
            { description: 'روز بزرگداشت خواجه نصیر الدین طوسی و روز مهندس' }
        ],
        7: [{ description: 'سالروز استقلال کانون وکلای دادگستری و روز وکیل مدافع' }],
        14: [{ description: 'ولادت امام حسن مجتبی (ع) [ ۱۵ رمضان ]' }],
        15: [{ description: 'روز درختکاری' }],
        17: [{ description: 'شب قدر [ ۱۸ رمضان ]' }],
        18: [{ description: 'ضربت خوردن حضرت علی (ع) [ ۱۹ رمضان ]' }],
        20: [{ description: 'شهادت حضرت علی (ع) [ ۲۱ رمضان ]', isHoliday: true }],
        21: [{ description: 'شب قدر [ ۲۲ رمضان ]' }],
        23: [{ description: 'روز جهانی عدد پی π [ March 14 ]' }],
        25: [
            { description: 'پایان سرایش شاهنامه' },
            { description: 'روز بزرگداشت اختر چرخ ادب، پروین اعتصامی' }
        ],
        29: [
            { description: 'روز ملی شدن صنعت نفت ایران', isHoliday: true },
            { description: 'روز جهانی شادی [ March 20 ]' }
        ]
    }
};
// =============================================
// END: src/data/persian-events.ts
// =============================================

// =============================================
// START: src/constants.ts
// =============================================
const STEPS = [
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

const MOCK_SEGMENTS: Segment[] = [
    { id: 'seg1', name: 'مشترکین فعال', subscribers: 12540, health: 'Excellent' },
    { id: 'seg2', name: 'خریداران اخیر (۹۰ روز گذشته)', subscribers: 4820, health: 'Excellent' },
    { id: 'seg3', name: 'خبرنامه هفتگی', subscribers: 35000, health: 'Good' },
    { id: 'seg4', name: 'غیرفعال (۶+ ماه)', subscribers: 8500, health: 'Poor' },
];


const TEMPLATES: Template[] = [
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

const AUDIENCE_CATEGORIES: AudienceCategory[] = [
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

const MOCK_REPORTS: Report[] = [
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
// =============================================
// END: src/constants.ts
// =============================================


// =============================================
// START: src/styles.ts
// =============================================
const STYLES = {
  page: {
    container: "min-h-screen flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-300",
    wizardContainer: "w-full max-w-7xl",
    mainContent: "mt-12 bg-white dark:bg-slate-800/50 rounded-xl shadow-2xl dark:shadow-slate-950/50 ring-1 ring-black/5 dark:ring-white/10 p-6 sm:p-10",
  },
  button: {
    primary: "px-6 py-2 bg-brand-purple text-white rounded-md hover:bg-violet-700 transition-colors duration-200 font-semibold",
    secondary: "px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors duration-200",
    launch: "px-8 py-3 bg-gradient-to-r from-brand-pink to-brand-mint text-white rounded-md hover:opacity-90 transition-opacity duration-200 font-bold text-lg",
    ai: "flex items-center justify-center gap-3 mt-4 sm:mt-0 px-5 py-3 bg-gradient-to-r from-brand-purple to-brand-pink text-white rounded-lg font-semibold shadow-lg shadow-brand-purple/30 dark:shadow-brand-pink/20 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 hover:shadow-2xl hover:shadow-brand-purple/40 dark:hover:shadow-brand-pink/30 active:translate-y-0 active:scale-100 active:shadow-lg",
    aiSuggestion: "flex items-center justify-center gap-2 text-sm px-3 py-1.5 bg-brand-purple/20 text-brand-purple rounded-md hover:bg-brand-purple/30 transition-colors disabled:opacity-50 disabled:cursor-wait",
    filterBase: "px-4 py-2 text-sm rounded-full border transition-colors duration-200",
    filterSelected: "bg-brand-mint/20 border-brand-mint text-slate-800 dark:text-white",
    filterUnselected: "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300",
  },
  card: {
    container: "bg-slate-100 dark:bg-slate-900/70 p-6 rounded-xl border border-slate-200 dark:border-slate-700",
    categoryBase: "p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer",
    categorySelected: "bg-violet-50 dark:bg-slate-700/80 border-brand-purple",
    categoryUnselected: "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600",
    audiencePage: "bg-white dark:bg-slate-800/50 rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 overflow-hidden flex flex-col sm:flex-row items-center p-5 transition-transform duration-300 hover:-translate-y-1",
    report: "bg-white dark:bg-slate-800/50 p-5 rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 flex flex-col sm:flex-row items-center justify-between transition-all duration-300 hover:shadow-xl hover:ring-brand-purple/50 dark:hover:ring-brand-purple cursor-pointer",
  },
  input: {
    default: "w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-3 text-slate-900 dark:text-white focus:ring-brand-purple focus:border-brand-purple",
    range: "w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700",
  },
  typography: {
    h2: "text-2xl font-bold text-slate-900 dark:text-white",
    p: "text-slate-500 dark:text-slate-400 mb-8",
    label: "block text-sm font-medium text-slate-700 dark:text-slate-300",
    summaryLabel: "text-sm text-slate-500 dark:text-slate-400",
    summaryValue: "text-lg font-semibold text-slate-900 dark:text-white",
  },
  modal: {
    overlay: "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in",
    container: "bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col",
    header: "flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800",
    content: "flex-grow p-6 lg:p-8 overflow-y-auto space-y-6",
    footer: "p-6 bg-slate-100 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-4",
  },
  toggle: {
    base: "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
    on: "bg-brand-purple",
    off: "bg-slate-400 dark:bg-slate-600",
    handle: "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
    handleOn: "-translate-x-6",
    handleOff: "-translate-x-1",
  },
  abTest: {
    on: "bg-brand-mint",
  },
  health: {
    excellent: 'text-green-500 dark:text-green-400 bg-green-100 dark:bg-green-900/50',
    good: 'text-yellow-500 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50',
    poor: 'text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/50',
    indicatorExcellent: 'bg-green-400',
    indicatorGood: 'bg-yellow-400',
    indicatorPoor: 'bg-red-400',
  },
  dashboard: {
    gridContainer: "grid grid-cols-1 lg:grid-cols-6 gap-6",
    cardBase: "bg-white dark:bg-slate-800/50 rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 p-6 flex flex-col justify-between transition-all duration-300",
    cardHover: "hover:transform hover:-translate-y-1 hover:shadow-2xl hover:ring-brand-purple/50 dark:hover:ring-brand-purple",
    iconContainer: "w-12 h-12 rounded-lg flex items-center justify-center",
    largeCard: "lg:col-span-3",
  },
};
// =============================================
// END: src/styles.ts
// =============================================


// =============================================
// START: src/components/IconComponents.tsx
// =============================================
const MailIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
);

const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663M12 3.375c-3.455 0-6.25 2.795-6.25 6.25s2.795 6.25 6.25 6.25 6.25-2.795 6.25-6.25S15.455 3.375 12 3.375z" />
  </svg>
);

const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM18 12.75l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 18l-1.035.259a3.375 3.375 0 00-2.456 2.456L18 21.75l-.259-1.035a3.375 3.375 0 00-2.456-2.456L14.25 18l1.035-.259a3.375 3.375 0 002.456-2.456L18 12.75z" />
    </svg>
);

const LoadingSpinner: React.FC<{className?: string}> = ({ className }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const SunIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-6.364-.386l1.591-1.591M3 12h2.25m.386-6.364l1.591 1.591M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
    </svg>
);

const MoonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25c0 5.385 4.365 9.75 9.75 9.75 2.572 0 4.92-.99 6.697-2.648z" />
    </svg>
);

const DesktopIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-1.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
    </svg>
);

const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const DocumentDuplicateIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
    </svg>
);

const GiftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H4.5a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1014.625 7.5H9.375A2.625 2.625 0 1012 4.875zM21 11.25H3" />
    </svg>
);

const NewspaperIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
    </svg>
);

const TagIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
);

const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ChartBarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);

const CreditCardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
);

const CalendarDaysIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 12.75h.008v.008H12v-.008zm0 3h.008v.008H12v-.008zm.375-6.375h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm-3.375-3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm-3 0h.008v.008h-.008v-.008zm0-3h.008v.008h-.008v-.008z" />
    </svg>
);

const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
// =============================================
// END: src/components/IconComponents.tsx
// =============================================


// =============================================
// START: src/services/geminiService.ts
// =============================================
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const model = 'gemini-2.5-flash';

const getSubjectSuggestions = async (context: string): Promise<string[]> => {
    try {
        const prompt = `بر اساس متن ایمیل زیر، ۳ موضوع خلاقانه و جذاب برای ایمیل پیشنهاد بده. آن‌ها را به صورت یک آرایه JSON از رشته‌ها برگردان.
        
        متن ایمیل:
        ---
        ${context}
        ---
        
        مثال خروجی: ["موضوع ۱", "موضوع ۲", "موضوع ۳"]`;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        
        const text = response.text.replace(/```json\n?|```/g, '').trim();
        const suggestions = JSON.parse(text);
        return suggestions.slice(0, 3);
    } catch (error) {
        console.error("Error getting subject suggestions:", error);
        return ["دریافت پیشنهادات ممکن نبود.", "لطفاً دوباره تلاش کنید.", "خطای سرویس هوش مصنوعی."];
    }
};

const improveEmailBody = async (emailBody: string): Promise<string> => {
    try {
        const prompt = `متن ایمیل زیر را بازنویسی و بهبود ببخش تا جذاب‌تر، حرفه‌ای‌تر و واضح‌تر شود. هدف اصلی و توکن‌های شخصی‌سازی مانند {{firstName}} را حفظ کن.
        
        متن اصلی ایمیل:
        ---
        ${emailBody}
        ---`;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error improving email body:", error);
        return "متاسفانه بهبود متن ایمیل با خطا مواجه شد. لطفاً دوباره تلاش کنید.";
    }
};

const getBestSendTime = async (audienceDescription: string): Promise<string> => {
    try {
        const prompt = `بهترین زمان (روز و ساعت) برای ارسال ایمیل به مخاطبان زیر چیست؟ پاسخ خود را کوتاه و به صورت یک پیشنهاد ارائه بده.
        
        توضیحات مخاطب:
        ---
        ${audienceDescription}
        ---
        
        مثال پاسخ: سه شنبه ساعت ۱۰:۳۰ صبح`;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error getting best send time:", error);
        return "دریافت پیشنهاد ممکن نبود.";
    }
};

const generateCampaignFromPrompt = async (
    userPrompt: string, 
    categories: AudienceCategory[]
): Promise<AICampaignDraft> => {
    const systemInstruction = `You are an expert email marketing assistant. Your task is to generate a complete campaign draft based on a user's goal. You must select the best audience from the provided list of "Specialized Audiences", write a compelling subject and body, and suggest an optimal send time. You must also provide an alternative subject (subjectB) for A/B testing. Your response must be only a valid JSON object that conforms to the provided schema.

Specialized Audiences (for reaching new audiences by category):
${categories.map(c => `- ${c.name_fa} (ID: ${c.id}, Count: ${c.count})`).join('\n')}
`;

    const response = await ai.models.generateContent({
        model: model,
        contents: `Campaign Goal: "${userPrompt}"`,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    audienceCategoryId: {
                        type: Type.STRING,
                        description: "The ID of the specialized audience category.",
                        enum: categories.map(c => c.id),
                    },
                    subject: {
                        type: Type.STRING,
                        description: "A compelling email subject line related to the campaign goal.",
                    },
                    subjectB: {
                        type: Type.STRING,
                        description: "An alternative email subject line for A/B testing. It should be a creative variation of the main subject.",
                    },
                    body: {
                        type: Type.STRING,
                        description: "A complete and persuasive email body. Be sure to use the {{firstName}} personalization token.",
                    },
                    sendTime: {
                        type: Type.STRING,
                        description: "The suggested send time in HH:MM format.",
                        pattern: "^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$"
                    },
                },
                required: ["audienceCategoryId", "subject", "subjectB", "body", "sendTime"],
            },
        },
    });

    const jsonText = response.text.trim();
    const draft = JSON.parse(jsonText) as AICampaignDraft;

    return draft;
};
// =============================================
// END: src/services/geminiService.ts
// =============================================


// =============================================
// START: Components
// =============================================

// --- PageHeader.tsx ---
interface PageHeaderProps {
    title: string;
    description: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description }) => (
    <div className="bg-gradient-to-br from-violet-50 to-slate-100 dark:from-slate-800 dark:to-violet-950/30 rounded-2xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 p-8 md:p-12 text-center lg:flex lg:items-center lg:justify-between lg:text-right mb-10 animate-fade-in">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-4xl lg:flex-shrink-0">{title}</h1>
        <p className="mt-6 lg:mt-0 lg:mr-8 max-w-3xl mx-auto lg:mx-0 lg:text-right text-lg text-slate-500 dark:text-slate-400">
            {description}
        </p>
    </div>
);


// --- PersianCalendar.tsx ---
interface PersianCalendarProps {
    selectedDate: string; // YYYY-MM-DD
    onDateSelect: (date: string) => void;
    ctaText?: string;
    onCtaClick?: () => void;
    footerContent?: React.ReactNode;
}
interface DayObject {
    gregorianDate: Date;
    persianDay: number;
    gregorianDay: number;
    isToday: boolean;
    isSelected: boolean;
    isHoliday: boolean;
}
const getPersianDateParts = (date: Date) => {
    const format = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('fa-IR-u-ca-persian', options).format(date);
    return {
        year: format({ year: 'numeric' }),
        monthName: format({ month: 'long' }),
        day: format({ day: 'numeric' }),
        monthNumeric: format({ month: 'numeric' }),
    };
};
const toYYYYMMDD = (date: Date) => date.toISOString().split('T')[0];
const PersianCalendar: React.FC<PersianCalendarProps> = ({ selectedDate, onDateSelect, ctaText, onCtaClick, footerContent }) => {
    const [viewDate, setViewDate] = useState(new Date(selectedDate || Date.now()));
    const today = new Date();
    const todayStr = toYYYYMMDD(today);
    const selectedDateObj = selectedDate ? new Date(selectedDate + 'T00:00:00') : null;

    const navigateMonth = (amount: number) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + amount);
        setViewDate(newDate);
    };

    const goToToday = () => {
        setViewDate(new Date());
        onDateSelect(toYYYYMMDD(new Date()));
    }

    const { calendarGrid, currentPersianMonthName, currentEvents } = useMemo(() => {
        const grid: (DayObject | { isPlaceholder: true })[] = [];
        const viewDatePersian = getPersianDateParts(viewDate);
        
        let tempDate = new Date(viewDate);
        tempDate.setDate(1);
        
        while (getPersianDateParts(tempDate).monthName !== viewDatePersian.monthName) {
            tempDate.setDate(tempDate.getDate() + 1);
        }
        while (getPersianDateParts(tempDate).day !== '۱') {
            tempDate.setDate(tempDate.getDate() - 1);
        }

        const firstDayOfMonth = new Date(tempDate);
        const startDayOfWeek = (firstDayOfMonth.getDay() + 1) % 7;

        for (let i = 0; i < startDayOfWeek; i++) {
            grid.push({ isPlaceholder: true });
        }

        while (getPersianDateParts(tempDate).monthName === viewDatePersian.monthName) {
            const currentDateStr = toYYYYMMDD(tempDate);
            const pDayStr = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { day: 'numeric' }).format(tempDate);
            const pDay = parseInt(pDayStr.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))));

            const eventsForDay = EVENTS_BY_MONTH[viewDatePersian.monthName]?.[pDay] || [];
            const isHoliday = eventsForDay.some(e => e.isHoliday);

            grid.push({
                gregorianDate: new Date(tempDate),
                persianDay: pDay,
                gregorianDay: tempDate.getDate(),
                isToday: currentDateStr === todayStr,
                isSelected: currentDateStr === selectedDate,
                isHoliday: isHoliday,
            });
            tempDate.setDate(tempDate.getDate() + 1);
        }

        return {
            calendarGrid: grid,
            currentPersianMonthName: viewDatePersian.monthName,
            currentEvents: EVENTS_BY_MONTH[viewDatePersian.monthName] || {}
        };
    }, [viewDate, selectedDate]);
    
    const eventsList = Object.entries(currentEvents)
      .flatMap(([day, events]) => (events as Event[]).map(event => ({ day: parseInt(day), ...event })))
      .sort((a, b) => a.day - b.day);

    const getFullPersianYear = (date: Date) => new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric' }).format(date);
    const getGregorianRange = (date: Date) => {
        const start = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
        const tempDate = new Date(date);
        tempDate.setMonth(tempDate.getMonth() + 1);
        const end = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(tempDate);
        return `${start} - ${end}`;
    }
    const getHijriDate = (date: Date) => new Intl.DateTimeFormat('fa-IR-u-ca-islamic-civil', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-slate-800/50 rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 p-4">
            <div className="md:col-span-1 bg-slate-100 dark:bg-slate-900/70 p-4 rounded-xl">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">مناسبت‌های ماه {currentPersianMonthName}</h3>
                <ul className="space-y-3 text-sm h-96 overflow-y-auto pr-2">
                    {eventsList.map((event, index) => (
                        <li key={index} className="flex items-start">
                            <span className={`font-bold w-10 text-right ml-3 ${event.isHoliday ? 'text-red-500' : 'text-slate-800 dark:text-slate-200'}`}>{event.day}</span>
                            <span className={`${event.isHoliday ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>{event.description}</span>
                        </li>
                    ))}
                </ul>
            </div>
            
            <div className="md:col-span-2 flex flex-col">
                <div className="flex-grow">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => navigateMonth(-1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">ماه قبل &rarr;</button>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{currentPersianMonthName} {getFullPersianYear(viewDate)}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{getGregorianRange(viewDate)}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">{getHijriDate(viewDate)}</p>
                        </div>
                        <button onClick={() => navigateMonth(1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">&larr; ماه بعد</button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center font-semibold text-sm text-slate-500 dark:text-slate-400 mb-2">
                        <span>ش</span><span>ی</span><span>د</span><span>س</span><span>چ</span><span>پ</span><span>ج</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {calendarGrid.map((day, index) =>
                            'isPlaceholder' in day ? <div key={index}></div> : (
                                <button
                                    key={index}
                                    onClick={() => onDateSelect(toYYYYMMDD(day.gregorianDate))}
                                    className={`
                                        p-2 rounded-lg transition-colors text-center
                                        ${day.isHoliday ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}
                                        ${day.isSelected ? 'ring-2 ring-amber-500' : ''}
                                        ${day.isToday && !day.isSelected ? 'bg-brand-mint/30' : ''}
                                        ${!day.isSelected ? 'hover:bg-slate-200 dark:hover:bg-slate-700' : ''}
                                    `}
                                >
                                    <span className="font-bold text-lg">{day.persianDay.toLocaleString('fa-IR')}</span>
                                    <span className="block text-xs text-slate-400 dark:text-slate-500 mt-1">{day.gregorianDay}</span>
                                </button>
                            )
                        )}
                    </div>
                </div>
                <div className="mt-auto pt-4">
                    {footerContent !== undefined ? footerContent : (
                        ctaText && onCtaClick ? (
                            <button
                                onClick={onCtaClick}
                                className="w-full py-2 bg-brand-purple text-white font-bold rounded-lg hover:bg-violet-700 transition-colors"
                            >
                                {ctaText}
                            </button>
                        ) : (
                            <button
                                onClick={goToToday}
                                className="w-full py-2 bg-amber-400 text-slate-900 font-bold rounded-lg hover:bg-amber-500 transition-colors"
                            >
                                برو به امروز
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Stepper.tsx ---
interface StepperStep {
  id: number;
  title: string;
}
interface StepperProps {
  currentStep: number;
  steps: StepperStep[];
}
const Stepper: React.FC<StepperProps> = ({ currentStep, steps }) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li key={step.title} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} flex-1`}>
            {currentStep > step.id ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-brand-purple" />
                </div>
                <div
                  className="relative flex h-8 w-8 items-center justify-center rounded-full bg-brand-purple"
                >
                  <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" />
                  </svg>
                </div>
              </>
            ) : currentStep === step.id ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-slate-200 dark:bg-slate-700" />
                </div>
                <div
                  className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-purple bg-slate-50 dark:bg-slate-800"
                  aria-current="step"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-purple" aria-hidden="true" />
                </div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-slate-200 dark:bg-slate-700" />
                </div>
                <div
                  className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-transparent" aria-hidden="true" />
                </div>
              </>
            )}
             <span className="absolute top-10 w-max -ml-2 text-center text-sm font-medium text-slate-500 dark:text-slate-400">{step.title}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
};


// --- TemplateBrowser.tsx ---
interface TemplateBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: { subject: string; body: string }) => void;
}
const iconMap = {
    gift: GiftIcon,
    newspaper: NewspaperIcon,
    tag: TagIcon,
};
const TemplateBrowser: React.FC<TemplateBrowserProps> = ({ isOpen, onClose, onSelectTemplate }) => {
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


// --- AIAssistantModal.tsx ---
interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (draft: AICampaignDraft) => void;
  initialPrompt?: string;
}
const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose, onApply, initialPrompt }) => {
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


// --- steps/Step1_Audience.tsx ---
interface Step1AudienceProps {
  campaignData: CampaignState;
  updateCampaignData: <K extends keyof CampaignState>(field: K, value: CampaignState[K]) => void;
  onOpenAIAssistant: () => void;
}
const MOCK_FILTERS = ['مستقر در ایران', 'ایمیل آخر را باز کرده‌اند', 'در ۳۰ روز گذشته روی لینکی کلیک کرده‌اند', 'بیش از ۳ بار خرید کرده‌اند'];
const healthColorMap = {
    'Excellent': STYLES.health.excellent,
    'Good': STYLES.health.good,
    'Poor': STYLES.health.poor,
};
const healthIndicatorMap = {
    'Excellent': STYLES.health.indicatorExcellent,
    'Good': STYLES.health.indicatorGood,
    'Poor': STYLES.health.indicatorPoor,
};
const healthTranslationMap = {
    'Excellent': 'عالی',
    'Good': 'خوب',
    'Poor': 'ضعیف',
};
const CategoryCard: React.FC<{ category: AudienceCategory; isSelected: boolean; onSelect: (id: string) => void }> = ({ category, isSelected, onSelect }) => (
    <div
        onClick={() => onSelect(category.id)}
        className={`${STYLES.card.categoryBase} ${
            isSelected ? STYLES.card.categorySelected : STYLES.card.categoryUnselected
        }`}
    >
        <div className="flex justify-between items-start">
            <h4 className="font-bold text-slate-900 dark:text-white">{category.name_fa}</h4>
            <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${healthColorMap[category.health]}`}>{healthTranslationMap[category.health]}</div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{category.count.toLocaleString('fa-IR')} مشترک</p>
    </div>
);
const Step1Audience: React.FC<Step1AudienceProps> = ({ campaignData, updateCampaignData, onOpenAIAssistant }) => {
    const { audience } = campaignData;

    const handleCategorySelect = (categoryId: string) => {
        const selectedCategory = AUDIENCE_CATEGORIES.find(c => c.id === categoryId);
        const healthScore = selectedCategory?.health === 'Excellent' ? 95 : selectedCategory?.health === 'Good' ? 75 : 25;
        updateCampaignData('audience', {
            ...audience,
            categoryId,
            segmentId: null,
            healthScore,
        });
    };

    const handleFilterToggle = (filter: string) => {
        const newFilters = audience.filters.includes(filter)
            ? audience.filters.filter(f => f !== filter)
            : [...audience.filters, filter];
        updateCampaignData('audience', { ...audience, filters: newFilters });
    };
    
    const selectedCategory = useMemo(() => AUDIENCE_CATEGORIES.find(c => c.id === audience.categoryId), [audience.categoryId]);

    const summaryName = selectedCategory?.name_fa;
    const summaryCount = selectedCategory?.count;

    return (
        <div className="animate-slide-in-up">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
                <h2 className={STYLES.typography.h2}>افراد خود را انتخاب کنید</h2>
                <button 
                    onClick={onOpenAIAssistant}
                    className={STYLES.button.ai}
                >
                    <SparklesIcon className="w-6 h-6" />
                    ایجاد با هوش مصنوعی
                </button>
            </div>

            <p className={STYLES.typography.p}>مخاطبان عالی خود را انتخاب کنید—یا اجازه دهید هوش مصنوعی این کار را برای شما انجام دهد.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">مخاطبان تخصصی</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                        {AUDIENCE_CATEGORIES.map(category => (
                            <CategoryCard
                                key={category.id}
                                category={category}
                                isSelected={audience.categoryId === category.id}
                                onSelect={handleCategorySelect}
                            />
                        ))}
                    </div>


                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-4">فیلترهای هوشمند</h3>
                    <div className="flex flex-wrap gap-3">
                        {MOCK_FILTERS.map(filter => (
                            <button
                                key={filter}
                                onClick={() => handleFilterToggle(filter)}
                                className={`${STYLES.button.filterBase} ${
                                    audience.filters.includes(filter)
                                    ? STYLES.button.filterSelected
                                    : STYLES.button.filterUnselected
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={STYLES.card.container}>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                        <UsersIcon className="w-6 h-6 text-brand-mint"/>
                        خلاصه مخاطبان
                    </h3>
                    {selectedCategory ? (
                        <div className="mt-4 space-y-4">
                            <div>
                                <div className={STYLES.typography.summaryLabel}>بخش</div>
                                <div className={STYLES.typography.summaryValue}>{summaryName}</div>
                            </div>
                            <div>
                                <div className={STYLES.typography.summaryLabel}>گیرندگان تخمینی</div>
                                <div className={STYLES.typography.summaryValue}>{summaryCount?.toLocaleString('fa-IR')}</div>
                            </div>
                             {selectedCategory && (
                                <div>
                                    <div className={`${STYLES.typography.summaryLabel} mb-2`}>سلامت لیست</div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                        <div 
                                            className={`${healthIndicatorMap[selectedCategory.health]} h-2.5 rounded-full transition-all duration-500`} 
                                            style={{width: `${audience.healthScore}%`}}
                                        ></div>
                                    </div>
                                    <div className={`text-left text-sm mt-1 font-semibold ${healthColorMap[selectedCategory.health].split(' ')[0]}`}>
                                        {healthTranslationMap[selectedCategory.health]}
                                    </div>
                                </div>
                             )}
                            {audience.filters.length > 0 && (
                                <div>
                                    <div className={STYLES.typography.summaryLabel}>فیلترهای فعال</div>
                                    <ul className="list-disc list-inside mr-4 mt-2 text-slate-700 dark:text-slate-300 text-sm">
                                        {audience.filters.map(f => <li key={f}>{f}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="mt-4 text-center text-slate-500 dark:text-slate-400 py-10">
                            برای دیدن جزئیات، یک بخش را انتخاب کنید.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- steps/Step2_Message.tsx ---
interface Step2MessageProps {
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
const Step2Message: React.FC<Step2MessageProps> = ({ campaignData, updateCampaignData }) => {
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


// --- steps/Step3_Schedule.tsx ---
interface Step3ScheduleProps {
    campaignData: CampaignState;
    updateCampaignData: <K extends keyof CampaignState>(field: K, value: CampaignState[K]) => void;
}
const Step3Schedule: React.FC<Step3ScheduleProps> = ({ campaignData, updateCampaignData }) => {
    const { schedule } = campaignData;
    const [isTimeSuggestionLoading, setIsTimeSuggestionLoading] = useState(false);
    const [timeSuggestion, setTimeSuggestion] = useState('');

    const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateCampaignData('schedule', { ...schedule, [e.target.name]: e.target.value });
    };
    
    const handleDateSelect = (date: string) => {
        updateCampaignData('schedule', { ...schedule, sendDate: date });
    };

    const handleTimezoneToggle = () => {
        updateCampaignData('schedule', { ...schedule, timezoneAware: !schedule.timezoneAware });
    };
    
    const handleGetTimeSuggestion = async () => {
        setIsTimeSuggestionLoading(true);
        setTimeSuggestion('');
        const audienceDesc = "مخاطب عمومی از مصرف‌کنندگان آگاه به فناوری";
        const suggestion = await getBestSendTime(audienceDesc);
        setTimeSuggestion(suggestion);
        setIsTimeSuggestionLoading(false);
    };

    const isTimezoneAware = schedule.timezoneAware;
    
    const timeInput = (
        <div>
            <label htmlFor="sendTime" className={`${STYLES.typography.label} mb-2 text-center`}>ساعت ارسال</label>
            <input
                type="time"
                id="sendTime"
                name="sendTime"
                value={schedule.sendTime}
                onChange={handleScheduleChange}
                className={`${STYLES.input.default} text-center text-lg`}
            />
        </div>
    );

    return (
        <div className="animate-slide-in-up">
            <h2 className={STYLES.typography.h2}>زمان‌بندی را تنظیم کنید</h2>
            <p className={STYLES.typography.p}>مانند یک حرفه‌ای با تحویل آگاه از منطقه زمانی و پیش‌بینی‌های هوشمند، زمان‌بندی کنید.</p>

            <div className="mt-8">
                <PersianCalendar
                    selectedDate={schedule.sendDate}
                    onDateSelect={handleDateSelect}
                    footerContent={timeInput}
                />
            </div>
            
            <div className="max-w-md mx-auto mt-6 space-y-6">
                <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/70 p-4 rounded-lg">
                    <span className="font-medium text-slate-900 dark:text-white">تحویل آگاه از منطقه زمانی</span>
                    <button
                        onClick={handleTimezoneToggle}
                        className={`${STYLES.toggle.base} ${isTimezoneAware ? STYLES.toggle.on : STYLES.toggle.off}`}
                    >
                        <span className={`${STYLES.toggle.handle} ${isTimezoneAware ? STYLES.toggle.handleOn : STYLES.toggle.handleOff}`} />
                    </button>
                </div>

                <div>
                    <button
                        onClick={handleGetTimeSuggestion}
                        disabled={isTimeSuggestionLoading}
                        className="w-full flex items-center justify-center gap-2 text-sm px-4 py-2 bg-brand-purple/20 text-brand-purple rounded-md hover:bg-brand-purple/30 transition-colors disabled:opacity-50"
                    >
                        {isTimeSuggestionLoading ? <LoadingSpinner className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                        پیشنهاد بهترین زمان ارسال
                    </button>
                    {timeSuggestion && (
                        <div className="mt-3 bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-center text-sm text-slate-600 dark:text-slate-300">
                            <p><strong>پیشنهاد هوش مصنوعی:</strong> {timeSuggestion}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- steps/Step4_Review.tsx ---
interface Step4ReviewProps {
  campaignData: CampaignState;
}
const SummaryItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</h4>
        <div className="mt-1 text-slate-800 dark:text-slate-200">{children}</div>
    </div>
);
const Step4Review: React.FC<Step4ReviewProps> = ({ campaignData }) => {
    const { audience, message, schedule } = campaignData;
    const recipientCount = 12540;
    const pricePerEmail = 0.001;
    const totalCost = recipientCount * pricePerEmail;

    return (
        <div className="animate-slide-in-up">
            <h2 className={STYLES.typography.h2}>تایید نهایی</h2>
            <p className={STYLES.typography.p}>جزئیات کمپین خود را بررسی کنید، قیمت‌گذاری شفاف را ببینید و برای ارسال آماده شوید.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className={`${STYLES.card.container} lg:col-span-2 space-y-6`}>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">خلاصه کمپین</h3>
                    
                    <SummaryItem label="مخاطبان">
                        <p>بخش: <span className="font-semibold">مشترکین فعال</span></p>
                        <p>گیرندگان تخمینی: <span className="font-semibold">{recipientCount.toLocaleString('fa-IR')}</span></p>
                    </SummaryItem>
                    
                    <div className="border-t border-slate-200 dark:border-slate-700"></div>

                    <SummaryItem label="پیام">
                        <p className="font-semibold">موضوع: "{message.subject}"</p>
                        <div className="mt-2 p-4 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-800 max-h-40 overflow-y-auto">
                            <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                        </div>
                    </SummaryItem>

                    <div className="border-t border-slate-200 dark:border-slate-700"></div>

                    <SummaryItem label="زمان‌بندی">
                        <p>تاریخ ارسال: <span className="font-semibold">{new Date(schedule.sendDate + 'T00:00:00').toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} در ساعت {schedule.sendTime}</span></p>
                        <p>تحویل آگاه از منطقه زمانی: <span className={`font-semibold ${schedule.timezoneAware ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>{schedule.timezoneAware ? 'فعال' : 'غیرفعال'}</span></p>
                    </SummaryItem>
                    
                    {message.abTest.enabled && (
                        <>
                            <div className="border-t border-slate-200 dark:border-slate-700"></div>
                            <SummaryItem label="آزمون A/B">
                                <p>آزمون فعال است: <span className="font-semibold text-green-500 dark:text-green-400">بله</span></p>
                                <p>موضوع ب: <span className="font-semibold">"{message.abTest.subjectB}"</span></p>
                                <p>اندازه گروه آزمون: <span className="font-semibold">{message.abTest.testSize}% از مخاطبان</span></p>
                            </SummaryItem>
                        </>
                    )}
                </div>

                <div className="space-y-6">
                    <div className={STYLES.card.container}>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">قیمت‌گذاری</h3>
                        <div className="space-y-3 text-slate-600 dark:text-slate-300">
                           <div className="flex justify-between">
                               <span>گیرندگان</span>
                               <span>{recipientCount.toLocaleString('fa-IR')}</span>
                           </div>
                           <div className="flex justify-between">
                               <span>قیمت هر ایمیل</span>
                               <span>${pricePerEmail.toFixed(4)}</span>
                           </div>
                           <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
                           <div className="flex justify-between text-slate-900 dark:text-white font-bold text-lg">
                               <span>هزینه کل</span>
                               <span>${totalCost.toFixed(2)}</span>
                           </div>
                        </div>
                    </div>
                    <div className={STYLES.card.container}>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">روش پرداخت</h3>
                        <div className="flex items-center gap-4 bg-slate-200 dark:bg-slate-800 p-4 rounded-md">
                            <svg className="h-8 w-8 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 48 48">
                                <path fill="currentColor" fillRule="evenodd" d="M5 10a3 3 0 0 1 3-3h32a3 3 0 0 1 3 3v28a3 3 0 0 1-3-3H8a3 3 0 0 1-3-3V10Zm3 0h32v6H8v-6Zm0 10v15h32V20H8Z" clipRule="evenodd"></path>
                            </svg>
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white">ویزا با پایان ۱۲۳۴</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">انقضا ۱۲/۲۰۲۵</p>
                            </div>
                        </div>
                        <button className="text-sm text-brand-mint hover:opacity-80 mt-3">تغییر روش پرداخت</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- steps/Step5_Analytics.tsx ---
interface Step5AnalyticsProps {
    theme: 'light' | 'dark';
    viewedReport: Report | null;
    onStartNewCampaign: () => void;
    onBackToReports: () => void;
}
const defaultAnalyticsData = {
    stats: {
        openRate: 28.7,
        clickRate: 4.1,
        conversions: 134,
    },
    chartData: [
      { name: '۱ ساعت', opens: 1200, clicks: 150 },
      { name: '۳ ساعت', opens: 2500, clicks: 400 },
      { name: '۶ ساعت', opens: 2800, clicks: 550 },
      { name: '۱۲ ساعت', opens: 3100, clicks: 610 },
      { name: '۲۴ ساعت', opens: 3580, clicks: 702 },
      { name: '۴۸ ساعت', opens: 3820, clicks: 750 },
    ]
};
const StatCard: React.FC<{ title: string; value: string; description: string }> = ({ title, value, description }) => (
    <div className={STYLES.card.container}>
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h3>
        <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
);
const Step5Analytics: React.FC<Step5AnalyticsProps> = ({ theme, viewedReport, onStartNewCampaign, onBackToReports }) => {
    const isDark = theme === 'dark';
    const isViewingPastReport = !!viewedReport;

    const analyticsData = viewedReport ? viewedReport : defaultAnalyticsData;
    const { stats, chartData } = analyticsData;

    const mainButtonText = isViewingPastReport ? 'بازگشت به گزارش‌ها' : 'ایجاد کمپین جدید';
    const mainButtonAction = isViewingPastReport ? onBackToReports : onStartNewCampaign;
    
    const pageTitle = isViewingPastReport ? `گزارش: ${viewedReport.name}` : '🚀 ارسال با موفقیت تایید شد!';
    const pageDescription = isViewingPastReport 
        ? `ارسال شده در ${new Date(viewedReport.sentDate).toLocaleDateString('fa-IR', { dateStyle: 'full' })}`
        : 'کمپین شما در راه است. جادو را به صورت زنده تماشا کنید، همانطور که داده‌های شما جان می‌گیرند.';


    const tooltipStyle: React.CSSProperties = {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        color: isDark ? '#e2e8f0' : '#1e293b',
        direction: 'rtl',
        fontFamily: 'Vazirmatn, sans-serif'
    };
    
    const labelStyle = { color: isDark ? '#cbd5e1' : '#475569' };
    const legendStyle: React.CSSProperties = { color: isDark ? '#e2e8f0' : '#1e293b', direction: 'rtl' };
    const axisStrokeColor = isDark ? '#94a3b8' : '#64748b';
    const gridStrokeColor = isDark ? '#334155' : '#e2e8f0';

    return (
        <div className="animate-fade-in text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{pageTitle}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-2xl mx-auto">{pageDescription}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-right">
                <StatCard title="نرخ باز شدن" value={`${stats.openRate.toLocaleString('fa-IR')}%`} description="باز شدن‌های یکتا در مقابل تحویل داده شده"/>
                <StatCard title="نرخ کلیک" value={`${stats.clickRate.toLocaleString('fa-IR')}%`} description="کلیک‌های یکتا در مقابل تحویل داده شده"/>
                <StatCard title="تبدیل‌ها" value={stats.conversions.toLocaleString('fa-IR')} description="اهداف تکمیل شده از این کمپین"/>
            </div>

            <div className={`${STYLES.card.container} h-96`}>
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: -10, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor} />
                        <XAxis dataKey="name" stroke={axisStrokeColor} reversed={true} />
                        <YAxis stroke={axisStrokeColor} orientation="right" />
                        <Tooltip
                            contentStyle={tooltipStyle}
                            labelStyle={labelStyle}
                        />
                        <Legend wrapperStyle={legendStyle}/>
                        <Line type="monotone" dataKey="opens" stroke="#6D28D9" strokeWidth={2} name="باز شدن" />
                        <Line type="monotone" dataKey="clicks" stroke="#6EE7B7" strokeWidth={2} name="کلیک"/>
                    </LineChart>
                </ResponsiveContainer>
            </div>
            
            <div className="mt-10">
                 <button 
                    onClick={mainButtonAction}
                    className="px-8 py-3 bg-brand-purple text-white rounded-md hover:bg-violet-700 transition-colors duration-200 font-bold text-lg"
                 >
                    {mainButtonText}
                 </button>
            </div>
        </div>
    );
};


// --- AudiencesPage.tsx ---
interface AudienceCardProps {
    category: typeof AUDIENCE_CATEGORIES[0];
    onStartCampaign: (categoryId: string) => void;
}
const AudienceCard: React.FC<AudienceCardProps> = ({ category, onStartCampaign }) => {
    return (
        <div className={STYLES.card.audiencePage}>
            <div className="sm:pl-5 flex-grow w-full">
                <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">{category.name_fa}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">{category.name_en}</p>
                <div className="flex items-center text-slate-600 dark:text-slate-300 mt-3 text-sm">
                    <MailIcon className="w-5 h-5 ml-2 text-slate-400" />
                    <span>{category.count.toLocaleString('fa-IR')} ایمیل</span>
                </div>
                <button 
                    onClick={() => onStartCampaign(category.id)}
                    className="mt-4 w-full sm:w-auto px-5 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md hover:bg-brand-purple hover:text-white dark:hover:bg-brand-purple transition-colors duration-200 font-semibold text-sm"
                >
                    ساخت کمپین
                </button>
            </div>
            <div className="flex-shrink-0 w-full h-40 sm:w-32 sm:h-32 mt-4 sm:mt-0">
                <img 
                    src={category.imageUrl} 
                    alt={category.name_fa}
                    className="w-full h-full object-cover rounded-lg"
                />
            </div>
        </div>
    );
};
interface AudiencesPageProps {
    onStartCampaign: (categoryId: string) => void;
}
const AudiencesPage: React.FC<AudiencesPageProps> = ({ onStartCampaign }) => {
    return (
        <div>
            <PageHeader 
                title="مخاطبان خود را انتخاب کنید"
                description="از میان لیست‌های ایمیل تخصصی ما انتخاب کنید تا پیام شما به دست افراد مناسب برسد."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {AUDIENCE_CATEGORIES.map(category => (
                    <AudienceCard key={category.id} category={category} onStartCampaign={onStartCampaign} />
                ))}
            </div>
        </div>
    );
};


// --- ReportsPage.tsx ---
interface ReportCardProps {
    report: Report;
    onViewReport: (report: Report) => void;
}
const ReportCard: React.FC<ReportCardProps> = ({ report, onViewReport }) => {
    return (
        <div 
            onClick={() => onViewReport(report)}
            className={STYLES.card.report}
        >
            <div className="flex-grow">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{report.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                    <ClockIcon className="w-4 h-4" />
                    ارسال شده در {new Date(report.sentDate).toLocaleDateString('fa-IR', { dateStyle: 'medium' })}
                </p>
            </div>
            <div className="flex-shrink-0 grid grid-cols-3 gap-4 text-center mt-4 sm:mt-0 sm:text-right">
                <div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">باز شدن</div>
                    <div className="font-bold text-xl text-brand-purple">{report.stats.openRate}%</div>
                </div>
                <div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">کلیک</div>
                    <div className="font-bold text-xl text-brand-mint">{report.stats.clickRate}%</div>
                </div>
                 <div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">تبدیل</div>
                    <div className="font-bold text-xl text-yellow-400">{report.stats.conversions}</div>
                </div>
            </div>
        </div>
    );
};
interface ReportsPageProps {
    reports: Report[];
    onViewReport: (report: Report) => void;
}
const ReportsPage: React.FC<ReportsPageProps> = ({ reports, onViewReport }) => {
    return (
        <div>
            <PageHeader
                title="گزارش کمپین‌ها"
                description="عملکرد کمپین‌های گذشته خود را بررسی کنید تا استراتژی آینده خود را بهینه کنید."
            />
            <div className="space-y-6">
                {reports.map(report => (
                    <ReportCard key={report.id} report={report} onViewReport={onViewReport} />
                ))}
            </div>
        </div>
    );
};


// --- DashboardPage.tsx ---
type DashboardPageType = 'dashboard' | 'audiences' | 'wizard' | 'reports' | 'calendar';
interface DashboardProps {
    theme: 'light' | 'dark';
    onNavigate: (page: DashboardPageType) => void;
    onOpenAIAssistant: (initialPrompt?: string) => void;
}
const totalSubscribers = AUDIENCE_CATEGORIES.reduce((acc, category) => acc + category.count, 0);
const totalReports = MOCK_REPORTS.length;
const AIAssistantDashboardWidget: React.FC<{ onGenerate: (prompt: string) => void; theme: 'light' | 'dark' }> = ({ onGenerate, theme }) => {
    const [prompt, setPrompt] = useState('');
    const handleGenerateClick = () => {
        if (prompt.trim()) {
            onGenerate(prompt);
            setPrompt('');
        }
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleGenerateClick();
        }
    }
    return (
        <div className="lg:col-span-4 bg-slate-100 dark:bg-[#0f172a] rounded-2xl shadow-lg dark:shadow-2xl ring-1 ring-black/5 dark:ring-white/10 p-6 flex flex-col justify-between transition-all duration-300">
            <div>
                <div className="flex items-center gap-3">
                    <SparklesIcon className="w-8 h-8 text-violet-400" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">دستیار هوش مصنوعی کمپین</h2>
                </div>
                <p className="mt-4 text-slate-700 dark:text-slate-300"> هدف کمپین خود را توصیف کنید</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">مثال: «یک فروش ویژه ۲۴ ساعته برای مجموعه تابستانی ما برای مشتریان وفادار اعلام کن.»</p>
                <textarea
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-brand-purple focus:border-brand-purple resize-none transition-colors"
                    placeholder="اینجا بنویسید..."
                />
            </div>
            <div className="mt-4">
                <button
                    onClick={handleGenerateClick}
                    disabled={!prompt.trim()}
                    className="w-full px-6 py-3 bg-brand-purple text-white rounded-lg hover:bg-violet-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <SparklesIcon className="w-5 h-5" />
                    تولید پیش‌نویس
                </button>
            </div>
        </div>
    );
};
const DashboardPage: React.FC<DashboardProps> = ({ theme, onNavigate, onOpenAIAssistant }) => {
    return (
        <div>
            <PageHeader 
                title="با جادوگر بازاریابی متحول شوید"
                description="نقطه شروع خلاقانه برای ایجاد، مدیریت و تحلیل کمپین‌های ایمیل"
            />
            <div className={STYLES.dashboard.gridContainer}>
                <AIAssistantDashboardWidget theme={theme} onGenerate={(prompt) => onOpenAIAssistant(prompt)} />
                <div className={`${STYLES.dashboard.cardBase} lg:col-span-2 ${STYLES.dashboard.cardHover} cursor-pointer`} onClick={() => onNavigate('wizard')}>
                     <div>
                        <div className={`${STYLES.dashboard.iconContainer} bg-brand-mint/20`}>
                            <MailIcon className="w-6 h-6 text-brand-mint" />
                        </div>
                        <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">ایجاد کمپین جدید</h2>
                        <p className="mt-1 text-slate-500 dark:text-slate-400">یک کمپین جدید را از طریق جادوگر گام به گام بسازید.</p>
                    </div>
                    <div className="mt-6">
                        <span className="font-semibold text-brand-mint">شروع ساخت ←</span>
                    </div>
                </div>
                 <div className={`${STYLES.dashboard.cardBase} lg:col-span-2 ${STYLES.dashboard.cardHover} cursor-pointer`} onClick={() => onNavigate('audiences')}>
                     <div>
                        <div className={`${STYLES.dashboard.iconContainer} bg-sky-500/20`}>
                            <UsersIcon className="w-6 h-6 text-sky-500" />
                        </div>
                        <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">مخاطبان</h2>
                        <p className="mt-1 text-slate-500 dark:text-slate-400">
                            <span className="font-bold text-slate-700 dark:text-slate-200">{totalSubscribers.toLocaleString('fa-IR')}</span> مشترک در <span className="font-bold text-slate-700 dark:text-slate-200">{AUDIENCE_CATEGORIES.length}</span> دسته.
                        </p>
                    </div>
                    <div className="mt-6">
                        <span className="font-semibold text-sky-500">مدیریت مخاطبان ←</span>
                    </div>
                </div>
                 <div className={`${STYLES.dashboard.cardBase} lg:col-span-2 ${STYLES.dashboard.cardHover} cursor-pointer`} onClick={() => onNavigate('reports')}>
                     <div>
                        <div className={`${STYLES.dashboard.iconContainer} bg-amber-500/20`}>
                            <ChartBarIcon className="w-6 h-6 text-amber-500" />
                        </div>
                        <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">گزارش‌ها</h2>
                        <p className="mt-1 text-slate-500 dark:text-slate-400"><span className="font-bold text-slate-700 dark:text-slate-200">{totalReports}</span> کمپین ارسال شده. عملکرد را پیگیری کنید.</p>
                    </div>
                    <div className="mt-6">
                        <span className="font-semibold text-amber-500">مشاهده گزارش‌ها ←</span>
                    </div>
                </div>
                 <div className={`${STYLES.dashboard.cardBase} lg:col-span-2 ${STYLES.dashboard.cardHover} cursor-pointer`} onClick={() => onNavigate('calendar')}>
                     <div>
                        <div className={`${STYLES.dashboard.iconContainer} bg-rose-500/20`}>
                            <CalendarDaysIcon className="w-6 h-6 text-rose-500" />
                        </div>
                        <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">تقویم</h2>
                        <p className="mt-1 text-slate-500 dark:text-slate-400">مناسبت‌های مهم را مشاهده کرده و کمپین‌های خود را برنامه‌ریزی کنید.</p>
                    </div>
                    <div className="mt-6">
                        <span className="font-semibold text-rose-500">مشاهده تقویم ←</span>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- CalendarPage.tsx ---
interface CalendarPageProps {
    onStartCampaign: (date: string) => void;
}
const CalendarPage: React.FC<CalendarPageProps> = ({ onStartCampaign }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
    };
    return (
        <div>
            <PageHeader 
                title="تقویم بازاریابی"
                description="از تقویم برای مشاهده مناسبت‌های مهم و رویدادهای کلیدی استفاده کنید تا کمپین‌ها را بهتر برنامه‌ریزی کنید."
            />
            <div className="mt-8">
                <PersianCalendar
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    ctaText="ساخت کمپین در این تاریخ"
                    onCtaClick={() => onStartCampaign(selectedDate)}
                />
            </div>
        </div>
    );
};


// --- UserProfilePage.tsx ---
type Theme = 'light' | 'dark' | 'system';
interface UserProfilePageProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}
const mockUser = {
    name: 'آواتر احمدی',
    email: 'avatar.ahmadi@example.com',
    company: 'شرکت نوآوران پیشرو',
    role: 'مدیر بازاریابی',
    notifications: {
        campaignSummary: true,
        weeklyReports: true,
        productUpdates: false,
    }
};
const UserProfilePage: React.FC<UserProfilePageProps> = ({ theme, setTheme }) => {
    const [user, setUser] = useState(mockUser);
    const [password, setPassword] = useState({ current: '', new: '', confirm: ''});

    const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleNotificationToggle = (key: keyof typeof user.notifications) => {
        setUser(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: !prev.notifications[key]
            }
        }));
    };
    
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword({ ...password, [e.target.name]: e.target.value });
    };

    const handleSaveChanges = () => {
        console.log('Saving profile...', user);
        alert('اطلاعات با موفقیت ذخیره شد.');
    };
    
    const handleChangePassword = () => {
         console.log('Changing password...');
        alert('رمز عبور با موفقیت تغییر کرد.');
        setPassword({ current: '', new: '', confirm: '' });
    }

    const isPasswordFormValid = password.new && password.new === password.confirm && password.current;

    const themeOptions = [
        { key: 'light', name: 'روشن', icon: <SunIcon className="w-6 h-6 mx-auto mb-2" /> },
        { key: 'dark', name: 'تیره', icon: <MoonIcon className="w-6 h-6 mx-auto mb-2" /> },
        { key: 'system', name: 'سیستم', icon: <DesktopIcon className="w-6 h-6 mx-auto mb-2" /> },
    ];

    return (
        <div>
            <PageHeader 
                title="پروفایل کاربری"
                description="اطلاعات شخصی، تنظیمات و اعلان‌های خود را مدیریت کنید."
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className={STYLES.card.container}>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">اطلاعات کاربری</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className={STYLES.typography.label}>نام کامل</label>
                                <input type="text" id="name" name="name" value={user.name} onChange={handleInfoChange} className={`${STYLES.input.default} mt-1`} />
                            </div>
                            <div>
                                <label htmlFor="email" className={STYLES.typography.label}>آدرس ایمیل</label>
                                <input type="email" id="email" name="email" value={user.email} onChange={handleInfoChange} className={`${STYLES.input.default} mt-1`} />
                            </div>
                            <div>
                                <label htmlFor="company" className={STYLES.typography.label}>شرکت</label>
                                <input type="text" id="company" name="company" value={user.company} onChange={handleInfoChange} className={`${STYLES.input.default} mt-1`} />
                            </div>
                            <div>
                                <label htmlFor="role" className={STYLES.typography.label}>نقش</label>
                                <input type="text" id="role" name="role" value={user.role} onChange={handleInfoChange} className={`${STYLES.input.default} mt-1`} />
                            </div>
                        </div>
                        <div className="mt-6 text-right">
                            <button onClick={handleSaveChanges} className={STYLES.button.primary}>ذخیره تغییرات</button>
                        </div>
                    </div>
                    <div className={STYLES.card.container}>
                         <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">تغییر رمز عبور</h3>
                         <div className="space-y-4">
                            <div>
                                <label htmlFor="current" className={STYLES.typography.label}>رمز عبور فعلی</label>
                                <input type="password" id="current" name="current" value={password.current} onChange={handlePasswordChange} className={`${STYLES.input.default} mt-1`} />
                            </div>
                            <div>
                                <label htmlFor="new" className={STYLES.typography.label}>رمز عبور جدید</label>
                                <input type="password" id="new" name="new" value={password.new} onChange={handlePasswordChange} className={`${STYLES.input.default} mt-1`} />
                            </div>
                            <div>
                                <label htmlFor="confirm" className={STYLES.typography.label}>تکرار رمز عبور جدید</label>
                                <input type="password" id="confirm" name="confirm" value={password.confirm} onChange={handlePasswordChange} className={`${STYLES.input.default} mt-1`} />
                            </div>
                         </div>
                          <div className="mt-6 text-right">
                            <button onClick={handleChangePassword} disabled={!isPasswordFormValid} className={`${STYLES.button.secondary} disabled:opacity-50 disabled:cursor-not-allowed`}>بروزرسانی رمز عبور</button>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <div className={STYLES.card.container}>
                         <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">اعلان‌ها</h3>
                         <div className="space-y-6">
                            <NotificationToggle 
                                label="خلاصه عملکرد کمپین"
                                description="گزارش خلاصه ۲۴ ساعته پس از ارسال."
                                enabled={user.notifications.campaignSummary}
                                onToggle={() => handleNotificationToggle('campaignSummary')}
                            />
                             <NotificationToggle 
                                label="گزارش‌های هفتگی"
                                description="خلاصه فعالیت هفتگی حساب."
                                enabled={user.notifications.weeklyReports}
                                onToggle={() => handleNotificationToggle('weeklyReports')}
                            />
                             <NotificationToggle 
                                label="بروزرسانی‌های محصول"
                                description="اخبار ویژگی‌های جدید و بهترین شیوه‌ها."
                                enabled={user.notifications.productUpdates}
                                onToggle={() => handleNotificationToggle('productUpdates')}
                            />
                         </div>
                    </div>
                    <div className={STYLES.card.container}>
                         <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">تنظیمات نمایش</h3>
                         <div className="flex justify-around items-center gap-4">
                            {themeOptions.map(option => (
                                <button
                                    key={option.key}
                                    onClick={() => setTheme(option.key as Theme)}
                                    aria-label={`Switch to ${option.key} theme`}
                                    className={`flex-1 p-4 rounded-lg border-2 text-center transition-all duration-200 ${
                                        theme === option.key
                                            ? 'bg-violet-50 dark:bg-slate-700/80 border-brand-purple'
                                            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
                                    }`}
                                >
                                    {option.icon}
                                    <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">{option.name}</span>
                                </button>
                            ))}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
interface NotificationToggleProps {
    label: string;
    description: string;
    enabled: boolean;
    onToggle: () => void;
}
const NotificationToggle: React.FC<NotificationToggleProps> = ({ label, description, enabled, onToggle }) => (
    <div className="flex justify-between items-start">
        <div className="pr-4">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">{label}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <button
            onClick={onToggle}
            className={`${STYLES.toggle.base} ${enabled ? STYLES.toggle.on : STYLES.toggle.off} flex-shrink-0 mt-1`}
        >
            <span className={`${STYLES.toggle.handle} ${enabled ? STYLES.toggle.handleOn : STYLES.toggle.handleOff}`} />
        </button>
    </div>
);


// --- Header.tsx ---
type Page = 'dashboard' | 'audiences' | 'wizard' | 'reports' | 'calendar' | 'profile';
interface HeaderProps {
    setCurrentPage: (page: Page) => void;
    currentPage: Page;
}
const Header: React.FC<HeaderProps> = ({ setCurrentPage, currentPage }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const handleNav = (page: Page) => {
        setCurrentPage(page);
        setIsMenuOpen(false);
    }
    const getLinkClasses = (page: Page, baseClasses: string, activeClasses: string, inactiveClasses: string) => {
        return `${baseClasses} ${currentPage === page ? activeClasses : inactiveClasses}`;
    };
    const navLinkBase = "transition-colors px-3 py-2 rounded-md text-sm font-medium";
    const navLinkActive = "text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-700";
    const navLinkInactive = "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white";
    const mobileNavLinkBase = "block px-3 py-2 rounded-md text-base font-medium";
    const mobileNavLinkActive = "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white";
    const mobileNavLinkInactive = "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white";
    const profileButtonClasses = getLinkClasses(
        'profile', 
        'p-2 ml-2 rounded-full focus:outline-none transition-colors',
        'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white',
        'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
    );

    return (
        <nav className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm w-full max-w-7xl rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 mb-8">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <button onClick={() => handleNav('dashboard')} className="flex items-center focus:outline-none focus:ring-2 focus:ring-brand-purple rounded-lg">
                        <div className="hidden md:block">
                            <h1 className="text-xl font-bold mr-3 bg-gradient-to-r from-brand-pink to-brand-mint text-transparent bg-clip-text">
                               ایمیل ایران
                            </h1>
                        </div>
                         <div className="md:hidden">
                            <h1 className="text-xl font-bold mr-3 bg-gradient-to-r from-brand-pink to-brand-mint text-transparent bg-clip-text">
                               ایمیل ایران
                            </h1>
                        </div>
                    </button>
                    
                    <div className="hidden md:flex md:items-center">
                        <div className="ml-10 flex items-baseline space-x-4 space-x-reverse">
                           <a href="#" onClick={(e) => {e.preventDefault(); handleNav('dashboard')}} className={getLinkClasses('dashboard', navLinkBase, navLinkActive, navLinkInactive)}>داشبورد</a>
                           <a href="#" onClick={(e) => {e.preventDefault(); handleNav('wizard')}} className={getLinkClasses('wizard', navLinkBase, navLinkActive, navLinkInactive)}>کمپین‌</a>
                           <a href="#" onClick={(e) => {e.preventDefault(); handleNav('calendar')}} className={getLinkClasses('calendar', navLinkBase, navLinkActive, navLinkInactive)}>تقویم</a>
                           <a href="#" onClick={(e) => {e.preventDefault(); handleNav('reports')}} className={getLinkClasses('reports', navLinkBase, navLinkActive, navLinkInactive)}>گزارش‌ها</a>
                           <a href="#" onClick={(e) => {e.preventDefault(); handleNav('audiences')}} className={getLinkClasses('audiences', navLinkBase, navLinkActive, navLinkInactive)}>مخاطبان</a>
                        </div>
                        <div className="flex items-center mr-6">
                             <button
                                onClick={() => handleNav('profile')}
                                className={profileButtonClasses}
                                aria-label="User Profile"
                            >
                                <UserIcon className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    <div className="-ml-2 flex md:hidden items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none"
                            aria-controls="mobile-menu"
                            aria-expanded={isMenuOpen}
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMenuOpen ? (
                                <XIcon className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden" id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                       <a href="#" onClick={(e) => {e.preventDefault(); handleNav('dashboard')}} className={getLinkClasses('dashboard', mobileNavLinkBase, mobileNavLinkActive, mobileNavLinkInactive)}>داشبورد</a>
                       <a href="#" onClick={(e) => {e.preventDefault(); handleNav('wizard')}} className={getLinkClasses('wizard', mobileNavLinkBase, mobileNavLinkActive, mobileNavLinkInactive)}>کمپین‌</a>
                       <a href="#" onClick={(e) => {e.preventDefault(); handleNav('calendar')}} className={getLinkClasses('calendar', mobileNavLinkBase, mobileNavLinkActive, mobileNavLinkInactive)}>تقویم</a>
                       <a href="#" onClick={(e) => {e.preventDefault(); handleNav('reports')}} className={getLinkClasses('reports', mobileNavLinkBase, mobileNavLinkActive, mobileNavLinkInactive)}>گزارش‌ها</a>
                       <a href="#" onClick={(e) => {e.preventDefault(); handleNav('audiences')}} className={getLinkClasses('audiences', mobileNavLinkBase, mobileNavLinkActive, mobileNavLinkInactive)}>مخاطبان</a>
                       <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
                       <a href="#" onClick={(e) => {e.preventDefault(); handleNav('profile')}} className={getLinkClasses('profile', mobileNavLinkBase, mobileNavLinkActive, mobileNavLinkInactive)}>پروفایل کاربری</a>
                    </div>
                </div>
            )}
        </nav>
    );
};
// =============================================
// END: Components
// =============================================


// =============================================
// START: App.tsx
// =============================================
const initialCampaignState: CampaignState = {
    audience: {
        segmentId: null,
        categoryId: null,
        filters: [],
        healthScore: 0,
    },
    message: {
        subject: 'اخبار هیجان‌انگیز از شرکت ما!',
        body: 'سلام {{firstName}}،\n\nما به‌روزرسانی‌های شگفت‌انگیزی برای شما داریم. ما سخت روی ویژگی‌های جدید کار کرده‌ایم و بی‌صبرانه منتظریم تا شما آن‌ها را ببینید.\n\nبا احترام،\nتیم',
        abTest: {
            enabled: false,
            subjectB: '',
            testSize: 20,
        },
    },
    schedule: {
        sendDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        sendTime: '09:00',
        timezoneAware: true,
    },
};

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [currentStep, setCurrentStep] = useState(1);
    const [campaignData, setCampaignData] = useState<CampaignState>(initialCampaignState);
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system');
    const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');
    const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
    const [viewedReport, setViewedReport] = useState<Report | null>(null);
    const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>();

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


    const handleNavigation = (page: Page) => {
        if (currentPage === 'reports' && page !== 'reports') {
            setViewedReport(null);
        }
        setCurrentPage(page);
    };

    const updateCampaignData = useCallback(<K extends keyof CampaignState>(field: K, value: CampaignState[K]) => {
        setCampaignData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(prev => prev + 1);
        }
    };
    
    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1); // Corrected from prev + 1
        }
    };

    const handleLaunch = () => {
        console.log("کمپین ارسال شد:", campaignData);
        setViewedReport(null);
        setCurrentStep(5);
    };
    
    const resetCampaign = () => {
        setCampaignData(initialCampaignState);
        setCurrentStep(1);
        handleNavigation('dashboard');
        setViewedReport(null);
    }
    
    const handleStartCampaign = (categoryId: string) => {
        setCampaignData({
            ...initialCampaignState,
            audience: {
                ...initialCampaignState.audience,
                categoryId: categoryId,
            },
        });
        handleNavigation('wizard');
        setCurrentStep(1);
        setViewedReport(null);
    };

    const handleStartCampaignFromCalendar = (date: string) => {
        setCampaignData({
            ...initialCampaignState,
            schedule: {
                ...initialCampaignState.schedule,
                sendDate: date,
            },
        });
        handleNavigation('wizard');
        setCurrentStep(1);
        setViewedReport(null);
    };

    const handleApplyAIDraft = (draft: AICampaignDraft) => {
        const selectedCategory = AUDIENCE_CATEGORIES.find(c => c.id === draft.audienceCategoryId);
        const healthScore = selectedCategory?.health === 'Excellent' ? 95 : selectedCategory?.health === 'Good' ? 75 : 25;
       
        const audienceUpdate: Partial<CampaignState['audience']> = {
            segmentId: null,
            categoryId: draft.audienceCategoryId,
            healthScore: healthScore,
        };
        
        setCampaignData({
            ...campaignData,
            audience: {
                ...campaignData.audience,
                ...audienceUpdate,
            },
            message: {
                ...campaignData.message,
                subject: draft.subject,
                body: draft.body,
                abTest: {
                    ...campaignData.message.abTest,
                    enabled: !!draft.subjectB,
                    subjectB: draft.subjectB || '',
                },
            },
            schedule: {
                ...campaignData.schedule,
                sendTime: draft.sendTime,
            }
        });

        setIsAIAssistantOpen(false);
        setCurrentStep(1); 
        handleNavigation('wizard');
    };
    
    const handleViewReport = (report: Report) => {
        setViewedReport(report);
    };
    
    const handleBackToReports = () => {
        setViewedReport(null);
    }

    const handleOpenAIAssistant = (prompt?: string) => {
        setAiInitialPrompt(prompt);
        setIsAIAssistantOpen(true);
    };

    const handleCloseAIAssistant = () => {
        setIsAIAssistantOpen(false);
        setAiInitialPrompt(undefined);
    };

    const renderWizardStep = () => {
        switch (currentStep) {
            case 1:
                return <Step1Audience 
                    campaignData={campaignData} 
                    updateCampaignData={updateCampaignData}
                    onOpenAIAssistant={() => handleOpenAIAssistant()}
                />;
            case 2:
                return <Step2Message campaignData={campaignData} updateCampaignData={updateCampaignData} />;
            case 3:
                return <Step3Schedule campaignData={campaignData} updateCampaignData={updateCampaignData} />;
            case 4:
                return <Step4Review campaignData={campaignData} />;
            case 5:
                return <Step5Analytics 
                    theme={effectiveTheme}
                    viewedReport={viewedReport}
                    onStartNewCampaign={resetCampaign}
                    onBackToReports={handleBackToReports}
                />;
            default:
                return <Step1Audience 
                    campaignData={campaignData} 
                    updateCampaignData={updateCampaignData}
                    onOpenAIAssistant={() => handleOpenAIAssistant()}
                />;
        }
    };

    const renderPage = () => {
        switch (currentPage) {
             case 'dashboard':
                return (
                    <div className="w-full max-w-7xl animate-fade-in">
                        <DashboardPage 
                            theme={effectiveTheme}
                            onNavigate={handleNavigation} 
                            onOpenAIAssistant={handleOpenAIAssistant} 
                        />
                    </div>
                );
            case 'audiences':
                return (
                    <div className="w-full max-w-7xl animate-fade-in">
                        <AudiencesPage onStartCampaign={handleStartCampaign} />
                    </div>
                );
            case 'reports':
                return (
                     <div className="w-full max-w-7xl animate-fade-in">
                        {viewedReport ? (
                            <Step5Analytics 
                                theme={effectiveTheme}
                                viewedReport={viewedReport}
                                onStartNewCampaign={resetCampaign}
                                onBackToReports={handleBackToReports}
                            />
                        ) : (
                            <ReportsPage reports={MOCK_REPORTS} onViewReport={handleViewReport} />
                        )}
                    </div>
                );
             case 'calendar':
                return (
                    <div className="w-full max-w-7xl animate-fade-in">
                        <CalendarPage onStartCampaign={handleStartCampaignFromCalendar} />
                    </div>
                );
            case 'profile':
                return (
                    <div className="w-full max-w-7xl animate-fade-in">
                        <UserProfilePage theme={theme} setTheme={setTheme} />
                    </div>
                );
            case 'wizard':
                return (
                    <div className={STYLES.page.wizardContainer}>
                        {currentStep <= 4 && <Stepper currentStep={currentStep} steps={STEPS.slice(0, 4)} />}
                        
                        <main className={STYLES.page.mainContent}>
                            {renderWizardStep()}
                        </main>
                        
                        {currentStep <= 4 && (
                            <footer className="mt-8 flex justify-between items-center">
                                <div>
                                    {currentStep > 1 && (
                                        <button
                                            onClick={handlePrev}
                                            className={STYLES.button.secondary}
                                        >
                                            بازگشت
                                        </button>
                                    )}
                                </div>
                                <div>
                                    {currentStep < 4 ? (
                                        <button
                                            onClick={handleNext}
                                            className={STYLES.button.primary}
                                        >
                                            بعدی
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleLaunch}
                                            className={STYLES.button.launch}
                                        >
                                            پرداخت و ارسال کمپین
                                        </button>
                                    )}
                                </div>
                            </footer>
                        )}
                    </div>
                );
        }
    }

    return (
        <div className={STYLES.page.container}>
            <Header setCurrentPage={handleNavigation} currentPage={currentPage} />
            
            {isAIAssistantOpen && (
                <AIAssistantModal 
                    isOpen={isAIAssistantOpen}
                    onClose={handleCloseAIAssistant}
                    onApply={handleApplyAIDraft}
                    initialPrompt={aiInitialPrompt}
                />
            )}

            {renderPage()}
        </div>
    );
};
// =============================================
// END: App.tsx
// =============================================


// =============================================
// START: Root Render
// =============================================
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
// =============================================
// END: Root Render
// =============================================