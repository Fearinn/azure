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

    public function countBonds(int $player_id): int
    {
        $x = $this->x;
        $y = $this->y;
        $bondCount = 0;

        for ($bond_x = $x - 1; $bond_x >= 1; $bond_x--) {
            $Space = new Space($this->game, $bond_x, $y);

            if ($Space->isMountain) {
                break;
            }

            if ($Space->isOccupied($player_id)) {
                $bondCount++;
            }
        }

        for ($bond_x = $x + 1; $bond_x <= 6; $bond_x++) {
            $Space = new Space($this->game, $bond_x, $y);

            if ($Space->isMountain) {
                break;
            }

            if ($Space->isOccupied($player_id)) {
                $bondCount++;
            }
        }

        for ($bond_y = $y - 1; $bond_y >= 1; $bond_y--) {
            $Space = new Space($this->game, $x, $bond_y);

            if ($Space->isMountain) {
                break;
            }

            if ($Space->isOccupied($player_id)) {
                $bondCount++;
            }
        }

        for ($bond_y = $y + 1; $bond_y <= 6; $bond_y++) {
            $Space = new Space($this->game, $x, $bond_y);

            if ($Space->isMountain) {
                break;
            }

            if ($Space->isOccupied($player_id)) {
                $bondCount++;
            }
        }

        return $bondCount;
    }

    public function getCost(int $player_id): int
    {
        $bondCount = $this->countBonds($player_id);
        $cost = $this->baseCost - $bondCount;

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

        $ScoreManager = new ScoreManager($this->game);
        $ScoreManager->incScore($player_id, $this->wisdom);
    }
}
