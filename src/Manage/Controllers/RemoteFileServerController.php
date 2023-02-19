<?php

namespace App\Modules\Manage\Controllers;

use Colibri\App;
use Colibri\Web\RequestCollection;
use Colibri\Web\Controller as WebController;
use App\Modules\Security\Module as SecurityModule;
use FileServerApiClient\Client;
use FileServerApiClient\AdminClient;

/**
 * Remote media files controller
 */
class RemoteFileServerController extends WebController
{
    /**
     * Returns a list of remove media library buckets
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param mixed|null $payload
     * @return object
     */
    public function ListBuckets(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.files')) {
            return $this->Finish(403, 'Permission denied');
        }

        $fsServerDomain = App::$config->Query('hosts.services.fs')->GetValue();
        $fs = new AdminClient($fsServerDomain);
        $list = $fs->ListBuckets();

        return $this->Finish(200, 'ok', $list);
    }

    /**
     * Returns a list of files in bucket
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param mixed|null $payload
     * @return object
     */
    public function ListFiles(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.files')) {
            return $this->Finish(403, 'Permission denied');
        }

        $fsServerDomain = App::$config->Query('hosts.services.fs')->GetValue();
        $fs = new AdminClient($fsServerDomain);
        $list = $fs->SearchInBucket($post->{'bucket'}, $post->{'term'}, $post->{'page'}, $post->{''});

        return $this->Finish(200, 'ok', $list);
    }

    /**
     * Creates a bucket
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param mixed|null $payload
     * @return object
     */
    public function CreateBucket(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.files')) {
            return $this->Finish(403, 'Permission denied');
        }


        $fsServerDomain = App::$config->Query('hosts.services.fs')->GetValue();
        $fs = new AdminClient($fsServerDomain);
        $bucket = $fs->CreateBucket($post->{'bucket'});

        return $this->Finish(200, 'ok', $bucket);
    }

    /**
     * Removes a bucket
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param mixed|null $payload
     * @return object
     */
    public function RemoveBucket(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.files')) {
            return $this->Finish(403, 'Permission denied');
        }

        $fsServerDomain = App::$config->Query('hosts.services.fs')->GetValue();
        $fs = new AdminClient($fsServerDomain);
        $fs->DeleteBucket($post->{'bucket'});

        $list = $fs->ListBuckets();
        return $this->Finish(200, 'ok', $list);

    }

    /**
     * Removes a file
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param mixed|null $payload
     * @return object
     */
    public function RemoveFile(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.files')) {
            return $this->Finish(403, 'Permission denied');
        }


        $bucket = $post->{'bucket'};
        $fsServerDomain = App::$config->Query('hosts.services.fs')->GetValue();
        $fs = new Client($fsServerDomain, $bucket);

        foreach ($post->{'files'} as $file) {
            $fs->DeleteObject($file);
        }

        return $this->Finish(200, 'ok', []);

    }

    /**
     * Uploads a file to bucket from request
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param mixed|null $payload
     * @return object
     */
    public function UploadFiles(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.files')) {
            return $this->Finish(403, 'Permission denied');
        }

        $bucket = $post->{'bucket'};
        $bucketname = $post->{'bucketname'};
        $fsServerDomain = App::$config->Query('hosts.services.fs')->GetValue();
        $fs = new Client($fsServerDomain, $bucket);
        $fsAdmin = new AdminClient($fsServerDomain);

        $files = App::$request->files;
        foreach ($files as $file) {
            $ff = $fs->PutObject($file->binary, $file->name);
            $ffa = $fsAdmin->SearchInBucket($bucketname, $ff->guid);
            $filesArray[] = reset($ffa);
        }


        return $this->Finish(200, 'ok', $filesArray);

    }

}