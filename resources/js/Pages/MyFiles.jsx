import AuthLayout from '@/Layouts/AuthLayout';
import React from 'react';

function MyFiles() {
    return (
        <div>My.Files</div>
    );
}

MyFiles.layout = (page) => <AuthLayout children={ page } />;
export default MyFiles; 