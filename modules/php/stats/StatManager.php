<?php

namespace Bga\Games\Azure\stats;

use Bga\Games\Azure\Game;
use Bga\Games\Azure\Subclass;

define("STAT_STONES_PLACED", "STAT_STONES_PLACED");
define("STAT_FAVORS_GAINED", "STAT_FAVORS_GAINED");
define("STAT_QI_USED", "STAT_QI_USED");
define("STAT_DISCOUNTS_GAINED", "STAT_DISCOUNTS_GAINED");
define("STAT_REMAINING_QI", "STAT_REMAINING_QI");

class StatManager extends Subclass
{
    public function __construct(Game $game)
    {
        parent::__construct($game);
    }

    public function init(): void
    {
        $players = $this->game->loadPlayersBasicInfos();

        foreach ($players as $player_id => $player) {
            $this->game->initStat("player", STAT_STONES_PLACED, 0, $player_id);
            $this->game->initStat("player", STAT_FAVORS_GAINED, 0, $player_id);
            $this->game->initStat("player", STAT_QI_USED, 0, $player_id);
            $this->game->initStat("player", STAT_DISCOUNTS_GAINED, 0, $player_id);
        }
    }

    public function initEndExclusive(): void
    {
        $players = $this->game->loadPlayersBasicInfos();

        foreach ($players as $player_id => $player) {
            $this->game->initStat("player", STAT_REMAINING_QI, 0, $player_id);
        }
    }

    public function inc(
        int $player_id,
        string $statName,
        int $inc = 1
    ) {
        $this->game->incStat($inc, $statName, $player_id);
    }
}
