/**
 * Aetheria Engine - ECS Component Store Schema Definitions
 * Pre-defined component data structures for Transform, Velocity, Renderable,
 * Health, Collider, AI, Weapon, and Particle components.
 */

const Components = {
  Transform: (x = 0, y = 0, z = 0, rotation = 0, scaleX = 1, scaleY = 1) => ({
    x, y, z, rotation, scaleX, scaleY
  }),

  Velocity: (vx = 0, vy = 0, vz = 0, angularVx = 0) => ({
    vx, vy, vz, angularVx
  }),

  Renderable: (options = {}) => ({
    type: options.type || 'sprite', // 'sprite', 'rect', 'circle', 'mesh', 'particle'
    color: options.color || '#00ffff',
    width: options.width || 32,
    height: options.height || 32,
    radius: options.radius || 16,
    sprite: options.sprite || null,
    visible: options.visible !== undefined ? options.visible : true,
    layer: options.layer || 0
  }),

  Health: (maxHp = 100) => ({
    current: maxHp,
    max: maxHp,
    invulnerable: false,
    invulnerableTimer: 0
  }),

  Collider: (options = {}) => ({
    type: options.type || 'box', // 'box', 'circle', 'polygon'
    width: options.width || 32,
    height: options.height || 32,
    radius: options.radius || 16,
    isTrigger: options.isTrigger || false,
    layer: options.layer || 'default'
  }),

  AIController: (behavior = 'idle') => ({
    behavior, // 'idle', 'patrol', 'chase', 'attack', 'flee'
    targetEntityId: null,
    visionRadius: 200,
    attackRadius: 40,
    stateTimer: 0,
    path: []
  }),

  Weapon: (options = {}) => ({
    name: options.name || 'Plasma Rifle',
    damage: options.damage || 15,
    fireRate: options.fireRate || 0.2,
    cooldown: 0,
    ammo: options.ammo || Infinity,
    projectileSpeed: options.projectileSpeed || 600
  })
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Components;
}
