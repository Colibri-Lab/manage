<?php

namespace App\Modules\Manage\Controllers;

use Colibri\App;
use Colibri\Exceptions\PermissionDeniedException;
use Colibri\IO\Request\Request;
use Colibri\Web\RequestCollection;
use Colibri\Web\Controller as WebController;
use App\Modules\Security\Module as SecurityModule;
use Colibri\IO\Request\Type;
use Colibri\Web\PayloadCopy;
use FileServerApiClient\Client;
use FileServerApiClient\AdminClient;
use InvalidArgumentException;

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
    public function ListBuckets(RequestCollection $get, RequestCollection $post, ?PayloadCopy $payload = null): object
    {
        
        if (!SecurityModule::Instance()->current) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        if (!SecurityModule::Instance()->current->IsCommandAllowed('tools.files')) {
            throw new PermissionDeniedException('Permission denied', 403);
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
    public function ListFiles(RequestCollection $get, RequestCollection $post, ?PayloadCopy $payload = null): object
    {

        if (!SecurityModule::Instance()->current) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        if (!SecurityModule::Instance()->current->IsCommandAllowed('tools.files')) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $fsServerDomain = App::$config->Query('hosts.services.fs')->GetValue();
        $fs = new AdminClient($fsServerDomain);
        $list = $fs->SearchInBucket($post->{'bucket'}, $post->{'term'}, $post->{'page'} ?? 1, $post->{'pagesize'} ?? 20);

        return $this->Finish(200, 'ok', $list);
    }

    /**
     * Creates a bucket
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param mixed|null $payload
     * @return object
     */
    public function CreateBucket(RequestCollection $get, RequestCollection $post, ?PayloadCopy $payload = null): object
    {

        if (!SecurityModule::Instance()->current) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        if (!SecurityModule::Instance()->current->IsCommandAllowed('tools.files')) {
            throw new PermissionDeniedException('Permission denied', 403);
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
    public function RemoveBucket(RequestCollection $get, RequestCollection $post, ?PayloadCopy $payload = null): object
    {

        if (!SecurityModule::Instance()->current) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        if (!SecurityModule::Instance()->current->IsCommandAllowed('tools.files')) {
            throw new PermissionDeniedException('Permission denied', 403);
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
    public function RemoveFile(RequestCollection $get, RequestCollection $post, ?PayloadCopy $payload = null): object
    {

        if (!SecurityModule::Instance()->current) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        if (!SecurityModule::Instance()->current->IsCommandAllowed('tools.files')) {
            throw new PermissionDeniedException('Permission denied', 403);
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
    public function UploadFiles(RequestCollection $get, RequestCollection $post, ?PayloadCopy $payload = null): object
    {

        if (!SecurityModule::Instance()->current) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        if (!SecurityModule::Instance()->current->IsCommandAllowed('tools.files')) {
            throw new PermissionDeniedException('Permission denied', 403);
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

    /**
     * Import the file from url
     * @param RequestCollection $get данные GET
     * @param RequestCollection $post данные POST
     * @param ?PayloadCopy $payload данные payload обьекта переданного через POST/PUT
     * @return object
     */
    public function ImportFile(RequestCollection $get, RequestCollection $post, ?PayloadCopy $payload = null): object
    {

        $result = [];
        $message = 'Result message';
        $code = 200;

        
        $url = $post->url;
        $bucket = $post->bucket;

        if(!$url) {
            throw new InvalidArgumentException('URL is required');
        }

        if(!$bucket) {
            throw new InvalidArgumentException('Bucket is required');
        }

        $request = new Request($url, Type::Get);
        $request->timeout = 15;
        $response = $request->Execute();
        if($response->status != 200) {
            throw new InvalidArgumentException('Failed to fetch file from URL: ' . $response->status);
        }

        $bucket = $post->{'bucket'};
        $fsServerDomain = App::$config->Query('hosts.services.fs')->GetValue();
        $fs = new Client($fsServerDomain, $bucket);
        $stat = $fs->PutObject($response->data, basename($url));

        $result = [
            'stat' => $stat
        ];
        
        return $this->Finish(
            $code,
            $message,
            $result,
            'utf-8'
        );

    }


    
}