<?php

namespace Bga\Games\Azure\components\Wisdom;


use Bga\Games\Azure\Game;
use Bga\Games\Azure\notifications\NotifManager;
use Bga\Games\Azure\score\ScoreManager;
use Bga\Games\Azure\Subclass;

class WisdomManager extends Subclass
{
    public function __construct(Game $game)
    {
        parent::__construct($game);
    }

    public function inc(int $player_id, int $wisdom): void
    {
        $ScoreManager = new ScoreManager($this->game);

        $initialWisdom = $ScoreManager->getScore($player_id);
        $ScoreManager->incScore($player_id, $wisdom);
        $finalWisdom = $ScoreManager->getScore($player_id);

        $NotifManager = new NotifManager($this->game);

        $NotifManager->all(
            "gatherWisdom",
            clienttranslate('${player_name} gathers ${log_wisdom} wisdom'),
            [
                "initialWisdom" => $initialWisdom,
                "finalWisdom" => $finalWisdom,
                "wisdom" => $wisdom,
                "log_wisdom" => $wisdom,
            ],
            $player_id,
        );
    }

    public function dec(int $player_id, int $wisdom): void
    {
        $ScoreManager = new ScoreManager($this->game);

        $initialWisdom = $ScoreManager->getScore($player_id);
        $ScoreManager->incScore($player_id, -$wisdom);
        $finalWisdom = $ScoreManager->getScore($player_id);

        $NotifManager = new NotifManager($this->game);

        $NotifManager->all(
            "gatherWisdom",
            clienttranslate('${player_name} loses ${log_wisdom} wisdom'),
            [
                "initialWisdom" => $initialWisdom,
                "finalWisdom" => $finalWisdom,
                "wisdom" => $wisdom,
                "log_wisdom" => $wisdom,
            ],
            $player_id,
        );
    }
}
