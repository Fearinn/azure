<?php

namespace Bga\Games\Azure\components\Qi;

use Bga\Games\Azure\components\CardManager;
use Bga\Games\Azure\Game;
use Bga\Games\Azure\notifications\NotifManager;

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
            $this->game->DbQuery("UPDATE {$this->dbTable} SET card_location='deck-{$domain_id}' WHERE card_type_arg={$domain_id} AND card_location='deck-0' LIMIT 9");
        }
    }


    public function setupHands(): void
    {
        $players = $this->game->loadPlayersBasicInfos();

        $active_player_id = $this->game->getActivePlayerId();

        foreach ($players as $player_id => $player) {
            $cardsNbr = $active_player_id === $player_id ? 2 : 3;
            $this->deck->pickCards($cardsNbr, "deck-0", $player_id);
        }
    }

    public function setup(): void
    {
        $qiCards = [];

        foreach ($this->QI as $domain_id => $qi) {
            $qiCards[] = ["type" => (string) $qi["name"], "type_arg" => (int) $domain_id, "nbr" => 12];
        }

        $this->deck->createCards($qiCards, "deck-0");
        $this->setupVisibleDecks();
        $this->deck->shuffle("deck-0");

        $this->setupHands();
    }

    public function getDeckCount(int $domain_id): int
    {
        return $this->deck->countCardInLocation("deck-{$domain_id}");
    }

    public function getDecksCounts(): array
    {
        $decksCounts = [];

        $decksCounts[0] = $this->getDeckCount(0);

        foreach ($this->QI as $domain_id => $qi) {
            $decksCounts[$domain_id] = $this->getDeckCount($domain_id);
        }

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

        $decks[0] = $this->getDeck(0);

        foreach ($this->QI as $domain_id => $qi) {
            $decks[$domain_id] = $this->getDeck($domain_id);
        }

        return $decks;
    }

    public function countByDomain(int $player_id, int $domain_id): int
    {
        return $this->game->getUniqueValueFromDB("SELECT COUNT(card_id) FROM {$this->dbTable} 
        WHERE card_location='hand' AND card_type_arg={$domain_id} AND card_location_arg={$player_id}");
    }

    public function discard(int $player_id, int $nbr, int $domain_id): void
    {
        if ($nbr === 0) {
            return;
        }

        $sql = "SELECT card_id id FROM {$this->dbTable} WHERE card_location='hand' 
        AND card_location_arg={$player_id} AND card_type_arg={$domain_id} LIMIT $nbr";

        $card_ids = $this->game->azr_getObjectListFromDB($sql, true);
        $this->deck->moveCards($card_ids, "deck-{$domain_id}");

        $cards = $this->deck->getCards($card_ids);

        $Notify = new NotifManager($this->game);
        $Notify->all(
            "discardQi",
            "",
            [
                "cards" => array_values($cards),
            ]
        );
    }

    public function gather(
        int $player_id,
        int $domain_id,
        int $nbr
    ): void {
        if ($nbr === 0) {
            return;
        }

        $cards = $this->deck->pickCards($nbr, "deck-{$domain_id}", $player_id);

        $Notify = new NotifManager($this->game);
        $Notify->all(
            "gatherQi",
            clienttranslate('${player_name} gathers ${nbr} ${qi_label} qi'),
            [
                "i18n" => ["qi_label"],
                "cards" => $cards,
                "qi_label" => $this->QI[$domain_id]["label"],
                "nbr" => $nbr,
            ],
            $player_id,
        );
    }

    public function draw(int $player_id, int $nbr): void
    {
        $cards = $this->deck->pickCards($nbr, "deck-0", $player_id);

        $Notify = new NotifManager($this->game);
        $Notify->all(
            "drawQi",
            clienttranslate('${player_name} draws ${nbr} qi from the hidden deck'),
            [
                "nbr" => $nbr,
            ],
            $player_id
        );

        foreach ($cards as $card_id => $card) {
            $domain_id = (int) $card["type_arg"];

            $Notify = new NotifManager($this->game);
            $Notify->player(
                $player_id,
                "gatherQi",
                clienttranslate('You draw a ${qi_label} qi from the hidden deck'),
                [
                    "i18n" => ["qi_label"],
                    "cards" => [$card],
                    "qi_label" => $this->QI[$domain_id]["label"],
                ]
            );
        }
    }
}
