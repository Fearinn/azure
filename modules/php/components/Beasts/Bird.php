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

    public function check(int $player_id): bool
    {
        if ($this->mustTakeFavor($player_id)) {
            return $this->bird_gainFavor($player_id);
        }

        return false;
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

        $favoredBondsCount = $SpaceManager->countOccupiedByDomain($favoredPlayer, 3);
        return $bondsCount > $favoredBondsCount;
    }

    public function bird_gainFavor(int $player_id): bool
    {
        parent::gainFavor($player_id);

        $pendingBird = $this->globals->get(G_PENDING_BIRD);

        if (!$pendingBird && $this->bird_loseFavor()) {
            $this->globals->set(G_PENDING_BIRD, $player_id);
            return true;
        }

        $QiManager = new QiManager($this->game);
        $QiManager->draw($player_id, 2);
        return false;
    }

    public function bird_loseFavor(): bool
    {
        $player_id = $this->getFavoredPlayer();

        if (!$player_id) {
            return false;
        }

        parent::loseFavor();
        return true;
    }
}
