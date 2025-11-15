<?php

namespace Bga\Games\Azure\components\Wisdom;


use Bga\Games\Azure\Game;
use Bga\Games\Azure\score\ScoreManager;
use Bga\Games\Azure\Subclass;
use Bga\Games\Azure\Notif;

class WisdomManager extends Subclass
{
    use Notif;

    private ScoreManager $scoreManager;

    public function __construct(Game $game)
    {
        parent::__construct($game);
        
        $this->scoreManager = new ScoreManager($game);
    }

    public function inc(int $player_id, int $wisdom): void
    {
        if ($wisdom === 0) {
            return;
        }

        $initialWisdom = $this->scoreManager->getScore($player_id);
        $finalWisdom = $initialWisdom + $wisdom;

        if ($finalWisdom > 25) {
            $finalWisdom = 25;
        }

        $this->scoreManager->setScore($player_id, $finalWisdom);

        $this->notifAll(
            "gatherWisdom",
            clienttranslate('${player_name} gathers ${wisdom_log} point(s)'),
            [
                "initialWisdom" => $initialWisdom,
                "finalWisdom" => $finalWisdom,
                "wisdom" => $wisdom,
                "wisdom_log" => $wisdom,
            ],
            $player_id,
        );

        if ($finalWisdom === 25) {
            $this->game->gamestate->nextState(TR_END_GAME);
        }
    }

    public function dec(int $player_id, int $wisdom): void
    {
        $initialWisdom = $this->scoreManager->getScore($player_id);
        $finalWisdom = $initialWisdom - $wisdom;

        if ($finalWisdom < 0) {
            $finalWisdom = 0;
        }

        $this->scoreManager->setScore($player_id, $finalWisdom);

        $this->notifAll(
            "gatherWisdom",
            clienttranslate('${player_name} loses ${log_wisdom} point(s)'),
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
