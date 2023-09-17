import React from 'react';
import Dropdown from '../Dropdown';

export default function FolderUploadMenuItem() {
    return (
        <Dropdown.Link href={ route('profile.edit') }>Upload Folder</Dropdown.Link>
    );
}
