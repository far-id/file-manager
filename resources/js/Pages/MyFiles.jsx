import FileIcon from '@/Components/App/FileIcon';
import { httpGet } from '@/Helper/http-helper';
import AuthLayout from '@/Layouts/AuthLayout';
import { RELOAD_AFTER_UPLOAD, emitter } from '@/event-but';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import { BsPersonPlusFill } from 'react-icons/bs';
import { HiOutlineDownload } from 'react-icons/hi';
import { IoMdClose, IoMdTrash } from 'react-icons/io';

const IconButton = ({ children, title = '', className = '', ...props }) => {
    const [popOver, setPopOver] = useState(false);
    return (
        <div className='flex items-center justify-center' onMouseEnter={ () => setPopOver(true) } onMouseLeave={ () => setPopOver(false) }>
            <button
                { ...props }
                type='button'
                className={
                    `px-2 py-2 bg-transparent rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none active:ring-2 active:ring-indigo-500 active:ring-offset-2 dark:active:ring-offset-gray-800 transition ease-in-out duration-150 inline-flex items-center font-semibold text-md text-gray-700 dark:text-gray-300 `
                    + className
                }
            >
                { children }
            </button>

            <div className={ `transition-all ease-in-out absolute mt-[3.25rem] z-10 ${popOver ? 'delay-71r00 visible' : 'invisible'}` }>
                <span className='w-full rounded-md p-1 bg-slate-900 text-xs text-gray-100 font-thin tracking-tight'>{ title }</span>
            </div>
        </div >
    );
}

function MyFiles({ files, ancestors }) {
    const { folder } = usePage().props
    const [allFiles, setAllFiles] = useState([...files.data]);
    const [selected, setSelected] = useState({});

    const loadMoreRef = useRef();
    const nextPage = useRef(files.links.next);
    const { data, setData, delete: destroy, reset } = useForm({
        all: false,
        ids: [],
        parent_id: folder.id,
    })

    const openFolder = (file) => {
        if (!file.is_folder) {
            return;
        }
        router.visit(route('file.myFiles', { folder: file.path }));
    }

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

    const deleteSelectedFile = () => {
        destroy(route('file.destroy'), {
            onFinish: () => {
                reset();
                reloadPage();
                setSelected({});
            }
        });
    };

    const downloadSelectedFile = () => {
        if (!data.all && data.ids.length === 0) {
            retrun;
        }

        const params = new URLSearchParams();
        if (folder?.id) {
            params.append('parent_id', folder?.id);
        }

        if (data.all) {
            params.append('all', data.all ? 1 : 0);
        } else {
            for (const id of data.ids) {
                params.append('ids[]', id);
            }
        };

        httpGet(route('file.download') + '?' + params.toString())
            .then(res => {
                if (!res.url) return;

                const a = document.createElement('a');
                a.download = res.filename;
                a.href = res.url;
                a.click();
            });
    }

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

    const reloadPage = () => {
        httpGet(window.location.href).then(res => {
            setAllFiles([...res.data]);
            nextPage.current = res.links.next;
        });
    };

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
        <>
            <div className="relative shadow-md sm:rounded-lg">
                <div className="flex items-center justify-between pb-4">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-1 md:space-x-3">
                            <li className="inline-flex items-center">
                                <Link href={ route('file.myFiles') } className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white">
                                    <svg className="w-3 h-3 mr-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
                                    </svg>
                                    Home
                                </Link>
                            </li>
                            { ancestors.data.filter((anchestor) => anchestor.parent_id != null).map((anchestor, i) => (
                                <li key={ i } onClick={ () => openFolder(anchestor) }>
                                    <div className="flex items-center">
                                        <svg className="w-3 h-3 mx-1 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="m1 9 4-4-4-4" />
                                        </svg>
                                        <span href="#"
                                            className={ `
                                            ${i + 1 !== ancestors.data.length && 'hover:text-blue-600 dark:hover:text-white'}
                                            ml-1 text-sm font-medium text-gray-700  md:ml-2 dark:text-gray-400 ` }
                                        >{ anchestor.name }
                                        </span>
                                    </div>
                                </li>
                            )) }
                        </ol>
                    </nav>
                    <div className={ `relative ${data.ids.length < 1 && 'invisible'}` }>
                            <div className="flex items-center px-2 rounded-full bg-gray-700/60 gap-x-1">
                            <IconButton onClick={ cancelSelect } title={ 'Unselect' }>
                                    <IoMdClose />
                                </IconButton>
                            <span className='text-xs'>{ data.ids.length } selected</span>
                            <IconButton title={ 'Share' }>
                                    <BsPersonPlusFill />
                                </IconButton>
                            <IconButton onClick={ deleteSelectedFile } title={ 'Move to trash' }>
                                    <IoMdTrash />
                                </IconButton>
                            <IconButton onClick={ downloadSelectedFile } title={ 'Download' }>
                                    <HiOutlineDownload />
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
                                            Last Modified
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            size
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
                                                { file.updated_at }
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                { file.size }
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

        </>
    );
}

MyFiles.layout = (page) => <AuthLayout children={ page } />;
export default MyFiles;
