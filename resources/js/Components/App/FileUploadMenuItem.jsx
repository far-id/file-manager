import React from 'react';
import Dropdown from '../Dropdown';
import { FILE_UPLOAD_STARTED, emitter } from '@/event-but';

export default function FileUploadMenuItem() {
    const onChange = (e) => {
        emitter.emit(FILE_UPLOAD_STARTED, e.target.files);
    };
    return (
        <Dropdown.Link as='button' disabled={ true } className='relative'>
            Upload Files
            <input type="file" onChange={ onChange } multiple className='absolute top-0 bottom-0 left-0 right-0 opacity-0 cursor-pointer' />
        </Dropdown.Link>
    );
}
