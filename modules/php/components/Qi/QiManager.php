<?php

namespace Bga\Games\Azure\components\Qi;

use Bga\Games\Azure\components\CardManager;
use Bga\Games\Azure\Game;

class QiManager extends CardManager
{
    public function __construct(Game $game)
    {
        parent::__construct(
            $game,
            $game->qi_cards,
            "qi"
        );
    }

    public function setupVisibleDecks(): void
    {
        foreach ($this->QI as $domain_id => $qi) {
            $this->game->DbQuery("UPDATE {$this->dbTable} SET card_location='deck-{$domain_id}' WHERE card_type_arg={$domain_id} AND card_location='deck' LIMIT 9");
            $this->deck->shuffle("deck-{$domain_id}");
        }
    }

    public function setup(): void
    {
        $qiCards = [];

        foreach ($this->QI as $domain_id => $qi) {
            $qiCards[] = ["type" => $qi["name"], "type_arg" => $domain_id, "nbr" => 12];
        }

        $this->deck->createCards($qiCards, "deck-0");
        $this->setupVisibleDecks();
        $this->deck->shuffle("deck-0");
    }

    public function getDeckCount(int $domain_id): int
    {
        return $this->deck->countCardInLocation("deck-{$domain_id}");
    }

    public function getDecksCounts(): array
    {
        $decksCounts = [];

        foreach ($this->QI as $domain_id => $qi) {
            $decksCounts[$domain_id] = $this->getDeckCount($domain_id);
        }

        $decksCounts[0] = $this->getDeckCount(0);

        return $decksCounts;
    }

    public function getDeck(int $domain_id): array
    {
        $deck = $this->deck->getCardsInLocation("deck-{$domain_id}");
        return array_values($deck);
    }

    public function getDecks(): array
    {
        $decks = [];

        foreach ($this->QI as $domain_id => $qi) {
            $decks[$domain_id] = $this->getDeck($domain_id);
        }

        return $decks;
    }
}
