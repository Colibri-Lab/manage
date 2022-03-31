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
    }

	/**
	 * Вызывается для получения Меню болванкой
	 */
    public function GetTopmostMenu(): Item|array|null {

        return Item::Create('more', 'ЕЩЕ', 'blue', false, '')->Add(
            Item::Create('manage', 'Инструменты', '', false, '')->Add(
                Item::Create('backup', 'Слепки системы', '', false, 'Manage.RouteTo("/backup/")')
            )->Add(
                Item::Create('execute', 'Выполнить', '', false, 'Manage.RouteTo("/execute/")')
        ));

    }

	public function GetPermissions(): array
    {

        $permissions = parent::GetPermissions();

        $permissions['manage'] = 'Инструменты';
        $permissions['manage.backup'] = 'Доступ к системе восстановления';
        $permissions['manage.backup.create'] = 'Создание точки восстановления';
        $permissions['manage.backup.restore'] = 'Восстановление из точки';
        $permissions['manage.execute'] = 'Выполнение скриптов';

        return $permissions;
    }

}
