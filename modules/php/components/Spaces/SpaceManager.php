<?php

namespace Bga\Games\Azure\components\Spaces;

use Bga\Games\Azure\components\Gifted\GiftedManager;
use Bga\Games\Azure\Game;
use Bga\Games\Azure\Subclass;

class SpaceManager extends Subclass
{
    public function __construct(Game $game)
    {
        parent::__construct($game);
    }

    private function rotate90(array $original): array
    {
        $size = count($original);
        $rotated = [];
        for ($x = 1; $x <= $size; $x++) {
            for ($y = 1; $y <= $size; $y++) {
                $rotated[$size + 1 - $y][$x] = $original[$x][$y];
            }
        }

        return $rotated;
    }

    private function rotateGrid(array $grid, int $domain_id): array
    {
        $times = bga_rand(0, 3);

        $rotations = (array) $this->globals->get(G_DOMAINS_ROTATIONS, []);
        $rotations[$domain_id] = $times;
        $this->globals->set(G_DOMAINS_ROTATIONS, $rotations);

        for ($t = 1; $t <= $times; $t++) {
            $grid = $this->rotate90($grid);
        }

        return $grid;
    }

    private function placeGrids(array $grids, array $domain_ids): void
    {
        $realm = [];

        $positions = [
            [1, 1], // D0: top-left
            [4, 1], // D1: top-right
            [1, 4], // D2: bottom-left
            [4, 4], // D3: bottom-right
        ];

        foreach ($domain_ids as $domain_id) {
            $grid = $grids[$domain_id];

            $size = count($grid);
            [$offsetX, $offsetY] = array_shift($positions);

            for ($x = 1; $x <= $size; $x++) {
                for ($y = 1; $y <= $size; $y++) {
                    $realmX = $offsetX + $x - 1;
                    $realmY = $offsetY + $y - 1;

                    $space_id = (int) $grid[$x][$y];
                    $realm[$realmX][$realmY] = $space_id;
                }
            }
        }

        $this->globals->set(G_REALM, $realm);
    }

    public function setup(): void
    {
        $grids = [];
        $domainsSides = [];
        foreach ($this->DOMAINS as $domain_id => $domain) {
            $side = bga_rand(1, 2);
            $domainsSides[$domain_id] = $side;

            $grid = (array) $domain[$side];
            $grids[$domain_id] = $this->rotateGrid($grid, $domain_id);
        }
        $this->globals->set(G_DOMAINS_SIDES, $domainsSides);

        $domain_ids = array_keys($grids);
        shuffle($domain_ids);
        $this->globals->set(G_DOMAINS_ORDER, $domain_ids);

        $this->placeGrids($grids, $domain_ids);
    }

    public function getById(int $space_id): Space
    {
        $realm = $this->globals->get(G_REALM);
        foreach ($realm as $x => $column) {
            foreach ($column as $y => $sp_id) {
                if ($sp_id === $space_id) {
                    $Space = new Space($this->game, $x, $y);
                    return $Space;
                }
            }
        }

        throw new \BgaVisibleSystemException("no space found");
    }

    public function countOccupiedSerpents(int $player_id): int
    {
        $serpentCount = 0;
        $domainSides = $this->globals->get(G_DOMAINS_SIDES);

        foreach ($this->DOMAINS as $domain_id => $beast) {
            $side = $domainSides[$domain_id];
            $serpents =  $this->SERPENTS[$domain_id][$side];

            foreach ($serpents as $space_id) {
                $Space = $this->getById($space_id);

                if ($Space->isOccupied($player_id)) {
                    $serpentCount++;
                }
            }
        }

        return $serpentCount;
    }

    public function countOccupiedByDomain(int $player_id, int $domain_id): int
    {
        $count = 0;

        $domainSides = $this->globals->get(G_DOMAINS_SIDES);
        $side = $domainSides[$domain_id];

        $domain = $this->DOMAINS[$domain_id][$side];

        foreach ($domain as $column) {
            foreach ($column as $space_id) {
                $Space = $this->getById($space_id);
                if ($Space->isOccupied($player_id)) {
                    $count++;
                }
            }
        }

        return $count;
    }

    public function getSelectable(int $player_id, int $extraCost = 0): array
    {
        $selectableSpaces = [];

        $realm = $this->globals->get(G_REALM);
        foreach ($realm as $x => $column) {
            foreach ($column as $y => $space_id) {
                $Space = new Space($this->game, $x, $y);

                if ($Space->isSelectable($player_id, $extraCost)) {
                    $selectableSpaces[] = ["id" => $space_id, "x" => $x, "y" => $y];
                }
            }
        }

        return $selectableSpaces;
    }

    public function getSelectableGifted(int $player_id): array
    {
        $GiftedManager = new GiftedManager($this->game);

        if (!$GiftedManager->isEnabled()) {
            return [];
        }

        $extraCost = $GiftedManager->getExtraCost();

        $selectableSpaces = $this->getSelectable($player_id, $extraCost);

        return $selectableSpaces;
    }
}
