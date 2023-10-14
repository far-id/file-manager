<?php

namespace App\Http\Controllers;

use App\Http\Requests\FileActionRequest;
use App\Http\Requests\RenameFileRequest;
use App\Http\Requests\StoreFileRequest;
use App\Http\Requests\StoreFolderRequest;
use App\Http\Requests\TrashFileRequest;
use App\Http\Resources\FileResource;
use App\Models\File;
use App\Models\StarredFile;
use App\Services\FileService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FileController extends Controller
{
    public function __construct(protected FileService $fileService)
    {
    }

    public function myFiles(Request $request, string $folder = null)
    {
        if ($folder) {
            $folder = File::with('starred')
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
        ->paginate(10);

        $files = FileResource::collection($files);

        if ($request->wantsJson()) {
            return $files;
        }

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

    public function destroy(FileActionRequest $request)
    {
        $this->fileService->destroy($request);

        return back();
    }

    public function download(FileActionRequest $request): array
    {
        return $this->fileService->download($request);
    }

    public function trash(Request $request)
    {
        $files = File::onlyTrashed()
            ->where('created_by', auth()->id())
            ->orderBy('is_folder', 'desc')
            ->orderBy('deleted_at', 'desc')
            ->orderBy('files.id', 'desc')
            ->paginate(10);

        $files = FileResource::collection($files);

        if ($request->wantsJson()) {
            return $files;
        }

        return inertia('Trash', compact('files'));
    }

    public function deleteForever(TrashFileRequest $request)
    {
        $data = $request->validated();

        if ($data['all']) {
            $files = File::onlyTrashed()->get();
        } else {
            $files = File::onlyTrashed()->whereIn('id', $data['ids'] ?? [])->get();
        }

        $this->fileService->deleteForever($files);

        return back();
    }

    public function restore(TrashFileRequest $request)
    {
        $data = $request->validated();

        if ($data['all']) {
            $files = File::onlyTrashed()->get();
        } else {
            $files = File::onlyTrashed()->whereIn('id', $data['ids'] ?? [])->get();
        }

        $this->fileService->restore($files);

        return back();
    }

    public function rename(RenameFileRequest $request, File $file)
    {
        $newPath = explode('/', $file->path);
        $indexRenamePath = count($newPath) - 1;
        $newPath[$indexRenamePath] = str($request->name)->slug();
        $newPath = implode('/', $newPath);

        $mime = $file->is_folder ? '' : explode('/', $file->mime)[1];
        $name = $request->name . '.' . $mime;

        DB::transaction(function ()
        use ($file, $request, $newPath, $name, $mime) {
            if ($file->is_folder) {
                $name = $request->name;
                $this->fileService->renameDescendants($file->descendants, $newPath);
            }

            $file->update([
                'name' => $name,
                'path' => $newPath . $mime
            ]);
        });

        return back();
    }

    public function favorite(FileActionRequest $request)
    {
        $this->fileService->favorite($request->id);

        return back();
    }
}
