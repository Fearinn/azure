<?php

namespace Bga\Games\Azure\actions;

use Bga\Games\Azure\Game;
use Bga\Games\Azure\Subclass;

class ActionManager extends Subclass
{
    protected int $player_id;

    public function __construct(Game $game, ?int $player_id = null)
    {
        parent::__construct($game);
        $this->player_id = $player_id ? $player_id : $this->game->getActivePlayerId();
    }
}
