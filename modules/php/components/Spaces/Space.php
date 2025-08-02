<?php

namespace Bga\Games\Azure\components\Spaces;

use Bga\Games\Azure\components\Qi\QiManager;
use Bga\Games\Azure\components\Stones\StoneManager;
use Bga\Games\Azure\Game;
use Bga\Games\Azure\score\ScoreManager;
use Bga\Games\Azure\Subclass;

class Space extends Subclass
{
    public readonly int $x;
    public readonly int $y;
    public readonly int $id;
    public readonly int $qi;
    public readonly int $qi_color;
    public readonly int $wisdom;
    public readonly bool $isMountain;
    public readonly int $domain_id;
    public readonly int $cost;

    public function __construct(Game $game, int $x, int $y)
    {
        parent::__construct($game);

        $realm = $this->globals->get(G_REALM);
        $this->x = $x;
        $this->y = $y;
        $this->id = $realm[$x][$y];

        $space = $this->SPACES[$this->id];
        $this->qi = $space["qi"];
        $this->qi_color = $space["qi_color"];
        $this->wisdom = $space["wisdom"];
        $this->domain_id = $space["domain"];
        $this->cost = $this->qi + $this->wisdom;
        $this->isMountain = $this->cost === 0;
    }

    private function isOccupied(): bool
    {
        $StoneManager = new StoneManager($this->game);
        return $StoneManager->countBySpace($this->id);
    }

    private function canPayCost(int $player_id): bool
    {
        $QiManager = new QiManager($this->game);
        return $this->cost <= $QiManager->countByDomain($player_id, $this->domain_id);
    }

    public function isSelectable(int $player_id): bool
    {
        return !$this->isMountain && !$this->isOccupied() && $this->canPayCost($player_id);
    }

    public function gatherBoons(int $player_id): void
    {
        $QiManager = new QiManager($this->game);
        $QiManager->gather(
            $player_id,
            $this->qi_color,
            $this->qi
        );

        if ($this->wisdom > 0) {
            $ScoreManager = new ScoreManager($this->game);
            $ScoreManager->incScore($this->wisdom, $player_id);
        }
    }
}
