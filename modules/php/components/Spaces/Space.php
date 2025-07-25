<?php

namespace Bga\Games\Azure\components\Spaces;

use Bga\Games\Azure\Game;
use Bga\Games\Azure\Subclass;

class Space extends Subclass
{
    public function __construct(Game $game)
    {
        parent::__construct($game);
    }
}
