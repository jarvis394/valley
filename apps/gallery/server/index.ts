import dotenv from '@dotenvx/dotenvx'
import path from 'path'

dotenv.config({ path: path.join('../../.env') })

const isDev = process.argv.length > 2 && process.argv[2] === 'dev'
const cli = isDev
  ? require('next/dist/cli/next-dev').nextDev
  : require('next/dist/cli/next-start').nextStart

cli(
  {
    port: Number(process.env.GALLERY_PORT),
    disableSourceMaps: !isDev,
  },
  'src'
)
