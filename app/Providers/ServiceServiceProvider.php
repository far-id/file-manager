<?php

namespace App\Providers;

use App\Services\FileService;
use App\Services\Interface\FileServiceInterface;
use Illuminate\Support\ServiceProvider;

class ServiceServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $this->app->bind(FileServiceInterface::class, FileService::class);
    }
}
