<?php

namespace Bga\Games\Azure\states;

use Bga\Games\Azure\Game;
use Bga\Games\Azure\Subclass;

class StateManager extends Subclass
{
    public function __construct(Game $game)
    {
        parent::__construct($game);
    }
}
