import CricleProgress from '@/Components/App/CricleProgress';
import FileUploadMenuItem from '@/Components/App/FileUploadMenuItem';
import FolderUploadMenuItem from '@/Components/App/FolderUploadMenuItem';
import NewFolderModal from '@/Components/App/NewFolderModal';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { FILE_UPLOAD_STARTED, RELOAD_AFTER_UPLOAD, emitter } from '@/event-but';
import { Link, useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { AiFillFolder, AiOutlineCloudUpload } from 'react-icons/ai';
import { FaShareSquare, FaTrash } from 'react-icons/fa';
import { FaShareNodes } from 'react-icons/fa6';

const searchInputForm = () => (
    <form>
        <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
            </div>
            <input type="search" id="default-search" className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search file or folder" required />
            <button type="submit" className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
        </div>
    </form>
);

export default function AuthLayout({ children }) {
    const { folder } = usePage().props
    const { user } = usePage().props.auth;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const dragRef = useRef(null);  // this ref used for handle flicker on upload icon
    const { data, setData, post, progress, reset } = useForm({
        files: [],
        relative_paths: [],
        parent_id: folder.id
    });

    const onDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.target !== dragRef.current) {
            setDragOver(true);
        }
    };
    const onDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.target === dragRef.current) {
            setDragOver(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        const { files } = e.dataTransfer;
        if (files && files[0]) {
            fileUpload(files)
        }
    };

    const fileUpload = (files) => {
        setData('files', files);
    };

    useEffect(() => {
        if (data.files.length > 0) {
            setData('relative_paths', [...data.files].map(file => file.webkitRelativePath));
        }
    }, [data.files]);
    // cooment: gw ga tau pasti kenapa tapi ga bisa update data di satu event, jadi dipisah dengan useeffect, harusnya bisa selesai hanya dengan function fileUpload
    useEffect(() => {
        if (data.files.length > 0) {
            post(route('file.store'), {
                onSuccess: () => {
                    toast.success('Uploaded');
                    emitter.emit(RELOAD_AFTER_UPLOAD);
                },
                onError: (errors) => {
                    let message;
                    if (Object.keys(errors).length > 0) {
                        message = errors[Object.keys(errors)[0]];
                    } else {
                        message = "Error during uploading file. Please try again leter.";
                    }
                    toast.error(message);
                },
                onFinish: () => reset('files', 'relative_paths'),
            });
        }
    }, [data.files, data.relative_paths])


    useEffect(() => {
        emitter.on(FILE_UPLOAD_STARTED, fileUpload);
        setData('parent_id', folder.id);
    }, []);

    return (
        <div>
            <aside id="logo-sidebar" className={ `${showingNavigationDropdown ? 'translate-x-0' : '-translate-x-full'} fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform  bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700` } aria-label="Sidebar">
                <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                    <div className="px-3 py-3 lg:px-5 lg:pl-3">
                        <div className="flex items-center justify-between">
                            <Link href={ route('file.myFiles') } className='flex items-center gap-x-2'>
                                <ApplicationLogo className="block w-auto text-gray-800 fill-current h-9 dark:text-gray-200" />
                                <span className='font-sans text-xl font-medium tracking-wider text-white'>File Manager</span>
                            </Link>
                            <button data-drawer-target="logo-sidebar" data-drawer-toggle="logo-sidebar" aria-controls="logo-sidebar" type="button"
                                onClick={ () => setShowingNavigationDropdown((previousState) => !previousState) }
                                className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                            >
                                <svg className="w-6 h-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className='inline-flex'
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </nav>
                <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
                    <ul className="space-y-2 font-medium">
                        <li>
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="inline-flex items-center justify-center w-full px-3 py-2 font-medium leading-4 tracking-wider text-gray-700 transition duration-150 ease-in-out bg-white border border-gray-600 rounded-md active:shadow-md text-md dark:text-gray-200 dark:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                                    >
                                        Create New
                                        <svg
                                            className="ml-2 -mr-0.5 h-4 w-4"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content
                                    align='left'
                                    width='48'
                                    contentClasses='tracking-wide py-1 bg-white dark:bg-gray-700'
                                >
                                    <NewFolderModal />
                                    <FileUploadMenuItem />
                                    <FolderUploadMenuItem />
                                </Dropdown.Content>
                            </Dropdown>
                        </li>
                        <li>
                            <Link href={ route('dashboard') } className={ `${route().current('dashboard') && 'bg-gray-50 dark:bg-gray-900 shadow-lg'} flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group` }>
                                <svg className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21">
                                    <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                                    <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                                </svg>
                                <span className="ml-3">Dashboard</span>
                            </Link>
                        </li>
                        <li>
                            <Link href={ route('file.myFiles') } className={ `${route().current('file.myFiles') && 'bg-gray-50 dark:bg-gray-900 shadow-lg'} flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group` }>
                                <AiFillFolder />
                                <span className="flex-1 ml-3 whitespace-nowrap">My Files</span>
                            </Link>
                        </li>
                        <li>
                            <Link href={ route('file.sharedWithMe') } className={ `${route().current('file.sharedWithMe') && 'bg-gray-50 dark:bg-gray-900 shadow-lg'} flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group` }>
                                <FaShareNodes />
                                <span className="flex-1 ml-3 whitespace-nowrap">Shared With Me</span>
                            </Link>
                        </li>
                        <li>
                            <Link href={ route('file.SharedByMe') } className={ `${route().current('file.SharedByMe') && 'bg-gray-50 dark:bg-gray-900 shadow-lg'} flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group` }>
                                <FaShareSquare />
                                <span className="flex-1 ml-3 whitespace-nowrap">Shared By Me</span>
                            </Link>
                        </li>
                        <li>
                            <Link href={ route('file.trash') } className={ `${route().current('file.trash') && 'bg-gray-50 dark:bg-gray-900 shadow-lg'} flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group` }>
                                <FaTrash />
                                <span className="flex-1 ml-3 whitespace-nowrap">Trash</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </aside>
            <div className="p-4 min-h-screen text-white bg-white sm:ml-64 dark:bg-gray-800">
                <div className="flex justify-between">
                    <div className='hidden w-1/2 sm:inline'>
                        { searchInputForm() }
                    </div>
                    <button data-drawer-target="logo-sidebar" data-drawer-toggle="logo-sidebar" aria-controls="logo-sidebar" type="button"
                        onClick={ () => setShowingNavigationDropdown((previousState) => !previousState) }
                        className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                    >
                        <svg className="w-6 h-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                            <path
                                className='inline-flex'
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>
                    <Link href={ route('file.myFiles') } className='flex items-center sm:hidden gap-x-2'>
                        <ApplicationLogo className="block w-auto text-gray-800 fill-current h-9 dark:text-gray-200" />
                        <span className='font-sans text-xl font-medium tracking-wider text-white'>File Manager</span>
                    </Link>
                    <div className="flex items-center">
                        <div className="flex items-center ml-3">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="inline-flex rounded-md">
                                        <button
                                            type="button"
                                            className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out bg-white border border-transparent rounded-md dark:text-gray-400 dark:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                                        >
                                            { user.name }

                                            <svg
                                                className="ml-2 -mr-0.5 h-4 w-4"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </span>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link href={ route('profile.edit') }>Profile</Dropdown.Link>
                                    <Dropdown.Link href={ route('logout') } method="post" as="button">
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </div>
                <div className='inline w-1/2 sm:hidden'>
                    { searchInputForm() }
                </div>

                <div className={ `min-h-max px-4 pt-6 pb-3 ${dragOver && 'bg-blue-200'}` }
                    onDrop={ handleDrop }
                    onDragOver={ onDragOver }
                    onDragLeave={ onDragLeave }
                    onDragEnter={ ondragover }
                    ref={ dragRef }
                >
                    { children }
                    { dragOver && (
                        <div
                            className='absolute left-0 right-0 flex flex-col items-center justify-center text-lg bottom-5'>
                            <AiOutlineCloudUpload className='text-blue-500 text-7xl animate-bounce' />
                            <span className='px-4 py-2 mt-4 bg-blue-600 rounded-full'>Release the file to Upload It.</span>
                        </div>
                    ) }
                </div>
                { progress && (

                    <div className="bottom-10 right-4 fixed">
                        <CricleProgress percentage={ progress.percentage } />
                    </div>
                ) }
                <Toaster
                    position="top-right"
                    reverseOrder={ false }
                />
            </div>

        </div>
    );
}
