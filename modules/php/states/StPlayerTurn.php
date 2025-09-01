<?php

namespace Bga\Games\Azure\states;

use Bga\Games\Azure\components\Gifted\GiftedManager;
use Bga\Games\Azure\components\Spaces\SpaceManager;
use Bga\Games\Azure\components\Stones\StoneManager;
use Bga\Games\Azure\Game;
use Bga\Games\Azure\notifications\NotifManager;
use Bga\Games\Azure\score\ScoreManager;

class StPlayerTurn extends StateManager
{
    public function __construct(Game $game)
    {
        parent::__construct($game);
    }

    public function getArgs(): array
    {
        $player_id = (int) $this->game->getActivePlayerId();

        $SpaceManager = new SpaceManager($this->game);
        $selectableSpaces = $SpaceManager->getSelectable($player_id);
        $selectableGifted = $SpaceManager->getSelectableGifted($player_id);
        $GiftedManager = new GiftedManager($this->game);

        $StoneManager = new StoneManager($this->game);
        $stoneHandCount = $StoneManager->getHandCount($player_id);

        $loseGame = !$GiftedManager->canPlay($player_id) && ($stoneHandCount === 0 || !$selectableSpaces);

        $args = [
            "_private" => [
                "active" => [
                    "selectableSpaces" => $selectableSpaces,
                    "selectableGifted" => $selectableGifted,
                    "canPlayGifted" => $GiftedManager->canPlay($player_id),
                ],
            ],
            "no_notify" => $loseGame,
            "bonds" => $SpaceManager->getPlayersBonds($player_id),
        ];

        return $args;
    }

    public function act(): void
    {
        $player_id = (int) $this->game->getActivePlayerId();
        $args = $this->getArgs();

        if ($args["no_notify"]) {
            $ScoreManager = new ScoreManager($this->game);
            $ScoreManager->setScore($player_id, -1);

            $Notify = new NotifManager($this->game);
            $Notify->all(
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
