<?php

namespace Bga\Games\Azure\states;

use Bga\Games\Azure\components\Beasts\Bird;
use Bga\Games\Azure\Game;
use Bga\Games\Azure\notifications\NotifManager;

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
            $player_id = $pendingBird;
        } else {
            $player_id = (int) $this->game->getActivePlayerId();
            $this->game->giveExtraTime($player_id);
            $this->game->activeNextPlayer();
        }

        $Notify = new NotifManager($this->game);
        $Notify->all(
            "message",
            clienttranslate('${player_name} ends his turn'),
            [],
            $player_id,
        );

        $this->game->gamestate->nextState(TR_NEXT_PLAYER);
    }
}
