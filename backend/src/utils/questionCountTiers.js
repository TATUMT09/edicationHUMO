// Fixed choices a student picks from before starting a test — kept as a
// single source of truth here so getTestMeta (which advertises the allowed
// tiers) and getTestToTake (which validates the chosen one) can't drift.
module.exports = [5, 10, 20, 30];
