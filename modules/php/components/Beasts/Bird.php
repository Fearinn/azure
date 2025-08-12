<?php

namespace Bga\Games\Azure\components\Beasts;

use Bga\Games\Azure\components\Qi\QiManager;
use Bga\Games\Azure\components\Spaces\SpaceManager;
use Bga\Games\Azure\Game;

class Bird extends Beast
{
    public function __construct(Game $game)
    {
        parent::__construct($game, 3);
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
        $bondsCount = $SpaceManager->countOccupiedByDomain($player_id, 3);

        if ($bondsCount < 2) {
            return false;
        }

        if (!$favoredPlayer) {
            return true;
        }

        $favoredBondsCount = $SpaceManager->countOccupiedByDomain($player_id, 3);
        return $bondsCount > $favoredBondsCount;
    }

    public function gainFavor(int $player_id): void
    {
        $this->loseFavor();
        parent::gainFavor($player_id);

        $QiManager = new QiManager($this->game);
        $QiManager->draw($player_id, 2);
    }

    public function loseFavor(): void
    {
        $player_id = $this->getFavoredPlayer();

        if (!$player_id) {
            return;
        }

        parent::loseFavor();
    }
}
