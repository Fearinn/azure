<?php

namespace Bga\Games\Azure\components\Gifted;

use Bga\Games\Azure\components\Spaces\SpaceManager;
use Bga\Games\Azure\components\Stones\StoneManager;
use Bga\Games\Azure\Game;
use Bga\Games\Azure\Subclass;

class GiftedManager extends Subclass
{
    public function __construct(Game $game)
    {
        parent::__construct(
            $game,
        );
    }

    public function setup(): void
    {
        $gifted_id = $this->game->tableOptions->get(100);

        if ($gifted_id === 5) {
            $gifted_id = bga_rand(1, 4);
        }

        $this->globals->set(G_GIFTED_CARD, $gifted_id);
    }

    public function getGiftedCard(): array | null
    {
        $gifted_id = $this->globals->get(G_GIFTED_CARD);

        if ($gifted_id === 0) {
            return null;
        }

        $card = $this->GIFTED_CARDS[$gifted_id];
        return $card;
    }

    public function getExtraCost(): int
    {
        if (!$this->isEnabled()) {
            return 0;
        }

        $card = $this->getGiftedCard();
        return (int) $card["cost"];
    }

    public function isEnabled(): bool
    {
        return $this->globals->get(G_GIFTED_CARD) > 0;
    }

    public function canPlay(int $player_id): bool
    {
        if (!$this->isEnabled()) {
            return false;
        }

        $StoneManager = new StoneManager($this->game);
        if (!$StoneManager->canPlayGifted($player_id)) {
            return false;
        }

        $SpaceManager = new SpaceManager($this->game);

        $selectableGifted = $SpaceManager->getSelectableGifted($player_id);
        return !!$selectableGifted;
    }
}
