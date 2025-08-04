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
    public readonly int $baseCost;

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
        $this->baseCost = $this->qi + $this->wisdom;
        $this->isMountain = $this->baseCost === 0;
    }

    private function isOccupied(int $player_id = null): bool
    {
        $StoneManager = new StoneManager($this->game);
        return $StoneManager->checkBySpace($this->id, $player_id);
    }

    private function countNeighbors(int $player_id, int $x, int $y): int
    {
        $neighborCount = 0;

        for ($neighbor_x = 1; $neighbor_x <= 6; $neighbor_x++) {
            if ($neighbor_x === $x) {
                continue;
            }

            $Space = new Space($this->game, $neighbor_x, $y);

            if ($Space->isOccupied($player_id)) {
                $neighborCount++;
            }
        }

        for ($neighbor_y = 1; $neighbor_y <= 6; $neighbor_y++) {
            if ($neighbor_y === $y) {
                continue;
            }

            $Space = new Space($this->game, $x, $neighbor_y);

            if ($Space->isOccupied($player_id)) {
                $neighborCount++;
            }
        }

        return $neighborCount;
    }

    public function getCost(int $player_id): int
    {
        $neighborCount = $this->countNeighbors($player_id, $this->x, $this->y);
        $cost = $this->baseCost - $neighborCount;

        if ($cost < 0) {
            $cost = 0;
        }

        return $cost;
    }

    private function canPayCost(int $player_id): bool
    {
        $QiManager = new QiManager($this->game);
        $qiCount = $QiManager->countByDomain($player_id, $this->domain_id);
        return $this->getCost($player_id) <= $qiCount;
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
