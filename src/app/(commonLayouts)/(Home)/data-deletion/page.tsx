
import React from 'react';
import PageTitle from '@/components/ui/PageTitle';
import Link from 'next/link';

export const metadata = {
    title: 'Data Deletion Information | Bangla Bazar',
    description: 'Instructions for requesting data deletion from Bangla Bazar.',
};

const DataDeletionPage = () => {
    return (
        <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
            <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 rounded-2xl p-6 md:p-10">
                <PageTitle title="Data Deletion Instructions" className="mb-8 text-center text-3xl md:text-4xl" />

                <div className="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed">
                    <section>
                        <p className="text-lg">
                            At <strong>Bangla Bazar</strong>, we value your privacy and are committed to protecting your personal data. In compliance with Facebook's Platform Policy and applicable data protection laws, we provide a simple and transparent process for you to request the deletion of your data from our servers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">How to Request Data Deletion</h2>
                        <p className="mb-4">
                            If you wish to delete your account and all associated personal data, you may do so using one of the following methods:
                        </p>

                        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 mb-6">
                            <h3 className="text-xl font-bold text-primary mb-3">Method 1: Direct Request via Email</h3>
                            <ol className="list-decimal pl-6 space-y-3">
                                <li>Compose an email to our Data Protection Officer at <a href="mailto:support@banglamart.com" className="font-semibold text-primary hover:underline">support@banglamart.com</a>.</li>
                                <li>Use the subject line: <strong>"Data Deletion Request - [Your Name/Username]"</strong>.</li>
                                <li>In the body of the email, please include:
                                    <ul className="list-disc pl-6 mt-2 space-y-1">
                                        <li>Your full name.</li>
                                        <li>The email address or phone number associated with your account.</li>
                                        <li>A specific statement requesting the deletion of your account and personal data.</li>
                                    </ul>
                                </li>
                                <li>We will verify your identity and process your request within <strong>30 days</strong>. You will receive a confirmation email once your data has been permanently removed.</li>
                            </ol>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 mb-6">
                            <h3 className="text-xl font-bold text-primary mb-3">Method 2: Facebook Settings (For Social Login Users)</h3>
                            <p className="mb-3">
                                If you logged in using Facebook, you can remove our app's access and request data deletion directly through Facebook:
                            </p>
                            <ol className="list-decimal pl-6 space-y-3">
                                <li>Go to your Facebook Account's <strong>Settings & Privacy</strong> &gt; <strong>Settings</strong>.</li>
                                <li>Navigate to <strong>Apps and Websites</strong>.</li>
                                <li>Find and select <strong>Bangla Bazar</strong>.</li>
                                <li>Click <strong>Remove</strong>.</li>
                                <li>After removing the app, you may see an option to <strong>"View Removed Apps and Websites"</strong> where you can send a request to us to delete your data.</li>
                            </ol>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">What Data Will Be Deleted?</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Account Information:</strong> Your username, profile picture, email address, password, phone number, and address.</li>
                            <li><strong>Social Media Data:</strong> Any data retrieved from Facebook or Google (name, profile ID, email).</li>
                            <li><strong>Order History (Anonymization):</strong> While we must retain transaction records for financial and legal auditing, your personal identifiers will be removed from these records (anonymized), so they can no longer be linked back to you.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">Retention of Data</h2>
                        <p>
                            We retain basic data only as long as necessary to provide our services and for legal compliance. Once a deletion request is processed, your account will be deactivated immediately, and your personal data will be permanently deleted from our active databases within a reasonable timeframe (not exceeding 30 days).
                        </p>
                    </section>

                    <section className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6 text-center">
                        <p className="text-slate-500">
                            For any urgent inquiries regarding your privacy, please contact: <br />
                            <a href="mailto:support@banglamart.com" className="text-primary font-bold hover:underline">support@banglamart.com</a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default DataDeletionPage;
