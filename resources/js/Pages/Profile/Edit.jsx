import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
            <Head title="Profil" />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Mon Profil</h2>
                    <Link href="/" className="text-sm font-semibold text-blue-600 hover:underline">
                        ← Retour à la boutique
                    </Link>
                </div>

                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </div>

                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                    <UpdatePasswordForm className="max-w-xl" />
                </div>

                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                    <DeleteUserForm className="max-w-xl" />
                </div>
            </div>
        </div>
    );
}
