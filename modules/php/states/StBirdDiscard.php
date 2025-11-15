<?php

namespace Bga\Games\Azure\states;

use Bga\Games\Azure\components\Qi\QiManager;
use Bga\Games\Azure\Game;

class StBirdDiscard extends StateManager
{
    private QiManager $qiManager;

    public function __construct(Game $game)
    {
        parent::__construct($game);
        $this->qiManager = new QiManager($game);
    }

    public function act(): void
    {
        $player_id = (int) $this->game->getActivePlayerId();

        $hand = $this->qiManager->getHand($player_id);

        if (count($hand) <= 2) {
            if ($hand) {
                $this->qiManager->discardCards($player_id, $hand);
            }
            
            $this->game->gamestate->nextState(TR_NEXT_PLAYER);
            return;
        }
    }
}
