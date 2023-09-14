import React, { useEffect, useRef, useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm, usePage } from '@inertiajs/react';
import Dropdown from '../Dropdown';

export default function NewFolderModal() {
    const { folder } = usePage().props;
    const [showNewFolderModal, setShowNewFolderModal] = useState(false);
    const { data, setData, post, processing, reset, errors, } = useForm({
        name: '',
        parent_id: folder.id
    });
    const nameInput = useRef();

    const openNewFolderModal = () => {
        setShowNewFolderModal(true);
    };

    const closeNewFolderModal = () => {
        setShowNewFolderModal(false);

        reset();
    };

    const createFolder = (e) => {
        e.preventDefault();
        console.log(data)
        post(route('folder.create'), {
            preserveScroll: true,
            onSuccess: () => closeNewFolderModal(),
            onError: () => nameInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    useEffect(() => {
        setData('parent_id', folder.id);
        console.log(folder);
    }, [])


    return (
        <>
            <Dropdown.Link as="button" onClick={ openNewFolderModal }>New Folder</Dropdown.Link>

            <Modal show={ showNewFolderModal } onClose={ closeNewFolderModal } maxWidth='md'>
                <form onSubmit={ createFolder } className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        New Folder
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
                            placeholder="Folder Name"
                        />

                        <InputError message={ errors.name } className="mt-2" />
                    </div>

                    <div className="flex justify-end mt-6">
                        <SecondaryButton onClick={ closeNewFolderModal }>Cancel</SecondaryButton>

                        <PrimaryButton className="ml-3" disabled={ processing }>
                            Create Folder
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </>

    );
}
