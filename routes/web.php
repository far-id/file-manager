<?php

use App\Http\Controllers\FileController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::controller(FileController::class)
    ->middleware(['auth', 'verified'])
    ->group(function () {
    Route::get('my-files/{folder?}', 'myFiles')
        ->where('folder', '(.*)')
        ->name('file.myFiles');
    Route::post('folder', 'storeFolder')->name('folder.store');
    Route::post('file', 'storeFile')->name('file.store');
    Route::delete('file', 'destroy')->name('file.destroy');
    Route::delete('file/delete-forever', 'deleteForever')->name('file.deleteForever');
    Route::patch('file/restore', 'restore')->name('file.restore');
    Route::get('file/download', 'download')->name('file.download');
    Route::patch('file/rename/{file}', 'rename')->name('file.rename');
    Route::post('file/favorite', 'favorite')->name('file.favorite');
    Route::get('trash', 'trash')->name('file.trash');
    Route::post('file/share', 'share')->name('file.share');
    Route::get('shared-with-me/{folder?}', 'sharedWithMe')
    ->where('folder', '(.*)')
    ->name('file.sharedWithMe');
    Route::get('file/download-shared-with-me', 'downloadSharedWithMe')->name('file.downloadSharedWithMe');
    Route::get('file/email/download-shared-with-me', 'emailDownloadSharedWithMe')->name('file.emailDownloadSharedWithMe');
    });

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
