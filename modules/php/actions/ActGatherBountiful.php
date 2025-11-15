<?php

namespace Bga\Games\Azure\actions;

use Bga\Games\Azure\actions\ActionManager;
use Bga\Games\Azure\components\Qi\QiManager;
use Bga\Games\Azure\components\Spaces\Space;
use Bga\Games\Azure\components\Spaces\SpaceManager;
use Bga\Games\Azure\components\Wisdom\WisdomManager;
use Bga\Games\Azure\Game;
use Bga\Games\Azure\score\ScoreManager;

class ActGatherBountiful extends ActionManager
{
    private SpaceManager $spaceManager;
    private QiManager $qiManager;
    private WisdomManager $wisdomManager;
    private ScoreManager $scoreManager;

    public function __construct(Game $game, ?int $player_id = null)
    {
        parent::__construct($game);

        if ($player_id) {
            $this->player_id = $player_id;
        }
        $this->spaceManager = new SpaceManager($game);
        $this->qiManager = new QiManager($game);
        $this->wisdomManager = new WisdomManager($game);
        $this->scoreManager = new ScoreManager($game);
    }

    public function act(string $boon): void
    {
        $space_id = $this->globals->get(G_BOUNTIFUL_SPACE);
        $Space = $this->spaceManager->getById($space_id);

        $this->validate($Space, $boon);

        if ($boon === "qi") {
            $this->qiManager->gather($this->player_id, $Space->qi_color, 1);
        }

        if ($boon === "wisdom") {
            $this->wisdomManager->inc($this->player_id, 1);

            if ($this->scoreManager->getHigherScore() === 25) {
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
