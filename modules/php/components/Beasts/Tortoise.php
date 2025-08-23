<?php

namespace Bga\Games\Azure\components\Beasts;

use Bga\Games\Azure\components\Spaces\SpaceManager;
use Bga\Games\Azure\components\Stones\StoneManager;
use Bga\Games\Azure\Game;

class Tortoise extends Beast
{
    public function __construct(Game $game)
    {
        parent::__construct($game, 4);
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
        $bondCount = $SpaceManager->countOccupiedSerpents($player_id);

        if ($bondCount < 2) {
            return false;
        }

        if (!$favoredPlayer) {
            return true;
        }

        $favoredBondCount = $SpaceManager->countOccupiedSerpents($favoredPlayer);
        return $bondCount > $favoredBondCount;
    }

    public function gainFavor(int $player_id): void
    {
        $this->loseFavor();
        parent::gainFavor($player_id);

        $SpaceManager = new SpaceManager($this->game);
        $Space = $SpaceManager->getById($this->space_id);

        $StoneManager = new StoneManager($this->game);
        $StoneManager->place($player_id, $Space->x, $Space->y);
    }

    public function loseFavor(): void
    {
        parent::loseFavor();

        $player_id = $this->getFavoredPlayer();

        if (!$player_id) {
            return;
        }

        $StoneManager = new StoneManager($this->game);
        $StoneManager->remove($player_id, $this->space_id);
    }
}
