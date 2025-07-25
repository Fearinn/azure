<?php

namespace Bga\Games\Azure\components\Spaces;

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

    private function rotateGrid(array $grid): array
    {
        $times = bga_rand(0, 3);

        for ($t = 0; $t <= $times; $t++) {
            $this->rotate90($grid);
        }

        return $grid;
    }

    private function placeGrids(array $grids): void
    {
        shuffle($grids);
        $realm = [];

        $positions = [
            [1, 1], // D0: top-left
            [4, 1], // D1: top-right
            [1, 4], // D2: bottom-left
            [4, 4], // D3: bottom-right
        ];

        foreach ($grids as $i => $grid) {
            $size = count($grid);
            [$offsetX, $offsetY] = $positions[$i];

            for ($x = 1; $x <= $size; $x++) {
                for ($y = 1; $y <= $size; $y++) {
                    $realmX = $offsetX + $x - 1;
                    $realmY = $offsetY + $y - 1;

                    $cell = $grid[$x][$y];
                    $realm[$realmX][$realmY] = $cell["id"];
                }
            }
        }

        $this->globals->set(G_REALM, $realm);
    }

    public function setup(): void
    {
        $grids = [];
        foreach ($this->DOMAINS as $domain_id => $domain) {
            $side = bga_rand(1, 2);
            $grid = (array) $domain["sides"][$side];
            $grids[] = $this->rotateGrid($grid);
        }

        $this->placeGrids($grids);
    }
}
