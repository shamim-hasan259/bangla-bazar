
import React from 'react';
import PageTitle from '@/components/ui/PageTitle';
import Link from 'next/link';

export const metadata = {
    title: 'Privacy Policy | Bangla Bazar',
    description: 'Privacy Policy for Bangla Bazar e-commerce application.',
};

const PrivacyPolicyPage = () => {
    return (
        <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
            <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 rounded-2xl p-6 md:p-10">
                <PageTitle title="Privacy Policy" className="mb-8 text-center text-3xl md:text-4xl" />

                <div className="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed">
                    <section>
                        <p className="mb-4">
                            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p>
                            Welcome to <strong>Bangla Bazar</strong> ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <strong>Bangla Bazar</strong>, including any other media form, media channel, mobile website, or mobile application related or connected thereto.
                        </p>
                        <p className="mt-4">
                            By accessing or using our Service, you signify that you have read, understood, and agree to our collection, storage, use, and disclosure of your personal information as described in this Privacy Policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">1. Information We Collect</h2>
                        <p className="mb-4">
                            We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website, or otherwise when you contact us.
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site, such as online chat and message boards.</li>
                            <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
                            <li><strong>Financial Data:</strong> Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you purchase, order, return, exchange, or request information about our services from the Site. We store only very limited, if any, financial information that we collect. Otherwise, all financial information is stored by our payment processor (such as SSLCommerz, Bkash, etc.), and you are encouraged to review their privacy policy and contact them directly for responses to your questions.</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mt-6 mb-3">Facebook Permissions</h3>
                        <p>
                            The Site may by default access your Facebook Basic Account Information, including your name, email, gender, birthday, current city, and profile picture URL, as well as other information that you choose to make public. We may also request access to other permissions related to your account, such as friends, check-ins, and likes, and you may choose to grant or deny us access to each individual permission. For more information regarding Facebook permissions, refer to the <a href="https://developers.facebook.com/docs/permissions/reference" target="_blank" rel="noreferrer" className="text-primary hover:underline">Facebook Permissions Reference</a> page.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">2. How We Use Your Information</h2>
                        <p className="mb-4">
                            We use the information we collect about you for the following purposes:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Account Creation and Logon:</strong> To facilitate account creation and logon process, including <strong>Social Login</strong> via Facebook and Google.</li>
                            <li><strong>Order Fulfillment:</strong> To manage your orders, payments, returns, and exchanges.</li>
                            <li><strong>Communication:</strong> To send you administrative information, such as order confirmations, updates on our terms and policies, and password resets.</li>
                            <li><strong>Marketing:</strong> To send you marketing and promotional communications (you can opt-out at any time).</li>
                            <li><strong>Security:</strong> To protect our Services against fraud and unauthorized access.</li>
                            <li><strong>Improvement:</strong> To analyze usage trends and improve your experience on our website.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">3. Disclosure of Your Information</h2>
                        <p className="mb-4">
                            We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
                            <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.</li>
                            <li><strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">4. Facebook Data Deletion Instructions</h2>
                        <p className="mb-4">
                            Bangla Bazar provides you with the ability to delete your data. According to Facebook's Platform Policy, we must provide a User Data Deletion Callback URL or data deletion instructions.
                        </p>
                        <p className="mb-4">
                            If you want to delete your activities for the Bangla Bazar App, you can remove your information by following these steps:
                        </p>
                        <ol className="list-decimal pl-6 space-y-2">
                            <li>Go to your Facebook Account's Settings & Privacy. Click "Settings".</li>
                            <li>Look for "Apps and Websites" and you will see all of the apps and websites you linked with your Facebook.</li>
                            <li>Search and Click "Bangla Bazar" in the search bar.</li>
                            <li>Scroll and click "Remove".</li>
                            <li>Congratulations, you have successfully removed your app activities.</li>
                        </ol>
                        <p className="mt-4">
                            Alternatively, you can request the complete deletion of your account and all associated data from our system directly. Please visit our <Link href="/data-deletion" className="text-primary hover:underline font-medium">Data Deletion Information Page</Link> for detailed instructions on how to request the permanent removal of your data from our servers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">5. Security of Your Information</h2>
                        <p>
                            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">6. Contact Us</h2>
                        <p className="mb-4">
                            If you have questions or comments about this Privacy Policy, please contact us at:
                        </p>
                        <address className="not-italic">
                            <strong>Bangla Bazar</strong><br />
                            Uttara, Dhaka, Bangladesh<br />
                            Email: <a href="mailto:support@banglamart.com" className="text-primary hover:underline">support@banglamart.com</a><br />
                            Phone: +8801789-785509
                        </address>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
