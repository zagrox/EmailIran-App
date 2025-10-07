import React, { useState, useEffect } from 'react';
import PageHeader from './PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { fetchOrdersByUser, fetchCampaignByOrderId, fetchTransactionById } from '../services/campaignService';
import type { Order, Transaction, EmailMarketingCampaign, OrderStatus } from '../types';
import { LoadingSpinner, MailIcon, LinkIcon, ChevronLeftIcon } from './IconComponents';

const statusStyles: Record<OrderStatus, string> = {
    Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    Completed: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    Processing: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
    Failed: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    Canceled: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

const OrderStatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => (
    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusStyles[status] || statusStyles.Canceled}`}>
        {status}
    </span>
);

interface OrdersPageProps {
    onViewCampaign: (campaignId: number) => void;
}

const OrdersPage: React.FC<OrdersPageProps> = ({ onViewCampaign }) => {
    const { isAuthenticated, accessToken } = useAuth();
    const { navigateToLogin } = useUI();
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [relatedCampaign, setRelatedCampaign] = useState<EmailMarketingCampaign | null>(null);
    const [relatedTransactions, setRelatedTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !accessToken) {
            setIsLoading(false);
            return;
        }

        const loadOrders = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const userOrders = await fetchOrdersByUser(accessToken);
                setOrders(userOrders.sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime()));
            } catch (err) {
                setError('خطا در دریافت لیست سفارشات.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadOrders();
    }, [isAuthenticated, accessToken]);
    
    const handleSelectOrder = async (order: Order) => {
        setSelectedOrder(order);
        setIsDetailLoading(true);
        setRelatedCampaign(null);
        setRelatedTransactions([]);
        if (!accessToken) return;

        try {
            const campaignPromise = fetchCampaignByOrderId(order.id, accessToken);
            
            const transactionPromises = (order.transactions || []).map(id =>
                fetchTransactionById(id, accessToken)
            );

            const [campaign, transactions] = await Promise.all([
                campaignPromise,
                Promise.all(transactionPromises)
            ]);

            setRelatedCampaign(campaign);
            setRelatedTransactions(transactions);

        } catch (err) {
            console.error("Failed to load order details:", err);
            setError("Could not load order details.");
        } finally {
             setIsDetailLoading(false);
        }
    }

    const renderOrderList = () => (
        <div className="space-y-4">
            {orders.map(order => (
                <div key={order.id} className="card-report !p-5">
                    <div className="flex-grow text-right">
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">#{order.id.substring(0,8)}</p>
                        <p className="font-semibold text-lg text-slate-800 dark:text-slate-200 mt-1">{new Date(order.date_created).toLocaleDateString('fa-IR', { dateStyle: 'full' })}</p>
                    </div>
                    <div className="flex items-center gap-6 mt-4 sm:mt-0">
                        <div className="text-center">
                            <div className="text-base text-slate-500 dark:text-slate-400">مبلغ کل</div>
                            <div className="font-bold text-xl text-slate-900 dark:text-white">{order.order_total.toLocaleString('fa-IR')} <span className="text-sm">تومان</span></div>
                        </div>
                         <div className="text-center">
                            <div className="text-base text-slate-500 dark:text-slate-400">وضعیت</div>
                            <OrderStatusBadge status={order.order_status} />
                        </div>
                        <button onClick={() => handleSelectOrder(order)} className="btn btn-secondary !px-4 !py-2">مشاهده جزئیات</button>
                    </div>
                </div>
            ))}
        </div>
    );
    
    const renderOrderDetail = () => {
        if (!selectedOrder) return null;

        return (
            <div className="page-main-content animate-fade-in">
                <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-2 text-base font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 mb-6">
                    <ChevronLeftIcon className="w-5 h-5" />
                    بازگشت به لیست سفارشات
                </button>

                {isDetailLoading ? (
                    <div className="flex justify-center items-center py-20"><LoadingSpinner className="w-10 h-10 text-brand-500" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="card h-fit">
                             <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">خلاصه سفارش</h3>
                             <div className="space-y-4">
                                <div>
                                    <p className="summary-label">شماره سفارش</p>
                                    <p className="summary-value font-mono !text-lg">#{selectedOrder.id.substring(0,8)}</p>
                                </div>
                                <div>
                                    <p className="summary-label">تاریخ ثبت</p>
                                    <p className="summary-value !text-lg">{new Date(selectedOrder.date_created).toLocaleDateString('fa-IR')}</p>
                                </div>
                                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                                     <p className="summary-label">وضعیت</p>
                                     <OrderStatusBadge status={selectedOrder.order_status} />
                                </div>
                                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                                    <p className="summary-label">مبلغ کل</p>
                                    <p className="summary-value !text-2xl text-brand-600 dark:text-brand-400">{selectedOrder.order_total.toLocaleString('fa-IR')} <span className="text-base font-normal text-slate-500 dark:text-slate-400">تومان</span></p>
                                </div>
                             </div>
                        </div>
                        <div className="md:col-span-2 space-y-6">
                            <div className="card">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">جزئیات کمپین مرتبط</h3>
                                {relatedCampaign ? (
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                        <div>
                                            <p className="summary-label">موضوع کمپین</p>
                                            <p className="summary-value !text-lg">"{relatedCampaign.campaign_subject}"</p>
                                        </div>
                                        <button onClick={() => onViewCampaign(relatedCampaign.id)} className="btn btn-primary !px-5 mt-2 sm:mt-0">
                                            <LinkIcon className="w-5 h-5"/>
                                            <span>مشاهده کمپین</span>
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-slate-500 dark:text-slate-400">هیچ کمپینی به این سفارش مرتبط نیست.</p>
                                )}
                            </div>
                             <div className="card">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">تراکنش‌ها</h3>
                                {relatedTransactions.length > 0 ? (
                                    <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {relatedTransactions.map(tx => (
                                            <li key={tx.id} className="py-3 flex justify-between items-center">
                                                <div>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-200">شناسه پیگیری (Track ID)</p>
                                                    <p className="font-mono text-slate-500 dark:text-slate-400">{tx.trackid || '-'}</p>
                                                </div>
                                                <p className="text-sm text-slate-500">{new Date(tx.date_created).toLocaleString('fa-IR')}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                     <p className="text-slate-500 dark:text-slate-400">هیچ تراکنشی برای این سفارش ثبت نشده است.</p>
                                )}
                            </div>
                        </div>
                        
                    </div>
                )}
            </div>
        )
    }

    if (!isAuthenticated) {
        return (
            <div className="text-center py-20 animate-fade-in">
                <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 mb-6">
                    <MailIcon className="w-12 h-12 text-slate-500 dark:text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">وارد شوید تا سفارشات خود را ببینید</h2>
                <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">برای مشاهده تاریخچه سفارشات، لطفاً وارد شوید.</p>
                <button onClick={navigateToLogin} className="btn btn-primary mt-8">
                    ورود به حساب کاربری
                </button>
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title="تاریخچه سفارشات"
                description="سفارشات گذشته خود را مشاهده و مدیریت کنید."
            />
             {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <LoadingSpinner className="w-12 h-12 text-brand-600" />
                </div>
            ) : error ? (
                <div className="text-center py-20 card">
                    <p className="text-red-500 dark:text-red-400">{error}</p>
                </div>
            ) : selectedOrder ? (
                renderOrderDetail()
            ) : orders.length > 0 ? (
                renderOrderList()
            ) : (
                <div className="text-center py-20 card">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">هنوز سفارشی ثبت نکرده‌اید!</h3>
                    <p className="mt-2 text-base text-slate-500 dark:text-slate-400">پس از نهایی کردن اولین کمپین، سفارش شما در اینجا نمایش داده می‌شود.</p>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;