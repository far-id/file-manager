import FileIcon from '@/Components/App/FileIcon';
import IconButton from '@/Components/App/IconButton';
import { httpGet } from '@/Helper/http-helper';
import AuthLayout from '@/Layouts/AuthLayout';
import { RELOAD_AFTER_UPLOAD, emitter } from '@/event-but';
import { useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { IoMdClose, IoMdTrash } from 'react-icons/io';
import { MdRestore } from 'react-icons/md';
import { IoWarningOutline } from 'react-icons/io5';

function ToastOpenFolder({ t }) {
    return (
        <div
            className={ `${t.visible ? 'animate-enter' : 'animate-leave'
                } max-w-md w-full bg-white dark:bg-gray-900 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5` }
        >
            <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                        <IoWarningOutline className='w-8 h-8 stroke-yellow-400' />
                    </div>
                    <div className="flex-1 ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            This Folder is in your trash
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                            To view this folder, you'll need to restore it from your trash
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex border-l border-gray-200 dark:border-gray-700">
                <button
                    onClick={ () => toast.dismiss(t.id) }
                    className="flex items-center justify-center w-full p-4 text-sm font-medium text-indigo-600 border border-transparent rounded-none rounded-r-lg dark:text-indigo-500 dark:hover:text-indigo-400 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    Close
                </button>
            </div>
        </div>
    );
}

function Trash({ files }) {
    const [allFiles, setAllFiles] = useState([...files.data]);
    const [selected, setSelected] = useState({});

    const loadMoreRef = useRef();
    const nextPage = useRef(files.links.next);
    const { data, setData, delete: destroy, patch, reset } = useForm({
        all: false,
        ids: [],
    });

    const openFolder = (file) => {
        if (!file.is_folder) {
            return;
        }
        toast.custom((t) => (
            <>
                <ToastOpenFolder t={ t } />
            </>
        ));
    };

    const onSelectedAllChange = () => {
        allFiles.map(file => selected[file.id] = !data.all);
        setData('all', !data.all);
        setIdsWhenSelectedChange();
    };

    const setIdsWhenSelectedChange = () => {
        setData(data => ({
            ...data,
            ids: Object.entries(selected).filter(selected => selected[1]).map(selected => selected[0])
        }));
    };

    const onSelectFile = (file) => {
        setSelected((prev) => ({ ...prev, [file.id]: !selected[file.id] }));
    };

    const cancelSelect = () => {
        reset();
        setSelected({});
    };

    const deleteForeverSelectedFile = () => {
        destroy(route('file.deleteForever'), {
            onFinish: () => {
                reset();
                reloadPage();
                setSelected({});
            }
        });
    };

    const restoreSelectedFile = () => {
        patch(route('file.restore'), {
            onFinish: () => {
                reset();
                reloadPage();
                setSelected({});
            }
        });
    };

    const reloadPage = () => {
        httpGet(window.location.href).then(res => {
            setAllFiles([...res.data]);
            nextPage.current = res.links.next;
        });
    };

    const originalLocation = (path) => {
        path = path.split('/');
        if (path.length === 1) return 'My Files';
        return path[path.length - 2];
    };

    useEffect(() => {
        let checked = true;
        for (const f of allFiles) {
            if (!selected[f.id]) {
                checked = false;
                break;
            }
        }
        setData('all', checked);
        setIdsWhenSelectedChange();
    }, [selected]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) =>
            entries.forEach(entry => {
                if (entry.isIntersecting && nextPage.current != null) {
                    httpGet(nextPage.current).then(res => {
                        setAllFiles(prevFiles => [...prevFiles, ...res.data]);
                        nextPage.current = res.links.next;
                    });
                }
            }),
            { rootMargin: '-250px 0px 0px 0px', }
        );

        allFiles.map(file => selected[file.id] = data.all);
        observer.observe(loadMoreRef.current);
        emitter.on(RELOAD_AFTER_UPLOAD, reloadPage);
    }, []);

    return (
        <div className="relative shadow-md sm:rounded-lg">
            <div className="flex items-center justify-between pb-4">
                <div className={ `relative ${data.ids.length < 1 && 'invisible'}` }>
                    <div className="flex items-center px-2 rounded-full bg-gray-700/60 gap-x-1">
                        <IconButton onClick={ cancelSelect } title={ 'Unselect' }>
                            <IoMdClose />
                        </IconButton>
                        <span className='text-xs'>{ data.ids.length } selected</span>
                        <IconButton onClick={ restoreSelectedFile } title={ 'Restore' }>
                            <MdRestore />
                        </IconButton>
                        <IconButton onClick={ deleteForeverSelectedFile } title={ 'Delete forever' }>
                            <IoMdTrash />
                        </IconButton>
                    </div>
                </div>
            </div>
            <div className='overflow-auto block max-h-96 sm:max-h-[82vh] scrollbar scrollbar-thumb-blue-900 scrollbar-track-gray-800 scrollbar-thumb-rounded-full scrollbar-w-2'>
                { allFiles.length > 0
                    ? (
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="sticky top-0 w-full text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="p-4">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={ data.all }
                                                onChange={ onSelectedAllChange }
                                                value={ data.all }
                                                id="checkbox-all-search"
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                            <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3 pl-0">
                                        Name
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Owner
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Trashed Date
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        size
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Original Location
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                { allFiles.map((file, i) => (
                                    <tr key={ i } onClick={ () => onSelectFile(file) } onDoubleClick={ () => openFolder(file) }
                                        className={ `border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600
                                            ${selected[file.id] || data.all ? 'bg-blue-300 dark:bg-blue-900' : 'bg-white dark:bg-gray-800'}` }>
                                        <td className="w-4 p-4">
                                            <div className="flex items-center">
                                                <span className='text-xl'>{ selected[file.id] }</span>
                                                <input
                                                    type="checkbox"
                                                    checked={ selected[file.id] || data.all }
                                                    onChange={ () => onSelectFile(file) }
                                                    id="checkbox-table-search-1"
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                                <label htmlFor="checkbox-table-search-1" className="sr-only">checkbox</label>
                                            </div>
                                        </td>
                                        <th scope="row" className="flex items-center gap-2 px-6 py-4 pl-0 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            <FileIcon file={ file } />
                                            { file.name }
                                        </th>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            { "owner" }
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            { file.deleted_at }
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            { file.size }
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            { originalLocation(file.path) }
                                        </td>
                                    </tr>
                                )) }
                            </tbody>
                        </table>
                    )
                    : (
                        <div className='flex items-center justify-center text-lg'>
                            <span className='px-4 py-2 bg-gray-900 rounded-full shadow'>Use "Create New" button.</span>
                        </div>
                    )
                }
                <div ref={ loadMoreRef }></div>
            </div>
        </div>
    );
}

Trash.layout = (page) => <AuthLayout children={ page } />;
export default Trash;
