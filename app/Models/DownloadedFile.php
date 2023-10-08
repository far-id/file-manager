<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DownloadedFile extends Model
{
    use HasFactory;

    protected $fillable = ['storage_path', 'created_by'];
}
