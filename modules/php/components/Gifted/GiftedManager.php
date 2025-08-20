<?php

namespace Bga\Games\Azure\components\Gifted;

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

        if ($gifted_id === 0) {
            return;
        }

        if ($gifted_id === 5) {
            $gifted_id = bga_rand(1, 4);
        }

        $card = $this->GIFTED_CARDS[$gifted_id];
        $this->globals->set(G_GIFTED_CARD, $card);
    }

    protected function getGiftedId(): int
    {
        $card = $this->globals->get(G_GIFTED_CARD);

        if ($card === null) {
            return 0;
        }

        $gifted_id = (int) $card["id"];

        return $gifted_id;
    }

    public function isEnabled(): bool
    {
        return $this->getGiftedId() > 0;
    }
}
