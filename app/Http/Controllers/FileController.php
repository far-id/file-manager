<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFolderRequest;
use App\Models\File;
use App\Services\FileService;

class FileController extends Controller
{
    public function __construct(protected FileService $fileService)
    {
    }

    public function myFiles()
    {
        return inertia('MyFiles');
    }

    public function storeFolder(StoreFolderRequest $request)
    {
        $this->fileService->storeFolder($request);
        return back();
    }
}
