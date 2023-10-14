import React, { useEffect, useRef, useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { RELOAD_AFTER_UPLOAD, emitter } from '@/event-but';
import { MdOutlineDriveFileRenameOutline } from 'react-icons/md';
import IconButton from './IconButton';
import toast from 'react-hot-toast';

export default function RenameFileModal({ file }) {
    const [showRenameFileModal, setShowRenameFileModal] = useState(false);
    const { data, setData, patch, processing, reset, errors, } = useForm({
        id: file.id,
        name: file.name,
    });
    const nameInput = useRef();

    const openRenameModal = () => {
        setShowRenameFileModal(true);
    };

    const closeRenameModal = () => {
        setShowRenameFileModal(false);
        reset();
    };

    const rename = (e) => {
        e.preventDefault();
        patch(route('file.rename', data.id), {
            preserveScroll: true,
            onSuccess: () => {
                closeRenameModal();
                emitter.emit(RELOAD_AFTER_UPLOAD);
                toast.success(`'${file.name}' has been renamed to ${data.name}`);
            },
            onError: () => nameInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    return (
        <>
            <IconButton onClick={ openRenameModal } title={ 'Rename' }>
                <MdOutlineDriveFileRenameOutline />
            </IconButton>
            <Modal show={ showRenameFileModal } onClose={ closeRenameModal } maxWidth='md'>
                <form onSubmit={ rename } className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Rename
                    </h2>

                    <div className="mt-6">
                        <InputLabel htmlFor="name" value="name" className="sr-only" />

                        <TextInput
                            id="name"
                            type="text"
                            name="name"
                            ref={ nameInput }
                            value={ data.name }
                            onChange={ (e) => setData('name', e.target.value) }
                            className="block w-full mt-1"
                            isFocused
                            onFocus={ (e) => e.target.select() }
                        />

                        <InputError message={ errors.name } className="mt-2" />
                    </div>

                    <div className="flex justify-end mt-6">
                        <SecondaryButton onClick={ closeRenameModal }>Cancel</SecondaryButton>

                        <PrimaryButton className="ml-3" disabled={ processing }>
                            Oke
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </>

    );
}
