<?php

namespace Bga\Games\Azure\components\Spaces;

use Bga\Games\Azure\components\Qi\QiManager;
use Bga\Games\Azure\components\Stones\StoneManager;
use Bga\Games\Azure\components\Wisdom\WisdomManager;
use Bga\Games\Azure\Game;
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

    public function isSerpent(): bool
    {
        $serpents = $this->globals->get(G_SERPENTS);
        return in_array($this->id, $serpents);
    }

    public function isOccupied(int $player_id = null): bool
    {
        $StoneManager = new StoneManager($this->game);
        return $StoneManager->checkBySpace($this->id, $player_id);
    }

    private function isTortoise(): bool
    {
        return $this->isMountain && $this->domain_id === 4;
    }

    public function isTortoiseFavor(int $player_id): bool
    {
        return $this->isTortoise() && $this->isOccupied($player_id);
    }

    public function addBonds(
        int $player_id,
        int $x,
        int $y,
        &$bondCount
    ): bool {
        $Space = new Space($this->game, $x, $y);
        if ($Space->isTortoiseFavor($player_id)) {
            $bondCount++;
        }

        if ($Space->isMountain) {
            return false;
        }

        if ($Space->isOccupied($player_id)) {
            $bondCount++;
        }

        return true;
    }

    public function countBonds(int $player_id, bool $isBeast = false): int
    {
        $x = $this->x;
        $y = $this->y;
        $bondCount = 0;

        for ($bond_x = $x - 1; $bond_x >= 1; $bond_x--) {
            if (!$this->addBonds($player_id, $bond_x, $y, $bondCount)) {
                break;
            }
        }

        for ($bond_x = $x + 1; $bond_x <= 6; $bond_x++) {
            if (!$this->addBonds($player_id, $bond_x, $y, $bondCount)) {
                break;
            }
        }

        for ($bond_y = $y - 1; $bond_y >= 1; $bond_y--) {
            if (!$this->addBonds($player_id, $x, $bond_y, $bondCount)) {
                break;
            }
        }

        for ($bond_y = $y + 1; $bond_y <= 6; $bond_y++) {
            if (!$this->addBonds($player_id, $x, $bond_y, $bondCount)) {
                break;
            }
        }

        if (!$isBeast) {
            $gifted_id = $this->globals->get(G_GIFTED_CARD);
            $giftedRelations = $this->globals->get(G_GIFTED_RELATIONS)[$player_id];

            if (
                ($gifted_id === 1 || $gifted_id === 2)
                && in_array($this->id, $giftedRelations)
            ) {
                $bondCount++;
            }
        }

        return $bondCount;
    }

    public function getBonds(int $player_id): array
    {
        $bonds = [];

        $orthogonalRelations = $this->getOrthogonalRelations(true);
        $SpaceManager = new SpaceManager($this->game);

        if ($this->isMountain) {
            if ($this->domain_id === 3) {
                $space_ids = $SpaceManager->getByDomain(3);
                foreach ($space_ids as $space_id) {
                    $Space = $SpaceManager->getById($space_id);

                    if ($Space->isOccupied($player_id)) {
                        $bonds[] = $space_id;
                    }
                }
                return $bonds;
            }

            if ($this->domain_id === 4) {
                $serpents = $this->globals->get(G_SERPENTS);

                foreach ($serpents as $space_id) {
                    $Space = $SpaceManager->getByID($space_id);

                    if ($Space->isOccupied($player_id)) {
                        $bonds[] = $space_id;
                    }
                }

                return $bonds;
            }
        }

        foreach ($orthogonalRelations as $space_id) {
            $Space = $SpaceManager->getById($space_id);

            if ($Space->isTortoiseFavor($player_id)) {
                $bonds[] = $space_id;
            }

            if ($Space->isMountain) {
                continue;
            }

            if ($Space->isOccupied($player_id)) {
                $bonds[] = $space_id;
            }
        }

        if (!$this->isMountain && $this->globals->get(G_GIFTED_CARD) === 2) {
            $x = $this->x;
            $y = $this->y;

            for (
                $bond_x = $x - 1, $bond_y = $y - 1;
                $bond_x >= 1 && $bond_y >= 1;
                $bond_x--, $bond_y--
            ) {
                $Space = new Space($this->game, $bond_x, $bond_y);

                if ($Space->isMountain) {
                    break;
                }

                if ($Space->isGifted($player_id)) {
                    $bonds[] = $Space->id;
                }
            }

            for (
                $bond_x = $x + 1, $bond_y = $y - 1;
                $bond_x <= 6 && $bond_y >= 1;
                $bond_x++, $bond_y--
            ) {
                $Space = new Space($this->game, $bond_x, $bond_y);

                if ($Space->isMountain) {
                    break;
                }

                if ($Space->isGifted($player_id)) {
                    $bonds[] = $Space->id;
                }
            }

            for (
                $bond_x = $x - 1, $bond_y = $y + 1;
                $bond_x >= 1 && $bond_y <= 6;
                $bond_x--, $bond_y++
            ) {
                $Space = new Space($this->game, $bond_x, $bond_y);

                if ($Space->isMountain) {
                    break;
                }

                if ($Space->isGifted($player_id)) {
                    $bonds[] = $Space->id;
                }
            }

            for (
                $bond_x = $x + 1, $bond_y = $y + 1;
                $bond_x <= 6 && $bond_y <= 6;
                $bond_x++, $bond_y++
            ) {
                $Space = new Space($this->game, $bond_x, $bond_y);

                if ($Space->isMountain) {
                    break;
                }

                if ($Space->isGifted($player_id)) {
                    $bonds[] = $Space->id;
                }
            }
        }

        return array_unique($bonds);
    }

    public function getCost(int $player_id, int $extraCost = 0): int
    {
        $bondCount = $this->countBonds($player_id);
        $cost = $this->baseCost + $extraCost - $bondCount;

        if ($cost < 0) {
            $cost = 0;
        }

        return $cost;
    }

    private function canPayCost(int $player_id, int $extraCost = 0): bool
    {
        $QiManager = new QiManager($this->game);
        $qiCount = $QiManager->countByDomain($player_id, $this->domain_id);
        return $this->getCost($player_id, $extraCost) <= $qiCount;
    }

    public function isSelectable(int $player_id, int $extraCost = 0): bool
    {
        return !$this->isMountain
            && !$this->isOccupied()
            && $this->canPayCost($player_id, $extraCost);
    }

    public function gatherBoons(int $player_id): void
    {
        $QiManager = new QiManager($this->game);

        $QiManager->gather(
            $player_id,
            $this->qi_color,
            $this->qi
        );

        $WisdomManager = new WisdomManager($this->game);
        $WisdomManager->inc($player_id, $this->wisdom);
    }

    public function getOrthogonalRelations(bool $includeTortoise = false): array
    {
        $x = $this->x;
        $y = $this->y;

        $space_ids = [];

        for ($bond_x = $x - 1; $bond_x >= 1; $bond_x--) {
            $Space = new Space($this->game, $bond_x, $y);

            if ($includeTortoise && $Space->isTortoise()) {
                $space_ids[] = $Space->id;
                break;
            }

            if ($Space->isMountain) {
                break;
            }

            $space_ids[] = $Space->id;
        }

        for ($bond_x = $x + 1; $bond_x <= 6; $bond_x++) {
            $Space = new Space($this->game, $bond_x, $y);

            if ($includeTortoise && $Space->isTortoise()) {
                $space_ids[] = $Space->id;
                break;
            }

            if ($Space->isMountain) {
                break;
            }

            $space_ids[] = $Space->id;
        }

        for ($bond_y = $y - 1; $bond_y >= 1; $bond_y--) {
            $Space = new Space($this->game, $x, $bond_y);

            if ($includeTortoise && $Space->isTortoise()) {
                $space_ids[] = $Space->id;
                break;
            }

            if ($Space->isMountain) {
                break;
            }

            $space_ids[] = $Space->id;
        }

        for ($bond_y = $y + 1; $bond_y <= 6; $bond_y++) {
            $Space = new Space($this->game, $x, $bond_y);

            if ($Space->isMountain) {
                break;
            }

            $space_ids[] = $Space->id;
        }

        return $space_ids;
    }

    public function isGifted(int $player_id): bool
    {
        if ($this->globals->get(G_GIFTED_CARD) === 0) {
            return false;
        }

        $StoneManager = new StoneManager($this->game);
        return $StoneManager->getGiftedSpace($player_id) === $this->id;
    }

    public function registerGiftedRelations(int $player_id): void
    {
        $space_ids = [];
        $x = $this->x;
        $y = $this->y;
        $gifted_id = $this->globals->get(G_GIFTED_CARD);

        if ($gifted_id === 1) {
            $space_ids = $this->getOrthogonalRelations();
        }

        if ($gifted_id === 2) {
            for (
                $bond_x = $x - 1, $bond_y = $y - 1;
                $bond_x >= 1 && $bond_y >= 1;
                $bond_x--, $bond_y--
            ) {
                $Space = new Space($this->game, $bond_x, $bond_y);

                if ($Space->isMountain) {
                    break;
                }

                $space_ids[] = $Space->id;
            }

            for (
                $bond_x = $x + 1, $bond_y = $y - 1;
                $bond_x <= 6 && $bond_y >= 1;
                $bond_x++, $bond_y--
            ) {
                $Space = new Space($this->game, $bond_x, $bond_y);

                if ($Space->isMountain) {
                    break;
                }

                $space_ids[] = $Space->id;
            }

            for (
                $bond_x = $x - 1, $bond_y = $y + 1;
                $bond_x >= 1 && $bond_y <= 6;
                $bond_x--, $bond_y++
            ) {
                $Space = new Space($this->game, $bond_x, $bond_y);

                if ($Space->isMountain) {
                    break;
                }

                $space_ids[] = $Space->id;
            }

            for (
                $bond_x = $x + 1, $bond_y = $y + 1;
                $bond_x <= 6 && $bond_y <= 6;
                $bond_x++, $bond_y++
            ) {
                $Space = new Space($this->game, $bond_x, $bond_y);

                if ($Space->isMountain) {
                    break;
                }

                $space_ids[] = $Space->id;
            }
        }

        if ($gifted_id === 3) {
            for ($offset_x = -1; $offset_x <= 1; $offset_x++) {
                for ($offset_y = -1; $offset_y <= 1; $offset_y++) {
                    if ($offset_x === 0 && $offset_y === 0) {
                        continue;
                    }

                    $bond_x = $x + $offset_x;
                    $bond_y = $y + $offset_y;

                    if ($bond_x < 1 || $bond_x > 6 || $bond_y < 1 || $bond_y > 6) {
                        continue;
                    }

                    $Space = new Space($this->game, $bond_x, $bond_y);

                    if ($Space->isMountain) {
                        continue;
                    }

                    $space_ids[] = $Space->id;
                }
            }
        }

        $giftedRelations = $this->globals->get(G_GIFTED_RELATIONS);
        $giftedRelations[$player_id] = $space_ids;
        $this->globals->set(G_GIFTED_RELATIONS, $giftedRelations);
    }
}
