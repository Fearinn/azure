<?php

namespace Bga\Games\Azure\states;

use Bga\Games\Azure\components\Beasts\Bird;
use Bga\Games\Azure\Game;

class StBetweenPlayers extends StateManager
{
    public function __construct(Game $game)
    {
        parent::__construct($game);
    }

    public function act(): void
    {
        $player_id = (int) $this->game->getActivePlayerId();
        $this->game->giveExtraTime($player_id);

        $this->game->azr_activeNextPlayer();
        $this->game->gamestate->nextState(TR_NEXT_PLAYER);
    }
}
