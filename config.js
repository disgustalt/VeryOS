export default {
  dl: {
    retries: {
      max: 20,
      delay: (r) => { return Math.min(r * 500, 5000) }
    }
  }
};