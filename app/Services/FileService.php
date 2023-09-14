<?php

namespace App\Services;

use App\Http\Requests\StoreFolderRequest;
use App\Models\File;

class FileService
{
    public function storeFolder(StoreFolderRequest $request)
    {
        $parent = $request->parent;

        if (!$parent) {
            $parent = $this->getRoot();
        }

        $file = new File();
        $file->is_folder = 1;
        $file->name = $request->name;

        $parent->appendNode($file);
    }

    public function getRoot(): File
    {
        return File::query()
            ->whereIsRoot()
            ->where('created_by', auth()->id())
            ->firstOrFail();
    }
}
