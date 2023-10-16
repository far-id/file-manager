import React, { useEffect, useRef, useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { RELOAD_AFTER_UPLOAD, emitter } from '@/event-but';
import IconButton from './IconButton';
import toast from 'react-hot-toast';
import { BsPersonPlusFill } from 'react-icons/bs';

export default function ShareFileModal({ form }) {
    const [showShareFileModal, setShowShareFileModal] = useState(false); ``;
    const emailInput = useRef();

    const openShareModal = () => {
        setShowShareFileModal(true);
        console.log(form.data);
    };

    const closeShareFileModal = () => {
        setShowShareFileModal(false);
        form.clearErrors();
        form.reset();
    };

    const share = (e) => {
        e.preventDefault();
        form.post(route('file.share'), {
            preserveScroll: true,
            onSuccess: () => {
                closeShareFileModal();
                emitter.emit(RELOAD_AFTER_UPLOAD);
                toast.success(`${form.data.ids.length} files has been shared to ${form.data.email}`);
            },
            onError: () => emailInput.current.focus(),
        });
    };

    return (
        <>
            <IconButton onClick={ openShareModal } title={ 'Share' }>
                <BsPersonPlusFill />
            </IconButton>
            <Modal show={ showShareFileModal } onClose={ closeShareFileModal } maxWidth='md'>
                <form onSubmit={ share } className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Share to
                    </h2>

                    <div className="mt-6">
                        <InputLabel htmlFor="name" value="name" className="sr-only" />

                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            ref={ emailInput }
                            value={ form.data.email }
                            onChange={ (e) => form.setData('email', e.target.value) }
                            className="block w-full mt-1"
                            isFocused
                            onFocus={ (e) => e.target.select() }
                            placeholder="someone@mail.com"
                            required
                        />

                        <InputError message={ form.errors.email } className="mt-2" />
                    </div>

                    <div className="flex justify-end mt-6">
                        <SecondaryButton onClick={ closeShareFileModal }>Cancel</SecondaryButton>

                        <PrimaryButton className="ml-3" disabled={ form.processing }>
                            Oke
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </>

    );
}
