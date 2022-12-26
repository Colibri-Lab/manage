<?php


/**
 * Search
 *
 * @author Author Name <author.name@action-media.ru>
 * @copyright 2019 Colibri
 * @package App\Modules\Manage
 */
namespace App\Modules\Manage;

use Colibri\App;
use Colibri\Modules\Module as BaseModule;
use Colibri\Utils\Debug;
use App\Modules\Manage\Controllers\Controller;
use Colibri\Utils\Menu\Item;
use Colibri\Events\EventsContainer;
use Colibri\IO\FileSystem\File;
use Colibri\Common\NoLangHelper;
use Colibri\Utils\Logs\Logger;

/**
 * Описание модуля
 * @package App\Modules\Manage
 * 
 * 
 */
class Module extends BaseModule
{

    /**
     * Синглтон
     *
     * @var Module
     */
    public static $instance = null;


    /**
     * Инициализация модуля
     * @return void
     */
    public function InitializeModule(): void
    {
        self::$instance = $this;

        App::$instance->HandleEvent(EventsContainer::BundleFile, function ($event, $args) {
            $file = new File($args->file);
            if (in_array($file->extension, ['html', 'js'])) {
                // компилируем html в javascript
                $args->content = NoLangHelper::ParseString($args->content);
            }
            return true;
        });
        
    }

	/**
	 * Вызывается для получения Меню болванкой
	 */
    public function GetTopmostMenu(): Item|array|null {

        return null;

    }

	public function GetPermissions(): array
    {

        $permissions = parent::GetPermissions();

        $permissions['manage'] = '#{manage-permissions}';

        return $permissions;
    }

    public function Backup(Logger $logger, string $path) {
        // Do nothing        
    }
}
