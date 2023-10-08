<?php

namespace App\Console\Commands;

use App\Models\DownloadedFile;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class DeleteZipFileCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'file:delete-zip-file';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete downloaded zip file';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $files = DownloadedFile::query()
            ->where('created_at', '<=', now()->subMinutes(30))
            ->get();

        foreach ($files as $file) {
            Storage::delete($file->storage_path);
            $file->delete();
        }
    }
}
