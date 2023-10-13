<?php

namespace App\Observers;

use App\Models\File;
use Illuminate\Support\Facades\Storage;

class FileObserver
{
    /**
     * Handle the File "created" event.
     */
    public function creating(File $file): void
    {
        $file->created_by = auth()->id();
        $file->updated_by = auth()->id();

        if (!$file->parent) {
            return;
        }

        $file->path = (!$file->parent->isRoot() ? $file->parent->path . '/' : '') . str()->slug($file->name);
    }

    /**
     * Handle the File "updated" event.
     */
    public function updating(File $file): void
    {
        $file->updated_by = auth()->id();
    }

    /**
     * Handle the File "restored" event.
     */
    public function restored(File $file): void
    {
        //
    }
}
