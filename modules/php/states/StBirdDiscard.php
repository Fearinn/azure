<?php

namespace Bga\Games\Azure\states;

use Bga\Games\Azure\components\Qi\QiManager;
use Bga\Games\Azure\Game;

class StBirdDiscard extends StateManager
{
    public function __construct(Game $game)
    {
        parent::__construct($game);
    }

    public function act(): void
    {
        $player_id = (int) $this->game->getActivePlayerId();

        $QiManager = new QiManager($this->game);
        $hand = $QiManager->getHand($player_id);

        if (count($hand) <= 2) {
            if ($hand) {
                $QiManager->discardCards($player_id, $hand);
            }
            
            $this->game->gamestate->nextState(TR_NEXT_PLAYER);
            return;
        }
    }
}
