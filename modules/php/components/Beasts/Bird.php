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
        $pendingBird = $this->bird_loseFavor() ? $this->globals->get(G_PENDING_BIRD) : $player_id;
        parent::gainFavor($player_id);

        if (!$pendingBird) {
            $this->globals->set(G_PENDING_BIRD, $player_id);
            return true;
        }

        $this->execFavor($player_id);
        return false;
    }

    public function bird_loseFavor(): bool
    {
        $player_id = $this->getFavoredPlayer();

        if (!$player_id) {
            return false;
        }

        parent::loseFavor();

        $this->game->giveExtraTime($player_id);
        $this->game->gamestate->changeActivePlayer($player_id);
        return true;
    }

    public function execFavor(int $player_id): void
    {
        $QiManager = new QiManager($this->game);
        $QiManager->draw($player_id, 2);
    }
}
