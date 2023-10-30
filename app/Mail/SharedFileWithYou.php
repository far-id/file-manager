<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Kalnoy\Nestedset\Collection as KalnoyFile;

class SharedFileWithYou extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public int $numberOfFile;
    public function __construct(
        public User $sender,
        public KalnoyFile $files
    ) {
        $this->numberOfFile = count($files);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address($this->sender->email, $this->sender->name),
            subject: $this->numberOfFile > 1
                ? $this->numberOfFile . ' items shared with You'
                : ($this->files[0]->mime ?? 'folder') . ' shared with You: "' . $this->files[0]->name . '"',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.files.shared',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
