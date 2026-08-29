/**
 * Aetheria Engine - Mega Item, Weapon, Spell & Loot Registry
 * Database of 1,500+ items, magic spells, elemental weapons, armor pieces,
 * and alchemy potions for Aether Dungeon RPG.
 */

const MEGA_ITEM_REGISTRY = {
  weapons: [],
  armor: [],
  spells: [],
  potions: [],
  lootTables: {}
};

(function buildMegaItemRegistry() {
  const weaponTypes = ['Sword', 'Staff', 'Bow', 'Dagger', 'Axe', 'Scythe', 'Wand', 'Mace'];
  const elementTypes = ['Physical', 'Fire', 'Ice', 'Lightning', 'Plasma', 'Void', 'Holy', 'Toxic'];
  const rarityTypes = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Artifact'];

  for (let i = 1; i <= 600; i++) {
    const wType = weaponTypes[i % weaponTypes.length];
    const elem = elementTypes[i % elementTypes.length];
    const rarity = rarityTypes[Math.floor(i / 100) % rarityTypes.length];

    MEGA_ITEM_REGISTRY.weapons.push({
      id: `wpn_${i}`,
      name: `${rarity} ${elem} ${wType} +${i % 10}`,
      type: wType,
      element: elem,
      rarity: rarity,
      damage: 10 + i * 3,
      attackSpeed: 0.8 + (i % 5) * 0.1,
      critChance: 0.05 + (i % 20) * 0.01,
      durability: 100 + i * 2,
      buyPrice: 50 + i * 25,
      sellPrice: 20 + i * 10,
      description: `A powerful ${elem.toLowerCase()} imbued ${wType.toLowerCase()} crafted in sector ${i}.`
    });
  }

  for (let i = 1; i <= 400; i++) {
    const rarity = rarityTypes[Math.floor(i / 60) % rarityTypes.length];

    MEGA_ITEM_REGISTRY.armor.push({
      id: `arm_${i}`,
      name: `${rarity} Cyber Cuirass Grade ${i}`,
      slot: i % 4 === 0 ? 'Helm' : i % 4 === 1 ? 'Chest' : i % 4 === 2 ? 'Legs' : 'Boots',
      armorRating: 5 + i * 2,
      hpBonus: 20 + i * 5,
      manaRegen: 0.5 + (i % 10) * 0.2,
      rarity: rarity,
      buyPrice: 100 + i * 30
    });
  }

  for (let i = 1; i <= 300; i++) {
    const elem = elementTypes[i % elementTypes.length];

    MEGA_ITEM_REGISTRY.spells.push({
      id: `spl_${i}`,
      name: `${elem} Surge Rank ${i}`,
      element: elem,
      manaCost: 10 + (i % 20) * 2,
      damage: 25 + i * 4,
      cooldown: 0.5 + (i % 4) * 0.5,
      radius: 30 + (i % 10) * 5,
      projectileCount: 1 + (i % 3)
    });
  }

  for (let i = 1; i <= 200; i++) {
    MEGA_ITEM_REGISTRY.potions.push({
      id: `pot_${i}`,
      name: i % 2 === 0 ? `Hyper Elixir Level ${i}` : `Mana Catalyst Tier ${i}`,
      effectType: i % 2 === 0 ? 'HEAL' : 'MANA_RESTORE',
      potency: 50 + i * 15,
      duration: i % 4 === 0 ? 10 : 0,
      stackSize: 20
    });
  }
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MEGA_ITEM_REGISTRY;
}
