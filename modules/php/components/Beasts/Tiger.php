<?php

namespace Bga\Games\Azure\components\Beasts;

use Bga\Games\Azure\components\Spaces\SpaceManager;
use Bga\Games\Azure\components\Wisdom\WisdomManager;
use Bga\Games\Azure\Game;

class Tiger extends Beast
{
    public function __construct(Game $game)
    {
        parent::__construct($game, 2);
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

        $bondCount = $Space->countBonds($player_id);

        if ($bondCount < 2) {
            return false;
        }

        if (!$favoredPlayer) {
            return true;
        }

        $favoredBondCount = $Space->countBonds($favoredPlayer);
        return $bondCount > $favoredBondCount;
    }

    public function gainFavor(int $player_id): void
    {
        $this->loseFavor();
        parent::gainFavor($player_id);

        $WisdomManager = new WisdomManager($this->game);
        $WisdomManager->inc($player_id, 2);
    }

    public function loseFavor(): void
    {
        $player_id = $this->getFavoredPlayer();

        if (!$player_id) {
            return;
        }

        parent::loseFavor();

        $WisdomManager = new WisdomManager($this->game);
        $WisdomManager->dec($player_id, 2);
    }
}
