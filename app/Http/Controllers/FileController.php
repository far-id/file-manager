<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFileRequest;
use App\Http\Requests\StoreFolderRequest;
use App\Http\Resources\FileResource;
use App\Models\File;
use App\Services\FileService;
use Illuminate\Http\Request;

class FileController extends Controller
{
    public function __construct(protected FileService $fileService)
    {
    }

    public function myFiles(string $folder = null)
    {
        if ($folder) {
            $folder = File::query()
                ->where('path', $folder)
                ->where('created_by', auth()->id())
                ->firstOrFail();
        } else {
            $folder = $this->fileService->getRoot();
        }

        $files = File::query()
            ->where('created_by', auth()->id())
            ->where('parent_id', $folder->id)
            ->orderBy('is_folder', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate();

        $files = FileResource::collection($files);
        $ancestors = FileResource::collection([...$folder->ancestors, $folder]);

        return inertia('MyFiles', compact('folder', 'files', 'ancestors'));
    }

    public function storeFolder(StoreFolderRequest $request)
    {
        $this->fileService->storeFolder($request);

        return back();
    }

    public function storeFile(StoreFileRequest $request)
    {
        $this->fileService->storeFile($request);

        return back();
    }

}
