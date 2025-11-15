<?php

namespace Bga\Games\Azure\states;

use Bga\Games\Azure\components\Gifted\GiftedManager;
use Bga\Games\Azure\components\Spaces\SpaceManager;
use Bga\Games\Azure\components\Stones\StoneManager;
use Bga\Games\Azure\Game;
use Bga\Games\Azure\Notif;

use Bga\Games\Azure\score\ScoreManager;

class StPlayerTurn extends StateManager
{
    private SpaceManager $spaceManager;
    private GiftedManager $giftedManager;
    private StoneManager $stoneManager;
    private ScoreManager $scoreManager;
    use Notif;

    public function __construct(Game $game)
    {
        parent::__construct($game);
        $this->spaceManager = new SpaceManager($game);
        $this->giftedManager = new GiftedManager($game);
        $this->stoneManager = new StoneManager($game);
        $this->scoreManager = new ScoreManager($game);
    }

    public function getArgs(?int $player_id = null): array
    {
        if (!$player_id) {
            $player_id = (int) $this->game->getActivePlayerId();
        }

        $selectableSpaces = $this->spaceManager->getSelectable($player_id);
        $selectableGifted = $this->spaceManager->getSelectableGifted($player_id);

        $stoneHandCount = $this->stoneManager->getHandCount($player_id);

        $loseGame = !$this->giftedManager->canPlay($player_id) && ($stoneHandCount === 0 || !$selectableSpaces);

        $args = [
            "_private" => [
                "active" => [
                    "selectableSpaces" => $selectableSpaces,
                    "selectableGifted" => $selectableGifted,
                    "canPlayGifted" => $this->giftedManager->canPlay($player_id),
                ],
            ],
            "_no_notify" => $loseGame,
            "bonds" => $this->spaceManager->getPlayersBonds($player_id),
        ];

        return $args;
    }

    public function act(): void
    {
        $player_id = (int) $this->game->getActivePlayerId();
        $args = $this->getArgs();

        if ($args["_no_notify"]) {
            $this->scoreManager->setScore($player_id, -1);

            $this->notifAll(
                "message",
                clienttranslate('${player_name} could not play a stone'),
                [],
                $player_id,
            );

            $this->game->gamestate->nextState(TR_END_GAME);
            return;
        }
    }
}
