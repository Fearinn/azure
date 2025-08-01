<?php

namespace Bga\Games\Azure\states;

use Bga\Games\Azure\Game;
use Bga\Games\Azure\Subclass;
use GameState;


class StateManager extends Subclass
{
    public readonly GameState $gamestate;

    public function __construct(Game $game)
    {
        parent::__construct($game);
    }
}
