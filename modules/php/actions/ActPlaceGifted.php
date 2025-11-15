<?php

namespace Bga\Games\Azure\actions;

use Bga\Games\Azure\actions\ActionManager;
use Bga\Games\Azure\components\Gifted\GiftedManager;
use Bga\Games\Azure\components\Qi\QiManager;
use Bga\Games\Azure\components\Spaces\Space;
use Bga\Games\Azure\components\Stones\StoneManager;
use Bga\Games\Azure\Game;
use Bga\Games\Azure\score\ScoreManager;
use Bga\Games\Azure\stats\StatManager;

class ActPlaceGifted extends ActionManager
{
    private GiftedManager $giftedManager;
    private StoneManager $stoneManager;
    private QiManager $qiManager;
    private StatManager $statManager;
    private ScoreManager $scoreManager;

    public function __construct(Game $game)
    {
        parent::__construct($game);
        $this->giftedManager = new GiftedManager($game);
        $this->stoneManager = new StoneManager($game);
        $this->qiManager = new QiManager($game);
        $this->statManager = new StatManager($game);
        $this->scoreManager = new ScoreManager($game);
    }

    public function act(int $x, int $y): void
    {
        $Space = new Space($this->game, $x, $y);
        $this->validate($Space, $this->giftedManager);

        $domain_id = $Space->domain_id;

        $this->stoneManager->placeGifted($this->player_id, $x, $y);

        $extraCost = $this->giftedManager->getExtraCost();
        $cost = $Space->getCost($this->player_id, $extraCost);

        $this->qiManager->discardByDomain($this->player_id, $cost, $domain_id);

        $Space->gatherBoons($this->player_id);

        $discount = $Space->baseCost + $extraCost - $cost;
        $this->statManager->inc($this->player_id, STAT_DISCOUNTS_GAINED, $discount);

        if ($this->scoreManager->getHigherScore() === 25) {
            $this->game->gamestate->nextState(TR_END_GAME);
            return;
        }

        $this->game->gamestate->nextState(TR_CHECK_BEASTS);
    }

    public function validate(
        Space $Space,
        GiftedManager $GiftedManager
    ): void {
        if (!$GiftedManager->canPlay($this->player_id)) {
            throw new \BgaVisibleSystemException("You can't place a gifted stone");
        }

        $extraCost = $GiftedManager->getExtraCost();

        if (!$Space->isSelectable(
            $this->player_id,
            $extraCost
        )) {
            throw new \BgaVisibleSystemException("space unavailable");
        }
    }
}
