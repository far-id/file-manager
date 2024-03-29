<?php

namespace App\Http\Controllers;

use App\Http\Requests\FileActionRequest;
use App\Http\Requests\RenameFileRequest;
use App\Http\Requests\SharedFileActionRequest;
use App\Http\Requests\ShareFileRequest;
use App\Http\Requests\StoreFileRequest;
use App\Http\Requests\StoreFolderRequest;
use App\Http\Requests\TrashFileRequest;
use App\Http\Resources\FileResource;
use App\Models\File;
use App\Models\User;
use App\Services\FileService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

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
        $data = $request->validated();
        $parent = $request->parent;

        $all = $data['all'] ?? false;
        $ids = $data['ids'] ?? [];

        if (!$all && empty($ids)) {
            return ['message' => 'please select files to download'];
        }

        if ($all) {
            $url = $this->fileService->createZip($parent->children);
            $filename = $parent->name . '.zip';
        } else {
            [$url, $filename] = $this->fileService->getDownloadUrl($ids, $parent->name);
        }

        return [
            'url' => $url,
            'filename' => $filename
        ];
    }

    public function downloadSharedWithMe(SharedFileActionRequest $request): array
    {
        $data = $request->validated();

        $all = $data['all'] ?? false;
        $ids = $data['ids'] ?? [];
        $parent_ulid = $request->parent_ulid;

        if (!$all && empty($ids)) {
            return ['message' => 'please select files to download'];
        }

        if ($all) {
            if ($parent_ulid) {
                $folder = File::where('ulid', $parent_ulid)->firstOrFail();

                $url = $this->fileService->createZip($folder->children);
                $filename = $folder->name . '.zip';
            } else {
                $files = File::whereHas('shared', function ($q) {
                    $q->where('user_id', auth()->id());
                })->get();

                $url = $this->fileService->createZip($files);
                $filename = 'shared_with_me.zip';
            }
        } else {
            [$url, $filename] = $this->fileService->getDownloadUrl($ids, 'shared_with_me');
        }

        return [
            'url' => $url,
            'filename' => $filename
        ];
    }

    public function emailDownloadSharedWithMe(SharedFileActionRequest $request)
    {
        return redirect()->to($this->downloadSharedWithMe($request)['url']);
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

    public function share(ShareFileRequest $request)
    {
        $data = $request->validated();
        $parent = $request->parent;

        $user = User::whereEmail($data['email'])->first();
        if ($data['all']) {
            $files = $parent->children;
        } else {
            $files = File::whereIn('id', $data['ids'])->get();
        }

        $this->fileService->share($files, $user->id);

        Mail::to($data['email'])->send(new \App\Mail\SharedFileWithYou(auth()->user(), $files));

        return back();
    }

    public function sharedWithMe(string $folder = null)
    {
        $files = File::whereHas('shared', function ($q) {
            $q->where('user_id', auth()->id());
        });

        if ($folder) {
            $folder = $this->fileService->travelDescendants($files, $folder);
            abort_if($folder == null, 404);
            $files = File::where('parent_id', $folder->id);
        }

        $files = $files->orderBy('is_folder', 'desc')
        ->orderBy('created_at', 'desc')
        ->paginate(10);

        $files = FileResource::collection($files);

        return inertia('SharedWithMe', compact('files', 'folder'));
    }
}
