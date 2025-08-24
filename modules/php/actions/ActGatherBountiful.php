<?php

namespace Bga\Games\Azure\actions;

use Bga\Games\Azure\actions\ActionManager;
use Bga\Games\Azure\components\Qi\QiManager;
use Bga\Games\Azure\components\Spaces\Space;
use Bga\Games\Azure\components\Spaces\SpaceManager;
use Bga\Games\Azure\components\Wisdom\WisdomManager;
use Bga\Games\Azure\Game;
use Bga\Games\Azure\notifications\NotifManager;
use Bga\Games\Azure\score\ScoreManager;

class ActGatherBountiful extends ActionManager
{
    public function __construct(Game $game)
    {
        parent::__construct($game);
    }

    public function act(string $boon): void
    {
        $space_id = $this->globals->get(G_BOUNTIFUL_SPACE);
        $SpaceManager = new SpaceManager($this->game);
        $Space = $SpaceManager->getById($space_id);

        $this->validate($Space, $boon);

        $Notify = new NotifManager($this->game);
        $Notify->all(
            "message",
            '${player_name} triggers his Bountiful stone',
            [],
            $this->player_id
        );

        if ($boon === "qi") {
            $QiManager = new QiManager($this->game);
            $QiManager->gather($this->player_id, $Space->qi_color, 1);
        }

        if ($boon === "wisdom") {
            $WisdomManager = new WisdomManager($this->game);
            $WisdomManager->inc($this->player_id, 1);

            $ScoreManager = new ScoreManager($this->game);
            if ($ScoreManager->getHigherScore() === 25) {
                $this->game->gamestate->nextState(TR_END_GAME);
                return;
            }
        }

        $this->game->gamestate->nextState(TR_CHECK_BEASTS);
    }

    public function validate(Space $Space, string $boon): void
    {
        $isValid = true;

        if ($boon === "qi" && $Space->qi === 0) {
            $isValid === false;
        }

        if ($boon === "wisdom" && $Space->wisdom === 0) {
            $isValid === false;
        }

        if (!$isValid) {
            throw new \BgaVisibleSystemException("Invalid additional boon");
        }
    }
}
