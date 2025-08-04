<?php

namespace Bga\Games\Azure\score;

use Bga\Games\Azure\Game;
use Bga\Games\Azure\notifications\NotifManager;
use Bga\Games\Azure\Subclass;
use BgaUserException;

class ScoreManager extends Subclass
{
    public function __construct(Game $game)
    {
        parent::__construct($game);
    }

    public function getScore(int $player_id): int
    {
        return (int) $this->game->getUniqueValueFromDB("SELECT player_score FROM player WHERE player_id={$player_id}");
    }

    public function setScore(int $score, int $player_id): void
    {
        $this->game->DbQuery("UPDATE player SET player_score={$score} WHERE player_id={$player_id}");
    }

    public function incScore(int $score, int $player_id): void
    {
        $initialScore = $this->getScore($player_id);
        $this->game->DbQuery("UPDATE player SET player_score=player_score+{$score} WHERE player_id={$player_id}");
        $finalScore = $this->getScore($player_id);

        $NotifManager = new NotifManager($this->game);
        $NotifManager->all(
            "incScore",
            clienttranslate('${player_name} gathers ${log_score} of wisdom'),
            [
                "initialScore" => $initialScore,
                "score" => $score,
                "finalScore" => $finalScore,
                "log_score" => $score,
            ],
            $player_id,
        );
    }

    public function setScoreAux(int $score, int $player_id): void
    {
        $this->game->DbQuery("UPDATE player SET player_score_aux={$score} WHERE player_id={$player_id}");
    }

    public function incScoreAux(int $score, int $player_id): void
    {
        $this->game->DbQuery("UPDATE player SET player_score_aux=player_score_aux+{$score} WHERE player_id={$player_id}");
    }

    public function getHigherScore(): int
    {
        return $this->game->getUniqueValueFromDB("SELECT MAX(player_score) FROM player");
    }
}
