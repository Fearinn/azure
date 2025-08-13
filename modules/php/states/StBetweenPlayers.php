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
        $pendingBird = $this->globals->get(G_PENDING_BIRD);
        if ($pendingBird) {
            $Bird = new Bird($this->game);
            $Bird->execFavor($pendingBird);

            $this->game->gamestate->nextState(TR_NEXT_PLAYER);
            return;
        }

        $player_id = (int) $this->game->getActivePlayerId();
        $this->game->giveExtraTime($player_id);

        $this->game->azr_activeNextPlayer();
        $this->game->gamestate->nextState(TR_NEXT_PLAYER);
    }
}
