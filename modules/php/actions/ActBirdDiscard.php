<?php

namespace Bga\Games\Azure\actions;

use Bga\Games\Azure\actions\ActionManager;
use Bga\Games\Azure\components\Qi\QiManager;
use Bga\Games\Azure\Game;

class ActBirdDiscard extends ActionManager
{
    private QiManager $qiManager;

    public function __construct(Game $game)
    {
        parent::__construct($game);
        $this->qiManager = new QiManager($game);
    }

    public function act(array $cards): void
    {
        $this->validate($cards);

        $this->qiManager->discardCards($this->player_id, $cards);

        $this->game->gamestate->nextState(TR_NEXT_PLAYER);
    }

    public function validate(array $cards): void
    {
        if (count($cards) !== 2) {
            throw new \BgaVisibleSystemException("You must discard exactly 2 cards");
        }

        $hand = $this->qiManager->deck->getCardsInLocation("hand", $this->player_id);

        foreach ($cards as $card) {
            $card_id = (int) $card["id"];
            if (!array_key_exists($card_id, $hand)) {
                throw new \BgaVisibleSystemException("You don't own this card");
            }
        }
    }
}
