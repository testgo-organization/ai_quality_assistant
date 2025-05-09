
/**
 * Utility functions for chart components
 */

/**
 * Generates random data for demonstration purposes
 */
export const getRandomData = (count: number, max: number = 100) => {
  return Array.from({ length: count }, (_, i) => ({
    name: `Item ${i + 1}`,
    value: Math.floor(Math.random() * max) + 10,
  }));
};
