import url from 'url'
import Alea from 'alea'

const qs = url.parse(window.location.href, true).query

const SEED = parseInt(qs.seed) || Math.round(Math.random() * 1000000)

console.info('Seed: %s', SEED)

export default new Alea(SEED)
