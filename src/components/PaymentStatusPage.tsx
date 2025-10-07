

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { updateOrder, fetchCampaignByOrderId, updateCampaign } from '../services/campaignService';
import { LoadingSpinner, CheckCircleIcon, XCircleIcon } from './IconComponents';
import type { Page } from '../types';

interface Props {
    onViewCampaign: (campaignId: number) => void;
    onNavigate: (page: Page) => void;
}

const PaymentStatusPage: React.FC<Props> = ({ onViewCampaign, onNavigate }) => {
    const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
    const [message, setMessage] = useState('در حال بررسی وضعیت پرداخت شما...');
    const [verifiedCampaignId, setVerifiedCampaignId] = useState<number | null>(null);
    const { accessToken } = useAuth();
    const { addNotification } = useNotification();

    useEffect(() => {
        const verifyPayment = async () => {
            if (!accessToken) {
                setStatus('failed');
                setMessage('جلسه شما منقضی شده است. لطفاً دوباره وارد شوید.');
                return;
            }

            const params = new URLSearchParams(window.location.search);
            const trackId = params.get('trackId');
            const orderId = params.get('orderId');
            const success = params.get('success');

            if (!trackId || !orderId) {
                setStatus('failed');
                setMessage('اطلاعات پرداخت نامعتبر است.');
                return;
            }

            if (success !== '1') {
                // FIX: Removed parseInt as orderId is a UUID string.
                await updateOrder(orderId, { order_status: 'Failed' }, accessToken);
                setStatus('failed');
                setMessage('پرداخت توسط شما لغو شد یا ناموفق بود.');
                addNotification('پرداخت ناموفق بود.', 'error');
                return;
            }

            try {
                // This should be a call to a secure backend proxy
                const verificationResponse = await fetch('https://gateway.zibal.ir/v1/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        merchant: 'zibal', // In a real app, the backend would use the actual merchant ID
                        trackId: trackId,
                    }),
                });
                const verificationData = await verificationResponse.json();

                if (verificationData.result === 100) {
                    // Payment successful
                    // FIX: Removed parseInt as orderId is a UUID string.
                    await updateOrder(orderId, { order_status: 'Completed' }, accessToken);
                    
                    // FIX: Removed parseInt as orderId is a UUID string.
                    const campaign = await fetchCampaignByOrderId(orderId, accessToken);
                    if (campaign) {
                        await updateCampaign(campaign.id, { campaign_status: 'processing' }, accessToken);
                        setVerifiedCampaignId(campaign.id);
                    }
                    
                    setStatus('success');
                    setMessage(`پرداخت با موفقیت انجام شد! شماره پیگیری: ${verificationData.refNumber}`);
                    addNotification('پرداخت شما با موفقیت ثبت شد.', 'success');
                } else {
                    // Verification failed
                    // FIX: Removed parseInt as orderId is a UUID string.
                    await updateOrder(orderId, { order_status: 'Failed' }, accessToken);
                    setStatus('failed');
                    setMessage(`تایید پرداخت ناموفق بود. خطا: ${verificationData.message}`);
                    addNotification('تایید پرداخت ناموفق بود.', 'error');
                }
            } catch (error) {
                console.error("Verification error:", error);
                setStatus('failed');
                setMessage('خطایی در هنگام بررسی پرداخت رخ داد. لطفاً با پشتیبانی تماس بگیرید.');
                addNotification('خطای سرور در هنگام تایید پرداخت.', 'error');
            }
        };

        verifyPayment();

    }, [accessToken, addNotification]);
    
    const icon = {
        verifying: <LoadingSpinner className="w-16 h-16 text-brand-500" />,
        success: <CheckCircleIcon className="w-16 h-16 text-green-500" />,
        failed: <XCircleIcon className="w-16 h-16 text-red-500" />,
    }[status];

    return (
        <div className="page-main-content">
            <div className="flex flex-col items-center justify-center text-center py-20">
                {icon}
                <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
                    {status === 'verifying' && 'در حال پردازش...'}
                    {status === 'success' && 'پرداخت موفق'}
                    {status === 'failed' && 'پرداخت ناموفق'}
                </h2>
                <p className="mt-2 text-lg text-slate-500 dark:text-slate-400 max-w-md">{message}</p>
                
                <div className="mt-10 flex gap-4">
                    {status === 'success' && verifiedCampaignId && (
                         <button onClick={() => onViewCampaign(verifiedCampaignId)} className="btn btn-primary">
                            مشاهده کمپین
                        </button>
                    )}
                     {status === 'failed' && (
                        <button onClick={() => onNavigate('campaigns')} className="btn btn-secondary">
                            بازگشت به کمپین‌ها
                        </button>
                    )}
                    <button onClick={() => onNavigate('dashboard')} className="btn btn-secondary">
                        بازگشت به داشبورد
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentStatusPage;