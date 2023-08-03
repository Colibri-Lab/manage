<?php

namespace App\Modules\Manage\Controllers;

use Colibri\App;
use Colibri\Exceptions\PermissionDeniedException;
use Colibri\IO\FileSystem\File;
use Colibri\Web\RequestCollection;
use Colibri\Web\Controller as WebController;
use Colibri\Web\PayloadCopy;
use App\Modules\Security\Module as SecurityModule;
use Colibri\Common\DateHelper;
use App\Modules\Manage\Models\Fields\RemoteFileField;

/**
 * Remove media files controller
 */
class FilesController extends WebController
{

    /**
     * Returns a file with given guid
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param PayloadCopy|null $payload
     * @return object
     */
    public function ByGuid(RequestCollection $get, RequestCollection $post, ? PayloadCopy $payload): object
    {
        if (!SecurityModule::$instance->current) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $bucket = $get->{'bucket'} ?? $post->{'bucket'};
        $guid = $get->{'guid'} ?? $post->{'guid'};
        $type = $get->{'type'} ?? $post->{'type'};

        $file = new RemoteFileField(['bucket' => $bucket, 'guid' => $guid, 'ext' => $type]);
        $path = $file->Source();
        if (!$path) {
            return $this->Finish(404, 'File not exists');
        }
        $content = File::Read(App::$webRoot . $path);
        return $this->Finish(200, $file->name, $content, 'utf-8', ['Cache-Control' => 'Public', 'Expires' => DateHelper::ToDbString(time())]);

    }

}