<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFolderRequest;
use App\Http\Resources\FileResource;
use App\Models\File;
use App\Services\FileService;

class FileController extends Controller
{
    public function __construct(protected FileService $fileService)
    {
    }

    public function myFiles()
    {
        $folder = $this->fileService->getRoot();

        $files = File::query()
            ->where('created_by', auth()->id())
            ->where('parent_id', $folder->id)
            ->orderBy('is_folder', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate();

        $files = FileResource::collection($files);

        return inertia('MyFiles', compact('folder', 'files'));
    }

    public function storeFolder(StoreFolderRequest $request)
    {
        $this->fileService->storeFolder($request);
        return back();
    }
}
