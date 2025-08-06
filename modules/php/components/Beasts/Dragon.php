<?php

namespace Bga\Games\Azure\components\Beasts;

use Bga\Games\Azure\components\Stones\StoneManager;
use Bga\Games\Azure\Game;

class Dragon extends Beast
{
    public function __construct(Game $game, int $beast_id)
    {
        parent::__construct($game, $beast_id);
    }
}
