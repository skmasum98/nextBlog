// src/app/reset-password/page.js

import { Suspense } from 'react';
import ResetPasswordForm from './ResetPasswordForm';

// A simple loading component to show while the client component loads
function Loading() {
    return <div className="text-center py-10">Loading...</div>;
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<Loading />}>
            <ResetPasswordForm />
        </Suspense>
    );
}