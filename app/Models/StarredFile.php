<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StarredFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'file_id',
        'user_id'
    ];

    public function file(): BelongsTo
    {
        return $this->belongsTo(File::class);
    }
}
