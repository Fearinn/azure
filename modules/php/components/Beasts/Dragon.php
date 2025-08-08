<?php

namespace Bga\Games\Azure\components\Beasts;

use Bga\Games\Azure\components\Spaces\SpaceManager;
use Bga\Games\Azure\Game;
use Bga\Games\Azure\score\ScoreManager;

class Dragon extends Beast
{
    public function __construct(Game $game)
    {
        parent::__construct($game, 1);
    }

    public function check(int $player_id): void
    {
        if ($this->mustTakeFavor($player_id)) {
            $this->gainFavor($player_id);
            return;
        }
    }

    private function mustTakeFavor(int $player_id): bool
    {
        $favoredPlayer = $this->getFavoredPlayer();

        if ($player_id === $favoredPlayer) {
            return false;
        }

        $SpaceManager = new SpaceManager($this->game);
        $Space = $SpaceManager->getById($this->space_id);

        $bondsCount = $Space->countBonds($player_id);

        if ($bondsCount < 2) {
            return false;
        }

        if (!$favoredPlayer) {
            return true;
        }

        $favoredBondsCount = $Space->countBonds($favoredPlayer);
        return $bondsCount > $favoredBondsCount;
    }

    public function gainFavor(int $player_id): void
    {
        $this->loseFavor();
        parent::gainFavor($player_id);

        $ScoreManager = new ScoreManager($this->game);
        $ScoreManager->incScore($player_id, 3);
    }

    public function loseFavor(): void
    {
        $player_id = $this->getFavoredPlayer();

        if (!$player_id) {
            return;
        }

        parent::loseFavor();

        $ScoreManager = new ScoreManager($this->game);
        $ScoreManager->incScore($player_id, -3);
    }
}
