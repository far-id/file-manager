<x-mail::message>
# {{ $sender->name }} Shared {{ $numberOfFile }} items with you

Click button bellow to download
@foreach ($files as $file)
    <?php
        $url = route('file.emailDownloadSharedWithMe', ['ids'=>[$file->id]])
    ?>
    <x-mail::button :url="$url" :color="'primary'">
        {{ $file->name }}
    </x-mail::button>
@endforeach

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
