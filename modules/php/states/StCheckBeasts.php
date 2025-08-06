<?php

namespace Bga\Games\Azure\states;

use Bga\Games\Azure\components\Beasts\BeastManager;
use Bga\Games\Azure\Game;

class StCheckBeasts extends StateManager
{
    public function __construct(Game $game)
    {
        parent::__construct($game);
    }

    public function act(): void
    {
        $player_id = (int) $this->game->getActivePlayerId();
        $BeastManager = new BeastManager($this->game);
        $BeastManager->checkBeasts($player_id);

        $this->game->gamestate->nextState(TR_NEXT_PLAYER);
    }
}
