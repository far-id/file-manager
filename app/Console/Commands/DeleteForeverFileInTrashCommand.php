<?php

namespace App\Console\Commands;

use App\Models\File;
use App\Services\FileService;
use Illuminate\Console\Command;

class DeleteForeverFileInTrashCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'file:delete-forever-file-in-trash';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $files = File::onlyTrashed()
            ->where('deleted_at', '<=', now()->subDays(30))
            ->get();

        app(FileService::class)->forceDelete($files);
    }
}
