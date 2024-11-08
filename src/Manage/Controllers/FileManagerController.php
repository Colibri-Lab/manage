<?php

namespace App\Modules\Manage\Controllers;


use Colibri\App;
use Colibri\Exceptions\PermissionDeniedException;
use Colibri\IO\FileSystem\File;
use Colibri\Web\RequestCollection;
use Colibri\Web\Controller as WebController;
use App\Modules\Security\Module as SecurityModule;
use Colibri\IO\FileSystem\Finder;
use Colibri\IO\FileSystem\Directory;

/**
 * File manager controller
 */
class FileManagerController extends WebController
{
    /**
     * Returns a list of directories in given path
     * @param mixed $path
     * @return array
     */
    private function _listAllDirectories($path)
    {
        $path = str_replace('//', '/', $path);
        $rootPath = App::$webRoot;
        $foldersArray = [];
        $di = new Finder();
        $directories = $di->DirectoriesRecursive($path);
        foreach ($directories as $directory) {
            $folder = $directory->ToArray();
            $folder['path'] = '/' . str_replace($rootPath, '', $folder['path']);
            $folder['parent'] = '/' . str_replace($rootPath, '', $folder['parent']);
            $foldersArray[] = $folder;
        }
        return $foldersArray;
    }

    /**
     * Returns a list of files in given path
     * @param mixed $path
     * @param mixed $term
     * @return array
     */
    private function _listAllFiles($path, $term = '')
    {
        $path = str_replace('//', '/', $path);
        $rootPath = App::$webRoot;
        $filesArray = [];
        $di = new Finder();
        $files = $di->Files($path, $term ? '/.*' . $term . '.*/' : '');
        foreach ($files as $file) {
            $f = $file->ToArray();
            $f['path'] = '/' . str_replace($rootPath, '', $f['path']);
            $f['parent'] = '/' . str_replace($rootPath, '', $path);
            $filesArray[] = $f;
        }
        return $filesArray;
    }

    /**
     * Returns a list of folders recursively
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param mixed|null $payload
     * @return object
     */
    public function Folders(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if (!SecurityModule::$instance->current) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.files')) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $parentPath = $post->{'path'};
        $rootPath = App::$webRoot;
        $resPath = $rootPath . App::$config->Query('res')->GetValue();

        $foldersArray = $foldersArray = $this->_listAllDirectories($resPath . $parentPath);
        return $this->Finish(200, 'ok', $foldersArray);
    }

    /**
     * Returns a list of files
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param mixed|null $payload
     * @return object
     */
    public function Files(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if (!SecurityModule::$instance->current) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.files')) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $term = $post->{'term'};
        $parentPath = $post->{'path'};
        $rootPath = App::$webRoot;

        $filesArray = $this->_listAllFiles($rootPath . $parentPath, $term);
        return $this->Finish(200, 'ok', $filesArray);
    }

    /**
     * Creates a folder
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param mixed|null $payload
     * @return object
     */
    public function CreateFolder(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if (!SecurityModule::$instance->current) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.files')) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $folderPath = $post->{'path'};
        $rootPath = App::$webRoot;

        Directory::Create($rootPath . $folderPath, true);

        $di = new Directory($rootPath . $folderPath);
        $diArray = $di->ToArray();
        $diArray['path'] = str_replace($rootPath, '', $diArray['path']);
        $diArray['parent'] = str_replace($rootPath, '', $diArray['parent']);

        return $this->Finish(200, 'ok', $diArray);
    }

    /**
     * Renames a folder
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param mixed|null $payload
     * @return object
     */
    public function RenameFolder(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if (!SecurityModule::$instance->current) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.files')) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $folderPathFrom = $post->{'pathFrom'};
        $folderPathTo = $post->{'pathTo'};
        $rootPath = App::$webRoot;
        $resPath = $rootPath . App::$config->Query('res')->GetValue();

        Directory::Move($rootPath . $folderPathFrom, $rootPath . $folderPathTo);

        $foldersArray = $this->_listAllDirectories($resPath);
        return $this->Finish(200, 'ok', $foldersArray);

    }

    /**
     * Removes a folder
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param mixed|null $payload
     * @return object
     */
    public function RemoveFolder(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if (!SecurityModule::$instance->current) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.files')) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $folderPath = $post->{'path'};
        $rootPath = App::$webRoot;
        $resPath = $rootPath . App::$config->Query('res')->GetValue();

        Directory::Delete($rootPath . $folderPath);

        $foldersArray = $this->_listAllDirectories($resPath);
        return $this->Finish(200, 'ok', $foldersArray);

    }

    /**
     * Renames a file
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param mixed|null $payload
     * @return object
     */
    public function RenameFile(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if (!SecurityModule::$instance->current) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.files')) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $path = $post->{'path'};
        $nameFrom = $post->{'nameFrom'};
        $nameTo = $post->{'nameTo'};
        $rootPath = App::$webRoot;

        File::Move($rootPath . $path . $nameFrom, $rootPath . $path . $nameTo);

        $filesArray = $this->_listAllFiles($rootPath . $path);
        return $this->Finish(200, 'ok', $filesArray);

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
            throw new PermissionDeniedException('Permission denied', 403);
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.files')) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $rootPath = App::$webRoot;

        $filePath = $post->{'path'};
        if (is_array($filePath)) {
            $folderPath = null;
            foreach ($filePath as $f) {
                $file = new File($rootPath . $f);
                $folderPath = str_replace($file->name, '', $file->path);
                File::Delete($rootPath . $f);
            }
        } else {
            $file = new File($rootPath . $filePath);
            $folderPath = str_replace($file->name, '', $file->path);
            File::Delete($rootPath . $filePath);
        }

        $filesArray = $this->_listAllFiles($folderPath);
        return $this->Finish(200, 'ok', $filesArray);

    }

    /**
     * Uploads a file from request
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param mixed|null $payload
     * @return object
     */
    public function UploadFiles(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if (!SecurityModule::$instance->current) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.files')) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $rootPath = App::$webRoot;
        $path = $post->{'path'};
        $filesArray = [];

        $files = App::$request->files;
        foreach ($files as $file) {
            $file->MoveTo($rootPath . $path . $file->name);
            $f = new File($rootPath . $path . $file->name);
            $ff = $f->ToArray();
            $ff['path'] = str_replace($rootPath, '', $ff['path']);
            $ff['parent'] = $path;
            $filesArray[] = $ff;
        }

        return $this->Finish(200, 'ok', $filesArray);

    }



}